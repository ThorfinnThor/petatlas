import fressnapf from '../../../content-data/products/fressnapf-catalog.json' with { type: 'json' };
import zooroyal from '../../../content-data/products/zooroyal-catalog.json' with { type: 'json' };
import type { CatalogCategory, CatalogSpecies } from '../../../scripts/awin/fressnapf.ts';

export interface CatalogProductOffer {
  readonly productId: string;
  readonly productName: string;
  readonly brand: string;
  readonly species: CatalogSpecies;
  readonly category: CatalogCategory;
  readonly categoryLabel: string;
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
