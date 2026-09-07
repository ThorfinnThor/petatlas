// M14-01 — Zubehör ja, Wirkversprechen nein.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { TaxonomySchema } from '../../src/domain/schemas/taxonomy.ts';
import {
  alleKategorien,
  attributErlaubt,
  ausgeschlossen,
  kategorie,
  pflegeTaxonomie,
  spielzeugTaxonomie,
} from '../../src/features/care/taxonomy.ts';

describe('Taxonomiedateien', () => {
  for (const datei of ['care', 'toys']) {
    it(`${datei}.json entspricht dem Schema`, () => {
      const roh = JSON.parse(
        readFileSync(`content-data/taxonomy/${datei}.json`, 'utf8'),
      ) as unknown;
      expect(TaxonomySchema.safeParse(roh).success).toBe(true);
    });
  }

  it('haben eindeutige Kategoriekennungen über beide Dateien', () => {
    const ids = alleKategorien().map((eintrag) => eintrag.categoryId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('nennen zu jeder Kategorie die Attribute, nach denen gefiltert werden darf', () => {
    for (const eintrag of alleKategorien()) {
      expect(eintrag.matchAttributes.length, eintrag.categoryId).toBeGreaterThan(0);
      expect(eintrag.species.length, eintrag.categoryId).toBeGreaterThan(0);
    }
  });
});

describe('Grenzen des Gesundheitsbereichs', () => {
  const themen = ausgeschlossen().map((eintrag) => eintrag.topic.toLowerCase());

  it('schließt Arzneimittel, Supplemente und Tests ausdrücklich aus', () => {
    expect(themen.join(' ')).toContain('arzneimittel');
    expect(themen.join(' ')).toContain('nahrungsergänzung');
    expect(themen.join(' ')).toContain('tests');
    expect(themen.join(' ')).toContain('antiparasitika');
  });

  it('begründet jeden Ausschluss, statt ihn nur aufzuzählen', () => {
    for (const eintrag of ausgeschlossen()) {
      expect(eintrag.reason.length, eintrag.topic).toBeGreaterThan(30);
    }
  });

  it('führt keine Kategorie, die eine Behandlung nahelegt', () => {
    const verboten = /arznei|medikament|supplement|therapie|wirkstoff|heil|diagnos/;
    for (const eintrag of alleKategorien()) {
      expect(verboten.test(eintrag.categoryId), eintrag.categoryId).toBe(false);
      expect(verboten.test(eintrag.label.toLowerCase()), eintrag.label).toBe(false);
    }
  });

  it('verspricht in keiner Beschreibung eine Wirkung', () => {
    const verboten = /hilft gegen|lindert|heilt|beugt vor|unzerstörbar|garantiert/i;
    for (const eintrag of alleKategorien()) {
      expect(verboten.test(eintrag.description), eintrag.categoryId).toBe(false);
    }
  });
});

describe('Erlaubte Matchingattribute', () => {
  it('kennt die Attribute der Kategorie', () => {
    expect(attributErlaubt('fetch-toy', 'floats')).toBe(true);
    expect(attributErlaubt('mobility-aid', 'maxLoadKilograms')).toBe(true);
  });

  it('lässt kein fremdes Attribut zu', () => {
    // „Gut bei Gelenkproblemen“ ist kein Merkmal eines Kauspielzeugs.
    expect(attributErlaubt('chew-toy', 'jointSupport')).toBe(false);
    expect(attributErlaubt('grooming-brush', 'breed')).toBe(false);
  });

  it('lässt für eine unbekannte Kategorie gar nichts zu', () => {
    expect(attributErlaubt('gibt-es-nicht', 'material')).toBe(false);
    expect(kategorie('gibt-es-nicht')).toBeUndefined();
  });
});

describe('Zuschnitt', () => {
  it('deckt Pflege und Spielzeug mit je fünf Startkategorien ab', () => {
    expect(pflegeTaxonomie().categories.length).toBe(5);
    expect(spielzeugTaxonomie().categories.length).toBe(5);
  });

  it('führt Zahnpflege als Zubehör ohne Wirkstoff', () => {
    const zahn = kategorie('dental-care');
    expect(zahn?.description).toContain('ohne Wirkstoffe');
  });

  it('führt Kratzmöbel nur für Katzen und Mobilitätshilfen nur für Hunde', () => {
    expect(kategorie('scratching')?.species).toEqual(['cat']);
    expect(kategorie('mobility-aid')?.species).toEqual(['dog']);
  });
});
