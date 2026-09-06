// M03-02 — Geld: Rundung, Währungstrennung, Faktoren.
// Die Erwartungswerte sind von Hand gerechnet, nicht aus der Implementierung erzeugt.
import { describe, expect, it } from 'vitest';

import {
  MoneyError,
  add,
  compare,
  formatMoney,
  fromMajorUnits,
  money,
  multiplyByFactor,
  multiplyByQuantity,
  percentageOf,
  subtract,
  sum,
} from '../src/domain/money.ts';

describe('Konstruktion', () => {
  it('verlangt eine Ganzzahl in Untereinheiten', () => {
    expect(() => money(10.5, 'EUR')).toThrow(MoneyError);
  });

  it('lehnt eine unbekannte Währung ab, statt zwei Nachkommastellen anzunehmen', () => {
    expect(() => money(100, 'XYZ')).toThrow(/Unbekannte Währung/);
  });

  it('erlaubt negative Beträge, etwa Gutschriften', () => {
    expect(money(-250, 'EUR').amountMinor).toBe(-250);
  });
});

describe('Grundrechenarten', () => {
  it('addiert und subtrahiert exakt', () => {
    expect(add(money(1000, 'EUR'), money(2050, 'EUR')).amountMinor).toBe(3050);
    expect(subtract(money(1000, 'EUR'), money(2050, 'EUR')).amountMinor).toBe(-1050);
  });

  it('vermischt keine Währungen', () => {
    expect(() => add(money(100, 'EUR'), money(100, 'USD'))).toThrow(/vermischt/);
    expect(() => compare(money(100, 'EUR'), money(100, 'USD'))).toThrow(/vermischt/);
  });

  it('summiert eine leere Liste zu null in der angegebenen Währung', () => {
    expect(sum([], 'EUR')).toEqual({ amountMinor: 0, currency: 'EUR' });
  });

  it('vermeidet den klassischen Gleitkommafehler', () => {
    // 0,10 + 0,20 muss exakt 0,30 sein.
    expect(add(money(10, 'EUR'), money(20, 'EUR')).amountMinor).toBe(30);
  });
});

describe('Mengen und Faktoren', () => {
  it('rechnet 10,00 EUR mal Faktor 2 mal Menge 3 auf 60,00 EUR', () => {
    // Synthetischer Rechentest aus QUALITY_GATES, keine reale GOT-Position.
    const grundwert = money(1000, 'EUR');
    const mitFaktor = multiplyByFactor(grundwert, 2);
    expect(mitFaktor.amountMinor).toBe(2000);
    expect(multiplyByQuantity(mitFaktor, 3).amountMinor).toBe(6000);
  });

  it('rechnet einen Dezimalfaktor centgenau', () => {
    // 12,34 EUR × 2,3 = 28,382 EUR → 28,38 EUR
    expect(multiplyByFactor(money(1234, 'EUR'), 2.3).amountMinor).toBe(2838);
  });

  it('rundet genau eine halbe Untereinheit kaufmännisch auf', () => {
    // 0,05 EUR × 1,5 = 0,075 EUR → 0,08 EUR
    expect(multiplyByFactor(money(5, 'EUR'), 1.5).amountMinor).toBe(8);
    // 0,01 EUR × 0,5 = 0,005 EUR → 0,01 EUR
    expect(multiplyByFactor(money(1, 'EUR'), 0.5).amountMinor).toBe(1);
  });

  it('unterstützt kaufmännisch, mathematisch und abschneidend', () => {
    expect(multiplyByFactor(money(5, 'EUR'), 1.5, 'half-up').amountMinor).toBe(8);
    expect(multiplyByFactor(money(5, 'EUR'), 1.5, 'half-even').amountMinor).toBe(8);
    expect(multiplyByFactor(money(1, 'EUR'), 0.5, 'half-even').amountMinor).toBe(0);
    expect(multiplyByFactor(money(1, 'EUR'), 0.9, 'down').amountMinor).toBe(0);
  });

  it('rundet negative Beträge symmetrisch zum Betrag', () => {
    expect(multiplyByFactor(money(-5, 'EUR'), 1.5).amountMinor).toBe(-8);
  });

  it('lehnt eine gebrochene Menge ab', () => {
    expect(() => multiplyByQuantity(money(1000, 'EUR'), 2.5)).toThrow(/Ganzzahl/);
  });

  it('lehnt eine negative Menge ab', () => {
    expect(() => multiplyByQuantity(money(1000, 'EUR'), -1)).toThrow(/nicht negativ/);
  });

  it('lehnt einen negativen Faktor ab', () => {
    expect(() => multiplyByFactor(money(1000, 'EUR'), -2)).toThrow(/nicht negativ/);
  });

  it('rechnet einen Steuersatz auf den Nettowert', () => {
    // 60,00 EUR × 19 % = 11,40 EUR
    expect(percentageOf(money(6000, 'EUR'), 19).amountMinor).toBe(1140);
  });
});

describe('Ränder und Ausgabe', () => {
  it('wandelt Haupt- in Untereinheiten', () => {
    expect(fromMajorUnits(10, 'EUR').amountMinor).toBe(1000);
    expect(fromMajorUnits(0.1, 'EUR').amountMinor).toBe(10);
  });

  it('formatiert je Locale, ohne ein hart geschriebenes Währungszeichen', () => {
    const deutsch = formatMoney(money(6000, 'EUR'), 'de-DE');
    expect(deutsch).toContain('60,00');
    expect(deutsch).toContain('€');

    const amerikanisch = formatMoney(money(6000, 'USD'), 'en-US');
    expect(amerikanisch).toContain('60.00');
    expect(amerikanisch).toContain('$');
  });

  it('zeigt denselben Betrag je nach Locale unterschiedlich', () => {
    expect(formatMoney(money(123456, 'EUR'), 'de-DE')).not.toBe(
      formatMoney(money(123456, 'EUR'), 'en-US'),
    );
  });
});
