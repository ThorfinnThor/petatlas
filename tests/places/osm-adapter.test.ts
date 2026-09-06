// M10-01 — OSM-Adapter gegen synthetische Rohobjekte.
//
// Der reale Pilotlauf über das Bremen-Extrakt ist in docs/OSM_PILOT.md
// festgehalten; diese Tests sind der reproduzierbare Teil und brauchen kein
// Netz und keine 21 MB.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  alsOrt,
  pruefeOrt,
  stabileId,
  type OsmRohObjekt,
} from '../../scripts/ingest/adapters/osm/index.ts';
import {
  alleKategorien,
  kategorieVon,
  kontaktVon,
  merkmaleVon,
  nameVon,
  triState,
} from '../../scripts/ingest/adapters/osm/tags.ts';

const FIXTURE = JSON.parse(
  readFileSync(new URL('../fixtures/osm/objekte.json', import.meta.url), 'utf8'),
) as { objekte: OsmRohObjekt[] };

function objekt(id: number): OsmRohObjekt {
  const gefunden = FIXTURE.objekte.find((eintrag) => eintrag.id === id);
  if (!gefunden) throw new Error(`Fixture ${id} fehlt`);
  return gefunden;
}

describe('Kategorien', () => {
  it('kennt die konfigurierten Kategorien', () => {
    expect(alleKategorien().map((k) => k.category)).toEqual([
      'veterinary',
      'animal_shelter',
      'pet_shop',
      'dog_park',
    ]);
  });

  it('erkennt Tierarzt, Tierheim, Zoofachhandel und Hundewiese', () => {
    expect(kategorieVon({ amenity: 'veterinary' })).toBe('veterinary');
    expect(kategorieVon({ amenity: 'animal_shelter' })).toBe('animal_shelter');
    expect(kategorieVon({ shop: 'pet' })).toBe('pet_shop');
    expect(kategorieVon({ leisure: 'dog_park' })).toBe('dog_park');
  });

  it('ignoriert alles andere, statt es einzusortieren', () => {
    expect(kategorieVon({ amenity: 'restaurant' })).toBeNull();
    expect(kategorieVon({})).toBeNull();
  });

  it('macht aus einer Tierarztpraxis keine Klinik und keinen Notdienst', () => {
    const praxis = alsOrt(objekt(1001));
    expect(praxis?.category).toBe('veterinary');
    // Ohne emergency-Tag bleibt der Notdienst unbekannt, nicht „nein“.
    expect(praxis?.emergency).toBeNull();
  });
});

describe('Tri-state: fehlend heißt unbekannt', () => {
  it('übernimmt nur eindeutige Werte', () => {
    expect(triState('yes')).toBe(true);
    expect(triState('designated')).toBe(true);
    expect(triState('no')).toBe(false);
  });

  it('behandelt unklare Werte als unbekannt', () => {
    for (const wert of ['limited', 'permissive', 'unknown', 'vielleicht', '']) {
      expect(triState(wert), wert).toBeNull();
    }
    expect(triState(undefined)).toBeNull();
  });

  it('setzt einen fehlenden Tag auf null statt auf false', () => {
    const merkmale = merkmaleVon({});
    expect(merkmale).toEqual({
      emergency: null,
      wheelchair: null,
      fenced: null,
      dogAllowed: null,
    });
  });

  it('liest wheelchair=limited nicht als false', () => {
    expect(alsOrt(objekt(1005))?.wheelchair).toBeNull();
  });

  it('erkennt einen ausdrücklichen Notdienst', () => {
    expect(alsOrt(objekt(1002))?.emergency).toBe(true);
  });

  it('liest barrier=fence als Umzäunung, sonst nichts', () => {
    expect(alsOrt(objekt(1004))?.fenced).toBe(true);
    expect(merkmaleVon({ barrier: 'hedge' }).fenced).toBeNull();
  });
});

