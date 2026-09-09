/**
 * M14-02 — Zugang zu den geprüften Produkteigenschaften.
 *
 * Die Daten werden beim Laden validiert und zusätzlich gegen die Taxonomie
 * geprüft: ein Attribut, das die Kategorie nicht kennt, ist kein
 * Matchingattribut — es darf mitgeführt und angezeigt werden, aber es
 * entscheidet nichts.
 */
import review from '../../../content-data/attributes/real-review.json' with { type: 'json' };
import identities from '../../../content-data/products/editorial.json' with { type: 'json' };
import { darfMatchen } from '../../domain/attribute-rules.ts';
import type {
  AttributeReview,
  ProductAttribute,
  ProductAttributes,
} from '../../domain/schemas/product-attributes.ts';
import { attributErlaubt, kategorie } from './taxonomy.ts';

/**
 * M22-02: Die Datei liegt im Repository und ist zur Bauzeit unveränderlich.
 * Geprüft wird sie dort — `npm run check:content` hält sie gegen
 * `AttributeReviewSchema` und prüft zusätzlich, dass jedes Produkt eine
 * Kategorie nennt, die es gibt.
 */
const PRUEFUNG = review as unknown as AttributeReview;

export function attributPruefung(): AttributeReview {
  return PRUEFUNG;
}

export function attributeFuer(productId: string): ProductAttributes | undefined {
  return PRUEFUNG.products.find((produkt) => produkt.productId === productId);
}

/**
 * Die Attribute, die beim Matching zählen dürfen: belegt, mit bekanntem Wert
 * und in der Kategorie als Matchingattribut vorgesehen.
 */
export function matchbareAttribute(produkt: ProductAttributes): readonly ProductAttribute[] {
  return produkt.attributes.filter(
    (attribut) => darfMatchen(attribut) && attributErlaubt(produkt.categoryId, attribut.attribute),
  );
}

/**
 * Was **nicht** geprüft ist — für die Anzeige mindestens so wichtig wie das
 * Geprüfte. Genannt werden die Matchingattribute der Kategorie, zu denen
 * kein belegter Wert vorliegt.
 */
export function ungepruefteAttribute(produkt: ProductAttributes): readonly string[] {
  const belegt = new Set(matchbareAttribute(produkt).map((attribut) => attribut.attribute));
  return (kategorie(produkt.categoryId)?.matchAttributes ?? []).filter(
    (attribut) => !belegt.has(attribut),
  );
}

/** Herkunftsangabe eines Attributs, wie sie in der Oberfläche steht. */
export function herkunftsText(attribut: ProductAttribute): string {
  if (attribut.verification === 'unverified') {
    return `${attribut.sourceLabel} — keine belastbare Angabe.`;
  }
  const art = {
    manufacturer_stated: 'Herstellerangabe',
    merchant_feed: 'Angabe aus dem Händlerfeed',
    measured: 'gemessen',
  }[attribut.verification];
  return `${art}, ${attribut.sourceLabel}, geprüft am ${attribut.checkedAt}.`;
}

/**
 * M21-06 — Ein Attribut so, wie es auf der Produktkarte steht.
 *
 * Der Wert wird formatiert, nicht gedeutet: `true` heißt „ja“, `false` heißt
 * „nein“, `null` heißt unbekannt — und wird als unbekannt gezeigt statt
 * weggelassen. Weglassen sähe aus wie „trifft nicht zu“.
 */
export function kartenWert(attribut: ProductAttribute): string | null {
  const wert = attribut.value;
  if (wert === null) return null;
  if (typeof wert === 'boolean') return wert ? 'ja' : 'nein';
  if (typeof wert === 'number') {
    return attribut.unit === null ? String(wert) : `${wert} ${attribut.unit}`;
  }
  return wert;
}

/**
 * Die Merkmale eines Produkts für die Karte: **nur belegte**. Ein Attribut
 * ohne Fundstelle ist kein schwacher Beleg, sondern keiner — es erscheint
 * nicht als Merkmal, sondern über `ungepruefteAttribute()` als offener Punkt.
 */
export function kartenMerkmale(
  produkt: ProductAttributes,
): readonly { readonly label: string; readonly wert: string | null; readonly beleg: string }[] {
  return matchbareAttribute(produkt).map((attribut) => ({
    label: merkmalLabel(attribut.attribute),
    wert: kartenWert(attribut),
    beleg: herkunftsText(attribut),
  }));
}

/**
 * M21-06 — Deutsche Beschriftungen der Merkmale.
 *
 * Die Attributnamen sind Bezeichner aus dem Datenmodell (`coatLength`,
 * `washableAtCelsius`). In der Oberfläche standen sie bis zur
 * Bildschirmmappe unverändert da — lesbar für niemanden.
 *
 * Übersetzt wird hier nur der **Name**, nicht die Aussage: aus
 * `dishwasherSafe` wird „spülmaschinenfest“, aus einem fehlenden Wert wird
 * nichts. Ein Bezeichner ohne Eintrag bleibt sichtbar, wie er heißt — das
 * ist hässlich und fällt auf, und genau das soll es.
 */
export const MERKMAL_LABEL: Readonly<Record<string, string>> = {
  difficultyLevel: 'Schwierigkeitsgrad',
  hardnessLevel: 'Härtegrad',
  diameterMillimeters: 'Durchmesser in Millimetern',
  heightCentimeters: 'Höhe in Zentimetern',
  floats: 'Schwimmfähigkeit',
  coatLength: 'Fellänge',
  dishwasherSafe: 'Spülmaschinenfest',
  lengthCentimeters: 'Länge in Zentimetern',
  material: 'Material',
  maxLoadKilograms: 'Höchstlast in Kilogramm',
  sizeRange: 'Größenbereich',
  toolWidthMillimeters: 'Arbeitsbreite in Millimetern',
  washableAtCelsius: 'Waschbar bei Grad Celsius',
  weightRangeKilograms: 'Gewichtsbereich in Kilogramm',
  washable: 'Waschbar',
  size: 'Größe',
};

/** Beschriftung eines Merkmals; unbekannte Bezeichner bleiben sichtbar. */
export function merkmalLabel(attribut: string): string {
  return MERKMAL_LABEL[attribut] ?? attribut;
}

export function productIdentity(id: string) {
  return identities.products.find((product) => product.id === id);
}
