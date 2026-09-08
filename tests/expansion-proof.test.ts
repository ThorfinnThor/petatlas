/**
 * M19-03 — Der Ausbau wird bewiesen, nicht behauptet.
 *
 * Die Frage lautet: **was müsste am deutschen Kern geändert werden, um einen
 * zweiten Markt zu bedienen?** Die Antwort dieses Tests ist: nichts. Ein
 * Testmarkt wird hier vollständig über Konfiguration und Adapter aufgezogen
 * — mit anderer Währung, anderem Maßsystem und einer **fehlenden**
 * Kostenquelle — und der deutsche Markt merkt davon nichts.
 *
 * Alle Daten sind erfunden. Es wird nichts abgerufen und nichts
 * veröffentlicht: der Testmarkt bleibt in der versionierten Konfiguration
 * abgeschaltet, und der Test prüft auch das.
 */
import { describe, expect, it } from 'vitest';

import {
  MarketConfigSchema,
  enabledMarkets,
  isFeatureEnabled,
  requireMarket,
  type MarketConfig,
} from '../src/domain/market.ts';
import { formatMoney, money } from '../src/domain/money.ts';
import { formatWeight, fromKilograms } from '../src/domain/units.ts';
import {
  ProviderRegistry,
  isSupported,
  supported,
  type CostProvider,
  type PlacesProvider,
} from '../src/domain/providers.ts';
import { buildablePaths, routeExists, routePath } from '../src/lib/routes.ts';
import usMarkt from '../config/markets/US.json' with { type: 'json' };

/** Der versionierte Testmarkt, für diesen Test eingeschaltet — nur hier. */
const US_AKTIV: MarketConfig = MarketConfigSchema.parse({
  ...usMarkt,
  enabled: true,
  featureFlags: { ...usMarkt.featureFlags, map: true, food: true },
  // Ein Ortsanbieter existiert, ein Kostenanbieter ausdrücklich nicht.
  providerIds: { ...usMarkt.providerIds, places: 'synthetic-us-places' },
});

const DE = requireMarket('DE');

/**
 * Auch der deutsche Markt hat seine Funktionen in der versionierten
 * Konfiguration **aus** — nichts ist freigegeben. Für den Vergleich der
 * Pfade wird deshalb eine Kopie mit eingeschalteter Karte benutzt; das ist
 * derselbe Weg, den auch der Testmarkt geht.
 */
const DE_MIT_KARTE: MarketConfig = {
  ...DE,
  featureFlags: { ...DE.featureFlags, map: true },
};

const US_ORTE: PlacesProvider = {
  domain: 'places',
  providerId: 'synthetic-us-places',
  marketId: 'US',
  search: () => supported([{ placeId: 'synthetic-us-1', name: 'Example Animal Hospital' }]),
} as unknown as PlacesProvider;

const DE_KOSTEN: CostProvider = {
  domain: 'costs',
  providerId: 'de-got-2022',
  marketId: 'DE',
  quote: () => supported({ totalMinor: 1126, currency: 'EUR' }),
} as unknown as CostProvider;

function registry(): ProviderRegistry {
  return new ProviderRegistry().register(US_ORTE).register(DE_KOSTEN);
}

describe('Ein zweiter Markt entsteht aus Konfiguration, nicht aus Umbau', () => {
  it('bekommt seine Routen ohne Änderung am deutschen Kern', () => {
    expect(routeExists(US_AKTIV, 'map')).toBe(true);
    expect(routePath(US_AKTIV, 'map')).toBe('/en-us/vet-map/');
    // Der deutsche Pfad bleibt, wie er war — jeder Markt bekommt seinen
    // Slug aus seinem eigenen Locale, ohne den anderen zu berühren.
    expect(routePath(DE_MIT_KARTE, 'map')).toBe('/de-de/tierarzt-karte/');
  });

  it('benutzt denselben Adaptervertrag wie der deutsche Markt', () => {
    const orte = registry().resolve(US_AKTIV, 'places');
    expect(isSupported(orte)).toBe(true);
  });

  it('lässt einen deutschen Adapter nicht für den Testmarkt einspringen', () => {
    const kosten = registry().resolve(
      { ...US_AKTIV, providerIds: { costs: 'de-got-2022' } },
      'costs',
    );
    expect(kosten.kind).toBe('unsupported');
    if (kosten.kind === 'unsupported') {
      expect(kosten.reason).toContain('gehört zu Markt DE');
    }
  });
});

