/**
 * Vollständiger Layout-Audit über alle indexierbaren Seiten.
 *
 * Voraussetzung: Ein Produktionsbuild liegt in `dist/` und wird lokal oder
 * unter der mit `--base` angegebenen Adresse ausgeliefert. Der Audit liest
 * ausschließlich die versionierte Sitemap des Builds. Dadurch gibt es keine
 * handgepflegte, unvollständige Routenliste.
 *
 * Beispiele:
 *   npm run design:audit
 *   npm run design:audit -- --base http://localhost:4334
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { chromium, type BrowserContext, type Page } from '@playwright/test';

type ViewportName = 'desktop' | 'desktop-small' | 'tablet' | 'mobile';

interface Viewport {
  readonly name: ViewportName;
  readonly width: number;
  readonly height: number;
}

interface ElementFinding {
  readonly element: string;
  readonly text: string;
  readonly value: number;
}

interface PageMetrics {
  readonly path: string;
  readonly viewport: ViewportName;
  readonly status: number;
  readonly title: string;
  readonly h1Text: string;
  readonly h1Count: number;
  readonly h1Width: number;
  readonly h1Height: number;
  readonly h1FontSize: number;
  readonly h1LineHeight: number;
  readonly h1Lines: number;
  readonly h1Hyphens: string;
  readonly h1WordBreak: string;
  readonly h1OverflowWrap: string;
  readonly heroHeight: number;
  readonly heroWidth: number;
  readonly documentWidth: number;
  readonly viewportWidth: number;
  readonly documentHeight: number;
  readonly horizontalOverflow: number;
  readonly clipped: readonly ElementFinding[];
  readonly narrowText: readonly ElementFinding[];
  readonly wideText: readonly ElementFinding[];
  readonly tinyText: readonly ElementFinding[];
  readonly consoleErrors: readonly string[];
  readonly pageErrors: readonly string[];
  readonly findings: readonly string[];
}

const VIEWPORTS: readonly Viewport[] = [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'desktop-small', width: 1280, height: 800 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const REPORT_DIR = resolve('reports/visual-audit');
const WORKERS = 6;

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

function shortText(value: string | null | undefined, length = 90): string {
  const compact = value?.replace(/\s+/g, ' ').trim() ?? '';
  return compact.length > length ? `${compact.slice(0, length - 1)}…` : compact;
}

async function scanPage(page: Page, base: string, path: string, viewport: Viewport) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const onConsole = (message: { type(): string; text(): string }) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  };
  const onPageError = (error: Error) => pageErrors.push(error.message);
  page.on('console', onConsole);
  page.on('pageerror', onPageError);

  try {
    const response = await page.goto(`${base}${path}`, {
      waitUntil: 'domcontentloaded',
      timeout: 20_000,
    });
    await page.evaluate(() => document.fonts.ready);

    const measured = await page.evaluate(() => {
      const visible = (element: HTMLElement): boolean => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number.parseFloat(style.opacity) > 0 &&
          rect.width > 0 &&
          rect.height > 0
        );
      };
      const describe = (element: HTMLElement): string => {
        const id = element.id ? `#${element.id}` : '';
        const classes = [...element.classList].slice(0, 3).join('.');
        return `${element.tagName.toLowerCase()}${id}${classes ? `.${classes}` : ''}`;
      };
      const text = (element: HTMLElement): string =>
        (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();

      const root = document.documentElement;
      const h1s = [...document.querySelectorAll<HTMLElement>('h1')].filter(visible);
      const h1 = h1s[0] ?? null;
      const h1Style = h1 ? getComputedStyle(h1) : null;
      const h1Rect = h1?.getBoundingClientRect() ?? null;
      const lineHeight = h1Style
        ? Number.parseFloat(h1Style.lineHeight) || Number.parseFloat(h1Style.fontSize) * 1.15
        : 0;
      const hero =
        h1?.closest<HTMLElement>(
          '.hero-feature, .guide-hero, .seitenkopf, .page-intro, .product-hero, .tool-shell, main > header',
        ) ??
        h1?.parentElement ??
        null;
      const heroRect = hero?.getBoundingClientRect() ?? null;

      const clipped = [...document.querySelectorAll<HTMLElement>('main *')]
        .filter(visible)
        .map((element) => ({ element, rect: element.getBoundingClientRect() }))
        .filter(
          ({ element, rect }) =>
            getComputedStyle(element).position !== 'fixed' &&
            (rect.left < -1 || rect.right > window.innerWidth + 1),
        )
        .slice(0, 12)
        .map(({ element, rect }) => ({
          element: describe(element),
          text: text(element).slice(0, 90),
          value: Math.round(Math.max(-rect.left, rect.right - window.innerWidth)),
        }));

      const prose = [...document.querySelectorAll<HTMLElement>('main p, main li, main dd, main td')]
        .filter(visible)
        .filter((element) => text(element).length >= 70)
        .map((element) => ({ element, rect: element.getBoundingClientRect() }));
      const narrowText = prose
        .filter(({ rect }) => rect.width < 240)
        .slice(0, 12)
        .map(({ element, rect }) => ({
          element: describe(element),
          text: text(element).slice(0, 90),
          value: Math.round(rect.width),
        }));
      const wideText = prose
        .filter(({ rect }) => rect.width > 900)
        .slice(0, 12)
        .map(({ element, rect }) => ({
          element: describe(element),
          text: text(element).slice(0, 90),
          value: Math.round(rect.width),
        }));
      const tinyText = [
        ...document.querySelectorAll<HTMLElement>('main p, main li, main dd, main td, main label'),
      ]
        .filter(visible)
        .filter((element) => text(element).length >= 35)
        .filter((element) => Number.parseFloat(getComputedStyle(element).fontSize) < 14)
        .slice(0, 12)
        .map((element) => ({
          element: describe(element),
          text: text(element).slice(0, 90),
          value: Number.parseFloat(getComputedStyle(element).fontSize),
        }));

      return {
        title: document.title,
        h1Text: h1 ? text(h1) : '',
        h1Count: h1s.length,
        h1Width: Math.round(h1Rect?.width ?? 0),
        h1Height: Math.round(h1Rect?.height ?? 0),
        h1FontSize: Number.parseFloat(h1Style?.fontSize ?? '0'),
        h1LineHeight: Math.round(lineHeight * 10) / 10,
        h1Lines: lineHeight > 0 ? Math.max(1, Math.round((h1Rect?.height ?? 0) / lineHeight)) : 0,
        h1Hyphens: h1Style?.hyphens ?? '',
        h1WordBreak: h1Style?.wordBreak ?? '',
        h1OverflowWrap: h1Style?.overflowWrap ?? '',
        heroHeight: Math.round(heroRect?.height ?? 0),
        heroWidth: Math.round(heroRect?.width ?? 0),
        documentWidth: root.scrollWidth,
        viewportWidth: root.clientWidth,
        documentHeight: root.scrollHeight,
        horizontalOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
        clipped,
        narrowText,
        wideText,
        tinyText,
      };
    });

    const findings: string[] = [];
    if ((response?.status() ?? 0) !== 200) findings.push('http-status');
    if (measured.h1Count !== 1) findings.push('h1-count');
    if (measured.horizontalOverflow > 1) findings.push('horizontal-overflow');
    if (measured.clipped.length > 0) findings.push('clipped-element');
    if (measured.h1Hyphens === 'auto') findings.push('h1-auto-hyphens');
    if (measured.h1Lines > (viewport.width >= 768 ? 5 : 7)) findings.push('h1-many-lines');
    if (measured.heroHeight > viewport.height * 0.9) findings.push('hero-too-tall');
    if (measured.narrowText.length > 0) findings.push('narrow-prose');
    if (measured.wideText.length > 0) findings.push('wide-prose');
    if (measured.tinyText.length > 0) findings.push('tiny-prose');
    if (consoleErrors.length > 0) findings.push('console-error');
    if (pageErrors.length > 0) findings.push('page-error');

    return {
      path,
      viewport: viewport.name,
      status: response?.status() ?? 0,
      ...measured,
      consoleErrors: consoleErrors.map((value) => shortText(value, 180)),
      pageErrors: pageErrors.map((value) => shortText(value, 180)),
      findings,
    } satisfies PageMetrics;
  } finally {
    page.off('console', onConsole);
    page.off('pageerror', onPageError);
  }
}

async function scanViewport(
  context: BrowserContext,
  base: string,
  paths: readonly string[],
  viewport: Viewport,
): Promise<PageMetrics[]> {
  let next = 0;
  const results: PageMetrics[] = [];
  const workers = Array.from({ length: Math.min(WORKERS, paths.length) }, async () => {
    const page = await context.newPage();
    try {
      for (;;) {
        const index = next;
        next += 1;
        if (index >= paths.length) break;
        const path = paths[index]!;
        try {
          results.push(await scanPage(page, base, path, viewport));
        } catch (error) {
          results.push({
            path,
            viewport: viewport.name,
            status: 0,
            title: '',
            h1Text: '',
            h1Count: 0,
            h1Width: 0,
            h1Height: 0,
            h1FontSize: 0,
            h1LineHeight: 0,
            h1Lines: 0,
            h1Hyphens: '',
            h1WordBreak: '',
            h1OverflowWrap: '',
            heroHeight: 0,
            heroWidth: 0,
            documentWidth: 0,
            viewportWidth: viewport.width,
            documentHeight: 0,
            horizontalOverflow: 0,
            clipped: [],
            narrowText: [],
            wideText: [],
            tinyText: [],
            consoleErrors: [],
            pageErrors: [shortText(error instanceof Error ? error.message : String(error), 180)],
            findings: ['scan-error'],
          });
        }
        if ((index + 1) % 200 === 0) {
          console.log(`  ${viewport.name}: ${Math.min(index + 1, paths.length)}/${paths.length}`);
        }
      }
    } finally {
      await page.close();
    }
  });
  await Promise.all(workers);
  return results.sort((a, b) => a.path.localeCompare(b.path, 'de'));
}

function markdown(results: readonly PageMetrics[], urlCount: number): string {
  const counts = new Map<string, number>();
  for (const result of results) {
    for (const finding of result.findings) counts.set(finding, (counts.get(finding) ?? 0) + 1);
  }
  const outliers = results
    .filter((result) => result.findings.length > 0)
    .sort((a, b) => b.findings.length - a.findings.length || a.path.localeCompare(b.path, 'de'));
  return [
    '# Visual-QA-Messbericht',
    '',
    `- Öffentliche URLs: ${urlCount}`,
    `- Viewports: ${VIEWPORTS.map((item) => `${item.name} ${item.width}×${item.height}`).join(', ')}`,
    `- Messungen: ${results.length}`,
    `- Auffällige Messungen: ${outliers.length}`,
    '',
    '## Befunde',
    '',
    ...(counts.size === 0
      ? ['Keine automatischen Auffälligkeiten.']
      : [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([name, count]) => `- ${name}: ${count}`)),
    '',
    '## Auffällige Seiten',
    '',
    ...outliers
      .slice(0, 300)
      .map(
        (item) =>
          `- ${item.viewport} ${item.path} — ${item.findings.join(', ')}; H1 ${item.h1Lines} Zeilen, Hero ${item.heroHeight}px`,
      ),
    '',
  ].join('\n');
}

async function main(): Promise<void> {
  const base = argument('--base', 'http://localhost:4334').replace(/\/$/, '');
  const sitemap = resolve(argument('--sitemap', 'dist/sitemap.xml'));
  const paths = sitemapPaths(sitemap);
  if (paths.length === 0) throw new Error(`Keine URLs in ${sitemap}.`);
  mkdirSync(REPORT_DIR, { recursive: true });

  console.log(`Visual-QA: ${paths.length} URLs × ${VIEWPORTS.length} Viewports`);
  const browser = await chromium.launch();
  const results: PageMetrics[] = [];
  try {
    for (const viewport of VIEWPORTS) {
      console.log(`\n${viewport.name} ${viewport.width}×${viewport.height}`);
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        reducedMotion: 'reduce',
      });
      await context.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.origin === new URL(base).origin) await route.continue();
        else await route.abort();
      });
      try {
        results.push(...(await scanViewport(context, base, paths, viewport)));
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  writeFileSync(resolve(REPORT_DIR, 'results.json'), `${JSON.stringify(results, null, 2)}\n`);
  const report = markdown(results, paths.length);
  writeFileSync(resolve(REPORT_DIR, 'report.md'), report);
  console.log(`\n${report.split('\n').slice(0, 25).join('\n')}`);
  console.log(`\nVollständiger Bericht: ${resolve(REPORT_DIR, 'report.md')}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? (error.stack ?? error.message) : error);
  process.exit(1);
});
