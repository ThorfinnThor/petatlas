import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import editorial from '../../content-data/products/editorial.json' with { type: 'json' };
import fressnapfFeed from '../../content-data/products/fressnapf-feed.json' with { type: 'json' };

const fressnapfIds = new Set(fressnapfFeed.products.map((product) => product.productId));
const transparentPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

for (const width of [390, 900, 1440]) {
  test(`product finder cards and choices at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.route('https://images2.productserve.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: transparentPng }),
    );
    await page.goto('/de-de/spielzeug/');
    await expect(page.locator('input[value="langhaar"]')).toHaveCount(0);
    const choice = page.locator('label.filter-card').nth(1);
    await choice.click();
    await expect(choice.locator('input')).toBeChecked();
    const checkbox = await choice.locator('input').boundingBox();
    const label = await choice.locator('span').boundingBox();
    expect(label!.x - (checkbox!.x + checkbox!.width)).toBeGreaterThanOrEqual(8);
    await page.getByLabel('Alles zeigen').check();
    for (const species of ['dog', 'cat']) {
      await page.selectOption('#finder-tierart', species);
      await page.click('#finder-suchen');
      const expected = editorial.products.filter(
        (p) => p.species === species && p.category === 'Spielzeug',
      );
      const cards = page.locator('.finder__liste > li');
      const feedCount = expected.filter((product) => fressnapfIds.has(product.id)).length;
      await expect(cards).toHaveCount(expected.length);
      await expect(cards.locator('img')).toHaveCount(expected.length);
      await expect(cards.locator('figcaption', { hasText: 'Symbolbild' })).toHaveCount(
        expected.length - feedCount,
      );
      await expect(
        cards.locator('figcaption', { hasText: 'Produktbild · Fressnapf-Feed' }),
      ).toHaveCount(feedCount);
      await expect(cards.locator('img[data-feed-image]')).toHaveCount(feedCount);
      await expect(cards.locator('.finder__aktionen a[href*="awin1.com"]')).toHaveCount(feedCount);
      for (const card of await cards.all()) {
        const productId = await card.getAttribute('data-produkt');
        const image = card.locator('img');
        await image.scrollIntoViewIfNeeded();
        await expect(image).toHaveJSProperty('complete', true);
        expect(
          await image.evaluate((element: HTMLImageElement) => element.naturalWidth),
        ).toBeGreaterThan(0);
        if (productId && fressnapfIds.has(productId)) {
          expect(new URL((await image.getAttribute('src'))!).hostname).toBe(
            'images2.productserve.com',
          );
        } else {
          expect(await image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBe(
            720,
          );
        }
      }
      expect(expected.length).toBeGreaterThanOrEqual(6);
      const actual = await cards.evaluateAll((elements) =>
        elements.map((el) => el.getAttribute('data-produkt')),
      );
      expect(actual.sort()).toEqual(expected.map((p) => p.id).sort());
      const positions = await cards.evaluateAll((elements) =>
        elements.map((el) => ({
          x: el.getBoundingClientRect().x,
          y: el.getBoundingClientRect().y,
        })),
      );
      const columns = width >= 1100 ? 3 : width >= 700 ? 2 : 1;
      expect(positions.filter((p) => Math.abs(p.y - positions[0]!.y) < 2)).toHaveLength(columns);
      expect(positions[columns]!.y).toBeGreaterThan(positions[0]!.y);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    expect(
      (
        await new AxeBuilder({ page })
          .include('main')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}
