// M03-02 — Kalenderdatum und Zeitpunkt bleiben getrennt.
// Die Mitternachts- und Zeitzonenfälle sind der eigentliche Zweck dieser Tests.
import { describe, expect, it } from 'vitest';

import {
  DateError,
  addDays,
  calendarDateInTimeZone,
  compareCalendarDates,
  daysBetween,
  formatCalendarDate,
  isWithinPeriod,
  parseCalendarDate,
} from '../src/domain/dates.ts';

describe('Kalenderdatum', () => {
  it('nimmt nur YYYY-MM-DD an', () => {
    expect(parseCalendarDate('2026-09-06')).toBe('2026-09-06');
    expect(() => parseCalendarDate('06.09.2026')).toThrow(DateError);
    expect(() => parseCalendarDate('2026-9-6')).toThrow(DateError);
  });

  it('lehnt ein nicht existierendes Datum ab, statt es zu verschieben', () => {
    expect(() => parseCalendarDate('2026-02-30')).toThrow(/existiert nicht/);
    expect(() => parseCalendarDate('2025-02-29')).toThrow(/existiert nicht/);
  });

  it('akzeptiert den Schalttag eines Schaltjahres', () => {
    expect(parseCalendarDate('2028-02-29')).toBe('2028-02-29');
  });
});

describe('Kalenderrechnung', () => {
  it('addiert Tage über Monats- und Jahresgrenzen', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('rechnet über eine Zeitumstellung hinweg volle Tage', () => {
    // In Europe/Berlin liegt der Sommerzeitbeginn 2026 am 29. März.
    // Eine Kalenderrechnung darf davon nicht betroffen sein.
    expect(addDays('2026-03-28', 2)).toBe('2026-03-30');
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
  });

  it('zählt eine typische Impffrist von 21 Tagen', () => {
    expect(addDays('2026-06-01', 21)).toBe('2026-06-22');
    expect(daysBetween('2026-06-01', '2026-06-22')).toBe(21);
  });

  it('liefert negative Abstände für falsch geordnete Daten', () => {
    expect(daysBetween('2026-06-22', '2026-06-01')).toBe(-21);
  });

  it('vergleicht Daten ohne Stringvergleich-Fallen', () => {
    expect(compareCalendarDates('2026-09-06', '2026-10-01')).toBe(-1);
    expect(compareCalendarDates('2026-09-06', '2026-09-06')).toBe(0);
  });

  it('lehnt gebrochene Tagesangaben ab', () => {
    expect(() => addDays('2026-09-06', 1.5)).toThrow(/Ganzzahl/);
  });
});

describe('Geltungszeitraum', () => {
  it('schließt beide Grenzen ein', () => {
    expect(isWithinPeriod('2026-01-01', '2026-01-01', '2026-12-31')).toBe(true);
    expect(isWithinPeriod('2026-12-31', '2026-01-01', '2026-12-31')).toBe(true);
  });

  it('erkennt einen Tag vor Inkrafttreten als außerhalb', () => {
    expect(isWithinPeriod('2025-12-31', '2026-01-01', '2026-12-31')).toBe(false);
  });

  it('behandelt ein offenes Ende als weiterhin gültig', () => {
    expect(isWithinPeriod('2099-01-01', '2026-01-01', null)).toBe(true);
  });
});

describe('Zeitpunkt und Zone', () => {
  it('ordnet denselben Moment je Zone einem anderen Kalendertag zu', () => {
    // 2026-09-06T22:30:00Z ist in Berlin bereits der 7. September.
    const moment = Date.UTC(2026, 8, 6, 22, 30);
    expect(calendarDateInTimeZone(moment, 'Europe/Berlin')).toBe('2026-09-07');
    expect(calendarDateInTimeZone(moment, 'UTC')).toBe('2026-09-06');
    expect(calendarDateInTimeZone(moment, 'America/New_York')).toBe('2026-09-06');
  });

  it('ordnet einen Moment kurz nach Mitternacht UTC in New York noch dem Vortag zu', () => {
    const moment = Date.UTC(2026, 8, 6, 0, 30);
    expect(calendarDateInTimeZone(moment, 'America/New_York')).toBe('2026-09-05');
    expect(calendarDateInTimeZone(moment, 'Europe/Berlin')).toBe('2026-09-06');
  });

  it('lehnt einen ungültigen Zeitpunkt ab', () => {
    expect(() => calendarDateInTimeZone(Number.NaN, 'UTC')).toThrow(/endlich/);
  });
});

describe('Ausgabe', () => {
  it('formatiert je Locale und verschiebt dabei nicht den Tag', () => {
    expect(formatCalendarDate('2026-09-06', 'de-DE')).toBe('06.09.2026');
    expect(formatCalendarDate('2026-09-06', 'en-US')).toBe('09/06/2026');
  });
});
