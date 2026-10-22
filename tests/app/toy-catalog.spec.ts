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

    // Im HTML stehen nur 24 Startkarten (je Händler 12); alles Weitere kommt
    // aus der nachgeladenen Datei und sieht genauso aus.
    await page.locator('.finder__katalog').getByRole('button', { name: 'Mehr anzeigen' }).click();
    const karten = page.locator('.finder__katalog .feed-catalog__card');
    await expect(karten).toHaveCount(36);
    await expect(karten.last().locator('img')).toHaveAttribute('src', /^https:\/\//);
    await expect(karten.last().locator('a[rel~="sponsored"]').first()).toBeVisible();
    await expect(karten.last().locator('.feed-catalog__bildquelle')).toContainText('-Feed');

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

test('liefert ohne JavaScript die Startauswahl, den Rest als Datei', async ({
  browser,
  request,
}) => {
  const kontext = await browser.newContext({ javaScriptEnabled: false });
  const seite = await kontext.newPage();
  await seite.goto('/de-de/spielzeug/');
  await expect(seite.locator('[data-finder-katalog] .feed-catalog__card')).toHaveCount(24);
  await kontext.close();

  const antwort = await request.get('/data/v1/katalog/spielzeug.json');
  expect(antwort.ok()).toBe(true);
  const daten = (await antwort.json()) as { eintraege: { art: string; link: string }[] };
  expect(daten.eintraege.length).toBeGreaterThan(24);
  for (const eintrag of daten.eintraege) {
    expect(['dog', 'cat']).toContain(eintrag.art);
    expect(eintrag.link).toMatch(/^https:\/\/www\.awin1\.com\//);
  }
});
