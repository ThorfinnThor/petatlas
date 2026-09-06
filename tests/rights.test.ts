// M05-02 — Publikationsklassen und Rechte greifen zusammen.
// Kernfall: kommerziell nutzbar, aber nicht weiterverteilbar.
import { describe, expect, it } from 'vitest';

import {
  allowedChannels,
  mayPublishAs,
  mayWriteToPublicOutput,
  type PublicationClass,
} from '../src/domain/publication-policy.ts';
import { SourceRightsSchema, type SourceRights } from '../src/domain/rights.ts';

function rechte(overrides: Partial<SourceRights>): SourceRights {
  return SourceRightsSchema.parse({
    sourceId: 'synthetische-quelle',
    status: 'verified',
    licenseId: 'synthetische-lizenz',
    licenseUrl: null,
    commercialUse: true,
    publicRedistribution: true,
    websiteDisplay: true,
    publicJsonDelivery: true,
    publicRepository: true,
    attributionRequired: false,
    shareAlike: false,
    imagesAllowed: true,
    mayStoreHistory: null,
    mayCacheOriginals: null,
    termsHash: null,
    checkedAt: '2026-09-06T10:00:00+00:00',
    approvalEvidence: 'docs/reviews/synthetisch.md',
    ...overrides,
  });
}

const ALLE_KLASSEN: PublicationClass[] = [
  'public_open',
  'public_display',
  'restricted_raw',
  'local_user',
];

describe('Kommerziell nutzbar ist nicht weiterverteilbar', () => {
  const vertragsfeed = rechte({
    commercialUse: true,
    publicRedistribution: false,
    websiteDisplay: true,
    publicJsonDelivery: false,
    publicRepository: false,
    imagesAllowed: true,
  });

  it('sperrt das öffentliche Repository', () => {
    const entscheidung = mayPublishAs('public_display', vertragsfeed, 'publicRepository');
    expect(entscheidung.allowed).toBe(false);
  });

  it('sperrt die öffentliche JSON-Auslieferung', () => {
    expect(mayPublishAs('public_display', vertragsfeed, 'publicJsonDelivery').allowed).toBe(false);
    expect(mayWriteToPublicOutput('public_display', vertragsfeed).allowed).toBe(false);
  });

  it('sperrt Repository und JSON auch in der offensten Klasse', () => {
    // Die Klasse würde es erlauben; die Rechte tun es nicht.
    expect(mayPublishAs('public_open', vertragsfeed, 'publicRepository').allowed).toBe(false);
    expect(mayPublishAs('public_open', vertragsfeed, 'publicJsonDelivery').allowed).toBe(false);
  });

  it('erlaubt weiterhin die Anzeige im HTML', () => {
    expect(mayPublishAs('public_display', vertragsfeed, 'websiteDisplay').allowed).toBe(true);
  });

  it('lässt genau die Anzeigeformen übrig', () => {
    expect(allowedChannels('public_display', vertragsfeed)).toEqual(['websiteDisplay', 'images']);
  });
});

describe('Die Klasse begrenzt zusätzlich zu den Rechten', () => {
  const vollRechte = rechte({});

  it('erlaubt public_open alle vier Kanäle', () => {
    expect(allowedChannels('public_open', vollRechte)).toEqual([
      'websiteDisplay',
      'publicJsonDelivery',
      'publicRepository',
      'images',
    ]);
  });

  it('lässt public_display keine Datei weitergeben, obwohl die Rechte es erlaubten', () => {
    expect(allowedChannels('public_display', vollRechte)).toEqual(['websiteDisplay', 'images']);
  });

  it('sperrt restricted_raw vollständig, auch bei vollen Rechten', () => {
    expect(allowedChannels('restricted_raw', vollRechte)).toEqual([]);
    const entscheidung = mayPublishAs('restricted_raw', vollRechte, 'websiteDisplay');
    expect(entscheidung.allowed).toBe(false);
    expect(entscheidung.reason).toMatch(/Rohfeed/);
  });

  it('sperrt local_user vollständig', () => {
    expect(allowedChannels('local_user', vollRechte)).toEqual([]);
    expect(mayPublishAs('local_user', vollRechte, 'publicJsonDelivery').reason).toMatch(
      /bleiben im Gerät/,
    );
  });
});

describe('Ungeprüfte und entzogene Rechte', () => {
  it('erlaubt bei pending gar nichts, in jeder Klasse', () => {
    const ungeprueft = SourceRightsSchema.parse({
      ...rechte({}),
      status: 'pending',
      checkedAt: null,
      approvalEvidence: null,
      licenseId: null,
    });
    for (const klasse of ALLE_KLASSEN) {
      expect(allowedChannels(klasse, ungeprueft), klasse).toEqual([]);
    }
  });

  it('erlaubt bei expired gar nichts mehr', () => {
    const abgelaufen = rechte({ status: 'expired' });
    for (const klasse of ALLE_KLASSEN) {
      expect(allowedChannels(klasse, abgelaufen), klasse).toEqual([]);
    }
  });

  it('behandelt einen ungeprüften Kanal wie ein Nein', () => {
    const teilweise = rechte({ publicJsonDelivery: null });
    expect(mayPublishAs('public_open', teilweise, 'publicJsonDelivery').allowed).toBe(false);
    expect(mayPublishAs('public_open', teilweise, 'websiteDisplay').allowed).toBe(true);
  });

  it('verweigert Bilder, wenn nur die Daten erlaubt sind', () => {
    const ohneBilder = rechte({ imagesAllowed: false });
    expect(mayPublishAs('public_open', ohneBilder, 'images').allowed).toBe(false);
    expect(mayPublishAs('public_open', ohneBilder, 'publicJsonDelivery').allowed).toBe(true);
  });
});

describe('Attribution', () => {
  it('nennt den Pflichthinweis bei erlaubter Ausgabe', () => {
    const mitPflicht = rechte({ attributionRequired: true, licenseId: 'ODbL-1.0' });
    const entscheidung = mayPublishAs('public_open', mitPflicht, 'websiteDisplay');
    expect(entscheidung.allowed).toBe(true);
    expect(entscheidung.attribution).toContain('ODbL-1.0');
  });

  it('sperrt die Ausgabe, wenn Attribution Pflicht ist, aber keine Lizenz benannt wurde', () => {
    // Ein solcher Eintrag darf nach dem Schema gar nicht verified sein.
    const result = SourceRightsSchema.safeParse({
      ...rechte({ attributionRequired: true }),
      licenseId: null,
    });
    expect(result.success).toBe(false);
  });
});
