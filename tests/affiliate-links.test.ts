// M09-03 — Ein ungeprüfter Link wird nicht abgeschwächt, sondern weggelassen.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PartnerProgramSchema, type PartnerProgram } from '../src/domain/schemas/partner.ts';
import {
  KAMPAGNEN_PARAMETER,
  PARTNER_LINK_ATTRIBUTE,
  partnerZiel,
  pruefeZiel,
} from '../src/features/commerce/links.ts';

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

describe('Zielprüfung', () => {
  it('lässt die vertraglich hinterlegte Adresse zu', () => {
    const pruefung = pruefeZiel(programm());
    expect(pruefung.gueltig).toBe(true);
    expect(pruefung.grund).toContain('beispiel.invalid');
  });

  it('lehnt einen fremden Host ab, auch wenn er ähnlich aussieht', () => {
    for (const url of [
      'https://beispiel.invalid.fremd.example/angebot',
      'https://fremd.example/beispiel.invalid',
      'https://sub.beispiel.invalid/angebot',
    ]) {
      const pruefung = pruefeZiel(programm({ landingUrl: url }));
      expect(pruefung.gueltig, url).toBe(false);
      expect(pruefung.grund).toContain('allowedLinkHosts');
    }
  });

  it('lehnt alles ab, was nicht https ist', () => {
    expect(pruefeZiel(programm({ landingUrl: 'http://beispiel.invalid/a' })).gueltig).toBe(false);
  });

  it('lehnt Zugangsdaten und abweichende Ports ab', () => {
    expect(
      pruefeZiel(programm({ landingUrl: 'https://nutzer:geheim@beispiel.invalid/a' })).gueltig,
    ).toBe(false);
    expect(pruefeZiel(programm({ landingUrl: 'https://beispiel.invalid:8443/a' })).gueltig).toBe(
      false,
    );
  });

  it('lehnt verdeckte Weiterleitungen ab', () => {
    for (const url of [
      'https://beispiel.invalid/go?url=https://fremd.example',
      'https://beispiel.invalid/go?redirect=/woanders',
      'https://beispiel.invalid/go?r=https%3A%2F%2Ffremd.example',
      'https://beispiel.invalid/go?ziel=//fremd.example',
    ]) {
      expect(pruefeZiel(programm({ landingUrl: url })).gueltig, url).toBe(false);
    }
  });

  it('lehnt eine nicht konfigurierte Kampagnenkennung ab', () => {
    const fremd = programm({
      landingUrl: 'https://beispiel.invalid/a?campaign=NICHT_KONFIGURIERT',
    });
    const pruefung = pruefeZiel(fremd);
    expect(pruefung.gueltig).toBe(false);
    expect(pruefung.grund).toContain('Kampagnenkennung');
  });

  it('lehnt eine unparsebare Adresse ab', () => {
    expect(pruefeZiel(programm({ landingUrl: 'kein-link' })).gueltig).toBe(false);
  });
});

describe('Ausgelieferte Adresse', () => {
  it('hängt genau eine statische Kennung an', () => {
    const ziel = new URL(partnerZiel(programm()) as string);
    expect([...ziel.searchParams.keys()]).toEqual([KAMPAGNEN_PARAMETER]);
    expect(ziel.searchParams.get(KAMPAGNEN_PARAMETER)).toBe('STATISCH_1');
  });

  it('lässt vertragliche Parameter unangetastet', () => {
    const mitPfad = programm({ landingUrl: 'https://beispiel.invalid/a?variante=b' });
    const ziel = new URL(partnerZiel(mitPfad) as string);
    expect(ziel.searchParams.get('variante')).toBe('b');
    expect(ziel.searchParams.get(KAMPAGNEN_PARAMETER)).toBe('STATISCH_1');
  });

  it('blendet einen ungültigen Link aus, statt ihn abzuschwächen', () => {
    expect(partnerZiel(programm({ landingUrl: 'http://beispiel.invalid/a' }))).toBeNull();
    expect(partnerZiel(programm({ landingUrl: 'https://fremd.example/a' }))).toBeNull();
    expect(partnerZiel(programm({ landingUrl: null }))).toBeNull();
    expect(partnerZiel(null)).toBeNull();
  });

  it('blendet ein inaktives Programm aus', () => {
    for (const status of ['none', 'applied', 'rejected', 'ended'] as const) {
      expect(partnerZiel(programm({ status, approval: null })), status).toBeNull();
    }
  });

  it('kennzeichnet den Link als bezahlt und öffnet ihn abgeschottet', () => {
    expect(PARTNER_LINK_ATTRIBUTE.rel).toContain('sponsored');
    expect(PARTNER_LINK_ATTRIBUTE.rel).toContain('nofollow');
    expect(PARTNER_LINK_ATTRIBUTE.rel).toContain('noopener');
  });
});

describe('Keine Anfragen an den Anbieter', () => {
  const originalFetch = globalThis.fetch;
  let aufrufe: unknown[][];

  beforeEach(() => {
    aufrufe = [];
    globalThis.fetch = vi.fn((...args: unknown[]) => {
      aufrufe.push(args);
      return Promise.reject(new Error('In diesem Test darf nichts abgerufen werden.'));
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('prüft offline: kein Live-Abruf beim Anbieter', () => {
    // Ein „Verifizieren“ per HTTP-Abruf wäre beim Anbieter ein zählbarer
    // Aufruf — im Build wie im Test.
    pruefeZiel(programm());
    partnerZiel(programm());
    pruefeZiel(programm({ landingUrl: 'https://fremd.example/a' }));
    expect(aufrufe).toEqual([]);
  });
});

describe('Zusammenspiel mit dem Schema', () => {
  it('die Schemaprüfung und die Linkprüfung sind sich einig', () => {
    // Was das Schema durchlässt, muss die Linkprüfung ebenfalls annehmen.
    const gueltig = PartnerProgramSchema.parse(programm());
    expect(pruefeZiel(gueltig).gueltig).toBe(true);

    // Und was die Linkprüfung ablehnt, darf das Schema gar nicht erst
    // durchlassen — sonst gäbe es eine Konfiguration, die gültig aussieht und
    // trotzdem nie einen Link erzeugt.
    const fremd = { ...programm(), landingUrl: 'https://fremd.example/a' };
    expect(PartnerProgramSchema.safeParse(fremd).success).toBe(false);
  });
});
