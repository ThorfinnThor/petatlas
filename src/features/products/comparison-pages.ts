/**
 * Die neun Produktvergleiche. Daten: `content-data/products/comparison-2026-10.json`
 * (jede Angabe mit Quelle und wörtlichem Beleg), Bewertung: `comparison.ts`,
 * redaktionelle Rahmen je Seite: `comparison-copy.ts`.
 */
import datensatz from '../../../content-data/products/comparison-2026-10.json' with { type: 'json' };
import {
  ProduktSchema,
  bewerte,
  empfehlungen,
  type Bewertung,
  type Einsatz,
  type Empfehlung,
  type Kategorie,
  type Kriterium,
  type Produkt,
  type Wert,
} from './comparison.ts';

export interface Merkmal {
  readonly key: string;
  readonly label: string;
  readonly einheit?: string;
  /** Eigene Darstellung, sonst Zahl mit Einheit, ja/nein oder Text. */
  readonly zeige?: (produkt: Produkt) => string | null;
}

export interface Frage {
  readonly frage: string;
  readonly antwort: string;
}

export interface ProduktVergleichsSeite {
  readonly slug: string;
  readonly kategorie: Kategorie;
  readonly tier: 'cat' | 'dog';
  readonly eyebrow: string;
  readonly titel: string;
  readonly metaTitel: string;
  readonly beschreibung: string;
  /** Die Suchfrage, die die Seite beantwortet. */
  readonly frage: string;
  readonly einleitung: readonly string[];
  readonly kriterien: readonly Kriterium[];
  readonly einsaetze: readonly Einsatz[];
  readonly merkmale: readonly Merkmal[];
  /** Merkmale (Schlüssel), die in der Vergleichstabelle stehen. */
  readonly tabelle: readonly string[];
  /** Vorbehalte und Messhinweise, einmal und am passenden Ort. */
  readonly hinweise: readonly string[];
  readonly fragen: readonly Frage[];
  readonly verwandt: readonly { readonly href: string; readonly label: string }[];
}

export const PRODUKTE: readonly Produkt[] = (datensatz as { products: unknown[] }).products.map(
  (eintrag) => ProduktSchema.parse(eintrag),
);

export const DATENSTAND = (datensatz as { checkedAt: string }).checkedAt;

export function produkteFuer(seite: ProduktVergleichsSeite): readonly Produkt[] {
  return PRODUKTE.filter((p) => p.category === seite.kategorie);
}

export function auswertung(seite: ProduktVergleichsSeite): {
  readonly bewertungen: readonly Bewertung[];
  readonly empfehlungen: readonly Empfehlung[];
} {
  const bewertungen = bewerte(produkteFuer(seite), seite.kriterien);
  return { bewertungen, empfehlungen: empfehlungen(bewertungen, seite.einsaetze) };
}

export function zeigeWert(merkmal: Merkmal, produkt: Produkt): string {
  if (merkmal.zeige) return merkmal.zeige(produkt) ?? 'keine Angabe';
  const w: Wert = produkt.specs[merkmal.key]?.value ?? null;
  if (w === null) return 'keine Angabe';
  if (typeof w === 'boolean') return w ? 'ja' : 'nein';
  if (typeof w === 'number') {
    const zahl = String(w).replace('.', ',');
    return merkmal.einheit ? `${zahl} ${merkmal.einheit}` : zahl;
  }
  return w;
}

export function produktName(produkt: Produkt): string {
  return `${produkt.brand} ${produkt.model}`;
}

export { SEITEN as PRODUKT_VERGLEICHE, ALTE_SLUGS } from './comparison-copy.ts';
