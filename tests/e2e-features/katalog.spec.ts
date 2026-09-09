// M13-05 — Der Katalog zeigt den leeren Zustand ehrlich und erklärt seine Ordnung.
import { expect, test } from '@playwright/test';
import { hauptnavigationOeffnen } from '../support/navigation.ts';

const KATALOG = '/de-de/angebote/';

test('sagt, dass es derzeit keine Angebote gibt — und warum', async ({ page }) => {
  await page.goto(KATALOG);
  await expect(page.locator('h1')).toHaveText('Angebote');
  await expect(page.locator('[data-testid="katalog-leer"]')).toContainText(
    'ohne freigegebenen Partnervertrag',
  );
  await expect(page.locator('[data-testid="katalog-liste"] li')).toHaveCount(0);
});

test('erklärt jede angebotene Sortierung', async ({ page }) => {
  await page.goto(KATALOG);
  const ordnungen = page.locator('[data-sortierung]');
  await expect(ordnungen).toHaveCount(4);
  for (const schluessel of ['preis', 'grundpreis', 'marke', 'stand']) {
    await expect(page.locator(`[data-sortierung="${schluessel}"]`)).toContainText(/[a-zäöü]{10,}/);
  }
});

test('sagt ausdrücklich, dass die Reihenfolge nicht von Zahlungen abhängt', async ({ page }) => {
  await page.goto(KATALOG);
  await expect(page.getByText(/hängt.*nicht davon ab, wie viel ein Händler zahlt/)).toBeVisible();
});

test('behauptet keine Empfehlung und keinen Bestpreis', async ({ page }) => {
  await page.goto(KATALOG);
  const text = (await page.locator('main').innerText()).toLowerCase();
  expect(text).toContain('keine kaufempfehlung');
  expect(text).not.toContain('bestpreis');
  expect(text).not.toContain('testsieger');
});

test('taucht in der Navigation auf, wenn die Funktion an ist', async ({ page }) => {
  await page.goto('/de-de/');
  // Auf schmalen Geräten steckt die Navigation hinter dem Menüknopf.
  await hauptnavigationOeffnen(page);
  await page.locator('header summary').filter({ hasText: 'Produkte' }).click();
  await expect(page.locator(`header nav a[href="${KATALOG}"]`)).toBeVisible();
});
