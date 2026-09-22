/**
 * M14-03 — Spielzeugfinder.
 *
 * Der Finder benutzt dieselbe Bewertung wie die Pflegeseite und beschränkt
 * sie auf Spielzeugkategorien. Eigene Regeln gibt es nicht — zwei Motoren
 * wären zwei Gelegenheiten, sich zu widersprechen.
 */
import type { ProductAttributes } from '../../domain/schemas/product-attributes.ts';
import { matchbareAttribute } from '../care/attributes.ts';
import { finde, type Bedarf, type Treffer } from '../care/matching.ts';
import { spielzeugTaxonomie } from '../care/taxonomy.ts';

const SPIELZEUG_KATEGORIEN = new Set(
  spielzeugTaxonomie().categories.map((kategorie) => kategorie.categoryId),
);

export function istSpielzeug(produkt: ProductAttributes): boolean {
  return SPIELZEUG_KATEGORIEN.has(produkt.categoryId);
}

export const SPIELARTEN = {
  all: { label: 'Alle Spielarten', categories: [] },
  fetch: { label: 'Werfen & Apportieren', categories: ['fetch-toy'] },
  chew: { label: 'Kauen', categories: ['chew-toy'] },
  puzzle: { label: 'Denken & Snacks', categories: ['puzzle-toy'] },
  chase: {
    label: 'Jagen & Fangen',
    categories: ['chase-toy', 'indoor-cat-toy'],
  },
} as const;

export type Spielart = keyof typeof SPIELARTEN;
export type SpielzeugExtra = 'floats' | 'foodFillable' | 'dishwasherSafe';
export type SpielzeugMaterial = 'all' | 'natural-rubber' | 'zogoflex' | 'plastic' | 'latex';

export interface SpielzeugBedarf extends Bedarf {
  readonly playStyle?: Spielart;
  readonly extras?: readonly SpielzeugExtra[];
  readonly material?: SpielzeugMaterial;
}

const EXTRA_LABEL: Readonly<Record<SpielzeugExtra, string>> = {
  floats: 'Laut Quelle schwimmfähig',
  foodFillable: 'Zum Befüllen mit Futter oder Snacks vorgesehen',
  dishwasherSafe: 'Laut Hersteller spülmaschinengeeignet',
};

const MATERIAL: Readonly<Record<Exclude<SpielzeugMaterial, 'all'>, readonly string[]>> = {
  'natural-rubber': ['naturkautschuk'],
  zogoflex: ['zogoflex'],
  plastic: ['kunststoff', 'melamin', 'silikon'],
  latex: ['latex'],
};

function belegterWert(
  produkt: ProductAttributes,
  attribut: string,
): string | number | boolean | null {
  return (
    matchbareAttribute(produkt).find((eintrag) => eintrag.attribute === attribut)?.value ?? null
  );
}

function passtMaterial(produkt: ProductAttributes, material: SpielzeugMaterial): boolean {
  if (material === 'all') return true;
  const wert = belegterWert(produkt, 'material');
  if (typeof wert !== 'string') return false;
  const normalisiert = wert.toLocaleLowerCase('de-DE');
  return MATERIAL[material].some((begriff) => normalisiert.includes(begriff));
}

function passtSpielart(produkt: ProductAttributes, spielart: Spielart): boolean {
  const kategorien = SPIELARTEN[spielart].categories as readonly string[];
  return kategorien.length === 0 || kategorien.includes(produkt.categoryId);
}

export function findeSpielzeug(
  produkte: readonly ProductAttributes[],
  bedarf: SpielzeugBedarf,
): readonly Treffer[] {
  const spielart = bedarf.playStyle ?? 'all';
  const extras = bedarf.extras ?? [];
  const material = bedarf.material ?? 'all';
  const gefiltert = produkte
    .filter(istSpielzeug)
    .filter((produkt) => passtSpielart(produkt, spielart))
    .filter((produkt) => passtMaterial(produkt, material))
    .filter((produkt) => extras.every((extra) => belegterWert(produkt, extra) === true));

  return finde(gefiltert, bedarf).map((treffer) => {
    const produkt = gefiltert.find((eintrag) => eintrag.productId === treffer.productId);
    if (!produkt) return treffer;
    const filterGruende = [
      ...(spielart === 'all' ? [] : [SPIELARTEN[spielart].label]),
      ...extras.map((extra) => EXTRA_LABEL[extra]),
      ...(material === 'all'
        ? []
        : [`Materialangabe: ${String(belegterWert(produkt, 'material'))}`]),
    ];
    return {
      ...treffer,
      begruendung: [...filterGruende, ...treffer.begruendung],
      punkte: treffer.punkte + filterGruende.length,
    };
  });
}
