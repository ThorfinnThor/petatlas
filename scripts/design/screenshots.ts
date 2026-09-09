/**
 * M21-06 — Bildschirmmappe nach Designvertrag Abschnitt 57.
 *
 * Erzeugt je Hauptseite zwei Aufnahmen — Telefon und Desktop — aus dem
 * tatsächlichen Build. Nicht aus dem Entwicklungsserver: was hier zu sehen
 * ist, soll das sein, was ausgeliefert würde.
 *
 * Die Bilder landen unter `reports/` und werden **nicht** versioniert (siehe
 * `.gitignore`): sie sind ein Prüfmittel, kein Inhalt. Was aus ihnen folgt,
 * steht in `docs/DESIGN_REVIEW.md` — mit Commit und Viewport, damit später
 * nachvollziehbar bleibt, worauf sich ein Befund bezog.
 *
 * Abschnitt 57 verlangt außerdem: keine Aufnahme gilt als geprüft, weil sie
 * entstanden ist. Dieses Skript prüft nichts. Es macht Bilder.
 *
 * Ausführen: `npm run design:screenshots`
 */
import { spawn } from 'node:child_process';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { chromium, type Browser } from '@playwright/test';

const PORT = 4325;
const ZIEL = 'reports/screenshots';

/** Abschnitt 57: die Seiten, die es gibt. Fehlende Features bleiben weg. */
const SEITEN: readonly { readonly name: string; readonly pfad: string }[] = [
  { name: 'home', pfad: '/de-de/' },
  { name: 'costs', pfad: '/de-de/tierarztkosten/' },
  { name: 'costs-katalog', pfad: '/de-de/tierarztkosten/katalog/' },
  { name: 'map', pfad: '/de-de/tierarzt-karte/' },
  { name: 'map-stadt', pfad: '/de-de/tierarzt-karte/hamburg/' },
  { name: 'travel', pfad: '/de-de/reisecheck/' },
  { name: 'catalog', pfad: '/de-de/angebote/' },
  { name: 'care', pfad: '/de-de/pflege/' },
  { name: 'sources', pfad: '/de-de/quellen/' },
  { name: 'datenstand', pfad: '/de-de/datenstand/' },
];

const VIEWPORTS = [
  { name: 'mobile', breite: 390, hoehe: 844 },
  { name: 'desktop', breite: 1440, hoehe: 900 },
] as const;

function commit(): string {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return 'unbekannt';
  }
}

async function warteAufServer(url: string, sekunden = 90): Promise<void> {
  for (let versuch = 0; versuch < sekunden * 2; versuch += 1) {
    try {
      const antwort = await fetch(url);
      if (antwort.ok) return;
    } catch {
      // noch nicht da
    }
    await new Promise((weiter) => setTimeout(weiter, 500));
  }
  throw new Error(`Vorschau unter ${url} kam nicht hoch.`);
}

async function aufnehmen(browser: Browser, basis: string): Promise<string[]> {
  const entstanden: string[] = [];
  for (const viewport of VIEWPORTS) {
    const kontext = await browser.newContext({
      viewport: { width: viewport.breite, height: viewport.hoehe },
      deviceScaleFactor: 1,
      // Abschnitt 40: Bewegung aus, damit zwei Läufe vergleichbar bleiben.
      reducedMotion: 'reduce',
    });
    const seite = await kontext.newPage();
    for (const eintrag of SEITEN) {
      const antwort = await seite.goto(`${basis}${eintrag.pfad}`, { waitUntil: 'load' });
      if (antwort === null || !antwort.ok()) {
        console.warn(`  ${eintrag.pfad}: ${antwort?.status() ?? 'keine Antwort'} — übersprungen.`);
        continue;
      }
      const datei = join(ZIEL, `${eintrag.name}-${viewport.name}.png`);
      await seite.screenshot({ path: datei, fullPage: true });
      entstanden.push(datei);
      console.log(`  ${datei}`);
    }
    await kontext.close();
  }
  return entstanden;
}

async function main(): Promise<number> {
  mkdirSync(ZIEL, { recursive: true });
  const basis = `http://localhost:${PORT}`;

  const server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--ignore-lock'], {
    env: {
      ...process.env,
      ASTRO_PREVIEW_BACKGROUND: 'false',
      ENABLE_FEATURES: 'costs,map,travel,commerce,care,toys,food,profile',
    },
    stdio: 'ignore',
  });

  try {
    await warteAufServer(`${basis}/de-de/`);
    const browser = await chromium.launch();
    try {
      const entstanden = await aufnehmen(browser, basis);
      const stand = commit();
      writeFileSync(
        join(ZIEL, 'mappe.md'),
        [
          '# Bildschirmmappe',
          '',
          `Commit: \`${stand}\``,
          `Viewports: ${VIEWPORTS.map((v) => `${v.name} ${v.breite}x${v.hoehe}`).join(', ')}`,
          `Aufnahmen: ${entstanden.length}`,
          '',
          'Diese Datei listet nur, was aufgenommen wurde. Die Befunde stehen in',
          '`docs/DESIGN_REVIEW.md`; eine Aufnahme gilt nicht als geprüft, weil sie existiert.',
          '',
          ...entstanden.map((datei) => `- ${datei}`),
          '',
        ].join('\n'),
        'utf8',
      );
      console.log(`\n${entstanden.length} Aufnahme(n), Commit ${stand}.`);
      return 0;
    } finally {
      await browser.close();
    }
  } finally {
    server.kill();
  }
}

main()
  .then((code) => process.exit(code))
  .catch((fehler: unknown) => {
    console.error(`Bildschirmmappe nicht erzeugt: ${(fehler as Error).message}`);
    process.exit(1);
  });
