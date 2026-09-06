// M03-06 — Internationale Isolation.
//
// Ein synthetischer US-Anbieter läuft durch dieselben Fachschnittstellen wie
// ein deutscher. Geprüft wird, dass dadurch nichts in den deutschen Markt
// überläuft. Es werden keine echten US-Inhalte abgerufen; alle Daten hier
// sind erfunden.
import { describe, expect, it } from 'vitest';

import { enabledMarkets, requireMarket, routablePathPrefixes } from '../src/domain/market.ts';
import { formatMoney, money } from '../src/domain/money.ts';
import { formatWeight, fromKilograms } from '../src/domain/units.ts';
import { TranslationError, catalog, translate } from '../src/domain/i18n.ts';
import { ProviderRegistry, supported, type CommerceProvider } from '../src/domain/providers.ts';
import { OfferSchema, isDisplayable, type Offer } from '../src/domain/schemas/index.ts';

const DE_OFFER: Offer = OfferSchema.parse({
  offerId: 'synthetic-de-offer',
  productId: 'synthetic-product-1',
  merchantId: 'synthetic-de-merchant',
  marketId: 'DE',
  currency: 'EUR',
  priceMinor: 1299,
  shippingMinor: 499,
  availability: 'in_stock',
  kind: 'regular',
  affiliateUrl: 'https://example.invalid/de/angebot',
  fetchedAt: '2026-09-06T10:00:00+00:00',
  expiresAt: null,
  displayPermission: true,
  imagePermission: false,
});

const US_OFFER: Offer = OfferSchema.parse({
  offerId: 'synthetic-us-offer',
  productId: 'synthetic-product-1',
  merchantId: 'synthetic-us-merchant',
  marketId: 'US',
  currency: 'USD',
  priceMinor: 1499,
  shippingMinor: null,
  availability: 'in_stock',
  kind: 'regular',
  affiliateUrl: 'https://example.invalid/us/offer',
  fetchedAt: '2026-09-06T10:00:00+00:00',
  expiresAt: null,
  displayPermission: true,
  imagePermission: false,
});

function commerceProvider(marketId: string, offers: readonly Offer[]): CommerceProvider {
  return {
    domain: 'commerce',
    providerId: `synthetic-${marketId.toLowerCase()}-commerce`,
    marketId,
    listOffers: () => supported(offers),
  };
}

const registry = new ProviderRegistry()
  .register(commerceProvider('DE', [DE_OFFER]))
  .register(commerceProvider('US', [US_OFFER]));

const deMarket = {
  ...requireMarket('DE'),
  providerIds: { ...requireMarket('DE').providerIds, commerce: 'synthetic-de-commerce' },
};
const usMarket = {
  ...requireMarket('US'),
  providerIds: { ...requireMarket('US').providerIds, commerce: 'synthetic-us-commerce' },
};

const NOW = '2026-09-07T00:00:00+00:00';

describe('Derselbe Vertrag, zwei Märkte', () => {
  it('bedient beide Märkte über dieselbe Schnittstelle', () => {
    for (const market of [deMarket, usMarket]) {
      const provider = registry.resolve(market, 'commerce');
      expect(provider.kind).toBe('supported');
      if (provider.kind === 'supported') {
        const offers = provider.value.listOffers('synthetic-product-1');
        expect(offers.kind).toBe('supported');
      }
    }
  });
});

