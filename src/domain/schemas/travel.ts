/**
 * M03-04 — Reiseregeln.
 *
 * Die Bedingungen sind eine kleine deklarative DSL mit festen Operatoren.
 * Es wird bewusst **kein** JavaScript aus JSON ausgeführt: kein `eval`, keine
 * Funktionen aus Daten. Ein Ergebnis kennt `unknown` als eigenen Zustand;
 * unbekannt ist nicht erfüllt.
 */
import { z } from 'zod';

import { CountryCode, IsoDate, IsoTimestamp, Period, Species } from './common.ts';

export const PredicateSchema: z.ZodType = z.lazy(() =>
  z.union([
    z.object({ op: z.literal('all'), of: z.array(PredicateSchema).min(1) }).strict(),
    z.object({ op: z.literal('any'), of: z.array(PredicateSchema).min(1) }).strict(),
    z.object({ op: z.literal('eq'), field: z.string().min(1), value: z.unknown() }).strict(),
    z
      .object({
        op: z.literal('in'),
        field: z.string().min(1),
        values: z.array(z.unknown()).min(1),
      })
      .strict(),
    z.object({ op: z.literal('dateBefore'), field: z.string().min(1), date: IsoDate }).strict(),
    z.object({ op: z.literal('dateAfter'), field: z.string().min(1), date: IsoDate }).strict(),
    z
      .object({
        op: z.literal('daysBetween'),
        from: z.string().min(1),
        to: z.string().min(1),
        min: z.number().int().nullable(),
        max: z.number().int().nullable(),
      })
      .strict(),
  ]),
);

export const TravelContextKind = z.enum([
  'private_accompanied',
  'unaccompanied',
  'commercial_transfer',
  'unknown',
]);

export const RequirementState = z.enum(['fulfilled', 'not_fulfilled', 'unknown', 'not_applicable']);
export type RequirementState = z.infer<typeof RequirementState>;

export const TravelRuleSchema = z
  .object({
    ruleId: z.string().min(1),
    originCountry: CountryCode,
    destinationCountry: CountryCode,
    transitCountries: z.array(CountryCode),
    species: Species,
    context: TravelContextKind,
    validity: Period,
    /** Amtliche Fundstelle. Ohne sie darf die Regel nicht live gehen. */
    officialSourceUrl: z.string().url(),
    condition: PredicateSchema,
    /** Verständlicher Hinweistext für die Checkliste. */
    guidance: z.string().min(1),
    reviewedAt: IsoTimestamp.nullable(),
    reviewedBy: z.string().nullable(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.originCountry === value.destinationCountry) {
      ctx.addIssue({
        code: 'custom',
        message: 'Herkunft und Ziel sind identisch; das ist keine Einreiseregel.',
        path: ['destinationCountry'],
      });
    }
    if (value.context === 'unknown') {
      ctx.addIssue({
        code: 'custom',
        message: 'Eine Regel für einen unbekannten Reisekontext darf nicht gespeichert werden.',
        path: ['context'],
      });
    }
  });
export type TravelRule = z.infer<typeof TravelRuleSchema>;

/**
 * Darf diese Regel öffentlich ausgewertet werden? Ohne Fachfreigabe und ohne
 * gültigen Zeitraum lautet die Antwort nein — unabhängig davon, ob der
 * Abruf der Quelle technisch funktioniert hat.
 */
export function isRuleLive(rule: TravelRule, today: string): boolean {
  if (rule.reviewedAt === null || rule.reviewedBy === null) return false;
  if (today < rule.validity.from) return false;
  if (rule.validity.until !== null && today > rule.validity.until) return false;
  return true;
}

/**
 * Gesamtstatus einer Checkliste. „Alle geprüften Voraussetzungen erfüllt“ ist
 * nur zulässig, wenn keine Position `unknown` ist — und bleibt auch dann
 * keine Einreisegarantie.
 */
export function overallState(states: readonly RequirementState[]): RequirementState {
  if (states.some((state) => state === 'not_fulfilled')) return 'not_fulfilled';
  if (states.some((state) => state === 'unknown')) return 'unknown';
  if (states.every((state) => state === 'not_applicable')) return 'not_applicable';
  return 'fulfilled';
}
