/**
 * M22-02 — Die Schemas des lokalen Speichers.
 *
 * Sie sind weiterhin die Wahrheit über Form und Regeln der gespeicherten
 * Daten. Sie stehen nur nicht mehr **im** Browsermodul: `zod` bringt 87 KiB
 * mit, und jede Seite mit Merkliste oder Profil hätte sie mitgeladen.
 *
 * Wer sie liest: die Tests und die Inhaltsprüfung. Wer sie nicht liest: der
 * Browser — dort steht die handgeschriebene Fassung in
 * `src/domain/runtime-guards.ts`, und `tests/runtime-guards.test.ts` hält
 * beide gegeneinander.
 *
 * Die Typgleichheit ist am Ende dieser Datei ausdrücklich behauptet und wird
 * von `astro check` geprüft. Läuft eine Seite der anderen davon, ist der
 * Typecheck rot — nicht erst die Wirklichkeit.
 */
import { z } from 'zod';

import { Coordinates } from '../../domain/schemas/common.ts';
import { PetProfileSchema } from '../../domain/schemas/profile.ts';
import { MAX_EINTRAEGE, type MerkEintrag, type Merkliste } from './favorites.ts';
import { EXPORT_FORMAT, EXPORT_VERSION, type ExportDatei } from './import-export.ts';
import type { PackStand } from './packing-state.ts';

export const MerkArtSchema = z.enum(['place', 'food']);

export const MerkEintragSchema = z
  .object({
    kind: MerkArtSchema,
    /** Stabile Kennung des Gegenstands, etwa `osm:node:1` oder eine foodId. */
    id: z.string().min(1).max(120),
    /** Nur bei Orten: Schlüssel zur Datenzelle, kein Inhalt. */
    coordinates: Coordinates.nullable(),
    addedAt: z.iso.datetime({ offset: true }),
  })
  .strict()
  .superRefine((wert, ctx) => {
    if (wert.kind === 'place' && wert.coordinates === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Ein gemerkter Ort braucht seine Koordinate, sonst ist er nicht wiederzufinden.',
        path: ['coordinates'],
      });
    }
  });

export const MerklisteSchema = z
  .object({
    version: z.literal(1),
    entries: z.array(MerkEintragSchema).max(MAX_EINTRAEGE),
  })
  .strict();

export const PackStandSchema = z
  .object({
    version: z.literal(1),
    /** Je Ziel die Kennungen der abgehakten Einträge. */
    ziele: z.record(
      z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
      z.array(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)).max(200),
    ),
    updatedAt: z.iso.datetime({ offset: true }),
  })
  .strict();

export const ExportSchema = z
  .object({
    format: z.literal(EXPORT_FORMAT),
    version: z.literal(EXPORT_VERSION),
    exportedAt: z.iso.datetime({ offset: true }),
    profile: PetProfileSchema.nullable(),
    interests: z.array(z.string()),
    favorites: MerklisteSchema.nullable(),
    packing: PackStandSchema.nullable(),
  })
  .strict();

/**
 * Typgleichheit in beide Richtungen. Fehlt im Schema ein Feld, das der Typ
 * hat, scheitert die erste Zeile; hat das Schema eines mehr, die zweite.
 */
type Schreibbar<T> = T extends readonly (infer E)[]
  ? Schreibbar<E>[]
  : T extends object
    ? { -readonly [K in keyof T]: Schreibbar<T[K]> }
    : T;
type Gleich<A, B> = [Schreibbar<A>] extends [Schreibbar<B>]
  ? [Schreibbar<B>] extends [Schreibbar<A>]
    ? true
    : false
  : false;
const _merkEintrag: Gleich<z.infer<typeof MerkEintragSchema>, MerkEintrag> = true;
const _merkliste: Gleich<z.infer<typeof MerklisteSchema>, Merkliste> = true;
const _packStand: Gleich<z.infer<typeof PackStandSchema>, PackStand> = true;
const _export: Gleich<z.infer<typeof ExportSchema>, ExportDatei> = true;
void _merkEintrag;
void _merkliste;
void _packStand;
void _export;
