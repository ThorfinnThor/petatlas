/**
 * M17-03 — Beobachtung der Regelquellen.
 *
 * Der Lauf beantwortet eine einzige Frage je Seite: **ist sie noch die
 * Seite, die geprüft wurde?** Er übernimmt nichts, baut nichts und ändert
 * keine Regel. Eine Änderung ist ein Signal an einen Menschen, kein Anlass
 * für einen automatischen Rebuild — Reiseregeln brauchen eine fachliche
 * Prüfung (M12-06), und die kann kein Cron-Job ersetzen.
 *
 * Vier Befunde, und „unverändert“ ist nur einer davon:
 *
 * - `unveraendert`     — 304, oder gleicher Hash über den normalisierten Text
 * - `geaendert`        — anderer Hash
 * - `nicht_pruefbar`   — Antwort ohne den erwarteten Marker: Bot-Prüfung,
 *                        Einwilligungsseite, leerer Körper, Weiterleitung ins
 *                        Nichts. Ausdrücklich **nicht** „unverändert“.
 * - `fehler`           — Netz- oder HTTP-Fehler
 * - `neu`              — für diese Seite gibt es noch keinen Vergleichsstand
 *
 * Der Abruf ist bewusst schmal gehalten: eine Anfrage je Seite und Lauf, mit
 * ETag und Last-Modified, damit die Quelle im Regelfall nur 304 schickt.
 */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import {
  WatchlistSchema,
  WatchStateFileSchema,
  type WatchEntry,
  type WatchState,
} from '../../src/domain/schemas/watchlist.ts';

export const WATCHLIST_DATEI = 'config/watchlist/rule-sources.json';
export const ZUSTAND_DATEI = 'data-snapshots/watch/rule-sources.json';

/** Kennung im User-Agent, damit ein Betreiber sieht, wer da anfragt. */
const USER_AGENT = 'PetAtlas-Quellenbeobachtung/1.0 (+https://petatlas.de)';

export type Befund = 'unveraendert' | 'geaendert' | 'nicht_pruefbar' | 'fehler' | 'neu';

export interface Ergebnis {
  readonly watchId: string;
  readonly befund: Befund;
  readonly begruendung: string;
  readonly contentHash: string | null;
  readonly etag: string | null;
  readonly lastModified: string | null;
}

export interface Bericht {
  readonly watchlistId: string;
  readonly geprueftAm: string;
  readonly ergebnisse: readonly Ergebnis[];
}

/**
 * Normalisierung vor dem Hash. Sie ist absichtlich klein und hier
 * nachlesbar: Skripte, Stile und Kommentare fliegen raus, Leerraum wird
 * zusammengezogen. Alles andere bleibt stehen — eine Normalisierung, die
 * viel wegnimmt, meldet irgendwann keine Änderung mehr.
 */
