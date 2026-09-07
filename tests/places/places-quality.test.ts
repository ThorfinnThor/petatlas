// M10-06 — Die Qualitätsprüfung findet, was sie finden soll.
import { describe, expect, it } from 'vitest';

import { pruefeOrte } from '../../scripts/checks/places-quality.ts';
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

function fehler(orte: Place[]): string[] {
  return pruefeOrte(orte)
    .filter((befund) => befund.art === 'fehler')
    .map((befund) => befund.text);
}

describe('Die Prüfung meldet echte Mängel', () => {
  it('findet einen Ort außerhalb Deutschlands', () => {
    const ausland = ort({ coordinates: { latitude: 40.7, longitude: -74.0 } });
    expect(fehler([ausland]).join(' ')).toMatch(/außerhalb Deutschlands/);
  });

  it('findet doppelte Orts-IDs', () => {
    expect(fehler([ort(), ort()]).join(' ')).toMatch(/doppelte Orts-IDs/);
  });

  it('findet leere Strings, wo null stehen müsste', () => {
    const leer = { ...ort(), phone: '' } as Place;
    expect(fehler([leer]).join(' ')).toMatch(/leere Strings statt null/);
  });

  it('findet einen Ort ohne Namen', () => {
    const ohneNamen = { ...ort(), name: '   ' } as Place;
    expect(fehler([ohneNamen]).join(' ')).toMatch(/keinen Namen/);
  });

  it('meldet nichts bei sauberen Daten', () => {
    expect(fehler([ort(), ort({ placeId: 'osm:node:2' })])).toEqual([]);
  });
});

describe('Notdienst wird nie zugesichert', () => {
  it('nennt den Anteil und sagt, dass er nicht reicht', () => {
    const hinweise = pruefeOrte([ort(), ort({ placeId: 'osm:node:2', emergency: true })])
      .filter((befund) => befund.art === 'hinweis')
      .map((befund) => befund.text)
      .join(' ');
    expect(hinweise).toMatch(/1 von 2/);
    expect(hinweise).toMatch(/reicht das nicht/);
  });

  it('behandelt einen fehlenden Tag nicht als Notdienst', () => {
    const hinweise = pruefeOrte([ort()])
      .filter((befund) => befund.art === 'hinweis')
      .map((befund) => befund.text)
      .join(' ');
    expect(hinweise).toMatch(/0 von 1/);
  });
});
