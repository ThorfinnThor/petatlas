/**
 * M08-01 — Importer für den Gebührenkatalog der GOT.
 *
 * Bezugsweg ist nach ADR-018 ausschließlich der offiziell angebotene
 * XML-ZIP-Download. Es wird nicht gecrawlt und nichts gespiegelt.
 *
 * Der Parser hält sich streng an die Quelle:
 *
 * - Die **laufende Nummer** der Verordnung ist die Positions-ID. Es wird
 *   keine eigene ID erfunden.
 * - Die **Bezeichnung** wird unverändert übernommen, einschließlich ihrer
 *   Klammerzusätze. Sie wird nicht gekürzt und nicht umformuliert.
 * - Der **Betrag** wird aus der Euro-Spalte in Cent umgerechnet. Ein Wert,
 *   der sich nicht eindeutig lesen lässt, führt zu einem Fehler, nicht zu
 *   einer Schätzung.
 * - Die **Tierart** steht in der GOT nicht in einer eigenen Spalte, sondern
 *   im Bezeichnungstext. Erkannt wird sie nur an einer kurzen, ausdrücklich
 *   gelisteten Wortliste; sonst bleibt sie `null`. Es wird nichts geraten.
 * - Der **Abschnitt** (Teil A/B/C und Zwischenüberschrift) wird mitgeführt,
 *   damit eine Position im Kontext nachvollziehbar bleibt.
 *
 * Ein Parserfehler bleibt sichtbar: er wird gezählt, benannt und führt bei
 * Überschreiten einer Schwelle zum Abbruch. Stille Heuristiken, die falsche
 * Gebühren erzeugen könnten, gibt es nicht (ADR-018).
 */
import { XMLParser } from 'fast-xml-parser';
import { unzipSync } from 'fflate';

import type { FeeItem, Species } from '../../../src/domain/schemas/index.ts';
import { FeeItemSchema } from '../../../src/domain/schemas/costs.ts';
import { requireSource } from '../../../src/domain/source-registry.ts';
import { IngestError, type FetchedResource } from '../types.ts';

const SOURCE_ID = 'got-2022-gesetze-im-internet';
export const PARSER_VERSION = 'got-parser-1';

/**
 * Ausdrückliche Wortliste. Nur diese Wörter im Bezeichnungstext gelten als
 * Tierartangabe der Quelle. Alles andere bleibt `null`.
 */
const TIERART_WOERTER: readonly { readonly wort: RegExp; readonly art: Species }[] = [
  { wort: /\bHund(e|es|en)?\b/i, art: 'dog' },
  { wort: /\bKatze(n)?\b/i, art: 'cat' },
];

export interface GotRawRow {
  readonly laufendeNummer: string;
  readonly bezeichnung: string;
  readonly euroText: string;
  readonly teil: string | null;
  readonly abschnitt: string | null;
}

export interface GotParseResult {
  readonly rows: readonly GotRawRow[];
  /** `jurabk`-Kurzbezeichnung, z. B. „GOT 2022“. */
  readonly katalogVersion: string;
  /** Änderungsstand aus der Standangabe, soweit vorhanden. */
  readonly standKommentar: string | null;
  /** Ausfertigungsdatum der Verordnung. */
  readonly ausfertigungsDatum: string | null;
  /** Zeilen, die wie Positionen aussahen, aber nicht lesbar waren. */
  readonly unlesbar: readonly { readonly zeile: number; readonly grund: string }[];
}

/** Vereinheitlicht Leerraum, auch geschützte Leerzeichen aus der Quelle. */
function normalisiereLeerraum(wert: string): string {
  return wert.replace(/[\s\u00a0]+/g, ' ').trim();
}

function text(knoten: unknown): string {
  if (knoten === null || knoten === undefined) return '';
  if (typeof knoten === 'string') return knoten;
  if (typeof knoten === 'number') return String(knoten);
  if (Array.isArray(knoten)) return knoten.map(text).join('');
  if (typeof knoten === 'object') {
    return Object.entries(knoten as Record<string, unknown>)
      .filter(([schluessel]) => !schluessel.startsWith('@_'))
      .map(([, wert]) => text(wert))
      .join('');
  }
  return '';
}

