// M12-01 — Der Umfang ist klein, benannt und fail-closed.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { TravelScopeSchema } from '../../src/domain/schemas/travel.ts';
import { pruefeUmfang, reiseUmfang, umfangsSatz } from '../../src/features/travel/scope.ts';

const STANDARD = {
  species: 'dog',
  context: 'private_accompanied',
  direction: 'outbound',
  partnerCountry: 'AT',
  transitCountries: [] as string[],
  animals: 1,
  ageMonths: 36,
};

describe('Umfangsdatei', () => {
  const roh = JSON.parse(readFileSync('content-data/travel/scope.json', 'utf8')) as unknown;

  it('entspricht dem Schema', () => {
    expect(TravelScopeSchema.safeParse(roh).success).toBe(true);
  });

  it('nennt genau die vier Zielstaaten der ersten Fassung', () => {
    expect([...reiseUmfang().destinations].sort()).toEqual(['AT', 'FR', 'IT', 'NL']);
  });

  it('führt zu jedem unterstützten Fall auch die Gegenliste', () => {
    const umfang = reiseUmfang();
    expect(umfang.unsupported.length).toBeGreaterThanOrEqual(10);
    for (const fall of umfang.unsupported) {
      expect(fall.reason.length, fall.caseId).toBeGreaterThan(20);
    }
  });

  it('nennt das Herkunftsland nicht als Ziel', () => {
    expect(reiseUmfang().destinations).not.toContain(reiseUmfang().origin);
  });

  it('sagt in einem Satz, was geprüft wird', () => {
    expect(umfangsSatz()).toContain('AT, FR, IT, NL');
    expect(umfangsSatz()).toContain('nicht geprüft');
  });
});

describe('Prüfung des Reisekontexts', () => {
  it('lässt den Standardfall zu', () => {
    const ergebnis = pruefeUmfang(STANDARD);
    expect(ergebnis.unterstuetzt).toBe(true);
    expect(ergebnis.gruende).toEqual([]);
  });

  it('lässt die Rückreise aus einem der vier Staaten zu', () => {
    expect(pruefeUmfang({ ...STANDARD, direction: 'return' }).unterstuetzt).toBe(true);
  });

  it('lässt die Durchreise durch EU-Staaten der Route zu', () => {
    expect(
      pruefeUmfang({ ...STANDARD, partnerCountry: 'IT', transitCountries: ['AT'] }).unterstuetzt,
    ).toBe(true);
  });

  it('lehnt ein anderes Zielland ab und sagt warum', () => {
    const ergebnis = pruefeUmfang({ ...STANDARD, partnerCountry: 'ES' });
    expect(ergebnis.unterstuetzt).toBe(false);
    expect(ergebnis.faelle).toContain('andere-zielstaaten');
    expect(ergebnis.gruende[0]).toContain('einzeln gelesen');
  });

  it('lehnt die Durchreise durch einen Nicht-EU-Staat ab', () => {
    const ergebnis = pruefeUmfang({
      ...STANDARD,
      partnerCountry: 'IT',
      transitCountries: ['CH'],
    });
    expect(ergebnis.unterstuetzt).toBe(false);
    expect(ergebnis.faelle).toContain('nicht-eu-transit');
  });

  it('lehnt andere Tierarten ab', () => {
    expect(pruefeUmfang({ ...STANDARD, species: 'ferret' }).faelle).toContain('andere-tierarten');
    expect(pruefeUmfang({ ...STANDARD, species: 'other' }).unterstuetzt).toBe(false);
  });

  it('lehnt gewerbliche und unbegleitete Reisen getrennt ab', () => {
    expect(pruefeUmfang({ ...STANDARD, context: 'commercial_transfer' }).faelle).toContain(
      'gewerblich',
    );
    expect(pruefeUmfang({ ...STANDARD, context: 'unaccompanied' }).faelle).toContain(
      'ohne-begleitung',
    );
  });

  it('lehnt zu viele und zu wenige Tiere ab', () => {
    expect(pruefeUmfang({ ...STANDARD, animals: 6 }).unterstuetzt).toBe(false);
    expect(pruefeUmfang({ ...STANDARD, animals: 0 }).unterstuetzt).toBe(false);
    expect(pruefeUmfang({ ...STANDARD, animals: 5 }).unterstuetzt).toBe(true);
  });

  it('behandelt ein unbekanntes Alter als nicht unterstützt, nicht als erwachsen', () => {
    const ergebnis = pruefeUmfang({ ...STANDARD, ageMonths: null });
    expect(ergebnis.unterstuetzt).toBe(false);
    expect(ergebnis.faelle).toContain('jungtiere');
  });

  it('lehnt ein Jungtier ab, auch knapp unter der Grenze', () => {
    expect(pruefeUmfang({ ...STANDARD, ageMonths: 11 }).unterstuetzt).toBe(false);
    expect(pruefeUmfang({ ...STANDARD, ageMonths: 12 }).unterstuetzt).toBe(true);
  });

  it('sammelt mehrere Gründe, statt beim ersten aufzuhören', () => {
    const ergebnis = pruefeUmfang({
      ...STANDARD,
      species: 'ferret',
      partnerCountry: 'US',
      animals: 9,
      ageMonths: 2,
    });
    expect(ergebnis.unterstuetzt).toBe(false);
    expect(ergebnis.faelle.length).toBeGreaterThanOrEqual(4);
  });

  it('nennt jeden Grund nur einmal', () => {
    const ergebnis = pruefeUmfang({
      ...STANDARD,
      partnerCountry: 'ES',
      transitCountries: ['CH', 'RS'],
    });
    expect(new Set(ergebnis.faelle).size).toBe(ergebnis.faelle.length);
  });
});
