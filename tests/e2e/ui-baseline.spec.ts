// M04-06 — Visuelle Grundprüfung als wiederholbarer Test.
// Prüft die Befunde, die im Baseline-Review von Hand aufgefallen wären.
import { expect, test } from '@playwright/test';

const SEITEN = [
  '/de-de/',
  '/de-de/quellen/',
  '/de-de/datenstand/',
  '/de-de/impressum/',
  '/de-de/datenschutz/',
];

test('Jede Seite hat genau eine H1', async ({ page }) => {
  for (const pfad of SEITEN) {
    await page.goto(pfad);
    await expect(page.locator('h1'), `H1 auf ${pfad}`).toHaveCount(1);
  }
});

test('Kein Text wird abgeschnitten', async ({ page }) => {
  for (const pfad of SEITEN) {
    await page.goto(pfad);
    const abgeschnitten = await page.evaluate(() =>
      [...document.querySelectorAll('h1,h2,p,a,li,td,th,label,button')]
        .filter((element) => element.scrollWidth > element.clientWidth + 1)
        .map((element) => (element.textContent ?? '').trim().slice(0, 40)),
    );
    expect(abgeschnitten, `abgeschnittener Text auf ${pfad}`).toEqual([]);
  }
});

test('Der Testdatenhinweis hat dieselbe Inhaltsbreite wie der Rest', async ({ page }) => {
  await page.goto('/de-de/');
  const masse = await page.evaluate(() => {
    const banner = document.querySelector('[data-testid="test-data-banner"]');
    // Verglichen wird mit dem **Inhalt** von main, nicht mit dessen
    // Rahmenkasten: seit dem Designdurchgang hat main einen Innenabstand,
    // und der Hinweis soll an der Textkante stehen, nicht an der Kastenkante.
    const inhalt = document.querySelector('main h1');
    if (!banner || !inhalt) return null;
    const a = banner.getBoundingClientRect();
    const b = inhalt.getBoundingClientRect();
    return { bannerLinks: Math.round(a.left), mainLinks: Math.round(b.left) };
  });
  expect(masse).not.toBeNull();
  expect(masse?.bannerLinks).toBe(masse?.mainLinks);
});

test('Der erste Tabstopp führt in die Seite und ist sichtbar', async ({ page }) => {
  await page.goto('/de-de/');
  await page.keyboard.press('Tab');
  const fokus = await page.evaluate(() => {
    const element = document.activeElement;
    if (!element || element === document.body) return null;
    return { tag: element.tagName, umriss: getComputedStyle(element).outlineStyle };
  });
  expect(fokus).not.toBeNull();
  expect(fokus?.umriss).not.toBe('none');
});

test('Keine ungeklärten Konsolenfehler auf den Kernseiten', async ({ page }) => {
  const fehler: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') fehler.push(message.text());
  });
  page.on('pageerror', (error) => fehler.push(`pageerror: ${error.message}`));

  for (const pfad of SEITEN) {
    await page.goto(pfad);
  }
  expect(fehler).toEqual([]);
});
