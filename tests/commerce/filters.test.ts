// M13-05 — Ein Filter kann nichts sichtbar machen, was ohne ihn unsichtbar wäre.
import { describe, expect, it } from 'vitest';

import {
  OfferSchema,
  ProductSchema,
  type Offer,
  type Product,
} from '../../src/domain/schemas/catalog.ts';
import {
  SORTIERUNGEN,
  filtere,
  katalogAnsicht,
  sortiere,
  zeigbareEintraege,
  type KatalogEintrag,
} from '../../src/features/commerce/filters.ts';

const JETZT = '2026-09-07T12:00:00+00:00';

function angebot(overrides: Partial<Offer> = {}): Offer {
  return OfferSchema.parse({
    offerId: 'a',
    productId: 'p1',
    merchantId: '901',
    marketId: 'DE',
    currency: 'EUR',
    priceMinor: 2499,
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

function produkt(overrides: Partial<Product> = {}): Product {
  return ProductSchema.parse({
    productId: 'p1',
    species: 'dog',
    category: 'dry_food',
    brand: 'Alpha',
    gtin: null,
    variant: null,
    netContentGrams: 2000,
    packUnits: 1,
    material: null,
    verifiedAttributes: {},
    ...overrides,
  });
}

describe('Zulässigkeit vor Filter', () => {
  const produkte = [produkt()];

  it('zeigt kein Angebot ohne Anzeigeerlaubnis', () => {
    expect(
      zeigbareEintraege([angebot({ displayPermission: false })], produkte, 'DE', JETZT),
    ).toEqual([]);
  });

  it('zeigt kein Angebot aus einem fremden Markt', () => {
    expect(zeigbareEintraege([angebot({ marketId: 'US' })], produkte, 'DE', JETZT)).toEqual([]);
  });

  it('zeigt kein abgelaufenes Angebot', () => {
    const alt = angebot({ expiresAt: '2026-09-07T06:00:00+00:00' });
    expect(zeigbareEintraege([alt], produkte, 'DE', JETZT)).toEqual([]);
  });

  it('zeigt kein Angebot ohne zugehöriges Produkt', () => {
    expect(zeigbareEintraege([angebot({ productId: 'fehlt' })], produkte, 'DE', JETZT)).toEqual([]);
  });

  it('kann durch keinen Filter umgangen werden', () => {
    // Auch ein Filter, der genau auf das gesperrte Angebot passt, findet es
    // nicht: die Zulässigkeit wird vorher geprüft.
    const gesperrt = [angebot({ displayPermission: false })];
    const ansicht = katalogAnsicht(gesperrt, produkte, 'DE', JETZT, {
      species: 'dog',
      category: 'dry_food',
      brand: 'Alpha',
    });
    expect(ansicht.eintraege).toEqual([]);
    expect(ansicht.leerHinweis).toContain('ohne freigegebenen Partnervertrag');
  });
});

describe('Filter', () => {
  const eintraege: KatalogEintrag[] = [
    { angebot: angebot({ offerId: 'a', priceMinor: 1000 }), produkt: produkt() },
    {
      angebot: angebot({
        offerId: 'b',
        productId: 'p2',
        priceMinor: 3000,
        availability: 'unknown',
      }),
      produkt: produkt({ productId: 'p2', species: 'cat', category: 'toy', brand: 'Beta' }),
    },
  ];

  it('filtert nach Tierart, Kategorie und Marke', () => {
    expect(filtere(eintraege, { species: 'cat' }).length).toBe(1);
    expect(filtere(eintraege, { category: 'dry_food' }).length).toBe(1);
    expect(filtere(eintraege, { brand: 'Beta' })[0]?.angebot.offerId).toBe('b');
  });

  it('filtert nach Verfügbarkeit, ohne unbekannt zu verstecken', () => {
    expect(filtere(eintraege, { availability: 'unknown' })[0]?.angebot.offerId).toBe('b');
  });

  it('filtert nach Höchstpreis', () => {
    expect(filtere(eintraege, { maxPreisMinor: 2000 }).map((e) => e.angebot.offerId)).toEqual([
      'a',
    ]);
  });

  it('gibt ohne Filter alles zurück', () => {
    expect(filtere(eintraege, {}).length).toBe(2);
  });
});

describe('Sortierung', () => {
  const eintraege: KatalogEintrag[] = [
    {
      angebot: angebot({ offerId: 'teuer', priceMinor: 3000 }),
      produkt: produkt({ brand: 'Zeta' }),
    },
    {
      angebot: angebot({ offerId: 'billig', priceMinor: 1000 }),
      produkt: produkt({ brand: 'Alpha' }),
    },
    {
      angebot: angebot({
        offerId: 'ohne-menge',
        priceMinor: 2000,
        fetchedAt: '2026-09-06T00:00:00+00:00',
      }),
      produkt: produkt({ netContentGrams: null, packUnits: null, brand: 'Mitte' }),
    },
  ];

  it('bietet nur erklärbare Ordnungen an', () => {
    expect(SORTIERUNGEN.map((s) => s.schluessel)).toEqual([
      'preis',
      'grundpreis',
      'marke',
      'stand',
    ]);
    for (const sortierung of SORTIERUNGEN) {
      expect(sortierung.erklaerung.length, sortierung.schluessel).toBeGreaterThan(20);
      expect(sortierung.erklaerung.toLowerCase()).not.toContain('provision');
      expect(sortierung.schluessel).not.toMatch(/provision|relevanz|empfehlung/);
    }
  });

  it('ordnet nach Preis', () => {
    expect(sortiere(eintraege, 'preis').map((e) => e.angebot.offerId)).toEqual([
      'billig',
      'ohne-menge',
      'teuer',
    ]);
  });

  it('stellt unbekannten Grundpreis ans Ende, nicht an den Anfang', () => {
    expect(sortiere(eintraege, 'grundpreis').map((e) => e.angebot.offerId)).toEqual([
      'billig',
      'teuer',
      'ohne-menge',
    ]);
  });

  it('ordnet nach Marke und nach Stand', () => {
    expect(sortiere(eintraege, 'marke')[0]?.produkt.brand).toBe('Alpha');
    expect(sortiere(eintraege, 'stand').at(-1)?.angebot.offerId).toBe('ohne-menge');
  });

  it('ist unabhängig von der Eingabereihenfolge', () => {
    const gedreht = [...eintraege].reverse();
    expect(sortiere(gedreht, 'preis').map((e) => e.angebot.offerId)).toEqual(
      sortiere(eintraege, 'preis').map((e) => e.angebot.offerId),
    );
  });

  it('ändert sich nicht, wenn ein Provisionsfeld auftaucht', () => {
    // Selbst wenn jemand ein solches Feld mitliefert: die Ordnung benutzt es
    // nicht, weil sie es nicht kennt.
    const mitProvision = eintraege.map((eintrag) => ({
      ...eintrag,
      angebot: { ...eintrag.angebot, commissionMinor: 9999 } as unknown as Offer,
    }));
    expect(sortiere(mitProvision, 'preis').map((e) => e.angebot.offerId)).toEqual(
      sortiere(eintraege, 'preis').map((e) => e.angebot.offerId),
    );
  });
});

describe('Leerer Katalog', () => {
  it('unterscheidet „nichts vorhanden“ von „nichts zu diesen Filtern“', () => {
    const ohneAlles = katalogAnsicht([], [], 'DE', JETZT);
    expect(ohneAlles.leerHinweis).toContain('ohne freigegebenen Partnervertrag');

    const mitBestand = katalogAnsicht([angebot()], [produkt()], 'DE', JETZT, { species: 'cat' });
    expect(mitBestand.eintraege).toEqual([]);
    expect(mitBestand.leerHinweis).toContain('Zu diesen Filtern');
  });

  it('nennt die verwendete Sortierung', () => {
    expect(katalogAnsicht([], [], 'DE', JETZT, {}, 'grundpreis').sortierung.schluessel).toBe(
      'grundpreis',
    );
  });
});
