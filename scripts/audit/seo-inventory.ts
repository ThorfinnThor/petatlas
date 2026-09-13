/**
 * Erzeugt das URL-Inventar aus dem tatsächlich gebauten HTML.
 *
 * Der Bericht zählt eingehende Links aus allen gebauten Seiten, liest
 * Canonical und Robots aus dem Output und berücksichtigt die Cloudflare-
 * Redirectregeln. Dadurch beschreibt die CSV die ausgelieferte Vorschau
 * statt einer zweiten, manuell gepflegten URL-Liste.
 *
 * Ausführen: `npm run audit:seo-inventory`
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { leseKopf, nichtIndexierbar } from '../../src/lib/html-head.ts';
import { leseWeiterleitungen } from '../checks/seo.ts';
import { sammleSeiten, type Seite } from '../publish/sitemap.ts';

const OUT_DIR = 'dist';
const BASIS = 'https://wauandmiau.de';
const ZIEL = 'docs/reviews/seo-url-inventory-2026-09-13.csv';

type Seitentyp =
  | 'Root-Redirect'
  | 'Tierarzt-Ortsseite'
  | 'Kostenübersicht'
  | 'GOT-Leistungsseite'
  | 'GOT-Gruppe'
  | 'GOT-Katalog'
  | 'Reiseübersicht'
  | 'Reiseland-Seite';

interface Bestand {
  readonly pfad: string;
  readonly typ: Seitentyp;
  readonly seite: Seite | null;
}

function seitentyp(pfad: string): Seitentyp | null {
  if (pfad === '/') return 'Root-Redirect';
  if (/^\/de-de\/tierarzt-karte\/[^/]+\/$/.test(pfad)) return 'Tierarzt-Ortsseite';
  if (pfad === '/de-de/tierarztkosten/') return 'Kostenübersicht';
  if (/^\/de-de\/tierarztkosten\/gruppe\/[^/]+\/$/.test(pfad)) return 'GOT-Gruppe';
  if (pfad === '/de-de/tierarztkosten/katalog/') return 'GOT-Katalog';
  if (/^\/de-de\/tierarztkosten\/\d+-[^/]+\/$/.test(pfad)) return 'GOT-Leistungsseite';
  if (pfad === '/de-de/reisecheck/') return 'Reiseübersicht';
  if (/^\/de-de\/reisecheck\/[^/]+\/$/.test(pfad)) return 'Reiseland-Seite';
  return null;
}

function normalisierePfad(href: string): string | null {
  if (
    href === '' ||
    href.startsWith('#') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('javascript:')
  ) {
    return null;
  }
  let url: URL;
  try {
    url = new URL(href, BASIS);
  } catch {
    return null;
  }
  if (url.origin !== BASIS) return null;
  const pfad = url.pathname;
  if (pfad === '/') return '/';
  if (/\.[a-z0-9]+$/i.test(pfad)) return pfad;
  return pfad.endsWith('/') ? pfad : `${pfad}/`;
}

function eingehendeLinks(seiten: readonly Seite[]): ReadonlyMap<string, readonly string[]> {
  const quellen = new Map<string, Set<string>>();
  for (const seite of seiten) {
    const html = readFileSync(seite.datei, 'utf8');
    const ziele = new Set(
      [...html.matchAll(/<a\b[^>]+href=["']([^"']+)["']/gi)]
        .map((treffer) => normalisierePfad(treffer[1] ?? ''))
        .filter((pfad): pfad is string => pfad !== null),
    );
    for (const ziel of ziele) {
      const bisher = quellen.get(ziel) ?? new Set<string>();
      bisher.add(seite.pfad);
      quellen.set(ziel, bisher);
    }
  }
  return new Map(
    [...quellen.entries()].map(([ziel, herkunft]) => [ziel, [...herkunft].sort()] as const),
  );
}

function csvWert(wert: string | number): string {
  const text = String(wert);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function empfehlung(typ: Seitentyp, reviewStatus: string): string {
  if (typ === 'Root-Redirect') return 'behalten';
  if (typ === 'Tierarzt-Ortsseite') return 'behalten';
  if (typ.startsWith('GOT-') || typ === 'Kostenübersicht') {
    return reviewStatus === 'approved' ? 'behalten' : 'verbessern: fachliche Freigabe abschließen';
  }
  return reviewStatus === 'approved' ? 'behalten' : 'verbessern: Länderregeln fachlich freigeben';
}

function eigenstaendigerNutzen(typ: Seitentyp): string {
  if (typ === 'Root-Redirect') return 'nicht anwendbar';
  if (typ === 'Reiseübersicht' || typ === 'Reiseland-Seite') return 'teilweise';
  return 'ja';
}

function main(): number {
  const seiten = sammleSeiten(OUT_DIR);
  if (seiten.length === 0) {
    console.error('Kein Build vorhanden: erst `npm run build:app` ausführen.');
    return 1;
  }
  const nachPfad = new Map(seiten.map((seite) => [seite.pfad, seite] as const));
  const bestand: Bestand[] = seiten
    .map((seite): Bestand | null => {
      const typ = seitentyp(seite.pfad);
      return typ === null ? null : { pfad: seite.pfad, typ, seite };
    })
    .filter((eintrag): eintrag is Bestand => eintrag !== null);

  if (!bestand.some((eintrag) => eintrag.pfad === '/')) {
    bestand.push({ pfad: '/', typ: 'Root-Redirect', seite: nachPfad.get('/') ?? null });
  }
  bestand.sort((a, b) => (a.pfad < b.pfad ? -1 : 1));

  const redirectsPfad = join(OUT_DIR, '_redirects');
  const redirects = existsSync(redirectsPfad)
    ? leseWeiterleitungen(readFileSync(redirectsPfad, 'utf8'))
    : [];
  const rootRedirect = redirects.find((regel) => regel.quelle === '/');
  const sitemapPfad = join(OUT_DIR, 'sitemap.xml');
  const sitemap = existsSync(sitemapPfad) ? readFileSync(sitemapPfad, 'utf8') : '';
  const linkquellen = eingehendeLinks(seiten);

  const kopfzeile = [
    'URL',
    'Seitentyp',
    'HTTP Status',
    'indexierbar',
    'Canonical',
    'in Sitemap',
    'interne Links (Quellseiten)',
    'interne Linkquellen',
    'Daten vorhanden',
    'eigenständiger Nutzen',
    'Reviewstatus',
    'letzte Quellenprüfung',
    'Empfehlung',
  ];

  const zeilen = bestand.map(({ pfad, typ, seite }) => {
    const html = seite === null ? '' : readFileSync(seite.datei, 'utf8');
    const kopf = html === '' ? null : leseKopf(html);
    const reviewStatus =
      /data-review-status=["'](draft|pending|approved)["']/i.exec(html)?.[1] ??
      (typ === 'Tierarzt-Ortsseite' ? 'nicht erforderlich' : 'kein Status');
    const letztePruefung =
      /data-last-verified-at=["'](\d{4}-\d{2}-\d{2})["']/i.exec(html)?.[1] ?? '';
    const herkunft = linkquellen.get(pfad) ?? [];
    const canonical =
      typ === 'Root-Redirect'
        ? new URL(rootRedirect?.ziel ?? '', BASIS).toString()
        : (kopf?.canonical ?? '');
    const status = typ === 'Root-Redirect' ? (rootRedirect?.status ?? 200) : 200;
    const istIndexierbar = kopf !== null && !nichtIndexierbar(kopf);
    const inSitemap = sitemap.includes(`<loc>${new URL(pfad, BASIS).toString()}</loc>`);

    return [
      new URL(pfad, BASIS).toString(),
      typ,
      status,
      istIndexierbar ? 'ja' : 'nein',
      canonical,
      inSitemap ? 'ja' : 'nein',
      herkunft.length,
      herkunft.join(' | '),
      typ === 'Root-Redirect' ? 'nicht anwendbar' : 'ja',
      eigenstaendigerNutzen(typ),
      reviewStatus,
      letztePruefung,
      empfehlung(typ, reviewStatus),
    ]
      .map(csvWert)
      .join(',');
  });

  mkdirSync(dirname(ZIEL), { recursive: true });
  writeFileSync(ZIEL, [kopfzeile.map(csvWert).join(','), ...zeilen, ''].join('\n'), 'utf8');

  const zaehler = new Map<Seitentyp, number>();
  for (const eintrag of bestand) zaehler.set(eintrag.typ, (zaehler.get(eintrag.typ) ?? 0) + 1);
  console.log(`SEO-URL-Inventar geschrieben: ${bestand.length} Zeilen in ${ZIEL}.`);
  for (const [typ, anzahl] of [...zaehler.entries()].sort()) console.log(`  ${typ}: ${anzahl}`);
  return 0;
}

process.exit(main());
