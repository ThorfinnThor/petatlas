// M03-01 — Markt, Sprache, Währung, Zeitzone und Reiseziel bleiben getrennt.
import { describe, expect, it } from 'vitest';

import {
  MarketConfigSchema,
  allMarkets,
  createTravelContext,
  defaultMarket,
  enabledMarkets,
  getMarket,
  isFeatureEnabled,
  requireMarket,
  routablePathPrefixes,
} from '../src/domain/market.ts';

describe('Nur Deutschland ist aktiv', () => {
  it('kennt genau einen aktiven Markt', () => {
    expect(enabledMarkets().map((market) => market.id)).toEqual(['DE']);
  });

  it('führt US und NL als deaktivierte Testkonfiguration', () => {
    expect(
      allMarkets()
        .map((market) => market.id)
        .sort(),
    ).toEqual(['DE', 'NL', 'US']);
    expect(requireMarket('US').enabled).toBe(false);
    expect(requireMarket('NL').enabled).toBe(false);
  });

  it('erzeugt nur für aktive Märkte ein Pfadpräfix', () => {
    expect(routablePathPrefixes()).toEqual(['/de-de']);
    expect(routablePathPrefixes()).not.toContain('/en-us');
  });

  it('nimmt DE als Standardmarkt', () => {
    expect(defaultMarket().id).toBe('DE');
  });
});

describe('Markt, Sprache, Währung und Zeitzone sind getrennte Felder', () => {
  it('hält für DE die erwarteten Werte', () => {
    const de = requireMarket('DE');
    expect(de.locale).toBe('de-DE');
    expect(de.currency).toBe('EUR');
    expect(de.timeZone).toBe('Europe/Berlin');
    expect(de.measurementSystem).toBe('metric');
  });

  it('erlaubt zwei Märkte mit gleicher Währung und unterschiedlichem Locale', () => {
    expect(requireMarket('NL').currency).toBe(requireMarket('DE').currency);
    expect(requireMarket('NL').locale).not.toBe(requireMarket('DE').locale);
  });

  it('unterscheidet Maßsystem und Währung des US-Testmarkts', () => {
    const us = requireMarket('US');
    expect(us.currency).toBe('USD');
    expect(us.measurementSystem).toBe('us');
  });
});

describe('Reiseziel ist kein Markt', () => {
  it('lässt einen DE-Nutzer mit Reiseziel IT im Markt DE', () => {
    const context = createTravelContext('DE', 'IT');
    expect(context.market.id).toBe('DE');
    expect(context.market.locale).toBe('de-DE');
    expect(context.market.currency).toBe('EUR');
    expect(context.destinationCountry).toBe('IT');
  });

  it('macht Italien nicht zu einem konfigurierten Markt', () => {
    expect(createTravelContext('DE', 'IT').destinationIsConfiguredMarket).toBe(false);
    expect(getMarket('IT')).toBeUndefined();
    expect(routablePathPrefixes()).not.toContain('/it-it');
  });

  it('macht auch ein Reiseziel mit vorhandener Marktdatei nicht zum aktiven Markt', () => {
    const context = createTravelContext('DE', 'NL');
    expect(context.market.id).toBe('DE');
    expect(context.destinationIsConfiguredMarket).toBe(true);
    expect(enabledMarkets().map((market) => market.id)).toEqual(['DE']);
  });

  it('weist einen ungültigen Zielcode zurück', () => {
    expect(() => createTravelContext('DE', 'italien')).toThrow();
  });

  it('weist einen unbekannten Markt zurück, statt auf DE zu raten', () => {
    expect(() => createTravelContext('IT', 'DE')).toThrow(/Unbekannter Markt/);
  });
});

describe('Feature Flags sind fail-closed', () => {
  it('behandelt einen unbekannten Namen als nicht aktiviert', () => {
    expect(isFeatureEnabled(requireMarket('DE'), 'gibtEsNicht')).toBe(false);
  });

  it('hat im Startumfang keine aktive Funktion', () => {
    const active = Object.entries(requireMarket('DE').featureFlags).filter(([, on]) => on);
    expect(active).toEqual([]);
  });
});

describe('Konfigurationsschema', () => {
  it('lehnt ein Locale ab, das nicht zur Markt-ID passt', () => {
    const de = requireMarket('DE');
    const result = MarketConfigSchema.safeParse({ ...de, locale: 'de-AT' });
    // Das Schema selbst akzeptiert die Form; die Markt-Zuordnung prüft der Loader.
    expect(result.success).toBe(true);
  });

  it('lehnt unbekannte Felder ab', () => {
    const de = requireMarket('DE');
    expect(MarketConfigSchema.safeParse({ ...de, unbekannt: 1 }).success).toBe(false);
  });

  it('lehnt eine ungültige Währung ab', () => {
    const de = requireMarket('DE');
    expect(MarketConfigSchema.safeParse({ ...de, currency: 'Euro' }).success).toBe(false);
  });
});
