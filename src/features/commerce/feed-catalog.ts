import fressnapf from '../../../content-data/products/fressnapf-catalog.json' with { type: 'json' };
import { fressnapfBildUrspruenge } from './fressnapf-feed.ts';
import { zooroyalAngebote } from './zooroyal-feed.ts';
import zooroyal from '../../../content-data/products/zooroyal-catalog.json' with { type: 'json' };
import type { CatalogCategory, CatalogSpecies } from '../../../scripts/awin/fressnapf.ts';

export interface CatalogProductOffer {
  readonly productId: string;
  readonly productName: string;
  readonly brand: string;
  readonly species: CatalogSpecies;
  readonly category: CatalogCategory;
  readonly categoryLabel: string;
  readonly subcategoryLabel?: string;
  readonly merchantProductId: string;
  readonly imageUrl: string;
  readonly affiliateUrl: string;
  readonly merchantUrl: string;
}

const AWIN_HOSTS = new Set(['awin1.com', 'www.awin1.com', 'awin1.net', 'www.awin1.net']);
const MERCHANT_HOSTS = {
  fressnapf: new Set(['fressnapf.de', 'www.fressnapf.de']),
  zooroyal: new Set(['zooroyal.de', 'www.zooroyal.de']),
} as const;

function httpsUrl(raw: unknown): URL | null {
  if (typeof raw !== 'string') return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port ? url : null;
  } catch {
    return null;
  }
}

function validiere(
  raw: unknown,
  advertiserId: string,
  merchantHosts: ReadonlySet<string>,
): CatalogProductOffer | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const value = raw as Record<string, unknown>;
  const productId = typeof value.productId === 'string' ? value.productId : '';
  const productName = typeof value.productName === 'string' ? value.productName : '';
  const brand = typeof value.brand === 'string' ? value.brand : '';
  const merchantProductId =
    typeof value.merchantProductId === 'string' ? value.merchantProductId : '';
  const species = value.species === 'dog' || value.species === 'cat' ? value.species : null;
  const category = ['toy', 'supplement', 'food', 'care'].includes(String(value.category))
    ? (value.category as CatalogCategory)
    : null;
  const categoryLabel = typeof value.categoryLabel === 'string' ? value.categoryLabel : '';
  const subcategoryLabel =
    typeof value.subcategoryLabel === 'string' && value.subcategoryLabel.length <= 60
      ? value.subcategoryLabel
      : undefined;
  const image = httpsUrl(value.imageUrl);
  const affiliate = httpsUrl(value.affiliateUrl);
  const merchant = httpsUrl(value.merchantUrl);
  if (
    !productId ||
    !productName ||
    !brand ||
    !merchantProductId ||
    !species ||
    !category ||
    !categoryLabel ||
    !image ||
    !affiliate ||
    !merchant ||
    !merchantHosts.has(merchant.host) ||
    !AWIN_HOSTS.has(affiliate.host)
  )
    return null;
  const advertiser = affiliate.searchParams.get('m') ?? affiliate.searchParams.get('awinmid');
  const publisher = affiliate.searchParams.get('a') ?? affiliate.searchParams.get('awinaffid');
  if (advertiser !== advertiserId || publisher !== '3037577') return null;
  return {
    productId,
    productName,
    brand,
    species,
    category,
    categoryLabel,
    ...(subcategoryLabel ? { subcategoryLabel } : {}),
    merchantProductId,
    imageUrl: image.toString(),
    affiliateUrl: affiliate.toString(),
    merchantUrl: merchant.toString(),
  };
}

function lade(
  raw: unknown,
  advertiserId: string,
  merchantHosts: ReadonlySet<string>,
): readonly CatalogProductOffer[] {
  if (typeof raw !== 'object' || raw === null) return [];
  const value = raw as Record<string, unknown>;
  if (
    value.schemaVersion !== 1 ||
    value.advertiserId !== advertiserId ||
    value.publisherId !== '3037577'
  )
    return [];
  if (!Array.isArray(value.products)) return [];
  const gesehen = new Set<string>();
  return value.products.flatMap((entry) => {
    const product = validiere(entry, advertiserId, merchantHosts);
    if (!product || gesehen.has(product.merchantProductId)) return [];
    gesehen.add(product.merchantProductId);
    return [product];
  });
}

const FRESSNAPF = lade(fressnapf, '14757', MERCHANT_HOSTS.fressnapf);
const ZOOROYAL = lade(zooroyal, '14979', MERCHANT_HOSTS.zooroyal);

