// M15-02 — 400 g, 1 kg, 6 × 400 g und kaputte Mengen.
import { describe, expect, it } from 'vitest';

import { OfferSchema, type Offer } from '../src/domain/schemas/catalog.ts';
import { FoodProductSchema, type FoodProduct } from '../src/domain/schemas/food.ts';
import {
  grundpreisJeKilogramm,
  mengenText,
  vergleicheFutter,
} from '../src/features/food/unit-price.ts';

function angebot(overrides: Partial<Offer> = {}): Offer {
  return OfferSchema.parse({
    offerId: 'a',
    productId: 'p1',
    merchantId: '901',
    marketId: 'DE',
    currency: 'EUR',
    priceMinor: 1000,
    shippingMinor: 395,
    availability: 'in_stock',
    kind: 'regular',
    affiliateUrl: 'https://beispiel.invalid/p/1',
    fetchedAt: '2026-09-07T00:00:00+00:00',
    expiresAt: null,
    displayPermission: true,
    imagePermission: false,
    ...overrides,
  });
}

function futter(overrides: Record<string, unknown> = {}): FoodProduct {
  return FoodProductSchema.parse({
    foodId: 'synthetisch:futter-1',
    productId: 'p1',
    species: 'dog',
    brand: 'Beispielmarke',
    productName: 'Trockenfutter Adult',
    gtin: null,
    lifeStage: null,
    kind: null,
    netContentGrams: 1000,
    packUnits: 1,
    nutrients: [],
    composition: null,
    declarationSourceUrl: null,
    declarationCheckedAt: null,
    ...overrides,
  });
}

describe('Grundpreis', () => {
  it('rechnet 1 kg für 10,00 € als 10,00 € je kg', () => {
    const preis = grundpreisJeKilogramm(angebot({ priceMinor: 1000 }), futter());
    expect(preis?.proKilogrammMinor).toBe(1000);
    expect(preis?.gesamtGramm).toBe(1000);
    expect(preis?.basis).toBe('1 kg');
  });

  it('rechnet 400 g für 3,00 € als 7,50 € je kg', () => {
    const preis = grundpreisJeKilogramm(
      angebot({ priceMinor: 300 }),
      futter({ netContentGrams: 400 }),
    );
    expect(preis?.proKilogrammMinor).toBe(750);
    expect(preis?.basis).toBe('0,4 kg');
  });

  it('rechnet 6 × 400 g für 9,49 € auf die Gesamtmenge, nicht auf eine Dose', () => {
    const preis = grundpreisJeKilogramm(
      angebot({ priceMinor: 949 }),
      futter({ netContentGrams: 400, packUnits: 6 }),
    );
    expect(preis?.gesamtGramm).toBe(2400);
    // 9,49 € / 2,4 kg = 3,954… € je kg → 395 Cent.
    expect(preis?.proKilogrammMinor).toBe(395);
    expect(preis?.basis).toBe('6 × 400 g = 2,4 kg');
  });

  it('rundet einmal am Ende und kaufmännisch', () => {
    // 10,00 € / 3 kg = 3,3333… € je kg → 333 Cent.
    expect(
      grundpreisJeKilogramm(angebot({ priceMinor: 1000 }), futter({ netContentGrams: 3000 }))
        ?.proKilogrammMinor,
    ).toBe(333);
    // 10,00 € / 1,5 kg = 6,6666… → 667 Cent.
    expect(
      grundpreisJeKilogramm(angebot({ priceMinor: 1000 }), futter({ netContentGrams: 1500 }))
        ?.proKilogrammMinor,
    ).toBe(667);
  });

  it('schätzt bei fehlender Menge nicht', () => {
    expect(grundpreisJeKilogramm(angebot(), futter({ netContentGrams: null }))).toBeNull();
    expect(grundpreisJeKilogramm(angebot(), futter({ packUnits: null }))).toBeNull();
    expect(mengenText(futter({ packUnits: null }))).toBeNull();
  });

  it('lässt fehlerhafte Mengen gar nicht erst zu', () => {
    // Das Schema fängt sie ab, bevor gerechnet wird.
    expect(FoodProductSchema.safeParse({ ...futter(), netContentGrams: 0 }).success).toBe(false);
    expect(FoodProductSchema.safeParse({ ...futter(), netContentGrams: -400 }).success).toBe(false);
    expect(FoodProductSchema.safeParse({ ...futter(), packUnits: 0 }).success).toBe(false);
    expect(FoodProductSchema.safeParse({ ...futter(), netContentGrams: 400.5 }).success).toBe(
      false,
    );
  });

  it('bezieht den Versand nicht in den Grundpreis ein', () => {
    const ohneVersand = grundpreisJeKilogramm(angebot({ shippingMinor: null }), futter());
    const mitVersand = grundpreisJeKilogramm(angebot({ shippingMinor: 999 }), futter());
    expect(ohneVersand?.proKilogrammMinor).toBe(mitVersand?.proKilogrammMinor);
  });
});

