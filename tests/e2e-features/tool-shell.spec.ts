// M21-03 — Die zweispaltige Tool-Ansicht ist kein Aussehen, sondern eine
// Zusage: das Ergebnis steht am Desktop neben der Eingabe, nicht darunter,
// und auf dem Telefon bleibt die Reihenfolge Eingabe, Aktion, Ergebnis.
import { expect, test } from '@playwright/test';

test.describe('Tool-Ansicht des Rechners', () => {
  test('stellt Eingabe und Ergebnis am Desktop nebeneinander', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Aussage gilt für den Desktop.');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/de-de/tierarztkosten/');

    const eingabe = await page.locator('.werkzeug__eingabe').boundingBox();
    const ergebnis = await page.locator('.werkzeug__ergebnis').boundingBox();
    expect(eingabe).not.toBeNull();
    expect(ergebnis).not.toBeNull();
    if (eingabe === null || ergebnis === null) return;

    // Nebeneinander heißt: das Ergebnis beginnt rechts von der Eingabe und
    // nicht unterhalb.
    expect(ergebnis.x).toBeGreaterThan(eingabe.x + eingabe.width - 1);
    expect(ergebnis.y).toBeLessThan(eingabe.y + eingabe.height);

    // Abschnitt 24.2: V2: links 7, rechts 5 Spalten — die Eingabe ist breiter.
    expect(eingabe.width).toBeGreaterThan(ergebnis.width);
  });

  test('zeigt die Ergebnisüberschrift ohne Scrollen', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Aussage gilt für den Desktop.');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/de-de/tierarztkosten/');

    const gemessen = await page.evaluate(() => {
      const titel = document.getElementById('ergebnis-titel');
      if (titel === null) return null;
      // Der Testdatenhinweis steht nur in Vorschaubauten. Er gehört nicht
      // zur Seite, die ausgeliefert würde, und wird deshalb herausgerechnet
      // statt geschätzt: gemessen wird seine tatsächliche Höhe samt Abstand.
      const banner = document.querySelector('[data-testid="test-data-banner"]');
      const bannerHoehe =
        banner === null
          ? 0
          : banner.getBoundingClientRect().height +
            Number.parseFloat(getComputedStyle(banner).marginBottom || '0');
      return {
        oben: titel.getBoundingClientRect().top,
        bannerHoehe,
        hoehe: window.innerHeight,
        gescrollt: window.scrollY,
      };
    });
    expect(gemessen).not.toBeNull();
    if (gemessen === null) return;

    expect(gemessen.gescrollt).toBe(0);
    expect(gemessen.bannerHoehe).toBeGreaterThan(0);
    expect(gemessen.oben - gemessen.bannerHoehe).toBeLessThan(gemessen.hoehe);
  });

  test('beginnt das Ergebnis auf derselben Höhe wie die Eingabe', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-desktop', 'Aussage gilt für den Desktop.');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/de-de/tierarztkosten/');

    // Das ist die eigentliche Zusage der zweispaltigen Ansicht und hängt
    // nicht daran, wie lang die Texte darüber gerade sind.
    const eingabe = await page.locator('.werkzeug__eingabe').boundingBox();
    const ergebnis = await page.locator('.werkzeug__ergebnis').boundingBox();
    expect(eingabe).not.toBeNull();
    expect(ergebnis).not.toBeNull();
    if (eingabe === null || ergebnis === null) return;
    expect(Math.abs(ergebnis.y - eingabe.y)).toBeLessThan(2);
  });

  test('behält auf dem Telefon die Reihenfolge Eingabe, Aktion, Ergebnis', async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium-mobile', 'Aussage gilt für schmale Fenster.');
    await page.goto('/de-de/tierarztkosten/');

    const reihenfolge = await page.evaluate(() => {
      const y = (auswahl: string): number => {
        const element = document.querySelector(auswahl);
        return element === null ? Number.NaN : element.getBoundingClientRect().top + window.scrollY;
      };
      return {
        eingabe: y('.werkzeug__eingabe'),
        aktion: y('#rechner button[type="submit"]'),
        ergebnis: y('.werkzeug__ergebnis'),
      };
    });
    expect(Number.isNaN(reihenfolge.eingabe)).toBe(false);
    expect(reihenfolge.aktion).toBeGreaterThan(reihenfolge.eingabe);
    expect(reihenfolge.ergebnis).toBeGreaterThan(reihenfolge.aktion);
  });

  test('folgt der sichtbaren Reihenfolge auch im Quelltext', async ({ page }) => {
    await page.goto('/de-de/tierarztkosten/');
    const html = await page.content();
    // Kein Umsortieren per CSS: sonst liefe die Tastaturreihenfolge der
    // sichtbaren davon.
    expect(html.indexOf('werkzeug__eingabe')).toBeLessThan(html.indexOf('werkzeug__ergebnis'));
    expect(html).not.toContain('order:');
  });
});

