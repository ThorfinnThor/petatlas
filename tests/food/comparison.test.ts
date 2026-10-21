import { describe, expect, it } from 'vitest';

import {
  bewerte,
  empfehlungen,
  kennzahlen,
  type VergleichsProdukt,
} from '../../src/features/food/comparison.ts';

function katze(id: string, ueber: Partial<VergleichsProdukt> = {}): VergleichsProdukt {
  return {
    id,
    species: 'cat',
    format: 'dry',
    brand: 'Test',
    productName: id,
    declaredKind: 'Alleinfuttermittel für ausgewachsene Katzen',
    kind: 'complete',
    lifeStage: 'adult',
    composition: 'Huhn (30 %), Reis (20 %), Mineralstoffe',
    analytical: {
      protein: 36,
      fat: 18,
      fiber: 2,
      ash: 7,
      moisture: 8,
      calcium: 1,
      phosphorus: 0.9,
    },
    energy: { value: 400, unit: 'kcal/100g', verbatim: '400 kcal/100 g' },
    declarationSourceUrl: 'https://example.com/a',
    feeding: [
      {
        referenceAnimal: 'cat 4 kg adult',
        gramsPerDay: 50,
        verbatim: '4 kg: 50 g',
        sourceUrl: 'https://example.com/a',
      },
    ],
    price: {
      retailer: 'Shop',
      packLabel: '2 kg',
      netGrams: 2000,
      priceEur: 20,
      url: 'https://example.com/p',
    },
    claims: [],
    checkedAt: '2026-10-20',
    ...ueber,
  };
}

describe('Futtervergleich: Kennzahlen', () => {
  it('rechnet Trockenmasse, Kohlenhydrate und Kosten pro Tag', () => {
    const k = kennzahlen(katze('a'));
    expect(k.proteinTs).toBe(39.1);
    expect(k.kohlenhydrateTs).toBe(31.5);
    expect(k.euroProTag['cat 4 kg adult']).toBe(0.5);
    expect(k.offeneDeklaration).toBe(true);
    expect(k.ersteZutatTierisch).toBe(true);
  });

  it('weist eine fehlende Feuchte als geschätzt aus', () => {
    const k = kennzahlen(
      katze('a', {
        analytical: {
          protein: 36,
          fat: 18,
          fiber: 2,
          ash: 7,
          moisture: null,
          calcium: null,
          phosphorus: null,
        },
      }),
    );
    expect(k.feuchteGeschaetzt).toBe(true);
    expect(k.feuchte).toBe(10);
  });

  it('erkennt eine offene Deklaration mit vorangestellter Prozentangabe', () => {
    const k = kennzahlen(
      katze('a', { composition: '68 % Rind (Herz, Fleisch, Lunge), Mineralstoffe, Distelöl' }),
    );
    expect(k.ersteZutatTierisch).toBe(true);
    expect(k.offeneDeklaration).toBe(true);
    const sammel = kennzahlen(
      katze('b', {
        composition: '70% Fleisch und tierische Nebenerzeugnisse (u.a. 35% Rind), Mineralstoffe',
      }),
    );
    expect(sammel.offeneDeklaration).toBe(false);
    const dezimal = kennzahlen(katze('c', { composition: '33,4 % Hühnerprotein, 33,0 % Reis' }));
    expect(dezimal.ersteZutatTierisch && dezimal.offeneDeklaration).toBe(true);
    const liste = kennzahlen(
      katze('d', { composition: 'Rindfleisch, -herz, -lunge (63 %); Fleischbrühe' }),
    );
    expect(liste.offeneDeklaration).toBe(true);
  });

  it('erkennt Sammelbegriffe und Zucker', () => {
    const k = kennzahlen(
      katze('a', { composition: 'Getreide, Fleisch und tierische Nebenerzeugnisse (4 %), Zucker' }),
    );
    expect(k.ersteZutatTierisch).toBe(false);
    expect(k.sammelbegriffe.length).toBe(2);
    expect(k.zuckerZugesetzt).toBe(true);
  });
});

describe('Futtervergleich: Empfehlungen', () => {
  it('empfiehlt nie ein Ergänzungsfuttermittel und kein Produkt doppelt', () => {
    const produkte = [
      katze('gut'),
      katze('billig', {
        price: {
          retailer: 'Shop',
          packLabel: '2 kg',
          netGrams: 2000,
          priceEur: 8,
          url: 'https://example.com/p',
        },
      }),
      katze('ergaenzung', {
        kind: 'complementary',
        analytical: {
          protein: 60,
          fat: 20,
          fiber: 1,
          ash: 5,
          moisture: 8,
          calcium: 1,
          phosphorus: 1,
        },
      }),
    ];
    const b = bewerte(produkte, 'cat 4 kg adult');
    const e = empfehlungen(b, 'cat 4 kg adult');
    const ids = e.map((x) => x.bewertung.produkt.id);
    expect(ids).not.toContain('ergaenzung');
    expect(new Set(ids).size).toBe(ids.length);
    expect(e[0]?.titel).toBe('Unsere Empfehlung');
  });

  it('jede Teilnote bleibt innerhalb ihres Maximums', () => {
    const b = bewerte(
      [katze('a'), katze('b', { composition: 'Getreide, Zucker' })],
      'cat 4 kg adult',
    );
    for (const bewertung of b) {
      for (const note of bewertung.teilnoten) {
        expect(note.punkte).toBeGreaterThanOrEqual(0);
        expect(note.punkte).toBeLessThanOrEqual(note.maximum);
      }
      expect(bewertung.gesamt).toBeLessThanOrEqual(100);
    }
  });
});
