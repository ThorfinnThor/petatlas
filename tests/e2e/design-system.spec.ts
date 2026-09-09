// M04-02 — Designsystem: kein Layoutbruch, und Werbung sieht anders aus als
// Information.
import { expect, test } from '@playwright/test';

test('Designprobe zeigt Informations- und Werbebereich sichtbar verschieden', async ({ page }) => {
  await page.goto('/entwicklung/designprobe/');

  const anzeige = page.getByTestId('anzeige-probe');
  await expect(anzeige).toBeVisible();
  await expect(anzeige.getByText('Anzeige', { exact: true })).toBeVisible();
  await expect(anzeige).toHaveAttribute('aria-label', 'Anzeige');

  const stile = await page.evaluate(() => {
    const werbung = document.querySelector('.anzeige');
    const hinweis = document.querySelector('.hinweisbox--info');
    if (!werbung || !hinweis) throw new Error('Bausteine fehlen');
    const a = getComputedStyle(werbung);
    const b = getComputedStyle(hinweis);
    return {
      werbungRahmen: a.borderTopStyle,
      hinweisRahmen: b.borderTopStyle,
      werbungGrund: a.backgroundColor,
      hinweisGrund: b.backgroundColor,
    };
  });

  // Gestrichelt gegen durchgezogen und unterschiedliche Flächenfarbe.
  expect(stile.werbungRahmen).toBe('dashed');
  expect(stile.hinweisRahmen).toBe('solid');
  expect(stile.werbungGrund).not.toBe(stile.hinweisGrund);
});

test('Ergebnisbox wird Screenreadern angesagt', async ({ page }) => {
  await page.goto('/entwicklung/designprobe/');
  const ergebnis = page.getByTestId('ergebnisbox');
  await expect(ergebnis).toHaveAttribute('role', 'status');
  await expect(ergebnis).toHaveAttribute('aria-live', 'polite');
});

test('Unbekannter Datenstand wird als unbekannt ausgewiesen', async ({ page }) => {
  await page.goto('/entwicklung/designprobe/');
  await expect(page.getByText('Datenstand: unbekannt')).toBeVisible();
  await expect(page.getByText('Datenstand: 06.09.2026')).toBeVisible();
});

test('Kein horizontales Scrollen auf den vorhandenen Seiten', async ({ page }) => {
  for (const pfad of ['/de-de/', '/entwicklung/designprobe/', '/entwicklung/formularprobe/']) {
    await page.goto(pfad);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `horizontaler Überlauf auf ${pfad}`).toBeLessThanOrEqual(0);
  }
});

test('Fokus ist sichtbar', async ({ page }) => {
  await page.goto('/entwicklung/formularprobe/');
  const feld = page.getByLabel('Gewicht in Kilogramm');
  await feld.focus();
  const umriss = await feld.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(umriss).not.toBe('none');
});
