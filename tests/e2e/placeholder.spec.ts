// M01-03 — Platzhalter, damit die Playwright-Konfiguration prüfbar ist.
// Der echte Smoke-Test (Startseite, 404, Formular, Konsolenfehler, mobil)
// entsteht in M01-06 und ersetzt diese Datei.
import { expect, test } from '@playwright/test';

test('Startseite antwortet und nennt den Aufbaustand', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('PetAtlas');
});
