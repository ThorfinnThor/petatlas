// M09-05 — Ohne aktiven Partner bleibt die Seite informativ und erfindet nichts.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { requireMarket, type MarketConfig } from '../src/domain/market.ts';
import { PartnerProgramSchema, type PartnerProgram } from '../src/domain/schemas/partner.ts';
import { disclosuresFor, insuranceDisclosures } from '../src/features/commerce/disclosures.ts';
import { partnerZiel, pruefeZiel } from '../src/features/commerce/links.ts';
import {
  insuranceProgramme,
  partnerHinweisErlaubt,
  werbekennzeichnung,
} from '../src/features/commerce/partner.ts';

const HEUTE = '2026-09-07';

function markt(commerce: boolean, id = 'DE'): MarketConfig {
  const basis = requireMarket(id);
  return { ...basis, featureFlags: { ...basis.featureFlags, commerce } };
}

/** Synthetisches Programm auf einer reservierten Testdomain. */
function programm(overrides: Partial<PartnerProgram> = {}): PartnerProgram {
  return {
    programId: 'synthetisches-testprogramm',
    advertiser: 'Beispielversicherung (synthetisch)',
    network: 'direkt',
    markets: ['DE'],
    status: 'approved',
    approval: {
      contractReference: 'SYNTHETISCH-TEST-1',
      approvedAt: '2026-01-01',
      expiresAt: null,
      reviewEvidence: 'synthetisch',
      reviewedAt: '2026-01-01T00:00:00+00:00',
    },
    allowedLinkHosts: ['beispiel.invalid'],
    landingUrl: 'https://beispiel.invalid/tierkrankenversicherung',
    campaignIds: ['STATISCH_1'],
    allowedPlacements: ['information_page'],
    disclosureText: 'Werbung: Dieser Hinweis ist bezahlt.',
    restrictions: [],
    notes: [],
    ...overrides,
  } as PartnerProgram;
}

/** Der ganze Weg: Konfiguration, Freigabe, Kennzeichnung, Link. */
function durchlauf(programme: readonly PartnerProgram[], m = markt(true)) {
  const entscheidung = partnerHinweisErlaubt({
    market: m,
    placement: 'information_page',
    stichtag: HEUTE,
    programme,
  });
  return {
    entscheidung,
    kennzeichnung: werbekennzeichnung(entscheidung.programm),
    ziel: partnerZiel(entscheidung.programm),
    hinweise: disclosuresFor('information_page', entscheidung.programm !== null),
  };
}

describe('Der tatsächliche Zustand: kein Partner', () => {
  it('liefert keine Programme aus', () => {
    expect(insuranceProgramme()).toEqual([]);
  });

  it('bleibt informativ: alle Hinweistexte stehen weiterhin', () => {
    const ergebnis = durchlauf([]);
    expect(ergebnis.entscheidung.erlaubt).toBe(false);
    expect(ergebnis.ziel).toBeNull();
    expect(ergebnis.kennzeichnung).toBeNull();
    expect(ergebnis.hinweise.length).toBe(insuranceDisclosures().length);
    expect(ergebnis.hinweise.length).toBeGreaterThanOrEqual(5);
  });

  it('enthält in der ausgelieferten Konfiguration keine Provision und kein Angebot', () => {
    const roh = readFileSync('config/publishers/insurance/programs.json', 'utf8');
    for (const wort of ['commission', 'provision', 'payout', 'cpa', 'cpl', 'beitrag', 'tarif']) {
      expect(roh.toLowerCase(), wort).not.toContain(wort);
    }
  });
});

