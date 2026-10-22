import { describe, expect, it } from 'vitest';

import { pruefeDatenPr, zaehle } from '../../scripts/publish/daten-automerge.ts';

const katalog = 'content-data/products/zooroyal-catalog.json';
const zuordnung = 'content-data/products/zooroyal-feed.json';

describe('Automatischer Merge von Daten-PRs', () => {
  it('lässt einen normalen Feedabgleich durch', () => {
    const befund = pruefeDatenPr(
      'awin/zooroyal-39574717153',
      [katalog, zuordnung],
      [
        { datei: katalog, vorher: 312, nachher: 298 },
        { datei: zuordnung, vorher: 1, nachher: 1 },
      ],
    );
    expect(befund).toEqual({ erlaubt: true, gruende: [] });
  });

  it('lässt kommunale Snapshots durch', () => {
    const datei = 'data-snapshots/municipal/berlin-hundefreilauf.json';
    expect(
      pruefeDatenPr('ingest/2026-10-19-39233239869', [datei], [{ datei, vorher: 30, nachher: 30 }])
        .erlaubt,
    ).toBe(true);
  });

  it('hält unbekannte Zweige auf', () => {
    expect(pruefeDatenPr('feature/irgendwas', [katalog], []).erlaubt).toBe(false);
  });

  it('hält Änderungen außerhalb des Imports auf, auch am Gebührenkatalog', () => {
    const befund = pruefeDatenPr(
      'ingest/2026-10-26-1',
      ['data-snapshots/municipal/berlin-hundefreilauf.json', 'data-snapshots/got/got-2022.json'],
      [],
    );
    expect(befund.erlaubt).toBe(false);
    expect(befund.gruende.join(' ')).toContain('got-2022.json');
  });

  it('hält einen Einbruch um mehr als ein Viertel auf', () => {
    const befund = pruefeDatenPr(
      'awin/zooroyal-1',
      [katalog],
      [{ datei: katalog, vorher: 312, nachher: 200 }],
    );
    expect(befund.erlaubt).toBe(false);
    expect(befund.gruende[0]).toContain('312 auf 200');
  });

  it('hält leere oder unlesbare Dateien auf', () => {
    expect(
      pruefeDatenPr('awin/zooroyal-1', [katalog], [{ datei: katalog, vorher: 312, nachher: 0 }])
        .erlaubt,
    ).toBe(false);
    expect(
      pruefeDatenPr('awin/zooroyal-1', [katalog], [{ datei: katalog, vorher: 312, nachher: null }])
        .erlaubt,
    ).toBe(false);
  });

  it('zählt Produkte und Flächen', () => {
    expect(zaehle('{"products":[1,2,3]}')).toBe(3);
    expect(zaehle('{"areaCount":2,"areas":[{},{}]}')).toBe(2);
    expect(zaehle('kein json')).toBeNull();
    expect(zaehle(null)).toBeNull();
  });
});
