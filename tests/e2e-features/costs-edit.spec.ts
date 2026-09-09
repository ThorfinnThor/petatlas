import { expect, test } from '@playwright/test';

test('a fee can be removed and an empty bill cannot be printed', async ({ page }) => {
  await page.goto('/de-de/tierarztkosten/');
  await expect(page.locator('#drucken')).toBeDisabled();
  await page.fill('#suche', 'Allgemeine Untersuchung');
  await page
    .getByRole('button', { name: /Allgemeine Untersuchung mit Beratung, Hund, Katze, Frettchen/ })
    .click();
  await expect(page.locator('[data-testid="brutto"]')).toContainText('28,11');
  await expect(page.locator('#drucken')).toBeEnabled();
  await page.locator('[data-remove-cost]').click();
  await expect(page.locator('#rechner-status')).toContainText('Noch keine Position');
  await expect(page.locator('#drucken')).toBeDisabled();
  await expect(page.locator('#suche')).toBeFocused();
});
