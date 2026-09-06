// M05-03 — Die Quellenseite spiegelt die Registry, nicht einen gepflegten Text.
import { expect, test } from '@playwright/test';

test('listet jede erfasste Quelle mit Distribution und Bedingungen', async ({ page }) => {
  await page.goto('/de-de/quellen/');

  await expect(page.getByRole('heading', { level: 2 })).toContainText('Erfasste Quellen (2)');
  await expect(page.getByRole('heading', { name: /Gebührenordnung für Tierärzte/ })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /OpenStreetMap-Extrakt Deutschland/ }),
  ).toBeVisible();

  await expect(page.getByRole('link', { name: /gesetze-im-internet\.de/ }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /opendatacommons\.org/ }).first()).toBeVisible();
});

test('weist ungeprüfte Quellen als ungeprüft aus, statt sie zu verstecken', async ({ page }) => {
  await page.goto('/de-de/quellen/');
  await expect(page.getByText('Rechte noch nicht geprüft').first()).toBeVisible();
  await expect(page.getByText('1 von 2 Quellen sind noch ungeprüft')).toBeVisible();
});

test('nennt für die geprüfte Quelle Lizenz und Prüfdatum', async ({ page }) => {
  await page.goto('/de-de/quellen/');
  await expect(page.getByText(/Rechte geprüft und bestätigt.*ODbL-1\.0.*2026-09-06/)).toBeVisible();
});

test('nennt die Attributions- und Share-Alike-Pflicht', async ({ page }) => {
  await page.goto('/de-de/quellen/');
  await expect(page.getByText('verpflichtend').first()).toBeVisible();
  await expect(
    page.getByText('abgeleitete Datenbanken können weitergabepflichtig sein'),
  ).toBeVisible();
});

test('behauptet für den Gebührenkatalog keine Freigabe', async ({ page }) => {
  await page.goto('/de-de/quellen/');
  const eintrag = page.locator('.quellen > li', { hasText: 'Gebührenordnung für Tierärzte' });
  await expect(eintrag).toContainText('Rechte noch nicht geprüft');
  await expect(eintrag).not.toContainText('Rechte geprüft und bestätigt');
});
