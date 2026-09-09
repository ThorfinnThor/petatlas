import { expect, test } from '@playwright/test';

for (const width of [390, 1280]) {
  test.describe(`expanded tools ${width}`, () => {
    test.use({ viewport: { width, height: 900 } });
    test('supplement comparison handles decimal commas and recovers from invalid values', async ({
      page,
    }) => {
      await page.goto('/de-de/nahrungsergaenzung/');
      for (const [id, value] of Object.entries({
        'preis-A': '19,95',
        'inhalt-A': '100',
        'menge-A': '2',
        'preis-B': '24',
        'inhalt-B': '120',
        'menge-B': '3',
      }))
        await page.fill(`#${id}`, value);
      await page.getByRole('button', { name: 'Kosten vergleichen' }).click();
      await expect(page.locator('#supplement-ergebnis')).toContainText('50 Tage');
      await expect(page.locator('#supplement-ergebnis')).toContainText('0,60');
      await page.fill('#menge-A', '0');
      await page.getByRole('button', { name: 'Kosten vergleichen' }).click();
      await expect(page.locator('#supplement-ergebnis')).toContainText('gültige positive Zahlen');
      await page.fill('#menge-A', '2');
      await page.getByRole('button', { name: 'Kosten vergleichen' }).click();
      await expect(page.locator('#supplement-ergebnis')).toContainText('50 Tage');
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      ).toBe(true);
    });
    test('cost exceptions require confirmation and standard limits return when disabled', async ({
      page,
    }) => {
      await page.goto('/de-de/tierarztkosten/');
      await page.fill('#suche', 'Allgemeine Untersuchung');
      await page
        .getByRole('button', {
          name: /Allgemeine Untersuchung mit Beratung, Hund, Katze, Frettchen/,
        })
        .click();
      await page.locator('summary').filter({ hasText: 'Abweichende Abrechnung' }).click();
      await page.selectOption('#steuer', '7');
      await expect(page.locator('#rechner-status')).toContainText('muss mit der Praxis geklärt');
      await expect(page.locator('#ergebnis table')).toHaveCount(0);
      await page.check('#sonderfall-bestaetigt');
      await expect(page.getByTestId('brutto')).toContainText('25,27');
      await page.selectOption('#steuer', '19');
      await page.check('#vereinbarter-faktor');
      await page.fill('#faktor', '4,5');
      await page.click('#position-uebernehmen');
      await expect(page.getByTestId('brutto')).toContainText('126,49');
      await page.uncheck('#vereinbarter-faktor');
      await expect(page.locator('#ergebnis table')).toHaveCount(0);
    });
    test('travel checks expiry and a French category exclusion', async ({ page }) => {
      await page.goto('/de-de/reisecheck/');
      await page.selectOption('#ziel', 'FR');
      for (const [id, value] of Object.entries({
        reisedatum: '2026-10-01',
        geburtsdatum: '2020-01-01',
        chipdatum: '2020-03-01',
        impfdatum: '2026-01-01',
        impfbeginn: '2026-01-01',
        impfende: '2027-01-01',
      }))
        await page.fill(`#${id}`, value);
      for (const id of [
        'chip',
        'chip-standard',
        'impfung',
        'ausweis',
        'pass-vollstaendig',
        'begleitung',
      ])
        await page.selectOption(`#${id}`, 'ja');
      await page.selectOption('#auffrischung', 'nein');
      await page.selectOption('#frankreich-kategorie', '1');
      await page.click('#pruefen');
      await expect(page.locator('#reiseergebnis')).toContainText(
        'Einreise und Durchreise sind untersagt',
      );
      await page.selectOption('#frankreich-kategorie', 'none');
      await page.fill('#impfende', '2026-09-30');
      await page.click('#pruefen');
      await expect(page.locator('[data-anforderung="rabies-vaccination"]')).toHaveAttribute(
        'data-zustand',
        'not_fulfilled',
      );
      await page.getByRole('link', { name: 'Frankreich', exact: true }).click();
      await expect(
        page.getByRole('heading', { name: 'Frankreich: Hundekategorie vor der Reise klären' }),
      ).toBeVisible();
    });
  });
}
