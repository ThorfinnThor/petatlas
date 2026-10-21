import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Händlerprodukte im Spielzeugfinder', () => {
  test('zeigt ohne Merkmalsfilter geprüfte und Händlerprodukte, mit Filter nur geprüfte', async ({
    page,
  }) => {
    await page.goto('/de-de/spielzeug/');

    // Mit JavaScript übernimmt der Finder die Händlerbereiche.
    await expect(page.locator('[data-finder-katalog]').first()).toBeHidden();
    const katalog = page.locator('.finder__katalog');
    await expect(katalog).toBeVisible();
    await expect(katalog.locator('.feed-catalog__card')).toHaveCount(12);
    await expect(page.locator('#finder-status')).toContainText('weitere Händlerprodukte');

    // Nur Produkte der gewählten Tierart, mit echtem Bild und gekennzeichnetem Link.
    for (const art of await katalog
      .locator('.feed-catalog__card')
      .evaluateAll((els) => els.map((el) => (el as HTMLElement).dataset.art))) {
      expect(art).toBe('dog');
    }
    const karte = katalog.locator('.feed-catalog__card').first();
    await expect(karte.locator('img')).toHaveAttribute('src', /^https:\/\//);
    await expect(karte.locator('a[rel~="sponsored"]').first()).toBeVisible();

    await katalog.getByRole('button', { name: 'Mehr anzeigen' }).click();
    await expect(page.locator('.finder__katalog .feed-catalog__card')).toHaveCount(24);

    expect(
      (
        await new AxeBuilder({ page })
          .include('.finder__katalog')
          .withTags(['wcag2a', 'wcag2aa'])
          .analyze()
      ).violations,
    ).toEqual([]);

    // Mit Spielweise gibt es keine ungeprüften Händlerprodukte, nur einen Hinweis.
    await page.locator('.finder-shell').getByLabel('Kauen').check();
    await expect(page.locator('.finder__katalog .feed-catalog__card')).toHaveCount(0);
    await expect(page.locator('.finder__katalog-hinweis')).toContainText(
      'keine geprüften Merkmale',
    );
  });
});
