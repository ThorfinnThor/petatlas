/**
 * M01-04 — Secret-Audit über versionierte Dateien und den Buildoutput.
 *
 * Der Prüfer sucht nach tatsächlichen Geheimniswerten, nicht nach dem bloßen
 * Vorkommen eines Secret-Namens: Dokumentation darf `AWIN_FEED_URL` nennen,
 * aber niemals einen Wert dazu enthalten.
 *
 * Geprüft werden zwei Flächen:
 *   1. `git ls-files` — alles, was im öffentlichen Repository landet.
 *   2. `dist/` — alles, was ausgeliefert wird. `.gitignore` schützt hier nichts:
 *      HTML und JSON im Browser sind öffentlich.
 *
 * Ausführen: `npm run check:security` oder
 *            `node scripts/checks/secrets.ts [--dist-only|--repo-only]`
 * Exit 0 = kein Fund, Exit 1 = Fund, Exit 2 = Aufrufproblem.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { extname, join, relative, sep } from 'node:path';

export interface SecretRule {
  readonly id: string;
  readonly description: string;
  readonly pattern: RegExp;
}

export interface Finding {
  readonly file: string;
  readonly line: number;
  readonly ruleId: string;
  readonly description: string;
  /** Gekürzter, maskierter Ausschnitt. Ein echter Fund darf nicht im Bericht stehen. */
  readonly excerpt: string;
}

/**
 * Muster für Werte, nicht für Namen. Jedes Muster verlangt einen konkreten
 * Geheimniswert; ein leeres `NAME=` bleibt erlaubt.
 */
export const SECRET_RULES: readonly SecretRule[] = [
  {
    id: 'github-token',
    description: 'GitHub-Token (gho_, ghp_, ghs_, ghu_, ghr_, github_pat_)',
    pattern: /\b(?:gh[opsur]_[A-Za-z0-9]{16,}|github_pat_[A-Za-z0-9_]{20,})\b/,
  },
  {
    id: 'aws-access-key',
    description: 'AWS Access Key ID',
    pattern: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,
  },
  {
    id: 'private-key-block',
    description: 'Privater Schlüsselblock',
    pattern: /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/,
  },
  {
    id: 'slack-token',
    description: 'Slack-Token',
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/,
  },
  {
    id: 'generic-api-key',
    description: 'Vendor-API-Schlüssel im Format sk-/rk-/pk_live_',
    pattern: /\b(?:sk|rk)-[A-Za-z0-9]{24,}\b|\bpk_live_[A-Za-z0-9]{16,}\b/,
  },
  {
    id: 'cloudflare-build-hook',
    description: 'Cloudflare-Build-Hook-URL (die vollständige URL ist das Geheimnis)',
    pattern:
      /https:\/\/api\.cloudflare\.com\/client\/v4\/pages\/webhooks\/deploy_hooks\/[A-Za-z0-9-]+/,
  },
  {
    id: 'assigned-secret-value',
    description: 'Zuweisung eines Werts an einen bekannten Secret-Namen',
    // Nur mit Wert: leere Zuweisungen in .env.example bleiben zulässig.
    pattern:
      /\b(?:AWIN_FEED_URL|CLOUDFLARE_BUILD_HOOK|GITHUB_TOKEN|NPM_TOKEN|CLOUDFLARE_API_TOKEN)\s*[:=]\s*(?!["']?\s*$)["']?[^\s"',}]{8,}/,
  },
  {
    id: 'public-prefixed-secret',
    description: 'Secret-Name mit PUBLIC_-Präfix; PUBLIC_ landet im Browsercode',
    pattern: /\bPUBLIC_[A-Z0-9_]*(?:TOKEN|SECRET|KEY|HOOK|PASSWORD)\b/,
  },
];

/** Der Prüfer selbst und seine Tests enthalten die Muster absichtlich. */
const SELF_REFERENTIAL = new Set(['scripts/checks/secrets.ts', 'tests/secrets-check.test.ts']);

const BINARY_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico',
  '.pdf',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.eot',
  '.zip',
  '.gz',
  '.br',
  '.pbf',
  '.mp4',
  '.webm',
  '.pyc',
]);

const MAX_BYTES = 8 * 1024 * 1024;

function mask(line: string, match: string): string {
  const kept = match.slice(0, 4);
  const masked = `${kept}${'*'.repeat(Math.max(0, Math.min(match.length - 4, 12)))}`;
  return line.replace(match, masked).trim().slice(0, 160);
}

export function scanContent(file: string, content: string): Finding[] {
  const findings: Finding[] = [];
  const lines = content.split('\n');
  for (const [index, line] of lines.entries()) {
    for (const rule of SECRET_RULES) {
      const match = rule.pattern.exec(line);
      if (match) {
        findings.push({
          file,
          line: index + 1,
          ruleId: rule.id,
          description: rule.description,
          excerpt: mask(line, match[0]),
        });
      }
    }
  }
  return findings;
}

