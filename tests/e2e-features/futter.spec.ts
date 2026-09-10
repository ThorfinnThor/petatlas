import { expect, test } from '@playwright/test';
const ROOT = '/de-de/futter/';
const PRODUCT = `${ROOT}royal-canin-mini-adult-2kg/`;
test('lists real product variants with honest coverage', async ({ page }) => {
  await page.goto(ROOT);
  await expect(page.locator('.produkte li')).toHaveCount(7);
  await expect(page.getByText('Synthetische Futterdaten')).toHaveCount(0);
  await expect(page.locator('main')).toContainText('keine verifizierten Barcodes');
});
test('finds a real brand and does not invent barcode matches', async ({ page }) => {
  await page.goto(ROOT);
  await page.fill('#futter-begriff', 'Royal Canin');
  await page.click('#futter-suchen');
  await expect(page.locator('.treffer__liste > li')).toHaveCount(6);
  await page.fill('#futter-begriff', '4006381333931');
  await page.click('#futter-suchen');
  await expect(page.locator('.treffer__kopf')).toContainText('nicht erfasst');
});
test('displays exact declarations and primary source', async ({ page }) => {
  await page.goto(PRODUCT);
  const protein = page.locator('[data-naehrwert="protein"]');
  await expect(protein).toContainText('27');
  await expect(protein).toContainText('%');
  await expect(protein).toContainText('Frischmasse');
  await expect(protein.locator('a')).toHaveAttribute('href', /^https:\/\/www.royalcanin.com\//);
  await expect(page.locator('[data-testid="menge"]')).toContainText('2 kg');
  await expect(page.locator('[data-testid="keine-angebote"]')).toContainText(
    /[Oo]hne freigegebenen Partnervertrag/,
  );
});
test('does not conflate different pack sizes', async ({ page }) => {
  await page.goto(PRODUCT);
  await expect(page.locator('[data-variante]')).toHaveCount(0);
  await page.goto(`${ROOT}bosch-adult-lamm-reis-15kg/`);
  await expect(page.locator('[data-testid="menge"]')).toContainText('15 kg');
  await expect(page.locator('[data-naehrwert="protein"]')).toContainText('21,5');
});
test('unknown products return 404', async ({ page }) => {
  expect((await page.request.get(`${ROOT}unknown/`)).status()).toBe(404);
});
