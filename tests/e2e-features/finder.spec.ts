// M14-04 — Der Finder erklärt, warum etwas erscheint und was nicht geprüft ist.
import { expect, test } from '@playwright/test';

const SPIELZEUG = '/de-de/spielzeug/';
const PFLEGE = '/de-de/pflege/';

test('nennt die Produktdaten ausdrücklich synthetisch', async ({ page }) => {
  await page.goto(SPIELZEUG);
  await expect(page.getByText('Synthetische Produktdaten')).toBeVisible();
});

test('zeigt zu jedem Treffer eine Begründung und die offenen Punkte', async ({ page }) => {
  await page.goto(SPIELZEUG);
  await page.fill('#finder-gewicht', '20');
  await page.check('input[value="apportieren"]');
  await page.click('#finder-suchen');

  const treffer = page.locator('.finder__liste > li');
  await expect(treffer.first()).toBeVisible();
  // Die Reihenfolge der Begründungen folgt der Prüfreihenfolge, nicht der
  // Eingabe: geprüft wird deshalb die ganze Liste.
  await expect(treffer.first().locator('.finder__gruende')).toContainText('apportiert gern');

  // Beim Ball sind alle vier Merkmale der Kategorie belegt — dann steht dort
  // auch keine Zeile über offene Punkte. Beim Kauring ist es umgekehrt.
  await expect(page.locator('[data-produkt="synthetisch:ball-70"] .finder__offen')).toHaveCount(0);
  await expect(page.locator('[data-produkt="synthetisch:kauring"] .finder__offen')).toContainText(
    'Nicht geprüft: sizeRange, hardnessLevel',
  );
});

test('sagt, dass die Reihenfolge keine Bewertung ist', async ({ page }) => {
  await page.goto(SPIELZEUG);
  await page.click('#finder-suchen');
  await expect(page.locator('.finder__kopf')).toContainText('keine Bewertung des Produkts');
});

test('schließt bei zu kleinem Gewicht nach Herstellerangabe aus', async ({ page }) => {
  await page.goto(SPIELZEUG);
  await page.fill('#finder-gewicht', '5');
  await page.click('#finder-suchen');
  // Der synthetische Ball nennt „ab 15 kg“; bei 5 kg bleibt er weg.
  await expect(page.locator('[data-produkt="synthetisch:ball-70"]')).toHaveCount(0);

  await page.fill('#finder-gewicht', '20');
  await page.click('#finder-suchen');
  await expect(page.locator('[data-produkt="synthetisch:ball-70"]')).toHaveCount(1);
});

test('behauptet bei unbekanntem Gewicht keine Passung', async ({ page }) => {
  await page.goto(SPIELZEUG);
  await page.fill('#finder-gewicht', '');
  await page.click('#finder-suchen');
  const karte = page.locator('[data-produkt="synthetisch:ball-70"]');
  await expect(karte).toHaveAttribute('data-punkte', '0');
  await expect(karte.locator('.finder__neutral')).toContainText('nur nicht ausgeschlossen');
});

test('vergibt keinen Sicherheits- oder Haltbarkeitsscore', async ({ page }) => {
  await page.goto(SPIELZEUG);
  await page.click('#finder-suchen');
  const text = (await page.locator('main').innerText()).toLowerCase();
  for (const wort of ['sicherheitsscore', 'haltbarkeitsscore', 'unzerstörbar', 'testsieger']) {
    expect(text.includes(wort), wort).toBe(false);
  }
});

test('nennt auf der Pflegeseite Kategorien und die Ausschlüsse', async ({ page }) => {
  await page.goto(PFLEGE);
  await expect(page.locator('[data-kategorie]')).toHaveCount(5);
  await expect(page.locator('[data-ausschluss]')).toHaveCount(5);
  await expect(page.getByText('Kein Gesundheitsbereich')).toBeVisible();
});

test('führt jede Pflegekategorie zu einer eigenen Seite', async ({ page }) => {
  await page.goto(PFLEGE);
  const links = page.locator('.kategorien a');
  await expect(links).toHaveCount(5);

  await page.goto(`${PFLEGE}dental-care/`);
  await expect(page.locator('h1')).toHaveText('Zahnpflegezubehör');
  await expect(page.locator('[data-merkmal]').first()).toBeVisible();
  await expect(page.locator('[data-testid="keine-produkte"]')).toContainText(
    'Sorgfalt vortäuschen',
  );
});

test('gibt es keine Seite für eine erfundene Kategorie', async ({ page }) => {
  const antwort = await page.request.get(`${PFLEGE}wundermittel/`);
  expect(antwort.status()).toBe(404);
});
