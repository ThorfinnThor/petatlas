/**
 * Redaktionskatalog für Versicherungsarten.
 *
 * Dieser Bestand ist kein Tarif- oder Preisfeed. Er beschreibt nur die auf
 * der offiziellen Anbieterwebsite benannten Produktarten. Beiträge,
 * Leistungsgrenzen und Bedingungen bleiben beim Anbieter.
 */
import { z } from 'zod';

export const InsuranceSpecies = z.enum(['dog', 'cat']);
export const InsuranceProductType = z.enum(['health', 'op', 'liability']);

export const InsuranceCatalogProductSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    species: InsuranceSpecies,
    productType: InsuranceProductType,
    summary: z.string().min(1),
    sourceUrl: z.url().refine((url) => url.startsWith('https://www.hansemerkur.de/')),
    sourceLabel: z.string().min(1),
    checkedAt: z.iso.date(),
  })
  .strict();

export const InsuranceCatalogSchema = z
  .object({
    schemaVersion: z.literal(1),
    programId: z.literal('hansemerkur-de'),
    advertiserId: z.literal('11705'),
    publisherId: z.literal('3037577'),
    merchantName: z.literal('HanseMerkur'),
    checkedAt: z.iso.date(),
    products: z.array(InsuranceCatalogProductSchema).min(1),
  })
  .strict()
  .superRefine((value, ctx) => {
    const ids = new Set<string>();
    for (const [index, product] of value.products.entries()) {
      if (ids.has(product.id)) {
        ctx.addIssue({ code: 'custom', message: 'Produkt-IDs müssen eindeutig sein.', path: ['products', index, 'id'] });
      }
      ids.add(product.id);
    }
  });

export type InsuranceCatalogProduct = z.infer<typeof InsuranceCatalogProductSchema>;
export type InsuranceCatalog = z.infer<typeof InsuranceCatalogSchema>;
