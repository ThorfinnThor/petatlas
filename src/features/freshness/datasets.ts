/**
 * M17-04 — Was liegt aus, und wie alt ist es?
 *
 * Diese Datei ist die einzige Stelle, an der steht, welche Datensätze die
 * Website ausliefert und welche Frischepolitik für sie gilt. Die Schwellen
 * sind **erklärt, nicht geraten**: sie stehen je Datensatz mit Begründung
 * dabei.
 *
 * Gelesen werden die Snapshots im Repository, nicht die Quellen im Netz.
 * Fehlt eine Datei oder ein Feld, ist der Stand **unbekannt** — nicht
 * „heute“ und nicht „vermutlich in Ordnung“.
 *
 * Zwei Wirkungen werden unterschieden:
 *
 * - `warnt` — ein alter Stand ist ein Hinweis. Die Orte auf der Karte werden
 *   nicht falsch, nur weil länger niemand nachgesehen hat.
 * - `sperrt` — ein alter oder unbekannter Stand verhindert ein positives
 *   Ergebnis. Das gilt dort, wo ein veralteter Stand einen Menschen in die
 *   Irre führen kann: Reiseregeln und Preise.
 */
import { readFileSync } from 'node:fs';

import { bewerte, schlechteste, type Bewertung, type FrischePolitik } from './policy.ts';

export type Wirkung = 'warnt' | 'sperrt';

export interface Datensatz {
  readonly id: string;
  readonly titel: string;
  readonly quelle: string;
  readonly lizenz: string | null;
  readonly politik: FrischePolitik;
  readonly wirkung: Wirkung;
  /** Warum diese Schwellen. Steht in der öffentlichen Ausgabe mit dabei. */
  readonly begruendungPolitik: string;
  readonly stand: string | null;
  /** Was ausgeliefert wird, in Zahlen. */
  readonly umfang: string;
  /** Zusätzliche Erklärung, etwa warum ein Stand fehlt. */
  readonly hinweis: string | null;
  /** `true`, wenn dieser Datensatz bewusst nicht ausgeliefert wird. */
  readonly ausgeliefert: boolean;
}

export interface BewerteterDatensatz extends Datensatz {
  readonly bewertung: Bewertung;
  /** Sperrt dieser Datensatz ein positives Gesamtergebnis? */
  readonly sperrt: boolean;
}

