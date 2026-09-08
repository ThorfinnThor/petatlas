/**
 * M17-05 — Rauchprobe.
 *
 * Zwei Fragen, mehr nicht:
 *
 * 1. **Ist da etwas?** Die Seiten, die es geben muss, gibt es, sie sind
 *    nicht leer und tragen ihre Kennzeichen.
 * 2. **Ist es noch aktuell?** Der Gesundheitsstand nennt kein veraltetes
 *    oder unbekanntes Alter, und er ist selbst nicht steinalt.
 *
 * Zwei Betriebsarten:
 *
 * - `--dist <verzeichnis>` prüft ein gebautes Verzeichnis. Das geht ohne
 *   Deployment und fängt genau den Fall, der ohne Deployment auftritt:
 *   Daten, die im Repository liegen und dort altern.
 * - `--base <adresse>` prüft eine ausgelieferte Website über HTTP. Das
 *   beantwortet zusätzlich, ob überhaupt etwas antwortet.
 *
 * Was diese Datei **nicht** ist: eine Verfügbarkeitszusage. Sie läuft, wenn
 * ein Zeitplan sie startet, und der kann ausfallen. Was das bedeutet, steht
 * in `docs/MONITORING.md`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ursachenkette } from '../ingest/types.ts';

/** Seiten, die es geben muss, mit einem Kennzeichen, das darauf stehen muss. */
export const PFLICHTSEITEN: readonly { readonly pfad: string; readonly marker: string }[] = [
  { pfad: '/de-de/', marker: '<h1' },
  { pfad: '/de-de/datenstand/', marker: 'Gesamtstand' },
  { pfad: '/de-de/quellen/', marker: 'Quelle' },
  { pfad: '/de-de/impressum/', marker: 'Impressum' },
  { pfad: '/de-de/datenschutz/', marker: 'Datenschutz' },
];

export const HEALTH_PFAD = '/data/v1/health.json';
export const MANIFEST_PFAD = '/data/v1/manifest.json';

/**
 * Wie alt ein Gesundheitsstand höchstens sein darf. Ein statisches
 * Deployment bleibt stehen, wenn ein Build fehlschlägt — dann altert die
 * Datei, ohne dass jemand etwas merkt.
 */
export const MAX_BUILD_ALTER_STUNDEN = 48;

export type Befund = 'ok' | 'fehler' | 'warnung';

export interface Pruefung {
  readonly name: string;
  readonly befund: Befund;
  readonly meldung: string;
}

export interface SmokeErgebnis {
  readonly pruefungen: readonly Pruefung[];
  readonly fehler: number;
  readonly warnungen: number;
}

/** Wie eine Ressource gelesen wird — Datei oder HTTP. */
export type Leser = (pfad: string) => Promise<{ text: string; status: number } | null>;

