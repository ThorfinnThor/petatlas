// M06-03 — Gleicher Eingang, gleiches Ergebnis. Laufmetadaten ausgenommen.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { createSyntheticPlacesAdapter } from '../scripts/ingest/adapters/synthetic-places.ts';
import type { FetchedResource } from '../scripts/ingest/types.ts';
import {
  assertUniqueKeys,
  canonicalJson,
  canonicalize,
  contentHashOf,
  sortStable,
  stripRunMetadata,
  type JsonValue,
} from '../scripts/normalize/canonical.ts';
import { normalizePlaces } from '../scripts/normalize/places.ts';

const FIXTURE = readFileSync(new URL('../fixtures/places.de.sample.json', import.meta.url), 'utf8');

function ressource(inhalt: string, retrievedAt: string): FetchedResource {
  const body = new TextEncoder().encode(inhalt);
  return {
    sourceId: 'osm-geofabrik-germany-pbf',
    url: 'https://example.invalid/fixture.json',
    body,
    contentType: 'application/json',
    contentHash: createHash('sha256').update(body).digest('hex'),
    retrievedAt,
    etag: null,
    lastModified: null,
  };
}

function normalisiere(inhalt: string, retrievedAt: string) {
  const adapter = createSyntheticPlacesAdapter();
  const res = ressource(inhalt, retrievedAt);
  const geprueft = adapter.validate(adapter.normalize(adapter.parse(res), res));
  return normalizePlaces(geprueft.valid, {
    marketId: 'DE',
    sourceId: 'osm-geofabrik-germany-pbf',
    licenseId: 'ODbL-1.0',
    attribution: '© OpenStreetMap contributors, ODbL 1.0',
  });
}

describe('Kanonische Darstellung', () => {
  it('sortiert Objektschlüssel', () => {
    expect(canonicalJson({ b: 1, a: 2 } as JsonValue)).toBe('{"a":2,"b":1}');
  });

  it('erzeugt für unterschiedlich geschriebene, gleiche Objekte denselben Text', () => {
    const links = { a: { y: 2, x: 1 }, b: [3, 1] } as JsonValue;
    const rechts = { b: [3, 1], a: { x: 1, y: 2 } } as JsonValue;
    expect(canonicalJson(links)).toBe(canonicalJson(rechts));
  });

  it('lässt die Reihenfolge von Arrays unangetastet', () => {
    expect(canonicalJson([3, 1, 2] as JsonValue)).toBe('[3,1,2]');
  });

  it('erhält null als unbekannt', () => {
    expect(canonicalJson({ phone: null } as JsonValue)).toBe('{"phone":null}');
    expect(canonicalize({ phone: null } as JsonValue)).toEqual({ phone: null });
  });

  it('lehnt NaN und Infinity ab, statt sie zu null zu machen', () => {
    expect(() => canonicalize({ x: Number.NaN } as unknown as JsonValue)).toThrow(/NaN/);
    expect(() => canonicalize({ x: Number.POSITIVE_INFINITY } as unknown as JsonValue)).toThrow();
  });
});

describe('Laufmetadaten sind vom Inhalt getrennt', () => {
  it('entfernt sie rekursiv', () => {
    const eingang = {
      a: { retrievedAt: 'x', wert: 1 },
      liste: [{ runId: '1', wert: 2 }],
    } as JsonValue;
    expect(stripRunMetadata(eingang)).toEqual({ a: { wert: 1 }, liste: [{ wert: 2 }] });
  });

  it('lässt denselben Inhalt bei anderem Abrufzeitpunkt denselben Hash behalten', () => {
    const links = { wert: 1, retrievedAt: '2026-01-01T00:00:00Z' } as JsonValue;
    const rechts = { wert: 1, retrievedAt: '2026-09-09T00:00:00Z' } as JsonValue;
    expect(contentHashOf(links)).toBe(contentHashOf(rechts));
  });

  it('ändert den Hash, sobald sich ein Fachwert ändert', () => {
    expect(contentHashOf({ wert: 1 } as JsonValue)).not.toBe(
      contentHashOf({ wert: 2 } as JsonValue),
    );
  });
});