describe('Eine fehlende Kostenquelle bleibt eine fehlende Kostenquelle', () => {
  it('liefert keinen Preis statt eines deutschen Preises', () => {
    const kosten = registry().resolve(US_AKTIV, 'costs');
    expect(kosten.kind).toBe('unsupported');
    if (kosten.kind === 'unsupported') {
      expect(kosten.reason).toContain('keinen costs-Provider');
      // Der entscheidende Halbsatz: kein Rückfall auf einen anderen Markt.
      expect(kosten.reason).toContain('Kein Rückfall');
    }
  });

  it('schaltet die Funktion nicht ein, nur weil es eine Seite dafür gäbe', () => {
    expect(isFeatureEnabled(US_AKTIV, 'costs')).toBe(false);
    expect(routeExists(US_AKTIV, 'costs')).toBe(false);
  });

  it('lässt den deutschen Markt unberührt', () => {
    // Auch DE hat in der versionierten Konfiguration keinen Kostenadapter:
    // der Rechner liest eine geprüfte Datei, keinen Anbieter. Wichtig ist,
    // dass die Antwort für DE dieselbe bleibt, egal was der Testmarkt tut.
    const kosten = registry().resolve(DE, 'costs');
    expect(kosten.kind).toBe('unsupported');
    if (kosten.kind === 'unsupported') {
      expect(kosten.reason).toContain('Markt DE');
    }
  });

  it('gibt einem Markt mit eigenem Adapter genau diesen', () => {
    const mitAdapter: MarketConfig = {
      ...DE,
      providerIds: { ...DE.providerIds, costs: 'de-got-2022' },
    };
    const kosten = registry().resolve(mitAdapter, 'costs');
    expect(isSupported(kosten)).toBe(true);
  });
});

describe('Währung und Maßsystem folgen dem Markt', () => {
  it('formatiert denselben Betrag je Markt in seiner Währung', () => {
    const euro = formatMoney(money(1999, 'EUR'), DE.locale);
    const dollar = formatMoney(money(1999, 'USD'), US_AKTIV.locale);
    expect(euro).toContain('€');
    expect(dollar).toContain('$');
    expect(euro).not.toContain('$');
  });

  it('rechnet keinen Betrag in eine andere Währung um', () => {
    // Es gibt keinen Wechselkurs im System, und das ist Absicht: ein
    // umgerechneter Preis wäre eine erfundene Zahl.
    expect(() => formatMoney(money(1999, 'USD'), DE.locale)).not.toThrow();
    expect(formatMoney(money(1999, 'USD'), DE.locale)).toContain('$');
  });

  it('zeigt dasselbe Gewicht je Maßsystem anders, ohne den Wert zu ändern', () => {
    const metrisch = formatWeight(fromKilograms(12), DE.locale, 'metric');
    const imperial = formatWeight(fromKilograms(12), US_AKTIV.locale, 'us');
    expect(metrisch).toContain('kg');
    expect(imperial).toMatch(/lb|pound/i);
    expect(metrisch).not.toBe(imperial);
  });
});

describe('Nichts davon wird veröffentlicht', () => {
  it('hält den Testmarkt in der versionierten Konfiguration abgeschaltet', () => {
    expect(usMarkt.enabled).toBe(false);
    expect(enabledMarkets().map((markt) => markt.id)).toEqual(['DE']);
  });

  it('erzeugt keine einzige internationale Seite', () => {
    const pfade = buildablePaths(enabledMarkets());
    expect(pfade.every((pfad) => pfad.startsWith('/de-de/'))).toBe(true);
    expect(pfade.some((pfad) => pfad.startsWith('/en-us/'))).toBe(false);
  });

  it('hat in der versionierten Konfiguration weiterhin keinen Adapter', () => {
    expect(usMarkt.providerIds.places).toBeNull();
    expect(usMarkt.providerIds.costs).toBeNull();
  });

  it('hat alle Funktionsflags aus', () => {
    for (const [name, an] of Object.entries(usMarkt.featureFlags)) {
      expect(an, name).toBe(false);
    }
  });
});
