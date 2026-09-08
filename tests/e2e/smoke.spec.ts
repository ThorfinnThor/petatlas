// M01-06 — Browser-Smoke gegen den gebauten statischen Output.
// Geprüft wird, was ausgeliefert würde, nicht der Dev-Server.
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

/** Sammelt Konsolenfehler und Seitenfehler für die Dauer eines Tests. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message: ConsoleMessage) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  return errors;
}

test('Startseite lädt ohne Konsolenfehler und nennt den Aufbaustand', async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto('/de-de/');

  expect(response?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('Besser entscheiden für dein Tier');
  await expect(page).toHaveTitle(/PetAtlas/);
  // Ein Aufbaustand darf nicht indexierbar sein.
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.getByTestId('test-data-banner')).toBeVisible();

  expect(errors).toEqual([]);
});

test('Unbekannte Adresse liefert die 404-Seite', async ({ page }) => {
  const errors = collectErrors(page);
  const response = await page.goto('/gibt-es-nicht/');

  expect(response?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('Seite nicht gefunden');
  await expect(page.getByRole('link', { name: 'Zur Startseite' })).toBeVisible();

  // Der Browser protokolliert den angeforderten 404 selbst als Konsolenfehler.
  // Alles andere wäre ein echter Fehler auf der Fehlerseite.
  expect(errors.filter((entry) => !entry.includes('404 (Not Found)'))).toEqual([]);
});

test.describe('Formularprobe', () => {
  test('rechnet eine gültige Eingabe in Gramm um', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/entwicklung/formularprobe/');

    await page.getByLabel('Gewicht in Kilogramm').fill('2,5');
    await page.getByRole('button', { name: 'In Gramm umrechnen' }).click();

    await expect(page.getByTestId('ergebnis')).toHaveText('2500 Gramm');
    expect(errors).toEqual([]);
  });

  test('meldet eine ungültige Eingabe, statt 0 auszugeben', async ({ page }) => {
    await page.goto('/entwicklung/formularprobe/');

    await page.getByLabel('Gewicht in Kilogramm').fill('abc');
    await page.getByRole('button', { name: 'In Gramm umrechnen' }).click();

    // Seit M04-05 steht die Meldung am Feld und in der Fehlerzusammenfassung,
    // nicht mehr im Ergebnisfeld. Das Ergebnisfeld bleibt leer.
    await expect(page.locator('#kilogramm-fehler')).toHaveText(
      'Bitte eine Zahl größer als 0 eingeben.',
    );
    await expect(page.getByTestId('ergebnis')).toBeEmpty();
    await expect(page.getByLabel('Gewicht in Kilogramm')).toHaveAttribute('aria-invalid', 'true');
  });

  test('ist per Tastatur bedienbar und hat ein zugeordnetes Label', async ({ page }) => {
    await page.goto('/entwicklung/formularprobe/');

    const feld = page.getByLabel('Gewicht in Kilogramm');
    await feld.focus();
    await expect(feld).toBeFocused();
    // Tastatureingabe und Absenden mit Enter, ohne Maus.
    await page.keyboard.type('1');
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('ergebnis')).toHaveText('1000 Gramm');
  });
});

test('Hauptbedienung erzwingt kein horizontales Scrollen', async ({ page }) => {
  await page.goto('/entwicklung/formularprobe/');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
