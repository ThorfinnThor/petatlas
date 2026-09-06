// M06-05 — Keine all-data.json; das Manifest verweist nur auf echte Dateien.
import { createHash } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  ManifestError,
  buildManifest,
  writeFiles,
  writeManifest,
} from '../scripts/publish/manifest.ts';
import { ShardError, buildIndex, buildShards } from '../scripts/publish/shards.ts';
import { MAX_CHUNK_BYTES, MAX_GEO_CHUNK_BYTES } from '../src/domain/schemas/manifest.ts';
import type { ChunkEntry } from '../src/domain/schemas/manifest.ts';

const ENVELOPE = {
  marketId: 'DE',
  sourceId: 'osm-geofabrik-germany-pbf',
  licenseId: 'ODbL-1.0',
  attribution: '© OpenStreetMap contributors, ODbL 1.0',
};

function orte(anzahl: number) {
  return Array.from({ length: anzahl }, (_, i) => ({
    placeId: `osm:node:${String(i).padStart(6, '0')}`,
    name: `Beispielpraxis ${i} (synthetisch)`,
    latitude: 50 + i / 10000,
    longitude: 10 + i / 10000,
  }));
}

function chunkAus(shard: { path: string; contentHash: string; byteSize: number }): ChunkEntry {
  return {
    chunkId: shard.path,
    kind: 'places',
    marketId: 'DE',
    path: shard.path,
    contentHash: shard.contentHash,
    byteSize: shard.byteSize,
    validity: { from: '2026-01-01', until: null },
    dependsOn: [],
  };
}

describe('Aufteilung', () => {
  it('erzeugt einen Shard, wenn die Daten hineinpassen', () => {
    const shards = buildShards(orte(10), (o) => o.placeId, {
      basePath: 'places/de',
      kind: 'places',
      envelope: ENVELOPE,
    });
    expect(shards).toHaveLength(1);
    expect(shards[0]?.recordCount).toBe(10);
  });

  it('teilt weiter, statt das Budget zu überschreiten', () => {
    const shards = buildShards(orte(20000), (o) => o.placeId, {
      basePath: 'places/de',
      kind: 'places',
      envelope: ENVELOPE,
    });
    expect(shards.length).toBeGreaterThan(1);
    for (const shard of shards) {
      expect(shard.byteSize, shard.path).toBeLessThanOrEqual(MAX_GEO_CHUNK_BYTES);
    }
  });

  it('gibt nicht-geografischen Daten das kleinere Budget', () => {
    const shards = buildShards(orte(20000), (o) => o.placeId, {
      basePath: 'catalog/de',
      kind: 'catalog',
      envelope: ENVELOPE,
    });
    for (const shard of shards) {
      expect(shard.byteSize).toBeLessThanOrEqual(MAX_CHUNK_BYTES);
    }
  });

  it('trägt den Inhalts-Hash in den Dateinamen', () => {
    const [shard] = buildShards(orte(5), (o) => o.placeId, {
      basePath: 'places/de',
      kind: 'places',
      envelope: ENVELOPE,
    });
    expect(shard?.path).toContain(shard!.contentHash.slice(0, 8));
    expect(shard?.path.startsWith('/data/v1/places/de/')).toBe(true);
  });

  it('erzeugt für dieselbe Eingabe dieselben Shards', () => {
    const a = buildShards(orte(500), (o) => o.placeId, {
      basePath: 'places/de',
      kind: 'places',
      envelope: ENVELOPE,
    });
    const b = buildShards([...orte(500)].reverse(), (o) => o.placeId, {
      basePath: 'places/de',
      kind: 'places',
      envelope: ENVELOPE,
    });
    expect(b.map((s) => s.contentHash)).toEqual(a.map((s) => s.contentHash));
  });

  it('schreibt keinen leeren Shard', () => {
    expect(() =>
      buildShards([], (o: { placeId: string }) => o.placeId, {
        basePath: 'places/de',
        kind: 'places',
        envelope: ENVELOPE,
      }),
    ).toThrow(ShardError);
  });
});

describe('Index', () => {
  const shards = buildShards(orte(3000), (o) => o.placeId, {
    basePath: 'places/de',
    kind: 'places',
    envelope: ENVELOPE,
  });
  const index = buildIndex(shards, { basePath: 'places/de', kind: 'places', envelope: ENVELOPE });

  it('enthält nur Metadaten und Dateiverweise', () => {
    const inhalt = JSON.parse(index.content) as { shards: { path: string }[] };
    expect(inhalt.shards).toHaveLength(shards.length);
    expect(index.content).not.toContain('Beispielpraxis');
  });

  it('bleibt klein', () => {
    expect(index.byteSize).toBeLessThanOrEqual(MAX_CHUNK_BYTES);
  });
});