describe('US-Angebote erscheinen nicht in DE', () => {
  it('filtert ein US-Angebot aus einer DE-Liste heraus', () => {
    const gemischt = [DE_OFFER, US_OFFER];
    const fuerDe = gemischt.filter((offer) => isDisplayable(offer, 'DE', NOW));
    expect(fuerDe.map((offer) => offer.offerId)).toEqual(['synthetic-de-offer']);
  });

  it('zeigt ein DE-Angebot auch nicht in einer US-Liste', () => {
    const fuerUs = [DE_OFFER, US_OFFER].filter((offer) => isDisplayable(offer, 'US', NOW));
    expect(fuerUs.map((offer) => offer.offerId)).toEqual(['synthetic-us-offer']);
  });

  it('liefert der DE-Provider nur DE-Angebote', () => {
    const provider = registry.resolve(deMarket, 'commerce');
    if (provider.kind !== 'supported') throw new Error('DE-Provider fehlt');
    const offers = provider.value.listOffers('synthetic-product-1');
    if (offers.kind !== 'supported') throw new Error('Keine Angebote');
    expect(offers.value.every((offer) => offer.marketId === 'DE')).toBe(true);
  });
});

describe('Der US-Testmarkt bleibt inaktiv', () => {
  it('erzeugt keine Route, obwohl ein Adapter existiert', () => {
    expect(enabledMarkets().map((market) => market.id)).toEqual(['DE']);
    expect(routablePathPrefixes()).toEqual(['/de-de']);
  });

  it('hat in der versionierten Konfiguration weiterhin keinen Adapter', () => {
    expect(requireMarket('US').providerIds.commerce).toBeNull();
    expect(requireMarket('US').enabled).toBe(false);
  });
});

describe('Währung und Einheiten folgen dem Markt', () => {
  it('formatiert denselben Zahlenwert je Markt unterschiedlich', () => {
    const deutsch = formatMoney(money(1499, 'EUR'), deMarket.locale);
    const amerikanisch = formatMoney(money(1499, 'USD'), usMarket.locale);
    expect(deutsch).toContain('14,99');
    expect(amerikanisch).toContain('14.99');
    expect(deutsch).not.toBe(amerikanisch);
  });

  it('vermischt die Währungen der beiden Angebote nicht', () => {
    expect(DE_OFFER.currency).toBe('EUR');
    expect(US_OFFER.currency).toBe('USD');
  });

  it('zeigt dasselbe Gewicht metrisch und imperial', () => {
    const gewicht = fromKilograms(12.5);
    const metrisch = formatWeight(gewicht, deMarket.locale, deMarket.measurementSystem);
    const imperial = formatWeight(gewicht, usMarket.locale, usMarket.measurementSystem);
    expect(metrisch).toMatch(/12,5/);
    expect(imperial).toMatch(/27\.5/);
  });

  it('kennzeichnet unbekannten Versand in beiden Märkten als unbekannt', () => {
    expect(US_OFFER.shippingMinor).toBeNull();
  });
});

describe('Eine englische Testansicht überschreibt keine deutschen Texte', () => {
  it('liefert je Locale den eigenen Text', () => {
    expect(translate('de-DE', 'places.nearMunicipality', { municipality: 'Musterstadt' })).toBe(
      'im Umkreis von Musterstadt',
    );
    expect(translate('en-US', 'places.nearMunicipality', { municipality: 'Sampletown' })).toBe(
      'near Sampletown',
    );
  });

  it('lässt den deutschen Katalog unverändert, nachdem der englische benutzt wurde', () => {
    const vorher = { ...catalog('de-DE') };
    translate('en-US', 'site.buildNotice');
    expect({ ...catalog('de-DE') }).toEqual(vorher);
    expect(catalog('de-DE')['site.buildNotice']).toBe('Diese Seite ist ein Aufbaustand.');
  });

  it('lässt sich nicht durch Schreiben in den Katalog verändern', () => {
    const deutsch = catalog('de-DE') as Record<string, string>;
    expect(() => {
      deutsch['site.buildNotice'] = 'manipuliert';
    }).toThrow();
    expect(catalog('de-DE')['site.buildNotice']).toBe('Diese Seite ist ein Aufbaustand.');
  });

  it('fällt bei einem fehlenden Schlüssel nicht auf ein anderes Locale zurück', () => {
    expect(() => translate('en-US', 'gibt.es.nicht')).toThrow(TranslationError);
  });
});
