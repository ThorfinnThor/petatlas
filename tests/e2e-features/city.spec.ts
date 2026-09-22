// M11-04 — Stadtseiten haben echten lokalen Inhalt und keine leere Rubrik.
import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

const allowlist = JSON.parse(readFileSync('content-data/city-allowlist.json', 'utf8')) as {
  cities: readonly { slug: string; name: string; measured: { total: number } }[];
};
const ortsSnapshot = JSON.parse(readFileSync('data-snapshots/places/places-de.json', 'utf8')) as {
  source: { retrievalDate: string };
};
const KARTE = '/de-de/tierarzt-karte/';
const ERSTE = allowlist.cities[0]!;

test('die Kartenseite verlinkt jede Stadtseite', async ({ page }) => {
  await page.goto(KARTE);
  const links = page.locator('.staedte a');
  await expect(links).toHaveCount(allowlist.cities.length);
  for (const stadt of allowlist.cities) {
    await expect(page.locator(`.staedte a[href="${KARTE}${stadt.slug}/"]`)).toHaveText(stadt.name);
  }
});

test('die Stadtseite zeigt alle vier Kategorien als lokale Filter mit Einträgen', async ({
  page,
}) => {
  await page.goto(`${KARTE}${ERSTE.slug}/`);
  await expect(page.locator('h1')).toContainText(ERSTE.name);

  for (const label of ['Tierarztpraxis', 'Tierheim', 'Zoofachhandel', 'Hundewiese']) {
    await expect(page.getByRole('checkbox', { name: new RegExp(label) })).toBeVisible();
  }
  await expect(page.locator('#trefferliste > li').first()).toBeVisible();
  await expect(page.locator('[data-category-count]')).toHaveCount(4);
});

test('die Stadtseite filtert die Liste und enthält eine eingebettete Karte', async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill({
      contentType: 'image/png',
      body: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8L8AAAAASUVORK5CYII=',
        'base64',
      ),
    }),
  );
  await page.goto(`${KARTE}${ERSTE.slug}/`);
  await page.getByRole('checkbox', { name: /Tierarztpraxis/ }).check();
  await expect(page.locator('#treffer-status')).toContainText('erfasste Orte');
  const kategorien = await page.locator('#trefferliste .meta').allTextContents();
  expect(kategorien.every((text) => text.includes('Tierarztpraxis'))).toBe(true);
  await page.getByRole('button', { name: 'Karte anzeigen' }).click();
  await expect(page.locator('#karte .leaflet-map-pane')).toHaveCount(1);
});

test('nennt Quelle, Lizenz und die Grenzen der Daten', async ({ page }) => {
  await page.goto(`${KARTE}${ERSTE.slug}/`);
  const datum = new Intl.DateTimeFormat('de-DE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(`${ortsSnapshot.source.retrievalDate}T00:00:00Z`));
  await expect(page.getByText(`Datenstand: ${datum}`)).toBeVisible();
  await expect(page.getByText('OpenStreetMap contributors').first()).toBeVisible();
  await expect(page.getByText('Open Database License')).toBeVisible();
  await expect(page.getByText('nicht vollständig')).toBeVisible();
  await expect(page.getByText('Kein Notdienstverzeichnis')).toBeVisible();
});

test('zeigt auf sich selbst als canonical und führt zurück zur Karte', async ({ page }) => {
  await page.goto(`${KARTE}${ERSTE.slug}/`);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute('href', new RegExp(`${KARTE}${ERSTE.slug}/$`));
  // Im Inhalt, nicht in der Navigation: die Navigation klappt auf schmalen
  // Geräten ein, der Rückweg im Text muss trotzdem dastehen.
  await expect(page.locator(`main a[href="${KARTE}"]`).first()).toBeVisible();
});

test('es gibt keine Seite für eine Stadt außerhalb der Allowlist', async ({ page }) => {
  const antwort = await page.goto(`${KARTE}wanne-eickel/`);
  expect(antwort?.status()).toBe(404);
});

test('bleibt ohne JavaScript vollständig lesbar', async ({ browser }) => {
  const kontext = await browser.newContext({ javaScriptEnabled: false });
  const seite = await kontext.newPage();
  await seite.goto(`${KARTE}${ERSTE.slug}/`);
  await expect(seite.locator('.treffer > li').first()).toBeVisible();
  await kontext.close();
});
