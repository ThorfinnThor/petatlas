// M15-05 — Abgeschaltet mit Begründung; der Rückfall ist der Normalfall.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  SOURCE_ID,
  TRENNER,
  UEBERNOMMENE_SPALTEN,
  oeffentlicheProjektion,
  opffAusliefernErlaubt,
  parseOpffExport,
} from '../scripts/ingest/adapters/opff.ts';
import { IngestError, type FetchedResource } from '../scripts/ingest/types.ts';
import { requireMarket, type MarketConfig } from '../src/domain/market.ts';
import { FoodProductSchema } from '../src/domain/schemas/food.ts';
import { anreicherungsStand, reichereAn } from '../src/features/food/enrichment.ts';

function ressource(inhalt: string): FetchedResource {
  const body = new TextEncoder().encode(inhalt);
  return {
    sourceId: SOURCE_ID,
    url: 'https://static.openpetfoodfacts.org/data/en.openpetfoodfacts.org.products.csv.gz',
    body,
    contentType: 'text/csv',
    contentHash: createHash('sha256').update(body).digest('hex'),
    retrievedAt: '2026-09-08T00:00:00+00:00',
    etag: null,
    lastModified: null,
  };
}

const KOPF = ['code', 'product_name', 'brands', 'quantity', 'image_url'].join(TRENNER);
const EXPORT = [
  KOPF,
  [
    '4006381333931',
    'Trockenfutter Adult',
    'Beispielmarke',
    '1 kg',
    'https://bild.invalid/1.jpg',
  ].join(TRENNER),
  ['', 'Ohne Code', 'Marke', '400 g', ''].join(TRENNER),
  ['4006381333955', '', '', '', ''].join(TRENNER),
].join('\n');

function markt(anreicherung: boolean): MarketConfig {
  const basis = requireMarket('DE');
  return { ...basis, featureFlags: { ...basis.featureFlags, foodEnrichment: anreicherung } };
}

const FUTTER = FoodProductSchema.parse({
  foodId: 'synthetisch:1',
  productId: 'p1',
  species: 'dog',
  brand: 'Etikettmarke',
  productName: 'Trockenfutter laut Etikett',
  gtin: '4006381333931',
  lifeStage: null,
  kind: null,
  netContentGrams: 1000,
  packUnits: 1,
  nutrients: [],
  composition: null,
  declarationSourceUrl: null,
  declarationCheckedAt: null,
});

describe('Export lesen', () => {
  const ergebnis = parseOpffExport(ressource(EXPORT));

  it('liest den tabulatorgetrennten Export', () => {
    expect(ergebnis.records.length).toBe(2);
    expect(ergebnis.records[0]?.productName).toBe('Trockenfutter Adult');
    expect(ergebnis.records[0]?.quantityText).toBe('1 kg');
  });

  it('zählt Zeilen ohne Code, statt sie still zu verlieren', () => {
    expect(ergebnis.ohneCode).toBe(1);
    expect(ergebnis.gelesen).toBe(3);
  });

  it('lässt leere Felder leer, statt sie zu füllen', () => {
    const ohneNamen = ergebnis.records.find((eintrag) => eintrag.code === '4006381333955');
    expect(ohneNamen?.productName).toBeNull();
    expect(ohneNamen?.brand).toBeNull();
    expect(ohneNamen?.quantityText).toBeNull();
  });

  it('bricht ab, wenn eine übernommene Spalte fehlt', () => {
    expect(() => parseOpffExport(ressource('code\tirgendwas\n1\t2'))).toThrow(IngestError);
  });

  it('rechnet die Mengenangabe nicht um', () => {
    // „1 kg“ bleibt Text: eine Umrechnung wäre eine Deutung.
    expect(ergebnis.records[0]?.quantityText).toBe('1 kg');
  });
});

