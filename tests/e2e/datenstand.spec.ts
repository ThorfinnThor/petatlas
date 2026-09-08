// M17-04 — Die Datenstandseite sagt Zahlen, keine Zusicherungen.
import { expect, test } from '@playwright/test';

const SEITE = '/de-de/datenstand/';

test('nennt einen Gesamtstand mit Begründung', async ({ page }) => {
  await page.goto(SEITE);
  const gesamt = page.locator('[data-testid="gesamtstand"]');
  await expect(gesamt).toBeVisible();
  await expect(gesamt).toContainText('Schlechtester Einzelstand');
});

test('führt jeden Datensatz mit Stand, Alter und Bewertung auf', async ({ page }) => {
  await page.goto(SEITE);
  const zeilen = page.locator('[data-testid^="datensatz-"]');
  await expect(zeilen).not.toHaveCount(0);

  const gebuehren = page.locator('[data-testid="datensatz-gebuehren-got"]');
  await expect(gebuehren).toContainText('Gebührenpositionen');
  await expect(gebuehren).toContainText('§ 5 Abs. 1 UrhG');
});

test('nennt einen fehlenden Stand unbekannt statt aktuell', async ({ page }) => {
  await page.goto(SEITE);
  const regeln = page.locator('[data-testid="datensatz-reiseregeln-eu-intra-2026"]');
  await expect(regeln).toContainText('unbekannt');
  await expect(regeln).toContainText('sperrt das Ergebnis');
  await expect(regeln).not.toContainText('aktuell');
});

test('meldet nicht ausgelieferte Daten als solche, nicht als Ausfall', async ({ page }) => {
  await page.goto(SEITE);
  const angebote = page.locator('[data-testid="datensatz-angebote"]');
  await expect(angebote).toContainText('nicht ausgeliefert');
  await expect(angebote).toContainText('Normalzustand');
});

test('verweist auf die maschinenlesbare Fassung', async ({ page }) => {
  await page.goto(SEITE);
  await expect(page.getByRole('link', { name: '/data/v1/health.json' })).toBeVisible();
});
