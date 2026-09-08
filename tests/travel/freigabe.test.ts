// M12-06 — Eine Quelländerung macht eine alte Freigabe wertlos.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  TravelApprovalListSchema,
  type TravelApproval,
  type TravelRuleSet,
} from '../../src/domain/schemas/travel.ts';
import {
  freigabeFuer,
  freigabeStand,
  inhaltsSignatur,
  nurVorschau,
  signaturQuelle,
} from '../../src/features/travel/freigabe.ts';
import { regelSaetze } from '../../src/features/travel/rules.ts';
import { pruefeWizard, type WizardEingabe } from '../../src/features/travel/wizard.ts';

const SATZ: TravelRuleSet = regelSaetze()[0]!;

function freigabe(overrides: Partial<TravelApproval> = {}): TravelApproval {
  return {
    ruleSetId: SATZ.ruleSetId,
    approvedAt: '2026-09-07',
    approvedBy: 'Synthetische Prüfperson (nur im Test)',
    sourceDigest: inhaltsSignatur(SATZ),
    evidence: 'tests/travel/freigabe.test.ts',
    ...overrides,
  };
}

describe('Signatur', () => {
  it('ist stabil über mehrere Aufrufe', () => {
    expect(inhaltsSignatur(SATZ)).toBe(inhaltsSignatur(SATZ));
    expect(inhaltsSignatur(SATZ)).toMatch(/^[0-9a-f]{16}$/);
  });

  it('hängt nicht an der Reihenfolge der Anforderungen', () => {
    const gedreht = { ...SATZ, requirements: [...SATZ.requirements].reverse() };
    expect(inhaltsSignatur(gedreht)).toBe(inhaltsSignatur(SATZ));
  });

  it('ändert sich bei jeder inhaltlichen Änderung', () => {
    const original = inhaltsSignatur(SATZ);
    expect(inhaltsSignatur({ ...SATZ, legalBasis: 'etwas anderes' })).not.toBe(original);
    expect(inhaltsSignatur({ ...SATZ, appliesFrom: '2027-01-01' })).not.toBe(original);
    expect(inhaltsSignatur({ ...SATZ, destinations: ['AT'] })).not.toBe(original);

    const geaenderteFrist = {
      ...SATZ,
      requirements: SATZ.requirements.map((anforderung) =>
        anforderung.requirementId === 'rabies-vaccination'
          ? { ...anforderung, guidance: `${anforderung.guidance} (geändert)` }
          : anforderung,
      ),
    };
    expect(inhaltsSignatur(geaenderteFrist)).not.toBe(original);
  });

  it('ändert sich nicht bei bloßen Anmerkungen oder Abrufdaten', () => {
    const original = inhaltsSignatur(SATZ);
    expect(inhaltsSignatur({ ...SATZ, notes: ['neu'] })).toBe(original);
    expect(
      inhaltsSignatur({
        ...SATZ,
        sources: SATZ.sources.map((quelle) => ({ ...quelle, retrievedAt: '2027-01-01' })),
      }),
    ).toBe(original);
  });

  it('nimmt die Bedingungen mit in die Signatur', () => {
    expect(signaturQuelle(SATZ)).toContain('daysBetween');
  });
});

describe('Freigabestand', () => {
  it('ist ohne Eintrag nicht freigegeben', () => {
    const stand = freigabeFuer(SATZ, []);
    expect(stand.freigegeben).toBe(false);
    expect(stand.grund).toContain('keine fachliche Freigabe');
  });

  it('ist mit passender Signatur freigegeben', () => {
    const stand = freigabeFuer(SATZ, [freigabe()]);
    expect(stand.freigegeben).toBe(true);
    expect(stand.grund).toContain('2026-09-07');
  });

  it('sperrt, sobald sich der Regelsatz seit der Freigabe geändert hat', () => {
    const alt = freigabe({ sourceDigest: '0123456789abcdef' });
    const stand = freigabeFuer(SATZ, [alt]);
    expect(stand.freigegeben).toBe(false);
    expect(stand.grund).toContain('geändert');
    expect(stand.grund).toContain('0123456789abcdef');
  });

  it('gilt nur für den Regelsatz, für den sie erteilt wurde', () => {
    const fremd = freigabe({ ruleSetId: 'ein-anderer-satz' });
    expect(freigabeFuer(SATZ, [fremd]).freigegeben).toBe(false);
  });
});

describe('Ausgelieferter Stand', () => {
  it('enthält keine Freigabe', () => {
    const roh = JSON.parse(readFileSync('content-data/travel/approvals.json', 'utf8')) as unknown;
    const geprueft = TravelApprovalListSchema.parse(roh);
    expect(geprueft.approvals).toEqual([]);
    expect(freigabeStand().every((stand) => !stand.freigegeben)).toBe(true);
    expect(nurVorschau()).toBe(true);
  });

  it('hält den Reisecheck damit in der Vorschau', () => {
    const eingabe: WizardEingabe = {
      species: 'dog',
      destination: 'AT',
      transit: [],
      direction: 'outbound',
      animals: 1,
      travelDate: '2026-10-01',
      birthDate: '2020-01-01',
      microchipped: 'ja',
      identificationDate: '2020-03-01',
      rabiesVaccinated: 'ja',
      rabiesVaccinationDate: '2026-01-01',
      euPetPassport: 'ja',
      accompaniedByOwner: 'ja',
    };
    const ergebnis = pruefeWizard(eingabe);
    expect(ergebnis.pruefung?.vorschau).toBe(true);
    expect(ergebnis.gesamt).toBe('unknown');
  });
});

// M17-04 — Auch eine Freigabe altert. Die Zeit steht in diesen Tests still.
describe('Alter der Freigabe', () => {
  const freigabe = {
    ruleSetId: SATZ.ruleSetId,
    approvedAt: '2026-01-01',
    approvedBy: 'Fachprüfung',
    sourceDigest: inhaltsSignatur(SATZ),
    evidence: 'docs/reviews/travel.md',
  };

  it('bleibt ohne Stichtag unverändert freigegeben', () => {
    expect(freigabeFuer(SATZ, [freigabe]).freigegeben).toBe(true);
  });

  it('gilt am Stichtag kurz nach der Prüfung', () => {
    expect(freigabeFuer(SATZ, [freigabe], '2026-03-01').freigegeben).toBe(true);
  });

  it('gilt noch, solange sie nur alternd ist', () => {
    // 180 Tage Warnschwelle, 365 Tage Sperrschwelle.
    expect(freigabeFuer(SATZ, [freigabe], '2026-10-01').freigegeben).toBe(true);
  });

  it('gilt nicht mehr, wenn sie über der Sperrschwelle liegt', () => {
    const stand = freigabeFuer(SATZ, [freigabe], '2027-06-01');
    expect(stand.freigegeben).toBe(false);
    expect(stand.grund).toContain('zu alt');
  });

  it('schaltet den Reisecheck bei zu alter Freigabe in die Vorschau', () => {
    expect(nurVorschau('2099-01-01')).toBe(true);
  });
});
