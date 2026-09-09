/**
 * M13-03 — Feedabruf zur Buildzeit.
 *
 * Der Feed eines Partnernetzwerks ist **Vertragsdaten mit Zugangstoken in der
 * Adresse**. Daraus folgt alles Weitere:
 *
 * - Die Adresse steht in einem **Secret**, nicht im Repository. Fehlt es,
 *   wird der Name protokolliert — nie der Wert, auch nicht gekürzt.
 * - Abgerufen wird nur von **erlaubten Hosts** aus `config/commerce/feeds.json`.
 *   Ein Token in der Adresse eines fremden Hosts wäre ein verschenktes Secret.
 * - Gelesen wird **gedrosselt**: in Stücken, mit harter Obergrenze. Ein
 *   Produktfeed mit mehreren hundert Megabyte darf den Build nicht sprengen.
 * - Ein **TTL** verhindert, dass jeder Build erneut abruft.
 * - Öffentlich wird nur eine **ausdrücklich aufgezählte Projektion**, und auch
 *   die nur mit vertraglicher Anzeigeerlaubnis. Ohne Vertrag entsteht keine
 *   Ausgabe — und das ist kein Fehler, sondern der Normalzustand.
 *
 * Ausführen: `npm run build:commerce`
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import feeds from '../../config/commerce/feeds.json' with { type: 'json' };
import type { Offer, Product } from '../../src/domain/schemas/catalog.ts';
import { canonicalJson, type JsonValue } from '../normalize/canonical.ts';

export interface FeedKonfiguration {
  readonly feedId: string;
  readonly network: string;
  readonly marketId: string;
  readonly secretName: string;
  readonly allowedHosts: readonly string[];
  readonly note: string;
}

export const FEEDS: readonly FeedKonfiguration[] = feeds.feeds as FeedKonfiguration[];
export const MAX_BYTES: number = feeds.maxBytes;
export const TTL_HOURS: number = feeds.ttlHours;

export interface SecretStand {
  readonly feedId: string;
  readonly vorhanden: boolean;
  /** Meldung für das Log. Enthält nie einen Wert. */
  readonly meldung: string;
}

/**
 * Welche Secrets sind gesetzt? Die Antwort nennt **Namen**, niemals Werte —
 * auch keine Präfixe, keine Länge, keinen Hash. Ein Log wandert in Artefakte,
 * und ein Artefakt ist öffentlich, sobald es jemand herunterlädt.
 */
export function secretStand(
  env: Readonly<Record<string, string | undefined>>,
): readonly SecretStand[] {
  return FEEDS.map((feed) => {
    const wert = env[feed.secretName];
    const vorhanden = typeof wert === 'string' && wert.trim() !== '';
    return {
      feedId: feed.feedId,
      vorhanden,
      meldung: vorhanden
        ? `${feed.feedId}: Secret ${feed.secretName} ist gesetzt.`
        : `${feed.feedId}: Secret ${feed.secretName} fehlt; dieser Feed wird nicht abgerufen.`,
    };
  });
}

export class CommerceBuildError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CommerceBuildError';
  }
}

/** Adresse ohne Query und Fragment — für Logs und Fehlermeldungen. */
export function ohneGeheimnis(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return '<nicht parsebare Adresse>';
  }
}

/**
 * Prüft die Adresse aus dem Secret gegen die Allowlist. Die Fehlermeldung
 * enthält den Host, aber nie die Query — dort steht der Token.
 */
export function pruefeFeedUrl(url: string, erlaubteHosts: readonly string[]): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new CommerceBuildError('Feedadresse ist nicht parsebar.');
  }
  if (parsed.protocol !== 'https:') {
    throw new CommerceBuildError(`Nur https ist zulässig, nicht "${parsed.protocol}".`);
  }
  if (!erlaubteHosts.includes(parsed.host)) {
    throw new CommerceBuildError(
      `Host ${parsed.host} steht nicht in der Allowlist. Ein Token an einen fremden Host zu senden ` +
        'wäre ein verschenktes Secret.',
    );
  }
  return parsed;
}

/** Ist der zwischengespeicherte Stand älter als das TTL? */
export function ttlAbgelaufen(
  letzterAbruf: string | null,
  jetzt: string,
  stunden = TTL_HOURS,
): boolean {
  if (letzterAbruf === null) return true;
  const alt = Date.parse(letzterAbruf);
  const neu = Date.parse(jetzt);
  if (Number.isNaN(alt) || Number.isNaN(neu)) return true;
  return neu - alt >= stunden * 3_600_000;
}

/**
 * Liest einen Datenstrom in Stücken mit harter Obergrenze.
 *
 * Der Abbruch passiert **während** des Lesens, nicht danach: ein Feed, der
 * die Grenze überschreitet, soll den Speicher nicht erst füllen.
 */
