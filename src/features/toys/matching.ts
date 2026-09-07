/**
 * M14-03 — Spielzeugfinder.
 *
 * Der Finder benutzt dieselbe Bewertung wie die Pflegeseite und beschränkt
 * sie auf Spielzeugkategorien. Eigene Regeln gibt es nicht — zwei Motoren
 * wären zwei Gelegenheiten, sich zu widersprechen.
 */
import type { ProductAttributes } from '../../domain/schemas/product-attributes.ts';
import { finde, type Bedarf, type Treffer } from '../care/matching.ts';
import { spielzeugTaxonomie } from '../care/taxonomy.ts';

const SPIELZEUG_KATEGORIEN = new Set(
  spielzeugTaxonomie().categories.map((kategorie) => kategorie.categoryId),
);

export function istSpielzeug(produkt: ProductAttributes): boolean {
  return SPIELZEUG_KATEGORIEN.has(produkt.categoryId);
}

export function findeSpielzeug(
  produkte: readonly ProductAttributes[],
  bedarf: Bedarf,
): readonly Treffer[] {
  return finde(produkte.filter(istSpielzeug), bedarf);
}
