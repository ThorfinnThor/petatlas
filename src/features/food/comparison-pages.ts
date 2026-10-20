/**
 * Redaktionelle Rahmen der vier Futtervergleiche. Die Daten stehen in
 * `content-data/food/comparison-2026-10.json`, die Bewertung in
 * `comparison.ts`. Hier steht nur, was je Seite eigens geschrieben ist.
 */
import datensatz from '../../../content-data/food/comparison-2026-10.json' with { type: 'json' };
import {
  VergleichsProduktSchema,
  bewerte,
  empfehlungen,
  type Bewertung,
  type Empfehlung,
  type Referenztier,
  type VergleichsProdukt,
} from './comparison.ts';

export interface Frage {
  readonly frage: string;
  readonly antwort: string;
}

export interface FutterVergleichsSeite {
  readonly slug: string;
  readonly species: 'cat' | 'dog';
  readonly format: 'dry' | 'wet';
  readonly referenz: Referenztier;
  /** Zweites Referenztier nur für die Kostenspalte (Hunde: 25 kg). */
  readonly zweiteReferenz?: Referenztier;
  readonly titel: string;
  readonly metaTitel: string;
  readonly beschreibung: string;
  readonly referenzLabel: string;
  readonly einleitung: readonly string[];
  readonly kriterienHinweis: string;
  readonly fragen: readonly Frage[];
}

export const PRODUKTE: readonly VergleichsProdukt[] = (
  datensatz as { products: unknown[] }
).products.map((eintrag) => VergleichsProduktSchema.parse(eintrag));

export const DATENSTAND = (datensatz as { checkedAt: string }).checkedAt;

export function produkteFuer(seite: FutterVergleichsSeite): readonly VergleichsProdukt[] {
  return PRODUKTE.filter((p) => p.species === seite.species && p.format === seite.format);
}

export function auswertung(seite: FutterVergleichsSeite): {
  readonly bewertungen: readonly Bewertung[];
  readonly empfehlungen: readonly Empfehlung[];
} {
  const bewertungen = bewerte(produkteFuer(seite), seite.referenz);
  return { bewertungen, empfehlungen: empfehlungen(bewertungen, seite.referenz) };
}

export { SEITEN as FUTTER_VERGLEICHE } from './comparison-copy.ts';
