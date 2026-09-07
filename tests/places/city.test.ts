// M11-04 — Eine Stadtseite entsteht nur bei echtem lokalem Bestand.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { CityAllowlistSchema } from '../../src/domain/schemas/city.ts';
import {
  PFLICHT_KATEGORIEN,
  STADT_KRITERIEN,
  bewerteStadt,
  orteDerStadt,
  stadtSlug,
  waehleStaedte,
  type BewerteterKandidat,
} from '../../src/features/map/city.ts';
import type { ListenOrt } from '../../src/features/map/list.ts';

const STADT = {
  name: 'Beispielstadt',
  placeId: 'osm:node:1',
  latitude: 53.0758,
  longitude: 8.8072,
};

let laufendeId = 0;

/** Erzeugt einen Ort in der Nähe des Stadtpunkts. */
function ort(overrides: Partial<ListenOrt> = {}): ListenOrt {
  laufendeId += 1;
  return {
    id: `osm:node:${1000 + laufendeId}`,
    name: `Synthetischer Ort ${laufendeId}`,
    category: 'veterinary',
    lat: 53.0758 + laufendeId * 0.0001,
    lon: 8.8072,
    coordinateSource: 'node',
    municipality: 'Beispielstadt',
    postalCode: null,
    phone: '+49 421 000000',
    website: null,
    openingHours: null,
    emergency: null,
    wheelchair: null,
    fenced: null,
    dogAllowed: null,
    ...overrides,
  };
}

/** Bestand, der die Kriterien knapp erfüllt. */
function ausreichenderBestand(): ListenOrt[] {
  const orte: ListenOrt[] = [];
  for (let i = 0; i < STADT_KRITERIEN.minTierarztpraxen; i += 1) orte.push(ort());
  for (const kategorie of ['animal_shelter', 'pet_shop', 'dog_park']) {
    for (let i = 0; i < 5; i += 1) orte.push(ort({ category: kategorie }));
  }
  while (orte.length < STADT_KRITERIEN.minGesamt) orte.push(ort({ category: 'pet_shop' }));
  return orte;
}

describe('Slug', () => {
  it('schreibt Umlaute aus und bleibt pfadtauglich', () => {
    expect(stadtSlug('München')).toBe('muenchen');
    expect(stadtSlug('Köln')).toBe('koeln');
    expect(stadtSlug('Mülheim an der Ruhr')).toBe('muelheim-an-der-ruhr');
    expect(stadtSlug('Frankfurt am Main')).toBe('frankfurt-am-main');
  });

  it('verweigert einen Namen, aus dem kein Slug entsteht', () => {
    expect(() => stadtSlug('///')).toThrow();
  });
});

describe('Bewertung', () => {
  it('erkennt einen ausreichenden Bestand', () => {
    const befund = bewerteStadt(ausreichenderBestand(), STADT);
    expect(befund.geeignet).toBe(true);
    expect(befund.maengel).toEqual([]);
    expect(befund.gesamt).toBeGreaterThanOrEqual(STADT_KRITERIEN.minGesamt);
  });

  it('lehnt eine fehlende Kategorie ab statt sie leer zu zeigen', () => {
    const ohneTierheim = ausreichenderBestand().filter(
      (eintrag) => eintrag.category !== 'animal_shelter',
    );
    const befund = bewerteStadt(ohneTierheim, STADT);
    expect(befund.geeignet).toBe(false);
    expect(befund.maengel.join(' ')).toContain('animal_shelter');
  });

  it('lehnt ab, wenn zu wenige Einträge eine Kontaktangabe führen', () => {
    const ohneKontakt = ausreichenderBestand().map((eintrag) => ({ ...eintrag, phone: null }));
    const befund = bewerteStadt(ohneKontakt, STADT);
    expect(befund.geeignet).toBe(false);
    expect(befund.maengel.join(' ')).toContain('Kontaktangabe');
  });

  it('lehnt ab, wenn der Bestand nur im Umland liegt', () => {
    const nurUmland = ausreichenderBestand().map((eintrag) => ({
      ...eintrag,
      municipality: 'Nachbargemeinde',
    }));
    const befund = bewerteStadt(nurUmland, STADT);
    expect(befund.geeignet).toBe(false);
    expect(befund.maengel.join(' ')).toContain('in der Stadt selbst');
  });

  it('zählt nur Orte im Umkreis', () => {
    const weitWeg = ausreichenderBestand().map((eintrag) => ({ ...eintrag, lat: 48.1, lon: 11.6 }));
    const befund = bewerteStadt(weitWeg, STADT);
    expect(befund.gesamt).toBe(0);
    expect(befund.geeignet).toBe(false);
  });

  it('zählt ohne Anzeigegrenze', () => {
    const viele = [...ausreichenderBestand(), ...ausreichenderBestand()];
    expect(orteDerStadt(viele, STADT).length).toBe(viele.length);
  });

  it('gibt bei leerem Bestand keine Eignung zurück', () => {
    expect(bewerteStadt([], STADT).geeignet).toBe(false);
  });
});

