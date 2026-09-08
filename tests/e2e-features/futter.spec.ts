// M15-03 — Futtersuche, Produktseite und ein Preisvergleich, der leer bleiben darf.
import { expect, test } from '@playwright/test';

const FUTTER = '/de-de/futter/';

test('nennt die Daten synthetisch und listet alle Produkte', async ({ page }) => {
  await page.goto(FUTTER);
  await expect(page.getByText('Synthetische Futterdaten')).toBeVisible();
  await expect(page.locator('.produkte li')).toHaveCount(4);
});

test('findet ein Produkt über die abgetippte Nummer', async ({ page }) => {
  await page.goto(FUTTER);
  await page.fill('#futter-begriff', '4006-3813 33931');
  await page.click('#futter-suchen');
  await expect(page.locator('[data-futter="synthetisch:trocken-1kg"]').first()).toBeVisible();
  await expect(page.locator('.treffer__liste [data-grund="gtin"]')).toHaveCount(1);
});

test('findet über den Namen und sagt, worauf der Treffer beruht', async ({ page }) => {
  await page.goto(FUTTER);
  await page.fill('#futter-begriff', 'nassfutter');
  await page.click('#futter-suchen');
  await expect(page.locator('.treffer__liste > li')).toHaveCount(2);
  await expect(page.locator('.treffer__liste .treffer__meta').first()).toContainText(
    'Produktnamen',
  );
});

test('sagt bei fehlendem Treffer nicht, dass es das Produkt nicht gibt', async ({ page }) => {
  await page.goto(FUTTER);
  await page.fill('#futter-begriff', 'gibtesnicht');
  await page.click('#futter-suchen');
  await expect(page.locator('.treffer__kopf')).toContainText('nicht erfasst');
});

test('zeigt deklarierte Nährwerte mit Bezug und Quelle', async ({ page }) => {
  await page.goto(`${FUTTER}trocken-1kg/`);
  await expect(page.locator('[data-naehrwert="protein"]')).toContainText('Frischmasse');
  await expect(page.locator('[data-naehrwert="protein"] a')).toHaveAttribute('href', /^https:\/\//);
  await expect(page.locator('[data-testid="nicht-deklariert"]')).toContainText('ash');
  await expect(page.locator('[data-testid="nicht-deklariert"]')).toContainText('keine Null');
});

test('bleibt ohne Nährwerte nutzbar', async ({ page }) => {
  await page.goto(`${FUTTER}trocken-12kg/`);
  await expect(page.locator('[data-testid="menge"]')).toContainText('12 kg');
});

test('nennt den leeren Angebotsvergleich ehrlich', async ({ page }) => {
  await page.goto(`${FUTTER}nass-400g/`);
  await expect(page.locator('[data-testid="keine-angebote"]')).toContainText(
    /[Oo]hne freigegebenen Partnervertrag/,
  );
});

test('verweist auf dieselbe Variante mit anderem Gebinde', async ({ page }) => {
  await page.goto(`${FUTTER}nass-400g/`);
  await expect(page.locator('[data-variante="synthetisch:nass-6x400"]')).toBeVisible();
  await page.goto(`${FUTTER}trocken-1kg/`);
  await expect(page.locator('[data-variante]')).toHaveCount(0);
});

test('gibt keine Seite für ein erfundenes Produkt', async ({ page }) => {
  const antwort = await page.request.get(`${FUTTER}gibtesnicht/`);
  expect(antwort.status()).toBe(404);
});

test.describe('Abnahme der Darstellung', () => {
  test('trennt Rohdaten sichtbar vom Angebotsteil', async ({ page }) => {
    await page.goto(`${FUTTER}trocken-1kg/`);
    const ueberschriften = await page.locator('main h2').allInnerTexts();
    expect(ueberschriften).toContain('Deklarierte Nährwerte');
    expect(ueberschriften).toContain('Angebote');
    // Die Nährwerttabelle steht nicht im Angebotsteil.
    const tabelle = page.locator('.naehrwerte');
    await expect(tabelle).toHaveCount(1);
  });

  test('zeigt zu jedem Labelwert Einheit, Bezug und Quelle', async ({ page }) => {
    await page.goto(`${FUTTER}trocken-1kg/`);
    const zeile = page.locator('[data-naehrwert="protein"]');
    await expect(zeile).toContainText('22');
    await expect(zeile).toContainText('g');
    await expect(zeile).toContainText('je 100 g Frischmasse');
    await expect(zeile).toContainText('Etikett');
    await expect(zeile).toContainText('geprüft am 2026-09-07');
  });

  test('nennt Menge und Nummer verständlich', async ({ page }) => {
    await page.goto(`${FUTTER}nass-6x400/`);
    await expect(page.locator('[data-testid="menge"]')).toContainText('6 × 400 g = 2,4 kg');
  });

  test('behauptet nirgends einen Testsieger oder einen Score', async ({ page }) => {
    for (const pfad of [FUTTER, `${FUTTER}trocken-1kg/`, `${FUTTER}nass-400g/`]) {
      await page.goto(pfad);
      // Geprüft wird der behauptende Teil der Seite: die Ausschlussliste und
      // die Hinweisboxen dürfen die Wörter nennen, weil sie sie verneinen.
      const text = await page.evaluate(() => {
        const haupt = document.querySelector('main')?.cloneNode(true) as HTMLElement | null;
        if (haupt === null) return '';
        for (const element of haupt.querySelectorAll('[data-ausschluss], .notiz')) {
          element.remove();
        }
        return haupt.innerText.toLowerCase();
      });
      for (const wort of ['testsieger', 'score', 'bestnote', 'punktzahl', 'bewertung:']) {
        expect(text.includes(wort), `${wort} auf ${pfad}`).toBe(false);
      }
      // Und die Verneinung steht tatsächlich auf der Seite.
      const ganz = (await page.locator('main').innerText()).toLowerCase();
      expect(ganz.includes('keine bewertung') || ganz.includes('nährwertscores')).toBe(true);
    }
  });

  test('sagt bei fehlender Angabe „nicht deklariert“ und nicht 0', async ({ page }) => {
    await page.goto(`${FUTTER}trocken-1kg/`);
    await expect(page.locator('[data-testid="lebensphase"]')).not.toHaveText('0');
    await expect(page.locator('[data-testid="nicht-deklariert"]')).toContainText('keine Null');
    await page.goto(`${FUTTER}nass-400g/`);
    await expect(page.locator('[data-testid="lebensphase"]')).toHaveText('nicht deklariert');
  });

  test('erklärt den leeren Angebotsteil, statt ihn wegzulassen', async ({ page }) => {
    await page.goto(`${FUTTER}trocken-12kg/`);
    await expect(page.locator('[data-testid="keine-angebote"]')).toBeVisible();
    await expect(page.locator('[data-testid="keine-angebote"]')).toContainText(
      'keine Aussage über den Markt',
    );
  });
});
