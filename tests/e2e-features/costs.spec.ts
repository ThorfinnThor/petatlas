// M08-04 — Der Rechner im Browser.
//
// Die erwarteten Beträge sind von Hand nachgerechnet:
// Position 1 der GOT kostet 11,26 € = 1126 Cent.
//   1126 × Faktor 2 = 2252 → × Menge 3 = 6756 Cent netto
//   6756 × 19 % = 1283,64 → 1284 Cent  ⇒ 8040 Cent brutto = 80,40 €
//   im Notdienst zusätzlich 5000 Cent ⇒ 11756 netto, 2234 USt, 13990 brutto
import { expect, test, type Page } from '@playwright/test';

const RECHNER = '/de-de/tierarztkosten/';

async function katalogGeladen(page: Page): Promise<void> {
  await expect(page.locator('#suche-hinweis')).toContainText('Positionen geladen', {
    timeout: 20_000,
  });
}

async function positionWaehlen(page: Page, begriff: string, menge: string, faktor: string) {
  await page.fill('#suche', begriff);
  await expect(page.locator('#treffer button').first()).toBeVisible();
  await page.fill('#menge', menge);
  await page.fill('#faktor', faktor);
  await page.locator('#treffer button').first().click();
  await expect(page.locator('#ergebnis table')).toBeVisible();
}

test('lädt den vollständigen Katalog aus der statischen Datei', async ({ page }) => {
  const fremde: string[] = [];
  page.on('request', (anfrage) => {
    if (new URL(anfrage.url()).hostname !== 'localhost') fremde.push(anfrage.url());
  });

  await page.goto(RECHNER);
  await katalogGeladen(page);
  await expect(page.locator('#suche-hinweis')).toContainText('1006');
  // Kein Besucherzugriff auf gesetze-im-internet.de.
  expect(fremde).toEqual([]);
});

test('rechnet eine Position nachvollziehbar', async ({ page }) => {
  await page.goto(RECHNER);
  await katalogGeladen(page);
  await positionWaehlen(page, 'Beratung im einzelnen', '3', '2');

  const zeile = page.locator('#ergebnis tbody tr').first();
  await expect(zeile).toContainText('11,26');
  await expect(zeile).toContainText('2,00');
  await expect(zeile).toContainText('3');
  await expect(zeile).toContainText('67,56');
  await expect(page.getByTestId('brutto')).toHaveText('80,40 €');
});

test('nennt zu jeder Position die Fundstelle in der Verordnung', async ({ page }) => {
  await page.goto(RECHNER);
  await katalogGeladen(page);
  await positionWaehlen(page, 'Beratung im einzelnen', '1', '1');
  await expect(page.locator('#ergebnis .fundstelle').first()).toContainText('lfd. Nr. 1');
  await expect(page.locator('#ergebnis .fundstelle').first()).toContainText('Teil A');
});

test('weist die Notdienstgebühr getrennt aus und rechnet sie einmal', async ({ page }) => {
  await page.goto(RECHNER);
  await katalogGeladen(page);
  await positionWaehlen(page, 'Beratung im einzelnen', '3', '2');
  await page.check('input[value="emergency"]');

  await expect(page.locator('#ergebnis tbody')).toContainText('Notdienstgebühr');
  await expect(page.locator('#ergebnis tbody')).toContainText('50,00');
  await expect(page.getByTestId('brutto')).toHaveText('139,90 €');
});

test('meldet einen unzulässigen Faktor, statt zu rechnen', async ({ page }) => {
  await page.goto(RECHNER);
  await katalogGeladen(page);
  await positionWaehlen(page, 'Beratung im einzelnen', '1', '1');
  // Faktor 1 ist im Notdienst unzulässig; die Auswahl bleibt bestehen.
  await page.check('input[value="emergency"]');
  await expect(page.locator('#rechner-status')).toContainText('außerhalb des zulässigen Bereichs');
  await expect(page.locator('#ergebnis table')).toHaveCount(0);
});

test('nimmt dieselbe Position nicht zweimal auf', async ({ page }) => {
  await page.goto(RECHNER);
  await katalogGeladen(page);
  await positionWaehlen(page, 'Beratung im einzelnen', '1', '1');
  await page.locator('#treffer button').first().click();
  await expect(page.locator('#suche-hinweis')).toContainText('bereits ausgewählt');
  await expect(page.locator('#ergebnis tbody tr')).toHaveCount(1);
});

test('verlangt eine sinnvolle Suchlänge und meldet leere Treffer', async ({ page }) => {
  await page.goto(RECHNER);
  await katalogGeladen(page);
  await page.fill('#suche', 'ab');
  await expect(page.locator('#suche-hinweis')).toContainText('mindestens drei Zeichen');
  await page.fill('#suche', 'Zebrastreifenkatalog');
  await expect(page.locator('#suche-hinweis')).toContainText('Keine Position gefunden');
});

test('startet ohne Auswahl mit einem klaren Hinweis', async ({ page }) => {
  await page.goto(RECHNER);
  await expect(page.locator('#rechner-status')).toContainText('Noch keine Position ausgewählt');
  await expect(page.locator('#ergebnis table')).toHaveCount(0);
});

test('nennt Quelle, Fassung und was nicht enthalten ist', async ({ page }) => {
  await page.goto(RECHNER);
  await expect(page.getByText('GOT 2022').first()).toBeVisible();
  await expect(page.getByText('§ 5 Abs. 1 UrhG').first()).toBeVisible();
  await expect(page.getByText('Was der Rechner nicht kann')).toBeVisible();
  await expect(page.getByText('Arzneimittel und Verbrauchsmaterial')).toBeVisible();
  await expect(page.getByText('kein amtlicher Rechner')).toBeVisible();
});

test('ist ohne Maus bedienbar', async ({ page }) => {
  await page.goto(RECHNER);
  await katalogGeladen(page);
  await page.locator('#suche').focus();
  await page.keyboard.type('Beratung im einzelnen');
  await expect(page.locator('#treffer button').first()).toBeVisible();
  await page.locator('#treffer button').first().focus();
  await expect(page.locator('#treffer button').first()).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#ergebnis table')).toBeVisible();
});
