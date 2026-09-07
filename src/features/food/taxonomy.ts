/**
 * M15-01 — Futterkategorien.
 *
 * Derselbe Aufbau wie bei Pflege und Spielzeug, damit es nur eine Sorte
 * Kategorie gibt. Wichtig ist auch hier die Gegenliste: Diätfutter,
 * Nahrungsergänzung, Rationsberechnung und Nährwertscores stehen mit
 * Begründung darin.
 */
import food from '../../../content-data/taxonomy/food.json' with { type: 'json' };
import { TaxonomySchema, type Taxonomy } from '../../domain/schemas/taxonomy.ts';

function lade(): Taxonomy {
  const ergebnis = TaxonomySchema.safeParse(food);
  if (!ergebnis.success) {
    throw new Error(`content-data/taxonomy/food.json ist ungültig: ${ergebnis.error.message}`);
  }
  return ergebnis.data;
}

const FUTTER = lade();

export function futterTaxonomie(): Taxonomy {
  return FUTTER;
}
