// M04-05 — Zugängliche Formulare: ohne Maus bedienbar, Fehler programmatisch
// zugeordnet.
import { expect, test } from '@playwright/test';

const PROBE = '/entwicklung/formularprobe/';

test.describe('Beschriftung und Zuordnung', () => {
  test('jedes Feld hat ein zugeordnetes Label', async ({ page }) => {
    await page.goto(PROBE);
    await expect(page.getByLabel('Gewicht in Kilogramm')).toBeVisible();
    await expect(page.getByLabel('Faktor')).toBeVisible();
  });

  test('Hilfetext und Fehlermeldung hängen am Feld', async ({ page }) => {
    await page.goto(PROBE);
    const beschreibung = await page
      .getByLabel('Gewicht in Kilogramm')
      .getAttribute('aria-describedby');
    expect(beschreibung).toContain('kilogramm-hilfe');
    expect(beschreibung).toContain('kilogramm-fehler');
  });

  test('Pflichtfelder sind auch ohne Farbe erkennbar', async ({ page }) => {
    await page.goto(PROBE);
    await expect(page.getByText('(Pflichtfeld)')).toBeVisible();
    await expect(page.getByLabel('Gewicht in Kilogramm')).toHaveAttribute('required', '');
  });
});

test.describe('Fehlerbehandlung', () => {
  test('leeres Pflichtfeld erzeugt Meldung statt Ergebnis', async ({ page }) => {
    await page.goto(PROBE);
    await page.getByRole('button', { name: 'In Gramm umrechnen' }).click();

    await expect(page.getByTestId('ergebnis')).toBeEmpty();
    await expect(page.locator('#kilogramm-fehler')).toBeVisible();
    await expect(page.getByLabel('Gewicht in Kilogramm')).toHaveAttribute('aria-invalid', 'true');
  });

  test('Fehlerzusammenfassung bekommt den Fokus und verlinkt das Feld', async ({ page }) => {
    await page.goto(PROBE);
    await page.getByRole('button', { name: 'In Gramm umrechnen' }).click();

    const zusammenfassung = page.locator('#probe-fehler');
    await expect(zusammenfassung).toBeVisible();
    await expect(zusammenfassung).toHaveAttribute('role', 'alert');
    await expect(zusammenfassung).toBeFocused();
    await expect(zusammenfassung.getByRole('link')).toContainText('Gewicht in Kilogramm');
  });

  test('der Link in der Zusammenfassung springt zum Feld', async ({ page }) => {
    await page.goto(PROBE);
    await page.getByRole('button', { name: 'In Gramm umrechnen' }).click();
    await page.locator('#probe-fehler a').first().click();
    await expect(page.getByLabel('Gewicht in Kilogramm')).toBeFocused();
  });

  test('ungültiger Faktor wird als Bereichsfehler gemeldet', async ({ page }) => {
    await page.goto(PROBE);
    await page.getByLabel('Gewicht in Kilogramm').fill('2');
    await page.getByLabel('Faktor').fill('9');
    await page.getByRole('button', { name: 'In Gramm umrechnen' }).click();

    await expect(page.locator('#faktor-fehler')).toContainText('zwischen 1 und 4');
    await expect(page.getByTestId('ergebnis')).toBeEmpty();
  });

  test('der Fehler verschwindet, sobald die Eingabe stimmt', async ({ page }) => {
    await page.goto(PROBE);
    await page.getByRole('button', { name: 'In Gramm umrechnen' }).click();
    await expect(page.locator('#kilogramm-fehler')).toBeVisible();

    await page.getByLabel('Gewicht in Kilogramm').fill('2');
    await expect(page.locator('#kilogramm-fehler')).toBeHidden();
    await expect(page.getByLabel('Gewicht in Kilogramm')).not.toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  test('ein altes Ergebnis bleibt nach einem Fehler nicht stehen', async ({ page }) => {
    await page.goto(PROBE);
    await page.getByLabel('Gewicht in Kilogramm').fill('2');
    await page.getByRole('button', { name: 'In Gramm umrechnen' }).click();
    await expect(page.getByTestId('ergebnis')).toHaveText('2000 Gramm');

    await page.getByLabel('Gewicht in Kilogramm').fill('');
    await page.getByRole('button', { name: 'In Gramm umrechnen' }).click();
    await expect(page.getByTestId('ergebnis')).toBeEmpty();
  });
});

test.describe('Bedienung ohne Maus', () => {
  test('Ausfüllen und Absenden nur mit der Tastatur', async ({ page }) => {
    await page.goto(PROBE);

    await page.getByLabel('Gewicht in Kilogramm').focus();
    await page.keyboard.type('2,5');
    await page.keyboard.press('Enter');

    await expect(page.getByTestId('ergebnis')).toHaveText('2500 Gramm');
  });

  test('der optionale Faktor wird berücksichtigt', async ({ page }) => {
    await page.goto(PROBE);
    await page.getByLabel('Gewicht in Kilogramm').fill('2');
    await page.getByLabel('Faktor').fill('2');
    await page.getByRole('button', { name: 'In Gramm umrechnen' }).click();
    await expect(page.getByTestId('ergebnis')).toHaveText('4000 Gramm');
  });

  test('das Ergebnis wird Screenreadern angesagt', async ({ page }) => {
    await page.goto(PROBE);
    const ergebnis = page.getByTestId('ergebnis');
    await expect(ergebnis).toHaveAttribute('role', 'status');
    await expect(ergebnis).toHaveAttribute('aria-live', 'polite');
  });

  test('jedes fokussierbare Element zeigt einen sichtbaren Fokus', async ({ page }) => {
    await page.goto(PROBE);
    for (const ziel of ['#kilogramm', '#faktor', 'button[type="submit"]']) {
      const element = page.locator(ziel);
      await element.focus();
      const umriss = await element.evaluate((el) => getComputedStyle(el).outlineStyle);
      expect(umriss, `${ziel} ohne sichtbaren Fokus`).not.toBe('none');
    }
  });
});
