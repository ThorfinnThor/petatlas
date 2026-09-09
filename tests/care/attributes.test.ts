// M14-02 — Jedes Attribut, das zählt, hat Quelle und Verifikationsstatus.
import { readFileSync } from 'node:fs';

import { describe, expect, it, vi } from 'vitest';

import {
  AttributeReviewSchema,
  ProductAttributeSchema,
  darfMatchen,
  type ProductAttribute,
} from '../../src/domain/schemas/product-attributes.ts';
import {
  attributPruefung,
  attributeFuer,
  herkunftsText,
  matchbareAttribute,
  ungepruefteAttribute,
} from '../../src/features/care/attributes.ts';

function attribut(overrides: Partial<ProductAttribute> = {}): unknown {
  return {
    attribute: 'material',
    value: 'Naturkautschuk',
    unit: null,
    verification: 'manufacturer_stated',
    sourceUrl: 'https://beispiel.invalid/produkt',
    sourceLabel: 'Herstellerseite (synthetisch)',
    checkedAt: '2026-09-07',
    ...overrides,
  };
}

describe('Attributschema', () => {
  it('nimmt eine belegte Angabe an', () => {
    expect(ProductAttributeSchema.safeParse(attribut()).success).toBe(true);
  });

  it('verlangt für einen Beleg Fundstelle und Prüfdatum', () => {
    expect(ProductAttributeSchema.safeParse(attribut({ sourceUrl: null })).success).toBe(false);
    expect(ProductAttributeSchema.safeParse(attribut({ checkedAt: null })).success).toBe(false);
  });

  it('lässt einen unbekannten Wert nur als unverified zu', () => {
    expect(ProductAttributeSchema.safeParse(attribut({ value: null })).success).toBe(false);
    expect(
      ProductAttributeSchema.safeParse({
        ...(attribut({ value: null }) as object),
        verification: 'unverified',
        sourceUrl: null,
        checkedAt: null,
      }).success,
    ).toBe(true);
  });

  it('lässt keine Zahl ohne Einheit zu', () => {
    expect(ProductAttributeSchema.safeParse(attribut({ value: 70, unit: null })).success).toBe(
      false,
    );
    expect(ProductAttributeSchema.safeParse(attribut({ value: 70, unit: 'mm' })).success).toBe(
      true,
    );
  });

  it('lässt kein Attribut zweimal zu', () => {
    const roh = {
      productId: 'p',
      categoryId: 'fetch-toy',
      attributes: [attribut(), attribut()],
    };
    expect(
      AttributeReviewSchema.safeParse({
        reviewId: 'r',
        lastEditedAt: '2026-09-07',
        dataKind: 'synthetic',
        products: [roh],
        notes: [],
      }).success,
    ).toBe(false);
  });
});

describe('Verwendbarkeit', () => {
  it('lässt ein unbelegtes oder unbekanntes Attribut nicht matchen', () => {
    const unbelegt = ProductAttributeSchema.parse({
      ...(attribut({ value: null }) as object),
      verification: 'unverified',
      sourceUrl: null,
      checkedAt: null,
    });
    expect(darfMatchen(unbelegt)).toBe(false);
    expect(darfMatchen(ProductAttributeSchema.parse(attribut()))).toBe(true);
  });
});

describe('Geprüfte Daten', () => {
  const pruefung = attributPruefung();

  it('sind ausdrücklich als synthetisch gekennzeichnet', () => {
    expect(pruefung.dataKind).toBe('synthetic');
    const roh = readFileSync('content-data/attributes/synthetic-review.json', 'utf8');
    expect(roh).toContain('beispiel.invalid');
    expect(roh.toLowerCase()).toContain('erfunden');
  });

  it('führen zu jedem belegten Attribut eine Fundstelle', () => {
    for (const produkt of pruefung.products) {
      for (const eintrag of produkt.attributes) {
        if (eintrag.verification === 'unverified') continue;
        expect(eintrag.sourceUrl, `${produkt.productId}/${eintrag.attribute}`).toMatch(
          /^https:\/\//,
        );
        expect(eintrag.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('nehmen nur Attribute ins Matching, die die Kategorie kennt', () => {
    const ball = attributeFuer('synthetisch:ball-70');
    expect(ball).toBeDefined();
    const matchbar = matchbareAttribute(ball!).map((eintrag) => eintrag.attribute);
    expect(matchbar).toContain('diameterMillimeters');
    expect(matchbar).toContain('floats');
    // hardnessLevel ist unverified und gehört ohnehin zur Kategorie chew-toy.
    expect(matchbar).not.toContain('hardnessLevel');
  });

  it('benennen, was nicht geprüft ist', () => {
    const buerste = attributeFuer('synthetisch:buerste-klein');
    expect(ungepruefteAttribute(buerste!)).toContain('material');
  });

  it('beschreiben die Herkunft im Klartext', () => {
    const ball = attributeFuer('synthetisch:ball-70')!;
    const gemessen = ball.attributes.find(
      (eintrag) => eintrag.attribute === 'diameterMillimeters',
    )!;
    expect(herkunftsText(gemessen)).toContain('gemessen');
    expect(herkunftsText(gemessen)).toContain('2026-09-07');

    const offen = ball.attributes.find((eintrag) => eintrag.attribute === 'hardnessLevel')!;
    expect(herkunftsText(offen)).toContain('keine belastbare Angabe');
  });
});

// These algorithm cases deliberately use fixed fixtures; live records have separate coverage.
vi.mock('../../content-data/attributes/real-review.json', async () => ({
  default: (await import('../../content-data/attributes/synthetic-review.json')).default,
}));
