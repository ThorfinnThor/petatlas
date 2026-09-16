/**
 * M16-01 — Profilzustand im Tab.
 *
 * Das Profil lebt zunächst nur im Arbeitsspeicher dieses Tabs. Es wird
 * **nicht** automatisch gespeichert und **nie** übertragen; das Speichern ist
 * eine eigene, bewusste Handlung (M16-02).
 *
 * Zwei Entwurfsentscheidungen, die den Rest bestimmen:
 *
 * 1. **Nichts ist Pflicht.** Ein leeres Profil ist gültig. Wer nur „Hund“
 *    angibt, bekommt genau die Filter, die daraus folgen — und sonst nichts.
 * 2. **Kein Feld, das identifiziert.** Es gibt keine E-Mail, keine Adresse,
 *    keine Telefonnummer und kein Freitextfeld ohne Längenbegrenzung. Was
 *    nicht erhoben wird, kann auch nicht verloren gehen.
 */
import { istTierprofil } from '../../domain/runtime-guards.ts';
import type { PetProfile } from '../../domain/schemas/profile.ts';

/** Interessen, die die Oberfläche anbietet. Feste Liste, keine Freitexte. */
export const INTERESSEN: Readonly<Record<string, string>> = {
  futter: 'Futter und Mengenvergleich',
  pflege: 'Pflegezubehör',
  spielzeug: 'Spielzeug',
  reise: 'Reisen mit Tier',
  orte: 'Tierärzte und Orte in der Nähe',
};

export interface ProfilEntwurf {
  readonly species: string | null;
  readonly displayName: string;
  readonly birthDate: string | null;
  readonly weightGrams: number | null;
  readonly breed: string | null;
  readonly interests: readonly string[];
}

export const LEERER_ENTWURF: ProfilEntwurf = {
  species: null,
  displayName: '',
  birthDate: null,
  weightGrams: null,
  breed: null,
  interests: [],
};

export interface ProfilZustand {
  readonly entwurf: ProfilEntwurf;
  /** Vollständig genug für ein gültiges Profil? */
  readonly gueltig: boolean;
  /** Was fehlt — im Klartext, nicht als Fehlerliste. */
  readonly offen: readonly string[];
}

export type GewichtsPruefung =
  | { readonly status: 'leer'; readonly gramm: null; readonly meldung: null }
  | { readonly status: 'gueltig'; readonly gramm: number; readonly meldung: null }
  | { readonly status: 'ungueltig'; readonly gramm: null; readonly meldung: string };

/**
 * Prüft eine optionale Kilogramm-Eingabe, ohne „leer“ und „fehlerhaft“ zu
 * vermischen. Drei Nachkommastellen sind möglich, weil ein Gramm 0,001 kg ist.
 */
export function pruefeGewicht(text: string): GewichtsPruefung {
  const getrimmt = text.trim();
  if (getrimmt === '') return { status: 'leer', gramm: null, meldung: null };

  const roh = getrimmt.replace(',', '.');
  if (!/^\d+(\.\d{1,3})?$/.test(roh)) {
    return {
      status: 'ungueltig',
      gramm: null,
      meldung:
        'Bitte ein Gewicht zwischen 0,001 und 200 kg mit höchstens drei Nachkommastellen eingeben.',
    };
  }

  const kilo = Number(roh);
  if (!Number.isFinite(kilo) || kilo <= 0 || kilo > 200) {
    return {
      status: 'ungueltig',
      gramm: null,
      meldung: 'Das Gewicht muss größer als 0 und höchstens 200 kg sein.',
    };
  }
  return { status: 'gueltig', gramm: Math.round(kilo * 1000), meldung: null };
}

/** Rückwärtskompatible Kurzform für Stellen, die nur Gramm oder `null` brauchen. */
export function gewichtInGramm(text: string): number | null {
  return pruefeGewicht(text).gramm;
}

/**
 * Bewertet den Entwurf. Ein unvollständiger Entwurf ist kein Fehler: die
 * Werkzeuge funktionieren auch ohne Profil, und die Oberfläche sagt nur, was
 * ein vollständiges Profil zusätzlich könnte.
 */
export function bewerte(entwurf: ProfilEntwurf): ProfilZustand {
  const offen: string[] = [];
  if (entwurf.species === null) offen.push('Tierart — ohne sie gibt es keine passende Vorauswahl.');
  if (entwurf.displayName.trim() === '') offen.push('Rufname für die eigene Übersicht.');
  if (entwurf.weightGrams === null) {
    offen.push('Gewicht — ohne Angabe wird nichts wegen der Größe gefiltert.');
  }
  return {
    entwurf,
    gueltig: entwurf.species !== null && entwurf.displayName.trim() !== '',
    offen,
  };
}

/**
 * Macht aus dem Entwurf ein gültiges Profil — oder gibt `null` zurück.
 *
 * Die Profil-ID entsteht lokal per `crypto.randomUUID()`. Sie ist keine
 * Nutzerkennung: sie verlässt das Gerät nicht und wird nirgends registriert.
 */
export function alsProfil(entwurf: ProfilEntwurf, profileId?: string): PetProfile | null {
  if (entwurf.species === null || entwurf.displayName.trim() === '') return null;
  const kandidat = {
    profileId: profileId ?? crypto.randomUUID(),
    schemaVersion: 1 as const,
    species: entwurf.species,
    displayName: entwurf.displayName.trim().slice(0, 40),
    birthDate: entwurf.birthDate,
    weightGrams: entwurf.weightGrams,
    breed: entwurf.breed === null || entwurf.breed.trim() === '' ? null : entwurf.breed.trim(),
  };
  // M22-02: geprüft wird mit der handgeschriebenen Fassung, damit die
  // Schemabibliothek nicht im Browser landet. Dass beide dasselbe sagen,
  // prüft `tests/runtime-guards.test.ts`.
  return istTierprofil(kandidat) ? (kandidat as PetProfile) : null;
}

/** Nur bekannte Interessen; alles andere wird verworfen. */
export function bereinigeInteressen(werte: readonly string[]): readonly string[] {
  return werte.filter((wert) => Object.prototype.hasOwnProperty.call(INTERESSEN, wert));
}
