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

/**
 * M12-01 — Der unterstützte Reisekontext.
 *
 * V1 prüft einen **kleinen, benannten Standardfall** und sagt für alles
 * andere ausdrücklich „nicht unterstützt“. Das ist der Kern dieses Schemas:
 * `unsupported` ist ein Pflichtfeld mit Begründungen, weil eine Liste von
 * unterstützten Fällen ohne die Gegenliste wie eine weltweite Abdeckung
 * aussieht.
 */
export const UnsupportedCaseSchema = z
  .object({
    caseId: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Kleinbuchstaben und Bindestriche.'),
    /** Was der Fall ist, in einem Satz und ohne Fachjargon. */
    label: z.string().min(1),
    /** Warum V1 ihn nicht prüft. Kein „später vielleicht“, sondern ein Grund. */
    reason: z.string().min(1),
  })
  .strict();
export type UnsupportedCase = z.infer<typeof UnsupportedCaseSchema>;

export const TravelDirection = z.enum(['outbound', 'return']);
export type TravelDirection = z.infer<typeof TravelDirection>;

export const TravelScopeSchema = z
  .object({
    scopeVersion: z.string().min(1),
    validFrom: IsoDate,
    /** Herkunftsland. V1 kennt genau eines. */
    origin: CountryCode,
    destinations: z.array(CountryCode).min(1),
    /** Länder, deren Durchreise geprüft wird. */
    transitCountries: z.array(CountryCode),
    species: z.array(Species).min(1),
    contexts: z.array(TravelContextKind).min(1),
    directions: z.array(TravelDirection).min(1),
    /**
     * Untergrenze des Alters als **Umfangsgrenze**, nicht als Rechtsaussage:
     * für jüngere Tiere gelten zusätzliche Voraussetzungen, die V1 nicht prüft.
     */
    minAgeMonths: z.number().int().positive(),
    /** Obergrenze der Tierzahl im privaten Fall. */
    maxAnimals: z.number().int().positive(),
    unsupported: z.array(UnsupportedCaseSchema).min(1),
    notes: z.array(z.string()),
  })
  .strict()
  .superRefine((wert, ctx) => {
    if (wert.destinations.includes(wert.origin)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Das Herkunftsland ist kein Reiseziel.',
        path: ['destinations'],
      });
    }
    if (wert.contexts.includes('unknown')) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ein unbekannter Reisekontext ist nicht unterstützt, sondern unbekannt.',
        path: ['contexts'],
      });
    }
  });
export type TravelScope = z.infer<typeof TravelScopeSchema>;

export const TravelRuleSchema = z
  .object({
    ruleId: z.string().min(1),
    /**
     * Fachliche Anforderung, die diese Regel abbildet — etwa
     * `microchip` oder `rabies-vaccination`. Zwei Regeln mit derselben
     * Anforderung schließen einander aus; es gilt die mit der höheren
     * Priorität, damit eine Landesregel eine allgemeine Regel verdrängen
     * kann, ohne dass beide nebeneinander in der Checkliste stehen.
     */
    requirementId: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Kleinbuchstaben und Bindestriche.'),
    /** Höhere Zahl verdrängt niedrigere bei gleicher Anforderung. */
    priority: z.number().int(),
    originCountry: CountryCode,
    destinationCountry: CountryCode,
    transitCountries: z.array(CountryCode),
    species: Species,
    context: TravelContextKind,
    validity: Period,
    /** Amtliche Fundstelle. Ohne sie darf die Regel nicht live gehen. */
    officialSourceUrl: z.url(),
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
