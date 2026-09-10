import { expect, test } from '@playwright/test';
import editorial from '../../content-data/products/editorial.json' with { type: 'json' };

const MAP = '/de-de/tierarzt-karte/';
const FOOD = '/de-de/futter/royal-canin-mini-adult-2kg/';
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR4nGNgAAIAAAUAAXpeqz8AAAAASUVORK5CYII=',
  'base64',
);

for (const width of [390, 1280]) {
  test.describe(`user-flow acceptance at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('edits a bill, recovers from invalid context and removes its last line', async ({
      page,
    }) => {
      await page.goto('/de-de/tierarztkosten/');
      await page.fill('#suche', 'Allgemeine Untersuchung');
      await page
        .getByRole('button', {
          name: /Allgemeine Untersuchung mit Beratung, Hund, Katze, Frettchen/,
        })
        .click();
      await expect(page.getByTestId('brutto')).toContainText('28,11');
      await page.fill('#menge', '2');
      await page.fill('#faktor', '1,5');
      await page.click('#position-uebernehmen');
      await expect(page.getByTestId('brutto')).toContainText('84,32');
      await expect(page).toHaveURL(/\/de-de\/tierarztkosten\/$/);
      await page.check('input[name="kontext"][value="emergency"]');
      await expect(page.locator('#ergebnis table')).toHaveCount(0);
      await expect(page.locator('#drucken')).toBeDisabled();
      await expect(page.locator('#position-bearbeiten')).toBeVisible();
      await page.fill('#faktor', '2');
      await page.click('#position-uebernehmen');
      await expect(page.getByTestId('brutto')).toContainText('171,93');
      await page.check('input[name="kontext"][value="regular"]');
      await expect(page.getByTestId('brutto')).toContainText('112,43');
      await page.fill('#menge', '0');
      await page.click('#position-uebernehmen');
      await expect(page.locator('#menge')).toHaveAttribute('aria-invalid', 'true');
      await expect(page.locator('#drucken')).toBeDisabled();
      await page.fill('#menge', '1');
      await page.click('#position-uebernehmen');
      await expect(page.getByTestId('brutto')).toContainText('56,22');
      await page.click('#auswahl-entfernen');
      await expect(page.locator('#rechner-status')).toContainText('Noch keine Position');
      await expect(page.locator('#drucken')).toBeDisabled();
    });

    test('filters the initial map list without selecting a city first', async ({ page }) => {
      await page.goto(MAP);
      await page.getByRole('checkbox', { name: 'Tierarztpraxis (4.928)', exact: true }).check();
      await expect(page.locator('#treffer-status')).toContainText('km um Berlin');
      const categories = await page.locator('#trefferliste .meta').allTextContents();
      expect(categories.length).toBeGreaterThan(0);
      expect(categories.every((text) => text.includes('Tierarztpraxis'))).toBe(true);
      await page.selectOption('#radius', '10000');
      await expect(page.locator('#treffer-status')).toContainText('10 km um Berlin');
    });

    test('saves a Hamburg place, opens that place and removes it', async ({ page }) => {
      await page.goto(MAP);
      await page.fill('#ort', 'Hamburg');
      await page.getByRole('button', { name: 'Hamburg', exact: true }).click();
      await expect(page.locator('#treffer-status')).toContainText('km um Hamburg');
      const name = await page.locator('#trefferliste h3').first().innerText();
      const save = page.locator('#trefferliste button[data-merken="place"]').first();
      await save.click();
      await expect(save).toHaveAttribute('aria-pressed', 'true');
      await page.goto('/de-de/merkliste/');
      await expect(page.locator('.merk__liste h3')).toHaveText(name);
      await page.getByRole('link', { name: 'Ansehen', exact: true }).click();
      await expect(page).toHaveURL(/place=.*lat=.*lon=/);
      await expect(page.locator('#ort')).toHaveValue(name);
      await expect(page.locator('#treffer-status')).toContainText(`km um ${name}`);
      await expect(page.locator('#trefferliste h3').first()).toHaveText(name);
      await page.goto('/de-de/merkliste/');
      await page.locator('button[data-entfernen]').click();
      await expect(page.locator('.merk__kopf')).toHaveAttribute('data-leer', 'true');
    });

    test('validates toy weight and displays readable real product categories', async ({ page }) => {
      await page.goto('/de-de/spielzeug/');
      await page.fill('#finder-gewicht', '-1');
      await page.click('#finder-suchen');
      await expect(page.locator('#finder-ergebnis')).toContainText('positives Gewicht');
      await expect(page.locator('#finder-gewicht')).toHaveAttribute('aria-invalid', 'true');
      await page.fill('#finder-gewicht', '12,5');
      await page.click('#finder-suchen');
      await expect(page.locator('.finder__liste h3').first()).toBeVisible();
      await expect(page.locator('.finder__kategorie').first()).not.toContainText('toys-');
      await expect(page.locator('#finder-gewicht')).not.toHaveAttribute('aria-invalid', 'true');
      await page.selectOption('#finder-tierart', 'cat');
      await page.click('#finder-suchen');
      const cats = editorial.products.filter(
        (p) => p.species === 'cat' && p.category === 'Spielzeug',
      );
      await expect(page.locator('.finder__kopf')).toContainText(`${cats.length} Produkt(e)`);
      await expect(page.locator('.finder__liste > li')).toHaveCount(cats.length);
      await expect(page.locator('#finder-ergebnis')).toContainText('Senses Play Circuit');
      await expect(page.locator('#finder-ergebnis')).not.toContainText('KONG Classic');
    });
  });
}

test('a failed place download preserves results and can be retried', async ({ page }) => {
  let fail = true;
  await page.route('**/data/v1/places/de/cells/**', (route) =>
    fail ? route.fulfill({ status: 503, body: 'unavailable' }) : route.continue(),
  );
  await page.goto(MAP);
  const before = await page.locator('#trefferliste h3').allTextContents();
  await page.fill('#ort', 'Hamburg');
  await page.getByRole('button', { name: 'Hamburg', exact: true }).click();
  await expect(page.locator('#orts-ladefehler')).toContainText('konnten nicht geladen');
  expect(await page.locator('#trefferliste h3').allTextContents()).toEqual(before);
  fail = false;
  await page.click('#ortsdaten-erneut');
  await expect(page.locator('#treffer-status')).toContainText('km um Hamburg');
  await expect(page.locator('#orts-ladefehler')).toBeHidden();
});

test('a failed city-name download can be retried with Enter', async ({ page }) => {
  let fail = true;
  await page.route('**/data/v1/places/de/names/**', (route) =>
    fail ? route.fulfill({ status: 503, body: 'unavailable' }) : route.continue(),
  );
  await page.goto(MAP);
  await page.fill('#ort', 'Hamburg');
  await expect(page.locator('#ort-hinweis')).toContainText('Ortsnamen konnten nicht geladen');
  fail = false;
  await page.locator('#ort').press('Enter');
  await page.getByRole('button', { name: 'Hamburg', exact: true }).click();
  await expect(page.locator('#treffer-status')).toContainText('km um Hamburg');
});

test('failed map tiles can be retried without losing the list or duplicating the map', async ({
  page,
}) => {
  let fail = true;
  await page.route('https://tile.openstreetmap.org/**', (route) =>
    route.fulfill(
      fail ? { status: 503, body: 'unavailable' } : { contentType: 'image/png', body: PNG },
    ),
  );
  await page.goto(MAP);
  await page.click('#karte-anzeigen');
  await expect(page.locator('#karte-status')).toContainText('keine Kacheln');
  const before = await page.locator('#trefferliste h3').allTextContents();
  fail = false;
  await page.getByRole('button', { name: 'Karte erneut laden', exact: true }).click();
  await expect(page.locator('#karte-status')).toHaveText(/\d+ Orte auf der Karte\./);
  await expect(page.locator('#karte-anzeigen')).toBeDisabled();
  await expect(page.locator('#karte .leaflet-map-pane')).toHaveCount(1);
  await expect
    .poll(() =>
      page
        .locator('#karte img.leaflet-tile')
        .evaluateAll(
          (images) => images.filter((image) => (image as HTMLImageElement).naturalWidth > 0).length,
        ),
    )
    .toBeGreaterThan(0);
  expect(await page.locator('#trefferliste h3').allTextContents()).toEqual(before);
});

test('a failed favorite write never claims success', async ({ page }) => {
  await page.addInitScript(() => {
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === 'petatlas.favorites.v1') throw new DOMException('Full', 'QuotaExceededError');
      setItem.call(this, key, value);
    };
  });
  await page.goto(FOOD);
  const save = page.locator('button[data-merken="food"]');
  await save.click();
  await expect(page.getByRole('alert')).toContainText('nicht gespeichert');
  await expect(save).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/de-de/merkliste/');
  await expect(page.locator('.merk__kopf')).toHaveAttribute('data-leer', 'true');
});

test('global search opens a real indexed result and works again after navigation', async ({
  page,
}) => {
  await page.goto('/de-de/');
  await page.fill('#suche-feld', 'Hund');
  await expect(page.locator('#suche-treffer a').first()).toBeVisible();
  const destination = await page.locator('#suche-treffer a').first().getAttribute('href');
  await page.locator('#suche-treffer a').first().click();
  expect(new URL(page.url()).pathname).toBe(destination);
  await page.goBack();
  await page.fill('#suche-feld', 'Reise');
  await expect(page.locator('#suche-status')).toContainText('Treffer für „Reise“');
});

test('failed search fragments show an error and recover after reloading', async ({ page }) => {
  let fail = true;
  await page.route('**/pagefind/fragment/**', (route) =>
    fail ? route.fulfill({ status: 503, body: 'unavailable' }) : route.continue(),
  );
  await page.goto('/de-de/');
  await page.fill('#suche-feld', 'Reise');
  await expect(page.locator('#suche-status')).toContainText('Suchergebnisse konnten nicht geladen');
  await expect(page.locator('#suche-treffer a')).toHaveCount(0);
  fail = false;
  await page.reload();
  await page.fill('#suche-feld', 'Reise');
  await expect(page.locator('#suche-treffer a').first()).toBeVisible();
});
