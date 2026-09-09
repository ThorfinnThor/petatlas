/**
 * Interne Verweise im Buildoutput prüfen.
 *
 * Der Plan nennt `npm run check:links` unter den vorgesehenen Befehlen
 * (Abschnitt 13.2); er fehlte bis zum 09.09.2026. Diese Prüfung schließt ihn.
 *
 * Geprüft wird **nur, was im Haus liegt**: jeder interne Verweis muss auf
 * eine Datei zeigen, die tatsächlich ausgeliefert wird. Externe Adressen
 * werden **nicht** abgerufen — ein Prüflauf, der bei jedem Commit fremde
 * Server anfragt, ist weder höflich noch verlässlich, und ein 200 von heute
 * sagt nichts über morgen. Fremde Adressen beobachtet stattdessen
 * `scripts/monitor/source-drift.ts`, gezielt und selten.
 *
 * Ein toter interner Verweis ist kein Schönheitsfehler: er führt auf eine
 * 404-Seite, und der Leser hält das für ein Ende des Angebots.
 *
 * Ausführen: `npm run check:links`
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, posix, relative, sep } from 'node:path';

export interface Fund {
  readonly datei: string;
  readonly ziel: string;
  readonly problem: string;
}

/** Alle Dateien unter einem Verzeichnis, rekursiv. */
export function dateien(wurzel: string): readonly string[] {
  if (!existsSync(wurzel)) return [];
  const gefunden: string[] = [];
  const lauf = (verzeichnis: string): void => {
    for (const eintrag of readdirSync(verzeichnis)) {
      const pfad = join(verzeichnis, eintrag);
      if (statSync(pfad).isDirectory()) lauf(pfad);
      else gefunden.push(pfad);
    }
  };
  lauf(wurzel);
  return gefunden;
}

/** Verweise, die auf die eigene Auslieferung zeigen. */
export function interneZiele(html: string): readonly string[] {
  const ziele: string[] = [];
  for (const treffer of html.matchAll(/\s(?:href|src)=["']([^"']+)["']/gi)) {
    const ziel = treffer[1] ?? '';
    // Fremde Adressen, Anker, Mailto, Telefon und Daten-URIs sind hier nicht
    // gemeint.
    if (!ziel.startsWith('/')) continue;
    if (ziel.startsWith('//')) continue;
    ziele.push(ziel);
  }
  return ziele;
}

/**
 * Löst einen Verweis auf eine ausgelieferte Datei auf.
 *
 * `/de-de/` meint `de-de/index.html` — so baut Astro mit
 * `build.format: 'directory'`. Ein Verweis auf `/de-de` ohne Schrägstrich
 * wird **nicht** stillschweigend ergänzt: die Auslieferung leitet zwar um,
 * aber ein Verweis, der erst über eine Umleitung ankommt, ist einer zu viel.
 */
export function loeseAuf(wurzel: string, ziel: string): string | null {
  const ohneFragment = ziel.split('#')[0]?.split('?')[0] ?? '';
  if (ohneFragment === '') return null;
  const relativ = ohneFragment.replace(/^\//, '');
  const kandidaten = ohneFragment.endsWith('/') ? [posix.join(relativ, 'index.html')] : [relativ];
  for (const kandidat of kandidaten) {
    const pfad = join(wurzel, ...kandidat.split('/'));
    if (existsSync(pfad) && statSync(pfad).isFile()) return kandidat;
  }
  return null;
}

export function pruefeVerzeichnis(wurzel: string): Fund[] {
  const funde: Fund[] = [];
  for (const datei of dateien(wurzel)) {
    if (!datei.endsWith('.html')) continue;
    const relativ = relative(wurzel, datei).split(sep).join('/');
    const html = readFileSync(datei, 'utf8');
    const gesehen = new Set<string>();
    for (const ziel of interneZiele(html)) {
      if (gesehen.has(ziel)) continue;
      gesehen.add(ziel);
      if (loeseAuf(wurzel, ziel) !== null) continue;
      funde.push({
        datei: relativ,
        ziel,
        problem: ziel.endsWith('/')
          ? 'Kein index.html unter diesem Pfad.'
          : 'Keine Datei unter diesem Pfad. Fehlt der abschließende Schrägstrich?',
      });
    }
  }
  return funde;
}

function main(): number {
  const wurzel = 'dist';
  const alle = dateien(wurzel);
  if (alle.length === 0) {
    console.error('Kein Build vorhanden: erst `npm run build:site`, dann diese Prüfung.');
    return 2;
  }

  const funde = pruefeVerzeichnis(wurzel);
  for (const fund of funde) {
    console.error(`✗ ${fund.datei} → ${fund.ziel}: ${fund.problem}`);
  }
  if (funde.length > 0) {
    console.error(`\n${funde.length} toter interner Verweis(e).`);
    return 1;
  }
  const seiten = alle.filter((datei) => datei.endsWith('.html')).length;
  console.log(
    `Verweisprüfung: ${seiten} Seiten, kein toter interner Verweis. ` +
      'Fremde Adressen werden hier nicht abgerufen (siehe scripts/monitor/source-drift.ts).',
  );
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
