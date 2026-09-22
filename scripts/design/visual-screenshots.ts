/**
 * Visuelle Stichprobe für die vollständige Layout-QA.
 *
 * Alle eigenständigen Seiten, alle Ratgeber, Vergleiche, Pflege- und
 * Futterseiten sowie repräsentative Orts- und GOT-Ausreißer werden auf
 * Desktop und Mobil vollständig aufgenommen. Die flächendeckenden Messungen
 * für vier Viewports übernimmt visual-audit.ts.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { chromium } from '@playwright/test';

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

const OUTPUT = resolve('reports/visual-audit/screenshots');

function argument(name: string, fallback: string): string {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1]! : fallback;
}

function sitemapPaths(path: string): string[] {
  const xml = readFileSync(path, 'utf8');
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)]
    .map((match) => new URL(match[1]!).pathname)
    .sort((a, b) => a.localeCompare(b, 'de'));
}

function selectedPaths(paths: readonly string[]): string[] {
  const isGotPosition = (path: string) => /^\/de-de\/tierarztkosten\/\d+-/.test(path);
  const isGotGroup = (path: string) => path.startsWith('/de-de/tierarztkosten/gruppe/');
  const isCity = (path: string) =>
    path.startsWith('/de-de/tierarzt-karte/') && path !== '/de-de/tierarzt-karte/';
  const isFoodDetail = (path: string) =>
    path.startsWith('/de-de/futter/') && path !== '/de-de/futter/';

  const standalone = paths.filter(
    (path) => !isGotPosition(path) && !isGotGroup(path) && !isCity(path) && !isFoodDetail(path),
  );
  const food = paths.filter(isFoodDetail);
  const gotIds = ['1', '2', '41', '150', '194', '550', '775'];
  const got = gotIds
    .map((id) => paths.find((path) => path.startsWith(`/de-de/tierarztkosten/${id}-`)))
    .filter((path): path is string => path !== undefined);
  const groups = [
    '/de-de/tierarztkosten/gruppe/teil-b-kontrastmittelverabreichung/',
    '/de-de/tierarztkosten/gruppe/teil-c-10f-weitere-untersuchungen-massnahmen/',
    '/de-de/tierarztkosten/gruppe/teil-c-gingivektomie-parodontalbehandlung/',
  ].filter((path) => paths.includes(path));
  const cities = ['berlin', 'frankfurt-am-main', 'hamburg', 'mannheim', 'muelheim-an-der-ruhr']
    .map((slug) => `/de-de/tierarzt-karte/${slug}/`)
    .filter((path) => paths.includes(path));

  return [...new Set([...standalone, ...food, ...got, ...groups, ...cities])].sort((a, b) =>
    a.localeCompare(b, 'de'),
  );
}

function filename(path: string, viewport: string): string {
  const slug = path.replace(/^\/|\/$/g, '').replaceAll('/', '__') || 'start';
  return `${slug}--${viewport}.jpg`;
}

async function main(): Promise<void> {
  const base = argument('--base', 'http://127.0.0.1:4334').replace(/\/$/, '');
  const paths = selectedPaths(sitemapPaths(resolve(argument('--sitemap', 'dist/sitemap.xml'))));
  mkdirSync(OUTPUT, { recursive: true });

  const browser = await chromium.launch();
  const files: string[] = [];
  try {
    for (const viewport of VIEWPORTS) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: 'reduce',
      });
      const page = await context.newPage();
      try {
        for (const path of paths) {
          const response = await page.goto(`${base}${path}`, {
            waitUntil: 'domcontentloaded',
            timeout: 20_000,
          });
          if (response?.status() !== 200) throw new Error(`${path}: HTTP ${response?.status()}`);
          await page.evaluate(() => document.fonts.ready);
          const file = resolve(OUTPUT, filename(path, viewport.name));
          await page.screenshot({ path: file, fullPage: true, type: 'jpeg', quality: 55 });
          files.push(file);
        }
      } finally {
        await page.close();
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  writeFileSync(
    resolve(OUTPUT, 'manifest.json'),
    `${JSON.stringify({ pages: paths.length, viewports: VIEWPORTS, files }, null, 2)}\n`,
  );
  console.log(`Visuelle Stichprobe: ${paths.length} Seiten, ${files.length} Aufnahmen.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : error);
  process.exit(1);
});
