import rawCatalog from '../../../content-data/insurance/hansemerkur-products.json' with { type: 'json' };
import {
  InsuranceCatalogSchema,
  type InsuranceCatalogProduct,
} from '../../domain/schemas/insurance-catalog.ts';

const parsed = InsuranceCatalogSchema.safeParse(rawCatalog);
if (!parsed.success) {
  throw new Error(`HanseMerkur-Versicherungskatalog ist ungültig: ${parsed.error.message}`);
}

const PRODUCTS = parsed.data.products;

export function hansemerkurVersicherungsprodukte(): readonly InsuranceCatalogProduct[] {
  return PRODUCTS;
}
