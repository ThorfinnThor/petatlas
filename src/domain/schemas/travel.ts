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
 * M12-03 — Ein Regelsatz: mehrere gleichlautende Anforderungen für mehrere
 * Ziele und Tierarten, aus **einer** Fundstelle.
 *
 * Die EU-Anforderungen sind für alle Mitgliedstaaten dieselben. Sie 24-mal
 * abzuschreiben wäre 24-mal die Gelegenheit, sich zu vertippen. Der Regelsatz
 * hält sie einmal; die Einzelregeln entstehen daraus deterministisch.
 *
 * `reviewedAt`/`reviewedBy` fehlen hier bewusst: ein Regelsatz wird nicht
 * freigegeben, sondern jede daraus erzeugte Regel einzeln — und bis dahin
 * wertet die Maschine sie nicht aus.
 */
export const TravelRequirementSchema = z
  .object({
    requirementId: z
      .string()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Kleinbuchstaben und Bindestriche.'),
    priority: z.number().int(),
    /** Amtliche Fundstelle genau dieser Anforderung. */
    officialSourceUrl: z.url(),
    /** Fundstelle im Klartext, etwa „Art. 8 Buchst. a“. */
    citation: z.string().min(1),
    guidance: z.string().min(1),
    condition: PredicateSchema,
  })
  .strict();
export type TravelRequirement = z.infer<typeof TravelRequirementSchema>;

/**
 * M12-05 — Packliste.
 *
 * Zwei Sorten von Einträgen: **regelbezogene Aufgaben**, die sich aus einer
 * Anforderung ergeben (dann steht die `requirementId` dabei), und
 * **Ausrüstung**, die schlicht praktisch ist.
 *
 * Was hier nicht vorkommt: Medikamente. Keine Wirkstoffe, keine Dosierungen,
 * keine „Reiseapotheke“ mit Empfehlungen. Was ein Tier braucht, entscheidet
 * die Tierarztpraxis, die es kennt — nicht eine Liste, die alle sehen.
 */
export const PackingCategory = z.enum(['rule_task', 'equipment', 'documents']);
export type PackingCategory = z.infer<typeof PackingCategory>;

export const PackingItemSchema = z
  .object({
    itemId: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Kleinbuchstaben und Bindestriche.'),
    label: z.string().min(1),
    category: PackingCategory,
    /** Anforderung, aus der die Aufgabe folgt. `null` = keine Regel dahinter. */
    requirementId: z.string().nullable(),
    /** Warum der Punkt auf der Liste steht. */
    note: z.string().min(1),
    order: z.number().int().nonnegative(),
  })
  .strict()
  .superRefine((wert, ctx) => {
    if (wert.category === 'rule_task' && wert.requirementId === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Eine regelbezogene Aufgabe ohne Anforderung ist keine.',
        path: ['requirementId'],
      });
    }
  });
export type PackingItem = z.infer<typeof PackingItemSchema>;

export const PackingListSchema = z
  .object({
    listId: z.string().min(1),
    lastEditedAt: IsoDate,
    items: z.array(PackingItemSchema).min(1),
    notes: z.array(z.string()),
  })
  .strict()
  .refine((wert) => new Set(wert.items.map((i) => i.itemId)).size === wert.items.length, {
    message: 'Eintragskennungen müssen eindeutig sein.',
    path: ['items'],
  });
export type PackingList = z.infer<typeof PackingListSchema>;

/**
 * M12-06 — Fachliche Freigabe eines Regelsatzes.
 *
 * Die Freigabe nennt die **Signatur des geprüften Inhalts**. Ändert sich der
 * Regelsatz, passt die Signatur nicht mehr, und die Freigabe gilt für den
 * neuen Inhalt nicht — ohne dass jemand daran denken muss.
 */
export const TravelApprovalSchema = z
  .object({
    ruleSetId: z.string().min(1),
    approvedAt: IsoDate,
    approvedBy: z.string().min(1),
    /** Signatur des Inhalts, der tatsächlich geprüft wurde. */
    sourceDigest: z.string().regex(/^[0-9a-f]{16}$/, 'Erwartet werden 16 Hexstellen.'),
    /** Worauf sich die Freigabe stützt, etwa docs/reviews/travel.md. */
    evidence: z.string().min(1),
  })
  .strict();
export type TravelApproval = z.infer<typeof TravelApprovalSchema>;

export const TravelApprovalListSchema = z
  .object({ approvals: z.array(TravelApprovalSchema) })
  .strict();
export type TravelApprovalList = z.infer<typeof TravelApprovalListSchema>;

export const TravelRuleSetSchema = z
  .object({
    ruleSetId: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Kleinbuchstaben und Bindestriche.'),
    /** Rechtsgrundlage im Klartext. */
    legalBasis: z.string().min(1),
    /** Ab wann der Rechtsakt gilt — nicht wann er erlassen wurde. */
    appliesFrom: IsoDate,
    appliesUntil: IsoDate.nullable(),
    origins: z.array(CountryCode).min(1),
    destinations: z.array(CountryCode).min(1),
    species: z.array(Species).min(1),
    contexts: z.array(TravelContextKind).min(1),
    /** Jede tatsächlich gelesene Quelle mit Abrufdatum. */
    sources: z
      .array(
        z
          .object({
            url: z.url(),
            title: z.string().min(1),
            retrievedAt: IsoDate,
            note: z.string(),
          })
          .strict(),
      )
      .min(1),
    requirements: z.array(TravelRequirementSchema).min(1),
    notes: z.array(z.string()),
  })
  .strict()
  .superRefine((wert, ctx) => {
    if (wert.contexts.includes('unknown')) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ein unbekannter Reisekontext ist kein Anwendungsbereich.',
        path: ['contexts'],
      });
    }
    const ids = wert.requirements.map((anforderung) => anforderung.requirementId);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Anforderungskennungen müssen eindeutig sein.',
        path: ['requirements'],
      });
    }
  });
export type TravelRuleSet = z.infer<typeof TravelRuleSetSchema>;

// Beide Regeln liegen seit M22-02 in `../domain-rules.ts`.
export { isRuleLive, overallState } from '../domain-rules.ts';
