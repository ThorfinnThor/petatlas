import { describe, expect, it } from 'vitest';
import { requiredGates, releaseProblems, validReviewDate } from '../config/release-policy.ts';
import launch from '../config/launch.json' with { type: 'json' };
import legalReviews from '../config/legal-review.json' with { type: 'json' };
import food from '../content-data/food/real-products.json' with { type: 'json' };
import attributes from '../content-data/attributes/real-review.json' with { type: 'json' };
import { FoodProductSchema } from '../src/domain/schemas/food.ts';
import { AttributeReviewSchema } from '../src/domain/schemas/product-attributes.ts';
import { alleFutter, sucheFutter } from '../src/features/food/catalog.ts';

describe('Launch safeguards', () => {
  it('does not require absent commercial services but still requires expert reviews', () => {
    expect(requiredGates(['costs', 'travel', 'map', 'food'])).toEqual([
      'operatorImprint',
      'domain',
      'dataRights',
      'costsRules',
      'travelRules',
    ]);
    expect(requiredGates(['commerce'])).toContain('commerceAffiliate');
  });
  it('cannot bypass individual reviews by setting the overall flag', () => {
    const forged = {
      ...launch,
      publicRelease: { approved: true, approvedBy: 'Test', approvedAt: '2026-09-08' },
      gates: {
        ...launch.gates,
        costsRules: { approved: false },
      },
    };
    const reviews = { ...legalReviews, impressum: { status: 'offen' } };
    const problems = releaseProblems(forged, ['costs', 'travel'], reviews);
    expect(problems.join(' ')).toContain('costsRules');
    expect(problems.join(' ')).toContain('impressum');
  });
  it('rejects impossible, future and absent review dates', () => {
    for (const date of ['2026-02-30', '9999-01-01', '', undefined])
      expect(validReviewDate(date)).toBe(false);
    expect(validReviewDate('2026-09-08')).toBe(true);
  });
});

describe('Real editorial records', () => {
  it('validates every declaration without inventing barcode identities', () => {
    expect(food.dataKind).toBe('real');
    for (const product of food.products) {
      const { categoryId, ...declaration } = product;
      expect(categoryId).toBe('dry-food');
      expect(FoodProductSchema.safeParse(declaration).success).toBe(true);
      expect(product.gtin).toBeNull();
      expect(product.declarationSourceUrl).toMatch(
        /^https:\/\/(www.royalcanin.com|www.bosch-tiernahrung.de)\//,
      );
    }
    expect(alleFutter().length).toBe(7);
    expect(alleFutter().filter((p) => p.species === 'cat')).toHaveLength(3);
    expect(sucheFutter('Royal Canin').length).toBe(6);
    expect(sucheFutter('4006381333931')).toEqual([]);
  });
  it('ships sourced manufacturer or approved merchant-feed claims', () => {
    expect(AttributeReviewSchema.safeParse(attributes).success).toBe(true);
    expect(attributes.dataKind).toBe('real');
    for (const product of attributes.products)
      for (const attribute of product.attributes) {
        expect(['manufacturer_stated', 'merchant_feed']).toContain(attribute.verification);
        expect(attribute.sourceUrl).toMatch(/^https:\/\//);
        if (attribute.verification === 'merchant_feed') {
          expect(new URL(attribute.sourceUrl!).hostname).toBe('www.fressnapf.de');
        }
      }
  });
});
