// M14-04 — Der Finder erklärt, warum etwas erscheint und was nicht geprüft ist.
import { expect, test } from '@playwright/test';

const SPIELZEUG = '/de-de/spielzeug/';
const PFLEGE = '/de-de/pflege/';

test('shows real products and explicitly missing suitability data', async ({ page }) => {
  await page.goto(SPIELZEUG);
  await expect(page.getByText('Synthetische Produktdaten')).toHaveCount(0);
  await page.click('#finder-suchen');
  const kong = page.locator('[data-produkt="kong-classic"]');
  await expect(kong).toBeVisible();
  await expect(kong).toContainText('KONG Classic');
  await expect(kong.locator('.finder__offen')).toContainText('Größenbereich');
  await expect(kong).toHaveAttribute('data-punkte', '0');
  await expect(kong.locator('.finder__neutral')).toContainText('nur nicht ausgeschlossen');
  await expect(page.locator('.finder__kopf')).toContainText('keine Bewertung des Produkts');
  await page.fill('#finder-gewicht', '5');
  await page.click('#finder-suchen');
  await expect(kong.locator('.finder__offen')).toContainText('Größenbereich');
});

test('vergibt keinen Sicherheits- oder Haltbarkeitsscore', async ({ page }) => {
  await page.goto(SPIELZEUG);
  await page.click('#finder-suchen');
  const text = (await page.locator('main').innerText()).toLowerCase();
  for (const wort of ['sicherheitsscore', 'haltbarkeitsscore', 'unzerstörbar', 'testsieger']) {
    expect(text.includes(wort), wort).toBe(false);
  }
});

test('nennt auf der Pflegeseite Kategorien und die Ausschlüsse', async ({ page }) => {
  await page.goto(PFLEGE);
  await expect(page.locator('[data-kategorie]')).toHaveCount(5);
  await expect(page.locator('[data-ausschluss]')).toHaveCount(5);
  await expect(page.getByText('Kein Gesundheitsbereich')).toBeVisible();
});

test('führt jede Pflegekategorie zu einer eigenen Seite', async ({ page }) => {
  await page.goto(PFLEGE);
  const links = page.locator('.kategorien a');
  await expect(links).toHaveCount(5);

  await page.goto(`${PFLEGE}dental-care/`);
  await expect(page.locator('h1')).toHaveText('Zahnpflegezubehör');
  await expect(page.locator('[data-merkmal]').first()).toBeVisible();
  await expect(page.locator('[data-testid="keine-produkte"]')).toContainText(
    'Sorgfalt vortäuschen',
  );
});

test('gibt es keine Seite für eine erfundene Kategorie', async ({ page }) => {
  const antwort = await page.request.get(`${PFLEGE}wundermittel/`);
  expect(antwort.status()).toBe(404);
});
