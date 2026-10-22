/**
 * Darf ein automatischer Daten-PR ohne Menschen nach main?
 *
 * Die wöchentlichen Importe (kommunale Hundeflächen, Awin-Feeds von Fressnapf
 * und ZooRoyal) öffnen je einen Pull Request. `daten-automerge.yml` merged ihn,
 * wenn die Prüfkette grün ist — aber nur, wenn diese Prüfung vorher Ja sagt.
 * Sie ist bewusst eng:
 *
 * - Der Zweig muss zu einem bekannten Import gehören.
 * - Geändert sein dürfen nur die Dateien dieses Imports. Der Gebührenkatalog
 *   (GOT) ist nie dabei: eine geänderte Verordnung braucht einen Menschen.
 * - Keine Menge darf um mehr als ein Viertel einbrechen oder auf null fallen.
 *   Ein halber Feed ist eher ein Abruffehler als ein geschrumpftes Sortiment.
 *
 * Sagt die Prüfung Nein, bleibt der PR offen und der Lauf wird rot.
 *
 * Aufruf: `node scripts/publish/daten-automerge.ts <zweig> <basis-ref> <kopf-ref>`
 */
import { execFileSync } from 'node:child_process';

interface Import {
  readonly name: string;
  readonly zweig: RegExp;
  readonly dateien: readonly string[];
}

export const IMPORTE: readonly Import[] = [
  {
    name: 'Kommunale Hundeflächen',
    zweig: /^ingest\/\d{4}-\d{2}-\d{2}-\d+$/,
    dateien: [
      'data-snapshots/municipal/berlin-hundefreilauf.json',
      'data-snapshots/municipal/hamburg-hundeauslaufzonen.json',
    ],
  },
  {
    name: 'Fressnapf-Feed',
    zweig: /^awin\/fressnapf-\d+$/,
    dateien: [
      'content-data/products/fressnapf-feed.json',
      'content-data/products/fressnapf-catalog.json',
    ],
  },
  {
    name: 'ZooRoyal-Feed',
    zweig: /^awin\/zooroyal-\d+$/,
    dateien: [
      'content-data/products/zooroyal-feed.json',
      'content-data/products/zooroyal-catalog.json',
    ],
  },
];

/** Ab diesem Anteil des bisherigen Bestands gilt ein Rückgang als verdächtig. */
export const MINDESTANTEIL = 0.75;

export interface Menge {
  readonly datei: string;
  readonly vorher: number | null;
  readonly nachher: number | null;
}

export interface Befund {
  readonly erlaubt: boolean;
  readonly gruende: readonly string[];
}

/** Anzahl der Einträge einer Datendatei; `null`, wenn sie fehlt oder unlesbar ist. */
export function zaehle(inhalt: string | null): number | null {
  if (inhalt === null) return null;
  try {
    const daten = JSON.parse(inhalt) as Record<string, unknown>;
    if (Array.isArray(daten.products)) return daten.products.length;
    if (Array.isArray(daten.areas)) return daten.areas.length;
    return null;
  } catch {
    return null;
  }
}

export function pruefeDatenPr(
  zweig: string,
  geaenderteDateien: readonly string[],
  mengen: readonly Menge[],
): Befund {
  const gruende: string[] = [];
  const importe = IMPORTE.filter((eintrag) => eintrag.zweig.test(zweig));
  const eintrag = importe[0];
  if (eintrag === undefined) {
    return { erlaubt: false, gruende: [`Der Zweig „${zweig}“ gehört zu keinem bekannten Import.`] };
  }
  if (geaenderteDateien.length === 0) gruende.push('Der PR ändert keine Datei.');
  const fremd = geaenderteDateien.filter((datei) => !eintrag.dateien.includes(datei));
  if (fremd.length > 0) {
    gruende.push(`Außerhalb des Imports „${eintrag.name}“ geändert: ${fremd.join(', ')}.`);
  }
  for (const menge of mengen) {
    if (!eintrag.dateien.includes(menge.datei)) continue;
    if (menge.nachher === null || menge.nachher === 0) {
      gruende.push(`${menge.datei} ist leer oder unlesbar.`);
      continue;
    }
    if (menge.vorher !== null && menge.vorher > 0 && menge.nachher < menge.vorher * MINDESTANTEIL) {
      gruende.push(
        `${menge.datei} fällt von ${menge.vorher} auf ${menge.nachher} Einträge (mehr als ein Viertel weniger).`,
      );
    }
  }
  return { erlaubt: gruende.length === 0, gruende };
}

function git(...argumente: string[]): string {
  return execFileSync('git', argumente, { encoding: 'utf8' });
}

function dateiAm(ref: string, datei: string): string | null {
  try {
    return git('show', `${ref}:${datei}`);
  } catch {
    return null;
  }
}

function main(): void {
  const [zweig, basis, kopf] = process.argv.slice(2);
  if (!zweig || !basis || !kopf) {
    throw new Error('Aufruf: daten-automerge.ts <zweig> <basis-ref> <kopf-ref>');
  }
  const dateien = git('diff', '--name-only', `${basis}...${kopf}`)
    .split('\n')
    .map((zeile) => zeile.trim())
    .filter(Boolean);
  const mengen = dateien.map((datei) => ({
    datei,
    vorher: zaehle(dateiAm(basis, datei)),
    nachher: zaehle(dateiAm(kopf, datei)),
  }));
  for (const menge of mengen) {
    console.log(`${menge.datei}: ${menge.vorher ?? '–'} → ${menge.nachher ?? '–'}`);
  }
  const befund = pruefeDatenPr(zweig, dateien, mengen);
  if (!befund.erlaubt) {
    for (const grund of befund.gruende) console.error(grund);
    process.exitCode = 1;
    return;
  }
  console.log('Automatischer Merge zulässig.');
}

if (import.meta.url === `file://${process.argv[1]}`) main();
