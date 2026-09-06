// M07-04/M07-05 — Der Build lässt sich nicht an seinen Prüfungen vorbei
// auslösen, und ein Preview- oder Fork-Build kommt an keine echten Secrets.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { BuildConfigError, resolveBuildConfig } from '../config/build.ts';
import { scanContent } from '../scripts/checks/secrets.ts';
import { allSources } from '../src/domain/source-registry.ts';

const REAL_SITE = { PUBLIC_SITE_URL: 'https://beispiel.example' };

function baue(env: Record<string, string>): { code: number; ausgabe: string } {
  try {
    const ausgabe = execFileSync('npm', ['run', 'build:cloudflare'], {
      encoding: 'utf8',
      env: { ...process.env, ...env },
      stdio: 'pipe',
    });
    return { code: 0, ausgabe };
  } catch (fehler) {
    const e = fehler as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, ausgabe: `${e.stdout ?? ''}${e.stderr ?? ''}` };
  }
}

describe('Das Deployment kann nicht vor den Prüfungen laufen', () => {
  it('bricht production ohne dokumentierte Launch-Freigabe ab', () => {
    const ergebnis = baue({ BUILD_MODE: 'production', ...REAL_SITE });
    expect(ergebnis.code).toBe(1);
    expect(ergebnis.ausgabe).toContain('publicRelease.approved=false');
  }, 120_000);

  it('bricht ab, wenn ein Nicht-Entwicklungsbuild Fixtures ausliefern würde', () => {
    const ergebnis = baue({ BUILD_MODE: 'preview', USE_FIXTURES: 'true' });
    expect(ergebnis.code).toBe(1);
    expect(ergebnis.ausgabe).toMatch(/synthetische Daten dürfen nicht ausgeliefert werden/);
  }, 120_000);

  it('bricht ab, wenn ein Feed-Secret gesetzt ist, ohne dass ein Vertrag freigegeben wäre', () => {
    const ergebnis = baue({ AWIN_FEED_URL: 'https://feed.example/geheim' });
    expect(ergebnis.code).toBe(1);
    expect(ergebnis.ausgabe).toMatch(/kein Partnervertrag freigegeben/);
    // Der Wert darf dabei nicht in der Ausgabe landen.
    expect(ergebnis.ausgabe).not.toContain('feed.example/geheim');
  }, 120_000);
});

describe('Build-Metadaten nennen die exakten Eingaben', () => {
  it('führt Commit, Node-Version, Modus und Quellstand', () => {
    const info = JSON.parse(readFileSync('dist/build-info.json', 'utf8')) as {
      gitCommit: string | null;
      nodeVersion: string;
      buildMode: string;
      sources: { sourceId: string; termsHash: string | null }[];
      steps: string[];
    };

    expect(info.gitCommit).toMatch(/^[0-9a-f]{40}$/);
    expect(info.nodeVersion).toMatch(/^v\d+\./);
    expect(info.buildMode).toBeTruthy();
    expect(info.sources.map((q) => q.sourceId).sort()).toEqual(
      allSources()
        .map((q) => q.sourceId)
        .sort(),
    );
    for (const quelle of info.sources) {
      expect(quelle.termsHash, quelle.sourceId).toMatch(/^[a-f0-9]{64}$/);
    }
    expect(info.steps).toContain('Secret- und Fixture-Audit über dist');
  });

  it('enthält keine Geheimnisse', () => {
    // Geprüft wird mit demselben Audit, der auch über dist läuft: gesucht
    // sind Werte, nicht Wörter. Ein Schrittname wie „Secret-Audit“ ist kein
    // Geheimnis.
    const roh = readFileSync('dist/build-info.json', 'utf8');
    expect(scanContent('dist/build-info.json', roh)).toEqual([]);
  });

  it('nennt keinen Secret-Namen mit Wert', () => {
    const roh = readFileSync('dist/build-info.json', 'utf8');
    expect(roh).not.toMatch(/AWIN_FEED_URL\s*[:=]\s*\S/);
    expect(roh).not.toMatch(/CLOUDFLARE_BUILD_HOOK\s*[:=]\s*\S/);
  });
});

describe('Preview und Produktion sind getrennt', () => {
  it('macht preview nicht indexierbar', () => {
    const preview = resolveBuildConfig({ BUILD_MODE: 'preview', ...REAL_SITE });
    expect(preview.indexable).toBe(false);
    expect(preview.affiliateEnabled).toBe(false);
  });

  it('hält Affiliate im Preview aus, unabhängig von den Gates', () => {
    expect(resolveBuildConfig({ BUILD_MODE: 'preview' }).affiliateEnabled).toBe(false);
  });

  it('fällt ohne gesetzten Modus auf development zurück, nicht auf production', () => {
    expect(resolveBuildConfig({}).mode).toBe('development');
    expect(resolveBuildConfig({}).indexable).toBe(false);
  });

  it('lässt sich production nicht durch eine fehlende Variable erschleichen', () => {
    // Weder ein fehlender Modus noch eine gesetzte Domain allein reichen.
    expect(resolveBuildConfig({ ...REAL_SITE }).mode).toBe('development');
    expect(() => resolveBuildConfig({ BUILD_MODE: 'production', ...REAL_SITE })).toThrow(
      BuildConfigError,
    );
  });
});

describe('Kein Workflow reicht Secrets an fremden Code weiter', () => {
  const workflows = ['.github/workflows/ci.yml', '.github/workflows/security.yml'].map((pfad) => ({
    pfad,
    inhalt: readFileSync(pfad, 'utf8'),
  }));

  it('verwendet keinen pull_request_target-Trigger', () => {
    for (const { pfad, inhalt } of workflows) {
      expect(inhalt, pfad).not.toMatch(/^\s{0,4}pull_request_target:/m);
    }
  });

  it('fordert kein Secret an', () => {
    for (const { pfad, inhalt } of workflows) {
      expect(inhalt, pfad).not.toMatch(/\$\{\{\s*secrets\./);
    }
  });

  it('setzt überall ausdrücklich Berechtigungen', () => {
    for (const { pfad, inhalt } of workflows) {
      expect(inhalt, pfad).toMatch(/^permissions:/m);
      expect(inhalt, pfad).toContain('contents: read');
    }
  });

  it('behält keine Anmeldedaten im Runner', () => {
    for (const { pfad, inhalt } of workflows) {
      const checkouts = inhalt.match(/uses: actions\/checkout@/g) ?? [];
      const ohneCredentials = inhalt.match(/persist-credentials: false/g) ?? [];
      expect(ohneCredentials.length, pfad).toBe(checkouts.length);
    }
  });
});
