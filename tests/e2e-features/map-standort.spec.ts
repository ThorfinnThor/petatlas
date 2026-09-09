// M11-03 — Standort und dichte Ausschnitte im echten Browser.
import { expect, test } from '@playwright/test';

const KARTE = '/de-de/tierarzt-karte/';

test('fragt den Standort beim Laden der Seite nicht ab', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { __standortAufrufe: number }).__standortAufrufe = 0;
    const echt = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
    Object.defineProperty(navigator.geolocation, 'getCurrentPosition', {
      value: (...argumente: unknown[]) => {
        (window as unknown as { __standortAufrufe: number }).__standortAufrufe += 1;
        return (echt as (...a: unknown[]) => void)(...argumente);
      },
    });
  });

  await page.goto(KARTE);
  await expect(page.locator('#trefferliste li').first()).toBeVisible();
  await page.waitForTimeout(1500);

  const aufrufe = await page.evaluate(
    () => (window as unknown as { __standortAufrufe: number }).__standortAufrufe,
  );
  expect(aufrufe).toBe(0);
});

test('sagt vor der Abfrage, dass nichts gespeichert oder übertragen wird', async ({ page }) => {
  await page.goto(KARTE);
  await expect(page.getByRole('button', { name: 'Meinen Standort verwenden' })).toBeVisible();
  await expect(page.getByText(/nicht gespeichert und nicht übertragen/)).toBeVisible();
});

test('verwendet einen freigegebenen Standort für die Suche', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 53.0758, longitude: 8.8072 });

  await page.goto(KARTE);
  await page.click('#standort');
  await expect(page.locator('#standort-status')).toContainText('Ihr ungefährer Standort', {
    timeout: 20_000,
  });
  await expect(page.locator('#treffer-status')).toContainText('Ihr ungefährer Standort', {
    timeout: 20_000,
  });
  await expect(page.locator('#trefferliste li').first()).toBeVisible();
});

test('bleibt nach einer Ablehnung bedienbar', async ({ page, context }) => {
  await context.clearPermissions();
  await page.goto(KARTE);
  await page.evaluate(() => {
    Object.defineProperty(navigator.geolocation, 'getCurrentPosition', {
      value: (_erfolg: unknown, fehler: (f: unknown) => void) =>
        fehler({ code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }),
    });
  });

  await page.click('#standort');
  await expect(page.locator('#standort-status')).toContainText('nicht freigegeben');
  await expect(page.locator('#standort-status')).toContainText('geben Sie einen Ort ein');
  // Die Liste bleibt vollständig, und der Knopf ist wieder benutzbar.
  await expect(page.locator('#trefferliste li').first()).toBeVisible();
  await expect(page.locator('#standort')).toBeEnabled();
});

test('meldet eine Zeitüberschreitung als eigenen Fall', async ({ page }) => {
  await page.goto(KARTE);
  await page.evaluate(() => {
    Object.defineProperty(navigator.geolocation, 'getCurrentPosition', {
      value: (_erfolg: unknown, fehler: (f: unknown) => void) =>
        fehler({ code: 3, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 }),
    });
  });

  await page.click('#standort');
  await expect(page.locator('#standort-status')).toContainText('zu lange gedauert');
});

test('speichert den Standort nirgends und sendet ihn nirgendwohin', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 53.0758, longitude: 8.8072 });

  const verdaechtig: string[] = [];
  page.on('request', (anfrage) => {
    const url = anfrage.url();
    if (url.includes('53.07') || url.includes('8.80')) verdaechtig.push(url);
    if (anfrage.method() !== 'GET') verdaechtig.push(`${anfrage.method()} ${url}`);
  });

  await page.goto(KARTE);
  await page.click('#standort');
  await expect(page.locator('#standort-status')).toContainText('Ihr ungefährer Standort', {
    timeout: 20_000,
  });

  // Keine Koordinate in einer Adresse, kein Schreibzugriff nach außen.
  expect(verdaechtig).toEqual([]);

  const gespeichert = await page.evaluate(() => ({
    local: JSON.stringify(window.localStorage),
    session: JSON.stringify(window.sessionStorage),
    cookies: document.cookie,
    url: window.location.href,
  }));
  expect(gespeichert.local).not.toMatch(/53\.07|8\.80/);
  expect(gespeichert.session).not.toMatch(/53\.07|8\.80/);
  expect(gespeichert.cookies).toBe('');
  expect(gespeichert.url).not.toMatch(/53\.07|8\.80/);
});

test('bleibt bei einem dichten Ausschnitt bedienbar', async ({ page }) => {
  await page.goto(KARTE);
  await page.fill('#ort', 'Berlin');
  await expect(page.locator('#ort-treffer button').first()).toBeVisible({ timeout: 20_000 });
  await page.locator('#ort-treffer button').first().click();
  await page.selectOption('#radius', '50000');
  await expect(page.locator('#treffer-status')).toContainText('um Berlin', { timeout: 20_000 });

  const toggle = page.locator('[data-map-view=map]');
  if (await toggle.isVisible()) await toggle.click();
  await page.click('#karte-anzeigen');
  await expect(page.locator('#karte.leaflet-container')).toBeVisible({ timeout: 30_000 });

  // Bei vielen Treffern wird begrenzt gezeichnet und das auch gesagt.
  const marker = await page.locator('#karte path.leaflet-interactive').count();
  expect(marker).toBeLessThanOrEqual(300);
  await expect(page.locator('#karte-status')).toContainText(
    /Orten auf der Karte|Orte auf der Karte/,
  );
});
