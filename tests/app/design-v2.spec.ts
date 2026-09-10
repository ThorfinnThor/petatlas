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
  await page.getByRole('button', { name: 'Tierarzt & Orte suchen' }).click();
  await page.getByRole('button', { name: 'Hamburg', exact: true }).click();
  await expect(page.locator('#treffer-status')).toContainText('Hamburg');
  expect(await page.locator('#trefferliste h3').count()).toBeGreaterThan(0);
  await page.goto('/de-de/futter/');
  await expect(page.locator('.food-comparison tbody tr')).toHaveCount(3);
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

test('mobile map switches views and remains accessible', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/de-de/tierarzt-karte/');
  const mapView = page.locator('.map-view');
  await expect(mapView.getByRole('button', { name: 'Liste', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.map-output')).toBeHidden();
  await mapView.getByRole('button', { name: 'Karte', exact: true }).click();
  await expect(page.locator('.map-output')).toBeVisible();
  await expect(mapView.getByRole('button', { name: 'Karte', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.screenshot({ path: testInfo.outputPath('map-390.png'), fullPage: true });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations.map((item) => ({ id: item.id, nodes: item.nodes }))).toEqual([]);
  await mapView.getByRole('button', { name: 'Liste', exact: true }).click();
  await expect(page.locator('.map-output')).toBeHidden();
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

test('an opened map follows place, category and radius changes', async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8L8AAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  await page.goto('/de-de/tierarzt-karte/');
  await page.click('#karte-anzeigen');
  await expect(page.locator('#karte-status')).toHaveText(/\d+ Orte auf der Karte\./);
  await page.fill('#ort', 'Hamburg');
  await page.getByRole('button', { name: 'Hamburg', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Tierarztpraxis (4.928)', exact: true }).check();
  await expect(page.locator('#treffer-status')).toContainText('21 erfasste Orte');
  await expect(page.locator('#karte-status')).toHaveText('21 Orte auf der Karte.');
  await page.selectOption('#radius', '10000');
  await expect(page.locator('#treffer-status')).toContainText('10 km um Hamburg');
  const count = await page.locator('#trefferliste h3').count();
  await expect(page.locator('#karte-status')).toHaveText(`${count} Orte auf der Karte.`);
  await expect(page.locator('#karte .leaflet-map-pane')).toHaveCount(1);
  await expect(page.locator('#karte .leaflet-interactive')).toHaveCount(count);
});

for (const width of [390, 1440]) {
  test(`cat guide leads to cat products at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/de-de/');
    await expect(page.locator('header')).toContainText('Wau & Miau');
    await expect(page.locator('.pet-world')).toHaveCount(2);
    await expect(page.locator('.editorial-product').filter({ hasText: 'Katze' })).toHaveCount(2);
    await page.getByRole('link', { name: 'Zum Katzen-Ratgeber →', exact: true }).click();
    await expect(page.locator('h1')).toContainText('Wohnungskatzen');
    await page
      .getByRole('link', { name: 'Katzenspielzeug im Finder ansehen →', exact: true })
      .click();
    await expect(page.locator('#finder-tierart')).toHaveValue('cat');
    await page.getByRole('button', { name: 'Passendes anzeigen', exact: true }).click();
    await expect(page.locator('#finder-ergebnis')).toContainText('Senses Play Circuit');
    await expect(page.locator('#finder-ergebnis')).toContainText('Cat Active Tennis Balls');
    await expect(page.locator('#finder-ergebnis')).not.toContainText('KONG Classic');
    await page.selectOption('#finder-tierart', 'dog');
    await page.getByRole('button', { name: 'Passendes anzeigen', exact: true }).click();
    await expect(page.locator('#finder-ergebnis')).toContainText('KONG Classic');
    await expect(page.locator('#finder-ergebnis')).not.toContainText('Senses Play Circuit');
    await page.goto('/de-de/futter/');
    await page.fill('#futter-begriff', 'Indoor');
    await page.click('#futter-suchen');
    await expect(page.locator('#futter-treffer')).toContainText('Indoor');
    await expect(page.locator('.food-comparison')).toContainText('Katze');
    await page.goto('/de-de/ratgeber/katze-transportbox/');
    await expect(page.locator('h1')).toContainText('Transportbox');
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)).toBe(
      false,
    );
  });
}
