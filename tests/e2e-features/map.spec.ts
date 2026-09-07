// M11-02 — Die Karte lädt erst auf Klick und reißt die Liste nicht mit.
import { expect, test } from '@playwright/test';

const KARTE = '/de-de/tierarzt-karte/';
const KACHELN = /tile\.openstreetmap\.org/;

test('lädt beim Seitenaufruf keine einzige Kachel', async ({ page }) => {
  const kachelAnfragen: string[] = [];
  page.on('request', (anfrage) => {
    if (KACHELN.test(anfrage.url())) kachelAnfragen.push(anfrage.url());
  });

  await page.goto(KARTE);
  await expect(page.locator('#trefferliste li').first()).toBeVisible();
  await page.waitForTimeout(1000);

  expect(kachelAnfragen).toEqual([]);
});

test('sagt vorher, was beim Anzeigen passiert', async ({ page }) => {
  await page.goto(KARTE);
  await expect(page.getByText(/Die Karte lädt erst, wenn Sie sie anfordern/)).toBeVisible();
  // Der Hinweis steht bewusst zweimal: als Ankündigung und als Datenschutzsatz.
  await expect(page.getByText(/Ihre IP-Adresse/).first()).toBeVisible();
  await expect(page.locator('.kartenhinweis')).toContainText('tile.openstreetmap.org');
  await expect(page.locator('#karte')).toBeHidden();
});

test('lädt Kacheln erst nach dem Klick und zeigt die Attribution', async ({ page }) => {
  const kachelAnfragen: string[] = [];
  page.on('request', (anfrage) => {
    if (KACHELN.test(anfrage.url())) kachelAnfragen.push(anfrage.url());
  });

  await page.goto(KARTE);
  expect(kachelAnfragen).toEqual([]);

  await page.click('#karte-anzeigen');
  await expect(page.locator('#karte.leaflet-container')).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap');

  await expect.poll(() => kachelAnfragen.length, { timeout: 20_000 }).toBeGreaterThan(0);
});

test('lädt keine Kacheln vorrätig für andere Ausschnitte', async ({ page }) => {
  await page.goto(KARTE);
  await page.click('#karte-anzeigen');
  await expect(page.locator('#karte.leaflet-container')).toBeVisible({ timeout: 30_000 });

  // Leaflet lädt den sichtbaren Ausschnitt. Ein Vorabladen ganzer Regionen
  // würde sich als sehr viel höhere Kachelzahl zeigen.
  const anfragen: string[] = [];
  page.on('request', (anfrage) => {
    if (KACHELN.test(anfrage.url())) anfragen.push(anfrage.url());
  });
  await page.waitForTimeout(3000);
  expect(anfragen.length).toBeLessThan(60);
});

test('ein Ausfall des Kacheldienstes lässt die Liste unberührt', async ({ page }) => {
  // Der Kacheldienst wird geblockt; die Liste muss davon nichts merken.
  await page.route(KACHELN, (route) => route.abort());

  await page.goto(KARTE);
  const trefferVorher = await page.locator('#trefferliste li').count();
  expect(trefferVorher).toBeGreaterThan(0);

  await page.click('#karte-anzeigen');
  await expect(page.locator('#karte-status')).toContainText(/keine Kacheln|nicht geladen/, {
    timeout: 30_000,
  });

  // Die Liste bleibt vollständig lesbar. Sie zeigt jetzt den gewählten
  // Ausschnitt statt des statischen Standards — aber sie ist da.
  await expect(page.locator('#trefferliste li').first()).toBeVisible();
  expect(await page.locator('#trefferliste li').count()).toBeGreaterThan(0);
  await expect(page.locator('#trefferliste h3').first()).toBeVisible();
});

test('nennt die Kartenkacheln als Ergänzung, nicht als Voraussetzung', async ({ page }) => {
  await page.goto(KARTE);
  await expect(page.getByText(/Die Karte ist eine Ergänzung/)).toBeVisible();
});
