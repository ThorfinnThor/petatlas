/**
 * M15-05 — Adapter für den Open-Pet-Food-Facts-Export.
 *
 * Gebaut, aber **abgeschaltet**. Die Messung in `docs/OPFF_SPIKE.md` hat
 * ergeben: Nährwerte fehlen fast vollständig (zwei von 1.281 Produkten mit
 * Deutschlandbezug), und Name, Marke und Menge stehen ohnehin im
 * Händlerfeed. Ein zweiter Datenstrom mit eigener Fehlerlage und
 * ODbL-Share-Alike lohnt dafür nicht.
 *
 * Der Adapter bleibt trotzdem im Baum, weil die Frage wiederkommt, sobald es
 * ein echtes Sortiment gibt — dann ist die Stichprobe nachzuholen, nicht der
 * Parser neu zu schreiben.
 *
 * Drei Grenzen sind fest eingebaut:
 *
 * 1. **Nur der Export, nie die API.** `robots.txt` verbietet `/api` und
 *    `/cgi`; bezogen wird ausschließlich die Datei unter `/data`.
 * 2. **Keine Bilder.** Sie stehen unter CC BY-SA und können Rechte Dritter
 *    enthalten. `image_url` wird nicht übernommen.
 * 3. **Ausdrückliche Projektion.** Übernommen werden Code, Name, Marke und
 *    Menge — mehr nicht, auch nicht „für später“.
 */
import { requireSource } from '../../../src/domain/source-registry.ts';
import { mayPublishAs } from '../../../src/domain/publication-policy.ts';
import { IngestError, type FetchedResource, type ParsedBatch } from '../types.ts';
import { dekodiere, parseCsv } from './awin.ts';

export const SOURCE_ID = 'opff-products-csv-export';
export const PARSER_VERSION = 'opff-csv-parser-1';

/** Der Export ist tabulatorgetrennt, obwohl die Datei auf `.csv` endet. */
export const TRENNER = '\t';

/** Spalten, die übernommen werden. Alles andere bleibt liegen. */
export const UEBERNOMMENE_SPALTEN: readonly string[] = [
  'code',
  'product_name',
  'brands',
  'quantity',
];

export interface OpffEintrag {
  /** Barcode, wie er im Export steht. */
  readonly code: string;
  readonly productName: string | null;
  readonly brand: string | null;
  /** Mengenangabe als Freitext, etwa „400 g“. Nicht umgerechnet. */
  readonly quantityText: string | null;
}

export interface OpffParseErgebnis extends ParsedBatch<OpffEintrag> {
  readonly gelesen: number;
  readonly ohneCode: number;
}

function text(wert: string | undefined): string | null {
  const roh = (wert ?? '').trim();
  return roh === '' ? null : roh;
}

/**
 * Liest den Export. Es wird nichts geraten und nichts umgerechnet: die
 * Mengenangabe bleibt der Text, der dort steht.
 */
export function parseOpffExport(resource: FetchedResource): OpffParseErgebnis {
  const zeilen = parseCsv(dekodiere(resource.body), TRENNER);
  if (zeilen.length === 0) {
    throw new IngestError(SOURCE_ID, 'parse', 'Export ist leer.');
  }

  const kopf = (zeilen[0] as readonly string[]).map((spalte) => spalte.trim().toLowerCase());
  for (const spalte of UEBERNOMMENE_SPALTEN) {
    if (!kopf.includes(spalte)) {
      throw new IngestError(SOURCE_ID, 'parse', `Export fehlt die Spalte "${spalte}".`);
    }
  }
  const index = (spalte: string): number => kopf.indexOf(spalte);

  const records: OpffEintrag[] = [];
  let ohneCode = 0;

  for (let i = 1; i < zeilen.length; i += 1) {
    const zeile = zeilen[i] as readonly string[];
    if (zeile.length === 1 && (zeile[0] ?? '').trim() === '') continue;
    const code = text(zeile[index('code')]);
    if (code === null) {
      ohneCode += 1;
      continue;
    }
    records.push({
      code,
      productName: text(zeile[index('product_name')]),
      brand: text(zeile[index('brands')]),
      quantityText: text(zeile[index('quantity')]),
    });
  }

  return {
    sourceId: SOURCE_ID,
    records,
    sourceVersion: null,
    gelesen: zeilen.length - 1,
    ohneCode,
  };
}

export interface OpffFreigabe {
  readonly erlaubt: boolean;
  readonly grund: string;
}

/**
 * Darf aus diesem Datensatz überhaupt etwas ausgeliefert werden?
 *
 * Der Registryeintrag steht auf `pending`; damit lautet die Antwort nein —
 * unabhängig davon, ob ein Feature Flag gesetzt ist. Erst kommt das Recht,
 * dann der Schalter.
 */
export function opffAusliefernErlaubt(): OpffFreigabe {
  const quelle = requireSource(SOURCE_ID);
  const entscheidung = mayPublishAs('public_open', quelle.rights, 'publicJsonDelivery');
  return { erlaubt: entscheidung.allowed, grund: entscheidung.reason };
}

/**
 * Öffentliche Projektion eines Eintrags: vier Felder, kein Bild.
 *
 * Die Attribution gehört zum Datensatz und wird mit ihm geführt, nicht
 * daneben gelegt.
 */
export function oeffentlicheProjektion(eintrag: OpffEintrag): Record<string, string | null> {
  const quelle = requireSource(SOURCE_ID);
  return {
    code: eintrag.code,
    productName: eintrag.productName,
    brand: eintrag.brand,
    quantityText: eintrag.quantityText,
    licenseId: quelle.rights.licenseId,
    attribution: quelle.attributionText ?? null,
  };
}
