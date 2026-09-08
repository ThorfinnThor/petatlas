// M20-01 — Der Weg vom Rechner in den Katalog und zur einzelnen Position.
import { expect, test } from '@playwright/test';

const RECHNER = '/de-de/tierarztkosten/';
const KATALOG = `${RECHNER}katalog/`;

test('der Rechner führt in den Gebührenkatalog', async ({ page }) => {
  await page.goto(RECHNER);
  await expect(page.locator(`main a[href="${KATALOG}"]`)).toBeVisible();
});

test('der Katalog gliedert nach Teilen und Gruppen', async ({ page }) => {
  await page.goto(KATALOG);
  await expect(page.locator('h1')).toHaveText('Gebührenkatalog');
  // Drei Teile, wie die Verordnung selbst.
  await expect(page.locator('main section h2')).toHaveCount(3);
  await expect(page.locator('main .gruppen li').first()).toBeVisible();
});

test('eine Gruppe listet ihre Positionen mit Betrag', async ({ page }) => {
  await page.goto(KATALOG);
  const ersteGruppe = page.locator('main .gruppen a').first();
  const ziel = await ersteGruppe.getAttribute('href');
  await ersteGruppe.click();

  await expect(page).toHaveURL(new RegExp(`${ziel}$`));
  await expect(page.locator('main .positionen li').first()).toBeVisible();
  await expect(page.locator('main .positionen__betrag').first()).toContainText('€');
});

test('eine Position nennt Betrag, Sätze und Fundstelle', async ({ page }) => {
  await page.goto(`${RECHNER}1-beratung-im-einzelnen-fall-ohne-untersuchung-auch-schriftlic/`);

  await expect(page.locator('h1')).toContainText('Beratung im einzelnen Fall');
  await expect(page.getByText('11,26', { exact: false }).first()).toBeVisible();

  // Reguläre und Notdienstsätze stehen als eigene Tabellen da.
  await expect(page.locator('main table')).toHaveCount(2);
  await expect(page.locator('main table').first()).toContainText('1-fach');
  await expect(page.locator('main table').nth(1)).toContainText('4-fach');

  // Fundstelle und Rechtsgrundlage gehören auf dieselbe Seite wie die Zahl.
  await expect(page.getByText('lfd. Nr. 1')).toBeVisible();
  await expect(page.getByText('§ 5 Abs. 1 UrhG', { exact: false }).first()).toBeVisible();

  // Und der Hinweis, dass niemand das fachlich abgenommen hat.
  await expect(page.getByText('Fachlich noch nicht geprüft')).toBeVisible();
});

test('die Position führt zurück in den Rechner und in ihre Gruppe', async ({ page }) => {
  await page.goto(`${RECHNER}1-beratung-im-einzelnen-fall-ohne-untersuchung-auch-schriftlic/`);
  await expect(page.getByRole('link', { name: 'Im Rechner verwenden' })).toBeVisible();
  await expect(page.locator('main a[href^="/de-de/tierarztkosten/"]').first()).toBeVisible();
});

test('eine erfundene Position gibt es nicht', async ({ page }) => {
  const antwort = await page.goto(`${RECHNER}9999-gibt-es-nicht/`);
  expect(antwort?.status()).toBe(404);
});
