// M15-01 — Lebensphase und Futterart stehen auf dem Etikett, nicht im Namen.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  FoodProductSchema,
  NutrientValueSchema,
  gesamtmengeGramm,
  naehrwert,
} from '../../src/domain/schemas/food.ts';
import { TaxonomySchema } from '../../src/domain/schemas/taxonomy.ts';
import { futterTaxonomie } from '../../src/features/food/taxonomy.ts';

function futter(overrides: Record<string, unknown> = {}): unknown {
  return {
    foodId: 'synthetisch:futter-1',
    productId: 'awin:901:SYN-100',
    species: 'dog',
    brand: 'Beispielmarke',
    productName: 'Trockenfutter Junior 2 kg',
    gtin: null,
    lifeStage: null,
    kind: null,
    netContentGrams: 2000,
    packUnits: 1,
    nutrients: [],
    composition: null,
    declarationSourceUrl: null,
    declarationCheckedAt: null,
    ...overrides,
  };
}

function naehrstoff(overrides: Record<string, unknown> = {}): unknown {
  return {
    nutrient: 'protein',
    value: 22,
    unit: 'g',
    basis: 'as_fed_per_100g',
    sourceLabel: 'Etikett (synthetisch)',
    sourceUrl: 'https://beispiel.invalid/produkt',
    checkedAt: '2026-09-07',
    ...overrides,
  };
}

describe('Futterprodukt', () => {
  it('nimmt ein Produkt ohne Nährwerte an', () => {
    expect(FoodProductSchema.safeParse(futter()).success).toBe(true);
  });

  it('verlangt für Lebensphase und Futterart eine Fundstelle', () => {
    expect(FoodProductSchema.safeParse(futter({ lifeStage: 'puppy' })).success).toBe(false);
    expect(
      FoodProductSchema.safeParse(
        futter({
          lifeStage: 'puppy',
          declarationSourceUrl: 'https://beispiel.invalid/etikett',
          declarationCheckedAt: '2026-09-07',
        }),
      ).success,
    ).toBe(true);
  });

  it('lässt „Junior“ im Namen ohne Wirkung', () => {
    const geparst = FoodProductSchema.parse(futter());
    expect(geparst.productName).toContain('Junior');
    // Der Name ist Text, kein Beleg.
    expect(geparst.lifeStage).toBeNull();
  });

  it('lässt unbekannte Gebindegröße unbekannt', () => {
    const ohne = FoodProductSchema.parse(futter({ packUnits: null }));
    expect(ohne.packUnits).toBeNull();
    expect(gesamtmengeGramm(ohne)).toBeNull();
  });

  it('rechnet die Gesamtmenge nur bei vollständigen Angaben', () => {
    expect(gesamtmengeGramm(FoodProductSchema.parse(futter()))).toBe(2000);
    expect(
      gesamtmengeGramm(FoodProductSchema.parse(futter({ netContentGrams: 400, packUnits: 6 }))),
    ).toBe(2400);
    expect(gesamtmengeGramm(FoodProductSchema.parse(futter({ netContentGrams: null })))).toBeNull();
  });

  it('lässt keinen Nährstoff zweimal zu', () => {
    const doppelt = futter({ nutrients: [naehrstoff(), naehrstoff()] });
    expect(FoodProductSchema.safeParse(doppelt).success).toBe(false);
  });
});

describe('Nährwerte', () => {
  it('verlangen Einheit, Bezug, Fundstelle und Prüfdatum', () => {
    expect(NutrientValueSchema.safeParse(naehrstoff()).success).toBe(true);
    for (const feld of ['unit', 'basis', 'sourceUrl', 'checkedAt']) {
      expect(NutrientValueSchema.safeParse(naehrstoff({ [feld]: null })).success, feld).toBe(false);
    }
  });

  it('dürfen als nicht deklariert eingetragen werden', () => {
    const offen = naehrstoff({
      value: null,
      unit: null,
      basis: null,
      sourceUrl: null,
      checkedAt: null,
    });
    expect(NutrientValueSchema.safeParse(offen).success).toBe(true);
  });

  it('unterscheiden Frischmasse von Trockenmasse', () => {
    const trocken = NutrientValueSchema.parse(naehrstoff({ basis: 'dry_matter_per_100g' }));
    const frisch = NutrientValueSchema.parse(naehrstoff());
    expect(trocken.basis).not.toBe(frisch.basis);
  });

  it('geben einen nicht deklarierten Wert als null zurück, nicht als 0', () => {
    const produkt = FoodProductSchema.parse(
      futter({
        nutrients: [
          naehrstoff({
            nutrient: 'fat',
            value: null,
            unit: null,
            basis: null,
            sourceUrl: null,
            checkedAt: null,
          }),
        ],
      }),
    );
    expect(naehrwert(produkt, 'fat')).toBeNull();
    expect(naehrwert(produkt, 'protein')).toBeNull();
  });
});

describe('Futtertaxonomie', () => {
  it('entspricht dem Schema', () => {
    const roh = JSON.parse(readFileSync('content-data/taxonomy/food.json', 'utf8')) as unknown;
    expect(TaxonomySchema.safeParse(roh).success).toBe(true);
  });

  it('schließt Diätfutter, Rationsberechnung und Nährwertscores aus', () => {
    const themen = futterTaxonomie()
      .excluded.map((eintrag) => eintrag.topic.toLowerCase())
      .join(' ');
    expect(themen).toContain('diätfuttermittel');
    expect(themen).toContain('rationsberechnung');
    expect(themen).toContain('nährwertscores');
  });

  it('sagt, dass Mengen und Preise verglichen werden — nicht Qualitäten', () => {
    expect(futterTaxonomie().notes.join(' ')).toContain('nicht Qualitäten');
  });
});
