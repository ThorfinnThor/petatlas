/**
 * M03-05 — Provider-Schnittstellen.
 *
 * Fachmodule fragen nie „ist das Land DE?“. Sie fragen die Registry nach dem
 * Provider, den die Marktkonfiguration für diesen Bereich benennt. Gibt es
 * keinen, ist das Ergebnis `unsupported` — und ausdrücklich **kein**
 * deutscher Ersatzwert. Eine Gebührenordnung eines Landes auf ein anderes
 * anzuwenden wäre erfundene Auskunft.
 *
 * Damit steht die Providerwahl an genau einer Stelle statt in verstreuten
 * `if (country === 'DE')`-Blöcken.
 */
import type { MarketConfig } from './market.ts';
import type { CostScenario, FeeItem, Offer, Place, TravelRule } from './schemas/index.ts';

/** Die Bereiche, für die es je Markt einen eigenen Adapter geben kann. */
export type ProviderDomain = 'costs' | 'places' | 'travel' | 'commerce';

/**
 * Ergebnis einer Providerabfrage. `unsupported` ist ein regulärer,
 * auswertbarer Rückgabewert, kein Fehler und kein leeres Ergebnis: „keine
 * Daten“ und „für diesen Markt nicht unterstützt“ sind verschiedene Aussagen.
 */
export type ProviderResult<T> =
  | { readonly kind: 'supported'; readonly value: T }
  | { readonly kind: 'unsupported'; readonly reason: string };

export function supported<T>(value: T): ProviderResult<T> {
  return { kind: 'supported', value };
}

export function unsupported<T>(reason: string): ProviderResult<T> {
  return { kind: 'unsupported', reason };
}

export function isSupported<T>(
  result: ProviderResult<T>,
): result is { kind: 'supported'; value: T } {
  return result.kind === 'supported';
}

interface ProviderBase {
  /** Eindeutige ID, wie sie in `config/markets/<ID>.json` steht. */
  readonly providerId: string;
  /** Der Markt, für den dieser Adapter zuständig ist. */
  readonly marketId: string;
}

export interface CostProvider extends ProviderBase {
  readonly domain: 'costs';
  /** Gebührenkatalog des Marktes. */
  listFeeItems(): ProviderResult<readonly FeeItem[]>;
  getScenario(scenarioId: string): ProviderResult<CostScenario | null>;
}

export interface PlacesProvider extends ProviderBase {
  readonly domain: 'places';
  findPlaces(query: { readonly municipality: string }): ProviderResult<readonly Place[]>;
}

export interface TravelProvider extends ProviderBase {
  readonly domain: 'travel';
  rulesFor(destinationCountry: string): ProviderResult<readonly TravelRule[]>;
}

export interface CommerceProvider extends ProviderBase {
  readonly domain: 'commerce';
  listOffers(productId: string): ProviderResult<readonly Offer[]>;
}

export type Provider = CostProvider | PlacesProvider | TravelProvider | CommerceProvider;

export type ProviderFor<D extends ProviderDomain> = D extends 'costs'
  ? CostProvider
  : D extends 'places'
    ? PlacesProvider
    : D extends 'travel'
      ? TravelProvider
      : CommerceProvider;

/**
 * Registry der bekannten Adapter. Sie ist bewusst leer, solange kein echter
 * Adapter existiert: ein leerer Startzustand liefert `unsupported`, nicht
 * stillschweigend deutsche Daten.
 */
export class ProviderRegistry {
  readonly #providers = new Map<string, Provider>();

  static #key(domain: ProviderDomain, providerId: string): string {
    return `${domain}:${providerId}`;
  }

  register(provider: Provider): this {
    const key = ProviderRegistry.#key(provider.domain, provider.providerId);
    if (this.#providers.has(key)) {
      throw new Error(`Provider ${key} ist bereits registriert.`);
    }
    this.#providers.set(key, provider);
    return this;
  }

  /**
   * Löst den für diesen Markt konfigurierten Adapter auf.
   *
   * Drei getrennte Fälle, die nicht zusammenfallen dürfen:
   * kein Eintrag in der Marktkonfiguration, ein Eintrag ohne registrierten
   * Adapter, und ein Adapter, der für einen anderen Markt gebaut wurde.
   */
  resolve<D extends ProviderDomain>(
    market: MarketConfig,
    domain: D,
  ): ProviderResult<ProviderFor<D>> {
    const providerId = market.providerIds[domain];
    if (providerId === undefined || providerId === null) {
      return unsupported(
        `Markt ${market.id} hat keinen ${domain}-Provider konfiguriert. Kein Rückfall auf einen anderen Markt.`,
      );
    }

    const provider = this.#providers.get(ProviderRegistry.#key(domain, providerId));
    if (!provider) {
      return unsupported(
        `Provider ${providerId} für ${domain} ist nicht registriert. Markt ${market.id} bleibt ohne Daten.`,
      );
    }

    if (provider.marketId !== market.id) {
      return unsupported(
        `Provider ${providerId} gehört zu Markt ${provider.marketId} und wird für ${market.id} nicht verwendet.`,
      );
    }

    return supported(provider as ProviderFor<D>);
  }

  /** Nur für Tests und Diagnose. */
  registeredIds(): readonly string[] {
    return [...this.#providers.keys()].sort();
  }
}

/** Die im Produktivpfad verwendete Registry. Im Startumfang ohne Adapter. */
export const providers = new ProviderRegistry();