function alsListe<T>(wert: T | T[] | undefined): T[] {
  if (wert === undefined) return [];
  return Array.isArray(wert) ? wert : [wert];
}

/** Entpackt das ZIP und gibt die enthaltene XML-Datei zurück. */
export function extrahiereXml(archiv: Uint8Array): { name: string; inhalt: string } {
  let dateien: Record<string, Uint8Array>;
  try {
    dateien = unzipSync(archiv);
  } catch (cause) {
    throw new IngestError(SOURCE_ID, 'parse', 'Archiv lässt sich nicht entpacken.', { cause });
  }

  const xmlDateien = Object.keys(dateien).filter((name) => name.toLowerCase().endsWith('.xml'));
  if (xmlDateien.length !== 1) {
    throw new IngestError(
      SOURCE_ID,
      'parse',
      `Erwartet wird genau eine XML-Datei im Archiv, gefunden: ${xmlDateien.length}.`,
    );
  }
  const name = xmlDateien[0] as string;
  return { name, inhalt: new TextDecoder('utf-8').decode(dateien[name] as Uint8Array) };
}

/** Liest die Gebührentabelle aus der amtlichen XML-Fassung. */
export function parseGotXml(xml: string): GotParseResult {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    // Zahlen bleiben Text: „11,26“ ist kein JavaScript-Zahlenliteral, und
    // eine automatische Umwandlung wäre genau die stille Heuristik, die hier
    // nichts zu suchen hat.
    parseTagValue: false,
    parseAttributeValue: false,
    // Nicht trimmen: die Quelle setzt Leerzeichen nach <BR/>, und ein Trim
    // würde Wörter zusammenkleben („Untersuchung(auch schriftlich“).
    trimValues: false,
  });

  let baum: Record<string, unknown>;
  try {
    baum = parser.parse(xml) as Record<string, unknown>;
  } catch (cause) {
    throw new IngestError(SOURCE_ID, 'parse', 'XML lässt sich nicht lesen.', { cause });
  }

  const dokumente = baum.dokumente as Record<string, unknown> | undefined;
  const normen = alsListe<Record<string, unknown>>(
    dokumente?.norm as Record<string, unknown> | Record<string, unknown>[] | undefined,
  );
  if (normen.length === 0) {
    throw new IngestError(SOURCE_ID, 'parse', 'Keine <norm>-Elemente gefunden.');
  }

  const kopfMetadaten = (normen[0]?.metadaten ?? {}) as Record<string, unknown>;
  const katalogVersion = normalisiereLeerraum(text(kopfMetadaten.jurabk));
  if (katalogVersion === '') {
    throw new IngestError(SOURCE_ID, 'parse', 'Katalogversion (jurabk) fehlt.');
  }
  const ausfertigungsDatum =
    normalisiereLeerraum(text(kopfMetadaten['ausfertigung-datum'])) || null;
  const standAngaben = alsListe<Record<string, unknown>>(
    kopfMetadaten.standangabe as Record<string, unknown> | Record<string, unknown>[] | undefined,
  );
  const standKommentar =
    standAngaben
      .map((angabe) => normalisiereLeerraum(text(angabe.standkommentar)))
      .find((eintrag) => eintrag !== '') ?? null;

  // Die Gebührenliste steht in der Anlage, in der Tabelle mit den meisten
  // Zeilen. Die drei kleinen Tabellen davor sind Inhaltsverzeichnisse.
  const anlage = normen.find(
    (norm) =>
      normalisiereLeerraum(text((norm.metadaten as Record<string, unknown>)?.enbez)) === 'Anlage',
  );
  if (!anlage) {
    throw new IngestError(SOURCE_ID, 'parse', 'Anlage mit dem Gebührenverzeichnis fehlt.');
  }

  const tabellen = sammleTabellen(anlage);
  if (tabellen.length === 0) {
    throw new IngestError(SOURCE_ID, 'parse', 'Keine Tabelle in der Anlage gefunden.');
  }
  const gebuehrenTabelle = tabellen.reduce((groesste, kandidat) =>
    zeilenVon(kandidat).length > zeilenVon(groesste).length ? kandidat : groesste,
  );

  const rows: GotRawRow[] = [];
  const unlesbar: { zeile: number; grund: string }[] = [];
  let teil: string | null = null;
  let abschnitt: string | null = null;

  zeilenVon(gebuehrenTabelle).forEach((zeile, index) => {
    const zellen = alsListe(zeile.entry as unknown).map((eintrag) =>
      normalisiereLeerraum(text(eintrag)),
    );
    if (zellen.length < 3) return;

    const [nummer, bezeichnung, euroText] = zellen as [string, string, string];

    // Überschriftenzeile der Tabelle.
    if (nummer === 'Laufende Nummer') return;

    // Abschnittszeile: keine Nummer, kein Betrag, aber Text.
    if (nummer === '' && euroText === '' && bezeichnung !== '') {
      if (/^Teil\s+[A-Z]$/i.test(bezeichnung)) {
        teil = bezeichnung;
        abschnitt = null;
      } else if (bezeichnung.length <= 120) {
        // Lange Absätze sind Erläuterungen der Verordnung, keine Überschrift.
        abschnitt = bezeichnung;
      }
      return;
    }

    if (nummer === '' || bezeichnung === '') return;

    if (!/^\d+[a-z]?$/.test(nummer)) {
      unlesbar.push({ zeile: index, grund: `Laufende Nummer "${nummer}" ist unerwartet.` });
      return;
    }
    if (euroText === '') {
      unlesbar.push({ zeile: index, grund: `Position ${nummer} hat keinen Betrag.` });
      return;
    }

    rows.push({ laufendeNummer: nummer, bezeichnung, euroText, teil, abschnitt });
  });

  if (rows.length === 0) {
    throw new IngestError(SOURCE_ID, 'parse', 'Keine einzige Gebührenposition gelesen.');
  }

  return { rows, katalogVersion, standKommentar, ausfertigungsDatum, unlesbar };
}

