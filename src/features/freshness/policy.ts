/**
 * M17-04 — Wie alt darf ein Datenstand sein?
 *
 * Die Bewertung ist eine reine Funktion aus Stand, Stichtag und einer
 * **vorher erklärten** Politik. Kein Blick auf die Uhr: der Stichtag kommt
 * von außen, sonst hinge das Ergebnis an der Systemzeit dessen, der es
 * gerade ansieht — und ein Test könnte es nicht festnageln.
 *
 * Vier Bewertungen, und drei davon sind nicht „in Ordnung“:
 *
 * - `frisch`     — jünger als die Warnschwelle
 * - `alternd`    — über der Warnschwelle, aber noch unter der Sperrschwelle
 * - `veraltet`   — über der Sperrschwelle
 * - `unbekannt`  — kein Stand, kein lesbares Datum, oder ein Datum in der
 *                  Zukunft
 *
 * `unbekannt` ist ausdrücklich **nicht** dasselbe wie frisch. Ein fehlender
 * Stand ist kein guter Stand; ein Stand in der Zukunft ist ein Fehler in den
 * Daten oder eine falsch gestellte Uhr, aber keine Aktualität.
 */
import { compareCalendarDates, daysBetween, parseCalendarDate } from '../../domain/dates.ts';

export type Frische = 'frisch' | 'alternd' | 'veraltet' | 'unbekannt';

export interface FrischePolitik {
  /** Ab so vielen Tagen wird gewarnt. */
  readonly warnAbTagen: number;
  /** Ab so vielen Tagen gilt der Stand als veraltet und wird gesperrt. */
  readonly sperreAbTagen: number;
}

export interface Bewertung {
  readonly frische: Frische;
  /** Alter in Tagen, `null` wenn es sich nicht bestimmen lässt. */
  readonly alterTage: number | null;
  /** Klartext. Auch im guten Fall gefüllt. */
  readonly begruendung: string;
  /**
   * Darf auf diesem Stand ein positives Ergebnis stehen? `veraltet` und
   * `unbekannt` sagen nein.
   */
  readonly blockiert: boolean;
}

export class FrischeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FrischeError';
  }
}

/** Kalendertag aus einem Zeitstempel oder Datum; `null`, wenn unlesbar. */
export function alsTag(wert: string | null): string | null {
  if (wert === null) return null;
  try {
    return parseCalendarDate(wert.slice(0, 10));
  } catch {
    return null;
  }
}

/** „1 Tag“, sonst „n Tage“. Eine Ausgabe, die niemand liest, ist auch keine. */
export function tageText(anzahl: number): string {
  return anzahl === 1 ? '1 Tag' : `${anzahl} Tage`;
}

export function bewerte(
  stand: string | null,
  stichtag: string,
  politik: FrischePolitik,
): Bewertung {
  if (politik.warnAbTagen < 0 || politik.sperreAbTagen < politik.warnAbTagen) {
    throw new FrischeError(
      'Die Sperrschwelle muss mindestens so groß sein wie die Warnschwelle, und keine darf negativ sein.',
    );
  }
  const heute = alsTag(stichtag);
  if (heute === null) {
    throw new FrischeError('Der Stichtag ist kein Kalenderdatum.');
  }

  const tag = alsTag(stand);
  if (tag === null) {
    return {
      frische: 'unbekannt',
      alterTage: null,
      begruendung:
        stand === null
          ? 'Kein Datenstand hinterlegt. Unbekannt ist nicht aktuell.'
          : `Der Datenstand „${stand}“ ist kein lesbares Datum.`,
      blockiert: true,
    };
  }

  if (compareCalendarDates(tag, heute) > 0) {
    return {
      frische: 'unbekannt',
      alterTage: null,
      begruendung: `Der Datenstand ${tag} liegt nach dem Stichtag ${heute}. Das ist ein Fehler in den Daten oder eine falsch gestellte Uhr, aber keine Aktualität.`,
      blockiert: true,
    };
  }

  const alter = daysBetween(tag, heute);
  if (alter <= politik.warnAbTagen) {
    return {
      frische: 'frisch',
      alterTage: alter,
      begruendung: `${tageText(alter)} alt, Warnschwelle ${tageText(politik.warnAbTagen)}.`,
      blockiert: false,
    };
  }
  if (alter <= politik.sperreAbTagen) {
    return {
      frische: 'alternd',
      alterTage: alter,
      begruendung: `${tageText(alter)} alt und damit über der Warnschwelle von ${tageText(politik.warnAbTagen)}; gesperrt wird ab ${tageText(politik.sperreAbTagen)}.`,
      blockiert: false,
    };
  }
  return {
    frische: 'veraltet',
    alterTage: alter,
    begruendung: `${tageText(alter)} alt und damit über der Sperrschwelle von ${tageText(politik.sperreAbTagen)}.`,
    blockiert: true,
  };
}

/** Die schlechteste Bewertung gewinnt. Ein guter Teil rettet kein Ganzes. */
export const RANGFOLGE: readonly Frische[] = ['frisch', 'alternd', 'veraltet', 'unbekannt'];

export function schlechteste(werte: readonly Frische[]): Frische {
  // Nichts zu bewerten heißt nicht „alles in Ordnung“.
  if (werte.length === 0) return 'unbekannt';
  let ergebnis: Frische = 'frisch';
  for (const wert of werte) {
    if (RANGFOLGE.indexOf(wert) > RANGFOLGE.indexOf(ergebnis)) ergebnis = wert;
  }
  return ergebnis;
}
