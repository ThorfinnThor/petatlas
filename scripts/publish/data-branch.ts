/**
 * M17-01 — Daten in einen eigenen Branch veröffentlichen.
 *
 * Die offenen Datendateien sollen abrufbar sein, ohne dass jeder Datenlauf
 * einen Commit in `main` erzeugt. Sie gehen deshalb in einen eigenen Branch
 * (`data-live`), und dieser Branch enthält **ausschließlich Daten**.
 *
 * Vier Regeln, die das absichern:
 *
 * 1. **Allowlist statt Blocklist.** Aufgenommen wird nur, was einem
 *    erlaubten Muster entspricht — `data/v1/**` als JSON oder Textdatei.
 *    Alles andere fällt heraus, auch wenn niemand daran gedacht hat.
 * 2. **Kein Code.** Eine `.js`, `.ts`, `.astro` oder `.sh` im Datenbaum ist
 *    kein Versehen, das man wegkonfiguriert, sondern ein Abbruchgrund.
 * 3. **Kein Secret.** Jede Datei läuft durch denselben Audit wie `dist`.
 * 4. **Nie nach `main`.** Der Zielbranch wird geprüft; `main` und `master`
 *    sind ausgeschlossen, egal was jemand übergibt.
 *
 * Ausführen: `npm run publish:data -- --out .work/data-branch`
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

import { scanContent } from '../checks/secrets.ts';

/** Quelle der zu veröffentlichenden Dateien. */
export const DATEN_WURZEL = 'dist/data';

/** Zielbranch. Er enthält nur Daten und wird nie gemergt. */
export const DATEN_BRANCH = 'data-live';

/** Branches, in die dieser Publisher niemals schreibt. */
export const VERBOTENE_BRANCHES: readonly string[] = ['main', 'master', 'HEAD'];

/** Erlaubte Pfade, relativ zur Wurzel des Datenbaums. */
export const ERLAUBTE_MUSTER: readonly RegExp[] = [
  // Grossbuchstaben sind zugelassen, weil der Lizenzhinweis LICENSE.txt heisst;
  // aufgefallen ist das beim ersten Lauf gegen echte Daten.
  /^v\d+\/[A-Za-z0-9/_.-]+\.json$/,
  /^v\d+\/[A-Za-z0-9/_.-]+\.txt$/,
];

/** Endungen, die im Datenbaum nichts zu suchen haben. */
export const VERBOTENE_ENDUNGEN: readonly string[] = [
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.astro',
  '.sh',
  '.env',
  '.pem',
  '.key',
  '.html',
  '.map',
];

export interface Befund {
  readonly datei: string;
  readonly grund: string;
}

export interface PruefErgebnis {
  readonly erlaubt: readonly string[];
  readonly abgelehnt: readonly Befund[];
  readonly bytes: number;
}

/** Alle Dateien unterhalb eines Verzeichnisses, mit Pfad relativ dazu. */
export function dateienUnter(wurzel: string): readonly string[] {
  if (!existsSync(wurzel)) return [];
  const gefunden: string[] = [];
  const gehe = (pfad: string): void => {
    for (const eintrag of readdirSync(pfad, { withFileTypes: true })) {
      const voll = join(pfad, eintrag.name);
      if (eintrag.isDirectory()) gehe(voll);
      else gefunden.push(relative(wurzel, voll).split(sep).join('/'));
    }
  };
  gehe(wurzel);
  return gefunden.sort();
}

/**
 * Prüft den Datenbaum.
 *
 * Ein abgelehnter Fund ist kein Filter, sondern ein Befund: der Aufrufer
 * bricht ab, statt die Datei stillschweigend wegzulassen. Sonst fiele nicht
 * auf, dass im Datenbaum etwas liegt, das dort nicht hingehört.
 */
