// M13-04 — Die Angebotskarte behauptet nichts, was die Daten nicht hergeben.
import { expect, test } from '@playwright/test';

const PROBE = '/entwicklung/angebotsprobe/';

test('zeigt nur Angebote mit Erlaubnis und ohne Ablauf', async ({ page }) => {
  await page.goto(PROBE);
  await expect(page.locator('[data-testid^="angebot-"]')).toHaveCount(4);
  await expect(page.locator('[data-testid="angebot-probe-abgelaufen"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="angebot-probe-ohne-erlaubnis"]')).toHaveCount(0);
});

test('nennt unbekannten Versand unbekannt, nicht kostenlos', async ({ page }) => {
  await page.goto(PROBE);
  const karte = page.locator('[data-testid="angebot-probe-versand-unbekannt"]');
  await expect(karte.locator('[data-testid="versand-unbekannt"]')).toContainText('nicht angegeben');
  await expect(karte.locator('[data-testid="versand-frei"]')).toHaveCount(0);
  await expect(karte).not.toContainText('kostenlos');
});

test('nennt Versandkostenfreiheit nur bei ausdrücklicher Null', async ({ page }) => {
  await page.goto(PROBE);
  await expect(
    page.locator('[data-testid="angebot-probe-versand-frei"] [data-testid="versand-frei"]'),
  ).toContainText('kostenlos');
});

test('zeigt den Grundpreis nur bei bekannter Menge', async ({ page }) => {
  await page.goto(PROBE);
  await expect(
    page.locator('[data-testid="angebot-probe-versand-bekannt"] .angebot__grundpreis'),
  ).toContainText('je kg');
  await expect(
    page.locator('[data-testid="angebot-probe-ohne-menge"] .angebot__grundpreis'),
  ).toHaveCount(0);
  await expect(page.locator('[data-testid="angebot-probe-ohne-menge"]')).toContainText(
    'nicht berechenbar',
  );
});

test('kennzeichnet jede Karte als Anzeige und den Link als bezahlt', async ({ page }) => {
  await page.goto(PROBE);
  const karten = page.locator('[data-testid^="angebot-"]');
  const anzahl = await karten.count();
  for (let i = 0; i < anzahl; i += 1) {
    await expect(karten.nth(i)).toContainText('Anzeige');
    await expect(karten.nth(i).locator('a')).toHaveAttribute('rel', /sponsored/);
  }
});

test('nennt Verfügbarkeit und Preisstand', async ({ page }) => {
  await page.goto(PROBE);
  await expect(page.locator('[data-testid="angebot-probe-ohne-menge"]')).toContainText(
    'Verfügbarkeit nicht angegeben',
  );
  await expect(page.locator('[data-testid="angebot-probe-versand-bekannt"]')).toContainText(
    'Preisstand 2026-09-07',
  );
});

test('vergleicht den Gesamtpreis und nennt den Bezug', async ({ page }) => {
  await page.goto(PROBE);
  await expect(page.locator('[data-testid="vergleich-bezug"]')).toContainText('gesamtpreis');
  // 25,99 mit kostenlosem Versand schlägt 24,99 plus 3,95.
  await expect(page.locator('[data-testid="vergleich-guenstigstes"]')).toContainText(
    'probe-versand-frei',
  );
  await expect(page.locator('[data-testid="vergleich-grund"]')).toContainText('Versandkosten');
});

test('behauptet auf den echten Seiten kein Angebot', async ({ page }) => {
  for (const pfad of ['/de-de/', '/de-de/quellen/']) {
    await page.goto(pfad);
    await expect(page.locator('[data-testid^="angebot-"]'), pfad).toHaveCount(0);
  }
});
