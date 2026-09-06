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

test('nennt für jede Quelle Rechtestand, Lizenz und Prüfdatum', async ({ page }) => {
  await page.goto('/de-de/quellen/');
  await expect(page.getByText(/Rechte geprüft und bestätigt.*ODbL-1\.0.*2026-09-06/)).toBeVisible();
  await expect(page.getByText(/Rechte geprüft und bestätigt.*§ 5 Abs. 1 UrhG/)).toBeVisible();
  await expect(page.getByText('0 von 2 Quellen sind noch ungeprüft')).toBeVisible();
});

test('nennt die Attributions- und Share-Alike-Pflicht', async ({ page }) => {
  await page.goto('/de-de/quellen/');
  await expect(page.getByText('verpflichtend').first()).toBeVisible();
  await expect(
    page.getByText('abgeleitete Datenbanken können weitergabepflichtig sein'),
  ).toBeVisible();
});

test('kennzeichnet den Gebührenkatalog als amtliches Werk, nicht als freie Lizenz', async ({
  page,
}) => {
  await page.goto('/de-de/quellen/');
  const eintrag = page.locator('.quellen > li', { hasText: 'Gebührenordnung für Tierärzte' });
  await expect(eintrag).toContainText('xml.zip');

  // Nur die Zeile mit dem Rechtestand prüfen: der erläuternde Hinweis darunter
  // nennt CC0 und MIT absichtlich, um sie auszuschließen.
  const rechtestand = eintrag.locator('dd').filter({ hasText: 'Rechte geprüft und bestätigt' });
  await expect(rechtestand).toContainText('§ 5 Abs. 1 UrhG');
  await expect(rechtestand).not.toContainText('CC0');
  await expect(rechtestand).not.toContainText('MIT');
});