export function fressnapfKatalog(): readonly CatalogProductOffer[] {
  return FRESSNAPF;
}

export function zooroyalKatalog(): readonly CatalogProductOffer[] {
  return ZOOROYAL;
}

export function partnerKatalogProdukte(
  partner: 'fressnapf' | 'zooroyal',
  category: CatalogCategory,
): readonly CatalogProductOffer[] {
  return (partner === 'fressnapf' ? FRESSNAPF : ZOOROYAL).filter(
    (product) => product.category === category,
  );
}

/**
 * Herkünfte aller Partner-Produktbilder (Feeds und Kataloge). CSP und
 * Output-Audit erlauben genau diese Hosts – nicht mehr, und keinen Host,
 * nur weil er in einem Feed vorkommen könnte.
 */
export function partnerBildUrspruenge(): readonly string[] {
  return [
    ...new Set([
      ...fressnapfBildUrspruenge(),
      ...zooroyalAngebote().map((angebot) => new URL(angebot.imageUrl).origin),
      ...[...FRESSNAPF, ...ZOOROYAL].map((produkt) => new URL(produkt.imageUrl).origin),
    ]),
  ].sort();
}

const OHNE_MARKE = 'Herstellerangabe nicht angegeben';

/** „Marke · Rubrik“ unter dem Produktnamen; eine unbekannte Marke entfällt. */
export function katalogMeta(product: CatalogProductOffer): string {
  return [
    product.brand === OHNE_MARKE ? null : product.brand,
    product.subcategoryLabel ?? product.categoryLabel,
  ]
    .filter(Boolean)
    .join(' · ');
}

function variantenSchluessel(product: CatalogProductOffer): string {
  return `${product.species}:${product.brand}:${product.productName}`
    .toLocaleLowerCase('de-DE')
    .replace(/\b\d+\s*x\s*\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l)\b/giu, '')
    .replace(/\b\d+(?:[.,]\d+)?\s*(?:kg|g|ml|l)\b/giu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Die Produkte einer Kategorie, wie sie eine Händlerliste zeigt. */
export function katalogAuswahl(
  offers: readonly CatalogProductOffer[],
  category: CatalogCategory,
  optionen: { readonly perSpeciesLimit?: number; readonly deduplicateVariants?: boolean } = {},
): readonly CatalogProductOffer[] {
  const alle = offers.filter((offer) => offer.category === category);
  const einzeln = optionen.deduplicateVariants
    ? alle.filter(
        (product, index, liste) =>
          liste.findIndex(
            (kandidat) => variantenSchluessel(kandidat) === variantenSchluessel(product),
          ) === index,
      )
    : alle;
  const limit = optionen.perSpeciesLimit;
  return limit === undefined
    ? einzeln
    : (['dog', 'cat'] as const).flatMap((species) =>
        einzeln.filter((product) => product.species === species).slice(0, limit),
      );
}

/** Die ersten `anzahl` Produkte, Hund und Katze im Wechsel. */
export function startauswahl(
  products: readonly CatalogProductOffer[],
  anzahl: number,
): readonly CatalogProductOffer[] {
  const hunde = products.filter((product) => product.species === 'dog');
  const katzen = products.filter((product) => product.species === 'cat');
  const gemischt: CatalogProductOffer[] = [];
  const laenge = Math.max(hunde.length, katzen.length);
  for (let i = 0; i < laenge && gemischt.length < anzahl; i++) {
    const hund = hunde[i];
    const katze = katzen[i];
    if (hund) gemischt.push(hund);
    if (katze) gemischt.push(katze);
  }
  return gemischt.slice(0, anzahl);
}

/** Pfad der nachladbaren Spielzeug-Händlerprodukte (siehe Toys.astro). */
export const SPIELZEUG_KATALOG_PFAD = '/data/v1/katalog/spielzeug.json';

/** Ein Händlerprodukt, wie es nachgeladen und im Browser zur Karte wird. */
export interface KatalogEintrag {
  readonly id: string;
  readonly haendler: string;
  readonly art: CatalogSpecies;
  readonly rubrik: string;
  readonly name: string;
  readonly meta: string;
  readonly bild: string;
  readonly link: string;
}

export function katalogEintraege(
  products: readonly CatalogProductOffer[],
  haendler: string,
): readonly KatalogEintrag[] {
  return products.map((product) => ({
    id: product.productId,
    haendler,
    art: product.species,
    rubrik: product.subcategoryLabel ?? '',
    name: product.productName,
    meta: katalogMeta(product),
    bild: product.imageUrl,
    link: product.affiliateUrl,
  }));
}