describe('Manifest', () => {
  function arbeitsverzeichnis() {
    return mkdtempSync(join(tmpdir(), 'manifest-'));
  }

  const shards = buildShards(orte(50), (o) => o.placeId, {
    basePath: 'places/de',
    kind: 'places',
    envelope: ENVELOPE,
  });

  it('akzeptiert Verweise auf tatsächlich geschriebene Dateien', () => {
    const outDir = arbeitsverzeichnis();
    writeFiles(
      outDir,
      shards.map((s) => ({ path: s.path, content: s.content })),
    );

    const manifest = buildManifest({
      outDir,
      buildMode: 'development',
      builtAt: '2026-09-06T10:00:00+00:00',
      chunks: shards.map(chunkAus),
    });
    expect(manifest.chunks).toHaveLength(shards.length);

    const pfad = writeManifest(outDir, manifest);
    expect(readFileSync(pfad, 'utf8')).toContain('"manifestVersion":1');
  });

  it('lehnt einen Verweis auf eine fehlende Datei ab', () => {
    const outDir = arbeitsverzeichnis();
    expect(() =>
      buildManifest({
        outDir,
        buildMode: 'development',
        builtAt: '2026-09-06T10:00:00+00:00',
        chunks: shards.map(chunkAus),
      }),
    ).toThrow(/die Datei fehlt/);
  });

  it('lehnt einen Verweis ab, dessen Hash nicht zum Inhalt der Datei passt', () => {
    const outDir = arbeitsverzeichnis();
    writeFiles(
      outDir,
      shards.map((s) => ({ path: s.path, content: s.content })),
    );

    // Datei nach dem Erzeugen verändert: Pfad und eingetragener Hash sind in
    // sich stimmig, der Inhalt auf der Platte ist es nicht mehr.
    writeFileSync(join(outDir, shards[0]!.path), '{"manipuliert":true}', 'utf8');

    expect(() =>
      buildManifest({
        outDir,
        buildMode: 'development',
        builtAt: '2026-09-06T10:00:00+00:00',
        chunks: shards.map(chunkAus),
      }),
    ).toThrow(/Hash passt nicht/);
  });

  it('lehnt einen Hash ab, der nicht zum Dateinamen passt', () => {
    const outDir = arbeitsverzeichnis();
    writeFiles(
      outDir,
      shards.map((s) => ({ path: s.path, content: s.content })),
    );

    const manipuliert = shards
      .map(chunkAus)
      .map((chunk, index) => (index === 0 ? { ...chunk, contentHash: 'f'.repeat(64) } : chunk));
    expect(() =>
      buildManifest({
        outDir,
        buildMode: 'development',
        builtAt: '2026-09-06T10:00:00+00:00',
        chunks: manipuliert,
      }),
    ).toThrow(/nicht schema-valide/);
  });

  it('lehnt eine falsche Größenangabe ab', () => {
    const outDir = arbeitsverzeichnis();
    writeFiles(
      outDir,
      shards.map((s) => ({ path: s.path, content: s.content })),
    );

    const manipuliert = shards
      .map(chunkAus)
      .map((chunk, index) => (index === 0 ? { ...chunk, byteSize: chunk.byteSize + 1 } : chunk));
    expect(() =>
      buildManifest({
        outDir,
        buildMode: 'development',
        builtAt: '2026-09-06T10:00:00+00:00',
        chunks: manipuliert,
      }),
    ).toThrow(/Größe passt nicht/);
  });

  it('lehnt eine gesammelte all-data.json ab', () => {
    const outDir = arbeitsverzeichnis();
    const pfad = '/data/v1/places/de/all-data.json';
    const inhalt = '{"alles":true}';
    mkdirSync(dirname(join(outDir, pfad)), { recursive: true });
    writeFileSync(join(outDir, pfad), inhalt, 'utf8');

    const chunk: ChunkEntry = {
      chunkId: 'alles',
      kind: 'places',
      marketId: 'DE',
      path: pfad,
      contentHash: createHash('sha256').update(inhalt).digest('hex'),
      byteSize: Buffer.byteLength(inhalt),
      validity: { from: '2026-01-01', until: null },
      dependsOn: [],
    };

    expect(() =>
      buildManifest({
        outDir,
        buildMode: 'development',
        builtAt: '2026-09-06T10:00:00+00:00',
        chunks: [chunk],
      }),
    ).toThrow(ManifestError);
  });

  it('schreibt das Manifest kanonisch und damit deterministisch', () => {
    const outDir = arbeitsverzeichnis();
    writeFiles(
      outDir,
      shards.map((s) => ({ path: s.path, content: s.content })),
    );
    const manifest = buildManifest({
      outDir,
      buildMode: 'development',
      builtAt: '2026-09-06T10:00:00+00:00',
      chunks: shards.map(chunkAus),
    });

    const ersterPfad = writeManifest(outDir, manifest);
    const erster = readFileSync(ersterPfad, 'utf8');
    const zweiter = readFileSync(writeManifest(outDir, manifest), 'utf8');
    expect(zweiter).toBe(erster);
  });
});
