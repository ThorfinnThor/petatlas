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

describe('Kandidaten stehen auf pending', () => {
  it('hat im Startzustand keine verifizierte Quelle', () => {
    expect(verifiedSources()).toEqual([]);
    expect(pendingSources().length).toBe(allSources().length);
  });

  it('erlaubt für eine pending-Quelle keine einzige Ausgabeform', () => {
    for (const eintrag of allSources()) {
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

  it('trägt für jede Quelle die Attributionspflicht bereits ein', () => {
    for (const eintrag of allSources()) {
      expect(eintrag.rights.attributionRequired).toBe(true);
    }
  });

  it('kennzeichnet das OSM-Extrakt als share-alike-behaftet', () => {
    expect(rightsFor('osm-geofabrik-germany-pbf').shareAlike).toBe(true);
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
