import { describe, expect, it } from 'vitest';

import {
  GOT_NACHFRAGE,
  SEO_INDEX_BUDGET,
  gotPositionsQualitaet,
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
  it('konzentriert den Index auf wenige GOT-Einzelseiten', () => {
    const anzahl = indexierbareGotPositionen().length;
    expect(anzahl).toBeGreaterThanOrEqual(35);
    expect(anzahl).toBeLessThanOrEqual(70);
  });

  it('nimmt jede Position mit gemessener Nachfrage auf und sonst keine Nutztierposition', () => {
    for (const id of GOT_NACHFRAGE) expect(istIndexierbareGotPosition(position(id))).toBe(true);
    for (const eintrag of indexierbareGotPositionen()) {
      const nachfrage = (GOT_NACHFRAGE as readonly string[]).includes(eintrag.item.officialItemId);
      if (!nachfrage) {
        expect(gotPositionsQualitaet(eintrag).score).toBeGreaterThanOrEqual(
          SEO_INDEX_BUDGET.minimumGotScore,
        );
        expect(gotPositionsQualitaet(eintrag).begruendung).not.toContain('außerhalb des Portals');
      }
    }
  });

  it('priorisiert Leistungen für Hunde und Katzen vor Nutztierleistungen', () => {
    expect(istIndexierbareGotPosition(position('16'))).toBe(true);
    expect(istIndexierbareGotPosition(position('4'))).toBe(false);
    expect(istIndexierbareGotPosition(position('80'))).toBe(false);
  });

  it('indexiert nur Gruppen mit genügend eigenständigem Katalogwert', () => {
    expect(indexierbareGotGruppen().length).toBeLessThanOrEqual(15);
    expect(
      indexierbareGotGruppen().every(
        (gruppe) => gruppe.positionen.length >= SEO_INDEX_BUDGET.minimumGotGroupSize,
      ),
    ).toBe(true);
  });
});
