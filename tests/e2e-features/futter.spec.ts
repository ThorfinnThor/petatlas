// M15-03 — Futtersuche, Produktseite und ein Preisvergleich, der leer bleiben darf.
import { expect, test } from '@playwright/test';

const FUTTER = '/de-de/futter/';

test('nennt die Daten synthetisch und listet alle Produkte', async ({ page }) => {
  await page.goto(FUTTER);
  await expect(page.getByText('Synthetische Futterdaten')).toBeVisible();
  await expect(page.locator('.produkte li')).toHaveCount(4);
});

test('findet ein Produkt über die abgetippte Nummer', async ({ page }) => {
  await page.goto(FUTTER);
  await page.fill('#futter-begriff', '4006-3813 33931');
  await page.click('#futter-suchen');
  await expect(page.locator('[data-futter="synthetisch:trocken-1kg"]').first()).toBeVisible();
  await expect(page.locator('.treffer__liste [data-grund="gtin"]')).toHaveCount(1);
});

test('findet über den Namen und sagt, worauf der Treffer beruht', async ({ page }) => {
  await page.goto(FUTTER);
  await page.fill('#futter-begriff', 'nassfutter');
  await page.click('#futter-suchen');
  await expect(page.locator('.treffer__liste > li')).toHaveCount(2);
  await expect(page.locator('.treffer__liste .treffer__meta').first()).toContainText(
    'Produktnamen',
  );
});

test('sagt bei fehlendem Treffer nicht, dass es das Produkt nicht gibt', async ({ page }) => {
  await page.goto(FUTTER);
  await page.fill('#futter-begriff', 'gibtesnicht');
  await page.click('#futter-suchen');
  await expect(page.locator('.treffer__kopf')).toContainText('nicht erfasst');
});

test('zeigt deklarierte Nährwerte mit Bezug und Quelle', async ({ page }) => {
  await page.goto(`${FUTTER}trocken-1kg/`);
  await expect(page.locator('[data-naehrwert="protein"]')).toContainText('Frischmasse');
  await expect(page.locator('[data-naehrwert="protein"] a')).toHaveAttribute('href', /^https:\/\//);
  await expect(page.locator('[data-testid="nicht-deklariert"]')).toContainText('ash');
  await expect(page.locator('[data-testid="nicht-deklariert"]')).toContainText('keine Null');
});

test('bleibt ohne Nährwerte nutzbar', async ({ page }) => {
  await page.goto(`${FUTTER}trocken-12kg/`);
  await expect(page.locator('[data-testid="menge"]')).toContainText('12 kg');
});

test('nennt den leeren Angebotsvergleich ehrlich', async ({ page }) => {
  await page.goto(`${FUTTER}nass-400g/`);
  await expect(page.locator('[data-testid="keine-angebote"]')).toContainText(
    /[Oo]hne freigegebenen Partnervertrag/,
  );
});

test('verweist auf dieselbe Variante mit anderem Gebinde', async ({ page }) => {
  await page.goto(`${FUTTER}nass-400g/`);
  await expect(page.locator('[data-variante="synthetisch:nass-6x400"]')).toBeVisible();
  await page.goto(`${FUTTER}trocken-1kg/`);
  await expect(page.locator('[data-variante]')).toHaveCount(0);
});

test('gibt keine Seite für ein erfundenes Produkt', async ({ page }) => {
  const antwort = await page.request.get(`${FUTTER}gibtesnicht/`);
  expect(antwort.status()).toBe(404);
});
