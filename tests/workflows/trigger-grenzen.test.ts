// M17-03 — Die Abnahme verlangt: kein Fehlschlag des Hooks bleibt unbemerkt,
// und es entstehen keine minütlichen Vollbuilds oder Buildschleifen. Der
// zweite Teil ist keine Frage der Laufzeit, sondern der Trigger. Deshalb wird
// er hier an den Workflowdateien geprüft.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

/** Läufe, die einen Build anstoßen oder Daten schreiben können. */
const SCHREIBENDE_WORKFLOWS = [
  '.github/workflows/rebuild-commerce.yml',
  '.github/workflows/source-check.yml',
  '.github/workflows/ingest-open.yml',
  '.github/workflows/smoke.yml',
].map((pfad) => ({ pfad, inhalt: readFileSync(pfad, 'utf8') }));

/** Der `on:`-Block bis zur nächsten Angabe auf oberster Ebene. */
function triggerBlock(inhalt: string): string {
  const start = inhalt.search(/^on:$/m);
  if (start < 0) return '';
  const rest = inhalt.slice(start + 3);
  const ende = rest.search(/^[a-z]/m);
  return ende < 0 ? rest : rest.slice(0, ende);
}

describe('Kein Lauf kann sich selbst oder einen Deploy nachziehen', () => {
  it('reagiert nicht auf push', () => {
    for (const { pfad, inhalt } of SCHREIBENDE_WORKFLOWS) {
      expect(triggerBlock(inhalt), pfad).not.toMatch(/^\s{2}push:/m);
    }
  });

  it('reagiert nicht auf einen anderen Workflow', () => {
    for (const { pfad, inhalt } of SCHREIBENDE_WORKFLOWS) {
      expect(triggerBlock(inhalt), pfad).not.toMatch(/^\s{2}workflow_run:/m);
    }
  });

  it('reagiert nicht auf Pull Requests', () => {
    for (const { pfad, inhalt } of SCHREIBENDE_WORKFLOWS) {
      expect(triggerBlock(inhalt), pfad).not.toMatch(/^\s{2}pull_request(_target)?:/m);
    }
  });

  it('läuft höchstens täglich, nie minütlich oder stündlich', () => {
    for (const { pfad, inhalt } of SCHREIBENDE_WORKFLOWS) {
      const plaene = [...inhalt.matchAll(/cron:\s*'([^']+)'/g)].map((treffer) => treffer[1] ?? '');
      expect(plaene.length, pfad).toBeGreaterThan(0);
      for (const plan of plaene) {
        const [minute, stunde] = plan.split(/\s+/);
        // Ein `*` an einer der beiden ersten Stellen hieße: jede Minute oder
        // jede Stunde. Beides ist hier ein Fehler, kein Geschmacksfrage.
        expect(minute, `${pfad}: ${plan}`).not.toBe('*');
        expect(stunde, `${pfad}: ${plan}`).not.toBe('*');
        expect(minute, `${pfad}: ${plan}`).toMatch(/^\d{1,2}$/);
        expect(stunde, `${pfad}: ${plan}`).toMatch(/^\d{1,2}$/);
      }
    }
  });

  it('lässt jeweils nur einen Lauf gleichzeitig zu', () => {
    for (const { pfad, inhalt } of SCHREIBENDE_WORKFLOWS) {
      expect(inhalt, pfad).toMatch(/^concurrency:/m);
      expect(inhalt, pfad).toContain('cancel-in-progress: false');
    }
  });
});

describe('Der Hook bleibt an die Partnerentscheidung gebunden', () => {
  const rebuild = readFileSync('.github/workflows/rebuild-commerce.yml', 'utf8');

  it('ruft den Hook nur, wenn ein Partner zugelassen ist', () => {
    const hookSchritt = rebuild.slice(rebuild.indexOf('name: Build anstoßen'));
    expect(hookSchritt).toContain("steps.partner.outputs.noetig == 'true'");
  });

  it('baut den Katalog nur, wenn ein Partner zugelassen ist', () => {
    const bauSchritt = rebuild.slice(rebuild.indexOf('name: Katalog bauen'));
    expect(bauSchritt.slice(0, 200)).toContain("steps.partner.outputs.noetig == 'true'");
  });

  it('nimmt das Secret nur an dieser einen Stelle entgegen', () => {
    const treffer = [...rebuild.matchAll(/secrets\.CLOUDFLARE_DEPLOY_HOOK/g)];
    expect(treffer.length).toBe(1);
  });
});

describe('Die Beobachtung schreibt nichts zurück', () => {
  const beobachtung = readFileSync('.github/workflows/source-check.yml', 'utf8');

  it('kann auf Zuruf laufen, ohne eine Meldung zu öffnen', () => {
    const meldeSchritt = beobachtung.slice(beobachtung.indexOf('name: Befunde melden'));
    expect(meldeSchritt.slice(0, 200)).toContain('inputs.trockenlauf != true');
  });

  it('committet und pusht nicht', () => {
    expect(beobachtung).not.toMatch(/git (commit|push)/);
  });

  it('hält den Checkout ohne Anmeldedaten', () => {
    expect(beobachtung).toContain('persist-credentials: false');
  });

  it('bekommt keine Schreibrechte am Inhalt', () => {
    expect(beobachtung).not.toContain('contents: write');
  });
});

describe('Die Rauchprobe meldet, statt zu schweigen', () => {
  const smoke = readFileSync('.github/workflows/smoke.yml', 'utf8');

  it('öffnet nur bei einem Fehlschlag eine Meldung', () => {
    const melden = smoke.slice(smoke.indexOf('name: Alarm melden'));
    expect(melden.slice(0, 200)).toContain('failure()');
  });

  it('nutzt einen stabilen Titel, statt täglich ein neues Issue zu öffnen', () => {
    expect(smoke).toContain('gh issue list --state open');
  });

  it('sagt es, wenn keine ausgelieferte Adresse geprüft wurde', () => {
    expect(smoke).toContain('Keine Adresse in vars.SMOKE_BASE_URL');
  });

  it('nimmt die Adresse aus einer Variablen, nicht aus einem Secret', () => {
    expect(smoke).toContain('vars.SMOKE_BASE_URL');
    expect(smoke).not.toContain('secrets.SMOKE_BASE_URL');
  });

  it('schreibt nichts ins Repository', () => {
    expect(smoke).not.toMatch(/git (commit|push)/);
    expect(smoke).not.toContain('contents: write');
  });
});
