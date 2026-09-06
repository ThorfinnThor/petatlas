/**
 * M03-02 — Datum und Zeit.
 *
 * Zwei getrennte Begriffe, die nie vermischt werden:
 *
 * - **Kalenderdatum** (`CalendarDate`, `YYYY-MM-DD`): ein Tag ohne Uhrzeit und
 *   ohne Zone. Impffristen, Gültigkeitszeiträume und Reisedaten sind
 *   Kalenderdaten. „21 Tage vorher“ ist eine Kalenderrechnung, keine
 *   Subtraktion von Millisekunden.
 * - **Zeitpunkt** (`Instant`, UTC): ein Moment, etwa der Zeitstempel eines
 *   Imports. Er wird nur mit ausdrücklicher Zeitzone in ein Kalenderdatum
 *   umgerechnet.
 *
 * Ein `Date`-Objekt, das mal als Tag und mal als Zeitpunkt gelesen wird, ist
 * die Ursache der klassischen Mitternachtsfehler; deshalb gibt es hier keins.
 */

/** Kalenderdatum im Format YYYY-MM-DD. */
export type CalendarDate = string;

/** Zeitpunkt in Millisekunden seit Epoch, UTC. */
export type Instant = number;

export class DateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DateError';
  }
}

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseCalendarDate(value: string): CalendarDate {
  const match = CALENDAR_DATE.exec(value);
  if (!match) {
    throw new DateError(`Kalenderdatum muss YYYY-MM-DD sein, nicht "${value}".`);
  }
  const [, year, month, day] = match;
  const utc = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const check = new Date(utc);
  if (
    check.getUTCFullYear() !== Number(year) ||
    check.getUTCMonth() !== Number(month) - 1 ||
    check.getUTCDate() !== Number(day)
  ) {
    throw new DateError(`Kalenderdatum existiert nicht: "${value}".`);
  }
  return value;
}

function toUtcMillis(date: CalendarDate): number {
  const match = CALENDAR_DATE.exec(parseCalendarDate(date));
  // parseCalendarDate hat die Form bereits geprüft.
  const [, year, month, day] = match as RegExpExecArray;
  return Date.UTC(Number(year), Number(month) - 1, Number(day));
}

function fromUtcMillis(millis: number): CalendarDate {
  return new Date(millis).toISOString().slice(0, 10);
}

const MILLIS_PER_DAY = 86_400_000;

export function addDays(date: CalendarDate, days: number): CalendarDate {
  if (!Number.isSafeInteger(days)) {
    throw new DateError(`Tage müssen eine Ganzzahl sein: ${days}`);
  }
  return fromUtcMillis(toUtcMillis(date) + days * MILLIS_PER_DAY);
}

/** Ganze Tage von `from` bis `to`. Negativ, wenn `to` früher liegt. */
export function daysBetween(from: CalendarDate, to: CalendarDate): number {
  return (toUtcMillis(to) - toUtcMillis(from)) / MILLIS_PER_DAY;
}

export function compareCalendarDates(a: CalendarDate, b: CalendarDate): number {
  return Math.sign(toUtcMillis(a) - toUtcMillis(b));
}

/** Liegt `date` im Zeitraum? `until` darf offen sein. Beide Grenzen inklusiv. */
export function isWithinPeriod(
  date: CalendarDate,
  from: CalendarDate,
  until: CalendarDate | null,
): boolean {
  if (compareCalendarDates(date, from) < 0) return false;
  if (until === null) return true;
  return compareCalendarDates(date, until) <= 0;
}

/**
 * Der Kalendertag, an dem ein Zeitpunkt in einer bestimmten Zone liegt.
 * Die Zone ist Pflicht: derselbe Moment ist in Berlin und New York oft ein
 * anderer Tag.
 */
export function calendarDateInTimeZone(instant: Instant, timeZone: string): CalendarDate {
  if (!Number.isFinite(instant)) throw new DateError('Zeitpunkt muss endlich sein.');
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(instant));
  return parseCalendarDate(parts);
}

export function formatCalendarDate(date: CalendarDate, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(toUtcMillis(date)));
}
