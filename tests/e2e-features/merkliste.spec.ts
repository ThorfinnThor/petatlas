// M16-03 — Die Merkliste zeigt aktuelle Daten, nie gespeicherte Kopien.
import { expect, test } from '@playwright/test';

const MERKLISTE = '/de-de/merkliste/';
const FUTTER = '/de-de/futter/';

test('ist zunächst leer und sagt, wo sie liegt', async ({ page }) => {
  await page.goto(MERKLISTE);
  await expect(page.locator('.merk__kopf')).toHaveAttribute('data-leer', 'true');
  await expect(page.locator('.merk__kopf')).toContainText('nur auf diesem Gerät');
});

test('merkt ein Produkt und zeigt es mit aktuellen Daten', async ({ page }) => {
  await page.goto(`${FUTTER}royal-canin-mini-adult-2kg/`);
  const knopf = page.locator('button[data-merken="food"]');
  await expect(knopf).toBeVisible();
  await expect(knopf).toHaveText('Merken');
  await knopf.click();
  await expect(knopf).toHaveAttribute('aria-pressed', 'true');

  await page.goto(MERKLISTE);
  const eintrag = page.locator('[data-eintrag="food:royal-canin-mini-adult-2kg"]');
  await expect(eintrag).toBeVisible();
  await expect(eintrag).toHaveAttribute('data-stand', 'vorhanden');
  // Name und Menge kommen aus den aktuellen Daten, nicht aus dem Speicher.
  await expect(eintrag).toContainText('Mini Adult');
  await expect(eintrag).toContainText('2 kg');
});

test('speichert nur Kennung, Art und Zeitpunkt', async ({ page }) => {
  await page.goto(`${FUTTER}bosch-adult-lamm-reis-15kg/`);
  await page.locator('button[data-merken="food"]').click();

  const gespeichert = await page.evaluate(() =>
    JSON.parse(window.localStorage.getItem('petatlas.favorites.v1') ?? '{}'),
  );
  expect(gespeichert.entries.length).toBe(1);
  expect(Object.keys(gespeichert.entries[0]).sort()).toEqual([
    'addedAt',
    'coordinates',
    'id',
    'kind',
  ]);
  const roh = await page.evaluate(() => window.localStorage.getItem('petatlas.favorites.v1') ?? '');
  expect(roh).not.toContain('Nassfutter');
  expect(roh).not.toContain('€');
});

test('entfernt einen Eintrag über die Merkliste', async ({ page }) => {
  await page.goto(`${FUTTER}royal-canin-mini-adult-2kg/`);
  await page.locator('button[data-merken="food"]').click();
  await page.goto(MERKLISTE);
  await page.locator('button[data-entfernen]').first().click();
  await expect(page.locator('.merk__kopf')).toHaveAttribute('data-leer', 'true');
  expect(await page.evaluate(() => window.localStorage.getItem('petatlas.favorites.v1'))).toContain(
    '"entries":[]',
  );
});

test('meldet einen verschwundenen Eintrag, statt alte Angaben zu zeigen', async ({ page }) => {
  await page.goto(MERKLISTE);
  await page.evaluate(() => {
    window.localStorage.setItem(
      'petatlas.favorites.v1',
      JSON.stringify({
        version: 1,
        entries: [
          {
            kind: 'food',
            id: 'synthetisch:gibt-es-nicht-mehr',
            coordinates: null,
            addedAt: '2026-01-01T00:00:00+00:00',
          },
        ],
      }),
    );
  });
  await page.reload();

  const eintrag = page.locator('[data-eintrag="food:synthetisch:gibt-es-nicht-mehr"]');
  await expect(eintrag).toHaveAttribute('data-stand', 'verschwunden');
  await expect(eintrag.locator('.merk__weg')).toContainText('kein alter Preis');
  await expect(eintrag.locator('a')).toHaveCount(0);
});

test('überträgt nichts', async ({ page }) => {
  const anfragen: string[] = [];
  page.on('request', (anfrage) => {
    if (anfrage.method() !== 'GET' || !anfrage.url().startsWith('http://localhost')) {
      anfragen.push(`${anfrage.method()} ${anfrage.url()}`);
    }
  });
  await page.goto(`${FUTTER}royal-canin-mini-adult-2kg/`);
  await page.locator('button[data-merken="food"]').click();
  await page.goto(MERKLISTE);
  await expect(page.locator('.merk__liste > li')).toHaveCount(1);
  expect(anfragen).toEqual([]);
});

test('benutzt einen eigenen Speicherschlüssel neben dem Profil', async ({ page }) => {
  await page.goto(`${FUTTER}royal-canin-mini-adult-2kg/`);
  await page.locator('button[data-merken="food"]').click();
  const schluessel = await page.evaluate(() => Object.keys(window.localStorage));
  expect(schluessel).toEqual(['petatlas.favorites.v1']);
});
