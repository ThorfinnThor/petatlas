// M10-05 — Räumliche Chunks, kleiner Index, sichere Projektion.
import { describe, expect, it } from 'vitest';

import {
  ZELLEN_GRAD,
  baueZellen,
  oeffentlicheProjektion,
  zelleVon,
} from '../../scripts/publish/places.ts';
import { PlaceSchema, type Place } from '../../src/domain/schemas/places.ts';

function ort(overrides: Partial<Place> = {}): Place {
  return PlaceSchema.parse({
    placeId: 'osm:node:1',
    name: 'Synthetischer Ort',
    category: 'veterinary',
    coordinates: { latitude: 53.1, longitude: 8.8 },
    coordinateSource: 'node',
    municipality: 'Musterstadt',
    postalCode: '28195',
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

describe('Räumliche Zellen', () => {
  it('legt einen Punkt in seine Zelle', () => {
    expect(zelleVon(53.1, 8.8)).toBe('53.0_8.5');
    expect(zelleVon(53.6, 9.1)).toBe('53.5_9.0');
  });

  it('legt nahe Punkte in dieselbe Zelle', () => {
    expect(zelleVon(53.01, 8.51)).toBe(zelleVon(53.49, 8.99));
  });

  it('trennt entfernte Punkte', () => {
    expect(zelleVon(53.1, 8.8)).not.toBe(zelleVon(48.1, 11.6));
  });

  it('behandelt negative Koordinaten korrekt', () => {
    expect(zelleVon(-0.2, -0.2)).toBe('-0.5_-0.5');
  });

  it('gruppiert Orte nach Zelle und zählt je Kategorie', () => {
    const zellen = baueZellen([
      ort({ placeId: 'osm:node:1' }),
      ort({ placeId: 'osm:node:2', category: 'pet_shop' }),
      ort({
        placeId: 'osm:node:3',
        coordinates: { latitude: 48.1, longitude: 11.6 },
      }),
    ]);
    expect(zellen).toHaveLength(2);
    const bremen = zellen.find((zelle) => zelle.key === '53.0_8.5');
    expect(bremen?.count).toBe(2);
    expect(bremen?.byCategory).toEqual({ veterinary: 1, pet_shop: 1 });
  });

  it('nennt für jede Zelle ihre Bounding Box', () => {
    const [zelle] = baueZellen([
      ort({ placeId: 'osm:node:1', coordinates: { latitude: 53.1, longitude: 8.6 } }),
      ort({ placeId: 'osm:node:2', coordinates: { latitude: 53.3, longitude: 8.9 } }),
    ]);
    expect(zelle?.bbox).toEqual([8.6, 53.1, 8.9, 53.3]);
  });

  it('sortiert Zellen und Orte stabil', () => {
    const zellen = baueZellen([
      ort({ placeId: 'osm:node:9', coordinates: { latitude: 48.1, longitude: 11.6 } }),
      ort({ placeId: 'osm:node:2' }),
      ort({ placeId: 'osm:node:1' }),
    ]);
    expect(zellen.map((zelle) => zelle.key)).toEqual(['48.0_11.5', '53.0_8.5']);
    expect(zellen[1]?.places.map((eintrag) => eintrag.id)).toEqual(['osm:node:1', 'osm:node:2']);
  });

  it('benutzt eine dokumentierte Zellengröße', () => {
    expect(ZELLEN_GRAD).toBe(0.5);
  });
});

describe('Öffentliche Projektion', () => {
  const projiziert = oeffentlicheProjektion(
    ort({ phone: '+49 421 1', emergency: null, wheelchair: true }),
  );

  it('gibt die vorgesehenen Felder aus', () => {
    expect(Object.keys(projiziert).sort()).toEqual([
      'category',
      'coordinateSource',
      'dogAllowed',
      'emergency',
      'fenced',
      'id',
      'lat',
      'lon',
      'municipality',
      'name',
      'openingHours',
      'phone',
      'postalCode',
      'website',
      'wheelchair',
    ]);
  });

  it('behält unbekannte Werte als null, statt sie wegzulassen', () => {
    expect(projiziert.emergency).toBeNull();
    expect('emergency' in projiziert).toBe(true);
  });

  it('nimmt kein Feld mit, das nicht aufgezählt ist', () => {
    const mitZusatz = { ...ort(), geheim: 'darf nicht raus' } as unknown as Place;
    expect(JSON.stringify(oeffentlicheProjektion(mitZusatz))).not.toContain('geheim');
  });

  it('behält die Koordinatenherkunft, damit ein berechneter Punkt erkennbar bleibt', () => {
    const flaeche = oeffentlicheProjektion(ort({ coordinateSource: 'way_centroid' }));
    expect(flaeche.coordinateSource).toBe('way_centroid');
  });
});
