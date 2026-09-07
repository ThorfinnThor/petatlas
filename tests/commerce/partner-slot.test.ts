// M13-06 — Ohne Vertrag ist der Slot aus, und zwar überall.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { PartnerRegistrySchema } from '../../src/domain/schemas/partner.ts';
import { angebotsErlaubnis, commerceProgramme } from '../../src/features/commerce/partner.ts';
import { katalogAnsicht } from '../../src/features/commerce/filters.ts';
import { oeffentlicheAusgabe } from '../../scripts/build/commerce.ts';
import { OfferSchema, ProductSchema } from '../../src/domain/schemas/catalog.ts';

const JETZT = '2026-09-07T12:00:00+00:00';

describe('Ausgelieferte Warenkonfiguration', () => {
  const roh = JSON.parse(
    readFileSync('config/publishers/commerce/programs.json', 'utf8'),
  ) as unknown;

  it('entspricht dem Schema und ist leer', () => {
    const geprueft = PartnerRegistrySchema.parse(roh);
    expect(geprueft.domain).toBe('commerce');
    expect(geprueft.programs).toEqual([]);
    expect(commerceProgramme()).toEqual([]);
  });

  it('enthält keinen Provisionswert', () => {
    const text = readFileSync('config/publishers/commerce/programs.json', 'utf8').toLowerCase();
    for (const wort of ['commission', 'provision', 'payout', 'cpa']) {
      expect(text.includes(wort), wort).toBe(false);
    }
  });
});

describe('Erlaubnis ohne Vertrag', () => {
  it('erteilt weder Anzeige- noch Bilderlaubnis', () => {
    const erlaubnis = angebotsErlaubnis('DE', '2026-09-07');
    expect(erlaubnis.anzeigen).toBe(false);
    expect(erlaubnis.bilder).toBe(false);
    expect(erlaubnis.grund).toContain('Kein freigegebenes Warenprogramm');
  });

  it('lässt den Katalog leer', () => {
    const ansicht = katalogAnsicht([], [], 'DE', JETZT);
    expect(ansicht.eintraege).toEqual([]);
    expect(ansicht.leerHinweis).toContain('ohne freigegebenen Partnervertrag');
  });

  it('erzeugt keine öffentliche Angebotsdatei', () => {
    const angebot = OfferSchema.parse({
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
      // So, wie die Normalisierung ohne Vertrag setzt: fail-closed.
      displayPermission: false,
      imagePermission: false,
    });
    const produkt = ProductSchema.parse({
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
    });
    const ausgabe = oeffentlicheAusgabe([angebot], [produkt], 'DE', JETZT);
    expect(ausgabe.offers).toEqual([]);
    expect(ausgabe.products).toEqual([]);
  });
});
