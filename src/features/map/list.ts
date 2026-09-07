/**
 * M11-01 — Trefferliste.
 *
 * Reine Logik ohne DOM: filtern, nach Entfernung sortieren, ehrlich
 * beschriften. Dieselben Funktionen laufen im Build für die statische
 * Standardliste und im Browser für die gefilterte.
 *
 * Der wichtigste Satz dieser Datei steht in `leereListeHinweis`: **keine
 * Treffer heißt keine erfassten Treffer.** Aus einer leeren Liste folgt
 * nicht, dass es dort nichts gibt.
 */
import { entfernungMeter, ortsZuordnung } from './place-search.ts';

export type Kategorie = 'veterinary' | 'animal_shelter' | 'pet_shop' | 'dog_park';

export interface ListenOrt {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly lat: number;
  readonly lon: number;
  readonly coordinateSource: string;
  readonly municipality: string | null;
  readonly postalCode: string | null;
  readonly phone: string | null;
  readonly website: string | null;
  readonly openingHours: string | null;
  readonly emergency: boolean | null;
  readonly wheelchair: boolean | null;
  readonly fenced: boolean | null;
  readonly dogAllowed: boolean | null;
}

export interface ListenTreffer {
  readonly ort: ListenOrt;
  readonly entfernungMeter: number;
  /** „in Bremen“ oder „im Umkreis von Bremen“ — nie beides verwechselt. */
  readonly ortsLabel: string;
  readonly istInGemeinde: boolean;
  /** Punkt einer Fläche ist berechnet und wird als solcher benannt. */
  readonly punktBerechnet: boolean;
}

export const KATEGORIE_LABEL: Readonly<Record<string, string>> = {
  veterinary: 'Tierarztpraxis',
  animal_shelter: 'Tierheim',
  pet_shop: 'Zoofachhandel',
  dog_park: 'Hundewiese',
};

/**
 * Zählform je Kategorie: Einzahl und Mehrzahl. „1 Tierheime“ liest sich wie
 * ein Fehler in den Daten, obwohl nur die Grammatik falsch wäre.
 */
export const KATEGORIE_ZAEHLFORM: Readonly<Record<string, readonly [string, string]>> = {
  veterinary: ['Tierarztpraxis', 'Tierarztpraxen'],
  animal_shelter: ['Tierheim', 'Tierheime'],
  pet_shop: ['Zoofachgeschäft', 'Zoofachgeschäfte'],
  dog_park: ['Hundewiese', 'Hundewiesen'],
};

/** „1 Tierheim“, „34 Zoofachgeschäfte“. */
export function mengeMitLabel(anzahl: number, kategorie: string, locale = 'de-DE'): string {
  const formen = KATEGORIE_ZAEHLFORM[kategorie];
  const wort = formen === undefined ? kategorie : (formen[anzahl === 1 ? 0 : 1] ?? kategorie);
  return `${anzahl.toLocaleString(locale)} ${wort}`;
}

export interface ListenFilter {
  /** Mittelpunkt der Suche. */
  readonly mitte: { readonly latitude: number; readonly longitude: number };
  /** Name der gesuchten Gemeinde, für die Ortszuordnung. */
  readonly gemeinde: string;
  readonly radiusMeter: number;
  /** Leere Auswahl heißt alle Kategorien. */
  readonly kategorien: readonly string[];
  readonly maxTreffer?: number;
}

/** Radien, die die Oberfläche anbietet. */
export const RADIEN_METER: readonly number[] = [5_000, 10_000, 25_000, 50_000];

export function filtereOrte(
  orte: readonly ListenOrt[],
  filter: ListenFilter,
): readonly ListenTreffer[] {
  const kategorien = new Set(filter.kategorien);
  const maxTreffer = filter.maxTreffer ?? 100;

  return orte
    .filter((ort) => kategorien.size === 0 || kategorien.has(ort.category))
    .map((ort) => {
      const zuordnung = ortsZuordnung(ort.municipality, filter.gemeinde);
      return {
        ort,
        entfernungMeter: entfernungMeter(filter.mitte, {
          latitude: ort.lat,
          longitude: ort.lon,
        }),
        ortsLabel: zuordnung.label,
        istInGemeinde: zuordnung.istInGemeinde,
        punktBerechnet: ort.coordinateSource !== 'node',
      };
    })
    .filter((treffer) => treffer.entfernungMeter <= filter.radiusMeter)
    .sort((a, b) => {
      if (a.entfernungMeter !== b.entfernungMeter) return a.entfernungMeter - b.entfernungMeter;
      // Gleicher Abstand: stabile Reihenfolge über die ID.
      return a.ort.id < b.ort.id ? -1 : 1;
    })
    .slice(0, maxTreffer);
}

/** Entfernungsangabe für die Anzeige. */
export function formatiereEntfernung(meter: number, locale = 'de-DE'): string {
  if (meter < 1000) {
    return new Intl.NumberFormat(locale, {
      style: 'unit',
      unit: 'meter',
      unitDisplay: 'short',
    }).format(Math.round(meter / 10) * 10);
  }
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: 'kilometer',
    unitDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(meter / 1000);
}

/**
 * Was bei null Treffern dasteht.
 *
 * Bewusst umständlich formuliert: „keine erfassten Treffer“ ist etwas
 * anderes als „hier gibt es nichts“, und der Unterschied ist der ganze
 * Punkt.
 */
export function leereListeHinweis(gemeinde: string, radiusMeter: number): string {
  return (
    `Im Umkreis von ${formatiereEntfernung(radiusMeter)} um ${gemeinde} ist nichts erfasst, ` +
    'was zu den gewählten Filtern passt. Das heißt nicht, dass es dort nichts gibt — ' +
    'die Daten stammen aus OpenStreetMap und sind nicht vollständig.'
  );
}

/**
 * Hinweis zu einer Angabe, die die Quelle nicht führt. Wird überall dort
 * gebraucht, wo sonst eine Lücke wie eine Verneinung aussähe.
 */
export function unbekanntHinweis(feld: string): string {
  return `${feld}: nicht erfasst`;
}

/** Notdienst wird nie zugesichert, auch nicht bei `emergency: true`. */
export function notdienstHinweis(emergency: boolean | null): string | null {
  if (emergency !== true) return null;
  return 'In der Quelle als Notdienst eingetragen. Das ist keine Zusicherung, dass gerade jemand erreichbar ist — bitte anrufen.';
}