describe('Auswahl', () => {
  function kandidat(name: string, gesamt: number, geeignet = true): BewerteterKandidat {
    return {
      stadt: { name, placeId: 'osm:node:9', latitude: 53, longitude: 8 },
      befund: {
        gesamt,
        jeKategorie: {},
        mitKontakt: gesamt,
        inGemeinde: gesamt,
        geeignet,
        maengel: geeignet ? [] : ['synthetisch'],
      },
    };
  }

  it('nimmt nur geeignete Städte und hält die Obergrenze ein', () => {
    const viele = Array.from({ length: 40 }, (_, i) => kandidat(`Stadt ${i}`, 100 - i));
    viele.push(kandidat('Ungeeignet', 999, false));
    const gewaehlt = waehleStaedte(viele);
    expect(gewaehlt.length).toBe(STADT_KRITERIEN.maxStaedte);
    expect(gewaehlt.map((eintrag) => eintrag.stadt.name)).not.toContain('Ungeeignet');
  });

  it('sortiert reproduzierbar, auch bei Gleichstand', () => {
    const a = waehleStaedte([kandidat('Bravo', 10), kandidat('Alpha', 10)]);
    const b = waehleStaedte([kandidat('Alpha', 10), kandidat('Bravo', 10)]);
    expect(a.map((eintrag) => eintrag.stadt.name)).toEqual(['Alpha', 'Bravo']);
    expect(b.map((eintrag) => eintrag.stadt.name)).toEqual(a.map((eintrag) => eintrag.stadt.name));
  });
});

describe('Ausgelieferte Allowlist', () => {
  const roh = JSON.parse(readFileSync('content-data/city-allowlist.json', 'utf8')) as unknown;
  const geprueft = CityAllowlistSchema.parse(roh);

  it('hält die eigene Obergrenze ein', () => {
    expect(geprueft.cities.length).toBeGreaterThan(0);
    expect(geprueft.cities.length).toBeLessThanOrEqual(STADT_KRITERIEN.maxStaedte);
  });

  it('nennt dieselben Kriterien wie der Code', () => {
    expect(geprueft.criteria).toEqual({ ...STADT_KRITERIEN });
  });

  it('führt zu jeder Stadt einen Eintrag in jeder Pflichtkategorie', () => {
    for (const stadt of geprueft.cities) {
      for (const kategorie of PFLICHT_KATEGORIEN) {
        expect(
          stadt.measured.byCategory[kategorie] ?? 0,
          `${stadt.name}/${kategorie}`,
        ).toBeGreaterThanOrEqual(STADT_KRITERIEN.minJeKategorie);
      }
    }
  });

  it('nutzt Slugs, die zum Namen passen und eindeutig sind', () => {
    const slugs = geprueft.cities.map((stadt) => stadt.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const stadt of geprueft.cities) expect(stadt.slug).toBe(stadtSlug(stadt.name));
  });

  it('leitet die Stadt-ID aus der Quelle ab, nicht aus dem Namen', () => {
    for (const stadt of geprueft.cities) expect(stadt.placeId).toMatch(/^osm:node:\d+$/);
  });
});
