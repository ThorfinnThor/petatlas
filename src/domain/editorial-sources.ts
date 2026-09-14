import registry from '../../config/editorial-sources.json' with { type: 'json' };
import products from '../../content-data/products/editorial.json' with { type: 'json' };
import foods from '../../content-data/food/real-products.json' with { type: 'json' };

export interface EditorialSource {
  readonly id: string;
  readonly category: 'redaktionelle Fachquelle' | 'externer Dienst' | 'Herstellerquelle';
  readonly title: string;
  readonly publisher: string;
  readonly url: string;
  readonly usage: string;
  readonly version: string;
  readonly checkedAt: string;
  readonly rightsBasis: string;
  readonly allowedOutputs: string;
  readonly evidence: string;
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function manufacturerSources(): EditorialSource[] {
  const found = new Map<string, { title: string; publisher: string; checkedAt: string }>();
  for (const product of products.products) {
    found.set(product.sourceUrl, {
      title: product.sourceLabel,
      publisher: product.brand,
      checkedAt: product.checkedAt,
    });
  }
  for (const food of foods.products) {
    found.set(food.declarationSourceUrl, {
      title: `${food.brand} · Herstellerdeklaration ${food.productName}`,
      publisher: food.brand,
      checkedAt: food.declarationCheckedAt,
    });
  }
  return [...found.entries()].map(([url, source]) => ({
    id: `manufacturer-${slug(source.publisher)}-${slug(new URL(url).pathname)}`,
    category: 'Herstellerquelle',
    title: source.title,
    publisher: source.publisher,
    url,
    usage: 'Belegte Produkteigenschaften beziehungsweise Nährwertdeklaration',
    version: `Prüfstand ${source.checkedAt}`,
    checkedAt: source.checkedAt,
    rightsBasis: 'Quellenverweis; einzelne Tatsachen werden mit Herstellerzuordnung wiedergegeben',
    allowedOutputs:
      'Quellenlink und kurze, dem Hersteller zugeordnete Fakten; keine Produktbilder, Preise oder Kundenbewertungen',
    evidence:
      'content-data/products/editorial.json beziehungsweise content-data/food/real-products.json',
  }));
}

const EDITORIAL = registry.sources as EditorialSource[];

export function editorialSources(): readonly EditorialSource[] {
  return [...EDITORIAL, ...manufacturerSources()];
}