export function pruefeDatenbaum(wurzel: string = DATEN_WURZEL): PruefErgebnis {
  const erlaubt: string[] = [];
  const abgelehnt: Befund[] = [];
  let bytes = 0;

  for (const datei of dateienUnter(wurzel)) {
    const endung = datei.slice(datei.lastIndexOf('.'));
    if (VERBOTENE_ENDUNGEN.includes(endung)) {
      abgelehnt.push({ datei, grund: `Endung ${endung} gehört nicht in den Datenbranch.` });
      continue;
    }
    if (!ERLAUBTE_MUSTER.some((muster) => muster.test(datei))) {
      abgelehnt.push({ datei, grund: 'Pfad entspricht keinem erlaubten Muster.' });
      continue;
    }

    const inhalt = readFileSync(join(wurzel, datei), 'utf8');
    const funde = scanContent(datei, inhalt);
    if (funde.length > 0) {
      abgelehnt.push({
        datei,
        grund: `Secret-Audit meldet ${funde.length} Fund(e): ${funde[0]?.ruleId ?? 'unbekannt'}.`,
      });
      continue;
    }

    erlaubt.push(datei);
    bytes += statSync(join(wurzel, datei)).size;
  }

  return { erlaubt, abgelehnt, bytes };
}

export class DataBranchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataBranchError';
  }
}

/** Der Zielbranch darf kein Codebranch sein. */
export function pruefeBranch(branch: string): void {
  if (VERBOTENE_BRANCHES.includes(branch)) {
    throw new DataBranchError(
      `In "${branch}" wird kein Datenstand geschrieben. Der Datenbranch ist "${DATEN_BRANCH}".`,
    );
  }
  if (!/^[a-z][a-z0-9-]{1,40}$/.test(branch)) {
    throw new DataBranchError(`"${branch}" ist kein zulässiger Branchname.`);
  }
}

export interface AusgabeErgebnis {
  readonly dateien: number;
  readonly bytes: number;
  readonly ziel: string;
}

/**
 * Schreibt den geprüften Datenbaum in ein Ausgabeverzeichnis.
 *
 * Atomar heißt hier: erst prüfen, dann ein leeres Zielverzeichnis anlegen,
 * dann alles schreiben. Ein Abbruch mittendrin hinterlässt kein halb
 * gefülltes Ziel, das jemand versehentlich committet.
 */
export function schreibeDatenbaum(
  wurzel: string = DATEN_WURZEL,
  ziel = '.work/data-branch',
  branch: string = DATEN_BRANCH,
): AusgabeErgebnis {
  pruefeBranch(branch);

  const geprueft = pruefeDatenbaum(wurzel);
  if (geprueft.abgelehnt.length > 0) {
    const liste = geprueft.abgelehnt
      .slice(0, 5)
      .map((befund) => `  ${befund.datei}: ${befund.grund}`)
      .join('\n');
    throw new DataBranchError(
      `${geprueft.abgelehnt.length} Datei(en) gehören nicht in den Datenbranch:\n${liste}`,
    );
  }
  if (geprueft.erlaubt.length === 0) {
    throw new DataBranchError('Der Datenbaum ist leer; es wird nichts veröffentlicht.');
  }

  rmSync(ziel, { recursive: true, force: true });
  for (const datei of geprueft.erlaubt) {
    const zielPfad = join(ziel, 'data', datei);
    mkdirSync(dirname(zielPfad), { recursive: true });
    writeFileSync(zielPfad, readFileSync(join(wurzel, datei)));
  }

  // Eine Liesmich im Datenbranch, damit niemand ihn für einen Codebranch hält.
  writeFileSync(
    join(ziel, 'README.md'),
    [
      '# Datenbranch',
      '',
      `Dieser Branch (\`${branch}\`) enthält **ausschließlich** die offen ausgelieferten,`,
      'normalisierten Datendateien und ihr Manifest. Kein Code, keine Konfiguration,',
      'keine Secrets — der Publisher lehnt alles andere ab, statt es wegzulassen.',
      '',
      'Er wird nicht nach `main` gemergt. Erzeugt von `scripts/publish/data-branch.ts`.',
      '',
    ].join('\n'),
    'utf8',
  );

  return { dateien: geprueft.erlaubt.length, bytes: geprueft.bytes, ziel };
}

function main(): number {
  const zielIndex = process.argv.indexOf('--out');
  const ziel =
    zielIndex === -1 ? '.work/data-branch' : (process.argv[zielIndex + 1] ?? '.work/data-branch');

  try {
    const ergebnis = schreibeDatenbaum(DATEN_WURZEL, ziel);
    console.log(
      `Datenbranch vorbereitet: ${ergebnis.dateien} Datei(en), ` +
        `${(ergebnis.bytes / 1024 / 1024).toFixed(1)} MiB in ${ergebnis.ziel}.`,
    );
    return 0;
  } catch (fehler) {
    console.error((fehler as Error).message);
    console.error('Es wurde nichts veröffentlicht.');
    return 1;
  }
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
