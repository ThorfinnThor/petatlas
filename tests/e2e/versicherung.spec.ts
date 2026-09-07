// M09-02 — Der Partnerhinweis ist gekennzeichnet, getrennt und trägt nichts hinaus.
import { expect, test } from '@playwright/test';

const PROBE = '/entwicklung/versicherungsprobe/';

test('zeigt einen Hinweis nur an der vertraglich erlaubten Stelle', async ({ page }) => {
  await page.goto(PROBE);
  // Zustand 2 erlaubt die Informationsseite, Zustand 1 und 3 nicht.
  await expect(page.locator('[data-testid^="partner-cta-"]')).toHaveCount(1);
  await expect(page.locator('[data-testid="partner-cta-information_page"]')).toBeVisible();
  await expect(page.locator('[data-testid="partner-cta-neutral_list"]')).toHaveCount(0);
});

test('sagt ohne Partner, dass es keinen gibt, statt leer zu bleiben', async ({ page }) => {
  await page.goto(PROBE);
  await expect(page.locator('[data-testid="kein-partner"]')).toBeVisible();
  await expect(page.locator('[data-testid="echte-begruendung"]')).toContainText(
    /kein Partnerprogramm|commerce/,
  );
});

test('kennzeichnet den Hinweis als Werbung', async ({ page }) => {
  await page.goto(PROBE);
  const anzeige = page.locator('[data-testid="partner-cta-information_page"]');
  await expect(anzeige).toContainText('Anzeige');
  await expect(anzeige).toHaveAttribute('aria-label', 'Anzeige');
  await expect(page.locator('[data-testid="werbekennzeichnung"]')).toContainText('Werbung');
});

test('der Aufruf trägt nur eine statische Kennung, keine Eingaben', async ({ page }) => {
  await page.goto(PROBE);
  const href = await page.locator('.partner__link').getAttribute('href');
  expect(href).not.toBeNull();

  const ziel = new URL(href!);
  expect(ziel.protocol).toBe('https:');
  expect(ziel.host).toBe('beispiel.invalid');
  // Genau ein Parameter, und der ist statisch konfiguriert.
  expect([...ziel.searchParams.keys()]).toEqual(['campaign']);
  expect(ziel.searchParams.get('campaign')).toBe('PROBE_STATISCH');
  // Kein Profilwert, kein Kostenbetrag, keine Diagnose, kein Rückverweis.
  for (const verdacht of ['tier', 'hund', 'katze', 'alter', 'kosten', 'euro', 'ref', 'utm']) {
    expect(ziel.search.toLowerCase(), verdacht).not.toContain(verdacht);
  }
});

test('der Link ist als bezahlt ausgezeichnet und öffnet direkt beim Anbieter', async ({ page }) => {
  await page.goto(PROBE);
  const link = page.locator('.partner__link');
  await expect(link).toHaveAttribute('rel', /sponsored/);
  await expect(link).toHaveAttribute('rel', /noopener/);
  // Keine Zwischenstation: das href zeigt auf den Anbieter selbst.
  const href = await link.getAttribute('href');
  expect(href).toMatch(/^https:\/\/beispiel\.invalid\//);
  // Und kein Skript, das den Klick abfängt.
  expect(await link.getAttribute('onclick')).toBeNull();
});

test('vor dem Klick geht keine Anfrage an den Anbieter', async ({ page }) => {
  const anfragen: string[] = [];
  page.on('request', (anfrage) => {
    if (anfrage.url().includes('beispiel.invalid')) anfragen.push(anfrage.url());
  });
  await page.goto(PROBE);
  await page.waitForTimeout(500);
  expect(anfragen).toEqual([]);
});

test('auf den echten Seiten steht kein Partnerhinweis', async ({ page }) => {
  for (const pfad of ['/de-de/', '/de-de/quellen/', '/de-de/datenstand/']) {
    await page.goto(pfad);
    await expect(page.locator('[data-testid^="partner-cta-"]'), pfad).toHaveCount(0);
  }
});
