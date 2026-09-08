/**
 * M17-06 — Verbrauch messen, nicht schätzen.
 *
 * Gemessen wird, was tatsächlich entsteht: wie viele Dateien ausgeliefert
 * werden, wie groß die größte ist, wie viel im Repository liegt und wie
 * groß die Git-Historie ist. Die Grenzen stehen in `config/budgets.json`
 * mit Begründung; sie sind **Designgrenzen**, keine Kostenschätzung und
 * keine Kapazitätszusage.
 *
 * Zwei Schwellen je Budget: `warnAb` ist ein Hinweis, `stoppAb` macht den
 * Lauf rot. Eine Grenze anzuheben ist eine Entscheidung, kein Nebeneffekt —
 * deshalb steht sie in einer Datei und nicht im Code.
 *
 * Ausführen: `npm run check:budgets`
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import budgetDatei from '../../config/budgets.json' with { type: 'json' };

export interface Budget {
  readonly id: string;
  readonly titel: string;
  readonly einheit: string;
  readonly warnAb: number;
  readonly stoppAb: number;
  readonly begruendung: string;
}

export const BUDGETS: readonly Budget[] = budgetDatei.budgets as Budget[];

export type BudgetBefund = 'ok' | 'warnung' | 'stopp' | 'ungemessen';

export interface Messung {
  readonly id: string;
  readonly titel: string;
  readonly wert: number | null;
  readonly einheit: string;
  readonly befund: BudgetBefund;
  readonly meldung: string;
}

const MIB = 1024 * 1024;

/** Alle Dateien unter einem Verzeichnis, rekursiv. */
export function dateien(verzeichnis: string): readonly string[] {
  if (!existsSync(verzeichnis)) return [];
  const gefunden: string[] = [];
  for (const eintrag of readdirSync(verzeichnis, { withFileTypes: true, recursive: true })) {
    if (eintrag.isFile()) gefunden.push(join(eintrag.parentPath, eintrag.name));
  }
  return gefunden;
}

export function summeBytes(pfade: readonly string[]): number {
  return pfade.reduce((summe, pfad) => summe + statSync(pfad).size, 0);
}

export function groessteDatei(pfade: readonly string[]): { pfad: string; bytes: number } | null {
  let groesste: { pfad: string; bytes: number } | null = null;
  for (const pfad of pfade) {
    const bytes = statSync(pfad).size;
    if (groesste === null || bytes > groesste.bytes) groesste = { pfad, bytes };
  }
  return groesste;
}

export function bewerteBudget(budget: Budget, wert: number | null, zusatz = ''): Messung {
  if (wert === null) {
    return {
      id: budget.id,
      titel: budget.titel,
      wert: null,
      einheit: budget.einheit,
      befund: 'ungemessen',
      // Nicht gemessen ist nicht eingehalten. Es ist nur nicht gemessen.
      meldung: `Nicht gemessen. ${zusatz}`.trim(),
    };
  }
  const befund: BudgetBefund =
    wert >= budget.stoppAb ? 'stopp' : wert >= budget.warnAb ? 'warnung' : 'ok';
  const text =
    befund === 'stopp'
      ? `${wert} ${budget.einheit} erreichen die Stoppgrenze von ${budget.stoppAb}.`
      : befund === 'warnung'
        ? `${wert} ${budget.einheit} liegen über der Warnschwelle von ${budget.warnAb} (Stopp bei ${budget.stoppAb}).`
        : `${wert} von ${budget.warnAb} ${budget.einheit} bis zur Warnschwelle.`;
  return {
    id: budget.id,
    titel: budget.titel,
    wert,
    einheit: budget.einheit,
    befund,
    meldung: `${text} ${zusatz}`.trim(),
  };
}

function budget(id: string): Budget {
  const eintrag = BUDGETS.find((kandidat) => kandidat.id === id);
  if (eintrag === undefined) throw new Error(`Unbekanntes Budget: ${id}`);
  return eintrag;
}

/** Größe eines Verzeichnisses in MiB, auf eine Stelle gerundet. */
export function verzeichnisMiB(verzeichnis: string): number | null {
  if (!existsSync(verzeichnis)) return null;
  return Number((summeBytes(dateien(verzeichnis)) / MIB).toFixed(1));
}

export function miss(wurzel = '.'): readonly Messung[] {
  const distPfade = dateien(join(wurzel, 'dist'));
  const groesste = groessteDatei(distPfade);

  const messungen: Messung[] = [
    bewerteBudget(
      budget('dateien-ausgeliefert'),
      distPfade.length === 0 ? null : distPfade.length,
      distPfade.length === 0 ? 'Es liegt kein Build vor: `npm run build:site` ausführen.' : '',
    ),
    bewerteBudget(
      budget('groesste-datei'),
      groesste === null ? null : Number((groesste.bytes / MIB).toFixed(2)),
      groesste === null ? '' : `Größte Datei: ${groesste.pfad}.`,
    ),
    bewerteBudget(budget('snapshot-verzeichnis'), verzeichnisMiB(join(wurzel, 'data-snapshots'))),
    bewerteBudget(budget('git-verzeichnis'), verzeichnisMiB(join(wurzel, '.git'))),
  ];
  return messungen;
}

/** Der Commit, auf dem gemessen wurde. Für den Bericht, nicht für die Grenze. */
export function codeStand(wurzel = '.'): string {
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
      cwd: wurzel,
      encoding: 'utf8',
    }).trim();
  } catch {
    return 'unbekannt';
  }
}

export function alsText(messungen: readonly Messung[]): string {
  const zeichen: Record<BudgetBefund, string> = {
    ok: 'ok  ',
    warnung: 'warn',
    stopp: 'STOP',
    ungemessen: '—   ',
  };
  return messungen
    .map((messung) => `[${zeichen[messung.befund]}] ${messung.titel}: ${messung.meldung}`)
    .join('\n');
}

function main(): number {
  const messungen = miss();
  console.log(alsText(messungen));

  const stopp = messungen.filter((messung) => messung.befund === 'stopp');
  const warnung = messungen.filter((messung) => messung.befund === 'warnung');
  const ungemessen = messungen.filter((messung) => messung.befund === 'ungemessen');

  console.log(
    stopp.length > 0
      ? `Budgetprüfung fehlgeschlagen: ${stopp.map((m) => m.titel).join(', ')}.`
      : `Budgets eingehalten (${warnung.length} Warnung(en), ${ungemessen.length} ungemessen). Stand ${codeStand()}.`,
  );
  return stopp.length > 0 ? 1 : 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
