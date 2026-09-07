// M14-03 — Rasse bewirkt nichts, Unbekanntes macht nichts passend.
import { describe, expect, it } from 'vitest';

import {
  ProductAttributesSchema,
  type ProductAttributes,
} from '../../src/domain/schemas/product-attributes.ts';
import {
  BEDUERFNISSE,
  bewerte,
  finde,
  grenzeAus,
  type Bedarf,
} from '../../src/features/care/matching.ts';
import { findeSpielzeug, istSpielzeug } from '../../src/features/toys/matching.ts';

function beleg(attribute: string, value: string | number | boolean, unit: string | null = null) {
  return {
    attribute,
    value,
    unit,
    verification: 'manufacturer_stated' as const,
    sourceUrl: 'https://beispiel.invalid/produkt',
    sourceLabel: 'Herstellerseite (synthetisch)',
    checkedAt: '2026-09-07',
  };
}

function offen(attribute: string) {
  return {
    attribute,
    value: null,
    unit: null,
    verification: 'unverified' as const,
    sourceUrl: null,
    sourceLabel: 'keine Angabe gefunden',
    checkedAt: null,
  };
}

function produkt(
  categoryId: string,
  attributes: unknown[],
  productId = 'synthetisch:test',
): ProductAttributes {
  return ProductAttributesSchema.parse({ productId, categoryId, attributes });
}

const BEDARF: Bedarf = { species: 'dog', weightKilograms: 20, needs: [] };

describe('Harte Filter', () => {
  it('schließt eine andere Tierart aus', () => {
    const kratzbaum = produkt('scratching', [beleg('material', 'Sisal')]);
    expect(bewerte(kratzbaum, BEDARF).zulaessig).toBe(false);
    expect(bewerte(kratzbaum, { ...BEDARF, species: 'cat' }).zulaessig).toBe(true);
  });

  it('achtet auf die Herstellergrenze', () => {
    const rampe = produkt('mobility-aid', [beleg('maxLoadKilograms', 15, 'kg')]);
    const zuSchwer = bewerte(rampe, { ...BEDARF, weightKilograms: 30 });
    expect(zuSchwer.zulaessig).toBe(false);
    expect(zuSchwer.ausschluss[0]).toContain('15 kg');
    expect(bewerte(rampe, { ...BEDARF, weightKilograms: 10 }).zulaessig).toBe(true);
  });

  it('achtet auf den Herstellergrößenbereich', () => {
    const ball = produkt('fetch-toy', [beleg('sizeRange', 'ab 15 kg Körpergewicht')]);
    expect(bewerte(ball, { ...BEDARF, weightKilograms: 8 }).zulaessig).toBe(false);
    expect(bewerte(ball, { ...BEDARF, weightKilograms: 20 }).zulaessig).toBe(true);
  });

  it('schließt bei unbekanntem Gewicht nichts aus — und behauptet auch nichts', () => {
    const ball = produkt('fetch-toy', [beleg('sizeRange', 'ab 15 kg Körpergewicht')]);
    const treffer = bewerte(ball, { ...BEDARF, weightKilograms: null });
    expect(treffer.zulaessig).toBe(true);
    expect(treffer.punkte).toBe(0);
    expect(treffer.begruendung).toEqual([]);
  });

  it('schließt bei unbelegter Angabe nichts aus', () => {
    const ball = produkt('fetch-toy', [offen('sizeRange')]);
    const treffer = bewerte(ball, { ...BEDARF, weightKilograms: 5 });
    expect(treffer.zulaessig).toBe(true);
    expect(treffer.punkte).toBe(0);
    expect(treffer.ungeprueft).toContain('sizeRange');
  });

  it('liest Herstellergrenzen nur in klarer Form', () => {
    expect(grenzeAus('ab 15 kg Körpergewicht')).toEqual({ art: 'min', kilogramm: 15 });
    expect(grenzeAus('bis 10 kg')).toEqual({ art: 'max', kilogramm: 10 });
    expect(grenzeAus('für große Hunde')).toBeNull();
    expect(grenzeAus('ca. 15 kg')).toBeNull();
  });
});

