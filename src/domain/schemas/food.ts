/**
 * M15-01 — Futter.
 *
 * Ein Futterprodukt ist ein Produkt mit **deklarierten** Angaben. Der
 * Unterschied zu allem anderen im Katalog: hier gibt es eine gesetzlich
 * geregelte Kennzeichnung, und genau die wird übernommen — nicht mehr.
 *
 * Drei Dinge, die dieses Schema nicht zulässt:
 *
 * 1. **Keine geratene Lebensphase.** „Junior“ im Produktnamen ist kein
 *    Beleg; die Lebensphase kommt aus der Deklaration oder ist `null`.
 * 2. **Keine geratene Futterart.** Ob ein Produkt Allein- oder
 *    Ergänzungsfuttermittel ist, steht auf dem Etikett. Aus einem hohen
 *    Proteinwert folgt es nicht.
 * 3. **Keine Nährwerte ohne Einheit und Bezug.** „22 Prozent Protein“ ist
 *    etwas anderes je nachdem, ob es sich auf Frischmasse oder Trockenmasse
 *    bezieht.
 */
import { z } from 'zod';

import { Gtin, IsoDate, Species } from './common.ts';

/** Lebensphase laut Deklaration. Nie aus dem Namen abgeleitet. */
export const LifeStage = z.enum(['puppy', 'adult', 'senior', 'all_stages']);
export type LifeStage = z.infer<typeof LifeStage>;

/** Futterart laut Deklaration. */
export const FoodKind = z.enum(['complete', 'complementary']);
export type FoodKind = z.infer<typeof FoodKind>;

/** Bezugsgröße eines Nährwerts. Ohne sie ist eine Zahl nicht vergleichbar. */
export const NutrientBasis = z.enum([
  /** Angabe je 100 g Frischmasse, wie üblich deklariert. */
  'as_fed_per_100g',
  /** Angabe je 100 g Trockenmasse. */
  'dry_matter_per_100g',
  /** Angabe je 1000 kJ umsetzbarer Energie. */
  'per_1000kj',
]);
export type NutrientBasis = z.infer<typeof NutrientBasis>;

export const NutrientValueSchema = z
  .object({
    nutrient: z.string().regex(/^[a-z][a-zA-Z0-9]*$/, 'Erwartet wird ein Nährstoffname.'),
    /** Zahl laut Deklaration. `null` heißt nicht deklariert. */
    value: z.number().nonnegative().nullable(),
    /** Einheit, etwa `g` oder `%`. Pflicht, sobald es einen Wert gibt. */
    unit: z.string().nullable(),
    basis: NutrientBasis.nullable(),
    /** Wo die Angabe steht: Etikett, Herstellerseite, Händlerfeed. */
    sourceLabel: z.string().min(1),
    sourceUrl: z.url().nullable(),
    checkedAt: IsoDate.nullable(),
  })
  .strict()
  .superRefine((wert, ctx) => {
    if (wert.value !== null) {
      if (wert.unit === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ein Nährwert ohne Einheit ist keine Angabe.',
          path: ['unit'],
        });
      }
      if (wert.basis === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ein Nährwert ohne Bezug ist nicht vergleichbar.',
          path: ['basis'],
        });
      }
      if (wert.sourceUrl === null || wert.checkedAt === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'Ein deklarierter Wert braucht Fundstelle und Prüfdatum.',
          path: ['sourceUrl'],
        });
      }
    }
  });
export type NutrientValue = z.infer<typeof NutrientValueSchema>;

export const FoodProductSchema = z
  .object({
    foodId: z.string().min(1),
    productId: z.string().min(1),
    species: Species,
    brand: z.string().min(1),
    productName: z.string().min(1),
    gtin: Gtin.nullable(),
    /** Laut Deklaration; `null` heißt nicht deklariert, nicht „für alle“. */
    lifeStage: LifeStage.nullable(),
    kind: FoodKind.nullable(),
    /** Nettofüllmenge einer Packung in Gramm. `null` = unbekannt. */
    netContentGrams: z.number().int().positive().nullable(),
    /** Packungen im Gebinde. `null` = unbekannt, ausdrücklich nicht 1. */
    packUnits: z.number().int().positive().nullable(),
    /** Deklarierte Nährwerte. Leer ist zulässig: viele Feeds führen keine. */
    nutrients: z.array(NutrientValueSchema),
    /** Zusammensetzung im Wortlaut der Deklaration, falls vorhanden. */
    composition: z.string().nullable(),
    declarationSourceUrl: z.url().nullable(),
    declarationCheckedAt: IsoDate.nullable(),
  })
  .strict()
  .superRefine((wert, ctx) => {
    const namen = wert.nutrients.map((eintrag) => eintrag.nutrient);
    if (new Set(namen).size !== namen.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Jeder Nährstoff darf nur einmal vorkommen.',
        path: ['nutrients'],
      });
    }
    if ((wert.lifeStage !== null || wert.kind !== null) && wert.declarationSourceUrl === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Lebensphase und Futterart kommen aus der Deklaration — mit Fundstelle.',
        path: ['declarationSourceUrl'],
      });
    }
  });
export type FoodProduct = z.infer<typeof FoodProductSchema>;

// Die beiden Rechenregeln liegen seit M22-02 in `../domain-rules.ts`, damit
// sie ohne Schemabibliothek zu haben sind. Hier bleiben sie erreichbar.
export { gesamtmengeGramm, naehrwert } from '../domain-rules.ts';