export function dateiLeser(verzeichnis: string): Leser {
  return async (pfad: string) => {
    // Ein Verzeichnispfad wird zur index.html; das macht der Server auch.
    const relativ = pfad.endsWith('/') ? `${pfad}index.html` : pfad;
    try {
      return {
        text: readFileSync(join(verzeichnis, relativ.replace(/^\//, '')), 'utf8'),
        status: 200,
      };
    } catch {
      return null;
    }
  };
}

export function httpLeser(basis: string, fetchImpl: typeof fetch = fetch): Leser {
  return async (pfad: string) => {
    const ziel = new URL(pfad, basis);
    if (
      ziel.protocol !== 'https:' &&
      ziel.hostname !== 'localhost' &&
      ziel.hostname !== '127.0.0.1'
    ) {
      throw new Error(`Nur https ist zulässig, nicht ${ziel.protocol} (${ziel.hostname}).`);
    }
    const antwort = await fetchImpl(ziel, { signal: AbortSignal.timeout(20_000) });
    if (!antwort.ok) return { text: '', status: antwort.status };
    return { text: await antwort.text(), status: antwort.status };
  };
}

interface HealthAusschnitt {
  readonly builtAt?: unknown;
  readonly gesamt?: { readonly frische?: unknown; readonly gesperrt?: unknown };
  readonly datensaetze?: readonly {
    readonly id?: unknown;
    readonly frische?: unknown;
    readonly ausgeliefert?: unknown;
  }[];
}

export async function pruefe(
  leser: Leser,
  jetzt: string,
  optionen: { readonly maxBuildAlterStunden?: number } = {},
): Promise<SmokeErgebnis> {
  const maxAlter = optionen.maxBuildAlterStunden ?? MAX_BUILD_ALTER_STUNDEN;
  const pruefungen: Pruefung[] = [];

  const melde = (name: string, befund: Befund, meldung: string): void => {
    pruefungen.push({ name, befund, meldung });
  };

  for (const seite of PFLICHTSEITEN) {
    let inhalt: { text: string; status: number } | null;
    try {
      inhalt = await leser(seite.pfad);
    } catch (fehler) {
      melde(`Seite ${seite.pfad}`, 'fehler', `Nicht abrufbar: ${ursachenkette(fehler)}`);
      continue;
    }
    if (inhalt === null || inhalt.status !== 200) {
      melde(
        `Seite ${seite.pfad}`,
        'fehler',
        inhalt === null ? 'Fehlt.' : `Antwortet mit HTTP ${inhalt.status}.`,
      );
      continue;
    }
    if (!inhalt.text.includes(seite.marker)) {
      melde(
        `Seite ${seite.pfad}`,
        'fehler',
        `Vorhanden, aber ohne „${seite.marker}“ — die Seite ist nicht die erwartete.`,
      );
      continue;
    }
    melde(`Seite ${seite.pfad}`, 'ok', `${inhalt.text.length} Zeichen, Kennzeichen vorhanden.`);
  }

  for (const pfad of [MANIFEST_PFAD]) {
    const datei = await leser(pfad).catch(() => null);
    melde(
      `Datei ${pfad}`,
      datei === null || datei.status !== 200 ? 'fehler' : 'ok',
      datei === null || datei.status !== 200 ? 'Fehlt.' : `${datei.text.length} Zeichen.`,
    );
  }

  const gesundheit = await leser(HEALTH_PFAD).catch(() => null);
  if (gesundheit === null || gesundheit.status !== 200) {
    melde(`Datei ${HEALTH_PFAD}`, 'fehler', 'Fehlt. Ohne sie ist kein Datenstand prüfbar.');
    return zusammen(pruefungen);
  }

  let bericht: HealthAusschnitt;
  try {
    bericht = JSON.parse(gesundheit.text) as HealthAusschnitt;
  } catch (fehler) {
    melde(`Datei ${HEALTH_PFAD}`, 'fehler', `Kein lesbares JSON: ${ursachenkette(fehler)}`);
    return zusammen(pruefungen);
  }

  const gebaut = typeof bericht.builtAt === 'string' ? Date.parse(bericht.builtAt) : Number.NaN;
  const zeitpunkt = Date.parse(jetzt);
  if (Number.isNaN(gebaut) || Number.isNaN(zeitpunkt)) {
    melde('Bauzeitpunkt', 'fehler', 'Der Gesundheitsstand nennt keinen lesbaren Bauzeitpunkt.');
  } else {
    const stunden = (zeitpunkt - gebaut) / 3_600_000;
    if (stunden > maxAlter) {
      melde(
        'Bauzeitpunkt',
        'fehler',
        `Der letzte Build ist ${Math.round(stunden)} Stunden alt (Grenze ${maxAlter}). Ein stehen gebliebenes Deployment fällt sonst nicht auf.`,
      );
    } else {
      melde('Bauzeitpunkt', 'ok', `Der letzte Build ist ${Math.round(stunden)} Stunden alt.`);
    }
  }

  const gesperrt = Array.isArray(bericht.gesamt?.gesperrt) ? bericht.gesamt.gesperrt : [];
  const veraltete = (bericht.datensaetze ?? [])
    .filter((eintrag) => eintrag.ausgeliefert === true && eintrag.frische === 'veraltet')
    .map((eintrag) => String(eintrag.id));
  const unbekannte = (bericht.datensaetze ?? [])
    .filter((eintrag) => eintrag.ausgeliefert === true && eintrag.frische === 'unbekannt')
    .map((eintrag) => String(eintrag.id));

  melde(
    'Datenalter',
    veraltete.length > 0 ? 'fehler' : 'ok',
    veraltete.length > 0
      ? `Veraltete Datensätze: ${veraltete.join(', ')}.`
      : 'Kein ausgelieferter Datensatz ist veraltet.',
  );

  // Unbekannt ist kein Ausfall, aber auch keine Entwarnung: es heißt, dass
  // niemand das Alter kennt.
  melde(
    'Unbekannter Stand',
    unbekannte.length > 0 ? 'warnung' : 'ok',
    unbekannte.length > 0
      ? `Ohne bekanntes Alter: ${unbekannte.join(', ')}.`
      : 'Jeder ausgelieferte Datensatz nennt sein Alter.',
  );

  melde(
    'Gesperrte Datensätze',
    'ok',
    gesperrt.length === 0
      ? 'Kein Datensatz sperrt ein positives Ergebnis.'
      : `Gesperrt und damit ohne positives Ergebnis: ${(gesperrt as unknown[]).join(', ')}. Das ist ein bekannter Zustand, kein Ausfall.`,
  );

  return zusammen(pruefungen);
}

function zusammen(pruefungen: readonly Pruefung[]): SmokeErgebnis {
  return {
    pruefungen,
    fehler: pruefungen.filter((eintrag) => eintrag.befund === 'fehler').length,
    warnungen: pruefungen.filter((eintrag) => eintrag.befund === 'warnung').length,
  };
}

export function alsText(ergebnis: SmokeErgebnis): string {
  const zeichen: Record<Befund, string> = { ok: 'ok  ', fehler: 'FEHL', warnung: 'warn' };
  return ergebnis.pruefungen
    .map((eintrag) => `[${zeichen[eintrag.befund]}] ${eintrag.name}: ${eintrag.meldung}`)
    .join('\n');
}

function argument(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? null) : null;
}

async function main(): Promise<number> {
  const verzeichnis = argument('--dist');
  const basis = argument('--base');
  if (verzeichnis === null && basis === null) {
    console.error('Aufruf: node scripts/monitor/smoke.ts --dist dist | --base https://…');
    return 2;
  }

  const leser = basis !== null ? httpLeser(basis) : dateiLeser(verzeichnis ?? 'dist');
  const ergebnis = await pruefe(leser, new Date().toISOString());
  console.log(alsText(ergebnis));
  console.log(
    ergebnis.fehler === 0
      ? `Rauchprobe bestanden (${ergebnis.warnungen} Warnung(en)).`
      : `Rauchprobe fehlgeschlagen: ${ergebnis.fehler} Fehler, ${ergebnis.warnungen} Warnung(en).`,
  );
  return ergebnis.fehler === 0 ? 0 : 1;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(await main());
}
