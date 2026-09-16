// M07-03 — Assets-only: kein Worker, keine Bindings, klare Header.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { buildHeadersFile } from '../scripts/build-headers.ts';
import { fressnapfBildUrspruenge } from '../src/features/commerce/fressnapf-feed.ts';
import { TILES } from '../src/features/map/tiles.ts';

/**
 * `wrangler.jsonc` ist JSONC: Zeilenkommentare und abschließende Kommas sind
 * erlaubt, `JSON.parse` versteht beides nicht. Beides wird hier entfernt.
 */
function leseWranglerConfig(): Record<string, unknown> {
  const roh = readFileSync(new URL('../wrangler.jsonc', import.meta.url), 'utf8');
  const ohneKommentare = roh
    .split('\n')
    .map((zeile) => (zeile.trim().startsWith('//') ? '' : zeile))
    .join('\n')
    // Abschließendes Komma vor } oder ] entfernen.
    .replace(/,(\s*[}\]])/g, '$1');
  return JSON.parse(ohneKommentare) as Record<string, unknown>;
}

const CONFIG = leseWranglerConfig();

describe('Kein Worker, keine Datenbank', () => {
  it('hat kein Worker-Script', () => {
    expect(CONFIG).not.toHaveProperty('main');
    expect(CONFIG).not.toHaveProperty('run_worker_first');
  });

  it.each([
    'd1_databases',
    'kv_namespaces',
    'r2_buckets',
    'durable_objects',
    'queues',
    'hyperdrive',
    'vectorize',
    'ai',
  ])('hat keine Bindung %s', (schluessel) => {
    expect(CONFIG).not.toHaveProperty(schluessel);
  });

  it('liefert das gebaute Verzeichnis aus', () => {
    expect(CONFIG.assets).toMatchObject({ directory: './dist' });
  });

  it('passt zum Astro-Routing', () => {
    expect(CONFIG.assets).toMatchObject({
      html_handling: 'force-trailing-slash',
      not_found_handling: '404-page',
    });
  });

  it('schaltet workers.dev aus', () => {
    expect(CONFIG.workers_dev).toBe(false);
  });
});

describe('Header', () => {
  const headers = buildHeadersFile();

  it('setzt eine Content Security Policy nur mit freigegebenen Bildursprüngen', () => {
    expect(headers).toContain("default-src 'self'");
    expect(headers).toContain("script-src 'self' 'wasm-unsafe-eval'");
    expect(headers).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(headers).not.toMatch(/script-src[^;]*'unsafe-eval'/);
    const csp = headers.split('\n').find((line) => line.includes('Content-Security-Policy:')) ?? '';
    const origins = csp.match(/https:\/\/[^\s;]+/g) ?? [];
    expect(origins.sort()).toEqual([...TILES.hosts, ...fressnapfBildUrspruenge()].sort());
  });

  it('verbietet Einbettung und Formularversand nach außen', () => {
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain("form-action 'self'");
    expect(headers).toContain('X-Frame-Options: DENY');
  });

  it('schaltet nicht benötigte Browserfunktionen ab', () => {
    expect(headers).toContain('geolocation=(self)');
    expect(headers).toContain('camera=()');
  });

  it('lässt Dateien mit Inhalts-Hash lange cachen, das Manifest aber nicht', () => {
    expect(headers).toContain('/data/v1/fees/*');
    expect(headers).toContain('/data/v1/places/*');
    expect(headers).toContain('max-age=31536000, immutable');
    expect(headers).toContain('/data/v1/manifest.json');
    expect(headers).toContain('max-age=0, must-revalidate');
  });

  it('lässt den Gesundheitsstand nicht altern', () => {
    // Eine Datei, die das Alter der Daten nennt, darf nicht selbst tagelang
    // aus einem Cache kommen.
    const block = headers.slice(headers.indexOf('/data/v1/health.json'));
    expect(block).toContain('max-age=0, must-revalidate');
  });

  it('nennt sich als erzeugt, damit niemand von Hand hineinschreibt', () => {
    expect(headers.split('\n')[0]).toMatch(/Erzeugt von/);
  });
});
