// M10-02 — Geometrie, Koordinatenqualität und Dubletten.
import { describe, expect, it } from 'vitest';

import {
  besserer,
  fuehreZusammen,
  repraesentativerPunkt,
  zaehleJeKategorie,
} from '../../scripts/normalize/geometry.ts';
import { loeseGeometrienAuf, type OsmRohObjekt } from '../../scripts/ingest/adapters/osm/index.ts';
import { PlaceSchema, type Place } from '../../src/domain/schemas/places.ts';

function ort(overrides: Partial<Place> = {}): Place {
  return PlaceSchema.parse({
    placeId: 'osm:node:1',
    name: 'Synthetischer Ort',
    category: 'veterinary',
    coordinates: { latitude: 53.1, longitude: 8.8 },
    coordinateSource: 'node',
    municipality: null,
    postalCode: null,
    phone: null,
    website: null,
    openingHours: null,
    emergency: null,
    wheelchair: null,
    fenced: null,
    dogAllowed: null,
    ...overrides,
  });
}

describe('Repräsentativer Punkt', () => {
  it('mittelt die Stützpunkte', () => {
    expect(
      repraesentativerPunkt([
        { lat: 53, lon: 8 },
        { lat: 53.2, lon: 9 },
      ]),
    ).toEqual({
      latitude: 53.1,
      longitude: 8.5,
    });
  });

  it('rundet auf sieben Nachkommastellen, statt Genauigkeit zu behaupten', () => {
    const punkt = repraesentativerPunkt([
      { lat: 53.123456789, lon: 8.987654321 },
      { lat: 53.123456789, lon: 8.987654321 },
    ]);
    expect(String(punkt?.latitude).split('.')[1]?.length).toBeLessThanOrEqual(7);
  });

  it('ignoriert einzelne kaputte Stützpunkte', () => {
    const punkt = repraesentativerPunkt([
      { lat: 53, lon: 8 },
      { lat: Number.NaN, lon: 8 },
      { lat: 0, lon: 0 },
      { lat: 53.2, lon: 9 },
    ]);
    expect(punkt).toEqual({ latitude: 53.1, longitude: 8.5 });
  });

  it('gibt null zurück, statt einen Ersatzpunkt zu erfinden', () => {
    expect(repraesentativerPunkt([])).toBeNull();
    expect(repraesentativerPunkt([{ lat: 0, lon: 0 }])).toBeNull();
    expect(repraesentativerPunkt([{ lat: Number.NaN, lon: 8 }])).toBeNull();
    expect(repraesentativerPunkt([{ lat: 200, lon: 8 }])).toBeNull();
  });
});

describe('Defekte Geometrien werden nicht verschoben', () => {
  const flaeche: OsmRohObjekt = {
    type: 'way',
    id: 3001,
    refs: [1, 2, 3],
    tags: { leisure: 'dog_park', name: 'Synthetische Hundewiese' },
  };

  it('löst eine Fläche aus ihren Knoten auf', () => {
    const knoten = new Map([
      [1, { lat: 53.0, lon: 8.8 }],
      [2, { lat: 53.2, lon: 8.8 }],
      [3, { lat: 53.1, lon: 9.0 }],
    ]);
    const { places, ohneGeometrie } = loeseGeometrienAuf([flaeche], knoten);
    expect(ohneGeometrie).toEqual([]);
    expect(places[0]?.placeId).toBe('osm:way:3001');
    expect(places[0]?.coordinates.latitude).toBeCloseTo(53.1, 5);
  });

  it('kennzeichnet den berechneten Punkt als berechnet', () => {
    const knoten = new Map([[1, { lat: 53.0, lon: 8.8 }]]);
    const { places } = loeseGeometrienAuf([flaeche], knoten);
    expect(places[0]?.coordinateSource).toBe('way_centroid');
  });

  it('verwirft eine Fläche ohne auflösbare Knoten, statt sie zu platzieren', () => {
    const { places, ohneGeometrie } = loeseGeometrienAuf([flaeche], new Map());
    expect(places).toEqual([]);
    expect(ohneGeometrie).toEqual(['osm:way:3001']);
  });

  it('verwirft eine Fläche, deren Knoten alle kaputt sind', () => {
    const knoten = new Map([
      [1, { lat: 0, lon: 0 }],
      [2, { lat: Number.NaN, lon: 8 }],
    ]);
    const { places, ohneGeometrie } = loeseGeometrienAuf([flaeche], knoten);
    expect(places).toEqual([]);
    // Kein Punkt in der Mitte Deutschlands, kein Nullpunkt, gar nichts.
    expect(ohneGeometrie).toEqual(['osm:way:3001']);
  });

  it('arbeitet mit unvollständig auflösbaren Knoten weiter', () => {
    const knoten = new Map([[2, { lat: 53.5, lon: 8.5 }]]);
    const { places } = loeseGeometrienAuf([flaeche], knoten);
    expect(places[0]?.coordinates).toEqual({ latitude: 53.5, longitude: 8.5 });
  });

  it('unterscheidet Relation und Way in der Herkunft', () => {
    const relation: OsmRohObjekt = { ...flaeche, type: 'relation', id: 4001 };
    const knoten = new Map([[1, { lat: 53.0, lon: 8.8 }]]);
    expect(loeseGeometrienAuf([relation], knoten).places[0]?.coordinateSource).toBe(
      'relation_centroid',
    );
  });
});

