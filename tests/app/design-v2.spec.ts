import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [360, 390, 430, 768, 1024, 1280, 1440]) {
  test(`real app at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    for (const path of [
      '/de-de/',
      '/de-de/tierarztkosten/',
      '/de-de/tierarzt-karte/',
      '/de-de/reisecheck/',
      '/de-de/futter/',
      '/de-de/spielzeug/',
      '/de-de/mein-tier/',
    ]) {
      expect((await page.goto(path))?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
      if (path === '/de-de/tierarztkosten/') {
        await page.fill('#suche', 'Allgemeine Untersuchung');
        await page
          .getByRole('button', {
            name: /Allgemeine Untersuchung mit Beratung, Hund, Katze, Frettchen/,
          })
          .click();
        await expect(page.locator('[data-testid=brutto]')).toContainText('28,11');
      }
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      );
      expect(overflow, `${path} at ${width}px`).toBe(false);
      if (path === '/de-de/') {
        await page.locator('.hero-feature img').first().waitFor({ state: 'visible' });
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: testInfo.outputPath(`home-${width}.png`), fullPage: true });
      }
    }
    expect(errors).toEqual([]);
  });
}

test('real preview exposes functioning tools without commercial offers', async ({ page }) => {
  await page.goto('/de-de/');
  await page.locator('#home-location').fill('Hamburg');
  await page.getByRole('button', { name: 'Hunde-Orte suchen' }).click();
  await page.getByRole('button', { name: 'Hamburg', exact: true }).click();
  await expect(page.locator('#treffer-status')).toContainText('Hamburg');
  expect(await page.locator('#trefferliste h3').count()).toBeGreaterThan(0);
  await page.goto('/de-de/futter/');
  await expect(page.locator('.food-comparison tbody tr')).toHaveCount(2);
  await expect(page.locator('.food-comparison')).toContainText('27 %');
  expect((await page.request.get('/de-de/angebote/')).status()).toBe(404);
});

test('real homepage meets automated accessibility checks', async ({ page }) => {
  await page.goto('/de-de/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(
    results.violations.map((item) => ({
      id: item.id,
      nodes: item.nodes.map((node) => node.target),
    })),
  ).toEqual([]);
});

test('saved profile is applied only on request and survives navigation', async ({ page }) => {
  await page.goto('/de-de/mein-tier/');
  await page.selectOption('#profil-tierart', 'dog');
  await page.fill('#profil-name', 'Testhund');
  await page.fill('#profil-gewicht', '12,5');
  await page.fill('#profil-geburtsdatum', '2020-01-01');
  await page.click('#profil-speichern');
  await page.goto('/de-de/spielzeug/');
  await expect(page.locator('#finder-gewicht')).toHaveValue('');
  await page.getByRole('button', { name: 'Gespeichertes Tierprofil übernehmen' }).click();
  await expect(page.locator('#finder-gewicht')).toHaveValue('12.5');
  await page.goto('/de-de/reisecheck/');
  await page.getByRole('button', { name: 'Gespeichertes Tierprofil übernehmen' }).click();
  await expect(page.locator('#geburtsdatum')).toHaveValue('2020-01-01');
  await expect(page.locator('#chip')).toHaveValue('unbekannt');
});
