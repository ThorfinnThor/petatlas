// M11-01 — Filter, Sortierung und ehrliche Beschriftung.
import { describe, expect, it } from 'vitest';

import {
  RADIEN_METER,
  mengeMitLabel,
  filtereOrte,
  formatiereEntfernung,
  leereListeHinweis,
  notdienstHinweis,
  unbekanntHinweis,
  type ListenOrt,
} from '../../src/features/map/list.ts';

function ort(overrides: Partial<ListenOrt> = {}): ListenOrt {
  return {
    id: 'osm:node:1',
    name: 'Synthetische Praxis',
    category: 'veterinary',
    lat: 53.0758,
    lon: 8.8072,
    coordinateSource: 'node',
    municipality: 'Bremen',
    postalCode: '28195',
    phone: null,
    website: null,
    openingHours: null,
    emergency: null,
    wheelchair: null,
    fenced: null,
    dogAllowed: null,
    ...overrides,
  };
}

const MITTE = { latitude: 53.0758, longitude: 8.8072 };

describe('Filter', () => {
  it('behält nur Orte im Umkreis', () => {
    const nah = ort({ id: 'osm:node:1' });
    const fern = ort({ id: 'osm:node:2', lat: 48.1, lon: 11.6 });
    const treffer = filtereOrte([nah, fern], {
      mitte: MITTE,
      gemeinde: 'Bremen',
      radiusMeter: 5000,
      kategorien: [],
    });
    expect(treffer.map((t) => t.ort.id)).toEqual(['osm:node:1']);
  });

  it('behandelt eine leere Kategorienauswahl als alle Kategorien', () => {
    const orte = [ort({ id: 'osm:node:1' }), ort({ id: 'osm:node:2', category: 'pet_shop' })];
    expect(
      filtereOrte(orte, { mitte: MITTE, gemeinde: 'Bremen', radiusMeter: 5000, kategorien: [] }),
    ).toHaveLength(2);
  });

  it('filtert nach ausgewählten Kategorien', () => {
    const orte = [ort({ id: 'osm:node:1' }), ort({ id: 'osm:node:2', category: 'pet_shop' })];
    const treffer = filtereOrte(orte, {
      mitte: MITTE,
      gemeinde: 'Bremen',
      radiusMeter: 5000,
      kategorien: ['pet_shop'],
    });
    expect(treffer.map((t) => t.ort.id)).toEqual(['osm:node:2']);
  });

  it('sortiert nach Entfernung und bleibt bei Gleichstand stabil', () => {
    const a = ort({ id: 'osm:node:b', lat: 53.08, lon: 8.81 });
    const b = ort({ id: 'osm:node:a', lat: 53.08, lon: 8.81 });
    const c = ort({ id: 'osm:node:c' });
    const treffer = filtereOrte([a, b, c], {
      mitte: MITTE,
      gemeinde: 'Bremen',
      radiusMeter: 5000,
      kategorien: [],
    });
    expect(treffer[0]?.ort.id).toBe('osm:node:c');
    expect(treffer.slice(1).map((t) => t.ort.id)).toEqual(['osm:node:a', 'osm:node:b']);
  });

  it('begrenzt die Trefferzahl', () => {
    const viele = Array.from({ length: 50 }, (_, i) => ort({ id: `osm:node:${i}` }));
    expect(
      filtereOrte(viele, {
        mitte: MITTE,
        gemeinde: 'Bremen',
        radiusMeter: 5000,
        kategorien: [],
        maxTreffer: 10,
      }),
    ).toHaveLength(10);
  });

  it('bietet nur dokumentierte Radien an', () => {
    expect(RADIEN_METER).toEqual([5000, 10000, 25000, 50000]);
  });
});

describe('Ehrliche Beschriftung', () => {
  it('unterscheidet „in“ und „im Umkreis von“', () => {
    const drinnen = filtereOrte([ort()], {
      mitte: MITTE,
      gemeinde: 'Bremen',
      radiusMeter: 5000,
      kategorien: [],
    });
    expect(drinnen[0]?.ortsLabel).toBe('in Bremen');
    expect(drinnen[0]?.istInGemeinde).toBe(true);

    const draussen = filtereOrte([ort({ municipality: 'Delmenhorst' })], {
      mitte: MITTE,
      gemeinde: 'Bremen',
      radiusMeter: 5000,
      kategorien: [],
    });
    expect(draussen[0]?.ortsLabel).toBe('im Umkreis von Bremen');
    expect(draussen[0]?.istInGemeinde).toBe(false);
  });

  it('kennzeichnet einen berechneten Punkt', () => {
    const flaeche = filtereOrte([ort({ coordinateSource: 'way_centroid' })], {
      mitte: MITTE,
      gemeinde: 'Bremen',
      radiusMeter: 5000,
      kategorien: [],
    });
    expect(flaeche[0]?.punktBerechnet).toBe(true);
  });

  it('sagt bei null Treffern, dass nichts erfasst ist', () => {
    const hinweis = leereListeHinweis('Bremen', 5000);
    expect(hinweis).toMatch(/ist nichts erfasst/);
    expect(hinweis).toMatch(/nicht, dass es dort nichts gibt/);
    expect(hinweis).toMatch(/nicht vollständig/);
  });

  it('nennt eine fehlende Angabe „nicht erfasst“', () => {
    expect(unbekanntHinweis('Öffnungszeiten')).toBe('Öffnungszeiten: nicht erfasst');
  });
});

describe('Notdienst wird nie zugesichert', () => {
  it('sagt bei einer Eintragung, dass sie keine Zusicherung ist', () => {
    const hinweis = notdienstHinweis(true);
    expect(hinweis).toMatch(/keine Zusicherung/);
    expect(hinweis).toMatch(/bitte anrufen/);
  });

  it('sagt bei unbekannt und bei nein gar nichts', () => {
    expect(notdienstHinweis(null)).toBeNull();
    expect(notdienstHinweis(false)).toBeNull();
  });
});

describe('Entfernungsangabe', () => {
  it('rundet unter einem Kilometer auf zehn Meter', () => {
    // Intl setzt zwischen Zahl und Einheit ein geschütztes Leerzeichen; für
    // den Vergleich wird jeder Leerraum vereinheitlicht.
    const ohneLeerraum = (wert: string) => wert.replace(/\s/g, ' ');
    expect(ohneLeerraum(formatiereEntfernung(1234))).toMatch(/1,2 km/);
    expect(ohneLeerraum(formatiereEntfernung(847))).toMatch(/850 m/);
  });
});

describe('Zählform', () => {
  it('setzt Einzahl und Mehrzahl richtig', () => {
    expect(mengeMitLabel(1, 'animal_shelter')).toBe('1 Tierheim');
    expect(mengeMitLabel(5, 'animal_shelter')).toBe('5 Tierheime');
    expect(mengeMitLabel(0, 'veterinary')).toBe('0 Tierarztpraxen');
  });

  it('erfindet für eine unbekannte Kategorie kein Wort', () => {
    expect(mengeMitLabel(3, 'raumstation')).toBe('3 raumstation');
  });
});