function sammleTabellen(
  knoten: unknown,
  gefunden: Record<string, unknown>[] = [],
): Record<string, unknown>[] {
  if (Array.isArray(knoten)) {
    for (const eintrag of knoten) sammleTabellen(eintrag, gefunden);
    return gefunden;
  }
  if (knoten !== null && typeof knoten === 'object') {
    for (const [schluessel, wert] of Object.entries(knoten as Record<string, unknown>)) {
      if (schluessel === 'table') {
        for (const tabelle of alsListe<Record<string, unknown>>(
          wert as Record<string, unknown> | Record<string, unknown>[] | undefined,
        )) {
          gefunden.push(tabelle);
        }
      }
      sammleTabellen(wert, gefunden);
    }
  }
  return gefunden;
}

function zeilenVon(tabelle: Record<string, unknown>): Record<string, unknown>[] {
  const zeilen: Record<string, unknown>[] = [];
  const suche = (knoten: unknown): void => {
    if (Array.isArray(knoten)) {
      for (const eintrag of knoten) suche(eintrag);
      return;
    }
    if (knoten !== null && typeof knoten === 'object') {
      for (const [schluessel, wert] of Object.entries(knoten as Record<string, unknown>)) {
        if (schluessel === 'row') {
          for (const zeile of alsListe<Record<string, unknown>>(
            wert as Record<string, unknown> | Record<string, unknown>[] | undefined,
          )) {
            zeilen.push(zeile);
          }
        } else {
          suche(wert);
        }
      }
    }
  };
  suche(tabelle);
  return zeilen;
}

