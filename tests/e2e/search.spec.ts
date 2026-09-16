// M04-04 — Statische Suche: kein Backend, nur freigegebener Inhalt.
import { expect, test } from '@playwright/test';

test.describe('Suche', () => {
  test('findet eine echte Seite ohne Serveranfrage an Dritte', async ({ page }) => {
    const fremdeAnfragen: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (url.hostname !== 'localhost') fremdeAnfragen.push(request.url());
    });

    await page.goto('/de-de/');
    await page.getByLabel('Suchbegriff').fill('Impressum');

    await expect(page.getByRole('status')).toContainText('Treffer', { timeout: 10_000 });
    const treffer = page.locator('#suche-treffer a');
    await expect(treffer.first()).toBeVisible();

    expect(fremdeAnfragen).toEqual([]);
  });

  test('führt auf eine erreichbare Seite', async ({ page }) => {
    await page.goto('/de-de/');
    await page.getByLabel('Suchbegriff').fill('Datenstand');
    await expect(page.locator('#suche-treffer a').first()).toBeVisible({ timeout: 10_000 });

    const ziel = await page.locator('#suche-treffer a').first().getAttribute('href');
    const antwort = await page.goto(ziel ?? '/');
    expect(antwort?.status()).toBe(200);
  });

  // Pagefind arbeitet mit Wortstämmen und Teiltreffern. Ein Suchbegriff aus
  // einer ausgeschlossenen Seite kann deshalb trotzdem irgendeinen Treffer
  // erzeugen. Entscheidend ist nicht „keine Treffer“, sondern dass kein
  // Ergebnis auf eine ausgeschlossene Seite zeigt.
  for (const begriff of ['Formularprobe', 'Designprobe', 'entwicklung']) {
    test(`findet mit "${begriff}" keine technische Entwicklungsseite`, async ({ page }) => {
      await page.goto('/de-de/');
      await page.getByLabel('Suchbegriff').fill(begriff);
      await expect(page.getByRole('status')).not.toBeEmpty({ timeout: 10_000 });

      const ziele = await page
        .locator('#suche-treffer a')
        .evaluateAll((elemente) =>
          elemente.map((element) => (element as HTMLAnchorElement).getAttribute('href') ?? ''),
        );
      expect(ziele.some((ziel) => ziel.includes('/entwicklung/'))).toBe(false);
    });
  }

  test('nimmt gar keine Entwicklungsseite in den Index auf', async ({ page }) => {
    await page.goto('/de-de/');
    const alleZiele = await page.evaluate(async () => {
      const api = (await import(
        /* webpackIgnore: true */ `${window.location.origin}/pagefind/pagefind.js`
      )) as { search(q: string): Promise<{ results: { data(): Promise<{ url: string }> }[] }> };
      const treffer = await api.search('Seite');
      const daten = await Promise.all(treffer.results.map((r) => r.data()));
      return daten.map((d) => d.url);
    });
    expect(alleZiele.some((ziel) => ziel.includes('/entwicklung/'))).toBe(false);
    expect(alleZiele.some((ziel) => ziel.includes('404'))).toBe(false);
  });

  test('verlangt eine sinnvolle Mindestlänge', async ({ page }) => {
    await page.goto('/de-de/');
    await page.getByLabel('Suchbegriff').fill('a');
    await expect(page.getByRole('status')).toContainText('mindestens zwei Zeichen');
  });

  test('meldet ein leeres Ergebnis, statt Treffer zu erfinden', async ({ page }) => {
    await page.goto('/de-de/');
    await page.getByLabel('Suchbegriff').fill('Zebrastreifenkatalog');
    await expect(page.getByRole('status')).toContainText('Keine Treffer', { timeout: 10_000 });
  });

  test('ist per Tastatur bedienbar', async ({ page }) => {
    await page.goto('/de-de/');
    const feld = page.getByLabel('Suchbegriff');
    await feld.focus();
    await expect(feld).toBeFocused();
    await page.keyboard.type('Quellen');
    await page.keyboard.press('Enter');
    await expect(page.locator('#suche-treffer a').first()).toBeVisible({ timeout: 10_000 });
  });
});
