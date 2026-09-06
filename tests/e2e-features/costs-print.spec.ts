// M08-05 — Druckansicht und Leistungsseiten.
import { expect, test } from '@playwright/test';

const RECHNER = '/de-de/tierarztkosten/';

test.describe('Druckansicht', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(RECHNER);
    await expect(page.locator('#suche-hinweis')).toContainText('Positionen geladen', {
      timeout: 20_000,
    });
    await page.fill('#suche', 'Beratung im einzelnen');
    await expect(page.locator('#treffer button').first()).toBeVisible();
    await page.fill('#menge', '3');
    await page.fill('#faktor', '2');
    await page.locator('#treffer button').first().click();
    await expect(page.locator('#ergebnis table')).toBeVisible();
  });

  test('behält alles, was den Betrag erklärt', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });

    // Die Rechnung selbst bleibt vollständig.
    await expect(page.locator('#ergebnis table')).toBeVisible();
    await expect(page.locator('#ergebnis .fundstelle').first()).toBeVisible();
    await expect(page.getByTestId('brutto')).toBeVisible();

    // Quelle, Fassung und Einschränkungen gehören auf das Papier.
    await expect(page.getByText('GOT 2022').first()).toBeVisible();
    await expect(page.getByText('Was der Rechner nicht kann')).toBeVisible();
    await expect(page.getByText('kein amtlicher Rechner')).toBeVisible();
  });

  test('blendet aus, was auf Papier keine Funktion hat', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('#rechner fieldset').first()).toBeHidden();
    await expect(page.locator('#treffer')).toBeHidden();
    await expect(page.locator('#drucken')).toBeHidden();
    await expect(page.locator('header nav')).toBeHidden();
  });

  test('bietet einen Druckknopf, der im Bildschirmmodus sichtbar ist', async ({ page }) => {
    await expect(page.locator('#drucken')).toBeVisible();
  });
});

test.describe('Leistungsseiten', () => {
  test('existieren nur für fachlich freigegebene Szenarien', async ({ page }) => {
    // Kein Szenario ist freigegeben, also gibt es keine Leistungsseite.
    for (const slug of ['beratung-ohne-untersuchung', 'allgemeine-untersuchung-hund']) {
      const antwort = await page.goto(`${RECHNER}${slug}/`);
      expect(antwort?.status(), slug).toBe(404);
    }
  });

  test('erzeugt keine Seite je denkbarer Kombination', async ({ page }) => {
    for (const slug of ['hund-kastration', 'katze-impfung', 'hund-zahnstein']) {
      const antwort = await page.goto(`${RECHNER}${slug}/`);
      expect(antwort?.status(), slug).toBe(404);
    }
  });
});
