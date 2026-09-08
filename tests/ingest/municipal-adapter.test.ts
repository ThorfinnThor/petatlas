// M11-05 — Der kommunale Adapter rät nicht und importiert nicht halb.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  PARSER_VERSION,
  SOURCE_ID,
  normalizeFlaechen,
  parseGeoJson,
} from '../../scripts/ingest/adapters/municipal/berlin-hundefreilauf.ts';
import { IngestError, type FetchedResource } from '../../scripts/ingest/types.ts';
import { MunicipalSnapshotSchema } from '../../src/domain/schemas/municipal.ts';

const FIXTURE = 'tests/fixtures/municipal/berlin-hundefreilauf.geojson';

function ressource(inhalt: string): FetchedResource {
  const body = new TextEncoder().encode(inhalt);
  return {
    sourceId: SOURCE_ID,
    url: 'https://example.invalid/wfs',
    body,
    contentType: 'application/json',
    contentHash: createHash('sha256').update(body).digest('hex'),
    retrievedAt: '2026-09-07T00:00:00+00:00',
    etag: null,
    lastModified: null,
  };
}

const RING = [
  [13.0, 52.0],
  [13.01, 52.0],
  [13.01, 52.01],
  [13.0, 52.01],
  [13.0, 52.0],
];

function antwort(
  overrides: Record<string, unknown> = {},
  eigenschaften: Record<string, unknown> = {},
) {
  return JSON.stringify({
    type: 'FeatureCollection',
    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::4326' } },
    numberMatched: 1,
    numberReturned: 1,
    features: [
      {
        id: 'hundefreilauf.1',
        geometry: { type: 'Polygon', coordinates: [RING] },
        properties: {
          typ: 'Hundefreilauf',
          bezirk: 'Testbezirk',
          bezeich: 'Testfläche',
          adresse: 'Teststraße 1',
          zustaendig: 'Testamt',
          info: '9186 m²',
          datum: '2024-07-17',
          ...eigenschaften,
        },
      },
    ],
    ...overrides,
  });
}

describe('Parsen', () => {
  it('nimmt eine vollständige Antwort in WGS84 an', () => {
    const batch = parseGeoJson(ressource(antwort()));
    expect(batch.records.length).toBe(1);
    expect(batch.records[0]?.typ).toBe('Hundefreilauf');
  });

  it('rechnet ein fremdes Bezugssystem nicht um, sondern bricht ab', () => {
    const fremd = antwort({ crs: { properties: { name: 'urn:ogc:def:crs:EPSG::25833' } } });
    expect(() => parseGeoJson(ressource(fremd))).toThrow(IngestError);
  });

  it('lehnt einen Teilimport ab', () => {
    expect(() => parseGeoJson(ressource(antwort({ numberMatched: 30 })))).toThrow(/30 Treffer/);
  });

  it('lehnt eine nicht unterstützte Geometrie ab, statt einen Punkt zu erfinden', () => {
    const punkt = JSON.parse(antwort()) as {
      features: { geometry: { type: string; coordinates: unknown } }[];
    };
    punkt.features[0]!.geometry = { type: 'Point', coordinates: [13, 52] };
    expect(() => parseGeoJson(ressource(JSON.stringify(punkt)))).toThrow(IngestError);
  });

  it('lehnt kaputtes JSON ab', () => {
    expect(() => parseGeoJson(ressource('{'))).toThrow(IngestError);
  });
});

