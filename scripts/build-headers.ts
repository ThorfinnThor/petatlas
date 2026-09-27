/**
 * M07-03 — Statische HTTP-Header.
 *
 * Cloudflare Static Assets liest `_headers` aus dem Ausgabeverzeichnis. Die
 * Datei wird hier erzeugt statt von Hand gepflegt, damit sie zu dem passt,
 * was der Build tatsächlich ausliefert.
 *
 * Grundhaltung: möglichst wenig erlauben. Externe Ursprünge werden nur für
 * klar benannte Funktionen freigegeben; Inline-Skripte und Einbettungen
 * bleiben verboten. Die Content Security Policy sagt das ausdrücklich.
 *
 * Ausführen: `npm run build:headers` (läuft in `build:site` mit).
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { TILES } from '../src/features/map/tiles.ts';
import { fressnapfBildUrspruenge } from '../src/features/commerce/fressnapf-feed.ts';

const ZIEL_VERZEICHNIS = 'dist';
const BILD_URSPRUENGE = [...TILES.hosts, ...fressnapfBildUrspruenge()];
export const CLOUDFLARE_WEB_ANALYTICS_SCRIPT =
  'https://static.cloudflareinsights.com/beacon.min.js';

/**
 * Content Security Policy.
 *
 * `img-src` erlaubt zusätzlich den konfigurierten Kachelhost. Die Kacheln
 * werden erst nach einem Klick geladen; die Erlaubnis in der Policy ist
 * kein Vorabladen.
 *
 * Pagefind lädt seinen eigenen WebAssembly-Suchindex. Dafür erlaubt die
 * Policy gezielt `wasm-unsafe-eval`; allgemeines `unsafe-eval` und
 * `unsafe-inline` bleiben verboten.
 *
 * Cloudflare fügt das Web-Analytics-Beacon am Edge in gültige HTML-Seiten ein.
 * Die Policy erlaubt genau diese eine externe Skriptdatei. Das Beacon sendet
 * bei der automatischen Einrichtung an `/cdn-cgi/rum` auf derselben Herkunft;
 * `connect-src 'self'` reicht deshalb aus.
 */
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'wasm-unsafe-eval' ${CLOUDFLARE_WEB_ANALYTICS_SCRIPT}`,
  // Astro schreibt komponentenbezogene Styles in <style>-Elemente.
  "style-src 'self' 'unsafe-inline'",
  // Kartenkacheln kommen von einem fremden Host. Das ist eine bewusste
  // Erweiterung für genau diesen Zweck, kein allgemeines Aufweichen: der
  // Host steht in config/tiles.json und nirgends sonst.
  `img-src 'self' data: ${BILD_URSPRUENGE.join(' ')}`,
  "font-src 'self'",
  // Pagefind und das automatisch injizierte RUM-Beacon senden nur an dieselbe
  // Herkunft. Für das Beacon ist das der Endpunkt `/cdn-cgi/rum`.
  "connect-src 'self'",
  // Native GET-Formulare dürfen nur innerhalb der eigenen Website absenden.
  // `none` würde auch die Startseiten-Suche blockieren.
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const GRUNDHEADER = [
  `Content-Security-Policy: ${CSP}`,
  'X-Content-Type-Options: nosniff',
  'Referrer-Policy: strict-origin-when-cross-origin',
  // Der Standortknopf braucht Geolocation auf derselben Herkunft. Der Code
  // fragt sie ausschließlich nach einem ausdrücklichen Klick ab.
  'Permissions-Policy: geolocation=(self), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
  'Cross-Origin-Opener-Policy: same-origin',
  'X-Frame-Options: DENY',
];

export function buildHeadersFile(): string {
  const zeilen: string[] = [
    '# Erzeugt von scripts/build-headers.ts. Nicht von Hand ändern.',
    '',
    '/*',
    ...GRUNDHEADER.map((header) => `  ${header}`),
    '',
    '# Dateien mit Inhalts-Hash im Namen sind unveränderlich.',
    '/data/v1/fees/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '/data/v1/places/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '# Das Manifest entscheidet, welche Chunks gelten; es darf nicht altern.',
    '/data/v1/manifest.json',
    '  Cache-Control: public, max-age=0, must-revalidate',
    '',
    '# Der Gesundheitsstand soll das Alter der Daten sagen, nicht sein eigenes.',
    '/data/v1/health.json',
    '  Cache-Control: public, max-age=0, must-revalidate',
    '',
    '/pagefind/*',
    '  Cache-Control: public, max-age=3600',
    '',
    '/_astro/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
    '# HTML wird bei jedem Deployment neu erzeugt.',
    '/*.html',
    '  Cache-Control: public, max-age=0, must-revalidate',
    '',
  ];
  return zeilen.join('\n');
}

if (import.meta.filename === process.argv[1]) {
  const pfad = join(ZIEL_VERZEICHNIS, '_headers');
  writeFileSync(pfad, buildHeadersFile(), 'utf8');
  console.log(`${pfad} geschrieben.`);
}
