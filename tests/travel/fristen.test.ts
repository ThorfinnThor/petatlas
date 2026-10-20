import { describe, expect, it } from 'vitest';

import { regelSaetze } from '../../src/features/travel/rules.ts';
import {
  VORLAUF_TAGE,
  fristenAus,
  fristenplan,
  tageVor,
} from '../../src/features/travel/fristen.ts';
import { reiseUmfang } from '../../src/features/travel/scope.ts';

const satz = regelSaetze()[0]!;

describe('Fristenplan', () => {
  it('liest die Rechtsfristen aus dem freigegebenen Regelsatz', () => {
    expect(fristenAus(satz)).toEqual({
      wartezeitTage: 21,
      mindestalterTage: 84,
      vorlaufTage: VORLAUF_TAGE,
    });
  });

  it('folgt dem Regelsatz, wenn sich eine Frist ändert', () => {
    const geaendert = JSON.parse(JSON.stringify(satz).replace('"min":21', '"min":30'));
    expect(fristenAus(geaendert).wartezeitTage).toBe(30);
  });

  it('gibt für jedes Ziel einen Plan in zeitlicher Reihenfolge mit Reisetag und Rückreise', () => {
    for (const land of reiseUmfang().destinations) {
      const plan = fristenplan(satz, land);
      const vorher = plan.filter((s) => s.tageVorAbreise !== null).map((s) => s.tageVorAbreise!);
      expect(vorher).toEqual([...vorher].sort((a, b) => b - a));
      expect(plan.at(-2)!.wann).toBe('Am Reisetag');
      expect(plan.at(-1)!.wann).toBe('Bei der Rückreise');
      expect(
        plan.some((s) => s.art === 'land'),
        land,
      ).toBe(true);
      for (const s of plan.filter((x) => x.art === 'recht')) {
        expect(s.quelle?.url, s.titel).toMatch(/^https:\/\//);
      }
    }
  });

  it('nennt Frankreichs Hundekategorie vor der Buchung und nur für Hunde', () => {
    const kategorie = fristenplan(satz, 'FR').find((s) => s.titel === 'Hundekategorie klären')!;
    expect(kategorie.nurHund).toBe(true);
    expect(kategorie.wann).toBe('Vor der Buchung');
  });

  it('kennzeichnet den Vorlauf als Empfehlung, nicht als Recht', () => {
    const vorlauf = fristenplan(satz, 'AT').find((s) => s.tageVorAbreise === VORLAUF_TAGE)!;
    expect(vorlauf.art).toBe('empfehlung');
    expect(vorlauf.text).toContain('keine gesetzliche Frist');
  });
});

describe('Datum rückwärts rechnen', () => {
  it('rechnet über Monats- und Jahresgrenzen ohne Zeitzonenfehler', () => {
    expect(tageVor('2026-12-20', 21)).toBe('2026-11-29');
    expect(tageVor('2027-01-10', 21)).toBe('2026-12-20');
    expect(tageVor('2026-03-29', 1)).toBe('2026-03-28');
  });
});
