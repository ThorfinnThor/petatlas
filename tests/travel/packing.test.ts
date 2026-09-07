// M12-05 — Packliste ohne Medikamente und ohne toten Verweis.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { PackingListSchema } from '../../src/domain/schemas/travel.ts';
import {
  KATEGORIE_TITEL,
  packlisteNach,
  reisePackliste,
} from '../../src/features/travel/packing.ts';
import { alleRegeln } from '../../src/features/travel/rules.ts';
import { ZIELLAENDER } from '../../src/features/travel/laender.ts';
import { reiseUmfang } from '../../src/features/travel/scope.ts';

const roh = JSON.parse(readFileSync('content-data/travel/packing-list.json', 'utf8')) as unknown;

describe('Packliste', () => {
  it('entspricht dem Schema', () => {
    expect(PackingListSchema.safeParse(roh).success).toBe(true);
  });

  it('hat zu jeder Rubrik Einträge', () => {
    for (const kategorie of ['rule_task', 'documents', 'equipment'] as const) {
      expect(packlisteNach(kategorie).length, kategorie).toBeGreaterThan(0);
      expect(KATEGORIE_TITEL[kategorie].length).toBeGreaterThan(3);
    }
  });

  it('verweist bei jeder regelbezogenen Aufgabe auf eine vorhandene Anforderung', () => {
    const bekannt = new Set(alleRegeln().map((regel) => regel.requirementId));
    for (const eintrag of packlisteNach('rule_task')) {
      expect(eintrag.requirementId, eintrag.itemId).not.toBeNull();
      expect(bekannt.has(eintrag.requirementId!), eintrag.itemId).toBe(true);
    }
  });

  it('deckt jede Anforderung mit mindestens einer Aufgabe ab', () => {
    const abgedeckt = new Set(packlisteNach('rule_task').map((e) => e.requirementId));
    for (const regel of alleRegeln()) {
      expect(abgedeckt.has(regel.requirementId), regel.requirementId).toBe(true);
    }
  });

  it('nennt kein Medikament, keinen Wirkstoff und keine Dosierung', () => {
    const text = reisePackliste()
      .items.map((eintrag) => `${eintrag.label} ${eintrag.note}`)
      .join('\n')
      .toLowerCase();
    for (const wort of [
      'medikament',
      'tablette',
      'wirkstoff',
      'dosier',
      'mg',
      'ml',
      'reiseapotheke',
      'wurmkur',
      'beruhigungsmittel',
      'zeckenmittel',
      'spot-on',
      'impfstoff',
    ]) {
      expect(text.includes(wort), wort).toBe(false);
    }
  });

  it('begründet jeden Eintrag, statt ihn nur aufzuzählen', () => {
    for (const eintrag of reisePackliste().items) {
      expect(eintrag.note.length, eintrag.itemId).toBeGreaterThan(30);
    }
  });
});

describe('Zielländer', () => {
  it('deckt genau die unterstützten Ziele ab', () => {
    expect(Object.keys(ZIELLAENDER).sort()).toEqual([...reiseUmfang().destinations].sort());
  });

  it('nutzt Pfadstücke ohne Umlaute und ohne Großbuchstaben', () => {
    for (const [code, land] of Object.entries(ZIELLAENDER)) {
      expect(land.slug, code).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(land.name.length).toBeGreaterThan(2);
    }
  });
});
