import { describe, expect, it } from 'vitest';

import {
  pflegeKatalogProdukteFuerKategorie,
  pflegeKategorieFuerProduktname,
} from '../../src/features/commerce/care-product-relevance.ts';
import { fressnapfKatalog } from '../../src/features/commerce/feed-catalog.ts';

describe('Relevanz von Pflegeprodukten', () => {
  it.each([
    ['Fellbürste mit weichen Borsten', 'grooming-brush'],
    ['Krallenschere für Hunde', 'grooming-claw'],
    ['Fingerzahnbürste für Katzen', 'dental-care'],
    ['Hunderampe für das Auto', 'mobility-aid'],
    ['Hundebademantel aus Mikrofaser', 'coat-care-textile'],
  ] as const)('ordnet %s eindeutig zu', (name, categoryId) => {
    expect(pflegeKategorieFuerProduktname(name)).toBe(categoryId);
  });

  it.each([
    'Bio Schutz Hunde Fernhaltespray 500ml',
    'Bugalugs Geruchs- und Fleckenentferner Duftrichtung Rasen 1 l',
    'Peticare Living Clean 2010 - Desinfektionsmittel für Oberflächen',
    'ViPiBaX Giardien EX Hygiene-Spray 500ml',
    'Schlitzohr Fusselrolle Hairbert Fusselbürste Tierhaarentferner',
  ])('weist das unpassende Produkt „%s“ keiner Pflegerubrik zu', (name) => {
    expect(pflegeKategorieFuerProduktname(name)).toBeNull();
  });

  it('zeigt in jeder Pflegerubrik nur eindeutig passende Feedprodukte', () => {
    const categories = [
      'grooming-brush',
      'grooming-claw',
      'dental-care',
      'mobility-aid',
      'coat-care-textile',
    ] as const;
    for (const categoryId of categories) {
      const products = pflegeKatalogProdukteFuerKategorie(fressnapfKatalog(), categoryId);
      expect(
        products.every(
          (product) => pflegeKategorieFuerProduktname(product.productName) === categoryId,
        ),
      ).toBe(true);
    }
  });
});
