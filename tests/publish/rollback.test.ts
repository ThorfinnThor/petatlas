// M17-06 — Ein Rollback ist nicht „den alten Stand wieder hinstellen“,
// sondern die Frage, ob er heute noch ausgeliefert werden darf. Geprüft wird
// deshalb vor allem, wann die Antwort nein lautet.
import { describe, expect, it } from 'vitest';

import { DATENPFADE, alsText, pruefeRollback, quellenAus } from '../../scripts/publish/rollback.ts';

const HEUTE = '2026-09-08';

function stand(
  ueberschreibung: Record<string, string | null> = {},
): (ref: string, pfad: string) => string | null {
  const standard: Record<string, string> = {
    'data-snapshots/got/got-2022.json': JSON.stringify({
      itemCount: 1,
      source: { retrievalDate: '2026-09-01T00:00:00.000Z' },
    }),
    'data-snapshots/places/places-de.json': JSON.stringify({
      source: { regions: [{ sourceId: 'osm-geofabrik-berlin-pbf' }] },
    }),
    'data-snapshots/municipal/berlin-hundefreilauf.json': JSON.stringify({
      source: { sourceId: 'berlin-hundefreilauf-wfs' },
    }),
    'data-snapshots/municipal/hamburg-hundeauslaufzonen.json': JSON.stringify({
      source: { sourceId: 'hamburg-hundeauslaufzonen-wfs' },
    }),
    'content-data/travel/rules/eu-intra-2026.json': JSON.stringify({ ruleSetId: 'x' }),
    'content-data/travel/approvals.json': JSON.stringify({ approvals: [] }),
  };
  return (_ref: string, pfad: string) =>
    pfad in ueberschreibung ? ueberschreibung[pfad]! : (standard[pfad] ?? null);
}

describe('Ein sauberer Stand', () => {
  it('gilt als zulässig', () => {
    const bericht = pruefeRollback('probe', HEUTE, stand());
    expect(bericht.zulaessig).toBe(true);
  });

  it('prüft jede erklärte Datei', () => {
    const bericht = pruefeRollback('probe', HEUTE, stand());
    for (const { pfad } of DATENPFADE) {
      expect(bericht.punkte.some((punkt) => punkt.name.includes(pfad))).toBe(true);
    }
  });
});

describe('Wann ein Rollback nicht zulässig ist', () => {
  it('lehnt einen unvollständigen Stand ab', () => {
    const bericht = pruefeRollback(
      'probe',
      HEUTE,
      stand({ 'content-data/travel/approvals.json': null }),
    );
    expect(bericht.zulaessig).toBe(false);
    expect(alsText(bericht)).toContain('Fehlt im Kandidatenstand');
  });

  it('lehnt unlesbares JSON ab', () => {
    const bericht = pruefeRollback(
      'probe',
      HEUTE,
      stand({ 'data-snapshots/got/got-2022.json': '<html>Fehlerseite</html>' }),
    );
    expect(bericht.zulaessig).toBe(false);
  });

  it('macht einen Rechtewiderruf nicht rückgängig', () => {
    // `opff` steht im Register auf „pending“ — genau der Fall, den ein
    // Rollback nicht überschreiben darf.
    const bericht = pruefeRollback(
      'probe',
      HEUTE,
      stand({
        'data-snapshots/municipal/berlin-hundefreilauf.json': JSON.stringify({
          source: { sourceId: 'opff' },
        }),
      }),
    );
    expect(bericht.zulaessig).toBe(false);
    expect(alsText(bericht)).toContain('Widerruf');
  });

  it('lehnt eine Quelle ab, die heute nicht mehr im Register steht', () => {
    const bericht = pruefeRollback(
      'probe',
      HEUTE,
      stand({
        'data-snapshots/municipal/berlin-hundefreilauf.json': JSON.stringify({
          source: { sourceId: 'laengst-abgeschaltet' },
        }),
      }),
    );
    expect(bericht.zulaessig).toBe(false);
    expect(alsText(bericht)).toContain('nicht mehr im Register');
  });

  it('lehnt einen Stand ab, der inzwischen zu alt geworden ist', () => {
    // Sperrschwelle des Gebührenstandes: 400 Tage.
    const bericht = pruefeRollback('probe', '2028-01-01', stand());
    expect(bericht.zulaessig).toBe(false);
    expect(alsText(bericht)).toContain('nicht mehr brauchbar');
  });

  it('meldet einen fehlenden Stand als unbekannt, nicht als frisch', () => {
    const bericht = pruefeRollback(
      'probe',
      HEUTE,
      stand({ 'data-snapshots/got/got-2022.json': JSON.stringify({ source: {} }) }),
    );
    expect(bericht.zulaessig).toBe(false);
    expect(alsText(bericht)).toContain('Kein Datenstand hinterlegt');
  });
});

describe('Quellen hinter einer Datei', () => {
  it('nimmt die erklärte Zuordnung, auch wenn der Snapshot keine nennt', () => {
    expect(quellenAus(JSON.stringify({ source: {} }), ['got-2022-gesetze-im-internet'])).toEqual([
      'got-2022-gesetze-im-internet',
    ]);
  });

  it('nimmt die Regionen eines zusammengesetzten Standes mit', () => {
    const inhalt = JSON.stringify({ source: { regions: [{ sourceId: 'a' }, { sourceId: 'b' }] } });
    expect(quellenAus(inhalt, [])).toEqual(['a', 'b']);
  });

  it('kommt mit unlesbarem Inhalt zurecht', () => {
    expect(quellenAus('kein json', ['x'])).toEqual(['x']);
  });
});
