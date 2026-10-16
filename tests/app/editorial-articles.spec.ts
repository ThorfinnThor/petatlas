import { expect, test } from '@playwright/test';

const PILOTS = [
  '/de-de/ratgeber/tierarztrechnung-zusammensetzung/',
  '/de-de/ratgeber/eu-heimtierausweis-pruefen/',
  '/de-de/ratgeber/hundespielzeug-starke-kauer/',
] as const;

for (const path of PILOTS) {
  test(`${path} rendert Metadaten, Quellen und strukturierte Daten`, async ({ page }) => {
    await page.goto(path);

    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('nav[aria-label="Inhalt dieses Ratgebers"]')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Quellen und Einordnung' })).toBeVisible();
    await expect(page.locator('.article-sources a')).toHaveCount(2);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      'href',
      `https://deinhaustierportal.de${path}`,
    );

    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((scripts) =>
        scripts.map((script) => JSON.parse(script.textContent ?? '{}')['@type'] as string),
      );
    expect(types).toEqual(expect.arrayContaining(['Article', 'BreadcrumbList']));
  });
}

for (const viewport of [
  { name: 'smartphone', width: 320, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'large-desktop', width: 1920, height: 1080 },
] as const) {
  test(`Pilotartikel ohne Überlauf auf ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/de-de/ratgeber/eu-heimtierausweis-pruefen/');
    await page.waitForLoadState('networkidle');

    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
    await expect(page.locator('.article-toc a').first()).toBeVisible();
  });
}

test('Inhaltsnavigation ist mit Tastatur erreichbar und springt zum Abschnitt', async ({
  page,
}) => {
  await page.goto('/de-de/ratgeber/tierarztrechnung-zusammensetzung/');
  const firstLink = page.locator('.article-toc a').first();
  await firstLink.focus();
  await expect(firstLink).toBeFocused();
  const target = await firstLink.getAttribute('href');
  await page.keyboard.press('Enter');
  expect(page.url()).toContain(target);
});
