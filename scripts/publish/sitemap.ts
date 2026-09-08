/**
 * M18-01 — Sitemap und robots.txt.
 *
 * Aufgenommen wird nur, was tatsächlich gebaut wurde **und** sich selbst als
 * indexierbar ausweist. Die Liste entsteht damit aus der Messung des
 * Buildoutputs, nicht aus einer zweiten Aufzählung, die irgendwann von der
 * Wirklichkeit abweicht.
 *
 * Ist der Build nicht indexierbar — jeder Modus außer `production`, und
 * `production` erst nach den Launch-Gates —, entsteht **keine** Sitemap, und
 * `robots.txt` verbietet alles. Eine Sitemap, die auf einen Testbuild zeigt,
 * wäre eine Einladung, ihn zu indexieren.
 *
 * Ausführen: `npm run build:sitemap` (läuft in `build:site` mit).
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { resolveBuildConfig } from '../../config/build.ts';
import { leseKopf, nichtIndexierbar } from '../../src/lib/html-head.ts';

const OUT_DIR = 'dist';

export interface Seite {
  /** Pfad, wie ihn der Browser sieht: `/de-de/quellen/`. */
  readonly pfad: string;
  readonly datei: string;
  readonly indexierbar: boolean;
}

/** Aus `dist/de-de/quellen/index.html` wird `/de-de/quellen/`. */
export function pfadAusDatei(wurzel: string, datei: string): string {
  const relativ = relative(wurzel, datei).split(sep).join('/');
  if (relativ === 'index.html') return '/';
  if (relativ.endsWith('/index.html')) return `/${relativ.slice(0, -'index.html'.length)}`;
  return `/${relativ}`;
}

export function sammleSeiten(wurzel = OUT_DIR): readonly Seite[] {
  if (!existsSync(wurzel)) return [];
  const seiten: Seite[] = [];
  for (const eintrag of readdirSync(wurzel, { withFileTypes: true, recursive: true })) {
    if (!eintrag.isFile() || !eintrag.name.endsWith('.html')) continue;
    const datei = join(eintrag.parentPath, eintrag.name);
    const kopf = leseKopf(readFileSync(datei, 'utf8'));
    seiten.push({
      pfad: pfadAusDatei(wurzel, datei),
      datei,
      indexierbar: !nichtIndexierbar(kopf),
    });
  }
  return seiten.sort((a, b) => (a.pfad < b.pfad ? -1 : 1));
}

export function baueSitemap(seiten: readonly Seite[], baseUrl: string): string {
  const eintraege = seiten
    .filter((seite) => seite.indexierbar)
    .map((seite) => `  <url><loc>${new URL(seite.pfad, baseUrl).toString()}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...eintraege,
    '</urlset>',
    '',
  ].join('\n');
}

export function baueRobots(indexierbar: boolean, baseUrl: string): string {
  if (!indexierbar) {
    return [
      '# Dieser Build ist nicht zur Indexierung bestimmt.',
      'User-agent: *',
      'Disallow: /',
      '',
    ].join('\n');
  }
  return [
    'User-agent: *',
    '# Technische Probeseiten gehören nicht in einen Index.',
    'Disallow: /entwicklung/',
    'Allow: /',
    '',
    `Sitemap: ${new URL('/sitemap.xml', baseUrl).toString()}`,
    '',
  ].join('\n');
}

function main(): number {
  const build = resolveBuildConfig();
  const seiten = sammleSeiten();
  if (seiten.length === 0) {
    console.error('Kein Build vorhanden: erst `npm run build`, dann diesen Schritt.');
    return 1;
  }

  writeFileSync(join(OUT_DIR, 'robots.txt'), baueRobots(build.indexable, build.baseUrl), 'utf8');

  const indexierbare = seiten.filter((seite) => seite.indexierbar);
  if (!build.indexable) {
    console.log(
      `robots.txt geschrieben: dieser Build (${build.mode}) verbietet die Indexierung, ` +
        'deshalb entsteht keine Sitemap.',
    );
    return 0;
  }

  writeFileSync(join(OUT_DIR, 'sitemap.xml'), baueSitemap(seiten, build.baseUrl), 'utf8');
  console.log(
    `sitemap.xml geschrieben: ${indexierbare.length} von ${seiten.length} Seiten aufgenommen, ` +
      `${seiten.length - indexierbare.length} durch noindex ausgeschlossen.`,
  );
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