export function normalisiere(rohBytes: Uint8Array): string {
  // Byteweise als Latin-1 gelesen: das kann nicht fehlschlagen und macht die
  // Zeichensatzerkennung überflüssig. Verglichen werden ohnehin nur Hashes.
  const text = Buffer.from(rohBytes).toString('latin1');
  return text
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function hashe(text: string): string {
  return createHash('sha256').update(text, 'latin1').digest('hex');
}

export function ladeWatchlist(datei: string = WATCHLIST_DATEI): {
  readonly watchlistId: string;
  readonly entries: readonly WatchEntry[];
} {
  const ergebnis = WatchlistSchema.safeParse(JSON.parse(readFileSync(datei, 'utf8')));
  if (!ergebnis.success) {
    throw new Error(`${datei} ist ungültig: ${ergebnis.error.message}`);
  }
  return ergebnis.data;
}

export function ladeZustand(datei: string = ZUSTAND_DATEI): ReadonlyMap<string, WatchState> {
  let roh: unknown;
  try {
    roh = JSON.parse(readFileSync(datei, 'utf8'));
  } catch {
    return new Map();
  }
  const ergebnis = WatchStateFileSchema.safeParse(roh);
  if (!ergebnis.success) {
    throw new Error(`${datei} ist ungültig: ${ergebnis.error.message}`);
  }
  return new Map(ergebnis.data.states.map((zustand) => [zustand.watchId, zustand]));
}

export interface PruefOptionen {
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
  readonly maxBytes?: number;
  readonly jetzt?: () => string;
}

/** Liest höchstens `maxBytes`; eine riesige Antwort ist kein Grund, Speicher zu fluten. */
async function begrenzterKoerper(antwort: Response, maxBytes: number): Promise<Uint8Array> {
  const puffer = new Uint8Array(await antwort.arrayBuffer());
  return puffer.byteLength > maxBytes ? puffer.subarray(0, maxBytes) : puffer;
}

export async function pruefeEintrag(
  eintrag: WatchEntry,
  vorher: WatchState | undefined,
  optionen: PruefOptionen = {},
): Promise<Ergebnis> {
  const { fetchImpl = fetch, timeoutMs = 30_000, maxBytes = 8 * 1024 * 1024 } = optionen;

  const ziel = new URL(eintrag.url);
  if (ziel.protocol !== 'https:') {
    return {
      watchId: eintrag.watchId,
      befund: 'fehler',
      begruendung: `Nur https ist zulässig, nicht ${ziel.protocol}.`,
      contentHash: vorher?.contentHash ?? null,
      etag: vorher?.etag ?? null,
      lastModified: vorher?.lastModified ?? null,
    };
  }

  const kopfzeilen: Record<string, string> = { accept: '*/*', 'user-agent': USER_AGENT };
  if (vorher !== undefined && vorher.etag !== null) kopfzeilen['if-none-match'] = vorher.etag;
  if (vorher !== undefined && vorher.lastModified !== null) {
    kopfzeilen['if-modified-since'] = vorher.lastModified;
  }

  let antwort: Response;
  try {
    antwort = await fetchImpl(ziel, {
      redirect: 'follow',
      headers: kopfzeilen,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (fehler) {
    return {
      watchId: eintrag.watchId,
      befund: 'fehler',
      begruendung: `Abruf fehlgeschlagen: ${(fehler as Error).message}`,
      contentHash: vorher?.contentHash ?? null,
      etag: vorher?.etag ?? null,
      lastModified: vorher?.lastModified ?? null,
    };
  }

  if (antwort.status === 304) {
    return {
      watchId: eintrag.watchId,
      befund: 'unveraendert',
      begruendung: 'Die Quelle meldet HTTP 304.',
      contentHash: vorher?.contentHash ?? null,
      etag: vorher?.etag ?? null,
      lastModified: vorher?.lastModified ?? null,
    };
  }

  if (!antwort.ok) {
    return {
      watchId: eintrag.watchId,
      befund: 'fehler',
      begruendung: `Die Quelle antwortet mit HTTP ${antwort.status}.`,
      contentHash: vorher?.contentHash ?? null,
      etag: vorher?.etag ?? null,
      lastModified: vorher?.lastModified ?? null,
    };
  }

  const koerper = await begrenzterKoerper(antwort, maxBytes);
  const text = normalisiere(koerper);
  const etag = antwort.headers.get('etag');
  const lastModified = antwort.headers.get('last-modified');

  if (!text.includes(eintrag.expectedMarker)) {
    // Wichtigster Fall: die Antwort ist zwar 200, aber nicht die Seite, die
    // geprüft wurde. Der alte Vergleichsstand bleibt stehen, damit eine
    // Bot-Prüfung nicht zum neuen Sollzustand wird.
    return {
      watchId: eintrag.watchId,
      befund: 'nicht_pruefbar',
      begruendung: `HTTP ${antwort.status}, aber der Marker „${eintrag.expectedMarker}“ fehlt (${text.length} Zeichen). Die Antwort ist nicht die geprüfte Seite.`,
      contentHash: vorher?.contentHash ?? null,
      etag: vorher?.etag ?? null,
      lastModified: vorher?.lastModified ?? null,
    };
  }

  const hash = hashe(text);
  if (vorher === undefined || vorher.contentHash === null) {
    return {
      watchId: eintrag.watchId,
      befund: 'neu',
      begruendung: 'Erster gelesener Stand; es gibt noch nichts zu vergleichen.',
      contentHash: hash,
      etag,
      lastModified,
    };
  }
  if (vorher.contentHash === hash) {
    return {
      watchId: eintrag.watchId,
      befund: 'unveraendert',
      begruendung: 'Gleicher Hash über den normalisierten Text.',
      contentHash: hash,
      etag,
      lastModified,
    };
  }
  return {
    watchId: eintrag.watchId,
    befund: 'geaendert',
    begruendung: `Der Text hat sich geändert (${vorher.contentHash.slice(0, 12)}… → ${hash.slice(0, 12)}…). ${eintrag.meaning}`,
    contentHash: hash,
    etag,
    lastModified,
  };
}

export async function pruefeAlle(
  eintraege: readonly WatchEntry[],
  zustand: ReadonlyMap<string, WatchState>,
  optionen: PruefOptionen = {},
): Promise<readonly Ergebnis[]> {
  const ergebnisse: Ergebnis[] = [];
  // Nacheinander, nicht parallel: fünf Seiten sind kein Grund, fünf fremde
  // Server gleichzeitig anzufassen.
  for (const eintrag of eintraege) {
    ergebnisse.push(await pruefeEintrag(eintrag, zustand.get(eintrag.watchId), optionen));
  }
  return ergebnisse;
}

/** Ein Befund, der einen Menschen braucht. */
export function meldepflichtig(ergebnis: Ergebnis): boolean {
  return ergebnis.befund !== 'unveraendert';
}

export function schreibeZustand(
  watchlistId: string,
  ergebnisse: readonly Ergebnis[],
  datei: string = ZUSTAND_DATEI,
): void {
  const inhalt = {
    watchlistId,
    states: ergebnisse.map((ergebnis) => ({
      watchId: ergebnis.watchId,
      contentHash: ergebnis.contentHash,
      etag: ergebnis.etag,
      lastModified: ergebnis.lastModified,
    })),
  };
  const geprueft = WatchStateFileSchema.parse(inhalt);
  mkdirSync(dirname(datei), { recursive: true });
  writeFileSync(datei, `${JSON.stringify(geprueft, null, 2)}\n`, 'utf8');
}

/**
 * Titel der Meldung. Bewusst **stabil je Seite**: der Workflow findet damit
 * eine schon offene Meldung wieder und macht daraus keine zweite. Ein
 * täglicher Lauf soll an eine offene Frage erinnern, nicht jeden Tag eine
 * neue Frage stellen.
 */
export function issueTitel(ergebnis: Ergebnis): string {
  return `Beobachtete Quelle: ${ergebnis.watchId} (${ergebnis.befund})`;
}

export function issueKoerper(eintrag: WatchEntry, ergebnis: Ergebnis, geprueftAm: string): string {
  return [
    `**Befund:** ${ergebnis.befund}`,
    '',
    ergebnis.begruendung,
    '',
    `**Seite:** ${eintrag.title}`,
    `**Adresse:** ${eintrag.url}`,
    `**Gehört zu:** ${eintrag.belongsTo}`,
    `**Zuletzt von Hand gesichtet:** ${eintrag.reviewedAt}`,
    `**Geprüft am:** ${geprueftAm}`,
    '',
    'Dieser Lauf ändert **keine** Regel und stößt **keinen** Build an. Eine',
    'Reiseregel wird fachlich geprüft, bevor sie gilt (M12-06).',
    '',
    'Wenn die Änderung gesichtet ist: `node scripts/monitor/source-drift.ts --fetch`',
    'lokal ausführen, `data-snapshots/watch/rule-sources.json` mit committen und',
    'diese Meldung schließen.',
  ].join('\n');
}

export function alsText(bericht: Bericht): string {
  const zeilen = [`Beobachtung ${bericht.watchlistId}, geprüft am ${bericht.geprueftAm}:`];
  for (const ergebnis of bericht.ergebnisse) {
    zeilen.push(`- ${ergebnis.watchId}: ${ergebnis.befund} — ${ergebnis.begruendung}`);
  }
  return zeilen.join('\n');
}

async function main(): Promise<number> {
  const abrufen = process.argv.includes('--fetch');
  const watchlist = ladeWatchlist();

  if (!abrufen) {
    // Ohne Netz wird nur geprüft, dass Liste und Zustand zueinander passen.
    const zustand = ladeZustand();
    const fehlend = watchlist.entries
      .filter((eintrag) => !zustand.has(eintrag.watchId))
      .map((eintrag) => eintrag.watchId);
    console.log(
      `Beobachtungsliste ${watchlist.watchlistId}: ${watchlist.entries.length} Einträge, ` +
        `${zustand.size} mit Vergleichsstand${fehlend.length > 0 ? `, ohne Stand: ${fehlend.join(', ')}` : ''}.`,
    );
    console.log('Ohne --fetch wird nichts abgerufen.');
    return 0;
  }

  const zustand = ladeZustand();
  const geprueftAm = new Date().toISOString();
  const ergebnisse = await pruefeAlle(watchlist.entries, zustand);
  const bericht: Bericht = { watchlistId: watchlist.watchlistId, geprueftAm, ergebnisse };
  console.log(alsText(bericht));
  schreibeZustand(watchlist.watchlistId, ergebnisse);

  const zuMelden = ergebnisse.filter(meldepflichtig);
  // Erst leeren: eine Seite, die heute wieder in Ordnung ist, darf keine
  // Meldung von gestern hinterlassen.
  rmSync('.work/meldungen', { recursive: true, force: true });
  mkdirSync('.work/meldungen', { recursive: true });
  writeFileSync('.work/source-drift.json', `${JSON.stringify(bericht, null, 2)}\n`, 'utf8');
  for (const ergebnis of zuMelden) {
    const eintrag = watchlist.entries.find((kandidat) => kandidat.watchId === ergebnis.watchId);
    if (eintrag === undefined) continue;
    writeFileSync(
      `.work/meldungen/${ergebnis.watchId}.md`,
      `${issueTitel(ergebnis)}\n\n${issueKoerper(eintrag, ergebnis, geprueftAm)}\n`,
      'utf8',
    );
  }
  console.log(
    zuMelden.length === 0
      ? 'Nichts zu melden.'
      : `${zuMelden.length} Befund(e) brauchen einen Menschen: ${zuMelden.map((e) => e.watchId).join(', ')}.`,
  );
  // Ein Befund ist kein Fehlschlag des Laufs. Der Workflow entscheidet, was
  // daraus wird; ein roter Lauf wäre hier nur Lärm.
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(await main());
}
