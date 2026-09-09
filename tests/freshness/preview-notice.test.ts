// Der Vorschauhinweis stand monatelang falsch über echten Daten: „Keine
// echten Praxen, Preise oder Regeln" — über 49 echten Tierarztpraxen aus
// OpenStreetMap. Deshalb wird er nicht mehr getippt, sondern abgeleitet, und
// deshalb steht hier, was er über welchen Bestand sagen muss.
import { describe, expect, it } from 'vitest';

import { defaultMarket, withEnabledFeatures } from '../../src/domain/market.ts';
import { aufzaehlung, vorschauBestand } from '../../src/features/freshness/preview-notice.ts';

const ALLES = withEnabledFeatures(defaultMarket(), [
  'costs',
  'map',
  'travel',
  'commerce',
  'care',
  'toys',
  'food',
  'profile',
]);

describe('vorschauBestand', () => {
  it('nennt die echten Bestände mit Zahl, statt sie zu verschweigen', () => {
    const bestand = vorschauBestand(ALLES);
    const echt = bestand.echt.join(' | ');
    expect(echt).toMatch(/9\.381 Orte aus OpenStreetMap/);
    expect(echt).toMatch(/170 kommunal ausgewiesene Hundeflächen/);
  });

  it('behauptet über echte Daten nirgends, sie seien erfunden', () => {
    const bestand = vorschauBestand(ALLES);
    const alles = [...bestand.echt, ...bestand.ungeprueft].join(' ');
    for (const wort of ['erfunden', 'synthetisch', 'Platzhalter', 'Beispieldaten']) {
      expect(alles.toLowerCase(), wort).not.toContain(wort.toLowerCase());
    }
  });

  it('trennt echt-aber-ungeprüft von echt', () => {
    const bestand = vorschauBestand(ALLES);
    const ungeprueft = bestand.ungeprueft.join(' | ');
    // Die Gebührenpositionen sind echt; die Rechenannahmen sind nicht
    // abgenommen. Beides gehört gesagt, und zwar getrennt.
    expect(ungeprueft).toMatch(/1\.006 Positionen der amtlichen Gebührenordnung/);
    expect(ungeprueft).toMatch(/nicht abgenommen/);
    expect(bestand.echt.join(' ')).not.toMatch(/Gebührenordnung/);
  });

  it('nennt genau die erfundenen Bestände', () => {
    const bestand = vorschauBestand(ALLES);
    expect(bestand.synthetisch).toContain('Futterprodukte');
    expect(bestand.synthetisch).toContain('Produkteigenschaften für Pflege und Spielzeug');
    expect(bestand.synthetisch).toContain('Angebote mit Preisen');
  });

  it('sagt nichts über abgeschaltete Funktionen', () => {
    // Die versionierte Marktkonfiguration hat alle Flags aus. Dann gibt es
    // auch nichts zu erklären.
    const bestand = vorschauBestand(defaultMarket());
    expect(bestand.echt).toEqual([]);
    expect(bestand.ungeprueft).toEqual([]);
  });

  it('nennt nur die Karte, wenn nur die Karte an ist', () => {
    const nurKarte = withEnabledFeatures(defaultMarket(), ['map']);
    const bestand = vorschauBestand(nurKarte);
    expect(bestand.echt.join(' ')).toContain('OpenStreetMap');
    expect(bestand.ungeprueft).toEqual([]);
    expect(bestand.synthetisch).toEqual([]);
  });
});

describe('aufzaehlung', () => {
  it('setzt „und" vor das letzte Glied', () => {
    expect(aufzaehlung(['a'])).toBe('a');
    expect(aufzaehlung(['a', 'b'])).toBe('a und b');
    expect(aufzaehlung(['a', 'b', 'c'])).toBe('a, b und c');
    expect(aufzaehlung([])).toBe('');
  });
});
