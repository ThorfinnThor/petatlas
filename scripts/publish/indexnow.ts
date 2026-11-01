/**
 * Meldet nach einer Auslieferung geänderte Seiten per IndexNow an Bing und die
 * anderen teilnehmenden Suchmaschinen.
 *
 * Gemeldet werden nur Artikel, deren Datei sich zwischen zwei Commits geändert
 * hat, dazu die Übersichten, die auf sie verlinken. Alles wird gegen die live
 * ausgelieferte Sitemap gefiltert: Entwürfe und noindex-Seiten stehen dort
 * nicht und werden deshalb nie gemeldet.
 *
 * Der Schlüssel ist kein Geheimnis. IndexNow verlangt, dass er unter
 * /<schlüssel>.txt öffentlich abrufbar ist; daran erkennt der Dienst, dass die
 * Meldung vom Betreiber der Domain kommt.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

import { articlePath } from '../../src/features/editorial/paths.ts';

export const INDEXNOW_SCHLUESSEL = '38ba6a985d940de4a0373bdd03cd8368';
const UEBERSICHTEN = ['/de-de/', '/de-de/blog/', '/de-de/tierarztkosten/'] as const;
const ARTIKEL = /^src\/content\/ratgeber\/[a-z0-9-]+\.md$/;

export interface ArtikelOrt {
  readonly section: 'guide' | 'blog';
  readonly slug: string;
}

export function artikelOrt(frontmatter: string): ArtikelOrt | null {
  const slug = /^slug:\s*"([a-z0-9-]+)"/m.exec(frontmatter)?.[1];
  if (slug === undefined) return null;
  const section = /^section:\s*"blog"/m.test(frontmatter) ? 'blog' : 'guide';
  return { section, slug };
}

export function urlsZuMelden(
  geaenderteDateien: readonly string[],
  leseArtikel: (datei: string) => ArtikelOrt | null,
  sitemap: ReadonlySet<string>,
  seite: string,
): string[] {
  const pfade = new Set<string>();
  for (const datei of geaenderteDateien) {
    if (!ARTIKEL.test(datei)) continue;
    const ort = leseArtikel(datei);
    if (ort !== null) pfade.add(articlePath(ort));
  }
  if (pfade.size > 0) for (const pfad of UEBERSICHTEN) pfade.add(pfad);
  return [...pfade]
    .map((pfad) => new URL(pfad, seite).toString())
    .filter((url) => sitemap.has(url));
}

async function main(): Promise<void> {
  const seite = process.env.SEITE ?? 'https://deinhaustierportal.de';
  const vorher = process.env.VORHER ?? '';
  const nachher = process.env.NACHHER ?? 'HEAD';
  if (!/^[0-9a-f]{40}$/.test(vorher) || /^0+$/.test(vorher)) {
    console.log('Kein Vergleichsstand; nichts zu melden.');
    return;
  }
  const dateien = execFileSync('git', ['diff', '--name-only', vorher, nachher], {
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean);
  const antwort = await fetch(new URL('/sitemap.xml', seite));
  if (!antwort.ok) throw new Error(`Sitemap nicht abrufbar: ${antwort.status}`);
  const sitemap = new Set(
    [...(await antwort.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((treffer) => treffer[1]!),
  );
  const urls = urlsZuMelden(
    dateien,
    (datei) => (existsSync(datei) ? artikelOrt(readFileSync(datei, 'utf8')) : null),
    sitemap,
    seite,
  );
  if (urls.length === 0) {
    console.log('Keine geänderten, indexierbaren Artikel.');
    return;
  }
  const host = new URL(seite).host;
  const meldung = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host,
      key: INDEXNOW_SCHLUESSEL,
      keyLocation: `https://${host}/${INDEXNOW_SCHLUESSEL}.txt`,
      urlList: urls,
    }),
  });
  console.log(`IndexNow: ${meldung.status} für ${urls.length} URLs`);
  for (const url of urls) console.log(`  ${url}`);
  if (meldung.status >= 400) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
