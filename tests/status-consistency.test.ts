// M19-05 — Der Status ist eine Behauptung über die eigene Arbeit. Genau
// deshalb wird er geprüft: gegen das Manifest, gegen die Blockerliste und
// gegen die Regel, dass niemand „fertig“ sagt, solange Freigaben fehlen.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import manifest from '../project/tasks.json' with { type: 'json' };

interface Nachweis {
  readonly description?: string;
  readonly reference?: string;
  readonly verified_at?: string;
}

interface Aufgabe {
  readonly id: string;
  readonly status: string;
  readonly evidence?: readonly Nachweis[];
  readonly blocker?: {
    readonly reason?: string;
    readonly required_action?: string;
    readonly owner?: string;
  };
}

const AUFGABEN = manifest.tasks as unknown as readonly Aufgabe[];
const ERLEDIGT = AUFGABEN.filter((aufgabe) => aufgabe.status === 'done');
const BLOCKIERT = AUFGABEN.filter((aufgabe) => aufgabe.status === 'blocked');

describe('Jede erledigte Aufgabe trägt einen Nachweis', () => {
  it('hat mindestens einen Eintrag mit Beschreibung, Fundstelle und Datum', () => {
    const unvollstaendig = ERLEDIGT.filter((aufgabe) => {
      const letzter = aufgabe.evidence?.at(-1);
      return (
        letzter === undefined ||
        (letzter.description ?? '').length < 40 ||
        (letzter.reference ?? '').length === 0 ||
        (letzter.verified_at ?? '').length === 0
      );
    }).map((aufgabe) => aufgabe.id);
    expect(unvollstaendig).toEqual([]);
  });
});

describe('Jede blockierte Aufgabe nennt Ursache, Handlung und Zuständigkeit', () => {
  it('lässt keinen der drei Punkte offen', () => {
    const unvollstaendig = BLOCKIERT.filter((aufgabe) => {
      const blocker = aufgabe.blocker;
      return (
        blocker === undefined ||
        (blocker.reason ?? '').length < 40 ||
        (blocker.required_action ?? '').length < 40 ||
        (blocker.owner ?? '').length === 0
      );
    }).map((aufgabe) => aufgabe.id);
    expect(unvollstaendig).toEqual([]);
  });

  it('steht mit derselben Aufgabennummer im Blockerregister', () => {
    const register = readFileSync('docs/BLOCKERS.md', 'utf8');
    for (const aufgabe of BLOCKIERT) {
      expect(register, aufgabe.id).toContain(aufgabe.id);
    }
  });
});

describe('Der Status behauptet nicht mehr, als er kann', () => {
  const status = readFileSync('docs/STATUS.md', 'utf8');
  const handoff = readFileSync('docs/HANDOFF.md', 'utf8');

  it('nennt dieselbe Zahl erledigter Aufgaben wie das Manifest', () => {
    const treffer = /(\d+) von (\d+) Aufgaben/.exec(handoff);
    expect(treffer, 'Der Handoff nennt keine Aufgabenzahl.').not.toBeNull();
    expect(Number(treffer?.[1])).toBe(ERLEDIGT.length);
    expect(Number(treffer?.[2])).toBe(AUFGABEN.length);
  });

  it('sagt nirgends „fertig“ oder „100 %“, solange Freigaben fehlen', () => {
    expect(BLOCKIERT.length).toBeGreaterThan(0);
    for (const [name, text] of [
      ['STATUS.md', status],
      ['HANDOFF.md', handoff],
    ] as const) {
      expect(text, name).not.toMatch(/100\s*%/);
      expect(text, name).not.toMatch(/\bvollständig fertig\b/i);
      expect(text, name).not.toMatch(/\bproduktionsreif\b/i);
      expect(text, name).not.toMatch(/\bstartbereit\b/i);
    }
  });

  it('nennt die Zahl der blockierten Aufgaben in derselben Zeile', () => {
    // Nicht `toContain`: „M08-06 blockiert“ enthält zufällig „6 blockiert“
    // und ließe die Prüfung ins Leere laufen.
    const treffer = /\((\d+) von (\d+) Aufgaben, (\d+) blockiert\)/.exec(handoff);
    expect(
      treffer,
      'Der Handoff nennt keine Zusammenfassung „x von y Aufgaben, z blockiert“.',
    ).not.toBeNull();
    expect(Number(treffer?.[3])).toBe(BLOCKIERT.length);
  });
});
