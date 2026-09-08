// M07-03 — Assets-only: kein Worker, keine Bindings, klare Header.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { buildHeadersFile } from '../scripts/build-headers.ts';

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

  it('setzt eine Content Security Policy ohne fremde Herkunft', () => {
    expect(headers).toContain("default-src 'self'");
    expect(headers).toContain("script-src 'self'");
    expect(headers).not.toMatch(/script-src[^;]*unsafe-inline/);
    expect(headers).not.toMatch(/https?:\/\/(?!\S*openstreetmap)/);
  });

  it('verbietet Einbettung und Formularversand nach außen', () => {
    expect(headers).toContain("frame-ancestors 'none'");
    expect(headers).toContain("form-action 'none'");
    expect(headers).toContain('X-Frame-Options: DENY');
  });

  it('schaltet nicht benötigte Browserfunktionen ab', () => {
    expect(headers).toContain('geolocation=()');
    expect(headers).toContain('camera=()');
  });

  it('lässt Dateien mit Inhalts-Hash lange cachen, das Manifest aber nicht', () => {
    expect(headers).toContain('/data/v1/*');
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
