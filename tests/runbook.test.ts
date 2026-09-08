// M19-04 — Ein Betriebshandbuch, dessen Befehle es nicht gibt, ist im
// Ernstfall schlimmer als keins. Deshalb wird geprüft, dass jeder genannte
// Befehl und jede genannte Datei tatsächlich existiert.
import { existsSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import paket from '../package.json' with { type: 'json' };

const DOKUMENTE = ['docs/RUNBOOK.md', 'docs/DEVELOPER_SETUP.md', 'docs/ROLLBACK.md'];

/** Platzhalter in spitzen Klammern sind Absicht und keine Datei. */
function istPlatzhalter(pfad: string): boolean {
  return pfad.includes('<') || pfad.includes('>');
}

describe.each(DOKUMENTE)('%s', (dokument) => {
  const text = readFileSync(dokument, 'utf8');

  it('nennt nur npm-Skripte, die es gibt', () => {
    const skripte = new Set(Object.keys(paket.scripts));
    const genannt = [...text.matchAll(/npm run ([a-z][a-z:-]*)/g)].map(
      (treffer) => treffer[1] ?? '',
    );
    expect(genannt.length).toBeGreaterThan(0);
    const fehlend = [...new Set(genannt)].filter((name) => !skripte.has(name));
    expect(fehlend).toEqual([]);
  });

  it('nennt nur Dateien, die es gibt', () => {
    const pfade = [
      ...text.matchAll(
        /`((?:scripts|config|docs|content-data|data-snapshots|\.github)\/[^`\s]+)`/g,
      ),
    ]
      .map((treffer) => treffer[1] ?? '')
      .filter((pfad) => !istPlatzhalter(pfad));
    expect(pfade.length).toBeGreaterThan(0);
    const fehlend = [...new Set(pfade)].filter((pfad) => !existsSync(pfad));
    expect(fehlend).toEqual([]);
  });
});

describe('Bekannte Grenzen', () => {
  const text = readFileSync('docs/KNOWN_LIMITATIONS.md', 'utf8');

  it('benennt jede blockierte Aufgabe, die eine inhaltliche Grenze bedeutet', () => {
    for (const blocker of ['B-002', 'B-004']) {
      expect(text, blocker).toContain(blocker);
    }
  });

  it('sagt, dass es keine Verfügbarkeitszusage gibt', () => {
    expect(text).toContain('Keine Verfügbarkeitszusage');
  });

  it('sagt, dass keine juristische Prüfung stattgefunden hat', () => {
    expect(text).toContain('Keine juristische Prüfung');
  });
});
