// M12-01 — Die Seite sagt zuerst, was sie nicht prüft.
import { readFileSync } from 'node:fs';

import { expect, test } from '@playwright/test';

const REISE = '/de-de/reisecheck/';

const umfang = JSON.parse(readFileSync('content-data/travel/scope.json', 'utf8')) as {
  destinations: string[];
  unsupported: { caseId: string; label: string }[];
};

test('nennt die vier Zielstaaten und keine weltweite Abdeckung', async ({ page }) => {
  await page.goto(REISE);
  await expect(page.locator('h1')).toHaveText('Reisecheck');
  await expect(page.getByText('Keine weltweite Auskunft')).toBeVisible();
  for (const land of ['Österreich', 'Frankreich', 'Italien', 'Niederlande']) {
    await expect(page.getByText(land, { exact: false }).first(), land).toBeVisible();
  }
});

test('zeigt jeden nicht geprüften Fall mit Begründung', async ({ page }) => {
  await page.goto(REISE);
  for (const fall of umfang.unsupported) {
    const eintrag = page.locator(`[data-testid="nicht-geprueft-${fall.caseId}"]`);
    await expect(eintrag, fall.caseId).toBeVisible();
    const text = (await eintrag.innerText()).trim();
    expect(text.length, fall.caseId).toBeGreaterThan(60);
  }
});

test('unterscheidet „nicht geprüft“ von „nicht erlaubt“', async ({ page }) => {
  await page.goto(REISE);
  await expect(page.getByText(/nicht erlaubt und nicht verboten|es ist ungeprüft/)).toBeVisible();
});

test('rechnet nur mit belegten Regeln und sagt, dass sie ungeprüft sind', async ({ page }) => {
  await page.goto(REISE);
  // Seit M12-04 gibt es ein Formular — aber nur mit Regeln, die eine
  // amtliche Fundstelle haben und ausdrücklich als ungeprüft gelten.
  await expect(page.getByText('Fachlich noch nicht geprüft')).toBeVisible();
  await expect(page.locator('#reiseform')).toBeVisible();
  await expect(page.locator('.ergebnis__punkte')).toHaveCount(0);
});

test('bleibt ohne JavaScript vollständig lesbar', async ({ browser }) => {
  const kontext = await browser.newContext({ javaScriptEnabled: false });
  const seite = await kontext.newPage();
  await seite.goto(REISE);
  await expect(seite.locator('.ausnahmen li')).toHaveCount(umfang.unsupported.length);
  await kontext.close();
});

test('rechnet lokal und gibt kein grünes Gesamtergebnis', async ({ page }) => {
  const fremdeAnfragen: string[] = [];
  page.on('request', (anfrage) => {
    if (!anfrage.url().startsWith('http://localhost')) fremdeAnfragen.push(anfrage.url());
  });

  await page.goto(REISE);
  await page.selectOption('#tierart', 'dog');
  await page.selectOption('#ziel', 'AT');
  await page.fill('#reisedatum', '2026-10-01');
  await page.fill('#geburtsdatum', '2020-01-01');
  await page.selectOption('#chip', 'ja');
  await page.fill('#chipdatum', '2020-03-01');
  await page.selectOption('#impfung', 'ja');
  await page.fill('#impfdatum', '2026-01-01');
  await page.selectOption('#ausweis', 'ja');
  await page.selectOption('#begleitung', 'ja');
  await page.click('#pruefen');

  await expect(page.locator('.ergebnis__punkte > li')).toHaveCount(5);
  // Alle Punkte erfüllt — und trotzdem kein grünes Gesamtergebnis.
  await expect(page.locator('.ergebnis__kopf')).toHaveAttribute('data-zustand', 'unknown');
  await expect(page.locator('#reiseergebnis')).toContainText('fachlich noch nicht geprüft');
  expect(fremdeAnfragen).toEqual([]);
});

test('eine offene Angabe bleibt offen', async ({ page }) => {
  await page.goto(REISE);
  await page.fill('#reisedatum', '2026-10-01');
  await page.fill('#geburtsdatum', '2020-01-01');
  await page.selectOption('#chip', 'ja');
  await page.click('#pruefen');

  const offen = page.locator('.ergebnis__punkte > li[data-zustand="unknown"]');
  await expect(offen.first()).toBeVisible();
  await expect(page.locator('.ergebnis__kopf')).toHaveAttribute('data-zustand', 'unknown');
});

test('ein klarer Mangel wird als Mangel benannt', async ({ page }) => {
  await page.goto(REISE);
  await page.fill('#reisedatum', '2026-10-01');
  await page.fill('#geburtsdatum', '2020-01-01');
  await page.selectOption('#chip', 'nein');
  await page.click('#pruefen');
  await expect(page.locator('.ergebnis__kopf')).toHaveAttribute('data-zustand', 'not_fulfilled');
});

test('eine nicht unterstützte Route bekommt keine Checkliste', async ({ page }) => {
  await page.goto(REISE);
  await page.selectOption('#ziel', 'XX');
  await page.fill('#reisedatum', '2026-10-01');
  await page.fill('#geburtsdatum', '2020-01-01');
  await page.click('#pruefen');

  await expect(page.locator('.ergebnis__punkte')).toHaveCount(0);
  await expect(page.locator('.ergebnis__kopf')).toHaveAttribute('data-zustand', 'not_applicable');
  await expect(page.locator('.ergebnis__gruende > li').first()).toBeVisible();
});

test('ohne Reisedatum wird nicht geraten', async ({ page }) => {
  await page.goto(REISE);
  await page.click('#pruefen');
  // Das Feld ist als Pflichtfeld ausgezeichnet: der Browser hält das
  // Absenden auf. Entscheidend ist, dass keine Checkliste entsteht.
  await expect(page.locator('.ergebnis__punkte')).toHaveCount(0);
  expect(
    await page.locator('#reisedatum').evaluate((feld) => (feld as HTMLInputElement).validity.valid),
  ).toBe(false);

  // Auch wenn die Pflichtprüfung des Browsers umgangen wird, rechnet die
  // Seite nicht mit einem geratenen Datum.
  await page.locator('#reisedatum').evaluate((feld) => feld.removeAttribute('required'));
  await page.click('#pruefen');
  await expect(page.locator('#reiseergebnis')).toContainText('Reisedatum');
  await expect(page.locator('.ergebnis__punkte')).toHaveCount(0);
});
