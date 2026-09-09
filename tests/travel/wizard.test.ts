// M12-04 — Kein grünes Ergebnis für eine unvollständige oder nicht geprüfte Reise.
import { describe, expect, it } from 'vitest';

import { fakten, pruefeWizard, type WizardEingabe } from '../../src/features/travel/wizard.ts';

const VOLLSTAENDIG: WizardEingabe = {
  species: 'dog',
  destination: 'AT',
  transit: [],
  direction: 'outbound',
  animals: 1,
  travelDate: '2026-10-01',
  birthDate: '2020-01-01',
  microchipped: 'ja',
  chipCompliant: 'ja',
  passportComplete: 'ja',
  continuousBooster: 'nein',
  vaccinationStartDate: '2026-01-01',
  vaccinationValidUntil: '2027-01-01',
  identificationDate: '2020-03-01',
  rabiesVaccinated: 'ja',
  rabiesVaccinationDate: '2026-01-01',
  euPetPassport: 'ja',
  accompaniedByOwner: 'ja',
};

describe('Fakten aus dem Formular', () => {
  it('macht aus „weiß ich nicht“ keine Angabe', () => {
    const werte = fakten({ ...VOLLSTAENDIG, microchipped: 'unbekannt', birthDate: null });
    expect('microchipped' in werte).toBe(false);
    expect('birthDate' in werte).toBe(false);
  });

  it('übernimmt „nein“ als echtes Nein', () => {
    expect(fakten({ ...VOLLSTAENDIG, microchipped: 'nein' }).microchipped).toBe(false);
  });

  it('übernimmt nur echte Kalenderdaten', () => {
    expect(
      fakten({ ...VOLLSTAENDIG, identificationDate: null }).identificationDate,
    ).toBeUndefined();
  });
});

