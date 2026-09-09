import { describe, expect, it } from 'vitest';
import { supplementComparison } from '../../src/features/food/supplements.ts';
describe('Kostenvergleich ohne Dosierungsableitung', () => {
  it('berechnet Kommawerte und Reichweite', () => {
    const result = supplementComparison('19,95', '100', '2');
    expect(result.days).toBe(50);
    expect(result.dailyCost).toBeCloseTo(0.399, 10);
  });
  it.each(['0', '-1', '', 'NaN', '1e9', '2,3.4'])('weist ungültige Eingabe %s zurück', (input) => {
    expect(() => supplementComparison('20', '100', input)).toThrow();
  });
});
