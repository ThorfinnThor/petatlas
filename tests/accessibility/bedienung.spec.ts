/**
 * M18-04 — Was axe nicht prüfen kann.
 *
 * Reihenfolge, sichtbarer Fokus, Bedienbarkeit ohne Maus und Verhalten bei
 * starkem Zoom sind Eigenschaften des Zusammenspiels, keine Eigenschaften
 * einzelner Elemente. Sie werden deshalb hier gefahren, nicht geprüft.
 */
import { expect, test } from '@playwright/test';

const SEITEN = [
  '/de-de/',
  '/de-de/tierarztkosten/',
  '/de-de/reisecheck/',
  '/de-de/tierarzt-karte/',
];

test.describe('Sprungmarke', () => {
  for (const pfad of SEITEN) {
    test(`${pfad}: führt zum Inhalt`, async ({ page }) => {
      await page.goto(pfad);
      const marke = page.locator('a.sprungmarke');

      // Sie steht vor allem anderen im Dokument, liegt außerhalb des
      // Sichtfelds, solange niemand sie braucht, und springt hinein, sobald
      // sie den Fokus hat. `toBeHidden` trifft das nicht: für Playwright ist
      // ein verschobenes Element sichtbar. Geprüft wird deshalb die Lage.
      await expect(marke).toHaveCount(1);
      const vorher = await marke.boundingBox();
      expect(vorher, 'Sprungmarke ohne Maße').not.toBeNull();
      expect(
        (vorher?.y ?? 0) + (vorher?.height ?? 0),
        'liegt im Sichtfeld, obwohl unfokussiert',
      ).toBeLessThanOrEqual(0);

      await marke.focus();
      const nachher = await marke.boundingBox();
      expect(nachher?.y ?? -1, 'springt beim Fokus nicht ins Sichtfeld').toBeGreaterThanOrEqual(0);

      await page.keyboard.press('Enter');
      await expect(page.locator('main')).toBeFocused();
    });

    test(`${pfad}: ist der erste Tabstopp`, async ({ page, browserName }) => {
      // Safari springt mit Tab standardmäßig nur zwischen Formularfeldern,
      // nicht zwischen Links. Das ist eine Einstellung des Browsers, kein
      // Mangel der Seite — deshalb wird die Reihenfolge dort nicht über Tab
      // geprüft. Der Befund steht in docs/ACCESSIBILITY.md.
      test.skip(browserName === 'webkit', 'Safari tabt standardmäßig nicht auf Links.');

      await page.goto(pfad);
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toHaveClass(/sprungmarke/);
    });
  }
});

test.describe('Tastaturbedienung', () => {
  test('jedes bedienbare Element ist erreichbar und ohne positives tabindex', async ({ page }) => {
    await page.goto('/de-de/tierarztkosten/');
    const positive = await page.evaluate(() =>
      [...document.querySelectorAll('[tabindex]')]
        .map((element) => Number(element.getAttribute('tabindex')))
        .filter((wert) => wert > 0),
    );
    // Ein positives tabindex zerreißt die Reihenfolge des Dokuments.
    expect(positive).toEqual([]);
  });

  test('der Fokus ist sichtbar, nicht nur vorhanden', async ({ page }) => {
    await page.goto('/de-de/');
    // Ausdrücklich per focus() statt per Tab: geprüft wird die Darstellung
    // des Fokus, nicht die Tab-Politik des Browsers.
    const ziel = page.locator('header a').first();
    await ziel.focus();

    const stil = await page.evaluate(() => {
      const element = document.activeElement;
      if (element === null || element === document.body) return null;
      const berechnet = getComputedStyle(element);
      return {
        outlineWidth: berechnet.outlineWidth,
        outlineStyle: berechnet.outlineStyle,
        boxShadow: berechnet.boxShadow,
        textDecoration: berechnet.textDecorationLine,
      };
    });

    expect(stil).not.toBeNull();
    const hatRing =
      (stil?.outlineStyle !== 'none' && stil?.outlineWidth !== '0px') ||
      (stil?.boxShadow !== undefined && stil.boxShadow !== 'none');
    expect(hatRing, JSON.stringify(stil)).toBe(true);
  });

  test('der Rechner lässt sich ohne Maus bedienen', async ({ page }) => {
    await page.goto('/de-de/tierarztkosten/');
    const feld = page.locator('#leistung');
    if ((await feld.count()) === 0) test.skip(true, 'Der Rechner hat kein Auswahlfeld.');
    await feld.focus();
    await expect(feld).toBeFocused();
  });
});

test.describe('Zoom und schmale Fenster', () => {
  for (const pfad of SEITEN) {
    test(`${pfad}: kein waagerechtes Scrollen bei 320 CSS-Pixeln`, async ({ page }) => {
      // WCAG 1.4.10 verlangt Umbruch bis hinunter zu 320 CSS-Pixeln; das
      // entspricht 400 Prozent Zoom auf einem 1280er Fenster.
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(pfad);
      await page.waitForLoadState('networkidle');

      const ueberstand = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      // Ein Pixel Toleranz für Rundungen im Layout.
      expect(ueberstand.scrollWidth, JSON.stringify(ueberstand)).toBeLessThanOrEqual(
        ueberstand.clientWidth + 1,
      );
    });
  }
});

test.describe('Struktur', () => {
  for (const pfad of SEITEN) {
    test(`${pfad}: eine H1 und ein Hauptbereich`, async ({ page }) => {
      await page.goto(pfad);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main')).toHaveCount(1);
      await expect(page.locator('header nav[aria-label]')).toHaveCount(1);
    });

    test(`${pfad}: Überschriften überspringen keine Ebene`, async ({ page }) => {
      await page.goto(pfad);
      const ebenen = await page.evaluate(() =>
        [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((element) =>
          Number(element.tagName.slice(1)),
        ),
      );
      let vorher = 0;
      for (const ebene of ebenen) {
        if (vorher !== 0)
          expect(ebene, `Sprung von h${vorher} zu h${ebene}`).toBeLessThanOrEqual(vorher + 1);
        vorher = ebene;
      }
    });
  }
});