describe('Kontaktdaten', () => {
  it('übernimmt nur die gelisteten Tags', () => {
    const ort = alsOrt(objekt(1001));
    expect(ort?.phone).toBe('+49 421 000000');
    expect(ort?.website).toBe('https://praxis.example/');
    expect(ort?.openingHours).toBe('Mo-Fr 09:00-17:00');
    expect(ort?.postalCode).toBe('28195');
    expect(ort?.municipality).toBe('Musterstadt');
  });

  it('verwirft eine Website ohne Schema, statt eine zu erfinden', () => {
    expect(kontaktVon({ website: 'example.de' }).website).toBeNull();
    expect(kontaktVon({ website: 'https://example.de' }).website).toBe('https://example.de');
  });

  it('verwirft eine unplausible Postleitzahl', () => {
    expect(kontaktVon({ 'addr:postcode': 'ABC' }).postalCode).toBeNull();
    expect(kontaktVon({ 'addr:postcode': '2819' }).postalCode).toBeNull();
  });

  it('übernimmt keine Betreiber- oder Bearbeiterangaben', () => {
    const kontakt = kontaktVon({
      operator: 'Synthetische Betreiber GmbH',
      email: 'privat@example.invalid',
      'contact:email': 'privat@example.invalid',
    });
    expect(JSON.stringify(kontakt)).not.toContain('example.invalid');
    expect(JSON.stringify(kontakt)).not.toContain('Betreiber');
  });

  it('lässt fehlende Angaben null, statt sie zu füllen', () => {
    const ort = alsOrt(objekt(1003));
    expect(ort?.phone).toBeNull();
    expect(ort?.website).toBeNull();
    expect(ort?.openingHours).toBeNull();
  });
});

describe('Stabile IDs', () => {
  it('setzt sich aus Typ und Quell-ID zusammen', () => {
    expect(stabileId('node', 12345)).toBe('osm:node:12345');
    expect(stabileId('way', 987)).toBe('osm:way:987');
  });

  it('entsteht nicht aus Name oder Adresse', () => {
    const ort = alsOrt(objekt(1001));
    expect(ort?.placeId).toBe('osm:node:1001');
    expect(ort?.placeId).not.toContain('Synthetische');
    expect(ort?.placeId).not.toContain('Musterstadt');
  });
});

describe('Nicht verwertbare Objekte', () => {
  it('nimmt ein Objekt ohne Namen nicht auf', () => {
    expect(nameVon(objekt(2002).tags ?? {})).toBeNull();
    expect(alsOrt(objekt(2002))).toBeNull();
    expect(pruefeOrt(objekt(2002)).grund).toBe('ohne Namen');
  });

  it('nimmt ein Objekt ohne Koordinaten nicht auf', () => {
    expect(alsOrt(objekt(2003))).toBeNull();
    expect(pruefeOrt(objekt(2003)).grund).toBe('ohne Geometrie');
  });

  it('verschiebt eine kaputte Koordinate nicht still, sondern lehnt sie ab', () => {
    // Null-Insel: das Fachschema weist sie zurück.
    expect(alsOrt(objekt(2004))).toBeNull();
    expect(pruefeOrt(objekt(2004)).grund).toMatch(/Fachschema abgelehnt/);
  });

  it('meldet ein uninteressantes Objekt ohne Grund, weil es kein Fehler ist', () => {
    expect(pruefeOrt(objekt(2001))).toEqual({ ort: null, grund: null });
  });

  it('nimmt einen Way ohne berechneten Punkt nicht als Ort auf', () => {
    // Die Auflösung der Geometrie ist M10-02.
    expect(alsOrt(objekt(3001))).toBeNull();
  });
});

describe('Vollständige Umwandlung', () => {
  it('erzeugt aus dem Fixture genau die verwertbaren Orte', () => {
    const orte = FIXTURE.objekte.map(alsOrt).filter((ort) => ort !== null);
    expect(orte.map((ort) => ort.placeId)).toEqual([
      'osm:node:1001',
      'osm:node:1002',
      'osm:node:1003',
      'osm:node:1004',
      'osm:node:1005',
    ]);
  });
});
