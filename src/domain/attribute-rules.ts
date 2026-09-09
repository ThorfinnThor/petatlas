/**
 * M22-02 — Regeln über Produkteigenschaften, ohne Schemabibliothek.
 *
 * `darfMatchen()` stand in `schemas/product-attributes.ts`. Wer die Regel
 * brauchte, bekam die Schemabibliothek mit — auch im Browser. Die Regel
 * selbst braucht sie nicht: sie liest zwei Felder.
 */
import type { ProductAttribute } from './schemas/product-attributes.ts';

/**
 * Darf dieses Attribut ein Produkt als passend erscheinen lassen?
 *
 * Nein bei unbekanntem Wert und nein ohne Beleg. Beides ist derselbe
 * Gedanke: was niemand weiß, spricht weder für noch gegen ein Produkt.
 */
export function darfMatchen(attribut: ProductAttribute): boolean {
  return attribut.value !== null && attribut.verification !== 'unverified';
}
