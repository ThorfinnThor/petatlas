/**
 * M14-01 — Zugang zu den Kategorien für Pflege und Spielzeug.
 *
 * Beide Taxonomien werden hier einmal geprüft. Wichtiger als die Kategorien
 * ist die Gegenliste: `ausgeschlossen()` nennt, was ausdrücklich nicht
 * geführt wird — Arzneimittel, Supplemente, Tests, wirkstoffhaltige Mittel.
 */
import care from '../../../content-data/taxonomy/care.json' with { type: 'json' };
import toys from '../../../content-data/taxonomy/toys.json' with { type: 'json' };
import {
  TaxonomySchema,
  type Taxonomy,
  type TaxonomyCategory,
  type TaxonomyExclusion,
} from '../../domain/schemas/taxonomy.ts';

function lade(roh: unknown, quelle: string): Taxonomy {
  const ergebnis = TaxonomySchema.safeParse(roh);
  if (!ergebnis.success) {
    throw new Error(`${quelle} ist ungültig: ${ergebnis.error.message}`);
  }
  return ergebnis.data;
}

const PFLEGE = lade(care, 'content-data/taxonomy/care.json');
const SPIELZEUG = lade(toys, 'content-data/taxonomy/toys.json');

export function pflegeTaxonomie(): Taxonomy {
  return PFLEGE;
}

export function spielzeugTaxonomie(): Taxonomy {
  return SPIELZEUG;
}

export function alleKategorien(): readonly TaxonomyCategory[] {
  return [...PFLEGE.categories, ...SPIELZEUG.categories];
}

/** Alles, was ausdrücklich nicht geführt wird — mit Begründung. */
export function ausgeschlossen(): readonly TaxonomyExclusion[] {
  return [...PFLEGE.excluded, ...SPIELZEUG.excluded];
}

export function kategorie(categoryId: string): TaxonomyCategory | undefined {
  return alleKategorien().find((eintrag) => eintrag.categoryId === categoryId);
}

/**
 * Darf ein Attribut für das Matching dieser Kategorie verwendet werden?
 *
 * Die Frage klingt kleinlich und ist der Kern: ein Attribut, das die
 * Kategorie nicht nennt, darf kein Produkt „passend“ machen.
 */
export function attributErlaubt(categoryId: string, attribut: string): boolean {
  return kategorie(categoryId)?.matchAttributes.includes(attribut) ?? false;
}