describe('Überlappende Regionen erzeugen keine Doppelzählung', () => {
  it('führt dasselbe Objekt aus zwei Extrakten zusammen', () => {
    const ausBremen = ort({ placeId: 'osm:node:42' });
    const ausNiedersachsen = ort({ placeId: 'osm:node:42' });
    expect(fuehreZusammen([ausBremen, ausNiedersachsen])).toHaveLength(1);
  });

  it('zählt jede Quell-ID genau einmal je Kategorie', () => {
    const zaehler = zaehleJeKategorie([
      ort({ placeId: 'osm:node:1' }),
      ort({ placeId: 'osm:node:1' }),
      ort({ placeId: 'osm:node:2', category: 'pet_shop' }),
    ]);
    expect(zaehler).toEqual({ veterinary: 1, pet_shop: 1 });
  });

  it('führt nicht über Namen zusammen, sondern über die Quell-ID', () => {
    const links = ort({ placeId: 'osm:node:1', name: 'Praxis Nord' });
    const rechts = ort({ placeId: 'osm:node:2', name: 'Praxis Nord' });
    expect(fuehreZusammen([links, rechts])).toHaveLength(2);
  });

  it('bevorzugt die erfasste Koordinate vor dem berechneten Punkt', () => {
    const erfasst = ort({ placeId: 'osm:way:9', coordinateSource: 'node' });
    const berechnet = ort({ placeId: 'osm:way:9', coordinateSource: 'way_centroid' });
    expect(besserer(berechnet, erfasst).coordinateSource).toBe('node');
    expect(besserer(erfasst, berechnet).coordinateSource).toBe('node');
  });

  it('bevorzugt bei gleicher Herkunft den vollständigeren Datensatz', () => {
    const duenn = ort({ placeId: 'osm:node:7' });
    const voll = ort({ placeId: 'osm:node:7', phone: '+49 421 1', municipality: 'Bremen' });
    expect(besserer(duenn, voll).phone).toBe('+49 421 1');
    expect(besserer(voll, duenn).phone).toBe('+49 421 1');
  });

  it('bleibt bei Gleichstand deterministisch', () => {
    const links = ort({ placeId: 'osm:node:5', name: 'A' });
    const rechts = ort({ placeId: 'osm:node:5', name: 'B' });
    expect(besserer(links, rechts).name).toBe('A');
  });

  it('sortiert das Ergebnis stabil', () => {
    const ids = fuehreZusammen([
      ort({ placeId: 'osm:node:3' }),
      ort({ placeId: 'osm:node:1' }),
      ort({ placeId: 'osm:node:2' }),
    ]).map((eintrag) => eintrag.placeId);
    expect(ids).toEqual(['osm:node:1', 'osm:node:2', 'osm:node:3']);
  });
});
