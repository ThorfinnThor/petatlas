/**
 * M03-02 — Einheiten.
 *
 * Intern gilt genau ein System: Gewichte in Gramm, Längen in Metern, beides
 * als Ganzzahl. Die Umrechnung in das Anzeigesystem eines Marktes passiert
 * ausschließlich bei der Ausgabe. Eine Zahl ohne Einheit ist keine Angabe.
 */

export type MeasurementSystem = 'metric' | 'us';

export class UnitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UnitError';
  }
}

/** Gewicht in Gramm. */
export interface Weight {
  readonly grams: number;
}

/** Länge in Metern. */
export interface Length {
  readonly meters: number;
}

const GRAMS_PER_KILOGRAM = 1000;
const GRAMS_PER_POUND = 453.59237;
const GRAMS_PER_OUNCE = 28.349523125;
const METERS_PER_KILOMETER = 1000;
const METERS_PER_MILE = 1609.344;

function requireFinite(value: number, label: string): number {
  if (!Number.isFinite(value)) throw new UnitError(`${label} muss eine endliche Zahl sein.`);
  return value;
}

export function grams(value: number): Weight {
  requireFinite(value, 'Gewicht');
  if (value < 0) throw new UnitError('Gewicht darf nicht negativ sein.');
  return { grams: Math.round(value) };
}

export function fromKilograms(value: number): Weight {
  return grams(requireFinite(value, 'Gewicht') * GRAMS_PER_KILOGRAM);
}

export function fromPounds(value: number): Weight {
  return grams(requireFinite(value, 'Gewicht') * GRAMS_PER_POUND);
}

export function toKilograms(weight: Weight): number {
  return weight.grams / GRAMS_PER_KILOGRAM;
}

export function toPounds(weight: Weight): number {
  return weight.grams / GRAMS_PER_POUND;
}

export function meters(value: number): Length {
  requireFinite(value, 'Länge');
  if (value < 0) throw new UnitError('Länge darf nicht negativ sein.');
  return { meters: Math.round(value) };
}

export function fromKilometers(value: number): Length {
  return meters(requireFinite(value, 'Länge') * METERS_PER_KILOMETER);
}

export function toKilometers(length: Length): number {
  return length.meters / METERS_PER_KILOMETER;
}

export function toMiles(length: Length): number {
  return length.meters / METERS_PER_MILE;
}

/**
 * Anzeige eines Gewichts im System des Marktes. Unter 1000 Gramm bleibt es
 * bei Gramm beziehungsweise Unzen, damit kleine Angaben nicht als 0,1 kg
 * erscheinen.
 */
export function formatWeight(weight: Weight, locale: string, system: MeasurementSystem): string {
  const format = (value: number, unit: string, digits: number) =>
    new Intl.NumberFormat(locale, {
      style: 'unit',
      unit,
      unitDisplay: 'short',
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    }).format(value);

  if (system === 'us') {
    const ounces = weight.grams / GRAMS_PER_OUNCE;
    return ounces < 16 ? format(ounces, 'ounce', 1) : format(toPounds(weight), 'pound', 2);
  }
  return weight.grams < GRAMS_PER_KILOGRAM
    ? format(weight.grams, 'gram', 0)
    : format(toKilograms(weight), 'kilogram', 2);
}

export function formatLength(length: Length, locale: string, system: MeasurementSystem): string {
  const format = (value: number, unit: string, digits: number) =>
    new Intl.NumberFormat(locale, {
      style: 'unit',
      unit,
      unitDisplay: 'short',
      minimumFractionDigits: 0,
      maximumFractionDigits: digits,
    }).format(value);

  if (system === 'us') {
    return format(toMiles(length), 'mile', 1);
  }
  return length.meters < METERS_PER_KILOMETER
    ? format(length.meters, 'meter', 0)
    : format(toKilometers(length), 'kilometer', 1);
}
