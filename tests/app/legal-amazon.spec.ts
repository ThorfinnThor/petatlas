import { expect, test } from '@playwright/test';
import editorial from '../../content-data/products/editorial.json' with { type: 'json' };
import supplements from '../../content-data/products/supplements.json' with { type: 'json' };
import fressnapfFeed from '../../content-data/products/fressnapf-feed.json' with { type: 'json' };
import AxeBuilder from '@axe-core/playwright';

const supplementIds = new Set(supplements.products.map((product) => product.id));
const supplementFressnapfCount = fressnapfFeed.products.filter((product) =>
  supplementIds.has(product.productId),
).length;
const transparentPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

for (const width of [390, 1440]) {
  test(`operator, privacy and affiliate links at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('https://images2.productserve.com/**', (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: transparentPng }),
    );
    const remote: string[] = [];
    page.on('request', (request) => {
      if (
        /amazon\.|amazon-adsystem|ssl-images-amazon|awin1\.com/.test(
          new URL(request.url()).hostname,
        )
      )
        remote.push(request.url());
    });
    for (const path of [
      'impressum',
      'datenschutz',
      'ergaenzungsfuttermittel',
      'tierversicherung',
    ]) {
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
          'Awin-Partnerlinks',
          'Cloudflare',
          'Art. 21 DSGVO',
          'Berliner Beauftragte',
          'Speicherdauer',
        ])
          await expect(page.locator('main')).toContainText(text);
      }
      if (path === 'ergaenzungsfuttermittel') {
        await expect(page.locator('main')).not.toContainText('Letzte Quellenprüfung');
        await expect(page.locator('main')).not.toContainText('Fachliche Verantwortung');
        await expect(page.locator('main')).not.toContainText('Freigegeben am');
        await expect(page.locator('.supplement-products a[rel~="sponsored"]')).toHaveCount(
          supplements.products.length + supplementFressnapfCount,
        );
        const fressnapfLinks = page.locator(
          '.retail-partner a[href*="awin1.com"][rel~="sponsored"]',
        );
        await expect(fressnapfLinks).toHaveCount(2);
        for (const link of await fressnapfLinks.all()) {
          const url = new URL((await link.getAttribute('href'))!);
          expect(url.hostname).toBe('www.awin1.com');
          expect(url.searchParams.get('awinmid')).toBe('14757');
          expect(url.searchParams.get('awinaffid')).toBe('3037577');
        }
        const amazonRetailLinks = page.locator(
          '.retail-partner a[href*="amazon.de"][rel~="sponsored"]',
        );
        await expect(amazonRetailLinks).toHaveCount(2);
        for (const link of await amazonRetailLinks.all()) {
          const url = new URL((await link.getAttribute('href'))!);
          expect(url.hostname).toBe('www.amazon.de');
          expect(url.searchParams.get('tag')).toBe('wauandmiau-21');
        }
        await expect(page.locator('.supplement-products article')).toHaveCount(6);
        await expect(page.locator('.supplement-products img')).toHaveCount(6);
        await expect(
          page.locator('.supplement-products figcaption', { hasText: 'Symbolbild' }),
        ).toHaveCount(supplements.products.length - supplementFressnapfCount);
        await expect(
          page.locator('.supplement-products figcaption', {
            hasText: 'Produktbild · Fressnapf-Feed',
          }),
        ).toHaveCount(supplementFressnapfCount);
        await expect(page.locator('.supplement-products')).toContainText('Caniflora Vital');
        await expect(page.locator('.supplement-products')).toContainText('Cat-Vitamin Tabs');
        const amazonLinks = page.locator(
          '.supplement-products a[href*="amazon.de"][rel~="sponsored"]',
        );
        await expect(amazonLinks).toHaveCount(supplements.products.length);
        for (const link of await amazonLinks.all()) {
          const url = new URL((await link.getAttribute('href'))!);
          expect(url.hostname).toBe('www.amazon.de');
          expect(url.searchParams.get('tag')).toBe('wauandmiau-21');
        }
        const productFressnapfLinks = page.locator(
          '.supplement-products .fressnapf-link a[rel~="sponsored"]',
        );
        await expect(productFressnapfLinks).toHaveCount(supplementFressnapfCount);
        for (const link of await productFressnapfLinks.all()) {
          const url = new URL((await link.getAttribute('href'))!);
          expect(url.hostname).toBe('www.awin1.com');
          expect(url.searchParams.get('m') ?? url.searchParams.get('awinmid')).toBe('14757');
          expect(url.searchParams.get('a') ?? url.searchParams.get('awinaffid')).toBe('3037577');
        }
      }
      if (path === 'tierversicherung') {
        await expect(page.getByRole('heading', { name: 'Tierversicherung prüfen' })).toBeVisible();
        const link = page.locator('main a[rel~="sponsored"]');
        await expect(link).toHaveCount(1);
        const url = new URL((await link.getAttribute('href'))!);
        expect(url.hostname).toBe('www.awin1.com');
        expect(url.searchParams.get('awinmid')).toBe('11705');
        expect(url.searchParams.get('awinaffid')).toBe('3037577');
      }
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
