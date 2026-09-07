// M04-01 — Route Registry: keine hart codierten Domains, keine Links auf
// Seiten, die es nicht gibt.
import { describe, expect, it } from 'vitest';

import {
  allMarkets,
  isFeatureEnabled,
  requireMarket,
  type MarketConfig,
} from '../src/domain/market.ts';
import {
  ROUTES,
  RouteError,
  buildablePaths,
  canonicalUrl,
  navigationFor,
  redirectsFor,
  routeExists,
  routePath,
  subroutePath,
} from '../src/lib/routes.ts';

const DE = requireMarket('DE');

function withFeature(market: MarketConfig, feature: string, on: boolean): MarketConfig {
  return { ...market, featureFlags: { ...market.featureFlags, [feature]: on } };
}

describe('Unterseiten', () => {
  const mitKarte = withFeature(DE, 'map', true);

  it('hängt den Slug an den Routenpfad', () => {
    expect(subroutePath(mitKarte, 'map', 'muenchen')).toBe('/de-de/tierarzt-karte/muenchen/');
  });

  it('lehnt einen Slug ab, der kein Slug ist', () => {
    expect(() => subroutePath(mitKarte, 'map', '../geheim')).toThrow(RouteError);
    expect(() => subroutePath(mitKarte, 'map', 'München')).toThrow(RouteError);
    expect(() => subroutePath(mitKarte, 'map', '')).toThrow(RouteError);
  });

  it('gibt keinen Pfad unter einer abgeschalteten Route aus', () => {
    expect(() => subroutePath(withFeature(DE, 'map', false), 'map', 'muenchen')).toThrow(
      RouteError,
    );
  });
});

describe('Pfade', () => {
  it('setzt Marktpräfix und abschließenden Schrägstrich', () => {
    expect(routePath(DE, 'home')).toBe('/de-de/');
    expect(routePath(DE, 'sources')).toBe('/de-de/quellen/');
    expect(routePath(DE, 'imprint')).toBe('/de-de/impressum/');
  });

  it('verwendet die Slugs des Marktes, nicht die Routenschlüssel', () => {
    expect(routePath(DE, 'dataStatus')).toBe('/de-de/datenstand/');
    expect(routePath(DE, 'dataStatus')).not.toContain('dataStatus');
  });

  it('erzeugt für einen anderen Markt andere Pfade', () => {
    const us = withFeature(requireMarket('US'), 'costs', true);
    expect(routePath(us, 'costs')).toBe('/en-us/vet-costs/');
    expect(routePath(us, 'home')).toBe('/en-us/');
  });
});

describe('Keine hart codierte Domain', () => {
  it('baut die absolute URL aus einer übergebenen Basis', () => {
    expect(canonicalUrl('https://example.invalid', DE, 'sources')).toBe(
      'https://example.invalid/de-de/quellen/',
    );
    expect(canonicalUrl('https://andere.example', DE, 'sources')).toBe(
      'https://andere.example/de-de/quellen/',
    );
  });

  it('enthält in keiner Routendefinition eine Domain', () => {
    const text = JSON.stringify(ROUTES);
    expect(text).not.toMatch(/https?:\/\//);
  });
});

describe('Ausgeschaltete Funktionen haben keine Route', () => {
  it('kennt im Startzustand keine Rechnerroute', () => {
    expect(isFeatureEnabled(DE, 'costs')).toBe(false);
    expect(routeExists(DE, 'costs')).toBe(false);
    expect(() => routePath(DE, 'costs')).toThrow(RouteError);
  });

  it('nennt in der Navigation keine ausgeschaltete Funktion', () => {
    const keys = navigationFor(DE).map((item) => item.key);
    expect(keys).not.toContain('costs');
    expect(keys).not.toContain('map');
    expect(keys).toContain('home');
  });

  it('nimmt eine Route auf, sobald ihr Flag an ist', () => {
    const mitRechner = withFeature(DE, 'costs', true);
    expect(routeExists(mitRechner, 'costs')).toBe(true);
    expect(routePath(mitRechner, 'costs')).toBe('/de-de/tierarztkosten/');
    expect(navigationFor(mitRechner).map((item) => item.key)).toContain('costs');
  });

  it('trennt Hauptnavigation und Fußbereich', () => {
    const footer = navigationFor(DE, 'footer').map((item) => item.key);
    expect(footer).toEqual(['sources', 'dataStatus', 'imprint', 'privacy']);
    expect(navigationFor(DE).map((item) => item.key)).not.toContain('imprint');
  });
});

describe('Baubare Pfade', () => {
  it('erzeugt nur Pfade aktiver Märkte', () => {
    const paths = buildablePaths(allMarkets());
    expect(paths.every((path) => path.startsWith('/de-de/'))).toBe(true);
    expect(paths).not.toContain('/en-us/');
  });

  it('enthält im Startzustand keine Feature-Seiten', () => {
    const paths = buildablePaths(allMarkets());
    expect(paths).toEqual([
      '/de-de/',
      '/de-de/quellen/',
      '/de-de/datenstand/',
      '/de-de/impressum/',
      '/de-de/datenschutz/',
    ]);
  });
});

describe('Slugwechsel', () => {
  it('hat im Startzustand keine Altlasten', () => {
    expect(redirectsFor(DE)).toEqual([]);
  });

  it('bildet einen umbenannten Slug als Redirect ab', () => {
    // Angenommen, "quellen" hieße früher "datenquellen".
    expect(redirectsFor(DE, { datenquellen: 'sources' })).toEqual([
      { from: '/de-de/datenquellen/', to: '/de-de/quellen/' },
    ]);
  });

  it('erzeugt keinen Redirect auf eine abgeschaltete Route', () => {
    expect(redirectsFor(DE, { gebuehrenrechner: 'costs' })).toEqual([]);
  });
});
