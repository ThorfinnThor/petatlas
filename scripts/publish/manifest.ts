/**
 * M06-05 — Ausgabemanifest.
 *
 * Das Manifest ist die kleine Datei, die der Browser zuerst lädt. Es darf
 * ausschließlich auf Dateien verweisen, die es **wirklich gibt** und deren
 * Inhalt zum eingetragenen Hash passt. Ein Manifest mit einem toten Verweis
 * ist schlimmer als gar keins: es lässt den Browser ins Leere laufen.
 *
 * Ebenfalls ausgeschlossen: eine gesammelte `all-data.json`.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import {
  ChunkEntrySchema,
  OutputManifestSchema,
  type ChunkEntry,
  type OutputManifest,
} from '../../src/domain/schemas/manifest.ts';
import { canonicalJson, type JsonValue } from '../normalize/canonical.ts';

export class ManifestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ManifestError';
  }
}

const VERBOTENE_DATEINAMEN = ['all-data.json', 'alldata.json', 'everything.json'];

export interface PublishableFile {
  /** Pfad wie im Manifest, beginnend mit /data/v1/. */
  readonly path: string;
  readonly content: string;
}

/** Schreibt die Dateien unter `outDir` und legt Verzeichnisse an. */
export function writeFiles(outDir: string, files: readonly PublishableFile[]): void {
  for (const datei of files) {
    const ziel = join(outDir, datei.path);
    mkdirSync(dirname(ziel), { recursive: true });
    writeFileSync(ziel, datei.content, 'utf8');
  }
}

/**
 * Baut das Manifest und prüft jeden Verweis gegen die tatsächlich
 * geschriebenen Dateien.
 */
export function buildManifest(options: {
  outDir: string;
  buildMode: 'development' | 'preview' | 'production';
  builtAt: string;
  chunks: readonly ChunkEntry[];
}): OutputManifest {
  const { outDir, buildMode, builtAt, chunks } = options;

  for (const chunk of chunks) {
    const eingetragen = ChunkEntrySchema.safeParse(chunk);
    if (!eingetragen.success) {
      throw new ManifestError(
        `Chunk ${chunk.chunkId} ist nicht schema-valide: ${eingetragen.error.message}`,
      );
    }

    const dateiname = chunk.path.split('/').pop() ?? '';
    if (VERBOTENE_DATEINAMEN.includes(dateiname)) {
      throw new ManifestError(
        `${dateiname} ist nicht zulässig: Daten werden nach Zweck geteilt, nicht gesammelt.`,
      );
    }

    const datei = join(outDir, chunk.path);
    if (!existsSync(datei)) {
      throw new ManifestError(`Manifest verweist auf ${chunk.path}, die Datei fehlt aber.`);
    }

    const inhalt = readFileSync(datei, 'utf8');
    const tatsaechlich = createHash('sha256').update(inhalt).digest('hex');
    if (tatsaechlich !== chunk.contentHash) {
      throw new ManifestError(`${chunk.path}: eingetragener Hash passt nicht zum Dateiinhalt.`);
    }
    if (Buffer.byteLength(inhalt, 'utf8') !== chunk.byteSize) {
      throw new ManifestError(`${chunk.path}: eingetragene Größe passt nicht zur Datei.`);
    }
  }

  const manifest = OutputManifestSchema.safeParse({
    manifestVersion: 1,
    builtAt,
    buildMode,
    chunks,
  });
  if (!manifest.success) {
    throw new ManifestError(`Manifest ist nicht schema-valide: ${manifest.error.message}`);
  }
  return manifest.data;
}

/** Schreibt das Manifest kanonisch, damit es deterministisch bleibt. */
export function writeManifest(outDir: string, manifest: OutputManifest): string {
  const pfad = join(outDir, 'data', 'v1', 'manifest.json');
  mkdirSync(dirname(pfad), { recursive: true });
  const inhalt = `${canonicalJson(manifest as unknown as JsonValue)}\n`;
  writeFileSync(pfad, inhalt, 'utf8');
  return pfad;
}
