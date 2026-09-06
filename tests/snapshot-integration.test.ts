// M06-06 — Zwei gute Quellen und eine fehlerhafte. Der Snapshot ist entweder
// ganz da oder gar nicht. Alles hier ist synthetisch und läuft ohne Netz.
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { ChunkEntry } from '../src/domain/schemas/manifest.ts';
import { buildShards } from '../scripts/publish/shards.ts';
import {
  hasPublishedSnapshot,
  publishSnapshot,
  type SourceOutcome,
} from '../scripts/publish/pipeline.ts';

const ENVELOPE = {
  marketId: 'DE',
  licenseId: 'ODbL-1.0',
  attribution: '© OpenStreetMap contributors, ODbL 1.0',
};

function verzeichnisse() {
  const wurzel = mkdtempSync(join(tmpdir(), 'pipeline-'));
  return { live: join(wurzel, 'dist'), staging: join(wurzel, '.generated') };
}

function quelle(
  sourceId: string,
  basePath: string,
  kind: ChunkEntry['kind'],
  anzahl: number,
): SourceOutcome {
  const records = Array.from({ length: anzahl }, (_, i) => ({
    id: `${sourceId}-${String(i).padStart(4, '0')}`,
    wert: i,
  }));
  const shards = buildShards(records, (r) => r.id, {
    basePath,
    kind,
    envelope: { ...ENVELOPE, sourceId },
  });

  return {
    sourceId,
    ok: true,
    reason: 'ok',
    files: shards.map((s) => ({ path: s.path, content: s.content })),
    chunks: shards.map((s) => ({
      chunkId: s.shardId,
      kind,
      marketId: 'DE',
      path: s.path,
      contentHash: s.contentHash,
      byteSize: s.byteSize,
      validity: { from: '2026-01-01', until: null },
      dependsOn: [],
    })),
  };
}

const ORTE = quelle('synthetische-orte', 'places/de', 'places', 40);
const GEBUEHREN = quelle('synthetische-gebuehren', 'fees/de', 'fees', 25);

const GESCHEITERT: SourceOutcome = {
  sourceId: 'synthetische-kaputte-quelle',
  ok: false,
  reason: 'Leerer Feed in Quarantäne',
  files: [],
  chunks: [],
};

describe('Zwei erfolgreiche Quellen', () => {
  it('veröffentlicht beide gemeinsam', () => {
    const { live, staging } = verzeichnisse();
    const ergebnis = publishSnapshot({
      liveDir: live,
      stagingDir: staging,
      buildMode: 'development',
      builtAt: '2026-09-06T10:00:00+00:00',
      outcomes: [ORTE, GEBUEHREN],
    });

    expect(ergebnis.published).toBe(true);
    expect(hasPublishedSnapshot(live)).toBe(true);
    expect(existsSync(join(live, 'data', 'v1', 'places', 'de'))).toBe(true);
    expect(existsSync(join(live, 'data', 'v1', 'fees', 'de'))).toBe(true);
  });

  it('räumt das Arbeitsverzeichnis auf', () => {
    const { live, staging } = verzeichnisse();
    publishSnapshot({
      liveDir: live,
      stagingDir: staging,
      buildMode: 'development',
      builtAt: '2026-09-06T10:00:00+00:00',
      outcomes: [ORTE, GEBUEHREN],
    });
    expect(existsSync(staging)).toBe(false);
  });

  it('schreibt ein Manifest, das nur auf vorhandene Dateien verweist', () => {
    const { live, staging } = verzeichnisse();
    publishSnapshot({
      liveDir: live,
      stagingDir: staging,
      buildMode: 'development',
      builtAt: '2026-09-06T10:00:00+00:00',
      outcomes: [ORTE, GEBUEHREN],
    });

    const manifest = JSON.parse(
      readFileSync(join(live, 'data', 'v1', 'manifest.json'), 'utf8'),
    ) as { chunks: { path: string; contentHash: string }[] };

    expect(manifest.chunks.length).toBeGreaterThan(0);
    for (const chunk of manifest.chunks) {
      const datei = join(live, chunk.path);
      expect(existsSync(datei), chunk.path).toBe(true);
      const hash = createHash('sha256').update(readFileSync(datei, 'utf8')).digest('hex');
      expect(hash, chunk.path).toBe(chunk.contentHash);
    }
  });

  it('legt keine gesammelte Datei an', () => {
    const { live, staging } = verzeichnisse();
    publishSnapshot({
      liveDir: live,
      stagingDir: staging,
      buildMode: 'development',
      builtAt: '2026-09-06T10:00:00+00:00',
      outcomes: [ORTE, GEBUEHREN],
    });
    const dateien = readdirSync(join(live, 'data', 'v1'));
    expect(dateien).not.toContain('all-data.json');
  });
});