describe('Projektion', () => {
  it('übernimmt nur vier Felder und kein Bild', () => {
    const eintrag = parseOpffExport(ressource(EXPORT)).records[0]!;
    const projektion = oeffentlicheProjektion(eintrag);
    expect(Object.keys(projektion).sort()).toEqual(
      ['attribution', 'brand', 'code', 'licenseId', 'productName', 'quantityText'].sort(),
    );
    expect(JSON.stringify(projektion)).not.toContain('bild.invalid');
    expect(JSON.stringify(projektion)).not.toContain('image');
  });

  it('führt Lizenz und Attribution mit den Daten', () => {
    const eintrag = parseOpffExport(ressource(EXPORT)).records[0]!;
    const projektion = oeffentlicheProjektion(eintrag);
    expect(projektion.licenseId).toBe('ODbL-1.0');
    expect(projektion.attribution).toContain('Open Pet Food Facts');
  });

  it('nennt genau die Spalten, die der Adapter übernimmt', () => {
    expect([...UEBERNOMMENE_SPALTEN].sort()).toEqual([
      'brands',
      'code',
      'product_name',
      'quantity',
    ]);
    expect(UEBERNOMMENE_SPALTEN).not.toContain('image_url');
  });
});

describe('Freigabe', () => {
  it('ist rechtlich gesperrt, solange die Quelle pending ist', () => {
    const freigabe = opffAusliefernErlaubt();
    expect(freigabe.erlaubt).toBe(false);
    expect(freigabe.grund.length).toBeGreaterThan(10);
  });

  it('bleibt gesperrt, auch wenn das Feature eingeschaltet wird', () => {
    // Erst das Recht, dann der Schalter.
    const stand = anreicherungsStand(markt(true));
    expect(stand.aktiv).toBe(false);
    expect(stand.grund).toContain('Rechtlich gesperrt');
  });

  it('nennt bei ausgeschaltetem Feature den Spike als Begründung', () => {
    // Ohne die rechtliche Sperre wäre der Flag der zweite Riegel; der Text
    // steht bereit und nennt die Messung.
    const stand = anreicherungsStand(markt(false));
    expect(stand.aktiv).toBe(false);
    expect(stand.grund.length).toBeGreaterThan(20);
  });
});

describe('Rückfall auf Etikettangaben', () => {
  it('lässt das Produkt unverändert und sagt warum', () => {
    const ergebnis = reichereAn(FUTTER, markt(false));
    expect(ergebnis.herkunft).toBe('label');
    expect(ergebnis.produkt).toEqual(FUTTER);
    expect(ergebnis.hinweis).toContain('Händler- und Herstellerdaten');
  });

  it('funktioniert auch mit vorhandenen OPFF-Einträgen', () => {
    const eintraege = parseOpffExport(ressource(EXPORT)).records;
    const ergebnis = reichereAn(FUTTER, markt(true), eintraege);
    // Solange die Quelle pending ist, bleibt es beim Etikett.
    expect(ergebnis.herkunft).toBe('label');
    expect(ergebnis.produkt.brand).toBe('Etikettmarke');
  });
});

describe('Keine FEDIAF-Tabellen, keine fremden Bilder', () => {
  function dateien(pfad: string, endungen: readonly string[]): string[] {
    const gefunden: string[] = [];
    for (const eintrag of readdirSync(pfad, { withFileTypes: true })) {
      const voll = join(pfad, eintrag.name);
      if (eintrag.isDirectory()) gefunden.push(...dateien(voll, endungen));
      else if (endungen.some((endung) => eintrag.name.endsWith(endung))) gefunden.push(voll);
    }
    return gefunden;
  }

  it('kopiert keine Bedarfstabelle in den Datenbestand', () => {
    for (const datei of dateien('content-data', ['.json'])) {
      const inhalt = readFileSync(datei, 'utf8').toLowerCase();
      expect(inhalt.includes('fediaf'), datei).toBe(false);
      expect(inhalt.includes('nrc requirement'), datei).toBe(false);
    }
  });

  it('führt keine Bildadresse aus dem offenen Datensatz', () => {
    for (const datei of dateien('content-data', ['.json'])) {
      const inhalt = readFileSync(datei, 'utf8');
      expect(inhalt.includes('openpetfoodfacts.org/images'), datei).toBe(false);
      expect(inhalt.includes('static.openfoodfacts.org'), datei).toBe(false);
    }
  });
});
