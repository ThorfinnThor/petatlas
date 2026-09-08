// M18-02 — Was diese Prüfung nicht findet, geht raus. Deshalb steht hier
// jeder Negativfall einzeln: eine Prüfung, die man nur im guten Fall testet,
// ist keine.
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  ERLAUBTE_BILDER,
  PRIVATE_FELDER,
  erlaubteSubressourcenHosts,
  pruefeDateityp,
  pruefeHeader,
  pruefeHtml,
  pruefeJson,
  pruefeVerzeichnis,
} from '../../scripts/checks/dist.ts';

const HOSTS = erlaubteSubressourcenHosts();

describe('Dateitypen', () => {
  it('lässt zulässige Typen durch', () => {
    for (const datei of ['de-de/index.html', 'data/v1/x.json', 'suche.js', '_headers']) {
      expect(pruefeDateityp(datei)).toEqual([]);
    }
  });

  it('findet Quelldateien im Output', () => {
    expect(pruefeDateityp('src/lib/routes.ts')[0]?.problem).toContain('Quelldatei');
    expect(pruefeDateityp('seite.astro')[0]?.problem).toContain('Quelldatei');
    expect(pruefeDateityp('bundle.js.map')[0]?.problem).toContain('Quelldatei');
  });

  it('findet Schlüsselmaterial', () => {
    expect(pruefeDateityp('geheim.pem')).not.toEqual([]);
    expect(pruefeDateityp('.env')).not.toEqual([]);
  });

  it('findet Rohdaten, die nie ausgeliefert werden sollen', () => {
    expect(pruefeDateityp('daten/berlin.osm.pbf')).not.toEqual([]);
    expect(pruefeDateityp('got.xml.zip')).not.toEqual([]);
  });

  it('findet ein Bild ohne Eintrag in der Allowlist', () => {
    expect(pruefeDateityp('bilder/praxis.jpg')[0]?.problem).toContain('Bilder-Allowlist');
    expect(pruefeDateityp('_astro/irgendwas.abc123.png')).not.toEqual([]);
  });

  it('lässt die erklärten Leaflet-Bilder durch', () => {
    expect(pruefeDateityp('_astro/marker-icon.hN30_KVU.png')).toEqual([]);
    expect(pruefeDateityp('_astro/layers-2x.Bpkbi35X.png')).toEqual([]);
  });

  it('nennt für jedes erlaubte Bild einen Grund', () => {
    for (const eintrag of ERLAUBTE_BILDER) {
      expect(eintrag.grund.length).toBeGreaterThan(15);
    }
  });

  it('findet einen unbekannten Dateityp, statt ihn durchzulassen', () => {
    expect(pruefeDateityp('daten.sqlite')[0]?.problem).toContain('Allowlist');
  });
});

describe('HTML', () => {
  const sauber =
    '<!doctype html><html><head><script type="module" src="/suche.js"></script></head>' +
    '<body><a href="https://www.openstreetmap.org/">OSM</a></body></html>';

  it('beanstandet sauberes Markup nicht', () => {
    expect(pruefeHtml('a.html', sauber, HOSTS)).toEqual([]);
  });

  it('findet ein Inline-Skript', () => {
    const html = '<html><body><script>alert(1)</script></body></html>';
    expect(pruefeHtml('a.html', html, HOSTS)[0]?.problem).toContain('Inline-Skript');
  });

  it('hält strukturierte Daten nicht für ausführbaren Code', () => {
    const html =
      '<html><body><script type="application/ld+json">{"@type":"WebSite"}</script></body></html>';
    expect(pruefeHtml('a.html', html, HOSTS)).toEqual([]);
  });

  it('findet ein Event-Attribut', () => {
    const html = '<html><body><button onclick="los()">Los</button></body></html>';
    expect(pruefeHtml('a.html', html, HOSTS)[0]?.problem).toContain('Event-Attribut');
  });

  it('findet eine javascript:-Adresse', () => {
    const html = '<html><body><a href="javascript:alert(1)">x</a></body></html>';
    expect(pruefeHtml('a.html', html, HOSTS)[0]?.problem).toContain('javascript:');
  });

  it('findet srcdoc', () => {
    const html = '<html><body><iframe srcdoc="<b>x</b>"></iframe></body></html>';
    expect(pruefeHtml('a.html', html, HOSTS).some((f) => f.problem.includes('srcdoc'))).toBe(true);
  });

  it('findet eine Unterressource von einem fremden Host', () => {
    const html =
      '<html><head><script src="https://cdn.beispiel.invalid/x.js"></script></head></html>';
    expect(pruefeHtml('a.html', html, HOSTS)[0]?.problem).toContain('cdn.beispiel.invalid');
  });

  it('lässt eine Unterressource von einem erklärten Host durch', () => {
    const html = `<html><body><img src="https://${HOSTS[0]}/1/2/3.png"></body></html>`;
    expect(pruefeHtml('a.html', html, HOSTS)).toEqual([]);
  });

  it('findet einen unverschlüsselten Link', () => {
    const html = '<html><body><a href="http://beispiel.invalid/">x</a></body></html>';
    expect(pruefeHtml('a.html', html, HOSTS)[0]?.problem).toContain('Unverschlüsselter Link');
  });

  it('lässt einen gewöhnlichen Link auf eine fremde Seite zu', () => {
    const html = '<html><body><a href="https://fremde.invalid/">x</a></body></html>';
    expect(pruefeHtml('a.html', html, HOSTS)).toEqual([]);
  });
});