describe('Sortierung und Dubletten', () => {
  it('sortiert stabil nach Bytefolge, nicht nach Systemsprache', () => {
    const eingang = [{ id: 'b' }, { id: 'A' }, { id: 'a' }];
    expect(sortStable(eingang, (x) => x.id).map((x) => x.id)).toEqual(['A', 'a', 'b']);
  });

  it('verändert die Eingabe nicht', () => {
    const eingang = [{ id: 'b' }, { id: 'a' }];
    sortStable(eingang, (x) => x.id);
    expect(eingang.map((x) => x.id)).toEqual(['b', 'a']);
  });

  it('meldet doppelte Schlüssel, statt zu überschreiben', () => {
    expect(() => assertUniqueKeys([{ id: 'a' }, { id: 'a' }], (x) => x.id)).toThrow(/Doppelte/);
  });
});

describe('Zwei Läufe über dieselbe Eingabe', () => {
  const ersterLauf = normalisiere(FIXTURE, '2026-09-06T10:00:00.000Z');
  const zweiterLauf = normalisiere(FIXTURE, '2026-09-09T18:30:00.000Z');

  it('erzeugt denselben Inhalts-Hash', () => {
    expect(zweiterLauf.contentHash).toBe(ersterLauf.contentHash);
  });

  it('erzeugt dieselben Fachdaten', () => {
    expect(canonicalJson(zweiterLauf.places as unknown as JsonValue)).toBe(
      canonicalJson(ersterLauf.places as unknown as JsonValue),
    );
  });

  it('hält den Abrufzeitpunkt als getrennte Laufmetadaten fest', () => {
    expect(ersterLauf.retrievedAt).toBe('2026-09-06T10:00:00.000Z');
    expect(zweiterLauf.retrievedAt).toBe('2026-09-09T18:30:00.000Z');
    expect(zweiterLauf.retrievedAt).not.toBe(ersterLauf.retrievedAt);
  });

  it('hält die Provenienz je Datensatz, ohne den Abrufzeitpunkt darin', () => {
    const erste = Object.values(ersterLauf.provenance)[0];
    expect(erste?.sourceId).toBe('osm-geofabrik-germany-pbf');
    expect(erste).not.toHaveProperty('retrievedAt');
  });

  it('sortiert die Orte stabil nach ihrer ID', () => {
    const ids = ersterLauf.places.map((ort) => ort.placeId);
    expect(ids).toEqual([...ids].sort());
  });
});

describe('Eine andere Eingabereihenfolge ändert die Fachdaten nicht', () => {
  const daten = JSON.parse(FIXTURE) as { places: unknown[] };
  const vertauscht = JSON.stringify({ ...daten, places: [...daten.places].reverse() });

  const normal = normalisiere(FIXTURE, '2026-09-06T10:00:00.000Z');
  const gedreht = normalisiere(vertauscht, '2026-09-06T10:00:00.000Z');

  it('erzeugt dieselbe sortierte Ortsliste', () => {
    expect(canonicalJson(gedreht.places as unknown as JsonValue)).toBe(
      canonicalJson(normal.places as unknown as JsonValue),
    );
  });

  it('ändert dabei den Inhalts-Hash, weil die Quelldatei eine andere ist', () => {
    // Absicht, kein Fehler: die Provenienz führt den Hash der abgerufenen
    // Datei mit. Eine andere Datei ist eine andere Herkunft, auch wenn die
    // fachlichen Datensätze dieselben sind. Determinismus heißt „gleicher
    // Eingang, gleiches Ergebnis“ — nicht „verschiedene Eingänge, gleiches
    // Ergebnis“.
    expect(gedreht.contentHash).not.toBe(normal.contentHash);
  });

  it('führt für beide Läufe denselben Quelldatei-Hash je Datensatz', () => {
    const hashes = Object.values(gedreht.provenance).map((eintrag) => eintrag.contentHash);
    expect(new Set(hashes).size).toBe(1);
  });
});
