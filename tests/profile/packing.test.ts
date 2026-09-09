// M16-04 — Häkchen gehören zu einer Reise auf einem Gerät.
import { describe, expect, it } from 'vitest';

import {
  MAX_ZIELE,
  PACKING_STORAGE_KEY,
  abgehakt,
  fortschritt,
  leere,
  leererStand,
  lese,
  schreibe,
  setze,
} from '../../src/features/profile/packing-state.ts';
import { PackStandSchema } from '../../src/features/profile/storage-schemas.ts';

const JETZT = '2026-09-08T10:00:00+00:00';

describe('Stand', () => {
  it('beginnt leer', () => {
    const stand = leererStand(JETZT);
    expect(stand.ziele).toEqual({});
    expect(PackStandSchema.safeParse(stand).success).toBe(true);
  });

  it('setzt und entfernt Häkchen', () => {
    let stand = setze(leererStand(JETZT), 'oesterreich', 'transportbox', true, JETZT);
    expect(abgehakt(stand, 'oesterreich', 'transportbox')).toBe(true);
    stand = setze(stand, 'oesterreich', 'transportbox', false, JETZT);
    expect(abgehakt(stand, 'oesterreich', 'transportbox')).toBe(false);
  });

  it('räumt ein Ziel weg, wenn kein Häkchen bleibt', () => {
    let stand = setze(leererStand(JETZT), 'italien', 'leine-geschirr', true, JETZT);
    stand = setze(stand, 'italien', 'leine-geschirr', false, JETZT);
    expect(Object.keys(stand.ziele)).toEqual([]);
  });

  it('hält Ziele auseinander', () => {
    let stand = setze(leererStand(JETZT), 'italien', 'kotbeutel', true, JETZT);
    stand = setze(stand, 'frankreich', 'maulkorb', true, JETZT);
    expect(abgehakt(stand, 'italien', 'kotbeutel')).toBe(true);
    expect(abgehakt(stand, 'italien', 'maulkorb')).toBe(false);
    expect(abgehakt(stand, 'frankreich', 'maulkorb')).toBe(true);
  });

  it('merkt jedes Häkchen nur einmal', () => {
    let stand = setze(leererStand(JETZT), 'italien', 'kotbeutel', true, JETZT);
    stand = setze(stand, 'italien', 'kotbeutel', true, JETZT);
    expect(stand.ziele.italien).toEqual(['kotbeutel']);
  });

  it('begrenzt die Zahl der Ziele', () => {
    let stand = leererStand(JETZT);
    for (let i = 0; i < MAX_ZIELE + 3; i += 1) {
      stand = setze(stand, `ziel-${i}`, 'kotbeutel', true, JETZT);
    }
    expect(Object.keys(stand.ziele).length).toBe(MAX_ZIELE);
  });

  it('leert ein Ziel vollständig', () => {
    let stand = setze(leererStand(JETZT), 'italien', 'kotbeutel', true, JETZT);
    stand = setze(stand, 'italien', 'maulkorb', true, JETZT);
    stand = leere(stand, 'italien', JETZT);
    expect(stand.ziele.italien).toBeUndefined();
  });
});

describe('Lesen', () => {
  it('liest, was es geschrieben hat', () => {
    const stand = setze(leererStand(JETZT), 'italien', 'kotbeutel', true, JETZT);
    expect(lese(schreibe(stand), JETZT)).toEqual(stand);
  });

  it('verwirft Unbrauchbares, statt es zu raten', () => {
    expect(lese('{kein json', JETZT).ziele).toEqual({});
    expect(lese(JSON.stringify({ version: 9, ziele: {} }), JETZT).ziele).toEqual({});
    expect(
      lese(JSON.stringify({ version: 1, ziele: { 'BÖSE ZIEL': ['x'] } }), JETZT).ziele,
    ).toEqual({});
  });

  it('benutzt einen eigenen Schlüssel', () => {
    expect(PACKING_STORAGE_KEY).toBe('petatlas.packing.v1');
  });
});

describe('Fortschritt', () => {
  it('zählt und sagt, wo die Häkchen liegen', () => {
    const stand = setze(leererStand(JETZT), 'italien', 'kotbeutel', true, JETZT);
    const wert = fortschritt(stand, 'italien', 16);
    expect(wert.erledigt).toBe(1);
    expect(wert.gesamt).toBe(16);
    expect(wert.text).toContain('nur auf diesem Gerät');
  });

  it('kommt mit einer leeren Liste zurecht', () => {
    expect(fortschritt(leererStand(JETZT), 'italien', 0).text).toBe('Keine Einträge.');
  });
});
