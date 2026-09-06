/**
 * M03-04 — Bausteine, die mehrere Fachschemas teilen.
 */
import { z } from 'zod';

export const IsoTimestamp = z.iso.datetime({ offset: true });
export const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Erwartet wird YYYY-MM-DD.');
export const CountryCode = z.string().regex(/^[A-Z]{2}$/, 'Erwartet wird ein Ländercode wie DE.');
export const CurrencyCode = z.string().regex(/^[A-Z]{3}$/, 'Erwartet wird eine Währung wie EUR.');
export const MarketId = CountryCode;

/** Geldbetrag in ganzzahligen Untereinheiten. Nie als Gleitkommazahl. */
export const MinorAmount = z
  .number()
  .int('Geldbeträge sind ganzzahlige Untereinheiten.')
  .nonnegative('Ein Preis darf nicht negativ sein.');

/**
 * Tri-state: `true`, `false` oder `null`. `null` heißt unbekannt und darf
 * nirgends als „nein“, „erlaubt“ oder „geeignet“ gelesen werden.
 */
export const TriState = z.boolean().nullable();

export const Species = z.enum(['dog', 'cat', 'other']);
export type Species = z.infer<typeof Species>;

/** Zeitraum mit optional offenem Ende. Beide Grenzen sind Kalenderdaten. */
export const Period = z
  .object({ from: IsoDate, until: IsoDate.nullable() })
  .strict()
  .refine((value) => value.until === null || value.until >= value.from, {
    message: 'Zeitraum endet vor seinem Beginn.',
    path: ['until'],
  });
export type Period = z.infer<typeof Period>;

/** WGS84. Zahlen ohne Bereichsprüfung sind der häufigste Geo-Datenfehler. */
export const Coordinates = z
  .object({
    latitude: z.number().min(-90).max(90).refine(Number.isFinite, 'Breitengrad muss endlich sein.'),
    longitude: z
      .number()
      .min(-180)
      .max(180)
      .refine(Number.isFinite, 'Längengrad muss endlich sein.'),
  })
  .strict()
  .refine((value) => !(value.latitude === 0 && value.longitude === 0), {
    message: 'Null-Insel (0,0) ist fast immer ein Datenfehler, kein Ort.',
  });
export type Coordinates = z.infer<typeof Coordinates>;

/**
 * GTIN als String, damit führende Nullen erhalten bleiben. Die Prüfziffer
 * wird tatsächlich gerechnet: eine Zahl der richtigen Länge ist noch keine
 * gültige GTIN.
 */
export function isValidGtin(value: string): boolean {
  if (!/^\d+$/.test(value)) return false;
  if (![8, 12, 13, 14].includes(value.length)) return false;

  const digits = [...value].map(Number);
  const check = digits.pop() as number;
  // Von rechts nach links abwechselnd mit 3 und 1 gewichten.
  const total = digits
    .reverse()
    .reduce((sum, digit, index) => sum + digit * (index % 2 === 0 ? 3 : 1), 0);
  return (10 - (total % 10)) % 10 === check;
}

export const Gtin = z.string().refine(isValidGtin, 'GTIN-Prüfziffer stimmt nicht.');
