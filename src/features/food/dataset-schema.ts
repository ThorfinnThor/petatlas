/**
 * M22-02 — Das Schema des Futterdatensatzes.
 *
 * Es stand bis hierher in `catalog.ts` — einem Modul, das im Browser läuft.
 * Damit lag die Schemabibliothek auf jeder Futterseite. Geprüft wird die
 * Datei jetzt zur Bauzeit (`npm run check:content`); sie kann sich zwischen
 * Build und Seitenaufruf nicht ändern.
 */
import { z } from 'zod';

import { FoodProductSchema } from '../../domain/schemas/food.ts';

export const FUTTER_DATENSATZ_SCHEMA = z
  .object({
    datasetId: z.string().min(1),
    lastEditedAt: z.string().min(1),
    dataKind: z.enum(['synthetic', 'real']),
    products: z.array(FoodProductSchema.and(z.object({ categoryId: z.string().min(1) }))),
    notes: z.array(z.string()),
  })
  .strict();
