// M17-01 — Der Datenbranch enthält Daten. Alles andere ist ein Abbruchgrund.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  DATEN_BRANCH,
  DataBranchError,
  ERLAUBTE_MUSTER,
  VERBOTENE_BRANCHES,
  dateienUnter,
  pruefeBranch,
  pruefeDatenbaum,
  schreibeDatenbaum,
} from '../../scripts/publish/data-branch.ts';

let wurzel: string;
let ziel: string;

function lege(pfad: string, inhalt: string): void {
  const voll = join(wurzel, pfad);
  mkdirSync(join(voll, '..'), { recursive: true });
  writeFileSync(voll, inhalt, 'utf8');
}

beforeEach(() => {
  wurzel = mkdtempSync(join(tmpdir(), 'petatlas-daten-'));
  ziel = mkdtempSync(join(tmpdir(), 'petatlas-ziel-'));
});

afterEach(() => {
  rmSync(wurzel, { recursive: true, force: true });
  rmSync(ziel, { recursive: true, force: true });
});

describe('Prüfung des Datenbaums', () => {
  it('nimmt normalisierte Datendateien an', () => {
    lege('v1/manifest.json', '{"chunks":[]}');
    lege('v1/places/de/index.abc12345.json', '{"places":[]}');
    lege('v1/places/de/LICENSE.txt', 'Open Database License');

    const ergebnis = pruefeDatenbaum(wurzel);
    expect(ergebnis.abgelehnt).toEqual([]);
    expect(ergebnis.erlaubt.length).toBe(3);
  });

  it('lehnt Code ab, statt ihn wegzulassen', () => {
    lege('v1/manifest.json', '{}');
    lege('v1/boese.js', 'console.log(1)');
    lege('v1/seite.astro', '<h1>nein</h1>');

    const ergebnis = pruefeDatenbaum(wurzel);
    expect(ergebnis.abgelehnt.map((befund) => befund.datei).sort()).toEqual([
      'v1/boese.js',
      'v1/seite.astro',
    ]);
    expect(ergebnis.abgelehnt[0]?.grund).toContain('gehört nicht in den Datenbranch');
  });

  it('lehnt alles ab, was keinem erlaubten Muster entspricht', () => {
    lege('v1/manifest.json', '{}');
    lege('irgendwo/daten.json', '{}');
    lege('v1/ordner/datei.csv', 'a,b');

    const abgelehnt = pruefeDatenbaum(wurzel).abgelehnt.map((befund) => befund.datei);
    expect(abgelehnt).toContain('irgendwo/daten.json');
    expect(abgelehnt).toContain('v1/ordner/datei.csv');
  });

  it('lehnt eine Datei mit einem Secret ab', () => {
    lege('v1/manifest.json', '{}');
    // Ein Wert, den der Secret-Audit erkennt — zusammengesetzt, damit er
    // nicht selbst als Fund im Repository landet.
    const wert = ['ghp', '_', 'A'.repeat(36)].join('');
    lege('v1/leck.json', JSON.stringify({ token: wert }));

    const ergebnis = pruefeDatenbaum(wurzel);
    expect(ergebnis.abgelehnt.map((befund) => befund.datei)).toContain('v1/leck.json');
    expect(ergebnis.abgelehnt[0]?.grund).toContain('Secret-Audit');
  });

  it('findet Dateien in Unterverzeichnissen', () => {
    lege('v1/a/b/c/tief.json', '{}');
    expect(dateienUnter(wurzel)).toEqual(['v1/a/b/c/tief.json']);
  });

  it('kommt mit einem fehlenden Verzeichnis zurecht', () => {
    expect(dateienUnter(join(wurzel, 'gibt-es-nicht'))).toEqual([]);
  });
});

describe('Zielbranch', () => {
  it('lehnt main und master ab', () => {
    for (const branch of VERBOTENE_BRANCHES) {
      expect(() => pruefeBranch(branch), branch).toThrow(DataBranchError);
    }
  });

  it('lehnt einen unsinnigen Branchnamen ab', () => {
    for (const branch of ['', 'A', '../etwas', 'branch mit leerzeichen', '-start']) {
      expect(() => pruefeBranch(branch), branch).toThrow(DataBranchError);
    }
  });

  it('nimmt den Datenbranch an', () => {
    expect(() => pruefeBranch(DATEN_BRANCH)).not.toThrow();
  });
});

describe('Schreiben', () => {
  it('schreibt den geprüften Baum samt Liesmich', () => {
    lege('v1/manifest.json', '{"chunks":[]}');
    lege('v1/places/de/LICENSE.txt', 'Open Database License');

    const ergebnis = schreibeDatenbaum(wurzel, ziel);
    expect(ergebnis.dateien).toBe(2);
    expect(existsSync(join(ziel, 'data/v1/manifest.json'))).toBe(true);
    expect(readFileSync(join(ziel, 'README.md'), 'utf8')).toContain('ausschließlich');
  });

  it('schreibt nichts, wenn eine Datei abgelehnt wird', () => {
    lege('v1/manifest.json', '{}');
    lege('v1/boese.js', 'console.log(1)');

    expect(() => schreibeDatenbaum(wurzel, ziel)).toThrow(DataBranchError);
    expect(existsSync(join(ziel, 'data'))).toBe(false);
  });

  it('schreibt nichts bei leerem Datenbaum', () => {
    expect(() => schreibeDatenbaum(wurzel, ziel)).toThrow(/leer/);
  });

  it('schreibt niemals in einen Codebranch', () => {
    lege('v1/manifest.json', '{}');
    expect(() => schreibeDatenbaum(wurzel, ziel, 'main')).toThrow(DataBranchError);
    expect(existsSync(join(ziel, 'data'))).toBe(false);
  });

  it('räumt ein altes Ziel weg, statt zu mischen', () => {
    mkdirSync(join(ziel, 'data/v1'), { recursive: true });
    writeFileSync(join(ziel, 'data/v1/alt.json'), '{}', 'utf8');
    lege('v1/manifest.json', '{"chunks":[]}');

    schreibeDatenbaum(wurzel, ziel);
    expect(existsSync(join(ziel, 'data/v1/alt.json'))).toBe(false);
    expect(existsSync(join(ziel, 'data/v1/manifest.json'))).toBe(true);
  });
});

describe('Muster', () => {
  it('erlaubt Großbuchstaben im Dateinamen', () => {
    expect(ERLAUBTE_MUSTER.some((muster) => muster.test('v1/places/de/LICENSE.txt'))).toBe(true);
  });

  it('erlaubt keinen Pfad außerhalb einer Version', () => {
    expect(ERLAUBTE_MUSTER.some((muster) => muster.test('geheim/daten.json'))).toBe(false);
  });
});
