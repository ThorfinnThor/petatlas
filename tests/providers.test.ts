// M03-05 — Providerwahl an einer Stelle, kein Rückfall auf einen fremden Markt.
import { describe, expect, it } from 'vitest';

import { requireMarket, type MarketConfig } from '../src/domain/market.ts';
import {
  ProviderRegistry,
  isSupported,
  providers,
  supported,
  type CostProvider,
} from '../src/domain/providers.ts';

function syntheticCostProvider(marketId: string, providerId: string): CostProvider {
  return {
    domain: 'costs',
    providerId,
    marketId,
    listFeeItems: () => supported([]),
    getScenario: () => supported(null),
  };
}

function withProvider(
  market: MarketConfig,
  domain: string,
  providerId: string | null,
): MarketConfig {
  return { ...market, providerIds: { ...market.providerIds, [domain]: providerId } };
}

describe('Startzustand', () => {
  it('hat im Produktivpfad keinen Adapter registriert', () => {
    expect(providers.registeredIds()).toEqual([]);
  });

  it('liefert für DE ohne Adapter unsupported statt leerer Daten', () => {
    const result = providers.resolve(requireMarket('DE'), 'costs');
    expect(result.kind).toBe('unsupported');
    expect(isSupported(result)).toBe(false);
  });
});

describe('Kein deutsches Fallback für einen fremden Markt', () => {
  it('gibt für US unsupported zurück, obwohl ein DE-Adapter existiert', () => {
    const registry = new ProviderRegistry().register(syntheticCostProvider('DE', 'synthetic-de'));
    const de = withProvider(requireMarket('DE'), 'costs', 'synthetic-de');
    const us = withProvider(requireMarket('US'), 'costs', null);

    expect(registry.resolve(de, 'costs').kind).toBe('supported');

    const result = registry.resolve(us, 'costs');
    expect(result.kind).toBe('unsupported');
    if (result.kind === 'unsupported') {
      expect(result.reason).toMatch(/Kein Rückfall/);
    }
  });

  it('verweigert einen DE-Adapter, der in einer US-Konfiguration eingetragen wäre', () => {
    const registry = new ProviderRegistry().register(syntheticCostProvider('DE', 'synthetic-de'));
    const usMitFremdemAdapter = withProvider(requireMarket('US'), 'costs', 'synthetic-de');

    const result = registry.resolve(usMitFremdemAdapter, 'costs');
    expect(result.kind).toBe('unsupported');
    if (result.kind === 'unsupported') {
      expect(result.reason).toMatch(/gehört zu Markt DE/);
    }
  });

  it('unterscheidet nicht konfiguriert von nicht registriert', () => {
    const leer = new ProviderRegistry();
    const de = withProvider(requireMarket('DE'), 'costs', 'gibt-es-nicht');

    const ohneKonfiguration = leer.resolve(requireMarket('DE'), 'costs');
    const ohneRegistrierung = leer.resolve(de, 'costs');

    expect(ohneKonfiguration.kind).toBe('unsupported');
    expect(ohneRegistrierung.kind).toBe('unsupported');
    if (ohneKonfiguration.kind === 'unsupported' && ohneRegistrierung.kind === 'unsupported') {
      expect(ohneKonfiguration.reason).not.toBe(ohneRegistrierung.reason);
    }
  });
});

describe('Registry', () => {
  it('registriert je Bereich und ID genau einmal', () => {
    const registry = new ProviderRegistry().register(syntheticCostProvider('DE', 'synthetic-de'));
    expect(() => registry.register(syntheticCostProvider('DE', 'synthetic-de'))).toThrow(
      /bereits registriert/,
    );
  });

  it('trennt Bereiche voneinander', () => {
    const registry = new ProviderRegistry().register(syntheticCostProvider('DE', 'synthetic-de'));
    const de = withProvider(requireMarket('DE'), 'costs', 'synthetic-de');
    expect(registry.resolve(de, 'places').kind).toBe('unsupported');
  });

  it('führt registrierte Adapter mit Bereich und ID', () => {
    const registry = new ProviderRegistry().register(syntheticCostProvider('DE', 'synthetic-de'));
    expect(registry.registeredIds()).toEqual(['costs:synthetic-de']);
  });
});

describe('Marktkonfiguration', () => {
  it('führt für DE alle vier Bereiche als noch nicht belegt', () => {
    expect(requireMarket('DE').providerIds).toEqual({
      costs: null,
      places: null,
      travel: null,
      commerce: null,
    });
  });
});
