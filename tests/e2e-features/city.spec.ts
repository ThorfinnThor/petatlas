// M11-04 — Stadtseiten haben echten lokalen Inhalt und keine leere Rubrik.
import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

const allowlist = JSON.parse(readFileSync('content-data/city-allowlist.json', 'utf8')) as {
  cities: readonly { slug: string; name: string; measured: { total: number } }[];
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

test('die Stadtseite zeigt alle vier Kategorien mit Einträgen', async ({ page }) => {
  await page.goto(`${KARTE}${ERSTE.slug}/`);
  await expect(page.locator('h1')).toContainText(ERSTE.name);

  for (const titel of ['Tierarztpraxen', 'Tierheime', 'Zoofachgeschäfte', 'Hundewiesen']) {
    const abschnitt = page.locator('section', {
      has: page.getByRole('heading', { level: 2, name: new RegExp(titel) }),
    });
    await expect(abschnitt.locator('.treffer > li').first()).toBeVisible();
  }
});

test('nennt Quelle, Lizenz und die Grenzen der Daten', async ({ page }) => {
  await page.goto(`${KARTE}${ERSTE.slug}/`);
  await expect(page.getByText('OpenStreetMap contributors').first()).toBeVisible();
  await expect(page.getByText('Open Database License')).toBeVisible();
  await expect(page.getByText('nicht vollständig')).toBeVisible();
  await expect(page.getByText('Kein Notdienstverzeichnis')).toBeVisible();
});

test('zeigt auf sich selbst als canonical und führt zurück zur Karte', async ({ page }) => {
  await page.goto(`${KARTE}${ERSTE.slug}/`);
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute('href', new RegExp(`${KARTE}${ERSTE.slug}/$`));
  await expect(page.locator(`a[href="${KARTE}"]`).first()).toBeVisible();
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
