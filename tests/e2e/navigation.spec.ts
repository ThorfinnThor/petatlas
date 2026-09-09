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
  // Die H1 nennt seit dem Designdurchgang das Thema; die Marke steht in
  // Kopfbereich und Seitentitel.
  await expect(page.locator('h1')).toHaveText('Besser entscheiden für dein Tier');
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

test('Quellen- und Datenstandseite benennen den tatsächlichen Stand', async ({ page }) => {
  // Seit M05-03 kommt die Quellenliste aus der Registry und ist nicht mehr
  // leer; geprüft wird deshalb der ausgewiesene Rechtestand.
  await page.goto('/de-de/quellen/');
  await expect(page.getByText('Rechte geprüft und bestätigt').first()).toBeVisible();

  // Seit M17-04 steht dort eine gemessene Tabelle statt eines Platzhalters.
  await page.goto('/de-de/datenstand/');
  await expect(page.locator('[data-testid="gesamtstand"]')).toBeVisible();
  await expect(page.locator('[data-testid^="datensatz-"]').first()).toBeVisible();
  await expect(page.getByText('Dieser Build ist eine Vorschau')).toBeVisible();
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

// M18-05 — Die Pflicht- und Erklärseiten sind erreichbar und erfinden nichts.
test('Methodikseite nennt Herkunft, Stand und Grenzen', async ({ page }) => {
  await page.goto('/de-de/methodik/');
  await expect(page.locator('h1')).toHaveText('Methodik');
  await expect(page.getByText('Keine erfundenen Zahlen')).toBeVisible();
  await expect(page.getByText('Unbekannt heißt unbekannt')).toBeVisible();
  await expect(page.getByRole('link', { name: '/data/v1/health.json' })).toBeVisible();
});

test('Barrierefreiheitsseite gibt sich nicht als Erklärung aus', async ({ page }) => {
  await page.goto('/de-de/barrierefreiheit/');
  await expect(page.locator('h1')).toHaveText('Barrierefreiheit');
  await expect(page.getByText('noch keine Erklärung zur Barrierefreiheit')).toBeVisible();
  // Ohne Kontaktadresse steht dort keine erfundene — an beiden Stellen.
  await expect(page.getByText('keine erfunden')).toHaveCount(2);
  await expect(page.getByText('Ein Rückmeldeweg wird eingerichtet')).toBeVisible();
});

test('Der Fußbereich führt zu allen Pflichtseiten', async ({ page }) => {
  await page.goto('/de-de/');
  const fuss = page.locator('footer nav');
  for (const name of [
    'Quellen',
    'Datenstand',
    'Methodik',
    'Impressum',
    'Datenschutz',
    'Barrierefreiheit',
  ]) {
    await expect(fuss.getByRole('link', { name })).toBeVisible();
  }
});
