/**
 * M03-03 — Provenienz.
 *
 * Jeder importierte fachliche Datensatz führt mit, woher er stammt, wann er
 * geholt wurde, unter welcher Lizenz er steht und ob ihn jemand fachlich
 * geprüft hat.
 *
 * Zwei Dinge werden hier bewusst auseinandergehalten:
 *
 * - **Abruf** (`retrievedAt`, `contentHash`) ist eine technische Tatsache. Ein
 *   erfolgreicher HTTP-Abruf, auch ein 304, sagt nichts über fachliche
 *   Richtigkeit.
 * - **Review** (`reviewedAt`, `reviewStatus`) ist eine menschliche Prüfung.
 *   Sie wird nie automatisch aus einem Abruf abgeleitet.
 *
 * `null` heißt unbekannt. Unbekannt wird nicht zu 0, „nein“, „kostenlos“,
 * „sicher“ oder „geeignet“.
 */
import { z } from 'zod';

/** Zeitpunkt als ISO-8601-Zeitstempel mit Zone. */
const IsoTimestamp = z.iso.datetime({ offset: true });

/** Kalenderdatum ohne Uhrzeit; siehe src/domain/dates.ts. */
const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Erwartet wird YYYY-MM-DD.');

export const ReviewStatus = z.enum(['unreviewed', 'approved', 'withdrawn']);
export type ReviewStatus = z.infer<typeof ReviewStatus>;

export const ProvenanceSchema = z
  .object({
    sourceId: z.string().min(1),
    sourceRecordId: z.string().min(1),
    /** Öffentliche Referenz. Ein Token in der URL wäre ein Secret-Leak. */
    sourceUrl: z.url(),
    retrievedAt: IsoTimestamp,
    sourceUpdatedAt: IsoTimestamp.nullable(),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/, 'Erwartet wird ein SHA-256 in Hex.'),
    licenseId: z.string().min(1),
    normalizationVersion: z.string().min(1),
    validFrom: IsoDate.nullable(),
    validTo: IsoDate.nullable(),
    /** Zeitpunkt der fachlichen Prüfung, nicht des HTTP-Abrufs. */
    reviewedAt: IsoTimestamp.nullable(),
    reviewStatus: ReviewStatus,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.validFrom && value.validTo && value.validTo < value.validFrom) {
      ctx.addIssue({ code: 'custom', message: 'validTo liegt vor validFrom.', path: ['validTo'] });
    }
    if (value.reviewStatus === 'approved' && value.reviewedAt === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'approved ohne reviewedAt: eine Freigabe braucht einen Prüfzeitpunkt.',
        path: ['reviewedAt'],
      });
    }
    if (/[?&](token|key|signature|sig|auth)=/i.test(value.sourceUrl)) {
      ctx.addIssue({
        code: 'custom',
        message:
          'sourceUrl enthält offenbar ein Zugangstoken und darf nicht veröffentlicht werden.',
        path: ['sourceUrl'],
      });
    }
  });

export type Provenance = z.infer<typeof ProvenanceSchema>;

export function parseProvenance(raw: unknown): Provenance {
  return ProvenanceSchema.parse(raw);
}

/** Ist der Datensatz fachlich freigegeben? Unbekannt ist nicht freigegeben. */
export function isReviewApproved(provenance: Provenance): boolean {
  return provenance.reviewStatus === 'approved' && provenance.reviewedAt !== null;
}

/**
 * Aktualisiert den Abrufzeitpunkt. Der Reviewstatus bleibt unberührt — ein
 * neuer Abruf ist keine neue fachliche Prüfung.
 */
export function withRetrieval(
  provenance: Provenance,
  retrievedAt: string,
  contentHash: string,
): Provenance {
  return ProvenanceSchema.parse({ ...provenance, retrievedAt, contentHash });
}