describe('Weiche Kriterien', () => {
  const ball = produkt('fetch-toy', [beleg('floats', true), beleg('material', 'Naturkautschuk')]);
  const kau = produkt('chew-toy', [beleg('material', 'Gummi')], 'synthetisch:kau');

  it('geben Punkte nur für erklärbare Bedürfnisse', () => {
    const treffer = bewerte(ball, { ...BEDARF, needs: ['apportieren'] });
    expect(treffer.punkte).toBeGreaterThan(0);
    expect(treffer.begruendung.join(' ')).toContain('apportiert gern');
  });

  it('ignorieren ein unbekanntes Bedürfnis', () => {
    expect(bewerte(ball, { ...BEDARF, needs: ['gesundheit'] }).punkte).toBe(0);
  });

  it('werten Schwimmfähigkeit nur bei belegter Angabe', () => {
    const mitWasser = bewerte(ball, { ...BEDARF, needs: ['wasser'] });
    expect(mitWasser.begruendung.join(' ')).toContain('schwimmfähig');
    const ohneAngabe = produkt('fetch-toy', [offen('floats')]);
    expect(
      bewerte(ohneAngabe, { ...BEDARF, needs: ['wasser'] }).begruendung.join(' '),
    ).not.toContain('schwimmfähig');
  });

  it('erklären jedes Bedürfnis in einem Satz', () => {
    for (const [schluessel, eintrag] of Object.entries(BEDUERFNISSE)) {
      expect(eintrag.erklaerung.length, schluessel).toBeGreaterThan(20);
      expect(eintrag.label.length, schluessel).toBeGreaterThan(3);
    }
  });

  it('sortieren nach Punkten und bei Gleichstand stabil', () => {
    const treffer = finde([kau, ball], { ...BEDARF, needs: ['apportieren'] });
    expect(treffer[0]?.productId).toBe('synthetisch:test');
    const gedreht = finde([ball, kau], { ...BEDARF, needs: [] });
    expect(gedreht.map((t) => t.productId)).toEqual(['synthetisch:kau', 'synthetisch:test']);
  });
});

describe('Rasse bewirkt nichts', () => {
  const ball = produkt('fetch-toy', [beleg('floats', true)]);

  it('ändert weder Zulässigkeit noch Punkte noch Begründung', () => {
    const ohne = bewerte(ball, { ...BEDARF, needs: ['apportieren'] });
    const mit = bewerte(ball, {
      ...BEDARF,
      needs: ['apportieren'],
      breed: 'Französische Bulldogge',
    });
    expect(mit).toEqual(ohne);
  });

  it('erzeugt keine medizinische Aussage', () => {
    const treffer = bewerte(ball, { ...BEDARF, breed: 'Mops' });
    const text = [...treffer.begruendung, ...treffer.ausschluss].join(' ').toLowerCase();
    for (const wort of ['atemwege', 'gelenk', 'krankheit', 'therapie', 'empfohlen bei']) {
      expect(text.includes(wort), wort).toBe(false);
    }
  });
});

describe('Spielzeugfinder', () => {
  const ball = produkt('fetch-toy', [beleg('floats', true)]);
  const buerste = produkt(
    'grooming-brush',
    [beleg('coatLength', 'langhaarig')],
    'synthetisch:buerste',
  );

  it('nimmt nur Spielzeugkategorien', () => {
    expect(istSpielzeug(ball)).toBe(true);
    expect(istSpielzeug(buerste)).toBe(false);
    const treffer = findeSpielzeug([ball, buerste], BEDARF);
    expect(treffer.map((t) => t.productId)).toEqual(['synthetisch:test']);
  });

  it('benutzt dieselbe Bewertung wie die Pflegeseite', () => {
    const bedarf = { ...BEDARF, needs: ['apportieren'] };
    expect(findeSpielzeug([ball], bedarf)[0]).toEqual(finde([ball], bedarf)[0]);
  });
});
