/**
 * M06-06 — Atomare Veröffentlichung.
 *
 * Ein Snapshot ist entweder ganz da oder gar nicht. Scheitert ein einzelner
 * Import, wird **kein** Teilstand veröffentlicht: sonst zeigt die Website
 * neue Orte, aber alte Preise, oder ein HTML verweist auf einen Chunk, den
 * es nicht gibt.
 *
 * Umsetzung: erst wird alles in ein Staging-Verzeichnis geschrieben und
 * vollständig geprüft, dann in einem Schritt übernommen. Ein Fehler vorher
 * lässt den bisherigen Stand unangetastet.
 */
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import type { ChunkEntry } from '../../src/domain/schemas/manifest.ts';
import { buildManifest, writeFiles, writeManifest, type PublishableFile } from './manifest.ts';

export interface SourceOutcome {
  readonly sourceId: string;
  readonly ok: boolean;
  readonly reason: string;
  readonly files: readonly PublishableFile[];
  readonly chunks: readonly ChunkEntry[];
}

export interface PublishResult {
  readonly published: boolean;
  readonly reason: string;
  readonly failedSources: readonly string[];
  readonly publishedChunks: number;
}

/**
 * Veröffentlicht die Ergebnisse mehrerer Quellen gemeinsam.
 *
 * @param liveDir  Verzeichnis, das ausgeliefert wird.
 * @param stagingDir Arbeitsverzeichnis; wird bei Erfolg übernommen und
 *                   in jedem Fall aufgeräumt.
 */
export function publishSnapshot(options: {
  liveDir: string;
  stagingDir: string;
  buildMode: 'development' | 'preview' | 'production';
  builtAt: string;
  outcomes: readonly SourceOutcome[];
}): PublishResult {
  const { liveDir, stagingDir, buildMode, builtAt, outcomes } = options;

  const gescheitert = outcomes.filter((ergebnis) => !ergebnis.ok);
  if (gescheitert.length > 0) {
    return {
      published: false,
      reason:
        `${gescheitert.length} von ${outcomes.length} Quellen sind gescheitert. ` +
        'Es wird kein Teilstand veröffentlicht: ' +
        gescheitert.map((e) => `${e.sourceId} (${e.reason})`).join('; '),
      failedSources: gescheitert.map((e) => e.sourceId),
      publishedChunks: 0,
    };
  }

  rmSync(stagingDir, { recursive: true, force: true });
  mkdirSync(stagingDir, { recursive: true });

  try {
    const dateien = outcomes.flatMap((ergebnis) => ergebnis.files);
    const chunks = outcomes.flatMap((ergebnis) => ergebnis.chunks);

    writeFiles(stagingDir, dateien);
    // Das Manifest prüft jeden Verweis gegen die geschriebene Datei. Ein
    // Fehler hier bricht ab, bevor irgendetwas übernommen wird.
    const manifest = buildManifest({ outDir: stagingDir, buildMode, builtAt, chunks });
    writeManifest(stagingDir, manifest);

    // Übernahme in einem Schritt: erst jetzt sieht die Auslieferung etwas.
    const ziel = join(liveDir, 'data', 'v1');
    rmSync(ziel, { recursive: true, force: true });
    mkdirSync(join(liveDir, 'data'), { recursive: true });
    cpSync(join(stagingDir, 'data', 'v1'), ziel, { recursive: true });

    return {
      published: true,
      reason: `${chunks.length} Chunks aus ${outcomes.length} Quellen veröffentlicht.`,
      failedSources: [],
      publishedChunks: chunks.length,
    };
  } catch (fehler) {
    return {
      published: false,
      reason: `Veröffentlichung abgebrochen: ${(fehler as Error).message}`,
      failedSources: [],
      publishedChunks: 0,
    };
  } finally {
    rmSync(stagingDir, { recursive: true, force: true });
  }
}

/** Liegt unter `liveDir` ein vollständiger Stand mit Manifest? */
export function hasPublishedSnapshot(liveDir: string): boolean {
  return existsSync(join(liveDir, 'data', 'v1', 'manifest.json'));
}
