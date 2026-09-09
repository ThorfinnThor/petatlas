// Ein toter interner Verweis führt auf eine 404-Seite, und der Leser hält das
// für das Ende des Angebots. Deshalb steht hier jeder Negativfall einzeln:
// eine Prüfung, die man nur im guten Fall testet, ist keine.
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { interneZiele, loeseAuf, pruefeVerzeichnis } from '../../scripts/checks/links.ts';

function baue(dateien: Readonly<Record<string, string>>): string {
  const wurzel = mkdtempSync(join(tmpdir(), 'links-'));
  for (const [pfad, inhalt] of Object.entries(dateien)) {
    const voll = join(wurzel, ...pfad.split('/'));
    mkdirSync(join(voll, '..'), { recursive: true });
    writeFileSync(voll, inhalt);
  }
  return wurzel;
}

describe('interneZiele', () => {
  it('nimmt Verweise auf die eigene Auslieferung', () => {
    expect(interneZiele('<a href="/de-de/">x</a><img src="/bild.png">')).toEqual([
      '/de-de/',
      '/bild.png',
    ]);
  });

  it('lässt fremde Adressen, Anker und Sonderschemata liegen', () => {
    const html = [
      '<a href="https://example.invalid/">x</a>',
      '<a href="//example.invalid/">x</a>',
      '<a href="#inhalt">x</a>',
      '<a href="mailto:a@b.invalid">x</a>',
      '<a href="tel:+490">x</a>',
    ].join('');
    expect(interneZiele(html)).toEqual([]);
  });
});

describe('loeseAuf', () => {
  const wurzel = baue({
    'index.html': '<p>x</p>',
    'de-de/index.html': '<p>x</p>',
    'data/v1/manifest.json': '{}',
  });

  it('löst ein Verzeichnis auf seine index.html auf', () => {
    expect(loeseAuf(wurzel, '/de-de/')).toBe('de-de/index.html');
  });

  it('löst eine Datei direkt auf', () => {
    expect(loeseAuf(wurzel, '/data/v1/manifest.json')).toBe('data/v1/manifest.json');
  });

  it('ignoriert Anker und Abfrageteil', () => {
    expect(loeseAuf(wurzel, '/de-de/#inhalt')).toBe('de-de/index.html');
    expect(loeseAuf(wurzel, '/de-de/?a=1')).toBe('de-de/index.html');
  });

  it('ergänzt keinen fehlenden Schrägstrich', () => {
    // Die Auslieferung leitet um. Ein Verweis, der erst über eine Umleitung
    // ankommt, ist einer zu viel — und soll auffallen.
    expect(loeseAuf(wurzel, '/de-de')).toBeNull();
  });

  it('meldet ein fehlendes Ziel', () => {
    expect(loeseAuf(wurzel, '/gibt-es-nicht/')).toBeNull();
  });
});

describe('pruefeVerzeichnis', () => {
  it('findet den toten Verweis und nur ihn', () => {
    const wurzel = baue({
      'index.html': '<a href="/de-de/">gut</a><a href="/weg/">tot</a>',
      'de-de/index.html': '<a href="https://example.invalid/">fremd</a>',
    });
    const funde = pruefeVerzeichnis(wurzel);
    expect(funde).toHaveLength(1);
    expect(funde[0]?.ziel).toBe('/weg/');
    expect(funde[0]?.datei).toBe('index.html');
  });

  it('meldet denselben Verweis je Seite nur einmal', () => {
    const wurzel = baue({ 'index.html': '<a href="/weg/">a</a><a href="/weg/">b</a>' });
    expect(pruefeVerzeichnis(wurzel)).toHaveLength(1);
  });

  it('schweigt, wenn alles auflösbar ist', () => {
    const wurzel = baue({
      'index.html': '<a href="/de-de/">x</a>',
      'de-de/index.html': '<a href="/">zurück</a>',
    });
    expect(pruefeVerzeichnis(wurzel)).toEqual([]);
  });
});
