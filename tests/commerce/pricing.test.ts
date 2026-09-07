// M13-04 — Keine „kostenlos“- und keine „Bestpreis“-Behauptung ohne Deckung.
import { describe, expect, it } from 'vitest';

import {
  OfferSchema,
  ProductSchema,
  type Offer,
  type Product,
} from '../../src/domain/schemas/catalog.ts';
import {
  abgelaufen,
  formatiereBetrag,
  grundpreis,
  preisAussage,
  vergleicheAngebote,
  versandkostenfrei,
} from '../../src/features/commerce/pricing.ts';

function angebot(overrides: Partial<Offer> = {}): Offer {
  return OfferSchema.parse({
    offerId: 'awin:901:1',
    productId: 'awin:901:SYN-100',
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
    productId: 'awin:901:SYN-100',
    species: 'dog',
    category: 'dry_food',
    brand: 'Beispielmarke',
    gtin: null,
    variant: null,
    netContentGrams: 2000,
    packUnits: 1,
    material: null,
    verifiedAttributes: {},
    ...overrides,
  });
}

describe('Versand', () => {
  it('nennt nur eine ausdrückliche 0 kostenlos', () => {
    expect(versandkostenfrei(angebot({ shippingMinor: 0 }))).toBe(true);
    expect(versandkostenfrei(angebot({ shippingMinor: null }))).toBe(false);
    expect(versandkostenfrei(angebot({ shippingMinor: 395 }))).toBe(false);
  });

  it('sagt bei unbekanntem Versand, dass der Gesamtpreis nicht feststeht', () => {
    const aussage = preisAussage(angebot({ shippingMinor: null }));
    expect(aussage.versandBekannt).toBe(false);
    expect(aussage.label).toContain('ohne unbekannte Versandkosten');
    expect(aussage.betragMinor).toBe(2499);
  });

  it('rechnet bekannten Versand in den Gesamtpreis', () => {
    const aussage = preisAussage(angebot({ shippingMinor: 395 }));
    expect(aussage.betragMinor).toBe(2894);
    expect(aussage.label).toContain('inklusive Versand');
  });
});

describe('Grundpreis', () => {
  it('rechnet je Kilogramm bei bekannter Menge', () => {
    expect(grundpreis(angebot(), produkt())?.proKilogrammMinor).toBe(1250);
  });

  it('rechnet das Gebinde mit', () => {
    const sechser = produkt({ netContentGrams: 400, packUnits: 6 });
    const basis = grundpreis(angebot({ priceMinor: 949 }), sechser);
    expect(basis?.proKilogrammMinor).toBe(395);
    expect(basis?.basis).toContain('6 × 400 g');
  });

  it('schätzt nichts bei unbekannter Menge', () => {
    expect(grundpreis(angebot(), produkt({ netContentGrams: null }))).toBeNull();
    expect(grundpreis(angebot(), produkt({ packUnits: null }))).toBeNull();
  });
});

describe('Vergleich', () => {
  const zwei = [
    angebot({ offerId: 'a', priceMinor: 2499, shippingMinor: 395 }),
    angebot({ offerId: 'b', productId: 'awin:902:SYN-100', priceMinor: 2599, shippingMinor: 0 }),
  ];
  const produkte = [produkt(), produkt({ productId: 'awin:902:SYN-100' })];

  it('vergleicht den Gesamtpreis, wenn jeder Versand bekannt ist', () => {
    const ergebnis = vergleicheAngebote(zwei, produkte, 'DE');
    expect(ergebnis.vergleichbar).toBe(true);
    expect(ergebnis.bezug).toBe('gesamtpreis');
    // 25,99 + 0,00 schlägt 24,99 + 3,95.
    expect(ergebnis.guenstigstes?.offerId).toBe('b');
  });

  it('vergleicht nur den Artikelpreis, wenn ein Versand fehlt', () => {
    const ergebnis = vergleicheAngebote(
      [zwei[0]!, angebot({ offerId: 'b', productId: 'awin:902:SYN-100', shippingMinor: null })],
      produkte,
      'DE',
    );
    expect(ergebnis.bezug).toBe('artikelpreis');
    expect(ergebnis.grund).toContain('nur der Artikelpreis');
  });

  it('vergleicht kein Multipack mit einer Einzelpackung', () => {
    const ergebnis = vergleicheAngebote(
      zwei,
      [produkt(), produkt({ productId: 'awin:902:SYN-100', packUnits: 6 })],
      'DE',
    );
    expect(ergebnis.vergleichbar).toBe(false);
    expect(ergebnis.guenstigstes).toBeNull();
    expect(ergebnis.grund).toContain('Gebindegröße');
  });

  it('vergleicht nicht über Marktgrenzen hinweg', () => {
    const ergebnis = vergleicheAngebote(
      [zwei[0]!, angebot({ offerId: 'b', productId: 'awin:902:SYN-100', marketId: 'US' })],
      produkte,
      'DE',
    );
    expect(ergebnis.vergleichbar).toBe(false);
    expect(ergebnis.grund).toContain('Nur ein Angebot');
  });

  it('hält Neukundenpreise aus dem allgemeinen Vergleich heraus', () => {
    const mitNeukunde = [
      ...zwei,
      angebot({
        offerId: 'c',
        productId: 'awin:903:SYN-100',
        priceMinor: 1999,
        kind: 'new_customer_only',
      }),
    ];
    const ergebnis = vergleicheAngebote(
      mitNeukunde,
      [...produkte, produkt({ productId: 'awin:903:SYN-100' })],
      'DE',
    );
    expect(ergebnis.guenstigstes?.offerId).toBe('b');
    expect(ergebnis.nurFuerManche.map((a) => a.offerId)).toEqual(['c']);
  });

  it('behauptet bei einem einzigen Angebot keinen Bestpreis', () => {
    const ergebnis = vergleicheAngebote([zwei[0]!], produkte, 'DE');
    expect(ergebnis.vergleichbar).toBe(false);
    expect(ergebnis.bezug).toBe('keiner');
  });

  it('vergleicht nicht, wenn zu einem Angebot das Produkt fehlt', () => {
    expect(vergleicheAngebote(zwei, [produkt()], 'DE').vergleichbar).toBe(false);
  });
});

describe('Darstellung', () => {
  it('formatiert Beträge deutsch', () => {
    // Intl setzt ein schmales geschütztes Leerzeichen; es wird hier bewusst
    // als Escape geschrieben, damit die Datei keine unsichtbaren Zeichen trägt.
    expect(formatiereBetrag(2499, 'EUR').replace(/[\u00a0\u202f]/g, ' ')).toBe('24,99 €');
  });

  it('erkennt abgelaufene Angebote', () => {
    const jetzt = '2026-09-07T12:00:00+00:00';
    expect(abgelaufen(angebot({ expiresAt: '2026-09-07T06:00:00+00:00' }), jetzt)).toBe(true);
    expect(abgelaufen(angebot({ expiresAt: '2026-09-08T06:00:00+00:00' }), jetzt)).toBe(false);
    expect(abgelaufen(angebot(), jetzt)).toBe(false);
  });
});
