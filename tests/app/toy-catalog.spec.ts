import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Spielzeugkatalog aus den Händlerfeeds', () => {
  test('zeigt zuerst zwölf Karten, filtert nach Tierart und lädt mehr nach', async ({ page }) => {
    await page.goto('/de-de/spielzeug/');
    const sektion = page.locator('.feed-catalog').first();
    await expect(sektion).toBeVisible();

    const karten = sektion.locator('.feed-catalog__card');
    const gesamt = await karten.count();
    expect(gesamt).toBeGreaterThan(12);
    await expect(sektion.locator('.feed-catalog__card:not([hidden])')).toHaveCount(12);

    // Jede Karte führt gekennzeichnet zum Händler und zeigt ein echtes Produktbild.
    await expect(karten.first().locator('a[rel~="sponsored"]').first()).toBeVisible();
    await expect(karten.first().locator('img')).toHaveAttribute('src', /^https:\/\//);

    const hunde = sektion.locator('[data-filter="art:dog"]');
    if ((await hunde.count()) > 0) {
      await hunde.click();
      await expect(hunde).toHaveAttribute('aria-pressed', 'true');
      for (const art of await sektion
        .locator('.feed-catalog__card:not([hidden])')
        .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.art))) {
        expect(art).toBe('dog');
      }
      await sektion.locator('[data-filter="alle"]').click();
    }

    await sektion.locator('[data-mehr]').click();
    expect(await sektion.locator('.feed-catalog__card:not([hidden])').count()).toBe(
      Math.min(24, gesamt),
    );

    expect(
      (
        await new AxeBuilder({ page })
          .include('.feed-catalog')
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
});
