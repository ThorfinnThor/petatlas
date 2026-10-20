import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

import {
  ALTE_SLUGS,
  PRODUKT_VERGLEICHE,
  auswertung,
} from '../../src/features/products/comparison-pages.ts';

for (const width of [320, 1440]) {
  for (const seite of PRODUKT_VERGLEICHE) {
    test(`product comparison ${seite.slug} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const remote: string[] = [];
      page.on('request', (request) => {
        if (/amazon\.|amazon-adsystem|ssl-images-amazon/.test(new URL(request.url()).hostname)) {
          remote.push(request.url());
        }
      });

      const response = await page.goto(`/de-de/produkte/${seite.slug}/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveText(seite.titel);

      const { bewertungen, empfehlungen } = auswertung(seite);
      await expect(page.locator('.pc-pick')).toHaveCount(empfehlungen.length);
      await expect(page.locator('.pc-product')).toHaveCount(bewertungen.length);
      await expect(page.locator('.pc-weights tbody tr')).toHaveCount(seite.kriterien.length);

      // Partnerlinks sind gekennzeichnet und führen nur zur Amazon-Suche mit Partner-ID.
      const amazonLinks = page.locator('main a[href*="amazon.de"]');
      await expect(amazonLinks).toHaveCount(bewertungen.length);
      for (const link of await amazonLinks.all()) {
        await expect(link).toHaveAttribute('rel', /sponsored/);
        const url = new URL((await link.getAttribute('href'))!);
        expect(url.hostname).toBe('www.amazon.de');
        expect(url.searchParams.get('tag')).toBe('deinhaustierportal-21');
      }
      await expect(page.locator('main')).toContainText(
        'Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.',
      );

      const structured = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(structured.some((t) => t.includes('"ItemList"'))).toBe(true);
      expect(structured.some((t) => t.includes('"FAQPage"'))).toBe(true);

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

test('old guide slugs are no longer built as pages', async ({ page }) => {
  for (const alt of Object.keys(ALTE_SLUGS)) {
    const response = await page.goto(`/de-de/produkte/${alt}/`);
    // Die Vorschau kennt keine Cloudflare-Weiterleitungen; die Seite darf nur nicht mehr existieren.
    expect(response?.status(), alt).toBe(404);
  }
});
