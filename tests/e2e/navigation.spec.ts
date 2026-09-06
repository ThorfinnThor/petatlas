// M04-03 — Navigation und Kernseiten.
// Kernaussage: jeder Navigationseintrag führt auf eine echte Seite, und für
// abgeschaltete Funktionen existiert gar keine Seite.
import { expect, test, type Page } from '@playwright/test';

const MARKT = '/de-de/';

async function navigationsLinks(page: Page): Promise<string[]> {
  return page
    .locator('header nav a, footer nav a')
    .evaluateAll((elemente) =>
      elemente.map((element) => (element as HTMLAnchorElement).getAttribute('href') ?? ''),
    );
}

test('Startseite des Marktes lädt', async ({ page }) => {
  const antwort = await page.goto(MARKT);
  expect(antwort?.status()).toBe(200);
  await expect(page.locator('h1')).toHaveText('PetAtlas');
});

test('Die Wurzel leitet auf den aktiven Markt', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/de-de\/$/);
});

test('Jeder Navigationseintrag führt auf eine vorhandene Seite', async ({ page }) => {
  await page.goto(MARKT);
  const links = await navigationsLinks(page);
  expect(links.length).toBeGreaterThan(0);

  for (const href of links) {
    const antwort = await page.goto(href);
    expect(antwort?.status(), `${href} antwortet nicht mit 200`).toBe(200);
    // Keine leere Seite: eine Überschrift muss vorhanden sein.
    await expect(page.locator('h1')).toBeVisible();
  }
});

test('Kein Navigationseintrag kündigt eine abgeschaltete Funktion an', async ({ page }) => {
  await page.goto(MARKT);
  const links = await navigationsLinks(page);
  for (const abgeschaltet of [
    'tierarztkosten',
    'tierarzt-karte',
    'reisecheck',
    'pflege',
    'spielzeug',
    'futter',
  ]) {
    expect(
      links.some((href) => href.includes(abgeschaltet)),
      `${abgeschaltet} ist verlinkt`,
    ).toBe(false);
  }
});

test('Für eine abgeschaltete Funktion existiert keine Seite', async ({ page }) => {
  for (const pfad of ['/de-de/tierarztkosten/', '/de-de/reisecheck/', '/de-de/futter/']) {
    const antwort = await page.goto(pfad);
    expect(antwort?.status(), `${pfad} sollte es nicht geben`).toBe(404);
  }
});

test('Die Startseite verspricht keine kommenden Werkzeuge', async ({ page }) => {
  await page.goto(MARKT);
  const text = (await page.locator('main').innerText()).toLowerCase();
  for (const floskel of ['demnächst', 'coming soon', 'in kürze', 'bald verfügbar']) {
    expect(text, `Startseite enthält "${floskel}"`).not.toContain(floskel);
  }
});

test('Impressum erfindet keine Betreiberangaben', async ({ page }) => {
  await page.goto('/de-de/impressum/');
  await expect(page.locator('h1')).toHaveText('Impressum');
  await expect(page.getByText('Betreiberangaben liegen nicht vor')).toBeVisible();
});

test('Quellen- und Datenstandseite benennen den leeren Stand', async ({ page }) => {
  await page.goto('/de-de/quellen/');
  // Seit M05-03 kommt die Liste aus der Registry; der leere Stand heißt jetzt
  // „noch keine Quelle freigegeben“.
  await expect(page.getByText('Noch keine Quelle freigegeben')).toBeVisible();

  await page.goto('/de-de/datenstand/');
  await expect(page.getByText('Noch kein Datensatz veröffentlicht')).toBeVisible();
  await expect(page.getByText('Dieser Build zeigt Testdaten')).toBeVisible();
});

test('Jede Seite hat einen eindeutigen Titel und ein canonical', async ({ page }) => {
  const titel = new Set<string>();
  for (const pfad of [
    '/de-de/',
    '/de-de/quellen/',
    '/de-de/datenstand/',
    '/de-de/impressum/',
    '/de-de/datenschutz/',
  ]) {
    await page.goto(pfad);
    const seitentitel = await page.title();
    expect(titel.has(seitentitel), `Titel "${seitentitel}" ist nicht eindeutig`).toBe(false);
    titel.add(seitentitel);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /https?:\/\//);
  }
});