test.describe('Schrittanzeige des Reisechecks', () => {
  test('nennt vier Schritte mit Nummer und Text', async ({ page }) => {
    await page.goto('/de-de/reisecheck/');
    const anzeige = page.locator('[data-schrittanzeige]');
    await expect(anzeige).toBeVisible();
    for (const titel of ['Reise', 'Tier', 'Angaben', 'Ergebnis']) {
      await expect(anzeige.getByRole('link', { name: new RegExp(titel) })).toBeVisible();
    }
    // Kein rein visueller Fortschrittsbalken (Abschnitt 28.2).
    await expect(page.locator('progress')).toHaveCount(0);
  });

  test('verliert beim Zurückgehen keine Eingabe', async ({ page }) => {
    await page.goto('/de-de/reisecheck/');

    await page.locator('#reisedatum').fill('2026-10-01');
    await page.locator('#geburtsdatum').fill('2024-05-02');
    await page.locator('#chip').selectOption('ja');

    // Über die Schrittanzeige zurück zum ersten Schritt und wieder vor.
    await page.locator('[data-schrittanzeige] a[data-schritt="schritt-reise"]').click();
    await page.locator('[data-schrittanzeige] a[data-schritt="schritt-angaben"]').click();

    await expect(page.locator('#reisedatum')).toHaveValue('2026-10-01');
    await expect(page.locator('#geburtsdatum')).toHaveValue('2024-05-02');
    await expect(page.locator('#chip')).toHaveValue('ja');
  });

  test('markiert den Schritt, in dem gelesen wird', async ({ page }) => {
    await page.goto('/de-de/reisecheck/');
    const reise = page.locator('[data-schrittanzeige] a[data-schritt="schritt-reise"]');
    await expect(reise).toHaveAttribute('aria-current', 'step');

    await page.locator('#schritt-angaben').scrollIntoViewIfNeeded();
    await expect(
      page.locator('[data-schrittanzeige] a[data-schritt="schritt-angaben"]'),
    ).toHaveAttribute('aria-current', 'step');
    await expect(reise).not.toHaveAttribute('aria-current', 'step');
  });
});

test.describe('Auswahlkarten im Rechner (M21-05)', () => {
  test('wählt aus, wenn irgendwo auf die Karte geklickt wird', async ({ page }) => {
    await page.goto('/de-de/tierarztkosten/');
    const karte = page.locator('label.wahlkarte', { hasText: 'Notdienst' });
    // Bewusst auf die Erläuterung klicken, nicht auf den Radiopunkt.
    await karte.getByText('zuzüglich Notdienstgebühr').click();
    await expect(page.locator('input[name="kontext"][value="emergency"]')).toBeChecked();
  });

  test('bleibt mit der Tastatur bedienbar', async ({ page }) => {
    await page.goto('/de-de/tierarztkosten/');
    await page.locator('input[name="tierart"][value="unbekannt"]').focus();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('input[name="tierart"][value="dog"]')).toBeChecked();
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('input[name="tierart"][value="cat"]')).toBeChecked();
  });

  test('zeigt den gewählten Zustand nicht nur über die Farbe', async ({ page }) => {
    await page.goto('/de-de/tierarztkosten/');
    // Das Radio selbst bleibt sichtbar und angekreuzt.
    const gewaehlt = page.locator('input[name="kontext"][value="regular"]');
    await expect(gewaehlt).toBeChecked();
    await expect(gewaehlt).toBeVisible();
  });
});
