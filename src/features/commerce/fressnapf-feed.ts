import feed from '../../../content-data/products/fressnapf-feed.json' with { type: 'json' };

const ADVERTISER_ID = '14757';
const PUBLISHER_ID = '3037577';
const AWIN_HOSTS = new Set(['awin1.com', 'www.awin1.com', 'awin1.net', 'www.awin1.net']);
const FRESSNAPF_HOSTS = new Set(['fressnapf.de', 'www.fressnapf.de']);

export interface FressnapfProductOffer {
  readonly productId: string;
  readonly productName: string;
  readonly merchantProductId: string | null;
  readonly imageUrl: string;
  readonly affiliateUrl: string;
  readonly merchantUrl: string;
}

function sichereHttpsUrl(raw: unknown): URL | null {
  if (typeof raw !== 'string') return null;
  try {
    const url = new URL(raw);
    if (
      url.protocol !== 'https:' ||
      url.username !== '' ||
      url.password !== '' ||
      url.port !== ''
    ) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

export function validiereFressnapfFeedEintrag(raw: unknown): FressnapfProductOffer | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const value = raw as Record<string, unknown>;
  const productId = typeof value.productId === 'string' ? value.productId : '';
  const productName = typeof value.productName === 'string' ? value.productName : '';
  const merchantProductId =
    typeof value.merchantProductId === 'string' && value.merchantProductId !== ''
      ? value.merchantProductId
      : null;
  const imageUrl = sichereHttpsUrl(value.imageUrl);
  const affiliateUrl = sichereHttpsUrl(value.affiliateUrl);
  const merchantUrl = sichereHttpsUrl(value.merchantUrl);
  if (!productId || !productName || !imageUrl || !affiliateUrl || !merchantUrl) return null;
  if (!AWIN_HOSTS.has(affiliateUrl.host) || !FRESSNAPF_HOSTS.has(merchantUrl.host)) return null;

  const advertiser = affiliateUrl.searchParams.get('m') ?? affiliateUrl.searchParams.get('awinmid');
  const publisher =
    affiliateUrl.searchParams.get('a') ?? affiliateUrl.searchParams.get('awinaffid');
  if (advertiser !== ADVERTISER_ID || publisher !== PUBLISHER_ID) return null;

  return {
    productId,
    productName,
    merchantProductId,
    imageUrl: imageUrl.toString(),
    affiliateUrl: affiliateUrl.toString(),
    merchantUrl: merchantUrl.toString(),
  };
}

function lade(): readonly FressnapfProductOffer[] {
  if (
    feed.schemaVersion !== 1 ||
    feed.advertiserId !== ADVERTISER_ID ||
    feed.publisherId !== PUBLISHER_ID ||
    !Array.isArray(feed.products)
  ) {
    return [];
  }

  const gesehen = new Set<string>();
  const produkte: FressnapfProductOffer[] = [];
  for (const raw of feed.products) {
    const produkt = validiereFressnapfFeedEintrag(raw);
    if (produkt === null || gesehen.has(produkt.productId)) continue;
    gesehen.add(produkt.productId);
    produkte.push(produkt);
  }
  return produkte;
}

const PRODUKTE = lade();

export function fressnapfAngebote(): readonly FressnapfProductOffer[] {
  return PRODUKTE;
}

export function fressnapfAngebot(productId: string): FressnapfProductOffer | null {
  return PRODUKTE.find((produkt) => produkt.productId === productId) ?? null;
}

export function fressnapfBildUrspruenge(): readonly string[] {
  return [...new Set(PRODUKTE.map((produkt) => new URL(produkt.imageUrl).origin))].sort();
}
