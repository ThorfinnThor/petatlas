import { describe, expect, it } from 'vitest';

import {
  SEO_INDEX_BUDGET,
  indexierbareGotGruppen,
  indexierbareGotPositionen,
  istIndexierbareGotPosition,
} from '../../src/features/seo/index-quality.ts';
import { positionen } from '../../src/features/costs/detail.ts';

function position(id: string) {
  const gefunden = positionen().find((eintrag) => eintrag.item.officialItemId === id);
  if (!gefunden) throw new Error(`GOT-Position ${id} fehlt im Snapshot.`);
  return gefunden;
}

describe('SEO-Qualitätsauswahl', () => {
  it('hält die Zahl der GOT-Einzelseiten stabil', () => {
    expect(indexierbareGotPositionen()).toHaveLength(SEO_INDEX_BUDGET.gotPositions);
  });

  it('priorisiert Leistungen für Hunde und Katzen vor Nutztierleistungen', () => {
    expect(istIndexierbareGotPosition(position('16'))).toBe(true);
    expect(istIndexierbareGotPosition(position('34'))).toBe(true);
    expect(istIndexierbareGotPosition(position('4'))).toBe(false);
    expect(istIndexierbareGotPosition(position('80'))).toBe(false);
  });

  it('indexiert nur Gruppen mit genügend eigenständigem Katalogwert', () => {
    expect(indexierbareGotGruppen()).toHaveLength(71);
    expect(
      indexierbareGotGruppen().every(
        (gruppe) => gruppe.positionen.length >= SEO_INDEX_BUDGET.minimumGotGroupSize,
      ),
    ).toBe(true);
  });
});
