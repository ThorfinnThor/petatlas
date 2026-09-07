// M11-01 — Die Liste ist die Hauptsache und funktioniert ohne Karte.
import { expect, test } from '@playwright/test';

const KARTE = '/de-de/tierarzt-karte/';

test('zeigt ohne JavaScript eine echte Trefferliste', async ({ browser }) => {
  const kontext = await browser.newContext({ javaScriptEnabled: false });
  const seite = await kontext.newPage();
  await seite.goto(KARTE);

  // Der statische Standardausschnitt steht im HTML, nicht erst nach dem Skript.
  await expect(seite.locator('#trefferliste li')).toHaveCount(25);
  await expect(seite.locator('#trefferliste h3').first()).toBeVisible();
  await expect(seite.locator('#treffer-status')).toContainText('erfasste Orte');
  await kontext.close();
});

test('nennt Quelle und Lizenz auf der Seite', async ({ page }) => {
  await page.goto(KARTE);
  await expect(page.getByText('OpenStreetMap contributors').first()).toBeVisible();
  await expect(page.getByText('Open Database License')).toBeVisible();
});

test('sagt ausdrücklich, dass dies kein Notdienstverzeichnis ist', async ({ page }) => {
  await page.goto(KARTE);
  await expect(page.getByText('Kein Notdienstverzeichnis')).toBeVisible();
  await expect(page.getByText(/keine Notdienstauskunft/)).toBeVisible();
});

test('kennzeichnet nicht erfasste Angaben als nicht erfasst', async ({ page }) => {
  await page.goto(KARTE);
  await expect(page.getByText('Öffnungszeiten nicht erfasst').first()).toBeVisible();
});

test('findet einen Ort und lädt seinen Ausschnitt', async ({ page }) => {
  await page.goto(KARTE);
  await page.fill('#ort', 'Bremen');
  await expect(page.locator('#ort-treffer button').first()).toBeVisible({ timeout: 20_000 });

  await page.locator('#ort-treffer button').first().click();
  await expect(page.locator('#treffer-status')).toContainText('um Bremen', { timeout: 20_000 });
  await expect(page.locator('#trefferliste li').first()).toBeVisible();
});

test('filtert nach Kategorie', async ({ page }) => {
  await page.goto(KARTE);
  await page.fill('#ort', 'Bremen');
  await expect(page.locator('#ort-treffer button').first()).toBeVisible({ timeout: 20_000 });
  await page.locator('#ort-treffer button').first().click();
  await expect(page.locator('#treffer-status')).toContainText('um Bremen', { timeout: 20_000 });

  await page.check('input[value="animal_shelter"]');
  await expect(page.locator('#treffer-status')).not.toContainText('Wird geladen', {
    timeout: 20_000,
  });
  const kategorien = await page.locator('#trefferliste .meta').allInnerTexts();
  expect(kategorien.length).toBeGreaterThan(0);
  for (const zeile of kategorien) expect(zeile).toContain('Tierheim');
});

test('sagt bei null Treffern, dass nichts erfasst ist, nicht dass es nichts gibt', async ({
  page,
}) => {
  await page.goto(KARTE);
  // Hannover hat im Snapshot kein Tierheim innerhalb von 5 km — geprüft
  // gegen die Daten, nicht geraten. Ändert sich der Snapshot, muss dieser
  // Fall neu gewählt werden; das ist der Preis dafür, echte Daten zu testen.
  await page.fill('#ort', 'Hannover');
  await expect(page.locator('#ort-treffer button').first()).toBeVisible({ timeout: 20_000 });
  await page.locator('#ort-treffer button').first().click();
  await expect(page.locator('#treffer-status')).toContainText('um Hannover', { timeout: 20_000 });

  await page.selectOption('#radius', '5000');
  await page.check('input[value="animal_shelter"]');
  await expect(page.locator('#treffer-status')).toContainText('ist nichts erfasst', {
    timeout: 20_000,
  });
  await expect(page.locator('#treffer-status')).toContainText('nicht, dass es dort nichts gibt');
  await expect(page.locator('#trefferliste li')).toHaveCount(0);
});

test('lädt beim Start keine Ortsdaten, sondern erst auf Eingabe', async ({ page }) => {
  const anfragen: string[] = [];
  page.on('request', (anfrage) => {
    if (anfrage.url().includes('/data/v1/places/')) anfragen.push(anfrage.url());
  });

  await page.goto(KARTE);
  await expect(page.locator('#trefferliste li').first()).toBeVisible();
  // Der Standardausschnitt kommt aus dem HTML, nicht aus einem Nachladen.
  expect(anfragen).toEqual([]);
});

test('ist ohne Maus bedienbar', async ({ page }) => {
  await page.goto(KARTE);
  await page.locator('#ort').focus();
  await page.keyboard.type('Bremen');
  await expect(page.locator('#ort-treffer button').first()).toBeVisible({ timeout: 20_000 });
  await page.locator('#ort-treffer button').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#treffer-status')).toContainText('um Bremen', { timeout: 20_000 });
});
