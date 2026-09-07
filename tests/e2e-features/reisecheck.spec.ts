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

test('zeigt keine Beispielprüfung mit erfundenen Regeln', async ({ page }) => {
  await page.goto(REISE);
  // Kein Formular, keine Checkliste, kein Ergebnis, solange keine belegten
  // Regeln vorliegen.
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.getByText('Regeln folgen')).toBeVisible();
});

test('bleibt ohne JavaScript vollständig lesbar', async ({ browser }) => {
  const kontext = await browser.newContext({ javaScriptEnabled: false });
  const seite = await kontext.newPage();
  await seite.goto(REISE);
  await expect(seite.locator('.ausnahmen li')).toHaveCount(umfang.unsupported.length);
  await kontext.close();
});
