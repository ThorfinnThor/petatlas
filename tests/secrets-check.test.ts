// M01-04 — Canary-Tests für den Secret-Audit. Die hier verwendeten Werte sind
// erfundene Testmuster, keine echten Zugangsdaten.
import { describe, expect, it } from 'vitest';

import { SECRET_RULES, scanContent } from '../scripts/checks/secrets.ts';

const CANARY_GITHUB = 'gho_CANARYcanary0123456789abcdefghijkl';
const CANARY_AWS = 'AKIACANARY0123456789';
const CANARY_HOOK =
  'https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/canary-0000-1111';

describe('Secret-Audit erkennt Canary-Werte', () => {
  it('findet ein GitHub-Token', () => {
    const findings = scanContent('fixture.txt', `token = "${CANARY_GITHUB}"`);
    expect(findings.map((f) => f.ruleId)).toContain('github-token');
  });

  it('findet einen AWS Access Key', () => {
    expect(scanContent('fixture.txt', CANARY_AWS)).toHaveLength(1);
  });

  it('findet eine Cloudflare-Build-Hook-URL', () => {
    const findings = scanContent('workflow.yml', `curl -X POST ${CANARY_HOOK}`);
    expect(findings.map((f) => f.ruleId)).toContain('cloudflare-build-hook');
  });

  it('findet einen privaten Schlüsselblock', () => {
    const findings = scanContent('key.pem', '-----BEGIN RSA PRIVATE KEY-----');
    expect(findings.map((f) => f.ruleId)).toContain('private-key-block');
  });

  it('findet einen Wert hinter einem bekannten Secret-Namen', () => {
    const findings = scanContent('.env', 'AWIN_FEED_URL=https://feed.example/abcdef123456');
    expect(findings.map((f) => f.ruleId)).toContain('assigned-secret-value');
  });

  it('findet ein Secret mit PUBLIC_-Präfix, das im Browser landen würde', () => {
    const findings = scanContent('.env', 'PUBLIC_API_TOKEN=');
    expect(findings.map((f) => f.ruleId)).toContain('public-prefixed-secret');
  });
});

describe('Secret-Audit meldet zulässige Inhalte nicht', () => {
  it('erlaubt leere Zuweisungen in der Vorlage', () => {
    expect(scanContent('.env.example', 'AWIN_FEED_URL=')).toHaveLength(0);
    expect(scanContent('.env.example', 'CLOUDFLARE_BUILD_HOOK=')).toHaveLength(0);
  });

  it('erlaubt die bloße Nennung eines Secret-Namens in Dokumentation', () => {
    const doc = '`AWIN_FEED_URL`: nur Cloudflare-Build-Secret. Niemals Werte eintragen.';
    expect(scanContent('docs/EXTERNAL_SETUP.md', doc)).toHaveLength(0);
  });

  it('erlaubt die Platzhalterdomain', () => {
    expect(scanContent('.env.example', 'PUBLIC_SITE_URL=https://example.invalid')).toHaveLength(0);
  });
});

describe('Regelwerk', () => {
  it('hat eindeutige Regel-IDs', () => {
    const ids = SECRET_RULES.map((rule) => rule.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('meldet Fundstelle und Zeilennummer', () => {
    const findings = scanContent('a.txt', `harmlos\n${CANARY_GITHUB}\n`);
    expect(findings[0]?.line).toBe(2);
    expect(findings[0]?.file).toBe('a.txt');
  });

  it('maskiert den Fund im Bericht', () => {
    const findings = scanContent('a.txt', CANARY_GITHUB);
    expect(findings[0]?.excerpt).not.toContain(CANARY_GITHUB);
    expect(findings[0]?.excerpt).toContain('gho_');
  });
});

describe('Fixture-Kennzeichnung', () => {
  it('verlangt einen Synthetik-Marker in fixtures/', async () => {
    const { mkdtempSync, mkdirSync, writeFileSync } = await import('node:fs');
    const { tmpdir } = await import('node:os');
    const { join } = await import('node:path');
    const { unlabeledFixtures } = await import('../scripts/checks/secrets.ts');

    const root = mkdtempSync(join(tmpdir(), 'fixture-audit-'));
    mkdirSync(join(root, 'fixtures'));
    writeFileSync(join(root, 'fixtures', 'ohne.json'), '{"preis":1200}');
    writeFileSync(join(root, 'fixtures', 'mit.json'), '{"synthetic": true, "preis": 1200}');

    const result = unlabeledFixtures(root, ['fixtures/ohne.json', 'fixtures/mit.json']);
    expect(result).toEqual(['fixtures/ohne.json']);
  });
});