describe('Eine fehlerhafte Quelle verhindert den ganzen Stand', () => {
  it('veröffentlicht nichts, wenn eine von drei Quellen scheitert', () => {
    const { live, staging } = verzeichnisse();
    const ergebnis = publishSnapshot({
      liveDir: live,
      stagingDir: staging,
      buildMode: 'development',
      builtAt: '2026-09-06T10:00:00+00:00',
      outcomes: [ORTE, GEBUEHREN, GESCHEITERT],
    });

    expect(ergebnis.published).toBe(false);
    expect(ergebnis.failedSources).toEqual(['synthetische-kaputte-quelle']);
    expect(hasPublishedSnapshot(live)).toBe(false);
  });

  it('erzeugt keine halben Datensätze', () => {
    const { live, staging } = verzeichnisse();
    publishSnapshot({
      liveDir: live,
      stagingDir: staging,
      buildMode: 'development',
      builtAt: '2026-09-06T10:00:00+00:00',
      outcomes: [ORTE, GEBUEHREN, GESCHEITERT],
    });

    // Weder die erfolgreichen Orte noch die Gebühren dürfen einzeln liegen.
    expect(existsSync(join(live, 'data', 'v1', 'places'))).toBe(false);
    expect(existsSync(join(live, 'data', 'v1', 'fees'))).toBe(false);
  });

  it('nennt die gescheiterte Quelle im Grund', () => {
    const { live, staging } = verzeichnisse();
    const ergebnis = publishSnapshot({
      liveDir: live,
      stagingDir: staging,
      buildMode: 'development',
      builtAt: '2026-09-06T10:00:00+00:00',
      outcomes: [ORTE, GESCHEITERT],
    });
    expect(ergebnis.reason).toContain('synthetische-kaputte-quelle');
    expect(ergebnis.reason).toContain('Leerer Feed');
  });

  it('lässt einen bereits veröffentlichten Stand unangetastet', () => {
    const { live, staging } = verzeichnisse();

    publishSnapshot({
      liveDir: live,
      stagingDir: staging,
      buildMode: 'development',
      builtAt: '2026-09-06T10:00:00+00:00',
      outcomes: [ORTE, GEBUEHREN],
    });
    const vorher = readFileSync(join(live, 'data', 'v1', 'manifest.json'), 'utf8');

    const ergebnis = publishSnapshot({
      liveDir: live,
      stagingDir: staging,
      buildMode: 'development',
      builtAt: '2026-09-09T10:00:00+00:00',
      outcomes: [ORTE, GEBUEHREN, GESCHEITERT],
    });

    expect(ergebnis.published).toBe(false);
    expect(readFileSync(join(live, 'data', 'v1', 'manifest.json'), 'utf8')).toBe(vorher);
  });
});

describe('Ein kaputter Verweis bricht ab, bevor etwas übernommen wird', () => {
  it('veröffentlicht nichts, wenn eine angekündigte Datei fehlt', () => {
    const { live, staging } = verzeichnisse();
    const ohneDatei: SourceOutcome = {
      ...ORTE,
      sourceId: 'quelle-ohne-datei',
      files: [],
    };

    const ergebnis = publishSnapshot({
      liveDir: live,
      stagingDir: staging,
      buildMode: 'development',
      builtAt: '2026-09-06T10:00:00+00:00',
      outcomes: [ohneDatei],
    });

    expect(ergebnis.published).toBe(false);
    expect(ergebnis.reason).toMatch(/die Datei fehlt/);
    expect(hasPublishedSnapshot(live)).toBe(false);
  });

  it('räumt auch nach einem Abbruch auf', () => {
    const { live, staging } = verzeichnisse();
    publishSnapshot({
      liveDir: live,
      stagingDir: staging,
      buildMode: 'development',
      builtAt: '2026-09-06T10:00:00+00:00',
      outcomes: [{ ...ORTE, files: [] }],
    });
    expect(existsSync(staging)).toBe(false);
  });
});
