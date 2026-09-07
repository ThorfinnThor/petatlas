// M12-02 — Regeln sind Daten. Unbekannt ist nicht erfüllt, und nichts wird geraten.
import { describe, expect, it } from 'vitest';

import { TravelRuleSchema, type TravelRule } from '../../src/domain/schemas/travel.ts';
import {
  TravelEngineError,
  istAnwendbar,
  pruefeReise,
  tageZwischen,
  werteAus,
  type Route,
} from '../../src/features/travel/engine.ts';

const ROUTE: Route = {
  originCountry: 'DE',
  destinationCountry: 'IT',
  transitCountries: ['AT'],
  species: 'dog',
  context: 'private_accompanied',
};

/** Synthetische Regel; die echten kommen mit Fundstelle und Freigabe. */
function regel(overrides: Partial<TravelRule> = {}): TravelRule {
  return TravelRuleSchema.parse({
    ruleId: 'synthetische-regel',
    requirementId: 'microchip',
    priority: 0,
    originCountry: 'DE',
    destinationCountry: 'IT',
    transitCountries: [],
    species: 'dog',
    context: 'private_accompanied',
    validity: { from: '2026-01-01', until: null },
    officialSourceUrl: 'https://example.invalid/amtliche-quelle',
    condition: { op: 'eq', field: 'microchipped', value: true },
    guidance: 'Synthetischer Hinweistext für den Test.',
    reviewedAt: '2026-01-01T00:00:00+00:00',
    reviewedBy: 'Synthetische Prüfperson',
    ...overrides,
  });
}

describe('Prädikate', () => {
  it('vergleicht Werte genau', () => {
    expect(werteAus({ op: 'eq', field: 'a', value: true }, { a: true })).toBe('fulfilled');
    expect(werteAus({ op: 'eq', field: 'a', value: true }, { a: false })).toBe('not_fulfilled');
    // Keine lose Gleichheit: 1 ist nicht true.
    expect(werteAus({ op: 'eq', field: 'a', value: true }, { a: 1 })).toBe('not_fulfilled');
  });

  it('behandelt eine fehlende Angabe als unbekannt, nicht als falsch', () => {
    expect(werteAus({ op: 'eq', field: 'a', value: true }, {})).toBe('unknown');
    expect(werteAus({ op: 'eq', field: 'a', value: true }, { a: null })).toBe('unknown');
    expect(werteAus({ op: 'in', field: 'a', values: ['x'] }, {})).toBe('unknown');
  });

  it('wertet „all“ streng aus', () => {
    const bedingung = {
      op: 'all',
      of: [
        { op: 'eq', field: 'a', value: true },
        { op: 'eq', field: 'b', value: true },
      ],
    };
    expect(werteAus(bedingung, { a: true, b: true })).toBe('fulfilled');
    expect(werteAus(bedingung, { a: true })).toBe('unknown');
    expect(werteAus(bedingung, { a: false })).toBe('not_fulfilled');
    // Ein sicher unerfüllter Teil schlägt eine offene Frage.
    expect(werteAus(bedingung, { a: false, b: undefined })).toBe('not_fulfilled');
  });

  it('wertet „any“ streng aus', () => {
    const bedingung = {
      op: 'any',
      of: [
        { op: 'eq', field: 'a', value: true },
        { op: 'eq', field: 'b', value: true },
      ],
    };
    expect(werteAus(bedingung, { a: true })).toBe('fulfilled');
    expect(werteAus(bedingung, { a: false })).toBe('unknown');
    expect(werteAus(bedingung, { a: false, b: false })).toBe('not_fulfilled');
  });

  it('vergleicht Kalenderdaten, nicht Zeitpunkte', () => {
    const vorher = { op: 'dateBefore', field: 'd', date: '2026-06-01' };
    expect(werteAus(vorher, { d: '2026-05-31' })).toBe('fulfilled');
    expect(werteAus(vorher, { d: '2026-06-01' })).toBe('not_fulfilled');
    expect(werteAus({ op: 'dateAfter', field: 'd', date: '2026-06-01' }, { d: '2026-06-02' })).toBe(
      'fulfilled',
    );
  });

  it('hält ein unmögliches Datum für unbekannt, nicht für gültig', () => {
    expect(
      werteAus({ op: 'dateBefore', field: 'd', date: '2026-06-01' }, { d: '2026-02-31' }),
    ).toBe('unknown');
    expect(
      werteAus({ op: 'dateBefore', field: 'd', date: '2026-06-01' }, { d: '01.06.2026' }),
    ).toBe('unknown');
  });

  it('zählt Tage über Monats-, Jahres- und Schaltjahresgrenzen', () => {
    expect(tageZwischen('2026-02-28', '2026-03-01')).toBe(1);
    expect(tageZwischen('2024-02-28', '2024-03-01')).toBe(2); // Schaltjahr
    expect(tageZwischen('2026-12-31', '2027-01-01')).toBe(1);
    expect(tageZwischen('2026-03-28', '2026-03-30')).toBe(2); // Zeitumstellung
    expect(tageZwischen('2026-01-01', '2026-01-01')).toBe(0);
    expect(tageZwischen('2026-01-02', '2026-01-01')).toBe(-1);
  });

  it('prüft Fristen mit offenen Grenzen', () => {
    const frist = { op: 'daysBetween', from: 'impfung', to: 'reise', min: 21, max: null };
    expect(werteAus(frist, { impfung: '2026-05-01', reise: '2026-05-22' })).toBe('fulfilled');
    expect(werteAus(frist, { impfung: '2026-05-01', reise: '2026-05-21' })).toBe('not_fulfilled');
    expect(werteAus(frist, { impfung: '2026-05-01' })).toBe('unknown');
    const spanne = { op: 'daysBetween', from: 'a', to: 'b', min: null, max: 10 };
    expect(werteAus(spanne, { a: '2026-05-01', b: '2026-05-11' })).toBe('fulfilled');
    expect(werteAus(spanne, { a: '2026-05-01', b: '2026-05-12' })).toBe('not_fulfilled');
  });

  it('führt keinen unbekannten Operator aus', () => {
    expect(() => werteAus({ op: 'exec', field: 'a' }, {})).toThrow(TravelEngineError);
    expect(() => werteAus({ op: 'all', of: [] }, {})).toThrow(TravelEngineError);
    expect(() => werteAus('kein Prädikat', {})).toThrow(TravelEngineError);
  });
});