function leseJson(pfad: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readFileSync(pfad, 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function feld(objekt: Record<string, unknown> | null, pfad: readonly string[]): unknown {
  let aktuell: unknown = objekt;
  for (const teil of pfad) {
    if (aktuell === null || typeof aktuell !== 'object') return null;
    aktuell = (aktuell as Record<string, unknown>)[teil];
  }
  return aktuell ?? null;
}

function alsText(wert: unknown): string | null {
  return typeof wert === 'string' && wert.length > 0 ? wert : null;
}

function alsZahl(wert: unknown): number | null {
  return typeof wert === 'number' && Number.isFinite(wert) ? wert : null;
}

/** Die ausgelieferten Datensätze mit ihrem tatsächlichen Stand. */
export function datensaetze(wurzel = '.'): readonly Datensatz[] {
  const got = leseJson(`${wurzel}/data-snapshots/got/got-2022.json`);
  const orte = leseJson(`${wurzel}/data-snapshots/places/places-de.json`);
  const freilauf = leseJson(`${wurzel}/data-snapshots/municipal/berlin-hundefreilauf.json`);
  const auslaufzonen = leseJson(
    `${wurzel}/data-snapshots/municipal/hamburg-hundeauslaufzonen.json`,
  );
  const freigaben = leseJson(`${wurzel}/content-data/travel/approvals.json`);
  const haendler = (['fressnapf', 'zooroyal'] as const).map((schluessel) => ({
    schluessel,
    katalog: leseJson(`${wurzel}/content-data/products/${schluessel}-catalog.json`),
    zuordnung: leseJson(`${wurzel}/content-data/products/${schluessel}-feed.json`),
  }));

  const ersteFreigabe = Array.isArray(feld(freigaben, ['approvals']))
    ? ((feld(freigaben, ['approvals']) as Record<string, unknown>[])[0] ?? null)
    : null;

  return [
    {
      id: 'gebuehren-got',
      titel: 'Gebührenordnung für Tierärzte (GOT 2022)',
      quelle: alsText(feld(got, ['source', 'name'])) ?? 'gesetze-im-internet.de',
      lizenz: alsText(feld(got, ['source', 'legalBasis'])),
      // Die Verordnung ändert sich selten; der Abruf soll trotzdem nicht
      // jahrelang unbemerkt ausbleiben. 90 Tage sind ein Hinweis, 400 Tage
      // heißen: hier hat mehr als ein Jahr niemand nachgesehen.
      politik: { warnAbTagen: 90, sperreAbTagen: 400 },
      begruendungPolitik:
        'Der Verordnungstext ändert sich selten. Gewarnt wird nach 90 Tagen ohne Abruf, als veraltet gilt der Stand nach 400 Tagen.',
      wirkung: 'warnt',
      stand: alsText(feld(got, ['source', 'retrievalDate'])),
      umfang: `${alsZahl(feld(got, ['itemCount'])) ?? 0} Gebührenpositionen, Fassung ${alsText(feld(got, ['source', 'sourceVersion'])) ?? 'unbekannt'}`,
      hinweis:
        'Der Abruf gelingt aus der CI heraus nicht (siehe docs/SOURCE_REVIEWS.md); die Aktualisierung ist bis auf Weiteres ein manueller Lauf.',
      ausgeliefert: true,
    },
    {
      id: 'orte-osm',
      titel: 'Tierärztinnen, Tierärzte und tierbezogene Orte',
      quelle: alsText(feld(orte, ['source', 'name'])) ?? 'OpenStreetMap (Geofabrik)',
      lizenz: alsText(feld(orte, ['source', 'licenseId'])),
      // OSM ändert sich täglich, der Import ist aber ein manueller Lauf über
      // 4,6 GiB. 120 Tage sind ein realistischer Hinweis, 400 Tage sind zu alt.
      politik: { warnAbTagen: 120, sperreAbTagen: 400 },
      begruendungPolitik:
        'OpenStreetMap ändert sich laufend, der bundesweite Import ist ein manueller Lauf. Gewarnt wird nach 120 Tagen, als veraltet gilt der Stand nach 400 Tagen.',
      wirkung: 'warnt',
      stand: alsText(feld(orte, ['source', 'retrievalDate'])),
      umfang: `${alsZahl(feld(orte, ['coverage', 'placeCount'])) ?? 0} Orte in ${alsZahl(feld(orte, ['coverage', 'regionCount'])) ?? 0} Regionen`,
      hinweis:
        alsText(feld(orte, ['source', 'retrievalDate'])) === null
          ? 'Dieser Snapshot entstand, bevor der Import ein Standdatum mitschrieb. Der nächste Lauf trägt es ein; bis dahin bleibt der Stand unbekannt.'
          : null,
      ausgeliefert: true,
    },
    {
      id: 'hundefreilauf-berlin',
      titel: 'Hundefreilaufflächen Berlin',
      quelle: alsText(feld(freilauf, ['source', 'name'])) ?? 'Senatsverwaltung Berlin',
      lizenz: alsText(feld(freilauf, ['source', 'licenseId'])),
      politik: { warnAbTagen: 120, sperreAbTagen: 400 },
      begruendungPolitik:
        'Die kommunale Abgabe ändert sich selten. Gewarnt wird nach 120 Tagen, als veraltet gilt der Stand nach 400 Tagen.',
      wirkung: 'warnt',
      stand: alsText(feld(freilauf, ['source', 'retrievalDate'])),
      umfang: `${alsZahl(feld(freilauf, ['areaCount'])) ?? 0} Flächen`,
      hinweis: null,
      ausgeliefert: true,
    },
    {
      id: 'hundeauslaufzonen-hamburg',
      titel: 'Hundeauslaufzonen Hamburg (§ 8 HundeG)',
      quelle: alsText(feld(auslaufzonen, ['source', 'name'])) ?? 'Bezirksämter Hamburg',
      lizenz: alsText(feld(auslaufzonen, ['source', 'licenseId'])),
      politik: { warnAbTagen: 120, sperreAbTagen: 400 },
      begruendungPolitik:
        'Die kommunale Abgabe ändert sich selten. Gewarnt wird nach 120 Tagen, als veraltet gilt der Stand nach 400 Tagen.',
      wirkung: 'warnt',
      stand: alsText(feld(auslaufzonen, ['source', 'retrievalDate'])),
      umfang: `${alsZahl(feld(auslaufzonen, ['areaCount'])) ?? 0} Flächen`,
      hinweis: null,
      ausgeliefert: true,
    },
    {
      id: 'reiseregeln-eu-intra-2026',
      titel: 'Reiseregeln für Reisen innerhalb der EU',
      quelle: 'Delegierte Verordnung (EU) 2026/131',
      lizenz: null,
      // Eine fachliche Freigabe altert: Rechtslage und nationale Hinweise
      // ändern sich. Nach einem halben Jahr ein Hinweis, nach einem Jahr ist
      // sie nicht mehr die Grundlage für ein grünes Ergebnis.
      politik: { warnAbTagen: 180, sperreAbTagen: 365 },
      begruendungPolitik:
        'Eine fachliche Freigabe altert mit der Rechtslage. Nach 180 Tagen ein Hinweis, nach 365 Tagen zählt sie nicht mehr für ein positives Gesamtergebnis.',
      wirkung: 'sperrt',
      stand: alsText(feld(ersteFreigabe, ['approvedAt'])),
      umfang: ersteFreigabe === null ? 'keine freigegebene Regel' : 'ein freigegebener Regelsatz',
      hinweis:
        ersteFreigabe === null
          ? 'Es liegt keine fachliche Freigabe vor (M12-06). Der Reisecheck gibt deshalb kein positives Gesamtergebnis.'
          : null,
      ausgeliefert: true,
    },
    ...haendler.map(({ schluessel, katalog, zuordnung }): Datensatz => {
      const name = alsText(feld(katalog, ['merchantName'])) ?? schluessel;
      const katalogAnzahl = Array.isArray(feld(katalog, ['products']))
        ? (feld(katalog, ['products']) as unknown[]).length
        : 0;
      const zuordnungAnzahl = Array.isArray(feld(zuordnung, ['products']))
        ? (feld(zuordnung, ['products']) as unknown[]).length
        : 0;
      // Der Sync schreibt einen neuen Stand nur, wenn sich etwas geändert
      // hat. Der jüngere der beiden Stände ist deshalb der letzte belegte
      // Abruf; älter kann der tatsächliche Feed nicht sein.
      const staende = [feld(katalog, ['generatedAt']), feld(zuordnung, ['generatedAt'])]
        .map(alsText)
        .filter((wert): wert is string => wert !== null)
        .sort();
      return {
        id: `haendlerfeed-${schluessel}`,
        titel: `Händlerprodukte ${name}`,
        quelle: `${name}-Produktfeed über Awin`,
        lizenz: 'Awin-Publisher-AGB, Advertiser-Materialien',
        // Abgerufen wird wöchentlich, übernommen per Pull Request. Nach drei
        // Wochen fehlt mindestens ein Lauf; nach 90 Tagen führen Links und
        // Bilder ausgelaufener Artikel zu oft ins Leere.
        politik: { warnAbTagen: 21, sperreAbTagen: 90 },
        begruendungPolitik:
          'Der Feed wird wöchentlich abgerufen und per Pull Request übernommen. Gewarnt wird nach 21 Tagen, als veraltet gilt der Stand nach 90 Tagen, weil Links und Bilder ausgelaufener Artikel dann zu oft ins Leere führen.',
        wirkung: 'warnt',
        stand: staende.at(-1) ?? null,
        umfang: `${katalogAnzahl} Händlerprodukte, ${zuordnungAnzahl} redaktionell ${zuordnungAnzahl === 1 ? 'zugeordnetes Produkt' : 'zugeordnete Produkte'}`,
        hinweis:
          'Übernommen werden Produktname, Marke, Tierart, Händlerkategorie, Produktbild und Link. Preise und Verfügbarkeiten nicht. Als Stand zählt der letzte Abruf, der den Bestand verändert hat.',
        ausgeliefert: katalogAnzahl + zuordnungAnzahl > 0,
      };
    }),
    {
      id: 'angebote',
      titel: 'Preise und Verfügbarkeiten',
      quelle: 'Partnernetzwerk',
      lizenz: null,
      // Ein Feedpreis altert schnell. Die Schwellen sind hier eng, weil eine
      // veraltete Zahl teurer ist als eine fehlende.
      politik: { warnAbTagen: 1, sperreAbTagen: 7 },
      begruendungPolitik:
        'Ein Preis altert schnell. Nach einem Tag ein Hinweis, nach sieben Tagen wird er nicht mehr angezeigt.',
      wirkung: 'sperrt',
      stand: null,
      umfang: 'keine Preise oder Verfügbarkeiten ausgeliefert',
      hinweis:
        'Preise und Verfügbarkeiten werden bewusst nicht übernommen, auch nicht aus den Händlerfeeds oben. Als Werbung gekennzeichnete Amazon- und Awin-Links werden getrennt verwaltet; es entstehen keine Preisangaben oder Angebotsdateien. Das ist der Normalzustand, kein Ausfall.',
      ausgeliefert: false,
    },
  ];
}

export function bewerteDatensaetze(
  stichtag: string,
  eintraege: readonly Datensatz[] = datensaetze(),
): readonly BewerteterDatensatz[] {
  return eintraege.map((eintrag) => {
    const bewertung = bewerte(eintrag.stand, stichtag, eintrag.politik);
    return {
      ...eintrag,
      bewertung,
      // Ein Datensatz, der gar nicht ausgeliefert wird, sperrt nichts. Er
      // fehlt sichtbar, statt still ein rotes Gesamtergebnis zu erzeugen.
      sperrt: eintrag.ausgeliefert && eintrag.wirkung === 'sperrt' && bewertung.blockiert,
    };
  });
}

export interface Gesamtstand {
  readonly frische: ReturnType<typeof schlechteste>;
  readonly gesperrt: readonly string[];
  readonly begruendung: string;
}

/** Der Gesamtstand. Der schlechteste ausgelieferte Datensatz bestimmt ihn. */
export function gesamtstand(bewertet: readonly BewerteterDatensatz[]): Gesamtstand {
  const ausgeliefert = bewertet.filter((eintrag) => eintrag.ausgeliefert);
  const frische = schlechteste(ausgeliefert.map((eintrag) => eintrag.bewertung.frische));
  const gesperrt = bewertet.filter((eintrag) => eintrag.sperrt).map((eintrag) => eintrag.id);
  return {
    frische,
    gesperrt,
    begruendung:
      gesperrt.length === 0
        ? `Schlechtester Einzelstand: ${frische}. Kein Datensatz sperrt ein positives Ergebnis.`
        : `Schlechtester Einzelstand: ${frische}. Gesperrt: ${gesperrt.join(', ')}.`,
  };
}
