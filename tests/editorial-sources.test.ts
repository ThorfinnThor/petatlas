import { describe, expect, it } from 'vitest';

import { editorialSources } from '../src/domain/editorial-sources.ts';

describe('Redaktionelle Quellen und externe Dienste', () => {
  it('führt jede Quelle eindeutig mit Verwendungs- und Rechteumfang', () => {
    const sources = editorialSources();
    expect(sources.length).toBeGreaterThan(10);
    expect(new Set(sources.map((source) => source.id)).size).toBe(sources.length);
    for (const source of sources) {
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.usage.length).toBeGreaterThan(15);
      expect(source.rightsBasis.length).toBeGreaterThan(15);
      expect(source.allowedOutputs.length).toBeGreaterThan(15);
      expect(source.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.evidence.length).toBeGreaterThan(5);
    }
  });

  it('führt Kartenkacheln getrennt vom OSM-Datenextrakt', () => {
    const tiles = editorialSources().find((source) => source.id === 'osm-standard-tiles');
    expect(tiles?.category).toBe('externer Dienst');
    expect(tiles?.allowedOutputs).toContain('kein Vorabladen');
  });

  it('beschränkt Herstellerquellen auf Links und zugeordnete Fakten', () => {
    const manufacturers = editorialSources().filter(
      (source) => source.category === 'Herstellerquelle',
    );
    expect(manufacturers.length).toBeGreaterThan(3);
    for (const source of manufacturers) {
      expect(source.allowedOutputs).toContain('keine Produktbilder');
    }
  });
});
