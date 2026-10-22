import { describe, expect, it } from 'vitest';

import {
  oeffnungszeitenLesbar,
  spaetesteWerktagszeit,
  sprechzeiten,
  wochenplan,
  zeitenAm,
} from '../../src/features/map/opening-hours.ts';

describe('Öffnungszeiten lesen', () => {
  it('liest Tagesbereiche, mehrere Spannen und Samstag', () => {
    const plan = wochenplan('Mo-Fr 09:00-12:00, 15:00-19:00; Sa 11:00-13:00')!;
    expect(zeitenAm(plan, 'We')).toBe('09:00–12:00, 15:00–19:00');
    expect(zeitenAm(plan, 'Sa')).toBe('11:00–13:00');
    expect(zeitenAm(plan, 'Su')).toBe('');
    expect(sprechzeiten(plan)).toEqual({
      samstag: true,
      sonntag: false,
      abends: true,
      rundUmDieUhr: false,
    });
  });

  it('ergänzt Gruppen innerhalb einer Regel und ersetzt bei einer neuen Regel', () => {
    const plan = wochenplan('Mo,We,Fr 09:00-11:00, Mo-Fr 16:00-18:00; We off')!;
    expect(zeitenAm(plan, 'Mo')).toBe('09:00–11:00, 16:00–18:00');
    expect(zeitenAm(plan, 'Tu')).toBe('16:00–18:00');
    expect(zeitenAm(plan, 'We')).toBe('');
    expect(sprechzeiten(plan).abends).toBe(false);
  });

  it('erkennt 24/7 und Nachtdienste über Mitternacht', () => {
    expect(sprechzeiten(wochenplan('24/7')!).rundUmDieUhr).toBe(true);
    const nacht = wochenplan('Mo-Fr 19:00-06:00')!;
    expect(zeitenAm(nacht, 'Mo')).toBe('19:00–24:00');
    expect(spaetesteWerktagszeit(nacht)).toBe(1440);
  });

  it('übergeht Kommentare und Feiertage', () => {
    const plan = wochenplan('Mo-Fr 08:00-12:00 "und nach Vereinbarung"; Sa,PH 09:00-10:00')!;
    expect(zeitenAm(plan, 'Sa')).toBe('09:00–10:00');
    expect(zeitenAm(plan, 'Fr')).toBe('08:00–12:00');
  });

  it('gibt keine Aussage, wenn nur ein Kommentar dasteht oder die Angabe komplexer ist', () => {
    expect(wochenplan(null)).toBeNull();
    expect(wochenplan('"nach Vereinbarung"')).toBeNull();
    expect(wochenplan('Mo-Fr 16:30-18:30 || "nach telefonischer Vereinbarung"')).toBeNull();
    expect(wochenplan('Mo-Fr 10:00-12:00; Sa[1] 10:00-12:00')).toBeNull();
    expect(wochenplan('Mo-Fr 10:00-12:00; 16:00-19:00')).toBeNull();
  });

  it('hält eine verdrehte Spanne für einen Erfassungsfehler, nicht für Nachtdienst', () => {
    expect(wochenplan('Mo 11:30-13:00,14:00-13:00')).toBeNull();
  });

  it('versteht Tagesbereiche über das Wochenende hinweg', () => {
    const plan = wochenplan('Fr-Mo 10:00-12:00')!;
    expect(sprechzeiten(plan)).toMatchObject({ samstag: true, sonntag: true });
    expect(zeitenAm(plan, 'Tu')).toBe('');
  });
});

describe('Öffnungszeiten lesbar anzeigen', () => {
  it.each([
    ['Mo-Fr 09:00-18:00; Sa,Su,PH off', 'Mo–Fr 09:00–18:00 · Sa, So, Feiertage geschlossen'],
    [
      'Mo-Th 09:00-12:00,14:00-18:00; Fr 09:00-12:00',
      'Mo–Do 09:00–12:00, 14:00–18:00 · Fr 09:00–12:00',
    ],
    ['Mo-Fr 08:00-19:00, Sa 10:00 - 12:00', 'Mo–Fr 08:00–19:00, Sa 10:00–12:00'],
    ['Tu,We 10:00-12:00; Sa closed', 'Di, Mi 10:00–12:00 · Sa geschlossen'],
    ['24/7', 'rund um die Uhr'],
    ['Mo-Fr 09:00-12:00; "nach Vereinbarung"', 'Mo–Fr 09:00–12:00 · nach Vereinbarung'],
    ['Dec 24 off', 'Dez. 24 geschlossen'],
  ])('%s', (angabe, erwartet) => {
    expect(oeffnungszeitenLesbar(angabe)).toBe(erwartet);
  });
});
