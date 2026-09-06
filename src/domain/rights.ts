/**
 * M03-03 — Rechte je Quelle und Ausgabeform.
 *
 * Rechte gelten für eine konkrete Ressource **und** eine konkrete Ausgabeform.
 * `commercialUse: true` allein erlaubt gar nichts: eine Anzeige im HTML, ein
 * öffentlich abrufbares JSON, ein Bild und ein Download sind vier
 * verschiedene Ausgabeformen mit vier getrennten Erlaubnissen.
 *
 * Alles ist fail-closed: `null` bedeutet ungeprüft und damit nicht erlaubt.
 */
import { z } from 'zod';

const IsoTimestamp = z.iso.datetime({ offset: true });

export const RightsStatus = z.enum(['pending', 'verified', 'rejected', 'expired']);
export type RightsStatus = z.infer<typeof RightsStatus>;

/** Die Ausgabeformen, die einzeln erlaubt sein müssen. */
export const OutputChannel = z.enum([
  /** Anzeige im ausgelieferten HTML. */
  'websiteDisplay',
  /** Öffentlich abrufbare JSON-Datei im Browserpfad. */
  'publicJsonDelivery',
  /** Ablage im öffentlichen Repository. */
  'publicRepository',
  /** Ausgabe von Bildern. */
  'images',
]);
export type OutputChannel = z.infer<typeof OutputChannel>;

export const SourceRightsSchema = z
  .object({
    sourceId: z.string().min(1),
    status: RightsStatus,
    licenseId: z.string().nullable(),
    licenseUrl: z.url().nullable(),
    commercialUse: z.boolean().nullable(),
    publicRedistribution: z.boolean().nullable(),
    websiteDisplay: z.boolean().nullable(),
    publicJsonDelivery: z.boolean().nullable(),
    publicRepository: z.boolean().nullable(),
    attributionRequired: z.boolean(),
    shareAlike: z.boolean(),
    imagesAllowed: z.boolean().nullable(),
    mayStoreHistory: z.boolean().nullable(),
    mayCacheOriginals: z.boolean().nullable(),
    termsHash: z.string().nullable(),
    checkedAt: IsoTimestamp.nullable(),
    /** Verweis auf den dokumentierten Prüfnachweis, etwa docs/reviews/…. */
    approvalEvidence: z.string().nullable(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.status === 'verified') {
      if (value.checkedAt === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'verified ohne checkedAt: eine Rechteprüfung braucht ein Datum.',
          path: ['checkedAt'],
        });
      }
      if (value.approvalEvidence === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'verified ohne approvalEvidence: eine Rechteprüfung braucht einen Nachweis.',
          path: ['approvalEvidence'],
        });
      }
      if (value.licenseId === null) {
        ctx.addIssue({
          code: 'custom',
          message: 'verified ohne licenseId: die geltende Lizenz muss benannt sein.',
          path: ['licenseId'],
        });
      }
    }
  });

export type SourceRights = z.infer<typeof SourceRightsSchema>;

export interface RightsDecision {
  readonly allowed: boolean;
  /** Klartextbegründung, auch für den erlaubten Fall. */
  readonly reason: string;
  /** Pflichthinweis, der bei erlaubter Ausgabe sichtbar sein muss. */
  readonly attribution: string | null;
}

const CHANNEL_FIELD: Record<OutputChannel, keyof SourceRights> = {
  websiteDisplay: 'websiteDisplay',
  publicJsonDelivery: 'publicJsonDelivery',
  publicRepository: 'publicRepository',
  images: 'imagesAllowed',
};

/**
 * Darf diese Quelle über diesen Kanal ausgegeben werden?
 *
 * Nur `status: 'verified'` **und** ein ausdrückliches `true` für genau diesen
 * Kanal erlauben die Ausgabe. Alles andere, insbesondere `null`, verbietet sie.
 */
export function mayPublish(rights: SourceRights, channel: OutputChannel): RightsDecision {
  if (rights.status !== 'verified') {
    return {
      allowed: false,
      reason: `Rechtestatus ist "${rights.status}", nicht "verified". Ungeprüfte Rechte erlauben keine Ausgabe.`,
      attribution: null,
    };
  }

  const value = rights[CHANNEL_FIELD[channel]];
  if (value !== true) {
    const state = value === null ? 'ungeprüft' : 'ausdrücklich untersagt';
    return {
      allowed: false,
      reason: `Ausgabeform "${channel}" ist ${state}. Unbekannt ist nicht erlaubt.`,
      attribution: null,
    };
  }

  if (rights.attributionRequired && rights.licenseId === null) {
    return {
      allowed: false,
      reason: 'Attribution ist verpflichtend, aber keine Lizenz benannt.',
      attribution: null,
    };
  }

  return {
    allowed: true,
    reason: `Ausgabeform "${channel}" ist für ${rights.sourceId} geprüft und erlaubt.`,
    attribution: rights.attributionRequired
      ? `${rights.sourceId} — ${rights.licenseId ?? 'Lizenz unbenannt'}`
      : null,
  };
}

/** Rechte, die für eine neue, noch ungeprüfte Quelle gelten. */
export function pendingRights(sourceId: string): SourceRights {
  return SourceRightsSchema.parse({
    sourceId,
    status: 'pending',
    licenseId: null,
    licenseUrl: null,
    commercialUse: null,
    publicRedistribution: null,
    websiteDisplay: null,
    publicJsonDelivery: null,
    publicRepository: null,
    attributionRequired: true,
    shareAlike: false,
    imagesAllowed: null,
    mayStoreHistory: null,
    mayCacheOriginals: null,
    termsHash: null,
    checkedAt: null,
    approvalEvidence: null,
  });
}
