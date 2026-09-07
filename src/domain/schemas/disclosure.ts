/**
 * M09-04 — Redaktionelle Hinweistexte zur Versicherung.
 *
 * Diese Texte sind **unsere** Aussagen, nicht die eines Anbieters. Sie liegen
 * getrennt von der Partnerkonfiguration, weil sie auch ohne Partner gelten
 * müssen: was diese Website nicht leistet, hängt nicht daran, ob gerade
 * jemand dafür zahlt.
 *
 * Deshalb trägt jeder Text ein `appliesWithoutPartner`-Kennzeichen. Ein Text,
 * der nur mit Partner erscheint, kann kein Verbraucherhinweis sein — er wäre
 * dann Teil der Werbung.
 */
import { z } from 'zod';

import { IsoDate } from './common.ts';
import { PartnerPlacement } from './partner.ts';

export const InsuranceDisclosureSchema = z
  .object({
    disclosureId: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Kleinbuchstaben und Bindestriche.'),
    /** Kurze Überschrift der Aussage, fett vorangestellt. */
    heading: z.string().min(1),
    /** Der Text selbst. Ein Absatz je Eintrag. */
    paragraphs: z.array(z.string().min(1)).min(1),
    /** Gilt dieser Hinweis auch, wenn es keinen Partner gibt? */
    appliesWithoutPartner: z.boolean(),
    /** Platzierungen, an denen der Hinweis erscheinen muss. Leer = überall. */
    placements: z.array(PartnerPlacement),
    /** Reihenfolge in der Anzeige. Kleinere Zahl zuerst. */
    order: z.number().int().nonnegative(),
    lastEditedAt: IsoDate,
    notes: z.array(z.string()),
  })
  .strict();
export type InsuranceDisclosure = z.infer<typeof InsuranceDisclosureSchema>;
