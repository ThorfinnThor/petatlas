/**
 * Atomare Ersatzsemantik für die drei lokalen Sicherungsbereiche.
 *
 * `localStorage` kann mehrere Schlüssel nicht in einer nativen Transaktion
 * ändern. Deshalb wird zuerst ein versioniertes Journal mit dem vollständigen
 * Vorzustand geschrieben. Solange es existiert, gilt die Übernahme als nicht
 * abgeschlossen und kann beim nächsten Start auf den Vorzustand zurückgesetzt
 * werden. Erst nach Read-back aller Zielwerte wird das Journal entfernt.
 */
import { PROFILE_STORAGE_KEY } from '../../domain/domain-rules.ts';
import { FAVORITES_STORAGE_KEY, schreibe as schreibeMerkliste } from './favorites.ts';
import type { ExportDatei } from './import-export.ts';
import { PACKING_STORAGE_KEY, schreibe as schreibePacken } from './packing-state.ts';
import { SPEICHER_VERSION, type GespeicherterStand, type Speicher } from './storage.ts';
import { bereinigeInteressen } from './state.ts';

export const BACKUP_TRANSACTION_KEY = 'petatlas.backup-transaction.v1';

const DATEN_SCHLUESSEL = [PROFILE_STORAGE_KEY, FAVORITES_STORAGE_KEY, PACKING_STORAGE_KEY] as const;

type DatenSchluessel = (typeof DATEN_SCHLUESSEL)[number];
type RohSnapshot = Readonly<Record<DatenSchluessel, string | null>>;

interface Journal {
  readonly version: 1;
  readonly before: RohSnapshot;
}

export interface ErsatzErgebnis {
  readonly ok: boolean;
  readonly meldung: string;
}

function snapshot(speicher: Speicher): RohSnapshot {
  return Object.fromEntries(
    DATEN_SCHLUESSEL.map((schluessel) => [schluessel, speicher.getItem(schluessel)]),
  ) as unknown as RohSnapshot;
}

function istSnapshot(wert: unknown): wert is RohSnapshot {
  if (typeof wert !== 'object' || wert === null || Array.isArray(wert)) return false;
  const objekt = wert as Record<string, unknown>;
  return DATEN_SCHLUESSEL.every(
    (schluessel) => objekt[schluessel] === null || typeof objekt[schluessel] === 'string',
  );
}

function journalLesen(roh: string | null): Journal | null {
  if (roh === null) return null;
  try {
    const gelesen: unknown = JSON.parse(roh);
    if (
      typeof gelesen === 'object' &&
      gelesen !== null &&
      (gelesen as { version?: unknown }).version === 1 &&
      istSnapshot((gelesen as { before?: unknown }).before)
    ) {
      return gelesen as Journal;
    }
  } catch {
    // Ein beschädigtes internes Journal wird unten verworfen. Es enthält
    // keine importierten Nutzdaten und darf keine beliebigen Writes auslösen.
  }
  return null;
}

function setzeSnapshot(speicher: Speicher, ziel: RohSnapshot): void {
  for (const schluessel of DATEN_SCHLUESSEL) {
    const wert = ziel[schluessel];
    if (wert === null) speicher.removeItem(schluessel);
    else speicher.setItem(schluessel, wert);
  }
  for (const schluessel of DATEN_SCHLUESSEL) {
    if (speicher.getItem(schluessel) !== ziel[schluessel]) {
      throw new Error(`Read-back für ${schluessel} ist fehlgeschlagen.`);
    }
  }
}

/** Setzt eine beim letzten Abbruch offene Übernahme auf den Vorzustand zurück. */
export function offeneSicherungZuruecksetzen(speicher: Speicher | null): ErsatzErgebnis {
  if (speicher === null) {
    return { ok: false, meldung: 'Kein lokaler Speicher verfügbar.' };
  }
  let roh: string | null;
  try {
    roh = speicher.getItem(BACKUP_TRANSACTION_KEY);
  } catch {
    return { ok: false, meldung: 'Der lokale Speicher konnte nicht gelesen werden.' };
  }
  if (roh === null) return { ok: true, meldung: 'Keine offene Übernahme.' };

  const journal = journalLesen(roh);
  if (journal === null) {
    try {
      speicher.removeItem(BACKUP_TRANSACTION_KEY);
    } catch {
      return {
        ok: false,
        meldung: 'Eine beschädigte Übernahmemarke konnte nicht entfernt werden.',
      };
    }
    return { ok: false, meldung: 'Eine beschädigte Übernahmemarke wurde verworfen.' };
  }

  try {
    setzeSnapshot(speicher, journal.before);
    speicher.removeItem(BACKUP_TRANSACTION_KEY);
    if (speicher.getItem(BACKUP_TRANSACTION_KEY) !== null)
      throw new Error('Journal blieb bestehen.');
    return { ok: true, meldung: 'Eine unterbrochene Übernahme wurde zurückgesetzt.' };
  } catch {
    return {
      ok: false,
      meldung:
        'Eine unterbrochene Übernahme konnte noch nicht vollständig zurückgesetzt werden. Bitte laden Sie die Seite erneut.',
    };
  }
}

function zielSnapshot(daten: ExportDatei, jetzt: string): RohSnapshot {
  let profil: string | null = null;
  if (daten.profile !== null) {
    const stand: GespeicherterStand = {
      version: SPEICHER_VERSION,
      profile: daten.profile,
      interests: bereinigeInteressen(daten.interests),
      savedAt: jetzt,
    };
    profil = JSON.stringify(stand);
  }
  return {
    [PROFILE_STORAGE_KEY]: profil,
    [FAVORITES_STORAGE_KEY]: daten.favorites === null ? null : schreibeMerkliste(daten.favorites),
    [PACKING_STORAGE_KEY]: daten.packing === null ? null : schreibePacken(daten.packing),
  };
}

/** Ersetzt einen validierten Export vollständig oder stellt den alten Stand wieder her. */
export function ersetzeDurchSicherung(
  speicher: Speicher | null,
  daten: ExportDatei,
  jetzt: string,
): ErsatzErgebnis {
  if (speicher === null) {
    return {
      ok: false,
      meldung: 'Dieser Browser erlaubt kein lokales Speichern. Es wurde nichts übernommen.',
    };
  }

  const erholung = offeneSicherungZuruecksetzen(speicher);
  if (!erholung.ok) return erholung;

  let vorher: RohSnapshot;
  try {
    vorher = snapshot(speicher);
    const journal: Journal = { version: 1, before: vorher };
    speicher.setItem(BACKUP_TRANSACTION_KEY, JSON.stringify(journal));
    if (journalLesen(speicher.getItem(BACKUP_TRANSACTION_KEY)) === null) {
      throw new Error('Journal konnte nicht bestätigt werden.');
    }
    setzeSnapshot(speicher, zielSnapshot(daten, jetzt));
    speicher.removeItem(BACKUP_TRANSACTION_KEY);
    if (speicher.getItem(BACKUP_TRANSACTION_KEY) !== null) {
      throw new Error('Journal konnte nicht abgeschlossen werden.');
    }
    return {
      ok: true,
      meldung: 'Sicherung übernommen. Der lokale Stand wurde vollständig ersetzt.',
    };
  } catch {
    const ruecksetzen = offeneSicherungZuruecksetzen(speicher);
    return {
      ok: false,
      meldung: ruecksetzen.ok
        ? 'Die Sicherung konnte nicht übernommen werden. Der bisherige Stand blieb erhalten.'
        : ruecksetzen.meldung,
    };
  }
}
