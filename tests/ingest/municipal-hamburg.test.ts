// M20-03 — Die Hamburger Quelle wird nicht halb, nicht verschoben und nicht
// geraten übernommen.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  ANZAHL_SOURCE_ID,
  ART,
  PARSER_VERSION,
  SOURCE_ID,
  normalizeZonen,
  parseGeoJson,
  trefferzahl,
} from '../../scripts/ingest/adapters/municipal/hamburg-hundeauslaufzonen.ts';
import {
  KOMMUNALE_QUELLEN,
  ausserhalbDerHuelle,
  quelleOderFehler,
} from '../../scripts/ingest/municipal-sources.ts';
import { IngestError, type FetchedResource } from '../../scripts/ingest/types.ts';
import { MunicipalSnapshotSchema } from '../../src/domain/schemas/municipal.ts';

const FIXTURE = 'tests/fixtures/municipal/hamburg-hundeauslaufzonen.geojson';
const HITS = 'tests/fixtures/municipal/hamburg-hundeauslaufzonen-hits.xml';

function ressource(inhalt: string, sourceId = SOURCE_ID): FetchedResource {
  const body = new TextEncoder().encode(inhalt);
  return {
    sourceId,
    url: 'https://example.invalid/wfs',
    body,
    contentType: 'application/geo+json',
    contentHash: createHash('sha256').update(body).digest('hex'),
    retrievedAt: '2026-09-08T00:00:00+00:00',
    etag: null,
    lastModified: null,
  };
}

/** Ein Ring in Hamburg, damit die Hüllenprüfung etwas Echtes zu tun hat. */
const RING = [
  [9.91, 53.63],
  [9.911, 53.63],
  [9.911, 53.631],
  [9.91, 53.631],
  [9.91, 53.63],
];

function antwort(
  eigenschaften: Record<string, unknown> = {},
  feature: Record<string, unknown> = {},
): string {
  return JSON.stringify({
    type: 'FeatureCollection',
    features: [
      {
        id: 'DE.HH.UP_HUNDEAUSLAUFZONEN_PARAGRAF_8_1',
        srsName: 'EPSG:4326',
        geometry: { type: 'MultiPolygon', coordinates: [[RING]] },
        properties: {
          bezeichnung: 'Von-Herslo-Weg',
          belegenheit: 'Von-Herslo-Weg - Holsteiner Chaussee',
          ortsteilnummer: 319,
          flaeche_in_qm: '813.59',
          ...eigenschaften,
        },
        ...feature,
      },
    ],
  });
}

describe('Trefferzahl', () => {
  it('liest numberMatched aus der hits-Antwort', () => {
    expect(trefferzahl(ressource(readFileSync(HITS, 'utf8'), ANZAHL_SOURCE_ID))).toBe(140);
  });

  it('rät keine Zahl, wenn der Dienst keine nennt', () => {
    expect(() => trefferzahl(ressource('<wfs:FeatureCollection/>', ANZAHL_SOURCE_ID))).toThrow(
      IngestError,
    );
  });
});

describe('parseGeoJson', () => {
  it('übernimmt nichts, wenn weniger geliefert als gemeldet wird', () => {
    expect(() => parseGeoJson(ressource(antwort()), 140)).toThrow(/geschrumpfte Wirklichkeit/);
  });

  it('bricht bei einem anderen Bezugssystem ab, statt umzurechnen', () => {
    const falsch = ressource(antwort({}, { srsName: 'EPSG:25832' }));
    expect(() => parseGeoJson(falsch, 1)).toThrow(/nicht umgerechnet/);
  });

  it('lehnt eine Punktgeometrie ab, statt sie zu deuten', () => {
    const punkt = ressource(antwort({}, { geometry: { type: 'Point', coordinates: [9.9, 53.6] } }));
    expect(() => parseGeoJson(punkt, 1)).toThrow(/wird nicht unterstützt/);
  });

  it('nimmt die Ortsteilnummer als Zahl entgegen, ohne sie zu deuten', () => {
    const batch = parseGeoJson(ressource(antwort()), 1);
    expect(batch.records[0]?.ortsteilnummer).toBe('319');
  });
});

