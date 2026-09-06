/**
 * M03-02 — Geld.
 *
 * Geld ist ein ganzzahliger Betrag in Untereinheiten plus ISO-4217-Währung.
 * Es gibt keine Gleitkommabeträge: 0.1 + 0.2 ist in Gleitkomma nicht 0.3, und
 * ein Cent Abweichung in einer Kostenschätzung ist ein Fehler, keine Rundung.
 *
 * Multiplikation mit einem Dezimalfaktor (etwa dem Leistungsfaktor der GOT)
 * läuft über exakte Ganzzahlarithmetik: der Faktor wird an seiner
 * Dezimalstelle in Zähler und Nenner zerlegt, statt ihn als Gleitkommazahl zu
 * verwenden.
 */

/** Bekannte Währungen und ihre Anzahl Nachkommastellen (ISO 4217). */
const CURRENCY_MINOR_UNITS: Readonly<Record<string, number>> = {
  EUR: 2,
  USD: 2,
};

export interface Money {
  /** Ganzzahliger Betrag in Untereinheiten, z. B. Cent. */
  readonly amountMinor: number;
  /** ISO-4217-Code, z. B. EUR. */
  readonly currency: string;
}

export type Rounding = 'half-up' | 'half-even' | 'down';

export class MoneyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MoneyError';
  }
}

export function minorUnits(currency: string): number {
  const digits = CURRENCY_MINOR_UNITS[currency];
  if (digits === undefined) {
    throw new MoneyError(`Unbekannte Währung: ${currency}. Nachkommastellen sind nicht geraten.`);
  }
  return digits;
}

export function money(amountMinor: number, currency: string): Money {
  minorUnits(currency);
  if (!Number.isSafeInteger(amountMinor)) {
    throw new MoneyError(
      `Betrag muss eine sichere Ganzzahl in Untereinheiten sein: ${amountMinor}`,
    );
  }
  return { amountMinor, currency };
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new MoneyError(
      `Währungen dürfen nicht vermischt werden: ${a.currency} und ${b.currency}`,
    );
  }
}

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amountMinor + b.amountMinor, a.currency);
}

export function subtract(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return money(a.amountMinor - b.amountMinor, a.currency);
}

export function sum(values: readonly Money[], currency: string): Money {
  return values.reduce((total, value) => add(total, value), money(0, currency));
}

/** Multiplikation mit einer ganzen Menge. Bleibt exakt. */
export function multiplyByQuantity(value: Money, quantity: number): Money {
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    throw new MoneyError(`Menge muss eine nicht negative Ganzzahl sein: ${quantity}`);
  }
  return money(value.amountMinor * quantity, value.currency);
}

/** Zerlegt einen Dezimalfaktor exakt in Zähler und Zehnerpotenz. */
function factorParts(factor: number): { numerator: number; denominator: number } {
  if (!Number.isFinite(factor) || factor < 0) {
    throw new MoneyError(`Faktor muss endlich und nicht negativ sein: ${factor}`);
  }
  // toFixed(6) begrenzt die zulässige Genauigkeit ausdrücklich, statt eine
  // beliebige Gleitkommadarstellung stillschweigend zu übernehmen.
  const text = factor.toFixed(6).replace(/0+$/, '').replace(/\.$/, '');
  const [whole = '0', fraction = ''] = text.split('.');
  const denominator = 10 ** fraction.length;
  const numerator = Number(`${whole}${fraction}`);
  if (!Number.isSafeInteger(numerator)) {
    throw new MoneyError(`Faktor ist zu genau oder zu groß: ${factor}`);
  }
  return { numerator, denominator };
}

function divideRounded(numerator: number, denominator: number, rounding: Rounding): number {
  const sign = numerator < 0 ? -1 : 1;
  const absolute = Math.abs(numerator);
  const quotient = Math.floor(absolute / denominator);
  const remainder = absolute - quotient * denominator;
  const twice = remainder * 2;

  let rounded = quotient;
  if (rounding === 'down') {
    rounded = quotient;
  } else if (twice > denominator) {
    rounded = quotient + 1;
  } else if (twice === denominator) {
    // Genau die Hälfte: half-up rundet auf, half-even zur geraden Zahl.
    rounded = rounding === 'half-up' ? quotient + 1 : quotient + (quotient % 2);
  }
  return sign * rounded;
}

/**
 * Multiplikation mit einem Dezimalfaktor, centgenau gerundet.
 * Standard ist kaufmännisches Aufrunden bei genau einer halben Untereinheit.
 */
export function multiplyByFactor(
  value: Money,
  factor: number,
  rounding: Rounding = 'half-up',
): Money {
  const { numerator, denominator } = factorParts(factor);
  return money(divideRounded(value.amountMinor * numerator, denominator, rounding), value.currency);
}

/** Prozentwert, z. B. Umsatzsteuer. Steuersatz ist Konfiguration, keine Annahme. */
export function percentageOf(value: Money, percent: number, rounding: Rounding = 'half-up'): Money {
  return multiplyByFactor(value, percent / 100, rounding);
}

export function isZero(value: Money): boolean {
  return value.amountMinor === 0;
}

export function compare(a: Money, b: Money): number {
  assertSameCurrency(a, b);
  return Math.sign(a.amountMinor - b.amountMinor);
}

/** Ausgabe nur über die Locale-Schicht. Kein hart geschriebenes Eurozeichen. */
export function formatMoney(value: Money, locale: string): string {
  const digits = minorUnits(value.currency);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: value.currency,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value.amountMinor / 10 ** digits);
}

/** Nur für Ein- und Ausgabe an den Rändern, nicht für Zwischenrechnungen. */
export function fromMajorUnits(amount: number, currency: string): Money {
  const digits = minorUnits(currency);
  const scaled = Math.round(amount * 10 ** digits);
  return money(scaled, currency);
}
