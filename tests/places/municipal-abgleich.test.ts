// M11-05 — Widersprüche werden benannt, nicht aufgelöst; Schweigen ist keine Erlaubnis.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  belegteHundeerlaubnis,
  gleicheAb,
  imGeltungsbereich,
  punktInFlaeche,
} from '../../scripts/normalize/municipal.ts';
import { MunicipalSnapshotSchema, type MunicipalArea } from '../../src/domain/schemas/municipal.ts';
import { PlaceSchema, type Place } from '../../src/domain/schemas/places.ts';

/** Quadrat von (13.00, 52.00) bis (13.01, 52.01). */
const QUADRAT: [number, number][] = [
  [13.0, 52.0],
  [13.01, 52.0],
  [13.01, 52.01],
  [13.0, 52.01],
  [13.0, 52.0],
];

function flaeche(overrides: Partial<MunicipalArea> = {}): MunicipalArea {
  return {
    areaId: 'berlin-hundefreilauf:test-1',
    sourceId: 'berlin-hundefreilauf-wfs',
    municipality: 'Berlin',
    district: 'Testbezirk',
    kind: 'dog_off_leash',
    name: 'Testfläche',
    address: null,
    responsible: null,
    note: null,
    statedAt: '2024-07-17',
    representativePoint: { latitude: 52.005, longitude: 13.005 },
    boundingBox: [13.0, 52.0, 13.01, 52.01],
    outline: [QUADRAT],
    ...overrides,
  };
}