describe('Gesperrte Zustände', () => {
  it('noch keine Zulassung: beworben ist nicht zugelassen', () => {
    const beworben = [
      PartnerProgramSchema.parse({ ...programm(), status: 'applied', approval: null }),
    ];
    const ergebnis = durchlauf(beworben);
    expect(ergebnis.entscheidung.erlaubt).toBe(false);
    expect(ergebnis.entscheidung.grund).toContain('gültige Zulassung');
    expect(ergebnis.ziel).toBeNull();
  });

  it('Programm beendet: der Link verschwindet, die Hinweise bleiben', () => {
    const beendet = [
      PartnerProgramSchema.parse({ ...programm(), status: 'ended', approval: null }),
    ];
    const ergebnis = durchlauf(beendet);
    expect(ergebnis.entscheidung.erlaubt).toBe(false);
    expect(ergebnis.ziel).toBeNull();
    expect(ergebnis.hinweise.length).toBe(insuranceDisclosures().length);
  });

  it('Zulassung abgelaufen: ein alter Vertrag trägt keinen neuen Link', () => {
    const abgelaufen = [
      programm({
        approval: {
          contractReference: 'SYNTHETISCH-TEST-2',
          approvedAt: '2025-01-01',
          expiresAt: '2026-01-01',
          reviewEvidence: 'synthetisch',
          reviewedAt: '2025-01-01T00:00:00+00:00',
        },
      }),
    ];
    expect(durchlauf(abgelaufen).entscheidung.erlaubt).toBe(false);
  });

  it('falscher Markt: ein deutscher Vertrag gilt nicht in den USA', () => {
    const ergebnis = durchlauf([programm()], markt(true, 'US'));
    expect(ergebnis.entscheidung.erlaubt).toBe(false);
    expect(ergebnis.entscheidung.grund).toContain('Markt US');
    expect(ergebnis.ziel).toBeNull();
  });

  it('Feature aus: auch ein gültiger Vertrag erzeugt nichts', () => {
    const ergebnis = durchlauf([programm()], markt(false));
    expect(ergebnis.entscheidung.erlaubt).toBe(false);
    expect(ergebnis.entscheidung.grund).toContain('commerce');
  });

  it('fehlende Werbekennzeichnung: lieber kein Hinweis als ein ungekennzeichneter', () => {
    const ohneKennzeichnung = [{ ...programm(), disclosureText: '   ' } as PartnerProgram];
    const ergebnis = durchlauf(ohneKennzeichnung);
    expect(ergebnis.entscheidung.erlaubt).toBe(false);
    expect(ergebnis.entscheidung.grund).toContain('Werbekennzeichnung');
    expect(ergebnis.ziel).toBeNull();
    // Und das Schema lässt so eine Konfiguration gar nicht erst durch.
    expect(PartnerProgramSchema.safeParse({ ...programm(), disclosureText: '' }).success).toBe(
      false,
    );
  });

  it('ungültiges Ziel: der Hinweis gilt, der Link nicht', () => {
    const fremdesZiel = [
      { ...programm(), landingUrl: 'https://fremd.example/a' } as PartnerProgram,
    ];
    const ergebnis = durchlauf(fremdesZiel);
    // Die Freigabe betrifft das Programm, die Prüfung das Ziel: beides ist
    // getrennt, und ohne gültiges Ziel gibt es keinen Link.
    expect(ergebnis.entscheidung.erlaubt).toBe(true);
    expect(pruefeZiel(fremdesZiel[0]!).gueltig).toBe(false);
    expect(ergebnis.ziel).toBeNull();
  });
});

describe('Der erlaubte Zustand', () => {
  it('erzeugt Kennzeichnung und Link — und sonst nichts', () => {
    const ergebnis = durchlauf([programm()]);
    expect(ergebnis.entscheidung.erlaubt).toBe(true);
    expect(ergebnis.kennzeichnung).toContain('Werbung');
    expect(ergebnis.ziel).toBe(
      'https://beispiel.invalid/tierkrankenversicherung?campaign=STATISCH_1',
    );
    // Auch mit Partner bleiben alle Verbraucherhinweise stehen.
    expect(ergebnis.hinweise.length).toBe(insuranceDisclosures().length);
  });

  it('wählt bei mehreren Verträgen nach Konfigurationsreihenfolge, nicht nach Ertrag', () => {
    const zwei = [
      programm({ programId: 'erstes-programm' }),
      programm({ programId: 'zweites-programm' }),
    ];
    expect(durchlauf(zwei).entscheidung.programm?.programId).toBe('erstes-programm');
    expect(durchlauf([...zwei].reverse()).entscheidung.programm?.programId).toBe(
      'zweites-programm',
    );
  });
});

describe('Neutrale Alternative', () => {
  it('bleibt ohne Partner ein Text ohne Link', () => {
    const hinweise = disclosuresFor('information_page', false);
    const alles = hinweise.map((h) => `${h.heading} ${h.paragraphs.join(' ')}`).join('\n');
    // Informativ, aber ohne Anbieterlink und ohne Preisangabe.
    expect(alles.length).toBeGreaterThan(500);
    expect(alles).not.toMatch(/https?:\/\//);
    expect(alles).not.toMatch(/\d+([.,]\d+)?\s*(€|EUR)/);
  });

  it('verweist auf eine Stelle mit Erlaubnis, statt selbst zu beraten', () => {
    const alles = insuranceDisclosures()
      .map((h) => h.paragraphs.join(' '))
      .join('\n');
    expect(alles).toContain('§ 34d');
  });
});
