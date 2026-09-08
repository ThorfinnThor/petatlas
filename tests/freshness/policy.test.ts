// M17-04 — Die Zeit steht in diesen Tests still. Jede Schwelle wird von
// beiden Seiten angefasst, sonst prüft man nur die eigene Erwartung.
import { describe, expect, it } from 'vitest';

import {
  bewerte,
  FrischeError,
  schlechteste,
  tageText,
  type FrischePolitik,
} from '../../src/features/freshness/policy.ts';

const POLITIK: FrischePolitik = { warnAbTagen: 30, sperreAbTagen: 90 };
const HEUTE = '2026-09-08';

describe('Bewertung eines Datenstands', () => {
  it('nennt einen frischen Stand frisch und sperrt nicht', () => {
    const bewertung = bewerte('2026-09-01', HEUTE, POLITIK);
    expect(bewertung.frische).toBe('frisch');
    expect(bewertung.alterTage).toBe(7);
    expect(bewertung.blockiert).toBe(false);
  });

  it('ist am Tag der Warnschwelle noch frisch', () => {
    expect(bewerte('2026-08-09', HEUTE, POLITIK).frische).toBe('frisch');
  });

  it('ist einen Tag danach alternd', () => {
    const bewertung = bewerte('2026-08-08', HEUTE, POLITIK);
    expect(bewertung.alterTage).toBe(31);
    expect(bewertung.frische).toBe('alternd');
    // Alternd ist eine Warnung, keine Sperre.
    expect(bewertung.blockiert).toBe(false);
  });

  it('ist am Tag der Sperrschwelle noch alternd', () => {
    expect(bewerte('2026-06-10', HEUTE, POLITIK).frische).toBe('alternd');
  });

  it('ist einen Tag danach veraltet und sperrt', () => {
    const bewertung = bewerte('2026-06-09', HEUTE, POLITIK);
    expect(bewertung.alterTage).toBe(91);
    expect(bewertung.frische).toBe('veraltet');
    expect(bewertung.blockiert).toBe(true);
  });

  it('nimmt einen Zeitstempel genauso wie ein Datum', () => {
    expect(bewerte('2026-09-01T13:45:00+02:00', HEUTE, POLITIK).alterTage).toBe(7);
  });
});

describe('Unbekannt ist nicht frisch', () => {
  it('behandelt einen fehlenden Stand als unbekannt und sperrt', () => {
    const bewertung = bewerte(null, HEUTE, POLITIK);
    expect(bewertung.frische).toBe('unbekannt');
    expect(bewertung.alterTage).toBeNull();
    expect(bewertung.blockiert).toBe(true);
  });

  it('behandelt einen unlesbaren Stand als unbekannt', () => {
    expect(bewerte('demnächst', HEUTE, POLITIK).frische).toBe('unbekannt');
  });

  it('hält einen Stand aus der Zukunft nicht für besonders frisch', () => {
    const bewertung = bewerte('2026-12-24', HEUTE, POLITIK);
    expect(bewertung.frische).toBe('unbekannt');
    expect(bewertung.blockiert).toBe(true);
    expect(bewertung.begruendung).toContain('nach dem Stichtag');
  });
});

describe('Grenzen der Politik', () => {
  it('lehnt eine Sperrschwelle unter der Warnschwelle ab', () => {
    expect(() => bewerte(HEUTE, HEUTE, { warnAbTagen: 90, sperreAbTagen: 30 })).toThrow(
      FrischeError,
    );
  });

  it('lehnt einen Stichtag ab, der kein Datum ist', () => {
    expect(() => bewerte(HEUTE, 'heute', POLITIK)).toThrow(FrischeError);
  });
});

describe('Zusammenfassung', () => {
  it('nimmt die schlechteste Bewertung', () => {
    expect(schlechteste(['frisch', 'alternd', 'frisch'])).toBe('alternd');
    expect(schlechteste(['frisch', 'veraltet', 'alternd'])).toBe('veraltet');
    expect(schlechteste(['veraltet', 'unbekannt'])).toBe('unbekannt');
  });

  it('hält eine leere Liste nicht für frisch', () => {
    expect(schlechteste([])).toBe('unbekannt');
  });

  it('schreibt einen Tag im Singular', () => {
    expect(tageText(1)).toBe('1 Tag');
    expect(tageText(0)).toBe('0 Tage');
    expect(tageText(2)).toBe('2 Tage');
  });
});
