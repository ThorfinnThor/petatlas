// M09-01 — Ohne Vertrag entsteht keine Versicherungs-CTA.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { requireMarket, type MarketConfig } from '../../src/domain/market.ts';
import {
  PartnerProgramSchema,
  PartnerRegistrySchema,
  type PartnerProgram,
} from '../../src/domain/schemas/partner.ts';
import {
  insuranceProgramme,
  partnerHinweisErlaubt,
  werbekennzeichnung,
  zulassungGilt,
} from '../../src/features/commerce/partner.ts';

const HEUTE = '2026-09-07';

function mitCommerce(an: boolean): MarketConfig {
  const markt = requireMarket('DE');
  return { ...markt, featureFlags: { ...markt.featureFlags, commerce: an } };
}

/** Synthetisches Programm. Kein echter Anbieter, kein echter Vertrag. */
function programm(overrides: Partial<PartnerProgram> = {}): PartnerProgram {
  return PartnerProgramSchema.parse({
    programId: 'synthetisches-testprogramm',
    advertiser: 'Beispielversicherung (synthetisch)',
    network: 'direkt',
    markets: ['DE'],
    status: 'approved',
    approval: {
      contractReference: 'SYNTHETISCH-TEST-1',
      approvedAt: '2026-01-01',
      expiresAt: null,
      reviewEvidence: 'tests/commerce/partner.test.ts (synthetisch, keine echte Freigabe)',
      reviewedAt: '2026-01-01T00:00:00+00:00',
    },
    allowedLinkHosts: ['beispiel.invalid'],
    landingUrl: 'https://beispiel.invalid/tierkrankenversicherung',
    campaignIds: ['STATISCH_1'],
    allowedPlacements: ['information_page'],
    disclosureText: 'Werbung: Dieser Hinweis ist bezahlt.',
    restrictions: [],
    notes: ['Synthetisch, nur für Tests.'],
    ...overrides,
  });
}

describe('Ausgelieferte Konfiguration', () => {
  const roh = JSON.parse(
    readFileSync('config/publishers/insurance/programs.json', 'utf8'),
  ) as unknown;

  it('entspricht dem Schema', () => {
    expect(PartnerRegistrySchema.safeParse(roh).success).toBe(true);
  });

  it('führt keinen Vertrag, weil es keinen gibt', () => {
    expect(insuranceProgramme()).toEqual([]);
  });

  it('erzeugt damit an keiner erlaubten Stelle einen Hinweis', () => {
    for (const platz of ['information_page', 'page_footer_section', 'neutral_list'] as const) {
      const entscheidung = partnerHinweisErlaubt({
        market: mitCommerce(true),
        placement: platz,
        stichtag: HEUTE,
      });
      expect(entscheidung.erlaubt, platz).toBe(false);
      expect(entscheidung.programm).toBeNull();
      expect(entscheidung.grund).toContain('kein Partnerprogramm');
    }
  });
});

describe('Schema', () => {
  it('lehnt approved ohne Vertragsnachweis ab', () => {
    const roh = { ...programm(), approval: null };
    expect(PartnerProgramSchema.safeParse(roh).success).toBe(false);
  });

  it('lehnt einen Nachweis ohne Zulassung ab', () => {
    const roh = { ...programm(), status: 'applied' };
    const ergebnis = PartnerProgramSchema.safeParse(roh);
    expect(ergebnis.success).toBe(false);
    expect(JSON.stringify(ergebnis)).toContain('Widerspruch');
  });

  it('lehnt eine Provisionsangabe ab, statt sie auszuliefern', () => {
    const roh = { ...programm(), commissionRate: 0.12 };
    expect(PartnerProgramSchema.safeParse(roh).success).toBe(false);
  });

  it('lehnt approved ohne Markt, Zielhost oder Platzierung ab', () => {
    for (const feld of ['markets', 'allowedLinkHosts', 'allowedPlacements'] as const) {
      const roh = { ...programm(), [feld]: [] };
      expect(PartnerProgramSchema.safeParse(roh).success, feld).toBe(false);
    }
  });

  it('lehnt ein Ziel ausserhalb der erlaubten Hosts ab', () => {
    const roh = { ...programm(), landingUrl: 'https://anderer.invalid/angebot' };
    expect(PartnerProgramSchema.safeParse(roh).success).toBe(false);
  });

  it('lehnt ein Ziel ohne https ab', () => {
    const roh = { ...programm(), landingUrl: 'http://beispiel.invalid/angebot' };
    expect(PartnerProgramSchema.safeParse(roh).success).toBe(false);
  });

  it('lehnt approved ohne Zieladresse ab', () => {
    const roh = { ...programm(), landingUrl: null };
    expect(PartnerProgramSchema.safeParse(roh).success).toBe(false);
  });

  it('lehnt eine erfundene Platzierung ab', () => {
    const roh = { ...programm(), allowedPlacements: ['neben_dem_kostenergebnis'] };
    expect(PartnerProgramSchema.safeParse(roh).success).toBe(false);
  });

  it('lehnt doppelte Programmkennungen ab', () => {
    const roh = { domain: 'insurance', programs: [programm(), programm()] };
    expect(PartnerRegistrySchema.safeParse(roh).success).toBe(false);
  });
});

