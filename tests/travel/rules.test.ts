// M12-03 — Vorbereitet ist nicht freigegeben.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { TravelRuleSetSchema, isRuleLive } from '../../src/domain/schemas/travel.ts';
import { pruefeReise, werteAus } from '../../src/features/travel/engine.ts';
import {
  alleRegeln,
  entfalte,
  freigegebeneRegeln,
  regelSaetze,
} from '../../src/features/travel/rules.ts';
import { reiseUmfang } from '../../src/features/travel/scope.ts';

const SATZ = JSON.parse(
  readFileSync('content-data/travel/rules/eu-intra-2026.json', 'utf8'),
) as unknown;

describe('Regelsatz', () => {
  it('entspricht dem Schema', () => {
    expect(TravelRuleSetSchema.safeParse(SATZ).success).toBe(true);
  });

  it('nennt Rechtsgrundlage, Anwendungsbeginn und gelesene Quellen', () => {
    const satz = regelSaetze()[0]!;
    expect(satz.legalBasis).toContain('2026/131');
    expect(satz.appliesFrom).toBe('2026-04-22');
    expect(satz.sources.length).toBeGreaterThanOrEqual(2);
    for (const quelle of satz.sources) {
      expect(quelle.retrievedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(quelle.url).toMatch(/^https:\/\//);
    }
  });

  it('führt zu jeder Anforderung eine Fundstelle im Klartext', () => {
    for (const anforderung of regelSaetze()[0]!.requirements) {
      expect(anforderung.citation, anforderung.requirementId).toMatch(/Artikel/);
      expect(anforderung.officialSourceUrl).toMatch(/^https:\/\//);
      expect(anforderung.guidance.length).toBeGreaterThan(40);
    }
  });

  it('deckt genau die Ziele des Umfangs ab', () => {
    expect([...regelSaetze()[0]!.destinations].sort()).toEqual(
      [...reiseUmfang().destinations].sort(),
    );
  });
});

describe('Entfalten', () => {
  it('erzeugt je Ziel, Tierart und Anforderung eine Regel', () => {
    const satz = regelSaetze()[0]!;
    const erwartet =
      satz.origins.length *
      satz.destinations.length *
      satz.species.length *
      satz.contexts.length *
      satz.requirements.length;
    expect(alleRegeln().length).toBe(erwartet);
  });

  it('bildet stabile, sprechende Regel-IDs', () => {
    const ids = alleRegeln().map((regel) => regel.ruleId);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toContain('eu-intra-2026-microchip-de-at-dog');
    // Zweimal entfalten ergibt dasselbe.
    expect(entfalte(regelSaetze()[0]!).map((r) => r.ruleId)).toEqual(ids);
  });

  it('erzeugt keine Regel vom Land in sich selbst', () => {
    for (const regel of alleRegeln()) {
      expect(regel.originCountry).not.toBe(regel.destinationCountry);
    }
  });

  it('übernimmt den Geltungszeitraum des Rechtsakts', () => {
    for (const regel of alleRegeln()) {
      expect(regel.validity.from).toBe('2026-04-22');
      expect(regel.validity.until).toBeNull();
    }
  });
});

describe('Freigabestand', () => {
  it('ist keine Regel fachlich freigegeben', () => {
    expect(freigegebeneRegeln()).toEqual([]);
    for (const regel of alleRegeln()) {
      expect(regel.reviewedAt).toBeNull();
      expect(regel.reviewedBy).toBeNull();
    }
  });

  it('wertet die Maschine deshalb keine einzige aus', () => {
    for (const regel of alleRegeln()) expect(isRuleLive(regel, '2026-09-07')).toBe(false);

    const ergebnis = pruefeReise({
      regeln: alleRegeln(),
      route: {
        originCountry: 'DE',
        destinationCountry: 'AT',
        transitCountries: [],
        species: 'dog',
        context: 'private_accompanied',
      },
      fakten: {
        microchipped: true,
        rabiesVaccinated: true,
        continuousBooster: false,
        vaccinationValidUntil: '2027-12-31',
        euPetPassport: true,
        accompaniedByOwner: true,
        animals: 1,
        birthDate: '2020-01-01',
        identificationDate: '2020-03-01',
        vaccinationStartDate: '2026-01-01',
        rabiesVaccinationDate: '2026-01-01',
        travelDate: '2026-10-01',
      },
      stichtag: '2026-09-07',
    });
    // Selbst mit lückenlosen Angaben: ohne Freigabe kein grünes Ergebnis.
    expect(ergebnis.positionen).toEqual([]);
    expect(ergebnis.gesamt).toBe('unknown');
    expect(ergebnis.uebersprungen.length).toBeGreaterThan(0);
  });
});

describe('Fachlicher Gehalt der Bedingungen', () => {
  const regel = (id: string) => alleRegeln().find((r) => r.ruleId === id)!;

  it('verlangt 21 Tage zwischen Impfung und Reise', () => {
    const bedingung = regel('eu-intra-2026-rabies-vaccination-de-at-dog').condition;
    const basis = {
      rabiesVaccinated: true,
      continuousBooster: false,
      vaccinationValidUntil: '2027-12-31',
      birthDate: '2020-01-01',
      identificationDate: '2020-03-01',
    };
    expect(
      werteAus(bedingung, {
        ...basis,
        vaccinationStartDate: '2026-05-01',
        rabiesVaccinationDate: '2026-05-01',
        travelDate: '2026-05-22',
      }),
    ).toBe('fulfilled');
    expect(
      werteAus(bedingung, {
        ...basis,
        vaccinationStartDate: '2026-05-01',
        rabiesVaccinationDate: '2026-05-01',
        travelDate: '2026-05-21',
      }),
    ).toBe('not_fulfilled');
  });

  it('verlangt die Impfung frühestens ab einem Alter von zwölf Wochen', () => {
    const bedingung = regel('eu-intra-2026-rabies-vaccination-de-at-dog').condition;
    const basis = {
      rabiesVaccinated: true,
      continuousBooster: false,
      vaccinationValidUntil: '2027-12-31',
      identificationDate: '2026-01-01',
      travelDate: '2026-12-01',
    };
    // 84 Tage nach der Geburt: erfüllt. Ein Tag früher: nicht erfüllt.
    expect(
      werteAus(bedingung, {
        ...basis,
        birthDate: '2026-01-01',
        vaccinationStartDate: '2026-03-26',
        rabiesVaccinationDate: '2026-03-26',
      }),
    ).toBe('fulfilled');
    expect(
      werteAus(bedingung, {
        ...basis,
        birthDate: '2026-01-01',
        vaccinationStartDate: '2026-03-25',
        rabiesVaccinationDate: '2026-03-25',
      }),
    ).toBe('not_fulfilled');
  });

  it('verlangt die Kennzeichnung vor der Impfung', () => {
    const bedingung = regel('eu-intra-2026-rabies-vaccination-de-at-dog').condition;
    expect(
      werteAus(bedingung, {
        rabiesVaccinated: true,
        continuousBooster: false,
        vaccinationValidUntil: '2027-12-31',
        birthDate: '2020-01-01',
        identificationDate: '2026-05-02',
        vaccinationStartDate: '2026-05-01',
        rabiesVaccinationDate: '2026-05-01',
        travelDate: '2026-12-01',
      }),
    ).toBe('not_fulfilled');
  });

  it('lässt höchstens fünf Tiere zu', () => {
    const bedingung = regel('eu-intra-2026-max-five-animals-de-at-dog').condition;
    expect(werteAus(bedingung, { animals: 5 })).toBe('fulfilled');
    expect(werteAus(bedingung, { animals: 6 })).toBe('not_fulfilled');
    expect(werteAus(bedingung, {})).toBe('unknown');
  });

  it('behandelt fehlende Angaben durchgehend als unbekannt', () => {
    for (const regel of alleRegeln()) {
      expect(werteAus(regel.condition, {}), regel.ruleId).toBe('unknown');
    }
  });
});
