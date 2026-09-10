import { expect, test } from '@playwright/test';
import editorial from '../../content-data/products/editorial.json' with { type: 'json' };
import AxeBuilder from '@axe-core/playwright';

for (const width of [390, 1440]) {
  test(`operator, privacy and Amazon links at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const remote: string[] = [];
    page.on('request', (request) => {
      if (/amazon\.|amazon-adsystem|ssl-images-amazon/.test(new URL(request.url()).hostname))
        remote.push(request.url());
    });
    for (const path of ['impressum', 'datenschutz', 'ergaenzungsfuttermittel']) {
      expect((await page.goto(`/de-de/${path}/`))?.status()).toBe(200);
      expect(await page.locator('main').innerText()).not.toContain(
        'Betreiberangaben liegen nicht vor',
      );
      if (path === 'impressum') {
        await expect(page.locator('main')).toContainText('Schayan Yousefian');
        await expect(page.locator('main')).toContainText('SeitenHafen361');
        await expect(page.locator('main')).toContainText('Freienwalder Str. 34');
        await expect(page.locator('main a[href="mailto:info@wauandmiau.de"]')).toBeVisible();
      }
      if (path === 'datenschutz') {
        for (const text of [
          'Amazon-Partnerlinks',
          'Cloudflare',
          'Art. 21 DSGVO',
          'Berliner Beauftragte',
          'Speicherdauer',
        ])
          await expect(page.locator('main')).toContainText(text);
      }
      if (path === 'ergaenzungsfuttermittel')
        await expect(page.locator('main a[rel~="sponsored"]')).toHaveCount(2);
      expect(
        (
          await new AxeBuilder({ page })
            .include('main')
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.goto('/de-de/nahrungsergaenzung/');
    await expect(page).toHaveURL(/\/ergaenzungsfuttermittel\/$/);
    await page.goto('/de-de/');
    await expect(page.locator('#produkte a[rel~="sponsored"]')).toHaveCount(2);
    await expect(page.locator('footer')).toContainText(
      'Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.',
    );
    await page.goto('/de-de/spielzeug/?tierart=cat');
    await page.getByRole('button', { name: 'Passendes anzeigen' }).click();
    const links = page.locator('#finder-ergebnis a[rel~="sponsored"]');
    await expect(links).toHaveCount(
      editorial.products.filter((p) => p.species === 'cat' && p.category === 'Spielzeug').length,
    );
    for (const link of await links.all()) {
      const url = new URL((await link.getAttribute('href'))!);
      expect(url.hostname).toBe('www.amazon.de');
      expect(url.searchParams.get('tag')).toBe('wauandmiau-21');
      expect(url.searchParams.get('k')).not.toContain('Hund');
      await expect(link).toContainText('Werbung');
      await expect(link).toHaveAttribute('rel', /nofollow/);
    }
    expect(remote).toEqual([]);
  });
}
