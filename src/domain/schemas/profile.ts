/**
 * M03-04 — Lokales Tierprofil.
 *
 * Das Profil bleibt im Gerät des Nutzers. Es gibt kein Konto und keine
 * Übertragung. Deshalb enthält das Schema bewusst keine Kontaktdaten und
 * keine Freitextfelder, die versehentlich in Suchindex, Sitemap oder eine
 * Affiliate-Sub-ID geraten könnten.
 */
import { z } from 'zod';

import { IsoDate, Species } from './common.ts';

export const PetProfileSchema = z
  .object({
    /** Lokal vergeben. Keine serverseitige Kennung, kein Tracking. */
    profileId: z.uuid(),
    schemaVersion: z.literal(1),
    species: Species,
    /** Frei gewählter Rufname, nur zur Anzeige im eigenen Gerät. */
    displayName: z.string().min(1).max(40),
    /** `null` heißt unbekannt und wird nicht geschätzt. */
    birthDate: IsoDate.nullable(),
    weightGrams: z.number().int().positive().nullable(),
    /** Rasse als freie Angabe des Nutzers, keine medizinische Einordnung. */
    breed: z.string().max(60).nullable(),
  })
  .strict();
export type PetProfile = z.infer<typeof PetProfileSchema>;

// Der Speicherschlüssel liegt seit M22-02 in `../domain-rules.ts`.
export { PROFILE_STORAGE_KEY } from '../domain-rules.ts';
