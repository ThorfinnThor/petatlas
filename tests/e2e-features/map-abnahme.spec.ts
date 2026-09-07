// M11-06 — Abnahme im echten Browser: mobil, ohne Maus, bei Providerausfall,
// über Zellgrenzen hinweg, bei Ortswechsel und entlang der internen Links.
import { readFileSync } from 'node:fs';

import { expect, test, type Page } from '@playwright/test';

const KARTE = '/de-de/tierarzt-karte/';
const KACHELN = /tile\.openstreetmap\.org/;

const allowlist = JSON.parse(readFileSync('content-data/city-allowlist.json', 'utf8')) as {
  cities: readonly { slug: string; name: string }[];
};
const STADT = `${KARTE}${allowlist.cities[0]!.slug}/`;

/** Breite des Dokuments gegen die des Fensters. Differenz = Bedienbruch. */
async function ueberbreite(page: Page): Promise<number> {
  return page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
}

test('keine Seite läuft horizontal über', async ({ page }) => {
  for (const pfad of [KARTE, STADT, '/de-de/quellen/', '/de-de/']) {
    await page.goto(pfad);
    await expect(page.locator('h1')).toBeVisible();
    expect(await ueberbreite(page), `Überbreite auf ${pfad}`).toBeLessThanOrEqual(1);
  }
});

test('auch die geöffnete Karte bleibt in der Breite', async ({ page }) => {
  await page.goto(KARTE);
  await page.click('#karte-anzeigen');
  await expect(page.locator('#karte.leaflet-container')).toBeVisible({ timeout: 30_000 });

  expect(await ueberbreite(page)).toBeLessThanOrEqual(1);
  const masse = await page.evaluate(() => {
    const karte = document.querySelector('#karte');
    return karte === null
      ? null
      : { breite: karte.getBoundingClientRect().width, fenster: window.innerWidth };
  });
  expect(masse).not.toBeNull();
  expect(masse!.breite).toBeLessThanOrEqual(masse!.fenster);
});

test('die Karte lässt sich ohne Maus öffnen', async ({ page }) => {
  await page.goto(KARTE);
  await page.locator('#karte-anzeigen').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#karte.leaflet-container')).toBeVisible({ timeout: 30_000 });
  // Auch die Zoombedienung ist über die Tastatur erreichbar.
  await expect(page.locator('.leaflet-control-zoom a').first()).toBeVisible();
});

test('bei ausgefallenem Kacheldienst bleibt die Attribution vollständig', async ({ page }) => {
  await page.route(KACHELN, (route) => route.abort());
  await page.goto(KARTE);
  await page.click('#karte-anzeigen');

  await expect(page.locator('#karte-status')).toContainText(/keine Kacheln|nicht geladen/, {
    timeout: 30_000,
  });
  // Der Ausfall betrifft die Kacheln, nicht die Pflichthinweise zu den Daten.
  await expect(page.getByText('OpenStreetMap contributors').first()).toBeVisible();
  await expect(page.getByText('Open Database License')).toBeVisible();
  await expect(page.locator('#trefferliste li').first()).toBeVisible();
});

