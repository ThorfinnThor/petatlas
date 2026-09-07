/**
 * M04-01 — Route Registry.
 *
 * Alle Pfade entstehen hier. Kein Modul schreibt `/de-de/tierarztkosten/`
 * selbst hin, und keins kennt die Domain: die Basis-URL kommt aus der
 * Build-Konfiguration (M00-03/M01-05). Ein Slugwechsel ist damit eine
 * Änderung an einer Locale-Datei plus einem Redirect-Eintrag, kein
 * projektweites Suchen und Ersetzen.
 *
 * Jede Route nennt die Funktion, die sie braucht. Ist deren Feature Flag
 * aus, existiert die Route nicht — sie erscheint weder in der Navigation
 * noch als leere „demnächst“-Seite.
 */
import de from '../../config/locales/de-DE.json' with { type: 'json' };
import en from '../../config/locales/en-US.json' with { type: 'json' };
import { isFeatureEnabled, type MarketConfig } from '../domain/market.ts';

export type RouteKey =
  | 'home'
  | 'costs'
  | 'map'
  | 'catalog'
  | 'travel'
  | 'care'
  | 'toys'
  | 'food'
  | 'sources'
  | 'dataStatus'
  | 'imprint'
  | 'privacy';

interface RouteDefinition {
  readonly key: RouteKey;
  /** Feature Flag, das diese Route freischaltet. `null` = immer vorhanden. */
  readonly requiresFeature: string | null;
  /** Darf die Seite in Suchmaschinen und in die Sitemap? */
  readonly indexable: boolean;
}

/**
 * Reihenfolge ist die Navigationsreihenfolge. Rechtliches steht am Ende und
 * gehört in den Fuß, nicht in die Hauptnavigation.
 */
export const ROUTES: readonly RouteDefinition[] = [
  { key: 'home', requiresFeature: null, indexable: true },
  { key: 'costs', requiresFeature: 'costs', indexable: true },
  { key: 'map', requiresFeature: 'map', indexable: true },
  { key: 'catalog', requiresFeature: 'commerce', indexable: true },
  { key: 'travel', requiresFeature: 'travel', indexable: true },
  { key: 'care', requiresFeature: 'care', indexable: true },
  { key: 'toys', requiresFeature: 'toys', indexable: true },
  { key: 'food', requiresFeature: 'food', indexable: true },
  { key: 'sources', requiresFeature: null, indexable: true },
  { key: 'dataStatus', requiresFeature: null, indexable: true },
  { key: 'imprint', requiresFeature: null, indexable: true },
  { key: 'privacy', requiresFeature: null, indexable: true },
];

const SLUGS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  'de-DE': de.slugs,
  'en-US': en.slugs,
};

const LEGACY_SLUGS: Readonly<Record<string, Readonly<Record<string, string>>>> = {
  'de-DE': de.legacySlugs,
  'en-US': en.legacySlugs,
};

export class RouteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RouteError';
  }
}

function slugFor(market: MarketConfig, key: RouteKey): string {
  const table = SLUGS[market.locale];
  if (!table) throw new RouteError(`Keine Slugs für Locale ${market.locale}.`);
  const slug = table[key];
  if (slug === undefined) throw new RouteError(`Kein Slug für Route "${key}" in ${market.locale}.`);
  return slug;
}

function definitionFor(key: RouteKey): RouteDefinition {
  const definition = ROUTES.find((route) => route.key === key);
  if (!definition) throw new RouteError(`Unbekannte Route: ${key}`);
  return definition;
}

/** Existiert die Route in diesem Markt? Ein ausgeschaltetes Feature heißt nein. */
export function routeExists(market: MarketConfig, key: RouteKey): boolean {
  const definition = definitionFor(key);
  if (definition.requiresFeature === null) return true;
  return isFeatureEnabled(market, definition.requiresFeature);
}

/**
 * Pfad einer Route, immer mit führendem und abschließendem Schrägstrich
 * (`trailingSlash: 'always'` in der Astro-Konfiguration).
 */
export function routePath(market: MarketConfig, key: RouteKey): string {
  if (!routeExists(market, key)) {
    throw new RouteError(
      `Route "${key}" ist im Markt ${market.id} nicht verfügbar. Kein Link auf eine leere Seite.`,
    );
  }
  const slug = slugFor(market, key);
  return slug === '' ? `${market.pathPrefix}/` : `${market.pathPrefix}/${slug}/`;
}

/**
 * Pfad einer Unterseite unterhalb einer Route — etwa eine Stadtseite unter
 * der Kartenroute. Auch diese Pfade entstehen hier und nicht in den Seiten;
 * ein ungültiger Slug ist ein Fehler und kein zusammengesetzter Pfad.
 */
export function subroutePath(market: MarketConfig, key: RouteKey, slug: string): string {
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    throw new RouteError(`"${slug}" ist kein zulässiger Slug für eine Unterseite.`);
  }
  return `${routePath(market, key)}${slug}/`;
}

/** Absolute URL. Die Basis kommt von außen; hier steht keine Domain. */
export function canonicalUrl(baseUrl: string, market: MarketConfig, key: RouteKey): string {
  return new URL(routePath(market, key), baseUrl).toString();
}

export interface NavigationItem {
  readonly key: RouteKey;
  readonly path: string;
  readonly labelKey: string;
}

/**
 * Navigation eines Marktes: nur tatsächlich vorhandene Routen. Damit kann
 * kein Eintrag auf eine leere Seite führen.
 */
export function navigationFor(
  market: MarketConfig,
  section: 'main' | 'footer' = 'main',
): readonly NavigationItem[] {
  const footerKeys: readonly RouteKey[] = ['sources', 'dataStatus', 'imprint', 'privacy'];
  return ROUTES.filter((route) => {
    if (route.key === 'home') return section === 'main';
    const inFooter = footerKeys.includes(route.key);
    return section === 'footer' ? inFooter : !inFooter;
  })
    .filter((route) => routeExists(market, route.key))
    .map((route) => ({
      key: route.key,
      path: routePath(market, route.key),
      labelKey: `nav.${route.key}`,
    }));
}

/** Alle Pfade, für die statische Seiten erzeugt werden dürfen. */
export function buildablePaths(markets: readonly MarketConfig[]): readonly string[] {
  return markets
    .filter((market) => market.enabled)
    .flatMap((market) =>
      ROUTES.filter((route) => routeExists(market, route.key)).map((route) =>
        routePath(market, route.key),
      ),
    );
}

export interface Redirect {
  readonly from: string;
  readonly to: string;
}

/**
 * Redirects für frühere Slugs. Ein umbenannter Slug hinterlässt einen
 * Eintrag in `legacySlugs`, damit alte Links nicht ins Leere laufen.
 * Der zweite Parameter ist nur für Tests gedacht.
 */
export function redirectsFor(
  market: MarketConfig,
  legacySlugs?: Readonly<Record<string, string>>,
): readonly Redirect[] {
  const legacy = legacySlugs ?? LEGACY_SLUGS[market.locale] ?? {};
  return Object.entries(legacy)
    .filter(([, key]) => routeExists(market, key as RouteKey))
    .map(([oldSlug, key]) => ({
      from: `${market.pathPrefix}/${oldSlug}/`,
      to: routePath(market, key as RouteKey),
    }));
}
