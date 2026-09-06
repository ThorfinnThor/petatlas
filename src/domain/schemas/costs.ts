/**
 * M03-04 — Gebührenpositionen und Kostenszenarien.
 *
 * Eine einzelne Gebührenposition ist kein Behandlungspaket. Ein Szenario, das
 * mehrere Positionen zu einer Gesamtschätzung bündelt, ist eine redaktionelle
 * Aussage und braucht eine fachliche Freigabe (`clinicalReview`).
 */
import { z } from 'zod';

import { CurrencyCode, IsoTimestamp, MinorAmount, Period, Species } from './common.ts';

export const FeeItemSchema = z
  .object({
    /** Amtliche Positions-ID aus dem Gebührenkatalog, nicht selbst vergeben. */
    officialItemId: z.string().min(1),
    catalogVersion: z.string().min(1),
    /** Originalbezeichnung, unverändert aus der Quelle. */
    originalLabel: z.string().min(1),
    /**
     * Die GOT ordnet Positionen keiner eigenen Tierartspalte zu; wo eine
     * Tierart gemeint ist, steht sie im Bezeichnungstext. `null` heißt
     * deshalb: die Quelle nennt hier keine Tierart, die sich ohne Auslegung
     * ablesen ließe. Es wird nichts geraten.
     */
    species: Species.nullable(),
    baseUnit: z.string().min(1),
    baseAmountMinor: MinorAmount,
    currency: CurrencyCode,
    /** Fundstelle in der Quelle, damit die Position nachprüfbar bleibt. */
    sourceReference: z.string().min(1),
    validity: Period,
  })
  .strict();
export type FeeItem = z.infer<typeof FeeItemSchema>;

export const ClinicalReview = z.enum(['unreviewed', 'approved', 'withdrawn']);

export const ScenarioLineSchema = z
  .object({
    officialItemId: z.string().min(1),
    quantity: z.number().int().positive(),
    /** Leistungsfaktor. Zwischen 1 und 4 laut Gebührenordnung. */
    factor: z.number().min(1).max(4),
  })
  .strict();

export const CostScenarioSchema = z
  .object({
    scenarioId: z.string().min(1),
    title: z.string().min(1),
    species: Species,
    lines: z.array(ScenarioLineSchema).min(1),
    /** Was ausdrücklich nicht enthalten ist. Leere Liste ist eine Aussage. */
    exclusions: z.array(z.string()),
    clinicalReview: ClinicalReview,
    reviewedAt: IsoTimestamp.nullable(),
    reviewedBy: z.string().nullable(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.clinicalReview === 'approved' && (!value.reviewedAt || !value.reviewedBy)) {
      ctx.addIssue({
        code: 'custom',
        message: 'approved ohne Prüfzeitpunkt und prüfende Person ist keine Freigabe.',
        path: ['clinicalReview'],
      });
    }
    const seen = new Set<string>();
    for (const line of value.lines) {
      if (seen.has(line.officialItemId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Position ${line.officialItemId} ist doppelt; Mengen gehören in quantity.`,
          path: ['lines'],
        });
      }
      seen.add(line.officialItemId);
    }
  });
export type CostScenario = z.infer<typeof CostScenarioSchema>;

/**
 * Darf für dieses Szenario öffentlich eine Gesamtschätzung angezeigt werden?
 * Ohne fachliche Freigabe darf der Nutzer nur einzelne bekannte Positionen
 * addieren, und das Ergebnis muss die Lücken benennen.
 */
export function mayShowTotalEstimate(scenario: CostScenario): boolean {
  return scenario.clinicalReview === 'approved' && scenario.reviewedAt !== null;
}
