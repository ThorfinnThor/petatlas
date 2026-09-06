/**
 * M03-01 — Marktmodell.
 *
 * Markt, Sprache, Währung, Zeitzone und geografisches Reiseziel sind fünf
 * verschiedene Dinge (ADR-010). Diese Datei ist die einzige Stelle, die sie
 * zusammenführt. Fachmodule fragen hier nach; sie schreiben weder `de-DE`
 * noch `EUR` noch `€` selbst hin.
 *
 * Ein Reiseziel ist kein Markt: ein deutscher Nutzer, der nach Italien reist,
 * bleibt in `market=DE`. Nur `enabled: true` erzeugt Routen.
 */
import { z } from 'zod';

import DE from '../../config/markets/DE.json' with { type: 'json' };
import NL from '../../config/markets/NL.json' with { type: 'json' };
import US from '../../config/markets/US.json' with { type: 'json' };

/** ISO-3166-1-alpha-2, Großbuchstaben. Auch für Reiseziele verwendet. */
export const CountryCode = z.string().regex(/^[A-Z]{2}$/, 'Erwartet wird ein Ländercode wie DE.');

export const MarketConfigSchema = z
  .object({
    id: CountryCode,
    enabled: z.boolean(),
    primaryCountry: CountryCode,
    /** BCP 47, z. B. de-DE. Nicht mit dem Markt gleichsetzen. */
    locale: z.string().regex(/^[a-z]{2}-[A-Z]{2}$/, 'Erwartet wird ein Locale wie de-DE.'),
    pathPrefix: z.string().regex(/^\/[a-z]{2}-[a-z]{2}$/, 'Erwartet wird ein Präfix wie /de-de.'),
    /** ISO 4217. */
    currency: z.string().regex(/^[A-Z]{3}$/, 'Erwartet wird eine Währung wie EUR.'),
    timeZone: z.string().min(1),
    measurementSystem: z.enum(['metric', 'us']),
    featureFlags: z.record(z.string(), z.boolean()),
    providerIds: z.record(z.string(), z.string().nullable()),
  })
  .strict();

export type MarketConfig = z.infer<typeof MarketConfigSchema>;
export type MarketId = MarketConfig['id'];

function parseMarket(raw: unknown): MarketConfig {
  const result = MarketConfigSchema.safeParse(raw);
  if (!result.success) {
    const id =
      typeof raw === 'object' && raw !== null && 'id' in raw ? String(raw.id) : 'unbekannt';
    throw new Error(`Marktkonfiguration ${id} ist ungültig: ${result.error.message}`);
  }
  const market = result.data;
  if (!market.timeZone.includes('/')) {
    throw new Error(`Marktkonfiguration ${market.id}: timeZone muss eine IANA-Zone sein.`);
  }
  // Das Locale trägt das Land nur zufällig; die Marktzuordnung ist verbindlich.
  if (market.locale.slice(3) !== market.id) {
    throw new Error(
      `Marktkonfiguration ${market.id}: locale ${market.locale} passt nicht zur Markt-ID.`,
    );
  }
  return market;
}

const MARKETS: readonly MarketConfig[] = [DE, US, NL].map(parseMarket);

const BY_ID = new Map(MARKETS.map((market) => [market.id, market]));

/** Alle konfigurierten Märkte, auch die deaktivierten Testkonfigurationen. */
export function allMarkets(): readonly MarketConfig[] {
  return MARKETS;
}

/** Nur Märkte, die tatsächlich Seiten erzeugen dürfen. */
export function enabledMarkets(): readonly MarketConfig[] {
  return MARKETS.filter((market) => market.enabled);
}

/** Der Standardmarkt. Er wird nie aus der Sprache oder IP des Besuchers geraten. */
export function defaultMarket(): MarketConfig {
  const [first] = enabledMarkets();
  if (!first) throw new Error('Kein aktiver Markt konfiguriert.');
  return first;
}

export function getMarket(id: string): MarketConfig | undefined {
  return BY_ID.get(id);
}

/**
 * Liefert einen Markt oder wirft. Für Aufrufer, die ohne gültigen Markt nicht
 * sinnvoll weiterarbeiten können.
 */
export function requireMarket(id: string): MarketConfig {
  const market = BY_ID.get(id);
  if (!market) throw new Error(`Unbekannter Markt: ${id}`);
  return market;
}

/** Pfadpräfixe, für die statische Seiten erzeugt werden dürfen. */
export function routablePathPrefixes(): readonly string[] {
  return enabledMarkets().map((market) => market.pathPrefix);
}

export function isFeatureEnabled(market: MarketConfig, feature: string): boolean {
  // Unbekannt ist nicht aktiviert.
  return market.featureFlags[feature] === true;
}

/**
 * Der Kontext einer Reiseabfrage. `market` bleibt der Markt des Nutzers;
 * `destinationCountry` ist ein reines Ziel und wird dadurch **nicht** zu einem
 * Markt. Ein Zielstaat ohne eigene Marktkonfiguration ist der Normalfall.
 */
export interface TravelContext {
  readonly market: MarketConfig;
  readonly destinationCountry: string;
  /** true, wenn für das Ziel zufällig auch eine Marktkonfiguration existiert. */
  readonly destinationIsConfiguredMarket: boolean;
}

export function createTravelContext(marketId: string, destinationCountry: string): TravelContext {
  const market = requireMarket(marketId);
  const destination = CountryCode.parse(destinationCountry);
  return {
    market,
    destinationCountry: destination,
    destinationIsConfiguredMarket: BY_ID.has(destination),
  };
}
