/**
 * M08-04 — Veröffentlicht den GOT-Snapshot als Datendatei.
 *
 * Der Browser lädt zuerst das Manifest und daraus den Gebühren-Chunk. Der
 * Dateiname trägt den Inhalts-Hash, damit derselbe Stand denselben Namen
 * behält und Caching sicher ist.
 *
 * Die Datei wird nur geschrieben, wenn die Quelle für die öffentliche
 * JSON-Auslieferung freigegeben ist. Sie trägt ihre Provenienz und den
 * Pflichthinweis mit — nicht nur eine Seite daneben.
 *
 * Ausführen: `npm run build:fees` (läuft in `build:site` mit).
 */
import { readFileSync } from 'node:fs';

import { resolveBuildConfig } from '../../config/build.ts';
import { mayPublishAs } from '../../src/domain/publication-policy.ts';
import { requireSource } from '../../src/domain/source-registry.ts';
import type { ChunkEntry } from '../../src/domain/schemas/manifest.ts';
import { canonicalJson, type JsonValue } from '../normalize/canonical.ts';
import { buildShards } from './shards.ts';
import { buildManifest, writeFiles, writeManifest } from './manifest.ts';

const SNAPSHOT = 'data-snapshots/got/got-2022.json';
const OUT_DIR = 'dist';

interface Snapshot {
  readonly source: Record<string, unknown>;
  readonly itemCount: number;
  readonly items: readonly Record<string, unknown>[];
}

function main(): number {
  const build = resolveBuildConfig();
  const quelle = requireSource('got-2022-gesetze-im-internet');

  // Öffentliche JSON-Auslieferung ist eine eigene Erlaubnis.
  const entscheidung = mayPublishAs('public_open', quelle.rights, 'publicJsonDelivery');
  if (!entscheidung.allowed) {
    console.error(`Gebührendaten werden nicht ausgeliefert: ${entscheidung.reason}`);
    return 1;
  }

  const snapshot = JSON.parse(readFileSync(SNAPSHOT, 'utf8')) as Snapshot;
  if (snapshot.items.length === 0) {
    console.error('Snapshot enthält keine Positionen; es wird nichts geschrieben.');
    return 1;
  }

  const shards = buildShards(snapshot.items, (item) => String(item.officialItemId), {
    basePath: 'fees/de',
    kind: 'fees',
    envelope: {
      marketId: 'DE',
      sourceId: quelle.sourceId,
      licenseId: quelle.rights.licenseId,
      attribution: quelle.attributionText ?? quelle.resourceName,
      provenance: snapshot.source as unknown as JsonValue,
    },
  });

  const chunks: ChunkEntry[] = shards.map((shard) => ({
    chunkId: shard.shardId,
    kind: 'fees',
    marketId: 'DE',
    path: shard.path,
    contentHash: shard.contentHash,
    byteSize: shard.byteSize,
    validity: { from: '2022-08-15', until: null },
    dependsOn: [],
  }));

  writeFiles(
    OUT_DIR,
    shards.map((shard) => ({ path: shard.path, content: shard.content })),
  );

  const manifest = buildManifest({
    outDir: OUT_DIR,
    buildMode: build.mode,
    builtAt: new Date().toISOString(),
    chunks,
  });
  writeManifest(OUT_DIR, manifest);

  console.log(
    `Gebührendaten veröffentlicht: ${shards.length} Chunk(s), ${snapshot.items.length} Positionen, ` +
      `${shards.reduce((s, shard) => s + shard.byteSize, 0)} Byte.`,
  );
  void canonicalJson;
  return 0;
}

process.exit(main());
