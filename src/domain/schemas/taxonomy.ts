/**
 * M14-01 — Startkategorien für Pflege und Spielzeug.
 *
 * Eine Kategorie beschreibt **Zubehör**, keine Wirkung. Deshalb hat sie
 * Merkmale, nach denen gefiltert wird — und keine Indikationen, für die sie
 * „gut“ wäre.
 *
 * `excluded` ist Pflicht und nicht leer: eine Kategorienliste ohne ihre
 * Grenze liest sich wie ein Versprechen, alles abzudecken. Arzneimittel,
 * Supplemente und Tests stehen dort mit Begründung.
 */
import { z } from 'zod';

import { IsoDate, Species } from './common.ts';

export const TaxonomyCategorySchema = z
  .object({
    categoryId: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Kleinbuchstaben und Bindestriche.'),
    label: z.string().min(1),
    species: z.array(Species).min(1),
    description: z.string().min(10),
    /** Attribute, die beim Matching überhaupt herangezogen werden dürfen. */
    matchAttributes: z.array(z.string().min(1)).min(1),
  })
  .strict();
export type TaxonomyCategory = z.infer<typeof TaxonomyCategorySchema>;

export const TaxonomyExclusionSchema = z
  .object({
    topic: z.string().min(1),
    reason: z.string().min(20),
  })
  .strict();
export type TaxonomyExclusion = z.infer<typeof TaxonomyExclusionSchema>;

export const TaxonomySchema = z
  .object({
    taxonomyId: z.string().min(1),
    lastEditedAt: IsoDate,
    categories: z.array(TaxonomyCategorySchema).min(1),
    /** Was ausdrücklich **nicht** geführt wird, mit Grund. */
    excluded: z.array(TaxonomyExclusionSchema).min(1),
    notes: z.array(z.string()),
  })
  .strict()
  .refine(
    (wert) =>
      new Set(wert.categories.map((kategorie) => kategorie.categoryId)).size ===
      wert.categories.length,
    { message: 'Kategoriekennungen müssen eindeutig sein.', path: ['categories'] },
  );
export type Taxonomy = z.infer<typeof TaxonomySchema>;
