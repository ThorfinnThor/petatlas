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
  await expect(page.getByText('Noch keine Quelle freigegeben')).toBeVisible();
  await expect(page.getByText('Rechte noch nicht geprüft').first()).toBeVisible();
  await expect(page.getByText('2 von 2 Quellen sind noch ungeprüft')).toBeVisible();
});

test('nennt die Attributions- und Share-Alike-Pflicht', async ({ page }) => {
  await page.goto('/de-de/quellen/');
  await expect(page.getByText('verpflichtend').first()).toBeVisible();
  await expect(
    page.getByText('abgeleitete Datenbanken können weitergabepflichtig sein'),
  ).toBeVisible();
});

test('behauptet keine Freigabe, die es nicht gibt', async ({ page }) => {
  await page.goto('/de-de/quellen/');
  const text = await page.locator('main').innerText();
  expect(text).not.toContain('Rechte geprüft und bestätigt');
});