describe('Freigabelogik', () => {
  const eins = [programm()];

  it('lässt einen Hinweis nur mit eingeschaltetem Feature zu', () => {
    const aus = partnerHinweisErlaubt({
      market: mitCommerce(false),
      placement: 'information_page',
      stichtag: HEUTE,
      programme: eins,
    });
    expect(aus.erlaubt).toBe(false);
    expect(aus.grund).toContain('commerce');

    const an = partnerHinweisErlaubt({
      market: mitCommerce(true),
      placement: 'information_page',
      stichtag: HEUTE,
      programme: eins,
    });
    expect(an.erlaubt).toBe(true);
    expect(an.programm?.programId).toBe('synthetisches-testprogramm');
  });

  it('gilt nur im vertraglich erfassten Markt', () => {
    const nurUs = [programm({ markets: ['US'] })];
    const entscheidung = partnerHinweisErlaubt({
      market: mitCommerce(true),
      placement: 'information_page',
      stichtag: HEUTE,
      programme: nurUs,
    });
    expect(entscheidung.erlaubt).toBe(false);
    expect(entscheidung.grund).toContain('Markt DE');
  });

  it('gilt nur an der vertraglich erlaubten Stelle', () => {
    const entscheidung = partnerHinweisErlaubt({
      market: mitCommerce(true),
      placement: 'neutral_list',
      stichtag: HEUTE,
      programme: eins,
    });
    expect(entscheidung.erlaubt).toBe(false);
    expect(entscheidung.grund).toContain('neutral_list');
  });

  it('behandelt ein beendetes Programm wie keines', () => {
    const beendet = [
      PartnerProgramSchema.parse({ ...programm(), status: 'ended', approval: null }),
    ];
    const entscheidung = partnerHinweisErlaubt({
      market: mitCommerce(true),
      placement: 'information_page',
      stichtag: HEUTE,
      programme: beendet,
    });
    expect(entscheidung.erlaubt).toBe(false);
    expect(entscheidung.grund).toContain('gültige Zulassung');
  });

  it('behandelt eine abgelaufene Zulassung wie keine', () => {
    const abgelaufen = programm({
      approval: {
        contractReference: 'SYNTHETISCH-TEST-2',
        approvedAt: '2025-01-01',
        expiresAt: '2026-01-01',
        reviewEvidence: 'synthetisch',
        reviewedAt: '2025-01-01T00:00:00+00:00',
      },
    });
    expect(zulassungGilt(abgelaufen, HEUTE)).toBe(false);
    expect(zulassungGilt(abgelaufen, '2025-06-01')).toBe(true);
  });

  it('gilt nicht vor dem Freigabedatum', () => {
    expect(zulassungGilt(programm(), '2025-12-31')).toBe(false);
  });

  it('liefert die Werbekennzeichnung nur mit Programm', () => {
    expect(werbekennzeichnung(null)).toBeNull();
    expect(werbekennzeichnung(programm())).toContain('Werbung');
  });

  it('begründet auch die Erlaubnis, nicht nur die Ablehnung', () => {
    const entscheidung = partnerHinweisErlaubt({
      market: mitCommerce(true),
      placement: 'information_page',
      stichtag: HEUTE,
      programme: eins,
    });
    expect(entscheidung.grund.length).toBeGreaterThan(10);
  });
});
