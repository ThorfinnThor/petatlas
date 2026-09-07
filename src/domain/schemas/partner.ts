/**
 * M09-01 — Partnerprogramme (Affiliate).
 *
 * Ein Eintrag beschreibt **einen Vertrag mit einem Anbieter**, nicht eine
 * Absicht, einen zu schließen. Er entscheidet, ob überhaupt ein Werbelink
 * entstehen darf — und zwar fail-closed:
 *
 * - `status` ist ohne echten Vertrag nie `approved`.
 * - `approved` verlangt Vertragsreferenz, Freigabedatum und einen
 *   dokumentierten Prüfnachweis. Ein Disclaimer ist kein Nachweis.
 * - Erlaubt ist nur, was ausdrücklich aufgezählt ist: Zielhosts,
 *   Platzierungsarten, Kampagnenkennungen, Märkte. Alles andere ist verboten,
 *   auch wenn es nirgends steht.
 *
 * **Provisionen gehören nicht in diese Konfiguration.** Sie werden nicht
 * ausgeliefert, weil alles im Browser öffentlich ist und eine Provisionshöhe
 * weder den Nutzer etwas angeht noch in einen Vertrag hineingehört, den man
 * per View-Source lesen kann. Das Schema ist `.strict()`; ein Feld wie
 * `commissionRate` lässt die Konfiguration scheitern statt sie ausliefern.
 */
import { z } from 'zod';

import { IsoDate, IsoTimestamp, MarketId } from './common.ts';

export const PartnerStatus = z.enum([
  /** Kein Kontakt, kein Vertrag. Ausgangszustand. */
  'none',
  /** Beworben, noch nicht zugelassen. */
  'applied',
  /** Zugelassen und vertraglich belegt. */
  'approved',
  /** Abgelehnt. */
  'rejected',
  /** Programm beendet oder Zulassung entzogen. */
  'ended',
]);
export type PartnerStatus = z.infer<typeof PartnerStatus>;

/**
 * Wo ein Hinweis stehen darf. Eine Kostenberechnung, eine Notfallseite oder
 * ein Ergebnisbereich stehen ausdrücklich **nicht** zur Wahl: dort wäre ein
 * Werbehinweis eine Empfehlung im Ergebnis, und das ist keine Werbung mehr,
 * sondern Beratung.
 */
export const PartnerPlacement = z.enum([
  /** Eigenständige Informationsseite zum Thema Versicherung. */
  'information_page',
  /** Abschnitt am Seitenende, deutlich abgesetzt. */
  'page_footer_section',
  /** Hinweis in einer Übersicht ohne Rangfolge. */
  'neutral_list',
]);
export type PartnerPlacement = z.infer<typeof PartnerPlacement>;

export const PartnerApprovalSchema = z
  .object({
    /** Referenz auf den tatsächlichen Vertrag oder die Programmzulassung. */
    contractReference: z.string().min(1),
    approvedAt: IsoDate,
    /** Bis wann die Zulassung gilt. `null` = unbefristet laut Vertrag. */
    expiresAt: IsoDate.nullable(),
    /** Dokumentierte Prüfung der konkreten Ausgestaltung, z. B. § 34d GewO. */
    reviewEvidence: z.string().min(1),
    reviewedAt: IsoTimestamp,
  })
  .strict();
export type PartnerApproval = z.infer<typeof PartnerApprovalSchema>;

export const PartnerProgramSchema = z
  .object({
    programId: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Kleinbuchstaben und Bindestriche.'),
    /** Der Anbieter, für den geworben wird. */
    advertiser: z.string().min(1),
    /** Netzwerk oder „direkt“. Der Vertragspartner, nicht der Beworbene. */
    network: z.string().min(1),
    /** Märkte, in denen dieser Vertrag gilt. Leer heißt nirgends. */
    markets: z.array(MarketId),
    status: PartnerStatus,
    /** Nur bei `approved` gesetzt; sonst ausdrücklich `null`. */
    approval: PartnerApprovalSchema.nullable(),
    /** Zielhosts, die verlinkt werden dürfen. Allowlist, kein Muster. */
    allowedLinkHosts: z.array(z.string().regex(/^[a-z0-9.-]+$/, 'Erwartet wird ein Host.')),
    /** Zieladresse laut Vertrag. `null`, solange es keine gibt. */
    landingUrl: z.url().nullable(),
    /** Statische Kampagnenkennungen. Keine dynamischen Parameter. */
    campaignIds: z.array(z.string().regex(/^[A-Za-z0-9_-]+$/)),
    allowedPlacements: z.array(PartnerPlacement),
    /** Wortlaut der Werbekennzeichnung, wie sie erscheinen muss. */
    disclosureText: z.string().min(1),
    /** Auflagen aus dem Vertrag, im Klartext. */
    restrictions: z.array(z.string()),
    notes: z.array(z.string()),
  })
  .strict()
  .superRefine((wert, ctx) => {
    if (wert.status === 'approved') {
      if (wert.approval === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'approved ohne Vertragsnachweis: eine Zulassung braucht Referenz und Prüfung.',
          path: ['approval'],
        });
      }
      if (wert.markets.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'approved ohne Markt: ein Vertrag gilt irgendwo oder gar nicht.',
          path: ['markets'],
        });
      }
      if (wert.allowedLinkHosts.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'approved ohne erlaubten Zielhost: dann gibt es nichts zu verlinken.',
          path: ['allowedLinkHosts'],
        });
      }
      if (wert.allowedPlacements.length === 0) {
        ctx.addIssue({
          code: 'custom',
          message: 'approved ohne erlaubte Platzierung: dann darf der Hinweis nirgends stehen.',
          path: ['allowedPlacements'],
        });
      }
      if (wert.landingUrl === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'approved ohne Zieladresse: ein Hinweis ohne Ziel ist kein Hinweis.',
          path: ['landingUrl'],
        });
      } else {
        // Das Ziel muss auf einem der vertraglich erlaubten Hosts liegen und
        // über https erreichbar sein. Sonst ist es kein zugelassenes Ziel.
        let ziel: URL | null = null;
        try {
          ziel = new URL(wert.landingUrl);
        } catch {
          ziel = null;
        }
        if (ziel === null || ziel.protocol !== 'https:') {
          ctx.addIssue({
            code: 'custom',
            message: 'Zieladresse muss https sein.',
            path: ['landingUrl'],
          });
        } else if (!wert.allowedLinkHosts.includes(ziel.host)) {
          ctx.addIssue({
            code: 'custom',
            message: `Zielhost ${ziel.host} steht nicht in allowedLinkHosts.`,
            path: ['landingUrl'],
          });
        }
      }
    } else if (wert.approval !== null) {
      ctx.addIssue({
        code: 'custom',
        message: `Vertragsnachweis bei Status "${wert.status}": ein Nachweis ohne Zulassung ist ein Widerspruch.`,
        path: ['approval'],
      });
    }
  });
export type PartnerProgram = z.infer<typeof PartnerProgramSchema>;

export const PartnerRegistrySchema = z
  .object({
    /** Fachgebiet dieser Datei, etwa `insurance`. */
    domain: z.string().min(1),
    programs: z.array(PartnerProgramSchema),
  })
  .strict()
  .refine(
    (wert) => new Set(wert.programs.map((p) => p.programId)).size === wert.programs.length,
    { message: 'Programmkennungen müssen eindeutig sein.', path: ['programs'] },
  );
export type PartnerRegistry = z.infer<typeof PartnerRegistrySchema>;
