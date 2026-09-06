/**
 * M03-04 — Ausgabemanifest.
 *
 * Das Manifest ist die kleine Datei, die der Browser zuerst lädt. Es nennt
 * IDs, Inhalts-Hashes, Größen und Gültigkeiten der Datenchunks. Es enthält
 * selbst keine Fachdaten und keine Zugangsdaten.
 */
import { z } from 'zod';

import { IsoTimestamp, MarketId, Period } from './common.ts';

/** Zielwerte des Projekts aus ARCHITECTURE Abschnitt 6. */
export const MAX_CHUNK_BYTES = 512 * 1024;
export const MAX_GEO_CHUNK_BYTES = 1024 * 1024;

export const ChunkKind = z.enum(['fees', 'places', 'travel', 'catalog', 'offers', 'sources']);

export const ChunkEntrySchema = z
  .object({
    chunkId: z.string().min(1),
    kind: ChunkKind,
    marketId: MarketId,
    path: z.string().regex(/^\/data\/v1\//, 'Datenpfade beginnen mit /data/v1/.'),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    byteSize: z.number().int().positive(),
    validity: Period,
    dependsOn: z.array(z.string()),
  })
  .strict()
  .superRefine((value, ctx) => {
    const limit = value.kind === 'places' ? MAX_GEO_CHUNK_BYTES : MAX_CHUNK_BYTES;
    if (value.byteSize > limit) {
      ctx.addIssue({
        code: 'custom',
        // Die Grenze wird nicht erhöht, sondern weiter geteilt.
        message: `Chunk ${value.chunkId} überschreitet ${limit} Byte; weiter teilen statt Grenze anheben.`,
        path: ['byteSize'],
      });
    }
    if (!value.path.includes(value.contentHash.slice(0, 8))) {
      ctx.addIssue({
        code: 'custom',
        message: 'Der Dateiname muss den Inhalts-Hash tragen, damit Caching sicher ist.',
        path: ['path'],
      });
    }
  });
export type ChunkEntry = z.infer<typeof ChunkEntrySchema>;

export const OutputManifestSchema = z
  .object({
    manifestVersion: z.literal(1),
    builtAt: IsoTimestamp,
    buildMode: z.enum(['development', 'preview', 'production']),
    chunks: z.array(ChunkEntrySchema),
  })
  .strict()
  .superRefine((value, ctx) => {
    const ids = new Set<string>();
    for (const chunk of value.chunks) {
      if (ids.has(chunk.chunkId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Chunk-ID ${chunk.chunkId} ist doppelt.`,
          path: ['chunks'],
        });
      }
      ids.add(chunk.chunkId);
    }
    for (const chunk of value.chunks) {
      for (const dependency of chunk.dependsOn) {
        if (!ids.has(dependency)) {
          ctx.addIssue({
            code: 'custom',
            message: `Chunk ${chunk.chunkId} verweist auf den unbekannten Chunk ${dependency}.`,
            path: ['chunks'],
          });
        }
      }
    }
  });
export type OutputManifest = z.infer<typeof OutputManifestSchema>;
