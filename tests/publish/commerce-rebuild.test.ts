// M17-03 — Ohne Vertrag kein Rebuild. Das ist der Normalzustand, kein Fehler.
import { describe, expect, it } from 'vitest';

import { entscheide } from '../../scripts/publish/commerce-rebuild.ts';
import type { PartnerProgram } from '../../src/domain/schemas/partner.ts';

function programm(ueberschreibung: Partial<PartnerProgram> = {}): PartnerProgram {
  return {
    programId: 'test-programm',
    advertiser: 'Testhändler',
    network: 'direkt',
    markets: ['DE'],
    status: 'approved',
    approval: {
      contractReference: 'Vertrag 1',
      approvedAt: '2026-01-01',
      expiresAt: null,
      reviewEvidence: 'docs/reviews/commerce-partner.md',
      reviewedAt: '2026-01-01T00:00:00+00:00',
    },
    allowedLinkHosts: ['beispiel.test'],
    landingUrl: 'https://beispiel.test/',
    campaignIds: ['A1'],
    allowedPlacements: ['produktkarte'],
    disclosureText: 'Werbung',
    restrictions: [],
    notes: [],
    ...ueberschreibung,
  } as PartnerProgram;
}

describe('Rebuild-Entscheidung', () => {
  it('sagt nein, solange kein Programm freigegeben ist', () => {
    const entscheidung = entscheide('2026-09-08', [], ['DE']);
    expect(entscheidung.noetig).toBe(false);
    expect(entscheidung.begruendung).toContain('Kein zugelassenes Warenprogramm');
  });

  it('sagt nein für die echte Konfiguration — der heutige Zustand', () => {
    expect(entscheide('2026-09-08').noetig).toBe(false);
  });

  it('sagt ja bei einem zugelassenen Programm im aktiven Markt', () => {
    const entscheidung = entscheide('2026-09-08', [programm()], ['DE']);
    expect(entscheidung.noetig).toBe(true);
    expect(entscheidung.programme).toEqual(['test-programm']);
  });

  it('sagt nein bei abgelaufener Zulassung', () => {
    const abgelaufen = programm({
      approval: {
        contractReference: 'Vertrag 1',
        approvedAt: '2026-01-01',
        expiresAt: '2026-06-30',
        reviewEvidence: 'docs/reviews/commerce-partner.md',
        reviewedAt: '2026-01-01T00:00:00+00:00',
      },
    });
    expect(entscheide('2026-09-08', [abgelaufen], ['DE']).noetig).toBe(false);
  });

  it('sagt nein für einen Markt, der nicht aktiv ist', () => {
    const nurUs = programm({ markets: ['US'] });
    expect(entscheide('2026-09-08', [nurUs], ['DE']).noetig).toBe(false);
  });

  it('sagt nein bei einem Programm, das nur beantragt ist', () => {
    const beantragt = programm({ status: 'applied', approval: null });
    expect(entscheide('2026-09-08', [beantragt], ['DE']).noetig).toBe(false);
  });

  it('sagt nein bei einem beendeten Programm', () => {
    expect(entscheide('2026-09-08', [programm({ status: 'ended' })], ['DE']).noetig).toBe(false);
  });
});
