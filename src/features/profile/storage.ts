/**
 * M16-02 — Lokale Speicherung, nur auf Wunsch.
 *
 * Gespeichert wird **nichts automatisch**. Das Speichern ist eine Handlung
 * des Nutzers, und das Löschen muss genauso einfach sein — sonst ist es keine
 * Wahl, sondern eine Falle.
 *
 * Vier Dinge, die hier ernst genommen werden:
 *
 * 1. **Versioniertes Schema.** Was gespeichert wird, trägt seine Fassung mit.
 *    Ein Stand aus einer älteren Fassung wird migriert oder verworfen — nie
 *    halb gelesen.
 * 2. **Speicher kann fehlschlagen.** Privater Modus, volles Kontingent,
 *    abgeschaltete Speicherung: alles das ist normal und darf die Seite nicht
 *    kaputt machen. Jede Funktion gibt ein Ergebnis zurück, keine Ausnahme.
 * 3. **Fremde Inhalte sind Eingaben.** Was im Speicher liegt, kann von
 *    irgendwoher stammen. Es wird gegen das Schema geprüft, bevor es benutzt
 *    wird.
 * 4. **Löschen heißt löschen.** Kein Papierkorb, kein zweiter Schlüssel, kein
 *    Rest.
 */
import {
  PetProfileSchema,
  PROFILE_STORAGE_KEY,
  type PetProfile,
} from '../../domain/schemas/profile.ts';
import { bereinigeInteressen } from './state.ts';

/** Aktuelle Fassung des gespeicherten Standes. */
export const SPEICHER_VERSION = 2;

/** Was im Speicher liegt: Profil plus Interessen, mit Fassungsnummer. */
export interface GespeicherterStand {
  readonly version: number;
  readonly profile: PetProfile;
  readonly interests: readonly string[];
  /** Zeitpunkt der letzten bewussten Speicherung. */
  readonly savedAt: string;
}

export type SpeicherFehler =
  'kein_speicher' | 'kontingent' | 'unlesbar' | 'ungueltig' | 'fremde_fassung';

export interface SpeicherErgebnis<T> {
  readonly ok: boolean;
  readonly wert: T | null;
  readonly fehler: SpeicherFehler | null;
  /** Klartext für die Oberfläche. Immer gefüllt. */
  readonly meldung: string;
}

/** Minimale Sicht auf `localStorage`, damit Tests keinen Browser brauchen. */
export interface Speicher {
  getItem(schluessel: string): string | null;
  setItem(schluessel: string, wert: string): void;
  removeItem(schluessel: string): void;
}

/**
 * Der Speicher des Browsers — oder `null`.
 *
 * Im privaten Modus mancher Browser wirft schon der Zugriff. Das ist kein
 * Fehler der Seite, sondern eine Einstellung des Nutzers.
 */
