// M06-01 — Die Adapter-API trennt die Schritte und hält Feature-Module heraus.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { createSyntheticPlacesAdapter } from '../../scripts/ingest/adapters/synthetic-places.ts';
import { IngestError, type FetchedResource } from '../../scripts/ingest/types.ts';

function ressource(inhalt: string): FetchedResource {
  const body = new TextEncoder().encode(inhalt);
  return {
    sourceId: 'osm-geofabrik-germany-pbf',
    url: 'https://example.invalid/fixture.json',
    body,
    contentType: 'application/json',
    contentHash: createHash('sha256').update(body).digest('hex'),
    retrievedAt: '2026-09-06T10:00:00+00:00',
    etag: null,
    lastModified: null,
  };
}

const FIXTURE = readFileSync(
  new URL('../../fixtures/places.de.sample.json', import.meta.url),
  'utf8',
);

describe('Die Schritte sind getrennt', () => {
  const adapter = createSyntheticPlacesAdapter();

  it('parst quellnah, ohne zu normalisieren', () => {
    const batch = adapter.parse(ressource(FIXTURE));
    expect(batch.records).toHaveLength(2);
    expect(batch.records[0]).toHaveProperty('city');
    expect(batch.records[0]).not.toHaveProperty('placeId');
  });

  it('normalisiert in das Fachschema und hängt Provenienz an', () => {
    const geparst = adapter.parse(ressource(FIXTURE));
    const normalisiert = adapter.normalize(geparst, ressource(FIXTURE));

    expect(normalisiert.records[0]?.record.placeId).toMatch(/^osm:node:\d+$/);
    expect(normalisiert.records[0]?.record.municipality).toBe('Musterstadt');
    expect(normalisiert.records[0]?.provenance.sourceId).toBe('osm-geofabrik-germany-pbf');
  });

  it('leitet die Freigabe nicht aus dem Abruf ab', () => {
    const res = ressource(FIXTURE);
    const normalisiert = adapter.normalize(adapter.parse(res), res);
    expect(normalisiert.records[0]?.provenance.reviewStatus).toBe('unreviewed');
    expect(normalisiert.records[0]?.provenance.reviewedAt).toBeNull();
  });

  it('trägt den Inhaltshash des Abrufs in jede Provenienz', () => {
    const res = ressource(FIXTURE);
    const normalisiert = adapter.normalize(adapter.parse(res), res);
    for (const eintrag of normalisiert.records) {
      expect(eintrag.provenance.contentHash).toBe(res.contentHash);
    }
  });

  it('validiert gegen das Fachschema und meldet Ausschüsse', () => {
    const res = ressource(FIXTURE);
    const ergebnis = adapter.validate(adapter.normalize(adapter.parse(res), res));
    expect(ergebnis.valid).toHaveLength(2);
    expect(ergebnis.rejected).toEqual([]);
  });
});

describe('Fehler sind zugeordnet und laut', () => {
  const adapter = createSyntheticPlacesAdapter();

  it('nennt Quelle und Schritt bei kaputtem JSON', () => {
    try {
      adapter.parse(ressource('{kein json'));
      throw new Error('hätte werfen müssen');
    } catch (fehler) {
      expect(fehler).toBeInstanceOf(IngestError);
      expect((fehler as IngestError).step).toBe('parse');
      expect((fehler as IngestError).sourceId).toBe('osm-geofabrik-germany-pbf');
    }
  });

  it('wirft, wenn die erwartete Struktur fehlt', () => {
    expect(() => adapter.parse(ressource('{"andere":[]}'))).toThrow(IngestError);
  });

  it('verwirft einen ungültigen Datensatz, statt ihn stillschweigend zu übernehmen', () => {
    const kaputt = JSON.stringify({
      places: [{ id: '1', name: 'X', city: 'Y', postalCode: '00000', latitude: 999, longitude: 0 }],
    });
    const res = ressource(kaputt);
    const ergebnis = adapter.validate(adapter.normalize(adapter.parse(res), res));
    expect(ergebnis.valid).toHaveLength(0);
    expect(ergebnis.rejected).toHaveLength(1);
    expect(ergebnis.rejected[0]?.index).toBe(0);
  });
});

describe('Ein Adapter kennt keine Feature-Module', () => {
  it('importiert weder Rechner, Karte noch Katalog', () => {
    const quelltext = readFileSync(
      new URL('../../scripts/ingest/adapters/synthetic-places.ts', import.meta.url),
      'utf8',
    );
    expect(quelltext).not.toMatch(/features\//);
    expect(quelltext).not.toMatch(/src\/pages/);
    expect(quelltext).not.toMatch(/src\/components/);
  });

  it('bezieht Rechte aus der Registry statt sie selbst zu setzen', () => {
    const adapter = createSyntheticPlacesAdapter();
    expect(adapter.source.rights.status).toBe('verified');
    expect(adapter.source.sourceId).toBe(adapter.sourceId);
  });
});