function isScannable(path: string): boolean {
  if (BINARY_EXTENSIONS.has(extname(path).toLowerCase())) return false;
  try {
    return statSync(path).size <= MAX_BYTES;
  } catch {
    return false;
  }
}

/**
 * Alles, was im öffentlichen Repository landen **wird** — nicht nur, was
 * schon versioniert ist.
 *
 * `git ls-files` allein wäre zu spät: eine neu angelegte Datei ist noch nicht
 * versioniert, und der Prüflauf vor dem Commit sähe sie nicht. Genau das ist
 * am 2026-09-08 passiert; die lokale Kette war grün, der Prüfstand nach dem
 * Commit rot. `--others --exclude-standard` nimmt deshalb die noch nicht
 * versionierten, aber auch nicht ignorierten Dateien dazu.
 */
export function trackedFiles(cwd: string): string[] {
  const out = execFileSync(
    'git',
    ['ls-files', '-z', '--cached', '--others', '--exclude-standard'],
    {
      cwd,
      encoding: 'utf8',
    },
  );
  return [...new Set(out.split('\0').filter(Boolean))];
}

async function distFiles(root: string): Promise<string[]> {
  const dist = join(root, 'dist');
  try {
    const entries = await readdir(dist, { recursive: true, withFileTypes: true });
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => relative(root, join(entry.parentPath, entry.name)));
  } catch {
    return [];
  }
}

export function scanFiles(root: string, files: readonly string[]): Finding[] {
  const findings: Finding[] = [];
  for (const file of files) {
    const normalized = file.split(sep).join('/');
    if (SELF_REFERENTIAL.has(normalized)) continue;
    const absolute = join(root, file);
    if (!isScannable(absolute)) continue;
    findings.push(...scanContent(normalized, readFileSync(absolute, 'utf8')));
  }
  return findings;
}

/**
 * Fixtures müssen sich selbst als synthetisch ausweisen (ADR-013). Ein
 * unbeschrifteter Datensatz kann später versehentlich für echte Daten gehalten
 * und veröffentlicht werden.
 */
export const FIXTURE_MARKERS = [
  'SYNTHETISCH',
  'SYNTHETIC',
  '"synthetic": true',
  "'synthetic': true",
];

export function unlabeledFixtures(root: string, files: readonly string[]): string[] {
  const unlabeled: string[] = [];
  for (const file of files) {
    const normalized = file.split(sep).join('/');
    if (!normalized.startsWith('fixtures/')) continue;
    const absolute = join(root, file);
    if (!isScannable(absolute)) continue;
    const content = readFileSync(absolute, 'utf8').toUpperCase();
    if (!FIXTURE_MARKERS.some((marker) => content.includes(marker.toUpperCase()))) {
      unlabeled.push(normalized);
    }
  }
  return unlabeled;
}

async function main(): Promise<number> {
  const root = process.cwd();
  const args = new Set(process.argv.slice(2));
  const scanRepo = !args.has('--dist-only');
  const scanDist = !args.has('--repo-only');

  const targets: string[] = [];
  if (scanRepo) targets.push(...trackedFiles(root));
  const dist = scanDist ? await distFiles(root) : [];
  targets.push(...dist);

  if (scanDist && dist.length === 0) {
    console.warn('Hinweis: dist/ ist leer oder fehlt. Für den Auslieferungs-Audit zuerst bauen.');
  }

  const findings = scanFiles(root, targets);
  const unlabeled = unlabeledFixtures(root, targets);

  if (unlabeled.length > 0) {
    console.error(`Fixture-Audit: ${unlabeled.length} Datei(en) ohne Synthetik-Kennzeichnung.`);
    for (const file of unlabeled) {
      console.error(`  ${file} — erwartet einen der Marker: ${FIXTURE_MARKERS.join(', ')}`);
    }
  }

  if (findings.length === 0) {
    if (unlabeled.length > 0) return 1;
    console.log(
      `Secret-Audit: ${targets.length} Dateien geprüft, kein Fund. Fixtures gekennzeichnet.`,
    );
    return 0;
  }

  console.error(`Secret-Audit: ${findings.length} Fund(e).`);
  for (const finding of findings) {
    console.error(`  ${finding.file}:${finding.line}  [${finding.ruleId}] ${finding.description}`);
    console.error(`    ${finding.excerpt}`);
  }
  console.error('\nEin gefundenes Geheimnis gilt als offengelegt. Rotieren, nicht nur löschen.');
  return 1;
}

if (import.meta.filename === process.argv[1]) {
  main()
    .then((code) => process.exit(code))
    .catch((error: unknown) => {
      console.error('Secret-Audit fehlgeschlagen:', error);
      process.exit(2);
    });
}
