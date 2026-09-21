import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PURCHASE_GUIDES } from '../../src/features/commerce/purchase-guides.ts';

for (const width of [390, 1440]) {
  for (const guide of PURCHASE_GUIDES) {
    test(`purchase guide ${guide.slug} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      const remote: string[] = [];
      page.on('request', (request) => {
        if (/amazon\.|amazon-adsystem|ssl-images-amazon/.test(new URL(request.url()).hostname)) {
          remote.push(request.url());
        }
      });

      const response = await page.goto(`/de-de/produkte/${guide.slug}/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveText(guide.title);
      await expect(page.locator('main')).toContainText(
        'Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.',
      );

      const amazonLinks = page.locator('main a[href*="amazon.de"][rel~="sponsored"]');
      await expect(amazonLinks).toHaveCount(guide.products.length);
      for (const link of await amazonLinks.all()) {
        const href = await link.getAttribute('href');
        const url = new URL(href!);
        expect(url.hostname).toBe('www.amazon.de');
        expect(url.searchParams.get('tag')).toBe('wauandmiau-21');
        expect(url.searchParams.get('k')).toBeTruthy();
        await expect(link).toHaveAttribute('rel', /nofollow/);
        await expect(link).not.toHaveAccessibleName(/\(Werbung\).*\(Werbung\)/);
      }

      const sourceLinks = page.locator('.product-detail__source a');
      await expect(sourceLinks).toHaveCount(guide.products.length);
      for (const link of await sourceLinks.all()) {
        expect(new URL((await link.getAttribute('href'))!).hostname).not.toContain('amazon.');
      }

      expect(
        (
          await new AxeBuilder({ page })
            .include('main')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(remote).toEqual([]);
    });
  }
}
