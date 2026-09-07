/**
 * M14-02 — Zugang zu den geprüften Produkteigenschaften.
 *
 * Die Daten werden beim Laden validiert und zusätzlich gegen die Taxonomie
 * geprüft: ein Attribut, das die Kategorie nicht kennt, ist kein
 * Matchingattribut — es darf mitgeführt und angezeigt werden, aber es
 * entscheidet nichts.
 */
import review from '../../../content-data/attributes/synthetic-review.json' with { type: 'json' };
import {
  AttributeReviewSchema,
  darfMatchen,
  type AttributeReview,
  type ProductAttribute,
  type ProductAttributes,
} from '../../domain/schemas/product-attributes.ts';
import { attributErlaubt, kategorie } from './taxonomy.ts';

function lade(roh: unknown, quelle: string): AttributeReview {
  const ergebnis = AttributeReviewSchema.safeParse(roh);
  if (!ergebnis.success) {
    throw new Error(`${quelle} ist ungültig: ${ergebnis.error.message}`);
  }
  for (const produkt of ergebnis.data.products) {
    if (kategorie(produkt.categoryId) === undefined) {
      throw new Error(
        `${quelle}: Produkt ${produkt.productId} nennt die unbekannte Kategorie ` +
          `"${produkt.categoryId}".`,
      );
    }
  }
  return ergebnis.data;
}

const PRUEFUNG = lade(review, 'content-data/attributes/synthetic-review.json');

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