/** „11,26“ → 1126 Cent. Andere Formen führen zu einem Fehler. */
export function euroTextZuCent(euroText: string): number {
  const bereinigt = euroText.replace(/\s|\u00a0/g, '');
  const treffer = /^(\d{1,6}),(\d{2})$/.exec(bereinigt);
  if (!treffer) {
    throw new IngestError(SOURCE_ID, 'parse', `Betrag "${euroText}" ist nicht lesbar.`);
  }
  return Number(treffer[1]) * 100 + Number(treffer[2]);
}

/** Tierart nur aus der ausdrücklichen Wortliste, sonst null. */
export function tierartAus(bezeichnung: string): Species | null {
  const treffer = TIERART_WOERTER.filter(({ wort }) => wort.test(bezeichnung));
  // Nennt eine Position mehrere Tierarten, ist keine eindeutig gemeint.
  if (treffer.length !== 1) return null;
  return treffer[0]?.art ?? null;
}

export interface GotNormalizeOptions {
  readonly resource: FetchedResource;
  /** Anteil unlesbarer Zeilen, ab dem der Import abbricht. */
  readonly maxUnlesbarAnteil?: number;
}

export interface GotNormalizeResult {
  readonly items: readonly FeeItem[];
  readonly katalogVersion: string;
  readonly parserVersion: string;
  /** SHA-256 der abgerufenen Originaldatei, für die Provenienz (ADR-018). */
  readonly sourceContentHash: string;
  readonly retrievedAt: string;
  readonly abgelehnt: readonly { readonly laufendeNummer: string; readonly grund: string }[];
}

export function normalizeGot(
  geparst: GotParseResult,
  options: GotNormalizeOptions,
): GotNormalizeResult {
  const quelle = requireSource(SOURCE_ID);
  const maxAnteil = options.maxUnlesbarAnteil ?? 0.02;

  const gesamt = geparst.rows.length + geparst.unlesbar.length;
  if (gesamt > 0 && geparst.unlesbar.length / gesamt > maxAnteil) {
    throw new IngestError(
      SOURCE_ID,
      'parse',
      `${geparst.unlesbar.length} von ${gesamt} Zeilen sind unlesbar. Struktur der Quelle hat sich vermutlich geändert; Import abgebrochen.`,
    );
  }

  const items: FeeItem[] = [];
  const abgelehnt: { laufendeNummer: string; grund: string }[] = [];

  for (const zeile of geparst.rows) {
    let betrag: number;
    try {
      betrag = euroTextZuCent(zeile.euroText);
    } catch (fehler) {
      abgelehnt.push({ laufendeNummer: zeile.laufendeNummer, grund: (fehler as Error).message });
      continue;
    }

    const fundstelle = [zeile.teil, zeile.abschnitt, `lfd. Nr. ${zeile.laufendeNummer}`]
      .filter((teil): teil is string => teil !== null)
      .join(' · ');

    const kandidat = {
      officialItemId: zeile.laufendeNummer,
      catalogVersion: geparst.katalogVersion,
      originalLabel: zeile.bezeichnung,
      species: tierartAus(zeile.bezeichnung),
      baseUnit: 'Einzelleistung',
      baseAmountMinor: betrag,
      currency: 'EUR',
      sourceReference: `${quelle.attributionText ?? quelle.resourceName} · ${fundstelle}`,
      validity: { from: geparst.ausfertigungsDatum ?? '2022-08-15', until: null },
    };

    const ergebnis = FeeItemSchema.safeParse(kandidat);
    if (ergebnis.success) items.push(ergebnis.data);
    else
      abgelehnt.push({
        laufendeNummer: zeile.laufendeNummer,
        grund: ergebnis.error.issues[0]?.message ?? 'ungültig',
      });
  }

  return {
    items,
    katalogVersion: geparst.katalogVersion,
    parserVersion: PARSER_VERSION,
    sourceContentHash: options.resource.contentHash,
    retrievedAt: options.resource.retrievedAt,
    abgelehnt,
  };
}