function ort(overrides: Partial<Place> = {}): Place {
  return PlaceSchema.parse({
    placeId: 'osm:way:1',
    name: 'Testwiese',
    category: 'dog_park',
    coordinates: { latitude: 52.005, longitude: 13.005 },
    coordinateSource: 'way_centroid',
    municipality: 'Berlin',
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

describe('Punkt in Fläche', () => {
  it('erkennt einen Punkt innerhalb und außerhalb', () => {
    expect(punktInFlaeche({ latitude: 52.005, longitude: 13.005 }, flaeche())).toBe(true);
    expect(punktInFlaeche({ latitude: 52.02, longitude: 13.005 }, flaeche())).toBe(false);
  });

  it('behandelt einen Innenring als Loch', () => {
    const loch: [number, number][] = [
      [13.004, 52.004],
      [13.006, 52.004],
      [13.006, 52.006],
      [13.004, 52.006],
      [13.004, 52.004],
    ];
    const mitLoch = flaeche({ outline: [QUADRAT, loch] });
    expect(punktInFlaeche({ latitude: 52.005, longitude: 13.005 }, mitLoch)).toBe(false);
    expect(punktInFlaeche({ latitude: 52.002, longitude: 13.002 }, mitLoch)).toBe(true);
  });

  it('kennt den Geltungsbereich der Quelle', () => {
    expect(imGeltungsbereich({ latitude: 52.005, longitude: 13.005 }, [flaeche()])).toBe(true);
    expect(imGeltungsbereich({ latitude: 48.1, longitude: 11.6 }, [flaeche()])).toBe(false);
    expect(imGeltungsbereich({ latitude: 52.005, longitude: 13.005 }, [])).toBe(false);
  });
});

describe('Abgleich', () => {
  it('bestätigt eine Hundewiese, die die Verwaltung ausweist', () => {
    const ergebnis = gleicheAb([ort()], [flaeche()]);
    expect(ergebnis.zaehler.bestaetigt).toBe(1);
    expect(ergebnis.zuordnungen[0]?.areaId).toBe('berlin-hundefreilauf:test-1');
  });

  it('nennt einen Widerspruch als Widerspruch, statt eine Seite zu löschen', () => {
    const ergebnis = gleicheAb([ort()], [flaeche({ kind: 'dog_prohibited' })]);
    expect(ergebnis.zaehler.widerspruch).toBe(1);
    expect(ergebnis.zuordnungen[0]?.begruendung).toContain('bleibt sichtbar');
  });

  it('macht aus Schweigen der Verwaltung keinen Widerspruch', () => {
    const daneben = ort({
      placeId: 'osm:way:2',
      coordinates: { latitude: 52.015, longitude: 13.005 },
    });
    const ergebnis = gleicheAb([daneben], [flaeche()]);
    expect(ergebnis.zaehler.unbestaetigt).toBe(1);
    expect(ergebnis.zaehler.widerspruch).toBe(0);
    const offen = ergebnis.zuordnungen.find((z) => z.art === 'unbestaetigt');
    expect(offen?.begruendung).toContain('keine Aussage gegen');
  });

  it('lässt Orte außerhalb des Geltungsbereichs unbewertet', () => {
    const muenchen = ort({
      placeId: 'osm:way:3',
      coordinates: { latitude: 48.1, longitude: 11.6 },
    });
    const ergebnis = gleicheAb([muenchen], [flaeche()]);
    // Die kommunale Fläche bleibt als Zugewinn stehen; der Münchner Ort wird
    // gar nicht erst bewertet, weil die Quelle über ihn nichts sagen kann.
    expect(ergebnis.zuordnungen.filter((z) => z.placeId !== null)).toEqual([]);
    expect(ergebnis.zaehler.nur_kommunal).toBe(1);
  });

  it('vergleicht nur Hundewiesen, keine Praxen', () => {
    const praxis = ort({ placeId: 'osm:node:9', category: 'veterinary' });
    const ergebnis = gleicheAb([praxis], [flaeche({ kind: 'dog_prohibited' })]);
    expect(ergebnis.zaehler.widerspruch).toBe(0);
  });

  it('meldet eine kommunale Fläche, die OSM nicht führt', () => {
    const ergebnis = gleicheAb([], [flaeche()]);
    expect(ergebnis.zaehler.nur_kommunal).toBe(1);
  });

  it('meldet ein Verbotsgebiet ohne OSM-Gegenstück nicht als Zugewinn', () => {
    const ergebnis = gleicheAb([], [flaeche({ kind: 'dog_prohibited' })]);
    expect(ergebnis.zuordnungen).toEqual([]);
  });
});

describe('Belegte Hundeerlaubnis', () => {
  it('sagt ohne Beleg nichts', () => {
    const aussage = belegteHundeerlaubnis({ latitude: 52.02, longitude: 13.005 }, [flaeche()]);
    expect(aussage.erlaubt).toBeNull();
    expect(aussage.beleg).toBeNull();
  });

  it('setzt true nur bei ausdrücklicher Ausweisung, mit Beleg', () => {
    const aussage = belegteHundeerlaubnis({ latitude: 52.005, longitude: 13.005 }, [flaeche()]);
    expect(aussage.erlaubt).toBe(true);
    expect(aussage.beleg).toContain('berlin-hundefreilauf:test-1');
  });

  it('setzt false nur bei ausdrücklichem Verbot', () => {
    const aussage = belegteHundeerlaubnis({ latitude: 52.005, longitude: 13.005 }, [
      flaeche({ kind: 'dog_prohibited' }),
    ]);
    expect(aussage.erlaubt).toBe(false);
  });

  it('wertet zwei einander widersprechende Belege nicht als Beleg', () => {
    const aussage = belegteHundeerlaubnis({ latitude: 52.005, longitude: 13.005 }, [
      flaeche(),
      flaeche({ areaId: 'berlin-hundefreilauf:test-2', kind: 'dog_prohibited' }),
    ]);
    expect(aussage.erlaubt).toBeNull();
    expect(aussage.beleg).toContain('Widersprüchliche');
  });
});

describe('Echter Abgleich gegen die Ortsdaten', () => {
  const snapshot = MunicipalSnapshotSchema.parse(
    JSON.parse(readFileSync('data-snapshots/municipal/berlin-hundefreilauf.json', 'utf8')),
  );
  const orte = (
    JSON.parse(readFileSync('data-snapshots/places/places-de.json', 'utf8')) as { places: Place[] }
  ).places;
  const ergebnis = gleicheAb(orte, snapshot.areas);

  it('bestätigt mindestens ein Dutzend Aussagen und erfindet keine', () => {
    expect(ergebnis.zaehler.bestaetigt).toBeGreaterThan(0);
    expect(ergebnis.zaehler.nur_kommunal).toBeGreaterThan(0);
    const summe = Object.values(ergebnis.zaehler).reduce((a, b) => a + b, 0);
    expect(summe).toBe(ergebnis.zuordnungen.length);
  });

  it('ordnet keine Fläche außerhalb Berlins zu', () => {
    for (const zuordnung of ergebnis.zuordnungen) {
      if (zuordnung.areaId === null) continue;
      const flaeche = snapshot.areas.find((a) => a.areaId === zuordnung.areaId);
      expect(flaeche?.municipality).toBe('Berlin');
    }
  });

  it('leitet für keine bestätigte Fläche eine Erlaubnis ohne Beleg ab', () => {
    for (const zuordnung of ergebnis.zuordnungen) {
      if (zuordnung.art !== 'bestaetigt') continue;
      const ort = orte.find((o) => o.placeId === zuordnung.placeId);
      const aussage = belegteHundeerlaubnis(ort!.coordinates, snapshot.areas);
      expect(aussage.erlaubt).toBe(true);
      expect(aussage.beleg).not.toBeNull();
    }
  });

  it('lässt unbestätigte Hundewiesen ohne Aussage', () => {
    for (const zuordnung of ergebnis.zuordnungen) {
      if (zuordnung.art !== 'unbestaetigt') continue;
      const ort = orte.find((o) => o.placeId === zuordnung.placeId);
      expect(belegteHundeerlaubnis(ort!.coordinates, snapshot.areas).erlaubt).toBeNull();
    }
  });
});
