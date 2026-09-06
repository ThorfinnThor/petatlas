// M03-02 — Einheiten: intern Gramm und Meter, Anzeige je Marktsystem.
import { describe, expect, it } from 'vitest';

import {
  UnitError,
  formatLength,
  formatWeight,
  fromKilograms,
  fromKilometers,
  fromPounds,
  grams,
  meters,
  toKilograms,
  toMiles,
  toPounds,
} from '../src/domain/units.ts';

describe('Gewicht', () => {
  it('speichert intern Gramm als Ganzzahl', () => {
    expect(fromKilograms(2.5).grams).toBe(2500);
    expect(grams(1234.6).grams).toBe(1235);
  });

  it('rechnet Pfund in Gramm um', () => {
    // 1 lb = 453,59237 g, intern auf volle Gramm gerundet.
    expect(fromPounds(1).grams).toBe(454);
    expect(fromPounds(2).grams).toBe(907);
  });

  it('speichert bewusst nur volle Gramm, mit begrenzter Rückrechnung', () => {
    // Die Ganzzahlspeicherung ist Absicht: ein halbes Gramm ist für Futter-,
    // Gewichts- und Produktangaben ohne Bedeutung. Die Rückrechnung kann
    // deshalb höchstens um ein halbes Gramm abweichen.
    expect(toPounds(grams(453.59237))).toBeCloseTo(1, 2);
    expect(grams(453.59237).grams).toBe(454);
  });

  it('bleibt bei Hin- und Rückrechnung stabil', () => {
    expect(toKilograms(fromKilograms(12.34))).toBeCloseTo(12.34, 3);
  });

  it('lehnt negative Gewichte ab', () => {
    expect(() => grams(-1)).toThrow(UnitError);
    expect(() => fromKilograms(-0.5)).toThrow(/negativ/);
  });

  it('lehnt NaN ab, statt 0 anzunehmen', () => {
    expect(() => grams(Number.NaN)).toThrow(/endliche Zahl/);
  });
});

describe('Länge', () => {
  it('speichert intern Meter als Ganzzahl', () => {
    expect(fromKilometers(1.5).meters).toBe(1500);
  });

  it('rechnet Meter in Meilen um', () => {
    // Intern volle Meter: 1609,344 m werden als 1609 m gespeichert.
    expect(meters(1609.344).meters).toBe(1609);
    expect(toMiles(meters(1609.344))).toBeCloseTo(1, 3);
    expect(toMiles(fromKilometers(10))).toBeCloseTo(6.2137, 3);
  });

  it('lehnt negative Längen ab', () => {
    expect(() => meters(-1)).toThrow(/negativ/);
  });
});

describe('Anzeige folgt dem Marktsystem, nicht dem Speicherformat', () => {
  it('zeigt ein kleines Gewicht metrisch in Gramm', () => {
    expect(formatWeight(grams(250), 'de-DE', 'metric')).toMatch(/250/);
    expect(formatWeight(grams(250), 'de-DE', 'metric')).not.toMatch(/kg/);
  });

  it('zeigt ein großes Gewicht metrisch in Kilogramm', () => {
    expect(formatWeight(fromKilograms(12.5), 'de-DE', 'metric')).toMatch(/12,5/);
  });

  it('zeigt dasselbe Gewicht im US-System in Pfund', () => {
    const anzeige = formatWeight(fromKilograms(12.5), 'en-US', 'us');
    expect(anzeige).toMatch(/27\.5/);
    expect(anzeige).not.toMatch(/kg/);
  });

  it('zeigt ein kleines Gewicht im US-System in Unzen', () => {
    expect(formatWeight(grams(100), 'en-US', 'us')).toMatch(/oz/);
  });

  it('zeigt Entfernungen metrisch und im US-System unterschiedlich', () => {
    const metrisch = formatLength(fromKilometers(10), 'de-DE', 'metric');
    const amerikanisch = formatLength(fromKilometers(10), 'en-US', 'us');
    expect(metrisch).toMatch(/10/);
    expect(amerikanisch).toMatch(/6\.2/);
    expect(metrisch).not.toBe(amerikanisch);
  });

  it('zeigt kurze Entfernungen metrisch in Metern', () => {
    expect(formatLength(meters(300), 'de-DE', 'metric')).toMatch(/300/);
  });
});
