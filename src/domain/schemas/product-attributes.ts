/**
 * M14-02 — Produkteigenschaften mit Herkunft.
 *
 * Ein Attribut ohne Herkunft ist eine Behauptung. Deshalb trägt hier **jedes**
 * Attribut mit, woher es stammt und wie gut es belegt ist — und `null` heißt
 * unbekannt, nicht „egal“.
 *
 * Der Verifikationsstatus entscheidet über die Verwendung: nur belegte
 * Attribute dürfen ein Produkt als passend erscheinen lassen (M14-03).
 * `unverified` ist kein schwacher Beleg, sondern gar keiner.
 */
import { z } from 'zod';

import { IsoDate, TriState } from './common.ts';

export const AttributeVerification = z.enum([
  /** Herstellerangabe, Fundstelle genannt. */
  'manufacturer_stated',
  /** Angabe aus dem Händlerfeed, nicht beim Hersteller geprüft. */
  'merchant_feed',
  /** Selbst gemessen oder aus einem Prüfbericht übernommen. */
  'measured',
  /** Keine belastbare Herkunft. Darf nicht fürs Matching benutzt werden. */
  'unverified',
]);
export type AttributeVerification = z.infer<typeof AttributeVerification>;

/** Werte, die ein Attribut annehmen kann. `null` heißt unbekannt. */
export const AttributeValue = z.union([z.string(), z.number(), TriState]);

export const ProductAttributeSchema = z
  .object({
    attribute: z.string().regex(/^[a-zA-Z][a-zA-Z0-9]*$/, 'Erwartet wird ein Attributname.'),
    value: AttributeValue,
    /** Einheit, wenn der Wert eine Zahl ist. Sonst `null`. */
    unit: z.string().nullable(),
    verification: AttributeVerification,
    /** Wo die Angabe steht. `null` nur bei `unverified`. */
    sourceUrl: z.url().nullable(),
    /** Wer sie macht — Hersteller, Händler, eigene Messung. */
    sourceLabel: z.string().min(1),
    checkedAt: IsoDate.nullable(),
  })
  .strict()
  .superRefine((wert, ctx) => {
    if (wert.value === null && wert.verification !== 'unverified') {
      ctx.addIssue({
        code: 'custom',
        message: 'Ein unbekannter Wert kann nicht belegt sein.',
        path: ['verification'],
      });
    }
    if (wert.verification !== 'unverified') {
      if (wert.sourceUrl === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ein belegtes Attribut braucht eine Fundstelle.',
          path: ['sourceUrl'],
        });
      }
      if (wert.checkedAt === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ein belegtes Attribut braucht ein Prüfdatum.',
          path: ['checkedAt'],
        });
      }
    }
    if (typeof wert.value === 'number' && wert.unit === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Eine Zahl ohne Einheit ist keine Angabe.',
        path: ['unit'],
      });
    }
  });
export type ProductAttribute = z.infer<typeof ProductAttributeSchema>;

export const ProductAttributesSchema = z
  .object({
    productId: z.string().min(1),
    categoryId: z.string().min(1),
    attributes: z.array(ProductAttributeSchema).min(1),
  })
  .strict()
  .refine(
    (wert) =>
      new Set(wert.attributes.map((eintrag) => eintrag.attribute)).size === wert.attributes.length,
    { message: 'Jedes Attribut darf nur einmal vorkommen.', path: ['attributes'] },
  );
export type ProductAttributes = z.infer<typeof ProductAttributesSchema>;

export const AttributeReviewSchema = z
  .object({
    reviewId: z.string().min(1),
    lastEditedAt: IsoDate,
    /** Ausdrücklicher Hinweis, ob die Daten echt oder synthetisch sind. */
    dataKind: z.enum(['synthetic', 'real']),
    products: z.array(ProductAttributesSchema).min(1),
    notes: z.array(z.string()),
  })
  .strict();
export type AttributeReview = z.infer<typeof AttributeReviewSchema>;

/**
 * Die Regel selbst steht seit M22-02 in `../attribute-rules.ts`, damit sie
 * ohne Schemabibliothek zu haben ist. Hier bleibt sie erreichbar, wo man sie
 * sucht.
 */
export { darfMatchen } from '../attribute-rules.ts';