describe('Normalisieren', () => {
  const res = ressource(antwort());

  it('übernimmt die Ausweisung, ohne sie zu deuten', () => {
    const ergebnis = normalizeFlaechen(parseGeoJson(res), res);
    const flaeche = ergebnis.records[0]?.record;
    expect(flaeche?.kind).toBe('dog_off_leash');
    expect(flaeche?.areaId).toBe('berlin-hundefreilauf:hundefreilauf.1');
    expect(flaeche?.name).toBe('Testfläche');
    expect(flaeche?.district).toBe('Testbezirk');
    expect(flaeche?.statedAt).toBe('2024-07-17');
  });

  it('macht aus dem Freitextfeld keine Zahl', () => {
    const ergebnis = normalizeFlaechen(parseGeoJson(res), res);
    expect(ergebnis.records[0]?.record.note).toBe('9186 m²');
    expect(Object.keys(ergebnis.records[0]?.record ?? {})).not.toContain('areaSquareMeters');
  });

  it('lehnt eine unbekannte Ausweisung ab, statt sie einzuordnen', () => {
    const unbekannt = ressource(antwort({}, { typ: 'Hundewiese vielleicht' }));
    const ergebnis = normalizeFlaechen(parseGeoJson(unbekannt), unbekannt);
    expect(ergebnis.records).toEqual([]);
    expect(ergebnis.abgelehnt[0]?.grund).toContain('Unbekannter typ');
  });

  it('führt Provenienz mit Lizenz und Parserfassung', () => {
    const ergebnis = normalizeFlaechen(parseGeoJson(res), res);
    const provenance = ergebnis.records[0]?.provenance;
    expect(provenance?.sourceId).toBe(SOURCE_ID);
    expect(provenance?.licenseId).toBe('dl-de/zero-2-0');
    expect(provenance?.normalizationVersion).toBe(PARSER_VERSION);
    expect(provenance?.reviewStatus).toBe('unreviewed');
    expect(provenance?.validTo).toBeNull();
  });

  it('behandelt fehlende Angaben als unbekannt, nicht als leeren Text', () => {
    const leer = ressource(antwort({}, { bezeich: '   ', adresse: null, info: null }));
    const flaeche = normalizeFlaechen(parseGeoJson(leer), leer).records[0]?.record;
    expect(flaeche?.name).toBeNull();
    expect(flaeche?.address).toBeNull();
    expect(flaeche?.note).toBeNull();
  });
});

describe('Echter Datensatz', () => {
  const roh = readFileSync(FIXTURE, 'utf8');
  const res = ressource(roh);
  const ergebnis = normalizeFlaechen(parseGeoJson(res), res);

  it('liest alle 30 Flächen der Berliner Abgabe', () => {
    expect(ergebnis.records.length).toBe(30);
    expect(ergebnis.abgelehnt).toEqual([]);
  });

  it('trennt Freilauf und Mitnahmeverbot', () => {
    const freilauf = ergebnis.records.filter((e) => e.record.kind === 'dog_off_leash');
    const verboten = ergebnis.records.filter((e) => e.record.kind === 'dog_prohibited');
    expect(freilauf.length).toBe(22);
    expect(verboten.length).toBe(8);
  });

  it('sortiert stabil nach areaId', () => {
    const ids = ergebnis.records.map((e) => e.record.areaId);
    expect([...ids].sort()).toEqual(ids);
  });

  it('erzeugt dieselben Flächen wie der Snapshot im Repository', () => {
    const snapshot = JSON.parse(
      readFileSync('data-snapshots/municipal/berlin-hundefreilauf.json', 'utf8'),
    ) as unknown;
    const geprueft = MunicipalSnapshotSchema.parse(snapshot);
    // Verglichen wird der **normalisierte** Datensatz. Der Hash der
    // Rohantwort taugt dafür nicht: der Dienst legt einen Zeitstempel in den
    // Antwortkörper, und nach einem frischen Abruf ist er ein anderer. Genau
    // daran ist der erste geplante Importlauf gescheitert — richtigerweise,
    // denn die Prüfung war zu streng, nicht der Datenstand falsch.
    expect(geprueft.areas).toEqual(ergebnis.records.map((e) => e.record));
    expect(geprueft.source.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it('nennt den Geltungsbereich im Snapshot', () => {
    const snapshot = MunicipalSnapshotSchema.parse(
      JSON.parse(readFileSync('data-snapshots/municipal/berlin-hundefreilauf.json', 'utf8')),
    );
    expect(snapshot.source.validity).toMatch(/nicht erfasst/);
    expect(snapshot.source.licenseId).toBe('dl-de/zero-2-0');
  });
});
