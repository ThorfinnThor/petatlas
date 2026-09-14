/**
 * Dauerhafte Berichtigungen und Sperren für das öffentliche Verzeichnis.
 *
 * Die Quelldatei bleibt unverändert. Diese Regeln werden bei jeder
 * öffentlichen Ausgabe erneut angewendet, damit ein neuer OSM-Import eine
 * bestätigte Korrektur oder Entfernung nicht versehentlich zurücknimmt.
 * Die Konfiguration wird nicht veröffentlicht und darf keine Daten der
 * anfragenden Person enthalten.
 */
import { z } from 'zod';

import controlsJson from '../../../config/directory-controls.json' with { type: 'json' };
import { PlaceSchema, type Place } from '../../domain/schemas/places.ts';

const PlaceId = PlaceSchema.shape.placeId;
const CorrectionFields = PlaceSchema.omit({ placeId: true })
  .partial()
  .refine(
    (fields) => Object.keys(fields).length > 0,
    'Eine Berichtigung braucht mindestens ein geändertes Feld.',
  );

const DirectoryControl = z.discriminatedUnion('action', [
  z
    .object({
      placeId: PlaceId,
      action: z.literal('suppress'),
      decidedAt: z.iso.date(),
      reviewedBy: z.string().min(1),
      evidence: z.string().min(1),
    })
    .strict(),
  z
    .object({
      placeId: PlaceId,
      action: z.literal('correct'),
      decidedAt: z.iso.date(),
      reviewedBy: z.string().min(1),
      evidence: z.string().min(1),
      fields: CorrectionFields,
    })
    .strict(),
]);

export const DirectoryControlsSchema = z
  .object({
    $comment: z.string().optional(),
    entries: z.array(DirectoryControl),
  })
  .strict()
  .superRefine((value, context) => {
    const ids = new Set<string>();
    value.entries.forEach((entry, index) => {
      if (ids.has(entry.placeId)) {
        context.addIssue({
          code: 'custom',
          path: ['entries', index, 'placeId'],
          message: 'Je Eintrags-ID ist genau eine aktuelle Regel zulässig.',
        });
      }
      ids.add(entry.placeId);
    });
  });

export type DirectoryControls = z.infer<typeof DirectoryControlsSchema>;

const DIRECTORY_CONTROLS = DirectoryControlsSchema.parse(controlsJson);

/** Wendet alle bestätigten Regeln auf einen importierten Bestand an. */
export function applyDirectoryControls(
  places: readonly Place[],
  controls: DirectoryControls = DIRECTORY_CONTROLS,
): readonly Place[] {
  const byId = new Map(controls.entries.map((entry) => [entry.placeId, entry]));

  return places.flatMap((place) => {
    const control = byId.get(place.placeId);
    if (control?.action === 'suppress') return [];
    if (control?.action === 'correct') {
      return [PlaceSchema.parse({ ...place, ...control.fields })];
    }
    return [place];
  });
}

export function publicPlaceCount(places: readonly Place[]): number {
  return applyDirectoryControls(places).length;
}
