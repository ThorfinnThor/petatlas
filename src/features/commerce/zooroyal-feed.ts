import feed from '../../../content-data/products/zooroyal-feed.json' with { type: 'json' };

export interface ZooRoyalProductOffer {
  readonly productId: string;
  readonly productName: string;
  readonly merchantProductId: string | null;
  readonly imageUrl: string;
  readonly affiliateUrl: string;
  readonly merchantUrl: string;
}

export function zooroyalAngebote(): readonly ZooRoyalProductOffer[] {
  return feed.products as ZooRoyalProductOffer[];
}

export function zooroyalAngebot(productId: string): ZooRoyalProductOffer | null {
  return zooroyalAngebote().find((product) => product.productId === productId) ?? null;
}
