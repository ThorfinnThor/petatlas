// M06-04 — Ein leerer oder kaputter Snapshot ersetzt keinen gültigen Stand.
import { mkdtempSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { DEFAULT_THRESHOLDS, diffSnapshots, mayPromote } from '../../scripts/ingest/diff.ts';
import { promoteOrQuarantine, readLiveSnapshot } from '../../scripts/ingest/quarantine.ts';
import type { SnapshotSummary } from '../../scripts/ingest/diff.ts';

const NOW = '2026-09-06T10:00:00.000Z';

function zusammenfassung(overrides: Partial<SnapshotSummary> = {}): SnapshotSummary {
  const ids = Array.from({ length: 100 }, (_, i) => `id-${i}`);
  return {
    sourceId: 'synthetische-quelle',
    contentHash: 'a'.repeat(64),
    recordCount: ids.length,
    sourceVersion: 'v1',
    recordIds: ids,
    fields: ['placeId', 'name', 'coordinates'],
    ...overrides,
  };
}

function arbeitsverzeichnis() {
  const wurzel = mkdtempSync(join(tmpdir(), 'quarantaene-'));
  return {
    wurzel,
    live: join(wurzel, 'live', 'places.json'),
    quarantine: join(wurzel, 'quarantine'),
  };
}

describe('Einordnung der Änderung', () => {
  const vorher = zusammenfassung();

  it('erkennt einen unveränderten Stand', () => {
    expect(diffSnapshots(vorher, zusammenfassung()).kind).toBe('unchanged');
  });

  it('erkennt einen ersten Snapshot ohne Vorgänger als Änderung', () => {
    expect(diffSnapshots(null, zusammenfassung()).kind).toBe('changed');
  });

  it('erkennt einen leeren Feed als verdächtig, auch ohne Vorgänger', () => {
    const leer = zusammenfassung({ recordCount: 0, recordIds: [] });
    expect(diffSnapshots(null, leer).kind).toBe('suspicious');
    expect(diffSnapshots(vorher, leer).kind).toBe('suspicious');
  });

  it('erkennt einen starken Rückgang als verdächtig', () => {
    const halbiert = zusammenfassung({
      contentHash: 'b'.repeat(64),
      recordCount: 50,
      recordIds: vorher.recordIds.slice(0, 50),
    });
    const ergebnis = diffSnapshots(vorher, halbiert);
    expect(ergebnis.kind).toBe('suspicious');
    expect(ergebnis.summary).toMatch(/100 auf 50/);
  });

  it('lässt einen kleinen Rückgang durch', () => {
    const fastGleich = zusammenfassung({
      contentHash: 'b'.repeat(64),
      recordCount: 95,
      recordIds: vorher.recordIds.slice(0, 95),
    });
    expect(diffSnapshots(vorher, fastGleich).kind).toBe('changed');
  });

  it('wertet einen Rückgang bei sehr kleinen Beständen nicht als verdächtig', () => {
    const klein = zusammenfassung({ recordCount: 5, recordIds: ['a', 'b', 'c', 'd', 'e'] });
    const kleiner = zusammenfassung({
      contentHash: 'b'.repeat(64),
      recordCount: 3,
      recordIds: ['a', 'b', 'c'],
    });
    expect(diffSnapshots(klein, kleiner).kind).toBe('changed');
    expect(DEFAULT_THRESHOLDS.minRecordsForRatio).toBeGreaterThan(5);
  });

  it('erkennt eine neue Fassung der Quelle als prüfbedürftig', () => {
    const neueFassung = zusammenfassung({ contentHash: 'b'.repeat(64), sourceVersion: 'v2' });
    const ergebnis = diffSnapshots(vorher, neueFassung);
    expect(ergebnis.kind).toBe('suspicious');
    expect(ergebnis.summary).toMatch(/v1 → v2/);
  });

  it('erkennt fehlende Felder als strukturbrechend', () => {
    const ohneFeld = zusammenfassung({ contentHash: 'b'.repeat(64), fields: ['placeId', 'name'] });
    const ergebnis = diffSnapshots(vorher, ohneFeld);
    expect(ergebnis.kind).toBe('breaking');
    expect(ergebnis.summary).toMatch(/coordinates/);
  });

  it('lässt nur unveränderte und plausible Stände zur Übernahme zu', () => {
    expect(mayPromote('unchanged')).toBe(true);
    expect(mayPromote('changed')).toBe(true);
    expect(mayPromote('suspicious')).toBe(false);
    expect(mayPromote('breaking')).toBe(false);
  });
});

describe('Der letzte gültige Snapshot bleibt erhalten', () => {
  it('übernimmt einen plausiblen Stand', () => {
    const { live, quarantine } = arbeitsverzeichnis();
    const ergebnis = promoteOrQuarantine({
      sourceId: 'synthetische-quelle',
      livePath: live,
      quarantineDir: quarantine,
      nextContent: '{"places":[1]}',
      diff: diffSnapshots(null, zusammenfassung()),
      now: NOW,
    });

    expect(ergebnis.promoted).toBe(true);
    expect(readLiveSnapshot(live)).toBe('{"places":[1]}');
  });

  it('überschreibt einen gültigen Stand nicht mit einem leeren Feed', () => {
    const { live, quarantine } = arbeitsverzeichnis();
    const guelt = '{"places":[1,2,3]}';

    promoteOrQuarantine({
      sourceId: 'synthetische-quelle',
      livePath: live,
      quarantineDir: quarantine,
      nextContent: guelt,
      diff: diffSnapshots(null, zusammenfassung()),
      now: NOW,
    });

    const leer = zusammenfassung({ contentHash: 'b'.repeat(64), recordCount: 0, recordIds: [] });
    const ergebnis = promoteOrQuarantine({
      sourceId: 'synthetische-quelle',
      livePath: live,
      quarantineDir: quarantine,
      nextContent: '{"places":[]}',
      diff: diffSnapshots(zusammenfassung(), leer),
      now: NOW,
    });

    expect(ergebnis.promoted).toBe(false);
    expect(readLiveSnapshot(live)).toBe(guelt);
  });

  it('legt den abgelehnten Stand samt Bericht in die Quarantäne', () => {
    const { live, quarantine } = arbeitsverzeichnis();
    const leer = zusammenfassung({ contentHash: 'b'.repeat(64), recordCount: 0, recordIds: [] });

    const ergebnis = promoteOrQuarantine({
      sourceId: 'synthetische-quelle',
      livePath: live,
      quarantineDir: quarantine,
      nextContent: '{"places":[]}',
      diff: diffSnapshots(zusammenfassung(), leer),
      now: NOW,
    });

    expect(ergebnis.quarantine).not.toBeNull();
    const dateien = readdirSync(quarantine);
    expect(dateien.some((name) => name.endsWith('.report.json'))).toBe(true);

    const bericht = JSON.parse(
      readFileSync(
        join(
          quarantine,
          dateien.find((n) => n.endsWith('.report.json'))!,
        ),
        'utf8',
      ),
    ) as { reason: string; diff: { kind: string } };
    expect(bericht.diff.kind).toBe('suspicious');
    expect(bericht.reason).toMatch(/leerer Feed|keinen einzigen Datensatz/);
  });

  it('legt auch einen strukturbrechenden Stand nur beiseite', () => {
    const { live, quarantine } = arbeitsverzeichnis();
    promoteOrQuarantine({
      sourceId: 'synthetische-quelle',
      livePath: live,
      quarantineDir: quarantine,
      nextContent: '{"places":[1]}',
      diff: diffSnapshots(null, zusammenfassung()),
      now: NOW,
    });

    const kaputt = zusammenfassung({ contentHash: 'c'.repeat(64), fields: ['placeId'] });
    const ergebnis = promoteOrQuarantine({
      sourceId: 'synthetische-quelle',
      livePath: live,
      quarantineDir: quarantine,
      nextContent: '{"anders":true}',
      diff: diffSnapshots(zusammenfassung(), kaputt),
      now: NOW,
    });

    expect(ergebnis.promoted).toBe(false);
    expect(readLiveSnapshot(live)).toBe('{"places":[1]}');
  });

  it('schreibt bei unverändertem Inhalt nicht neu', () => {
    const { live, quarantine } = arbeitsverzeichnis();
    promoteOrQuarantine({
      sourceId: 'synthetische-quelle',
      livePath: live,
      quarantineDir: quarantine,
      nextContent: '{"places":[1]}',
      diff: diffSnapshots(null, zusammenfassung()),
      now: NOW,
    });

    const ergebnis = promoteOrQuarantine({
      sourceId: 'synthetische-quelle',
      livePath: live,
      quarantineDir: quarantine,
      nextContent: '{"places":[1]}',
      diff: diffSnapshots(zusammenfassung(), zusammenfassung()),
      now: NOW,
    });

    expect(ergebnis.promoted).toBe(false);
    expect(ergebnis.reason).toMatch(/unverändert/);
    expect(existsSync(quarantine)).toBe(false);
  });
});
