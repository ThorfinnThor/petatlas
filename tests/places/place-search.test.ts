// M10-03 — Ortssuche: lokal, klein, und ohne zu raten.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  entfernungMeter,
  normalisiere,
  ortsZuordnung,
  sucheOrte,
  type OrtsEintrag,
} from '../../src/features/map/place-search.ts';

const INDEX = (
  JSON.parse(readFileSync(new URL('../fixtures/osm/ortsindex.json', import.meta.url), 'utf8')) as {
    orte: OrtsEintrag[];
  }
).orte;

describe('Namensvergleich', () => {
  it('ignoriert Groß- und Kleinschreibung', () => {
    expect(normalisiere('BREMEN')).toBe(normalisiere('bremen'));
  });

  it('löst Umlaute und ß auf', () => {
    expect(normalisiere('Höxter')).toBe('hoexter');
    expect(normalisiere('Gießen')).toBe('giessen');
    expect(normalisiere('Müritz')).toBe('mueritz');
  });

  it('vereinheitlicht Bindestriche und Leerraum', () => {
    expect(normalisiere('Bad  Homburg')).toBe(normalisiere('Bad-Homburg'));
  });

  it('findet einen Ort über die aufgelöste Schreibweise', () => {
    expect(sucheOrte('hoexter', INDEX).treffer[0]?.eintrag.name).toBe('Höxter');
  });
});

describe('Autocomplete auf kleinen Daten', () => {
  it('findet einen Ort über sein Präfix', () => {
    const treffer = sucheOrte('brem', INDEX).treffer.map((t) => t.eintrag.name);
    expect(treffer).toContain('Bremen');
    expect(treffer).toContain('Bremerhaven');
  });

  it('setzt den genauen Treffer nach vorne', () => {
    expect(sucheOrte('Bremen', INDEX).treffer[0]?.eintrag.name).toBe('Bremen');
  });

  it('sortiert größere Orte vor kleinere', () => {
    const namen = sucheOrte('neustadt', INDEX).treffer.map((t) => t.eintrag.name);
    // Beide heißen Neustadt; die Stadt steht vor dem Ortsteil.
    expect(sucheOrte('neustadt', INDEX).treffer[0]?.eintrag.kind).toBe('town');
    expect(namen).toHaveLength(2);
  });

  it('verlangt eine Mindestlänge, statt den ganzen Index auszugeben', () => {
    const ergebnis = sucheOrte('b', INDEX);
    expect(ergebnis.treffer).toEqual([]);
    expect(ergebnis.hinweis).toMatch(/mindestens/);
  });

  it('begrenzt die Trefferzahl', () => {
    expect(sucheOrte('e', INDEX, { minZeichen: 1, maxTreffer: 2 }).treffer).toHaveLength(2);
  });

  it('meldet ein leeres Ergebnis, statt einen ungefähr passenden Ort zu liefern', () => {
    const ergebnis = sucheOrte('Zebrastreifenhausen', INDEX);
    expect(ergebnis.treffer).toEqual([]);
    expect(ergebnis.hinweis).toMatch(/Kein Ort gefunden/);
  });

  it('liefert für dieselbe Eingabe dieselbe Reihenfolge', () => {
    const a = sucheOrte('neustadt', INDEX).treffer.map((t) => t.eintrag.placeId);
    const b = sucheOrte('neustadt', INDEX).treffer.map((t) => t.eintrag.placeId);
    expect(b).toEqual(a);
  });
});

describe('Mehrdeutige Ortsnamen werden aufgelöst, nicht geraten', () => {
  it('erkennt zwei gleichnamige Ortsteile als mehrdeutig', () => {
    const ergebnis = sucheOrte('Mitte', INDEX);
    expect(ergebnis.mehrdeutig).toBe(true);
    expect(ergebnis.treffer).toHaveLength(2);
  });

  it('unterscheidet sie über den nächstgelegenen größeren Ort', () => {
    const anzeigen = sucheOrte('Mitte', INDEX).treffer.map((t) => t.anzeige);
    expect(anzeigen).toContain('Mitte (Ortsteil von Bremen)');
    expect(anzeigen).toContain('Mitte (Ortsteil von Bremerhaven)');
  });

  it('nutzt das Bundesland, wenn die Quelle eines führt', () => {
    const treffer = sucheOrte('neustadt', INDEX).treffer;
    const stadt = treffer.find((t) => t.eintrag.kind === 'town');
    expect(stadt?.unterscheidung).toBe('Rheinland-Pfalz');
  });

  it('lässt einen eindeutigen Namen ohne Zusatz', () => {
    const ergebnis = sucheOrte('Bremerhaven', INDEX);
    expect(ergebnis.mehrdeutig).toBe(false);
    expect(ergebnis.treffer[0]?.unterscheidung).toBeNull();
    expect(ergebnis.treffer[0]?.anzeige).toBe('Bremerhaven');
  });

  it('sagt in der Oberfläche, dass eine Auswahl nötig ist', () => {
    expect(sucheOrte('Mitte', INDEX).hinweis).toMatch(/Bitte auswählen/);
  });
});

describe('Entfernung', () => {
  it('rechnet in Metern', () => {
    // Bremen nach Bremerhaven sind rund 55 km Luftlinie.
    const abstand = entfernungMeter(
      { latitude: 53.0758, longitude: 8.8072 },
      { latitude: 53.5396, longitude: 8.5809 },
    );
    expect(abstand).toBeGreaterThan(50_000);
    expect(abstand).toBeLessThan(60_000);
  });

  it('ist null für denselben Punkt', () => {
    const punkt = { latitude: 53, longitude: 8 };
    expect(entfernungMeter(punkt, punkt)).toBe(0);
  });
});

describe('Ortszuordnung wird nicht beschönigt', () => {
  it('sagt „in“, wenn die Gemeinde übereinstimmt', () => {
    expect(ortsZuordnung('Bremen', 'Bremen')).toEqual({ label: 'in Bremen', istInGemeinde: true });
  });

  it('sagt „im Umkreis von“, wenn sie es nicht tut', () => {
    expect(ortsZuordnung('Delmenhorst', 'Bremen').label).toBe('im Umkreis von Bremen');
    expect(ortsZuordnung('Delmenhorst', 'Bremen').istInGemeinde).toBe(false);
  });

  it('sagt „im Umkreis von“, wenn die Gemeinde unbekannt ist', () => {
    expect(ortsZuordnung(null, 'Bremen').istInGemeinde).toBe(false);
  });

  it('vergleicht Gemeindenamen unabhängig von der Schreibweise', () => {
    expect(ortsZuordnung('bremen', 'Bremen').istInGemeinde).toBe(true);
  });
});
