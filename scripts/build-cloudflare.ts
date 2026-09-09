/**
 * M07-04 — Buildskript für Cloudflare.
 *
 * Cloudflare baut selbst; ein grüner GitHub-Check ist **kein**
 * Deployment-Gate (OPERATIONS Abschnitt 4). Dieses Skript führt deshalb die
 * Kernprüfungen im Buildkontext erneut aus und bricht ab, bevor
 * irgendetwas ausgeliefert werden kann.
 *
 * Reihenfolge, wie in OPERATIONS festgelegt:
 *
 *   1. Konfiguration, Freigabestatus und zulässige Quellen prüfen
 *   2. Daten-Commit einmal auflösen und festhalten
 *   3. Rechte je Ausgabeform prüfen
 *   4. Vertrauliche Feeds nur im vertrauenswürdigen Kontext
 *   5. Astro bauen
 *   6. Suchindex und Header erzeugen
 *   7. Fertiges dist auditieren
 *   8. Build-Metadaten mit den exakten Eingaben schreiben
 *
 * Jeder Schritt läuft erst, wenn der vorige bestanden hat. Ein Fehler
 * beendet den Build mit Exitcode 1; Cloudflare veröffentlicht dann nichts.
 *
 * Ausführen: `npm run build:cloudflare`
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { resolveBuildConfig } from '../config/build.ts';
import { allSources, pendingSources } from '../src/domain/source-registry.ts';

const SCHRITTE: { name: string; befehl: string; argumente: string[] }[] = [];

function fuehreAus(name: string, befehl: string, argumente: readonly string[]): void {
  console.log(`\n▸ ${name}`);
  try {
    execFileSync(befehl, argumente, { stdio: 'inherit' });
  } catch {
    throw new Error(`Schritt "${name}" ist fehlgeschlagen. Es wird nichts ausgeliefert.`);
  }
  SCHRITTE.push({ name, befehl, argumente: [...argumente] });
}

/** Der Commit, aus dem gebaut wird. Einmal auflösen, nicht mehrfach. */
function aufloesenGitCommit(): string | null {
  // Cloudflare stellt den Commit als Umgebungsvariable bereit; lokal kommt er
  // aus git. Ohne beides bleibt das Feld null statt geraten zu werden.
  const ausUmgebung = process.env.CF_PAGES_COMMIT_SHA ?? process.env.WORKERS_CI_COMMIT_SHA;
  if (ausUmgebung) return ausUmgebung;
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

export interface BuildInfo {
  readonly builtAt: string;
  readonly buildMode: string;
  readonly gitCommit: string | null;
  /** Fixierter Datenstand; null, solange kein data-live-Branch existiert. */
  readonly openDataRef: string | null;
  readonly nodeVersion: string;
  readonly sources: readonly {
    readonly sourceId: string;
    readonly rightsStatus: string;
    readonly licenseId: string | null;
    readonly termsHash: string | null;
  }[];
  readonly steps: readonly string[];
}

/**
 * Baut die Build-Metadaten. Als eigene Funktion, damit sie prüfbar ist, ohne
 * dass vorher ein Build gelaufen sein muss.
 */
export function erstelleBuildInfo(options: {
  buildMode: string;
  gitCommit: string | null;
  openDataRef: string | null;
  steps: readonly string[];
}): BuildInfo {
  return {
    builtAt: new Date().toISOString(),
    buildMode: options.buildMode,
    gitCommit: options.gitCommit,
    openDataRef: options.openDataRef,
    nodeVersion: process.version,
    sources: allSources().map((quelle) => ({
      sourceId: quelle.sourceId,
      rightsStatus: quelle.rights.status,
      licenseId: quelle.rights.licenseId,
      termsHash: quelle.rights.termsHash,
    })),
    steps: [...options.steps],
  };
}

function main(): number {
  console.log('Cloudflare-Build\n════════════════');

  // Schritt 1 — Konfiguration und Freigabestatus.
  // resolveBuildConfig wirft, wenn production ohne Domain, ohne
  // Betreiberangaben oder ohne dokumentierte Launch-Freigabe gebaut wird.
  const build = resolveBuildConfig();
  console.log(
    `Modus: ${build.mode}, Datenquelle: ${build.dataSource}, indexierbar: ${build.indexable}`,
  );

  if (build.mode !== 'development' && build.dataSource === 'fixtures') {
    throw new Error(
      `Modus ${build.mode} mit Fixtures: synthetische Daten dürfen nicht ausgeliefert werden.`,
    );
  }

  // Zulässige Quellen: eine ungeprüfte Quelle darf nichts beitragen.
  const offen = pendingSources();
  if (offen.length > 0 && build.mode === 'production') {
    throw new Error(
      `Ungeprüfte Quellen im Produktionsbuild: ${offen.map((q) => q.sourceId).join(', ')}.`,
    );
  }
  console.log(`Quellen: ${allSources().length} erfasst, ${offen.length} ungeprüft.`);

  // Schritt 2 — Daten-Commit einmal auflösen.
  const gitCommit = aufloesenGitCommit();
  const openDataRef = process.env.OPEN_DATA_REF?.trim() || null;
  console.log(`Commit: ${gitCommit ?? 'unbekannt'} · Datenstand: ${openDataRef ?? 'noch keiner'}`);

  // Schritt 3 — Rechte je Ausgabeform.
  fuehreAus('Rechteprüfung der Quellen', 'npm', ['run', 'check:licenses']);

  // Schritt 4 — Vertrauliche Feeds.
  // Es gibt noch keinen Partnervertrag. Ein gesetztes Feed-Secret wäre
  // deshalb ein Konfigurationsfehler und kein Grund, etwas abzurufen.
  if (process.env.AWIN_FEED_URL) {
    throw new Error(
      'AWIN_FEED_URL ist gesetzt, aber es ist kein Partnervertrag freigegeben. Build abgebrochen.',
    );
  }
  console.log('\n▸ Vertragliche Feeds: keiner freigegeben, kein Abruf.');

  // Schritt 5 und 6 — bauen, Daten, Suchindex, Sitemap, Header.
  //
  // Die Datenschritte standen hier bis zum 09.09.2026 nicht drin. Ein Build
  // allein aus dieser Datei lieferte deshalb kein `/data/v1/…` aus: Rechner,
  // Karte und Futtersuche hätten ihre Daten nicht gefunden, und die
  // Datenstandseite hätte nichts zu prüfen gehabt. Aufgefallen ist es an der
  // Rauchprobe über das gebaute Verzeichnis — genau dafür gibt es sie.
  fuehreAus('Statischer Build', 'npm', ['run', 'build']);
  fuehreAus('Gebührendaten', 'npm', ['run', 'build:fees']);
  fuehreAus('Ortsdaten', 'npm', ['run', 'build:places']);
  fuehreAus('Datenstand', 'npm', ['run', 'build:health']);
  fuehreAus('Suchindex', 'npm', ['run', 'build:search']);
  fuehreAus('Sitemap und robots.txt', 'npm', ['run', 'build:sitemap']);
  fuehreAus('Header', 'npm', ['run', 'build:headers']);

  // Schritt 7 — fertiges dist auditieren.
  fuehreAus('Secret- und Fixture-Audit über dist', 'npm', ['run', 'check:security']);

  // Schritt 8 — Build-Metadaten mit den exakten Eingaben.
  const info = erstelleBuildInfo({
    buildMode: build.mode,
    gitCommit,
    openDataRef,
    steps: SCHRITTE.map((schritt) => schritt.name),
  });

  const pfad = join('dist', 'build-info.json');
  writeFileSync(pfad, `${JSON.stringify(info, null, 2)}\n`, 'utf8');
  console.log(`\n▸ ${pfad} geschrieben.`);
  console.log(`\n✓ Build vollständig. ${SCHRITTE.length} Prüfschritte bestanden.`);
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  try {
    process.exit(main());
  } catch (fehler) {
    console.error(`\n✗ ${(fehler as Error).message}`);
    process.exit(1);
  }
}
