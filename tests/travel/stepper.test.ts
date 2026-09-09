// M21-04 — Die Schrittanzeige markiert, wo man steht, und rät nicht.
import { describe, expect, it } from 'vitest';

import { aktiverSchritt } from '../../src/features/travel/stepper.ts';

const POSITIONEN = [
  { id: 'schritt-reise', oben: 0 },
  { id: 'schritt-tier', oben: 500 },
  { id: 'schritt-angaben', oben: 1200 },
  { id: 'schritt-ergebnis', oben: 2000 },
];

describe('aktiverSchritt', () => {
  it('nennt den Abschnitt, in dem der Lesepunkt steht', () => {
    expect(aktiverSchritt(POSITIONEN, 0)).toBe('schritt-reise');
    expect(aktiverSchritt(POSITIONEN, 499)).toBe('schritt-reise');
    expect(aktiverSchritt(POSITIONEN, 500)).toBe('schritt-tier');
    expect(aktiverSchritt(POSITIONEN, 1500)).toBe('schritt-angaben');
    expect(aktiverSchritt(POSITIONEN, 99_999)).toBe('schritt-ergebnis');
  });

  it('bleibt beim ersten Schritt, wenn darüber gescrollt wird', () => {
    expect(aktiverSchritt(POSITIONEN, -300)).toBe('schritt-reise');
  });

  it('markiert nichts, wenn es nichts zu markieren gibt', () => {
    expect(aktiverSchritt([], 100)).toBeNull();
  });
});