export async function leseGedrosselt(
  strom: ReadableStream<Uint8Array>,
  maxBytes = MAX_BYTES,
): Promise<Uint8Array> {
  const leser = strom.getReader();
  const stuecke: Uint8Array[] = [];
  let gesamt = 0;
  for (;;) {
    const { done, value } = await leser.read();
    if (done) break;
    if (value === undefined) continue;
    gesamt += value.byteLength;
    if (gesamt > maxBytes) {
      await leser.cancel();
      throw new CommerceBuildError(
        `Feed überschreitet ${maxBytes} Byte. Abbruch während des Lesens, nicht danach.`,
      );
    }
    stuecke.push(value);
  }
  const ergebnis = new Uint8Array(gesamt);
  let versatz = 0;
  for (const stueck of stuecke) {
    ergebnis.set(stueck, versatz);
    versatz += stueck.byteLength;
  }
  return ergebnis;
}

/**
 * Felder, die ein Angebot öffentlich tragen darf. Was hier nicht steht,
 * verlässt den Build nicht — auch nicht „nur zum Debuggen“.
 */
export const OEFFENTLICHE_ANGEBOTSFELDER: readonly string[] = [
  'offerId',
  'productId',
  'merchantId',
  'marketId',
  'currency',
  'priceMinor',
  'shippingMinor',
  'availability',
  'kind',
  'affiliateUrl',
  'fetchedAt',
  'expiresAt',
];

export const OEFFENTLICHE_PRODUKTFELDER: readonly string[] = [
  'productId',
  'species',
  'category',
  'brand',
  'gtin',
  'variant',
  'netContentGrams',
  'packUnits',
  'material',
];

/** Ausdrückliche Projektion. Kein `...spread`, keine Restfelder. */
export function oeffentlichesAngebot(angebot: Offer): Record<string, JsonValue> {
  return {
    offerId: angebot.offerId,
    productId: angebot.productId,
    merchantId: angebot.merchantId,
    marketId: angebot.marketId,
    currency: angebot.currency,
    priceMinor: angebot.priceMinor,
    shippingMinor: angebot.shippingMinor,
    availability: angebot.availability,
    kind: angebot.kind,
    affiliateUrl: angebot.affiliateUrl,
    fetchedAt: angebot.fetchedAt,
    expiresAt: angebot.expiresAt,
  };
}

export function oeffentlichesProdukt(produkt: Product): Record<string, JsonValue> {
  return {
    productId: produkt.productId,
    species: produkt.species,
    category: produkt.category,
    brand: produkt.brand,
    gtin: produkt.gtin,
    variant: produkt.variant,
    netContentGrams: produkt.netContentGrams,
    packUnits: produkt.packUnits,
    material: produkt.material,
  };
}

/**
 * Die öffentlich auslieferbaren Angebote: nur mit Anzeigeerlaubnis, nur im
 * richtigen Markt, nur unverfallen — und nur in der Projektion.
 */
export function oeffentlicheAusgabe(
  angebote: readonly Offer[],
  produkte: readonly Product[],
  marketId: string,
  jetzt: string,
): { readonly offers: readonly JsonValue[]; readonly products: readonly JsonValue[] } {
  const erlaubt = angebote.filter(
    (angebot) =>
      angebot.displayPermission &&
      angebot.marketId === marketId &&
      (angebot.expiresAt === null || angebot.expiresAt > jetzt),
  );
  const produktIds = new Set(erlaubt.map((angebot) => angebot.productId));
  return {
    offers: erlaubt.map(oeffentlichesAngebot),
    products: produkte
      .filter((produkt) => produktIds.has(produkt.productId))
      .map(oeffentlichesProdukt),
  };
}

export function schreibeAusgabe(pfad: string, inhalt: JsonValue): void {
  mkdirSync(dirname(pfad), { recursive: true });
  writeFileSync(pfad, `${canonicalJson(inhalt)}\n`, 'utf8');
}

const ZIEL = 'dist/data/v1/commerce/de/offers.json';

/** No partner contract is configured. Remove stale offers on every build. */
export async function prepareCommerce(
  env: Readonly<Record<string, string | undefined>>,
): Promise<void> {
  rmSync(ZIEL, { force: true });
  rmSync('.generated/commerce.json', { force: true });
  if (secretStand(env).some((entry) => entry.vorhanden)) {
    throw new CommerceBuildError(
      'Feed-Secret gesetzt, aber kein Partnervertrag freigegeben. Bitte zuerst Vertrag und Ausgabeformen konfigurieren.',
    );
  }
  console.log(
    'Keine Partnerangebote konfiguriert; redaktionelle Herstellerangaben bleiben verfügbar.',
  );
}

export function publishCommerce(): void {
  rmSync(ZIEL, { force: true });
}

if (import.meta.filename === process.argv[1]) {
  prepareCommerce(process.env).catch((error: unknown) => {
    console.error(
      error instanceof CommerceBuildError ? error.message : 'Commerce-Build fehlgeschlagen.',
    );
    process.exitCode = 1;
  });
}