describe('Öffentliche JSON-Dateien', () => {
  it('beanstandet saubere Daten nicht', () => {
    expect(pruefeJson('data/v1/x.json', '{"name":"Praxis","phone":"030 1"}')).toEqual([]);
  });

  it('findet private Felder, egal wie tief sie liegen', () => {
    const inhalt = JSON.stringify({ a: [{ b: { token: 'x' } }] });
    expect(pruefeJson('data/v1/x.json', inhalt)[0]?.problem).toContain('token');
  });

  it('findet Felder mit Unterstrich am Anfang', () => {
    expect(pruefeJson('data/v1/x.json', '{"_intern":1}')[0]?.problem).toContain('_intern');
  });

  it('findet jede aufgeführte Bezeichnung', () => {
    for (const feld of PRIVATE_FELDER) {
      const inhalt = JSON.stringify({ [feld]: 'x' });
      expect(pruefeJson('data/v1/x.json', inhalt).length, feld).toBe(1);
    }
  });

  it('meldet unlesbares JSON', () => {
    expect(pruefeJson('data/v1/x.json', '<html>')[0]?.problem).toContain('lesbares JSON');
  });
});

describe('Header', () => {
  const gut =
    "Content-Security-Policy: default-src 'self'; script-src 'self'; frame-ancestors 'none'; object-src 'none'\nX-Content-Type-Options: nosniff\n";

  it('nimmt vollständige Header an', () => {
    expect(pruefeHeader(gut)).toEqual([]);
  });

  it('meldet fehlende Header', () => {
    expect(pruefeHeader(null)[0]?.problem).toContain('Fehlt');
  });

  it('meldet eine aufgeweichte CSP', () => {
    const weich = gut.replace("script-src 'self'", "script-src 'self' 'unsafe-inline'");
    expect(pruefeHeader(weich).some((f) => f.problem.includes('unsafe-inline'))).toBe(true);
  });

  it('meldet eine fehlende Direktive', () => {
    const ohne = gut.replace("; object-src 'none'", '');
    expect(pruefeHeader(ohne).some((f) => f.problem.includes('object-src'))).toBe(true);
  });
});

describe('Ganzes Verzeichnis', () => {
  it('findet eine untergeschobene Datei zwischen lauter sauberen', () => {
    const wurzel = mkdtempSync(join(tmpdir(), 'dist-'));
    mkdirSync(join(wurzel, 'de-de'), { recursive: true });
    writeFileSync(join(wurzel, 'de-de', 'index.html'), '<html><body>ok</body></html>');
    writeFileSync(
      join(wurzel, '_headers'),
      "Content-Security-Policy: default-src 'self'; script-src 'self'; frame-ancestors 'none'; object-src 'none'\nX-Content-Type-Options: nosniff\n",
    );
    writeFileSync(join(wurzel, 'vergessen.ts'), 'export const x = 1;');

    const funde = pruefeVerzeichnis(wurzel);
    expect(funde.length).toBe(1);
    expect(funde[0]?.datei).toBe('vergessen.ts');
  });
});