describe('normalizeZonen', () => {
  it('setzt die Art aus dem Datensatz, nicht aus einem Feld', () => {
    const roh = ressource(antwort());
    const ergebnis = normalizeZonen(parseGeoJson(roh, 1), roh);
    expect(ergebnis.records).toHaveLength(1);
    expect(ergebnis.records[0]?.record.kind).toBe(ART);
    expect(ART).toBe('dog_off_leash');
  });

  it('führt keine Ortsteilnummer als Bezirk und kein erfundenes Datum', () => {
    const roh = ressource(antwort());
    const flaeche = normalizeZonen(parseGeoJson(roh, 1), roh).records[0]?.record;
    expect(flaeche?.district).toBeNull();
    expect(flaeche?.statedAt).toBeNull();
  });

  it('lässt die Flächenzahl Text der Quelle bleiben', () => {
    const roh = ressource(antwort());
    const flaeche = normalizeZonen(parseGeoJson(roh, 1), roh).records[0]?.record;
    expect(flaeche?.note).toContain('813.59');
    // Die Belegenheit steht als Adresse da und wird nicht zusätzlich in die
    // Notiz kopiert.
    expect(flaeche?.address).toBe('Von-Herslo-Weg - Holsteiner Chaussee');
    expect(flaeche?.note).not.toContain('Holsteiner Chaussee');
  });

  it('trägt Lizenz und Parserstand in die Herkunft ein', () => {
    const roh = ressource(antwort());
    const herkunft = normalizeZonen(parseGeoJson(roh, 1), roh).records[0]?.provenance;
    expect(herkunft?.licenseId).toBe('dl-de/by-2-0');
    expect(herkunft?.normalizationVersion).toBe(PARSER_VERSION);
    expect(herkunft?.reviewStatus).toBe('unreviewed');
  });
});

describe('echte Quellantwort', () => {
  const roh = ressource(readFileSync(FIXTURE, 'utf8'));
  const erwartet = trefferzahl(ressource(readFileSync(HITS, 'utf8'), ANZAHL_SOURCE_ID));
  const ergebnis = normalizeZonen(parseGeoJson(roh, erwartet), roh);

  it('übernimmt alle gemeldeten Flächen', () => {
    expect(erwartet).toBe(140);
    expect(ergebnis.records).toHaveLength(140);
    expect(ergebnis.abgelehnt).toHaveLength(0);
  });

  it('legt keine Fläche außerhalb von Hamburg an', () => {
    const hamburg = quelleOderFehler(SOURCE_ID);
    const flaechen = ergebnis.records.map((eintrag) => eintrag.record);
    expect(ausserhalbDerHuelle(flaechen, hamburg.huelle)).toHaveLength(0);
  });

  it('vergibt eindeutige IDs', () => {
    const ids = new Set(ergebnis.records.map((eintrag) => eintrag.record.areaId));
    expect(ids.size).toBe(ergebnis.records.length);
  });
});

describe('Snapshot im Repository', () => {
  it('entspricht dem Schema und der Fixture-Menge', () => {
    const quelle = quelleOderFehler(SOURCE_ID);
    const geprueft = MunicipalSnapshotSchema.safeParse(
      JSON.parse(readFileSync(quelle.snapshotPfad, 'utf8')),
    );
    expect(geprueft.success).toBe(true);
    if (!geprueft.success) return;
    expect(geprueft.data.areaCount).toBe(140);
    expect(geprueft.data.byKind.dog_off_leash).toBe(140);
    expect(geprueft.data.source.licenseId).toBe('dl-de/by-2-0');
    // dl-de/by-2-0 verlangt die Namensnennung; ohne sie darf nichts gezeigt
    // werden.
    expect(geprueft.data.source.attribution).toContain('Hamburg');
  });
});

describe('Verzeichnis der kommunalen Quellen', () => {
  it('führt jede Quelle genau einmal, mit eigenem Snapshot und eigener Stadt', () => {
    const ids = KOMMUNALE_QUELLEN.map((quelle) => quelle.sourceId);
    const pfade = KOMMUNALE_QUELLEN.map((quelle) => quelle.snapshotPfad);
    const slugs = KOMMUNALE_QUELLEN.map((quelle) => quelle.stadtSlug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(pfade).size).toBe(pfade.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(ids.length).toBeGreaterThan(1);
  });

  it('meldet eine unbekannte Quelle, statt still nichts zu tun', () => {
    expect(() => quelleOderFehler('gibt-es-nicht')).toThrow(/Unbekannte kommunale Quelle/);
  });

  it('erkennt vertauschte Koordinaten an der Hülle', () => {
    const hamburg = quelleOderFehler(SOURCE_ID);
    const vertauscht = [
      {
        areaId: 'hamburg-hundeauslaufzonen:test',
        sourceId: SOURCE_ID,
        municipality: 'Hamburg',
        district: null,
        kind: 'dog_off_leash' as const,
        name: null,
        address: null,
        responsible: null,
        note: null,
        statedAt: null,
        // Länge und Breite verdreht: beides gültige Zahlen, aber Hamburg
        // liegt nicht bei 53° Ost.
        representativePoint: { latitude: 9.91, longitude: 53.63 },
        boundingBox: [53.63, 9.91, 53.64, 9.92] as [number, number, number, number],
        outline: [RING.map(([lon, lat]) => [lat, lon] as [number, number])],
      },
    ];
    expect(ausserhalbDerHuelle(vertauscht, hamburg.huelle)).toHaveLength(1);
  });
});
