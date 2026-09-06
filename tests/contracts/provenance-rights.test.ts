// M03-03 — Unbekannte Rechte oder fehlende Pflichtprovenienz verhindern
// öffentliche Ausgabe. Alle Werte hier sind synthetisch.
import { describe, expect, it } from 'vitest';

import {
  ProvenanceSchema,
  isReviewApproved,
  parseProvenance,
  withRetrieval,
} from '../../src/domain/source.ts';
import {
  SourceRightsSchema,
  mayPublish,
  pendingRights,
  type SourceRights,
} from '../../src/domain/rights.ts';

const HASH = 'a'.repeat(64);

const PROVENANCE = {
  sourceId: 'synthetic-source',
  sourceRecordId: 'synthetic-record-1',
  sourceUrl: 'https://example.invalid/datensatz/1',
  retrievedAt: '2026-09-06T10:00:00+00:00',
  sourceUpdatedAt: null,
  contentHash: HASH,
  licenseId: 'synthetic-license',
  normalizationVersion: '1',
  validFrom: null,
  validTo: null,
  reviewedAt: null,
  reviewStatus: 'unreviewed' as const,
};

const VERIFIED_RIGHTS: SourceRights = SourceRightsSchema.parse({
  sourceId: 'synthetic-source',
  status: 'verified',
  licenseId: 'synthetic-license',
  licenseUrl: 'https://example.invalid/lizenz',
  commercialUse: true,
  publicRedistribution: true,
  websiteDisplay: true,
  publicJsonDelivery: false,
  publicRepository: null,
  attributionRequired: true,
  shareAlike: true,
  imagesAllowed: null,
  mayStoreHistory: null,
  mayCacheOriginals: null,
  termsHash: null,
  checkedAt: '2026-09-06T10:00:00+00:00',
  approvalEvidence: 'docs/reviews/synthetic.md',
});

describe('Provenienz ist Pflicht', () => {
  it('akzeptiert einen vollständigen Datensatz', () => {
    expect(parseProvenance(PROVENANCE).sourceId).toBe('synthetic-source');
  });

  it.each([
    'sourceId',
    'sourceRecordId',
    'sourceUrl',
    'retrievedAt',
    'contentHash',
    'licenseId',
    'normalizationVersion',
    'reviewStatus',
  ])('lehnt einen Datensatz ohne %s ab', (field) => {
    const incomplete: Record<string, unknown> = { ...PROVENANCE };
    delete incomplete[field];
    expect(ProvenanceSchema.safeParse(incomplete).success).toBe(false);
  });

  it('lehnt einen unplausiblen Inhaltshash ab', () => {
    expect(ProvenanceSchema.safeParse({ ...PROVENANCE, contentHash: 'kurz' }).success).toBe(false);
  });

  it('lehnt eine Quell-URL mit Zugangstoken ab', () => {
    const result = ProvenanceSchema.safeParse({
      ...PROVENANCE,
      sourceUrl: 'https://example.invalid/feed?token=geheim123',
    });
    expect(result.success).toBe(false);
  });

  it('lehnt eine Gültigkeit ab, deren Ende vor dem Beginn liegt', () => {
    const result = ProvenanceSchema.safeParse({
      ...PROVENANCE,
      validFrom: '2026-06-01',
      validTo: '2026-05-01',
    });
    expect(result.success).toBe(false);
  });

  it('lehnt unbekannte Zusatzfelder ab', () => {
    expect(ProvenanceSchema.safeParse({ ...PROVENANCE, extra: 1 }).success).toBe(false);
  });
});

describe('Abruf ist keine fachliche Prüfung', () => {
  it('behandelt einen ungeprüften Datensatz als nicht freigegeben', () => {
    expect(isReviewApproved(parseProvenance(PROVENANCE))).toBe(false);
  });

  it('lehnt approved ohne Prüfzeitpunkt ab', () => {
    const result = ProvenanceSchema.safeParse({ ...PROVENANCE, reviewStatus: 'approved' });
    expect(result.success).toBe(false);
  });

  it('lässt den Reviewstatus bei einem neuen Abruf unverändert', () => {
    const approved = parseProvenance({
      ...PROVENANCE,
      reviewStatus: 'approved',
      reviewedAt: '2026-09-01T08:00:00+00:00',
    });
    const refetched = withRetrieval(approved, '2026-09-07T09:00:00+00:00', 'b'.repeat(64));
    expect(refetched.retrievedAt).toBe('2026-09-07T09:00:00+00:00');
    expect(refetched.reviewedAt).toBe('2026-09-01T08:00:00+00:00');
    expect(refetched.reviewStatus).toBe('approved');
  });

  it('behandelt einen zurückgezogenen Datensatz als nicht freigegeben', () => {
    const withdrawn = parseProvenance({
      ...PROVENANCE,
      reviewStatus: 'withdrawn',
      reviewedAt: '2026-09-01T08:00:00+00:00',
    });
    expect(isReviewApproved(withdrawn)).toBe(false);
  });
});

describe('Rechte gelten je Ausgabeform', () => {
  it('erlaubt die geprüfte Ausgabeform und nennt die Attribution', () => {
    const decision = mayPublish(VERIFIED_RIGHTS, 'websiteDisplay');
    expect(decision.allowed).toBe(true);
    expect(decision.attribution).toContain('synthetic-license');
  });

  it('verbietet eine ausdrücklich untersagte Ausgabeform derselben Quelle', () => {
    const decision = mayPublish(VERIFIED_RIGHTS, 'publicJsonDelivery');
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('untersagt');
  });

  it('verbietet eine ungeprüfte Ausgabeform', () => {
    const decision = mayPublish(VERIFIED_RIGHTS, 'publicRepository');
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('ungeprüft');
  });

  it('verbietet Bilder, solange sie nicht ausdrücklich erlaubt sind', () => {
    expect(mayPublish(VERIFIED_RIGHTS, 'images').allowed).toBe(false);
  });

  it('lässt commercialUse allein nicht ausreichen', () => {
    const nurKommerziell = SourceRightsSchema.parse({
      ...VERIFIED_RIGHTS,
      websiteDisplay: null,
      publicJsonDelivery: null,
      commercialUse: true,
    });
    expect(mayPublish(nurKommerziell, 'websiteDisplay').allowed).toBe(false);
  });

  it('verbietet jede Ausgabe, solange der Status nicht verified ist', () => {
    const pending = pendingRights('neue-quelle');
    expect(pending.status).toBe('pending');
    for (const channel of [
      'websiteDisplay',
      'publicJsonDelivery',
      'publicRepository',
      'images',
    ] as const) {
      expect(mayPublish(pending, channel).allowed).toBe(false);
    }
  });

  it('verbietet die Ausgabe bei zurückgezogenen oder abgelaufenen Rechten', () => {
    for (const status of ['rejected', 'expired'] as const) {
      const rights = SourceRightsSchema.parse({ ...VERIFIED_RIGHTS, status });
      expect(mayPublish(rights, 'websiteDisplay').allowed).toBe(false);
    }
  });

  it('lehnt verified ohne Prüfdatum, Nachweis oder Lizenz ab', () => {
    for (const field of ['checkedAt', 'approvalEvidence', 'licenseId'] as const) {
      const result = SourceRightsSchema.safeParse({ ...VERIFIED_RIGHTS, [field]: null });
      expect(result.success).toBe(false);
    }
  });
});
