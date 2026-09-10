import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import editorial from '../../content-data/products/editorial.json' with { type: 'json' };

for (const width of [390, 900, 1440]) {
  test(`product finder cards and choices at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/de-de/spielzeug/');
    await expect(page.locator('input[value="langhaar"]')).toHaveCount(0);
    const choice = page.locator('label.wahl').first();
    await choice.click();
    await expect(choice.locator('input')).toBeChecked();
    const checkbox = await choice.locator('input').boundingBox();
    const label = await choice.locator('.wahl__text').boundingBox();
    expect(label!.x - (checkbox!.x + checkbox!.width)).toBeGreaterThanOrEqual(8);
    for (const species of ['dog', 'cat']) {
      await page.selectOption('#finder-tierart', species);
      await page.click('#finder-suchen');
      const expected = editorial.products.filter(
        (p) => p.species === species && p.category === 'Spielzeug',
      );
      const cards = page.locator('.finder__liste > li');
      await expect(cards).toHaveCount(expected.length);
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
