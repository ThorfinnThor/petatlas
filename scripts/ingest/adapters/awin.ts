/**
 * M13-01 — Netzwerkadapter für CSV-Produktfeeds (Awin-Format).
 *
 * Der Parser arbeitet **ohne Zugangsdaten**: er bekommt Bytes und gibt
 * Datensätze zurück. Woher die Bytes kommen — Datei, Fixture, Abruf mit
 * Secret — entscheidet der Aufrufer (M13-03).
 *
 * Was hier bewusst nicht passiert:
 *
 * - **Kein Erraten von Spalten.** Fehlt eine Pflichtspalte im Kopf, bricht
 *   der Lauf ab. Ein Feed mit anderem Aufbau ist ein anderer Feed.
 * - **Kein stilles Wegwerfen.** Eine Zeile, die nicht taugt, wird mit Grund
 *   und Zeilennummer abgelehnt und gezählt.
 * - **Keine Gleitkommapreise.** Der Preis wird in ganzzahlige Untereinheiten
 *   umgerechnet, und zwar aus dem Text, nicht über `parseFloat`.
 * - **Keine erfundene Verfügbarkeit.** Was der Feed nicht sagt, bleibt
 *   `unknown` — nicht „auf Lager“.
 */
import { IngestError, type FetchedResource, type ParsedBatch } from '../types.ts';

export const NETWORK_ID = 'awin';
export const PARSER_VERSION = 'awin-csv-parser-1';

/** Spalten, ohne die eine Zeile kein Angebot ist. */
export const PFLICHTSPALTEN: readonly string[] = [
  'aw_product_id',
  'merchant_product_id',
  'product_name',
  'merchant_id',
  'aw_deep_link',
  'search_price',
  'currency',
];

export interface AwinRohzeile {
  readonly zeile: number;
  readonly werte: Readonly<Record<string, string>>;
}

export interface AwinAblehnung {
  readonly zeile: number;
  readonly grund: string;
}

export interface AwinParseErgebnis extends ParsedBatch<AwinRohzeile> {
  readonly kopf: readonly string[];
  readonly abgelehnt: readonly AwinAblehnung[];
  readonly gelesen: number;
}

/**
 * CSV nach RFC 4180: Anführungszeichen schützen Trennzeichen und
 * Zeilenumbrüche, doppelte Anführungszeichen stehen für eines im Wert.
 *
 * Bewusst zeichenweise statt mit einem regulären Ausdruck: ein Feld mit
 * eingebettetem Zeilenumbruch ist der Fall, an dem zeilenweise Parser
 * scheitern — und der in echten Produktfeeds ständig vorkommt.
 */
export function parseCsv(text: string, trenner = ','): readonly (readonly string[])[] {
  const zeilen: string[][] = [];
  let feld = '';
  let aktuelle: string[] = [];
  let inAnfuehrung = false;

  for (let i = 0; i < text.length; i += 1) {
    const zeichen = text[i] as string;

    if (inAnfuehrung) {
      if (zeichen === '"') {
        if (text[i + 1] === '"') {
          feld += '"';
          i += 1;
        } else {
          inAnfuehrung = false;
        }
      } else {
        feld += zeichen;
      }
      continue;
    }

    if (zeichen === '"') {
      inAnfuehrung = true;
    } else if (zeichen === trenner) {
      aktuelle.push(feld);
      feld = '';
    } else if (zeichen === '\n' || zeichen === '\r') {
      // CRLF zählt als ein Zeilenende.
      if (zeichen === '\r' && text[i + 1] === '\n') i += 1;
      aktuelle.push(feld);
      zeilen.push(aktuelle);
      aktuelle = [];
      feld = '';
    } else {
      feld += zeichen;
    }
  }

  if (inAnfuehrung) {
    throw new IngestError(NETWORK_ID, 'parse', 'CSV endet in einem offenen Anführungszeichen.');
  }
  if (feld !== '' || aktuelle.length > 0) {
    aktuelle.push(feld);
    zeilen.push(aktuelle);
  }
  return zeilen;
}

/**
 * Dekodiert die Bytes. UTF-8 mit BOM wird erkannt; alles andere wird als
 * UTF-8 gelesen und bei ungültigen Bytes abgelehnt statt stillschweigend
 * durch Ersatzzeichen verunstaltet.
 */
export function dekodiere(body: Uint8Array): string {
  const ohneBom =
    body.length >= 3 && body[0] === 0xef && body[1] === 0xbb && body[2] === 0xbf
      ? body.subarray(3)
      : body;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(ohneBom);
  } catch (cause) {
    throw new IngestError(
      NETWORK_ID,
      'parse',
      'Feed ist nicht UTF-8. Ein falsch dekodierter Produktname ist schlimmer als ein Abbruch.',
      { cause },
    );
  }
}

/** Preis aus dem Text in ganzzahlige Untereinheiten. Kein `parseFloat`. */
export function preisInMinor(text: string): number | null {
  const roh = text.trim();
  // Erlaubt: 12, 12.34, 12,34 — nicht: leer, negativ, Text, drei Nachkommastellen.
  const treffer = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(roh);
  if (treffer === null) return null;
  const ganz = Number(treffer[1]);
  const nachkomma = (treffer[2] ?? '').padEnd(2, '0');
  return ganz * 100 + Number(nachkomma);
}

export function parseAwinCsv(resource: FetchedResource, trenner = ','): AwinParseErgebnis {
  const text = dekodiere(resource.body);
  const zeilen = parseCsv(text, trenner);
  if (zeilen.length === 0) {
    throw new IngestError(NETWORK_ID, 'parse', 'Feed ist leer.');
  }

  const kopf = (zeilen[0] as readonly string[]).map((spalte) => spalte.trim().toLowerCase());
  const fehlend = PFLICHTSPALTEN.filter((spalte) => !kopf.includes(spalte));
  if (fehlend.length > 0) {
    throw new IngestError(
      NETWORK_ID,
      'parse',
      `Feed fehlen Pflichtspalten: ${fehlend.join(', ')}. Ein anderer Aufbau ist ein anderer Feed.`,
    );
  }

  const records: AwinRohzeile[] = [];
  const abgelehnt: AwinAblehnung[] = [];

  for (let i = 1; i < zeilen.length; i += 1) {
    const zeile = zeilen[i] as readonly string[];
    // Eine leere Schlusszeile ist kein Datensatz und kein Fehler.
    if (zeile.length === 1 && zeile[0]?.trim() === '') continue;

    if (zeile.length !== kopf.length) {
      abgelehnt.push({
        zeile: i + 1,
        grund: `${zeile.length} Felder statt ${kopf.length}.`,
      });
      continue;
    }

    const werte: Record<string, string> = {};
    kopf.forEach((spalte, index) => {
      werte[spalte] = (zeile[index] ?? '').trim();
    });

    const leerePflicht = PFLICHTSPALTEN.filter((spalte) => werte[spalte] === '');
    if (leerePflicht.length > 0) {
      abgelehnt.push({ zeile: i + 1, grund: `Leere Pflichtfelder: ${leerePflicht.join(', ')}.` });
      continue;
    }
    if (preisInMinor(werte.search_price as string) === null) {
      abgelehnt.push({
        zeile: i + 1,
        grund: `Preis "${werte.search_price}" ist nicht eindeutig lesbar.`,
      });
      continue;
    }

    records.push({ zeile: i + 1, werte });
  }

  return {
    sourceId: resource.sourceId,
    records,
    sourceVersion: null,
    kopf,
    abgelehnt,
    gelesen: zeilen.length - 1,
  };
}
