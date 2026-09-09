// M14-05 — Spielzeug ohne „unzerstörbar“ und ohne erfundene Sterne.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { pruefeText } from '../src/features/care/policy.ts';
import { attributPruefung } from '../src/features/care/attributes.ts';
import { spielzeugTaxonomie } from '../src/features/care/taxonomy.ts';
import { BEDUERFNISSE, bewerte } from '../src/features/care/matching.ts';
import { ProductAttributesSchema } from '../src/domain/schemas/product-attributes.ts';

function dateien(pfad: string, endungen: readonly string[]): string[] {
  const gefunden: string[] = [];
  for (const eintrag of readdirSync(pfad, { withFileTypes: true })) {
    const voll = join(pfad, eintrag.name);
    if (eintrag.isDirectory()) gefunden.push(...dateien(voll, endungen));
    else if (endungen.some((endung) => eintrag.name.endsWith(endung))) gefunden.push(voll);
  }
  return gefunden;
}

describe('Der Prüfer prüft sich selbst', () => {
  it('erkennt Haltbarkeitsversprechen', () => {
    for (const text of [
      'Unzerstörbar auch für starke Kauer.',
      'Dieser Ball hält ewig.',
      'Unverwüstlich und mit lebenslanger Garantie.',
    ]) {
      expect(pruefeText(text), text).not.toEqual([]);
    }
  });

  it('erkennt erfundene Bewertungen', () => {
    for (const text of ['4,8 von 5 Sternen.', 'Testsieger 2026.', 'Unser Bestseller.']) {
      expect(pruefeText(text), text).not.toEqual([]);
    }
  });

  it('lässt neutrale Spielzeugtexte durch', () => {
    const neutral = [
      'Ball aus Naturkautschuk mit 70 mm Durchmesser, laut Hersteller schwimmfähig.',
      'Schnüffelteppich aus Filz, in der Maschine waschbar.',
      'Kauring aus Gummi; der Hersteller nennt keine Härteangabe.',
      'Federangel mit 60 cm Stab für die Wohnung.',
    ];
    for (const text of neutral) expect(pruefeText(text), text).toEqual([]);
  });
});

describe('Ausgelieferte Spielzeuginhalte', () => {
  it('enthalten in der Taxonomie keine gesperrte Aussage', () => {
    const taxonomie = spielzeugTaxonomie();
    for (const kategorie of taxonomie.categories) {
      expect(
        pruefeText(`${kategorie.label}. ${kategorie.description}`),
        kategorie.categoryId,
      ).toEqual([]);
    }
    for (const notiz of taxonomie.notes) expect(pruefeText(notiz), notiz).toEqual([]);
  });

  it('erklären jedes Bedürfnis ohne Wirkversprechen', () => {
    for (const [schluessel, eintrag] of Object.entries(BEDUERFNISSE)) {
      expect(pruefeText(`${eintrag.label}. ${eintrag.erklaerung}`), schluessel).toEqual([]);
    }
  });

  it('enthalten in Finder und Seiten keine gesperrte Aussage', () => {
    const quellen = ['src/components/pages/Toys.astro', ...dateien('src/features/toys', ['.ts'])];
    for (const datei of quellen) {
      const funde = pruefeText(readFileSync(datei, 'utf8'));
      expect(
        funde.map((fund) => `${fund.regel}: ${fund.stelle}`),
        datei,
      ).toEqual([]);
    }
  });

  it('erzeugen auch im Matching keine gesperrte Aussage', () => {
    const kauring = attributPruefung().products.find(
      (produkt) => produkt.productId === 'kong-classic',
    );
    expect(kauring).toBeDefined();
    const treffer = bewerte(kauring!, { species: 'dog', weightKilograms: 20, needs: ['kauen'] });
    for (const satz of [...treffer.begruendung, ...treffer.ausschluss]) {
      expect(pruefeText(satz), satz).toEqual([]);
    }
    // Und der Hinweis auf die fehlende Härteangabe bleibt eine Leerstelle,
    // keine Beruhigung.
    expect(treffer.ungeprueft).toContain('hardnessLevel');
  });

  it('behaupten für ein Produkt ohne belegte Merkmale nichts', () => {
    const leer = ProductAttributesSchema.parse({
      productId: 'synthetisch:leer',
      categoryId: 'chew-toy',
      attributes: [
        {
          attribute: 'material',
          value: null,
          unit: null,
          verification: 'unverified',
          sourceUrl: null,
          sourceLabel: 'keine Angabe',
          checkedAt: null,
        },
      ],
    });
    const treffer = bewerte(leer, { species: 'dog', weightKilograms: 20, needs: [] });
    expect(treffer.punkte).toBe(0);
    expect(treffer.begruendung).toEqual([]);
    expect(treffer.ungeprueft.length).toBeGreaterThan(0);
  });
});
