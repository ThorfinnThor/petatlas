import { describe, expect, it } from 'vitest';
import editorial from '../content-data/products/editorial.json' with { type: 'json' };
import supplements from '../content-data/products/supplements.json' with { type: 'json' };
import toys from '../content-data/taxonomy/toys.json' with { type: 'json' };
import fressnapfFeed from '../content-data/products/fressnapf-feed.json' with { type: 'json' };
import {
  amazonEnabled,
  amazonSearchUrl,
  AMAZON_SEARCHES,
  AMAZON_TAG,
} from '../src/features/commerce/amazon.ts';
import { readOperator } from '../config/site.ts';
import { werbeStand } from '../config/legal.ts';

describe('Owner supplied Amazon text links', () => {
  it('gives every recorded toy an Amazon search or a direct Fressnapf offer', () => {
    const categories = new Set(toys.categories.map((category) => category.categoryId));
    const fressnapfIds = new Set(fressnapfFeed.products.map((product) => product.productId));
    for (const product of editorial.products) {
      const isToy = categories.has(product.categoryId);
      expect(amazonSearchUrl(product.id) !== null || fressnapfIds.has(product.id), product.id).toBe(
        isToy,
      );
    }
  });
  it('covers every recorded supplement with a specific search term', () => {
    for (const product of supplements.products) {
      const url = new URL(amazonSearchUrl(product.id)!);
      expect(url.searchParams.get('k')).toContain(product.brand);
      expect(url.searchParams.get('k')).toContain(product.packageSize);
    }
  });
  it('limits destinations to fixed search terms and the supplied tracking ID', () => {
    for (const [key, query] of Object.entries(AMAZON_SEARCHES)) {
      const url = new URL(amazonSearchUrl(key)!);
      expect(url.origin).toBe('https://www.amazon.de');
      expect(url.pathname).toBe('/s');
      expect(url.searchParams.get('tag')).toBe(AMAZON_TAG);
      expect(url.searchParams.get('k')).toBe(query);
      expect([...url.searchParams.keys()].sort()).toEqual(['k', 'linkCode', 'tag']);
    }
    for (const key of [
      '__proto__',
      'constructor',
      'royal-canin-mini-adult-2kg',
      'https://attacker.example',
      '',
    ])
      expect(amazonSearchUrl(key)).toBeNull();
  });
  it('only activates the explicitly authorized real app, never fixtures', () => {
    expect(amazonEnabled({})).toBe(false);
    expect(amazonEnabled({ BUILD_MODE: 'preview' })).toBe(false);
    expect(amazonEnabled({ BUILD_MODE: 'development', APP_PROFILE: 'real' })).toBe(false);
    for (const BUILD_MODE of ['preview', 'production']) {
      const env = { BUILD_MODE, APP_PROFILE: 'real' };
      expect(amazonEnabled(env)).toBe(true);
      expect(amazonEnabled({ ...env, USE_FIXTURES: 'true' })).toBe(false);
      expect(amazonEnabled({ ...env, USE_FIXTURES: '1' })).toBe(false);
      expect(werbeStand(env)).toMatchObject({
        anzeigenAktiv: true,
        trackingAktiv: false,
        cookiesGesetzt: false,
      });
    }
  });
  it('uses supplied operator data in the real app and supports explicit overrides', () => {
    expect(readOperator({ APP_PROFILE: 'real' })).toMatchObject({
      legalName: 'Schayan Yousefian · SeitenHafen361 (Einzelunternehmen)',
      contactEmail: 'info@deinhaustierportal.de',
      responsibleForContent: 'Schayan Yousefian',
      vatId: null,
      registerEntry: null,
    });
    expect(
      readOperator({ APP_PROFILE: 'real', OPERATOR_CONTACT_EMAIL: 'test@example.invalid' })
        .contactEmail,
    ).toBe('test@example.invalid');
    expect(readOperator({}).legalName).toBeNull();
  });
});