describe('Anwendbarkeit', () => {
  it('gilt nur für dieselbe Route, Art und denselben Kontext', () => {
    expect(istAnwendbar(regel(), ROUTE)).toBe(true);
    expect(istAnwendbar(regel({ destinationCountry: 'FR' }), ROUTE)).toBe(false);
    expect(istAnwendbar(regel({ species: 'cat' }), ROUTE)).toBe(false);
    expect(istAnwendbar(regel({ context: 'commercial_transfer' }), ROUTE)).toBe(false);
  });

  it('gilt nur, wenn die Route durch den genannten Transitstaat führt', () => {
    expect(istAnwendbar(regel({ transitCountries: ['AT'] }), ROUTE)).toBe(true);
    expect(istAnwendbar(regel({ transitCountries: ['CH'] }), ROUTE)).toBe(false);
  });
});

describe('Prüfung einer Reise', () => {
  const fakten = { microchipped: true };

  it('wertet eine freigegebene, gültige Regel aus', () => {
    const ergebnis = pruefeReise({
      regeln: [regel()],
      route: ROUTE,
      fakten,
      stichtag: '2026-09-07',
    });
    expect(ergebnis.gesamt).toBe('fulfilled');
    expect(ergebnis.positionen.length).toBe(1);
    expect(ergebnis.hinweise.join(' ')).toContain('keine Einreisegarantie');
  });

  it('wertet eine ungeprüfte Regel nicht aus und sagt das', () => {
    const ergebnis = pruefeReise({
      regeln: [regel({ reviewedAt: null, reviewedBy: null })],
      route: ROUTE,
      fakten,
      stichtag: '2026-09-07',
    });
    expect(ergebnis.positionen).toEqual([]);
    expect(ergebnis.gesamt).toBe('unknown');
    expect(ergebnis.uebersprungen[0]?.grund).toContain('Ohne fachliche Freigabe');
  });

  it('hält die Versionsgrenze der Geltung ein', () => {
    const befristet = regel({ validity: { from: '2026-01-01', until: '2026-12-31' } });
    expect(
      pruefeReise({ regeln: [befristet], route: ROUTE, fakten, stichtag: '2026-12-31' }).gesamt,
    ).toBe('fulfilled');
    const danach = pruefeReise({
      regeln: [befristet],
      route: ROUTE,
      fakten,
      stichtag: '2027-01-01',
    });
    expect(danach.gesamt).toBe('unknown');
    expect(danach.uebersprungen[0]?.grund).toContain('Geltungszeitraums');
    const davor = pruefeReise({
      regeln: [befristet],
      route: ROUTE,
      fakten,
      stichtag: '2025-12-31',
    });
    expect(davor.positionen).toEqual([]);
  });

  it('gibt ohne auswertbare Regel kein grünes Ergebnis', () => {
    const ergebnis = pruefeReise({ regeln: [], route: ROUTE, fakten, stichtag: '2026-09-07' });
    expect(ergebnis.gesamt).toBe('unknown');
    expect(ergebnis.hinweise.join(' ')).toContain('keine Unbedenklichkeit');
  });

  it('lässt eine fehlende Angabe nicht zu einem grünen Ergebnis werden', () => {
    const ergebnis = pruefeReise({
      regeln: [regel()],
      route: ROUTE,
      fakten: {},
      stichtag: '2026-09-07',
    });
    expect(ergebnis.gesamt).toBe('unknown');
    expect(ergebnis.positionen[0]?.state).toBe('unknown');
  });

  it('lässt die höhere Priorität gewinnen und weist die verdrängte aus', () => {
    const allgemein = regel({ ruleId: 'allgemein', priority: 0 });
    const speziell = regel({
      ruleId: 'speziell',
      priority: 10,
      condition: { op: 'eq', field: 'microchipped', value: false },
    });
    const ergebnis = pruefeReise({
      regeln: [allgemein, speziell],
      route: ROUTE,
      fakten,
      stichtag: '2026-09-07',
    });
    expect(ergebnis.positionen.length).toBe(1);
    expect(ergebnis.positionen[0]?.ruleId).toBe('speziell');
    expect(ergebnis.gesamt).toBe('not_fulfilled');
    expect(ergebnis.uebersprungen.map((e) => e.ruleId)).toContain('allgemein');
  });

  it('behandelt zwei verschiedene Anforderungen als zwei Positionen', () => {
    const zwei = [
      regel({ ruleId: 'chip', requirementId: 'microchip' }),
      regel({
        ruleId: 'impfung',
        requirementId: 'rabies-vaccination',
        condition: { op: 'eq', field: 'rabiesVaccinated', value: true },
      }),
    ];
    const ergebnis = pruefeReise({
      regeln: zwei,
      route: ROUTE,
      fakten: { microchipped: true, rabiesVaccinated: true },
      stichtag: '2026-09-07',
    });
    expect(ergebnis.positionen.length).toBe(2);
    expect(ergebnis.gesamt).toBe('fulfilled');
  });

  it('nimmt den Stichtag von außen und keinen aus der Uhr', () => {
    expect(() =>
      pruefeReise({ regeln: [regel()], route: ROUTE, fakten, stichtag: 'heute' }),
    ).toThrow(TravelEngineError);
  });

  it('führt jede übersprungene Regel mit Grund auf', () => {
    const ergebnis = pruefeReise({
      regeln: [regel({ ruleId: 'andere-route', destinationCountry: 'FR' })],
      route: ROUTE,
      fakten,
      stichtag: '2026-09-07',
    });
    expect(ergebnis.uebersprungen).toEqual([
      { ruleId: 'andere-route', grund: 'Gilt für eine andere Route.' },
    ]);
  });
});
