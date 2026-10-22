import { devices, expect, test } from '@playwright/test';

// Das mobile Menü ist von Anfang an eingeklappt, nicht erst nach dem Skript:
// sonst sprang die Seite auf langsamen Verbindungen beim Einklappen (CLS).
test.describe('Seitenkopf auf dem Handy', () => {
  test.use({ viewport: devices['Pixel 7'].viewport });

  test('ist ohne Skript schon eingeklappt und springt beim Laden nicht', async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((liste) => {
        for (const eintrag of liste.getEntries() as unknown as {
          value: number;
          hadRecentInput: boolean;
        }[])
          if (!eintrag.hadRecentInput)
            (window as unknown as { __cls: number }).__cls += eintrag.value;
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/de-de/');
    const knopf = page.locator('#menue-knopf');
    await expect(knopf).toBeVisible();
    await expect(page.locator('#hauptnavigation')).toBeHidden();
    await knopf.click();
    await expect(page.locator('#hauptnavigation')).toBeVisible();
    await expect(knopf).toHaveAttribute('aria-expanded', 'true');
    await knopf.click();
    await expect(page.locator('#hauptnavigation')).toBeHidden();
    expect(await page.evaluate(() => (window as unknown as { __cls: number }).__cls)).toBeLessThan(
      0.1,
    );
  });

  test('zeigt ohne JavaScript die offene Navigation und keinen Knopf', async ({ browser }) => {
    const kontext = await browser.newContext({
      viewport: devices['Pixel 7'].viewport,
      javaScriptEnabled: false,
    });
    const seite = await kontext.newPage();
    await seite.goto('/de-de/');
    await expect(seite.locator('#hauptnavigation')).toBeVisible();
    await expect(seite.locator('#menue-knopf')).toBeHidden();
    await kontext.close();
  });
});
