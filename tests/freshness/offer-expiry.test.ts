// M17-04 — Der Preis im Browser. Die Zeit steht still, das DOM ist echt.
import { describe, expect, it } from 'vitest';

import { ablaufstatus, darfPreisZeigen } from '../../src/features/freshness/offer-expiry.ts';

const JETZT = '2026-09-08T12:00:00.000Z';

describe('Ablaufstatus', () => {
  it('nennt einen Preis mit Ablauf in der Zukunft gültig', () => {
    expect(ablaufstatus('2026-09-09T00:00:00.000Z', JETZT)).toBe('gueltig');
  });

  it('nennt einen Preis mit Ablauf in der Vergangenheit abgelaufen', () => {
    expect(ablaufstatus('2026-09-08T11:59:59.000Z', JETZT)).toBe('abgelaufen');
  });

  it('behandelt den Ablaufzeitpunkt selbst als abgelaufen', () => {
    expect(ablaufstatus(JETZT, JETZT)).toBe('abgelaufen');
  });

  it('nennt einen Preis ohne Ablaufangabe unbekannt und zeigt ihn nicht', () => {
    expect(ablaufstatus(null, JETZT)).toBe('unbekannt');
    expect(ablaufstatus('', JETZT)).toBe('unbekannt');
    expect(darfPreisZeigen(null, JETZT)).toBe(false);
  });

  it('nennt eine unlesbare Angabe unbekannt statt gültig', () => {
    expect(ablaufstatus('demnächst', JETZT)).toBe('unbekannt');
    expect(darfPreisZeigen('demnächst', JETZT)).toBe(false);
  });
});

// Das tatsächliche Ausblenden im Dokument prüft `tests/e2e/angebote.spec.ts`
// im echten Browser: dafür braucht es ein DOM, und ein nachgebautes DOM würde
// nur die eigene Attrappe prüfen.
