/**
 * M07-03 — Statische HTTP-Header.
 *
 * Cloudflare Static Assets liest `_headers` aus dem Ausgabeverzeichnis. Die
 * Datei wird hier erzeugt statt von Hand gepflegt, damit sie zu dem passt,
 * was der Build tatsächlich ausliefert.
 *
 * Grundhaltung: möglichst wenig erlauben. Der Startumfang lädt nichts von
 * Dritten, führt kein Inline-Skript aus und bettet nichts ein. Die Content
 * Security Policy sagt das ausdrücklich, statt es nur zu hoffen.
 *
 * Ausführen: `npm run build:headers` (läuft in `build:site` mit).
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { TILES } from '../src/features/map/tiles.ts';

const ZIEL_VERZEICHNIS = 'dist';

/**
 * Content Security Policy.
 *
 * `img-src` erlaubt zusätzlich den konfigurierten Kachelhost. Die Kacheln
 * werden erst nach einem Klick geladen; die Erlaubnis in der Policy ist
 * kein Vorabladen.
 *
 * `script-src 'self'` reicht, weil alle Skripte als eigene Dateien
 * ausgeliefert werden — deshalb liegt die Suchlogik in `public/` und nicht
 * inline im HTML.
 *
 * Kommt später die Karte hinzu, brauchen Kacheln einen eigenen Eintrag. Das
 * ist dann eine bewusste Erweiterung mit Datenschutzprüfung, kein stilles
 * Aufweichen.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  // Astro schreibt komponentenbezogene Styles in <style>-Elemente.
  "style-src 'self' 'unsafe-inline'",
  // Kartenkacheln kommen von einem fremden Host. Das ist eine bewusste
  // Erweiterung für genau diesen Zweck, kein allgemeines Aufweichen: der
  // Host steht in config/tiles.json und nirgends sonst.
  `img-src 'self' data: ${TILES.hosts.join(' ')}`,
  "font-src 'self'",
  // Der Pagefind-Index liegt auf derselben Herkunft; nichts geht nach außen.
  "connect-src 'self'",
  "form-action 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ');

const GRUNDHEADER = [
  `Content-Security-Policy: ${CSP}`,
  'X-Content-Type-Options: nosniff',
  'Referrer-Policy: strict-origin-when-cross-origin',
  // Nichts davon wird gebraucht; alles bleibt aus.
  'Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()',
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
    '/data/v1/*',
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
