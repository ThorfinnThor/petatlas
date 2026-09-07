// M14-05 — Pflegeinhalte ohne Heilversprechen, Dosierung und Supplementautomatik.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { attributnameErlaubt, pruefeText } from '../src/features/care/policy.ts';
import { attributPruefung } from '../src/features/care/attributes.ts';
import { alleKategorien, ausgeschlossen, pflegeTaxonomie } from '../src/features/care/taxonomy.ts';

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
  it('erkennt Heilversprechen', () => {
    expect(pruefeText('Die Salbe heilt entzündete Pfoten.').length).toBeGreaterThan(0);
    expect(pruefeText('Wirkt gegen Juckreiz.').length).toBeGreaterThan(0);
    expect(pruefeText('Entzündungshemmend und schmerzlindernd.').length).toBeGreaterThan(0);
  });

  it('erkennt Dosierungs- und Anwendungsangaben', () => {
    expect(pruefeText('Dosierung: 5 mg pro kg Körpergewicht.').length).toBeGreaterThan(0);
    expect(pruefeText('Einmal täglich auftragen.').length).toBeGreaterThan(0);
    expect(pruefeText('Über 14 Tage anwenden.').length).toBeGreaterThan(0);
  });

  it('erkennt die automatische Supplementempfehlung', () => {
    expect(
      pruefeText('Dazu empfehlen wir eine Nahrungsergänzung für die Gelenke.').length,
    ).toBeGreaterThan(0);
  });

  it('erkennt eine Ableitung aus der Rasse', () => {
    expect(pruefeText('Für Mops besonders empfohlen.').length).toBeGreaterThan(0);
  });

  it('lässt neutrale Produkttexte durch', () => {
    const neutral = [
      'Bürste mit 65 mm Arbeitsbreite aus Buchenholz, laut Hersteller für kurzes Fell.',
      'Rampe aus Aluminium, Herstellergrenze 15 kg, Länge 120 cm.',
      'Handtuch aus Baumwolle, bei 60 Grad waschbar.',
      'Zahnbürste mit weichen Borsten; die Reinigung erfolgt mechanisch.',
    ];
    for (const text of neutral) expect(pruefeText(text), text).toEqual([]);
  });

  it('lässt eine ausdrückliche Verneinung durch', () => {
    expect(pruefeText('Kein Eintrag behauptet eine Wirkung gegen Beschwerden.')).toEqual([]);
    expect(pruefeText('Hier steht keine Dosierung.')).toEqual([]);
  });
});

describe('Ausgelieferte Pflegeinhalte', () => {
  it('enthalten in der Taxonomie keine gesperrte Aussage', () => {
    for (const kategorie of pflegeTaxonomie().categories) {
      expect(
        pruefeText(`${kategorie.label}. ${kategorie.description}`),
        kategorie.categoryId,
      ).toEqual([]);
    }
    for (const eintrag of ausgeschlossen()) {
      expect(pruefeText(`${eintrag.topic}. ${eintrag.reason}`), eintrag.topic).toEqual([]);
    }
  });

  it('führen keine Attribute mit medizinischer Bedeutung', () => {
    for (const kategorie of alleKategorien()) {
      for (const attribut of kategorie.matchAttributes) {
        expect(attributnameErlaubt(attribut), `${kategorie.categoryId}/${attribut}`).toBe(true);
      }
    }
    for (const produkt of attributPruefung().products) {
      for (const attribut of produkt.attributes) {
        expect(attributnameErlaubt(attribut.attribute), attribut.attribute).toBe(true);
      }
    }
  });

  it('sperren erfundene Attributnamen', () => {
    for (const name of ['jointSupport', 'healthBenefit', 'calmingEffect', 'therapyUse']) {
      expect(attributnameErlaubt(name), name).toBe(false);
    }
  });

  it('enthalten in den Attributwerten keine gesperrte Aussage', () => {
    for (const produkt of attributPruefung().products) {
      for (const attribut of produkt.attributes) {
        if (typeof attribut.value !== 'string') continue;
        expect(pruefeText(attribut.value), `${produkt.productId}/${attribut.attribute}`).toEqual(
          [],
        );
      }
    }
  });

  it('enthalten in den Seiten und Modulen keine gesperrte Aussage', () => {
    const quellen = [
      'src/components/pages/Care.astro',
      'src/pages/de-de/pflege/[kategorie].astro',
      // Der Prüfer selbst enthält die verbotenen Wörter zwangsläufig — er
      // definiert sie. Er wird deshalb nicht mit sich selbst geprüft.
      ...dateien('src/features/care', ['.ts']).filter((datei) => !datei.endsWith('policy.ts')),
    ];
    for (const datei of quellen) {
      const funde = pruefeText(readFileSync(datei, 'utf8'));
      expect(
        funde.map((fund) => `${fund.regel}: ${fund.stelle}`),
        datei,
      ).toEqual([]);
    }
  });
});
