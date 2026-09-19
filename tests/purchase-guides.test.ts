import { describe, expect, it } from 'vitest';
import { AMAZON_SEARCHES, amazonSearchUrl } from '../src/features/commerce/amazon.ts';
import { PURCHASE_GUIDES } from '../src/features/commerce/purchase-guides.ts';

describe('purchase guides', () => {
  it('has unique, URL-safe slugs and complete comparison rows', () => {
    const slugs = PURCHASE_GUIDES.map((guide) => guide.slug);
    expect(new Set(slugs).size).toBe(slugs.length);

    for (const guide of PURCHASE_GUIDES) {
      expect(guide.slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
      expect(guide.products.length).toBeGreaterThanOrEqual(3);
      expect(guide.tableHeaders.length).toBeGreaterThanOrEqual(4);
      for (const product of guide.products) {
        expect(product.comparison).toHaveLength(guide.tableHeaders.length);
        expect(product.sourceUrl).toMatch(/^https:\/\//);
        expect(new URL(product.sourceUrl).hostname).not.toContain('amazon.');
        expect(product.checkedAt).toBe('2026-09-19');
      }
    }
  });

  it('only uses whitelisted tagged Amazon searches', () => {
    for (const guide of PURCHASE_GUIDES) {
      for (const product of guide.products) {
        expect(Object.hasOwn(AMAZON_SEARCHES, product.amazonSelection)).toBe(true);
        const url = new URL(amazonSearchUrl(product.amazonSelection)!);
        expect(url.hostname).toBe('www.amazon.de');
        expect(url.searchParams.get('tag')).toBe('wauandmiau-21');
        expect(url.searchParams.get('k')).toBeTruthy();
        expect([...url.searchParams.keys()].sort()).toEqual(['k', 'linkCode', 'tag']);
      }
    }
  });

  it('does not duplicate the same Amazon selection within one guide', () => {
    for (const guide of PURCHASE_GUIDES) {
      const selections = guide.products.map((product) => product.amazonSelection);
      expect(new Set(selections).size).toBe(selections.length);
    }
  });
});
