/**
 * M15-03 — Futterprodukte suchen und anzeigen.
 *
 * Gesucht wird über Name, Marke und GTIN. Die GTIN-Suche ist zugleich die
 * Barcodeeingabe: eine abgetippte Nummer ist eine vollwertige Eingabe, und
 * eine Kamera ist keine Voraussetzung dafür, ein Produkt zu finden.
 *
 * Die Suche findet, sie bewertet nicht. Reihenfolge: exakte GTIN zuerst,
 * dann Treffer im Namen, dann in der Marke — und innerhalb dessen
 * alphabetisch, damit die Liste reproduzierbar bleibt.
 */
import datensatz from '../../../content-data/food/synthetic-products.json' with { type: 'json' };
import { FoodProductSchema, type FoodProduct } from '../../domain/schemas/food.ts';
import { z } from 'zod';

const DatensatzSchema = z
  .object({
    datasetId: z.string().min(1),
    lastEditedAt: z.string().min(1),
    dataKind: z.enum(['synthetic', 'real']),
    products: z.array(FoodProductSchema.and(z.object({ categoryId: z.string().min(1) }))),
    notes: z.array(z.string()),
  })
  .strict();

export type FutterEintrag = FoodProduct & { readonly categoryId: string };

function lade(): {
  readonly dataKind: 'synthetic' | 'real';
  readonly products: readonly FutterEintrag[];
} {
  const ergebnis = DatensatzSchema.safeParse(datensatz);
  if (!ergebnis.success) {
    throw new Error(
      `content-data/food/synthetic-products.json ist ungültig: ${ergebnis.error.message}`,
    );
  }
  return { dataKind: ergebnis.data.dataKind, products: ergebnis.data.products as FutterEintrag[] };
}

const DATEN = lade();

export function futterDatenArt(): 'synthetic' | 'real' {
  return DATEN.dataKind;
}

export function alleFutter(): readonly FutterEintrag[] {
  return [...DATEN.products].sort((a, b) => (a.foodId < b.foodId ? -1 : 1));
}

export function futterMitId(foodId: string): FutterEintrag | undefined {
  return DATEN.products.find((produkt) => produkt.foodId === foodId);
}

/** Nur Ziffern; so wird aus „4006381333937 “ oder „400-638…“ eine GTIN. */
function nurZiffern(text: string): string {
  return text.replace(/\D/g, '');
}

export interface FutterTreffer {
  readonly produkt: FutterEintrag;
  /** Woran der Treffer hängt — für die Anzeige und für den Test. */
  readonly grund: 'gtin' | 'name' | 'marke';
}

/**
 * Sucht nach Name, Marke oder GTIN.
 *
 * Eine zu kurze Eingabe findet nichts: eine Liste aller Produkte auf zwei
 * Buchstaben hin wäre keine Suche.
 */
export function sucheFutter(begriff: string): readonly FutterTreffer[] {
  const roh = begriff.trim().toLowerCase();
  if (roh.length < 3) return [];

  const ziffern = nurZiffern(roh);
  const treffer: FutterTreffer[] = [];

  for (const produkt of alleFutter()) {
    if (ziffern.length >= 8 && produkt.gtin !== null && produkt.gtin === ziffern) {
      treffer.push({ produkt, grund: 'gtin' });
      continue;
    }
    if (produkt.productName.toLowerCase().includes(roh)) {
      treffer.push({ produkt, grund: 'name' });
      continue;
    }
    if (produkt.brand.toLowerCase().includes(roh)) {
      treffer.push({ produkt, grund: 'marke' });
    }
  }

  const rang = { gtin: 0, name: 1, marke: 2 } as const;
  return treffer.sort(
    (a, b) =>
      rang[a.grund] - rang[b.grund] ||
      a.produkt.productName.localeCompare(b.produkt.productName, 'de-DE') ||
      (a.produkt.foodId < b.produkt.foodId ? -1 : 1),
  );
}

/**
 * Produkte, die als **dieselbe Variante** gelten: gleiche Marke, gleicher
 * Name, gleiche Packungsgröße. Verschiedene Gebindegrößen gehören dazu.
 */
export function gleicheVariante(produkt: FutterEintrag): readonly FutterEintrag[] {
  return alleFutter().filter(
    (anderes) =>
      anderes.brand === produkt.brand &&
      anderes.productName === produkt.productName &&
      anderes.species === produkt.species &&
      anderes.netContentGrams === produkt.netContentGrams,
  );
}