describe('Vergleich', () => {
  const einzeln = { angebot: angebot({ offerId: 'einzeln', priceMinor: 1000 }), futter: futter() };
  const guenstiger = {
    angebot: angebot({ offerId: 'guenstiger', priceMinor: 900 }),
    futter: futter(),
  };

  it('vergleicht nur bei gleicher Variante', () => {
    const andereGroesse = {
      angebot: angebot({ offerId: 'gross', priceMinor: 1800 }),
      futter: futter({ netContentGrams: 2000 }),
    };
    const ergebnis = vergleicheFutter([einzeln, andereGroesse], 'DE');
    expect(ergebnis.vergleichbar).toBe(false);
    expect(ergebnis.grund).toContain('andere Variante');
  });

  it('vergleicht verschiedene Gebindegrößen derselben Packung', () => {
    const sechser = {
      angebot: angebot({ offerId: 'sechser', priceMinor: 5000 }),
      futter: futter({ packUnits: 6 }),
    };
    const ergebnis = vergleicheFutter([einzeln, sechser], 'DE');
    // 50,00 € für 6 kg sind 8,33 € je kg und schlagen 10,00 € je kg.
    expect(ergebnis.vergleichbar).toBe(true);
    expect(ergebnis.guenstigstes?.offerId).toBe('sechser');
  });

  it('nimmt bei gleicher Variante das günstigere Angebot', () => {
    expect(vergleicheFutter([einzeln, guenstiger], 'DE').guenstigstes?.offerId).toBe('guenstiger');
  });

  it('vergleicht nicht über Marken oder Produkte hinweg', () => {
    const andereMarke = {
      angebot: angebot({ offerId: 'fremd' }),
      futter: futter({ brand: 'Andere Marke' }),
    };
    expect(vergleicheFutter([einzeln, andereMarke], 'DE').vergleichbar).toBe(false);
  });

  it('vergleicht nicht, wenn einem Angebot die Menge fehlt', () => {
    const ohneMenge = {
      angebot: angebot({ offerId: 'ohne' }),
      futter: futter({ packUnits: null }),
    };
    const ergebnis = vergleicheFutter([einzeln, ohneMenge], 'DE');
    expect(ergebnis.vergleichbar).toBe(false);
    expect(ergebnis.grund).toContain('geraten');
  });

  it('vergleicht nicht über Marktgrenzen', () => {
    const ausUs = { angebot: angebot({ offerId: 'us', marketId: 'US' }), futter: futter() };
    expect(vergleicheFutter([einzeln, ausUs], 'DE').vergleichbar).toBe(false);
  });

  it('behauptet bei einem einzigen Angebot keinen Vergleich', () => {
    const ergebnis = vergleicheFutter([einzeln], 'DE');
    expect(ergebnis.vergleichbar).toBe(false);
    expect(ergebnis.guenstigstes?.offerId).toBe('einzeln');
  });
});
