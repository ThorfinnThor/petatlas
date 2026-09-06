// M05-01 — Ein Registryeintrag ist eine konkrete Distribution.
import { describe, expect, it } from 'vitest';

import {
  SourceEntrySchema,
  allSources,
  getSource,
  pendingSources,
  requireSource,
  rightsFor,
  verifiedSources,
} from '../src/domain/source-registry.ts';
import { mayPublish } from '../src/domain/rights.ts';

const OSM = requireSource('osm-geofabrik-germany-pbf');

describe('Einträge sind konkrete Distributionen', () => {
  it('nennt für jede Quelle eine abrufbare Distribution und die geltenden Bedingungen', () => {
    for (const eintrag of allSources()) {
      expect(eintrag.distributionUrl).toMatch(/^https:\/\//);
      expect(eintrag.primaryTermsUrl).toMatch(/^https:\/\//);
      expect(eintrag.format).toBeTruthy();
      expect(eintrag.coverage.spatial).toBeTruthy();
    }
  });

  it('lehnt einen bloßen Anbieternamen als Ressource ab', () => {
    const result = SourceEntrySchema.safeParse({ ...OSM, resourceName: 'GovData' });
    expect(result.success).toBe(false);
  });

  it('lehnt einen Eintrag ohne Bedingungen ab', () => {
    const ohne: Record<string, unknown> = { ...OSM };
    delete ohne.primaryTermsUrl;
    expect(SourceEntrySchema.safeParse(ohne).success).toBe(false);
  });

  it('lehnt einen Rechteeintrag ab, der zu einer anderen Quelle gehört', () => {
    const vertauscht = { ...OSM, rights: { ...OSM.rights, sourceId: 'andere-quelle' } };
    expect(SourceEntrySchema.safeParse(vertauscht).success).toBe(false);
  });

  it('lehnt unbekannte Zusatzfelder ab', () => {
    expect(SourceEntrySchema.safeParse({ ...OSM, extra: true }).success).toBe(false);
  });
});

describe('Ungeprüfte Quellen dürfen nichts', () => {
  it('erlaubt für eine pending-Quelle keine einzige Ausgabeform', () => {
    expect(pendingSources().length).toBeGreaterThan(0);
    for (const eintrag of pendingSources()) {
      for (const kanal of [
        'websiteDisplay',
        'publicJsonDelivery',
        'publicRepository',
        'images',
      ] as const) {
        expect(mayPublish(eintrag.rights, kanal).allowed, `${eintrag.sourceId}/${kanal}`).toBe(
          false,
        );
      }
    }
  });

  it('hält den Gebührenkatalog weiterhin zurück', () => {
    // Der Bezugsweg ist nicht geklärt, siehe docs/SOURCE_REVIEWS.md.
    expect(requireSource('got-2022-gesetze-im-internet').rights.status).toBe('pending');
  });

  it('trägt für jede Quelle die Attributionspflicht bereits ein', () => {
    for (const eintrag of allSources()) {
      expect(eintrag.rights.attributionRequired).toBe(true);
    }
  });

  it('kennzeichnet das OSM-Extrakt als share-alike-behaftet', () => {
    expect(rightsFor('osm-geofabrik-germany-pbf').shareAlike).toBe(true);
  });
});

describe('Verifizierte Quellen tragen ihren Nachweis', () => {
  it('hat für das OSM-Extrakt Lizenz, Prüfdatum, Nachweis und Wortlaut', () => {
    const [erste] = verifiedSources();
    expect(erste?.sourceId).toBe('osm-geofabrik-germany-pbf');
    expect(erste?.rights.licenseId).toBe('ODbL-1.0');
    expect(erste?.rights.checkedAt).not.toBeNull();
    expect(erste?.rights.approvalEvidence).toContain('SOURCE_REVIEWS');
    expect(erste?.rights.termsHash).toMatch(/^[a-f0-9]{64}$/);
    expect(erste?.attributionText).toContain('OpenStreetMap');
  });

  it('erlaubt für das OSM-Extrakt Anzeige, JSON und Repository, aber keine Bilder', () => {
    const osm = requireSource('osm-geofabrik-germany-pbf');
    expect(mayPublish(osm.rights, 'websiteDisplay').allowed).toBe(true);
    expect(mayPublish(osm.rights, 'publicJsonDelivery').allowed).toBe(true);
    expect(mayPublish(osm.rights, 'publicRepository').allowed).toBe(true);
    expect(mayPublish(osm.rights, 'images').allowed).toBe(false);
  });

  it('verlangt für eine verifizierte Quelle mit Attributionspflicht den Wortlaut', () => {
    const osm = requireSource('osm-geofabrik-germany-pbf');
    const ohneWortlaut: Record<string, unknown> = { ...osm };
    delete ohneWortlaut.attributionText;
    expect(SourceEntrySchema.safeParse(ohneWortlaut).success).toBe(false);
  });
});

describe('Zugriff', () => {
  it('liefert für eine unbekannte Quelle undefined statt einer Vermutung', () => {
    expect(getSource('gibt-es-nicht')).toBeUndefined();
    expect(() => requireSource('gibt-es-nicht')).toThrow(/Unbekannte Quelle/);
  });

  it('vergibt eindeutige Quell-IDs', () => {
    const ids = allSources().map((eintrag) => eintrag.sourceId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