describe('Vollständige, unterstützte Reise', () => {
  const ergebnis = pruefeWizard(VOLLSTAENDIG);

  it('wertet die Checkliste aus', () => {
    expect(ergebnis.umfang.unterstuetzt).toBe(true);
    expect(ergebnis.pruefung?.positionen.length).toBe(5);
    for (const position of ergebnis.pruefung?.positionen ?? []) {
      expect(position.state).toBe('fulfilled');
    }
  });

  it('gibt trotzdem kein grünes Gesamtergebnis, weil die Regeln ungeprüft sind', () => {
    expect(ergebnis.gesamt).toBe('unknown');
    expect(ergebnis.hinweise.join(' ')).toContain('fachlich noch nicht geprüft');
    expect(ergebnis.pruefung?.vorschau).toBe(true);
  });

  it('nennt zu jedem Punkt eine amtliche Fundstelle', () => {
    for (const position of ergebnis.pruefung?.positionen ?? []) {
      expect(position.officialSourceUrl).toMatch(/^https:\/\//);
      expect(position.guidance.length).toBeGreaterThan(40);
    }
  });
});

describe('Unvollständige Angaben', () => {
  it('lassen die betroffene Position offen', () => {
    const ergebnis = pruefeWizard({ ...VOLLSTAENDIG, euPetPassport: 'unbekannt' });
    const punkt = ergebnis.pruefung?.positionen.find(
      (position) => position.requirementId === 'identification-document',
    );
    expect(punkt?.state).toBe('unknown');
    expect(ergebnis.gesamt).toBe('unknown');
  });

  it('melden einen klaren Mangel auch in der Vorschau', () => {
    const ergebnis = pruefeWizard({ ...VOLLSTAENDIG, microchipped: 'nein' });
    expect(ergebnis.gesamt).toBe('not_fulfilled');
  });

  it('melden eine zu kurze Frist zwischen Impfung und Reise', () => {
    const ergebnis = pruefeWizard({
      ...VOLLSTAENDIG,
      rabiesVaccinationDate: '2026-09-25',
      travelDate: '2026-10-01',
    });
    const punkt = ergebnis.pruefung?.positionen.find(
      (position) => position.requirementId === 'rabies-vaccination',
    );
    expect(punkt?.state).toBe('not_fulfilled');
    expect(ergebnis.gesamt).toBe('not_fulfilled');
  });
});

describe('Nicht unterstützte Reisen', () => {
  it('bekommen gar keine Checkliste, sondern eine Begründung', () => {
    const ergebnis = pruefeWizard({ ...VOLLSTAENDIG, destination: 'ES' });
    expect(ergebnis.umfang.unterstuetzt).toBe(false);
    expect(ergebnis.pruefung).toBeNull();
    expect(ergebnis.gesamt).toBe('not_applicable');
    expect(ergebnis.hinweise.join(' ')).toContain('außerhalb des geprüften Umfangs');
  });

  it('gilt auch für einen Nicht-EU-Transit', () => {
    const ergebnis = pruefeWizard({ ...VOLLSTAENDIG, destination: 'IT', transit: ['XX'] });
    expect(ergebnis.pruefung).toBeNull();
    expect(ergebnis.umfang.faelle).toContain('nicht-eu-transit');
  });

  it('gilt auch für ein Tier mit unbekanntem Alter', () => {
    const ergebnis = pruefeWizard({ ...VOLLSTAENDIG, birthDate: null });
    expect(ergebnis.pruefung).toBeNull();
    expect(ergebnis.umfang.faelle).toContain('jungtiere');
  });

  it('gilt auch für zu viele Tiere', () => {
    expect(pruefeWizard({ ...VOLLSTAENDIG, animals: 6 }).pruefung).toBeNull();
  });
});

describe('Stichtag', () => {
  it('prüft Fristen gegen den Reisetag, nicht gegen heute', () => {
    // Dieselbe Impfung, zwei Reisetage: einmal zu früh, einmal spät genug.
    const frueh = pruefeWizard({
      ...VOLLSTAENDIG,
      rabiesVaccinationDate: '2026-09-25',
      travelDate: '2026-10-01',
    });
    const spaet = pruefeWizard({
      ...VOLLSTAENDIG,
      rabiesVaccinationDate: '2026-09-25',
      travelDate: '2026-10-20',
    });
    expect(frueh.gesamt).toBe('not_fulfilled');
    expect(spaet.gesamt).toBe('unknown');
  });
});

describe('Erweiterte Reiseangaben', () => {
  const point = (input: Partial<WizardEingabe>, id: string) =>
    pruefeWizard({ ...VOLLSTAENDIG, ...input }).pruefung?.positionen.find(
      (p) => p.requirementId === id,
    )?.state;
  it('weist eine am Reisetag abgelaufene Impfung zurück', () => {
    expect(point({ vaccinationValidUntil: '2026-09-30' }, 'rabies-vaccination')).toBe(
      'not_fulfilled',
    );
    expect(point({ vaccinationValidUntil: '2026-10-01' }, 'rabies-vaccination')).toBe('fulfilled');
  });
  it('unterscheidet rechtzeitige Auffrischung von neuer Impfserie', () => {
    const booster = { vaccinationStartDate: '2026-09-30', rabiesVaccinationDate: '2026-09-30' };
    expect(point({ ...booster, continuousBooster: 'ja' }, 'rabies-vaccination')).toBe('fulfilled');
    expect(point({ ...booster, continuousBooster: 'nein' }, 'rabies-vaccination')).toBe(
      'not_fulfilled',
    );
  });
  it('akzeptiert passenden Leser bei technisch abweichendem Chip', () => {
    expect(point({ chipCompliant: 'nein', chipReaderAvailable: 'ja' }, 'microchip')).toBe(
      'fulfilled',
    );
    expect(point({ chipCompliant: 'nein', chipReaderAvailable: 'nein' }, 'microchip')).toBe(
      'not_fulfilled',
    );
  });
  it('macht aus vorhandenem, unvollständigem Pass keine Erfüllung', () => {
    expect(point({ passportComplete: 'nein' }, 'identification-document')).toBe('not_fulfilled');
    expect(point({ passportComplete: undefined }, 'identification-document')).toBe('unknown');
  });
  it('meldet französisches Einreiseverbot auch bei erfüllten Gesundheitsangaben', () => {
    const result = pruefeWizard({ ...VOLLSTAENDIG, destination: 'FR', frenchCategory: '1' });
    expect(result.gesamt).toBe('not_fulfilled');
    expect(result.hinweise.join(' ')).toContain('Einreise und Durchreise sind untersagt');
  });
});

it('berücksichtigt französische Einreiseverbote auch im Transit, aber nicht als Ausreiseverbot', () => {
  const transit = pruefeWizard({
    ...VOLLSTAENDIG,
    destination: 'IT',
    transit: ['FR'],
    frenchCategory: '1',
  });
  expect(transit.gesamt).toBe('not_fulfilled');
  const returning = pruefeWizard({
    ...VOLLSTAENDIG,
    destination: 'FR',
    direction: 'return',
    frenchCategory: '1',
  });
  expect(returning.hinweise.join(' ')).not.toContain('Einreise und Durchreise sind untersagt');
});