test('lädt über eine Zellgrenze hinweg die Nachbarzellen — und jede nur einmal', async ({
  page,
}) => {
  const zellen: string[] = [];
  page.on('request', (anfrage) => {
    if (/\/data\/v1\/places\/de\/cells\//.test(anfrage.url())) zellen.push(anfrage.url());
  });

  await page.goto(KARTE);
  await page.fill('#ort', 'Bremen');
  await expect(page.locator('#ort-treffer button').first()).toBeVisible({ timeout: 20_000 });
  await page.locator('#ort-treffer button').first().click();
  await expect(page.locator('#treffer-status')).toContainText('um Bremen', { timeout: 20_000 });

  // 50 km um Bremen reichen über die Zelle hinaus; die Nachbarn müssen dazu.
  await page.selectOption('#radius', '50000');
  await expect(page.locator('#treffer-status')).not.toContainText('Wird geladen', {
    timeout: 30_000,
  });
  expect(zellen.length).toBeGreaterThan(1);

  // Denselben Ausschnitt erneut wählen lädt nichts nach.
  const vorher = zellen.length;
  await page.selectOption('#radius', '25000');
  await expect(page.locator('#treffer-status')).not.toContainText('Wird geladen', {
    timeout: 30_000,
  });
  expect(zellen.length).toBe(vorher);
  expect(new Set(zellen).size).toBe(zellen.length);
});

test('ein Ortswechsel tauscht die Liste vollständig aus', async ({ page }) => {
  await page.goto(KARTE);

  await page.fill('#ort', 'Bremen');
  await expect(page.locator('#ort-treffer button').first()).toBeVisible({ timeout: 20_000 });
  await page.locator('#ort-treffer button').first().click();
  await expect(page.locator('#treffer-status')).toContainText('um Bremen', { timeout: 20_000 });
  // Verglichen werden ganze Einträge, nicht nur Namen: Ketten wie „Fressnapf“
  // heißen in beiden Städten gleich, sind aber andere Filialen.
  const bremen = await page.locator('#trefferliste li').allInnerTexts();

  await page.fill('#ort', 'Hannover');
  await expect(page.locator('#ort-treffer button').first()).toBeVisible({ timeout: 20_000 });
  await page.locator('#ort-treffer button').first().click();
  await expect(page.locator('#treffer-status')).toContainText('um Hannover', { timeout: 20_000 });
  const hannover = await page.locator('#trefferliste li').allInnerTexts();

  expect(hannover.length).toBeGreaterThan(0);
  // Kein Eintrag der vorherigen Stadt bleibt stehen.
  expect(hannover.filter((eintrag) => bremen.includes(eintrag))).toEqual([]);
});

test('interne Links führen auf echte Seiten, nicht auf 200-Attrappen', async ({ page }) => {
  const gesehen = new Set<string>();
  for (const pfad of ['/de-de/', KARTE, STADT, '/de-de/quellen/']) {
    await page.goto(pfad);
    const links = await page.evaluate(() =>
      [...document.querySelectorAll('a[href]')]
        .map((element) => (element as HTMLAnchorElement).getAttribute('href') ?? '')
        .filter((href) => href.startsWith('/')),
    );
    for (const link of links) gesehen.add(link);
  }
  expect(gesehen.size).toBeGreaterThan(10);

  for (const link of gesehen) {
    const antwort = await page.request.get(link);
    expect(antwort.status(), `Status von ${link}`).toBe(200);
  }
});

test('eine Seite, die es nicht gibt, antwortet mit 404', async ({ page }) => {
  for (const pfad of [
    `${KARTE}wanne-eickel/`,
    '/de-de/gibt-es-nicht/',
    '/data/v1/places/de/cells/gibt-es-nicht.json',
  ]) {
    const antwort = await page.request.get(pfad);
    expect(antwort.status(), `Status von ${pfad}`).toBe(404);
  }
});

test('die ausgelieferten Daten tragen ihre Lizenz mit sich', async ({ page }) => {
  const manifest = await (await page.request.get('/data/v1/manifest.json')).json();
  const zelle = (manifest.chunks as { chunkId: string; path: string }[]).find(
    (chunk) => chunk.chunkId.startsWith('places-de-') && chunk.path.includes('/cells/'),
  );
  expect(zelle).toBeDefined();

  const daten = await (await page.request.get(zelle!.path)).json();
  expect(daten.licenseId).toBe('ODbL-1.0');
  expect(daten.attribution).toContain('OpenStreetMap');
  expect(daten.attributionUrl).toBeTruthy();

  const lizenz = await page.request.get('/data/v1/places/de/LICENSE.txt');
  expect(lizenz.status()).toBe(200);
  expect(await lizenz.text()).toContain('Open Database License');
});

test('Karten- und Stadtseite tragen Titel, eine H1 und ein canonical auf sich selbst', async ({
  page,
}) => {
  const stadt = allowlist.cities[0]!;

  await page.goto(KARTE);
  await expect(page.locator('h1')).toHaveCount(1);
  // Der Titel kommt aus der Navigationsbeschriftung der Route, die H1 aus der Seite.
  await expect(page).toHaveTitle(/Tierärzte in der Nähe/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    new RegExp(`${KARTE}$`),
  );

  await page.goto(STADT);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText(stadt.name);
  await expect(page).toHaveTitle(new RegExp(stadt.name));
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    new RegExp(`${STADT}$`),
  );
});

test('ein Entwicklungsbuild bleibt für Suchmaschinen gesperrt', async ({ page }) => {
  // Dieser Lauf baut im Entwicklungsmodus. Indexierbar wird eine Seite erst
  // durch einen Produktionsbuild mit erfüllten Launch-Gates, nicht durch
  // ihren Inhalt.
  for (const pfad of [KARTE, STADT]) {
    await page.goto(pfad);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex, nofollow/,
    );
  }
});