export function browserSpeicher(): Speicher | null {
  try {
    const probe = '__petatlas_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

function istKontingentFehler(fehler: unknown): boolean {
  if (typeof DOMException !== 'undefined' && fehler instanceof DOMException) {
    return fehler.name === 'QuotaExceededError' || fehler.name === 'NS_ERROR_DOM_QUOTA_REACHED';
  }
  return fehler instanceof Error && /quota|kontingent/i.test(fehler.message);
}

/** Speichert den Stand. Ein Fehlschlag ist ein Ergebnis, keine Ausnahme. */
export function speichere(
  speicher: Speicher | null,
  profil: PetProfile,
  interessen: readonly string[],
  jetzt: string,
): SpeicherErgebnis<GespeicherterStand> {
  if (speicher === null) {
    return {
      ok: false,
      wert: null,
      fehler: 'kein_speicher',
      meldung:
        'Dieser Browser erlaubt kein lokales Speichern — etwa im privaten Modus. Die Angaben ' +
        'bleiben im Tab und gehen beim Neuladen verloren.',
    };
  }

  const stand: GespeicherterStand = {
    version: SPEICHER_VERSION,
    profile: profil,
    interests: bereinigeInteressen(interessen),
    savedAt: jetzt,
  };

  try {
    speicher.setItem(PROFILE_STORAGE_KEY, JSON.stringify(stand));
  } catch (fehler) {
    return {
      ok: false,
      wert: null,
      fehler: istKontingentFehler(fehler) ? 'kontingent' : 'kein_speicher',
      meldung: istKontingentFehler(fehler)
        ? 'Der lokale Speicher ist voll. Es wurde nichts gespeichert.'
        : 'Das Speichern hat nicht geklappt. Es wurde nichts gespeichert.',
    };
  }

  return { ok: true, wert: stand, fehler: null, meldung: 'Gespeichert — nur auf diesem Gerät.' };
}

/**
 * Hebt einen Stand aus einer älteren Fassung auf die aktuelle.
 *
 * Fassung 1 kannte keine Interessen. Sie werden ergänzt, nicht erfunden: die
 * Liste bleibt leer.
 */
export function migriere(roh: unknown): unknown {
  if (typeof roh !== 'object' || roh === null) return roh;
  const stand = roh as Record<string, unknown>;
  if (stand.version === 1) {
    return { ...stand, version: 2, interests: [] };
  }
  return stand;
}

/** Liest den gespeicherten Stand. Alles Unklare führt zu einem Ergebnis. */
export function lade(speicher: Speicher | null): SpeicherErgebnis<GespeicherterStand> {
  if (speicher === null) {
    return {
      ok: false,
      wert: null,
      fehler: 'kein_speicher',
      meldung: 'Kein lokaler Speicher verfügbar.',
    };
  }

  const roh = speicher.getItem(PROFILE_STORAGE_KEY);
  if (roh === null) {
    return { ok: false, wert: null, fehler: null, meldung: 'Kein gespeicherter Stand vorhanden.' };
  }

  let gelesen: unknown;
  try {
    gelesen = JSON.parse(roh);
  } catch {
    return {
      ok: false,
      wert: null,
      fehler: 'unlesbar',
      meldung: 'Der gespeicherte Stand ist unlesbar und wird nicht verwendet.',
    };
  }

  const migriert = migriere(gelesen) as Record<string, unknown> | null;
  if (migriert === null || typeof migriert !== 'object') {
    return {
      ok: false,
      wert: null,
      fehler: 'ungueltig',
      meldung: 'Der gespeicherte Stand passt nicht zum Format und wird nicht verwendet.',
    };
  }
  if (migriert.version !== SPEICHER_VERSION) {
    return {
      ok: false,
      wert: null,
      fehler: 'fremde_fassung',
      meldung:
        `Der gespeicherte Stand stammt aus Fassung ${String(migriert.version)} und wird nicht ` +
        'verwendet. Er wird auch nicht halb gelesen.',
    };
  }

  const profil = PetProfileSchema.safeParse(migriert.profile);
  if (!profil.success) {
    return {
      ok: false,
      wert: null,
      fehler: 'ungueltig',
      meldung: 'Der gespeicherte Stand passt nicht zum Schema und wird nicht verwendet.',
    };
  }

  const interessen = Array.isArray(migriert.interests)
    ? bereinigeInteressen(
        migriert.interests.filter((eintrag): eintrag is string => typeof eintrag === 'string'),
      )
    : [];

  return {
    ok: true,
    wert: {
      version: SPEICHER_VERSION,
      profile: profil.data,
      interests: interessen,
      savedAt: typeof migriert.savedAt === 'string' ? migriert.savedAt : '',
    },
    fehler: null,
    meldung: 'Gespeicherter Stand geladen.',
  };
}

/** Löscht den Stand vollständig. Kein Papierkorb, kein Rest. */
export function loesche(speicher: Speicher | null): SpeicherErgebnis<null> {
  if (speicher === null) {
    return { ok: false, wert: null, fehler: 'kein_speicher', meldung: 'Kein lokaler Speicher.' };
  }
  try {
    speicher.removeItem(PROFILE_STORAGE_KEY);
  } catch {
    return {
      ok: false,
      wert: null,
      fehler: 'kein_speicher',
      meldung: 'Das Löschen hat nicht geklappt.',
    };
  }
  return { ok: true, wert: null, fehler: null, meldung: 'Gelöscht. Es bleibt nichts zurück.' };
}
