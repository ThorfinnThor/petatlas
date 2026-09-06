// M08-02 — Gebührenengine.
//
// Die Rechenfixtures stammen aus `docs/GOT_RULE_SPEC.md` und sind von Hand
// nachgerechnet, nicht aus der Implementierung erzeugt. Es sind synthetische
// Beträge, keine echten GOT-Positionen.
import { describe, expect, it } from 'vitest';

import {
  COST_CONFIG,
  CostError,
  NICHT_ENTHALTEN,
  calculateCosts,
  factorRange,
  mayShowTotal,
} from '../../src/features/costs/engine.ts';
import { FeeItemSchema, type FeeItem } from '../../src/domain/schemas/costs.ts';

function position(overrides: Partial<FeeItem> = {}): FeeItem {
  return FeeItemSchema.parse({
    officialItemId: 'S1',
    catalogVersion: 'SYNTHETISCH 2026',
    originalLabel: 'Synthetische Beispielposition',
    species: null,
    baseUnit: 'Einzelleistung',
    baseAmountMinor: 1000,
    currency: 'EUR',
    sourceReference: 'synthetische Fundstelle',
    validity: { from: '2026-01-01', until: null },
    ...overrides,
  });
}

const KATALOG: FeeItem[] = [
  position(),
  position({ officialItemId: 'S2', baseAmountMinor: 1234 }),
  position({ officialItemId: 'S3', species: 'dog', baseAmountMinor: 2000 }),
  position({ officialItemId: 'S4', species: 'cat', baseAmountMinor: 2000 }),
];

describe('Golden Tests aus der Regelspezifikation', () => {
  it('rechnet 1.000 Cent × Menge 3 × Faktor 2,00 auf 6.000 Cent netto', () => {
    const ergebnis = calculateCosts(
      {
        context: 'regular',
        species: null,
        lines: [{ officialItemId: 'S1', quantity: 3, factor: 2 }],
      },
      KATALOG,
    );
    expect(ergebnis.netTotal.amountMinor).toBe(6000);
    expect(ergebnis.emergencyFee).toBeNull();
  });

  it('ergibt denselben Fall im Notdienst 11.000 Cent netto und 13.090 Cent brutto', () => {
    const ergebnis = calculateCosts(
      {
        context: 'emergency',
        species: null,
        lines: [{ officialItemId: 'S1', quantity: 3, factor: 2 }],
      },
      KATALOG,
    );
    expect(ergebnis.emergencyFee?.amountMinor).toBe(5000);
    expect(ergebnis.netTotal.amountMinor).toBe(11000);
    // 11.000 × 19 % = 2.090
    expect(ergebnis.vatAmount.amountMinor).toBe(2090);
    expect(ergebnis.grossTotal.amountMinor).toBe(13090);
  });
});

describe('Behandlungskontext', () => {
  it('erlaubt regulär das Ein- bis Dreifache', () => {
    expect(factorRange('regular')).toEqual({ min: 1, max: 3 });
  });

  it('erlaubt im Notdienst das Zwei- bis Vierfache', () => {
    expect(factorRange('emergency')).toEqual({ min: 2, max: 4 });
  });

  it('lehnt einen regulär zulässigen Faktor im Notdienst ab', () => {
    expect(() =>
      calculateCosts(
        {
          context: 'emergency',
          species: null,
          lines: [{ officialItemId: 'S1', quantity: 1, factor: 1.5 }],
        },
        KATALOG,
      ),
    ).toThrow(/außerhalb des zulässigen Bereichs/);
  });

  it('lehnt einen Notdienstfaktor im regulären Kontext ab', () => {
    expect(() =>
      calculateCosts(
        {
          context: 'regular',
          species: null,
          lines: [{ officialItemId: 'S1', quantity: 1, factor: 4 }],
        },
        KATALOG,
      ),
    ).toThrow(CostError);
  });

  it('leitet den Kontext nicht aus der Uhrzeit ab', () => {
    // Der Kontext kommt ausschließlich aus der Anfrage.
    const regulaer = calculateCosts(
      {
        context: 'regular',
        species: null,
        lines: [{ officialItemId: 'S1', quantity: 1, factor: 1 }],
      },
      KATALOG,
    );
    expect(regulaer.emergencyFee).toBeNull();
    expect(regulaer.context).toBe('regular');
  });
});

describe('Notdienstgebühr', () => {
  it('fällt nur einmal an, auch bei vielen Positionen', () => {
    const ergebnis = calculateCosts(
      {
        context: 'emergency',
        species: null,
        lines: [
          { officialItemId: 'S1', quantity: 1, factor: 2 },
          { officialItemId: 'S2', quantity: 1, factor: 2 },
        ],
      },
      KATALOG,
    );
    // 2.000 + 2.468 = 4.468 Positionen, plus einmal 5.000
    expect(ergebnis.netTotal.amountMinor).toBe(4468 + 5000);
    expect(ergebnis.emergencyFee?.amountMinor).toBe(5000);
  });

  it('wird bei mehreren Tieren derselben Angelegenheit nicht wiederholt', () => {
    const eines = calculateCosts(
      {
        context: 'emergency',
        species: null,
        animals: 1,
        lines: [{ officialItemId: 'S1', quantity: 1, factor: 2 }],
      },
      KATALOG,
    );
    const drei = calculateCosts(
      {
        context: 'emergency',
        species: null,
        animals: 3,
        lines: [{ officialItemId: 'S1', quantity: 1, factor: 2 }],
      },
      KATALOG,
    );
    expect(drei.emergencyFee?.amountMinor).toBe(eines.emergencyFee?.amountMinor);
    expect(drei.netTotal.amountMinor).toBe(eines.netTotal.amountMinor);
  });

  it('wird getrennt von den Positionen ausgewiesen', () => {
    const ergebnis = calculateCosts(
      {
        context: 'emergency',
        species: null,
        lines: [{ officialItemId: 'S1', quantity: 1, factor: 2 }],
      },
      KATALOG,
    );
    const positionen = ergebnis.lines.reduce((s, z) => s + z.netAmount.amountMinor, 0);
    expect(positionen).toBe(2000);
    expect(ergebnis.netTotal.amountMinor).toBe(positionen + 5000);
  });
});

describe('Ungültige Eingaben ergeben Fehler, keine stille Korrektur', () => {
  it.each([
    ['Menge 0', { officialItemId: 'S1', quantity: 0, factor: 1 }, /größer als 0/],
    ['negative Menge', { officialItemId: 'S1', quantity: -2, factor: 1 }, /größer als 0/],
    ['gebrochene Menge', { officialItemId: 'S1', quantity: 1.5, factor: 1 }, /ganze Zahl/],
    ['Faktor 0', { officialItemId: 'S1', quantity: 1, factor: 0 }, /außerhalb/],
    ['Faktor 3,5 regulär', { officialItemId: 'S1', quantity: 1, factor: 3.5 }, /außerhalb/],
    ['zu genauer Faktor', { officialItemId: 'S1', quantity: 1, factor: 1.234 }, /Nachkommastellen/],
    [
      'unbekannte Position',
      { officialItemId: 'gibt-es-nicht', quantity: 1, factor: 1 },
      /nicht im Katalog/,
    ],
  ])('lehnt %s ab', (_name, zeile, muster) => {
    expect(() =>
      calculateCosts({ context: 'regular', species: null, lines: [zeile] }, KATALOG),
    ).toThrow(muster);
  });

  it('lehnt eine leere Auswahl ab', () => {
    expect(() => calculateCosts({ context: 'regular', species: null, lines: [] }, KATALOG)).toThrow(
      /keine Position/,
    );
  });

  it('lehnt dieselbe Position doppelt ab, statt sie zu summieren', () => {
    expect(() =>
      calculateCosts(
        {
          context: 'regular',
          species: null,
          lines: [
            { officialItemId: 'S1', quantity: 1, factor: 1 },
            { officialItemId: 'S1', quantity: 1, factor: 2 },
          ],
        },
        KATALOG,
      ),
    ).toThrow(/doppelt/);
  });

  it('lehnt eine unpassende Tierart ab', () => {
    expect(() =>
      calculateCosts(
        {
          context: 'regular',
          species: 'cat',
          lines: [{ officialItemId: 'S3', quantity: 1, factor: 1 }],
        },
        KATALOG,
      ),
    ).toThrow(/gilt laut Quelle/);
  });

  it('erlaubt eine Position ohne Tierartangabe für jede Auswahl', () => {
    const ergebnis = calculateCosts(
      {
        context: 'regular',
        species: 'dog',
        lines: [{ officialItemId: 'S1', quantity: 1, factor: 1 }],
      },
      KATALOG,
    );
    expect(ergebnis.netTotal.amountMinor).toBe(1000);
  });

  it('lehnt gemischte Katalogfassungen ab', () => {
    const gemischt = [
      ...KATALOG,
      position({ officialItemId: 'X1', catalogVersion: 'ANDERE 2027' }),
    ];
    expect(() =>
      calculateCosts(
        {
          context: 'regular',
          species: null,
          lines: [
            { officialItemId: 'S1', quantity: 1, factor: 1 },
            { officialItemId: 'X1', quantity: 1, factor: 1 },
          ],
        },
        gemischt,
      ),
    ).toThrow(/verschiedenen Katalogfassungen/);
  });
});

describe('Rundung', () => {
  it('rundet je Position centgenau, bevor die Menge multipliziert wird', () => {
    // 1.234 × 1,5 = 1.851 Cent (1.851,0), dann × 2 = 3.702
    const ergebnis = calculateCosts(
      {
        context: 'regular',
        species: null,
        lines: [{ officialItemId: 'S2', quantity: 2, factor: 1.5 }],
      },
      KATALOG,
    );
    expect(ergebnis.lines[0]?.netAmount.amountMinor).toBe(3702);
  });

  it('rundet eine halbe Untereinheit kaufmännisch auf', () => {
    // 1.234 × 1,25 = 1.542,5 → 1.543
    const ergebnis = calculateCosts(
      {
        context: 'regular',
        species: null,
        lines: [{ officialItemId: 'S2', quantity: 1, factor: 1.25 }],
      },
      KATALOG,
    );
    expect(ergebnis.lines[0]?.netAmount.amountMinor).toBe(1543);
  });
});

describe('Was nicht enthalten ist', () => {
  it('nennt Arzneimittel, Fremdlabor und Wegegeld ausdrücklich', () => {
    const ergebnis = calculateCosts(
      {
        context: 'regular',
        species: null,
        lines: [{ officialItemId: 'S1', quantity: 1, factor: 1 }],
      },
      KATALOG,
    );
    expect(ergebnis.notIncluded).toEqual(NICHT_ENTHALTEN);
    expect(ergebnis.notIncluded.join(' ')).toMatch(/Arzneimittel/);
    expect(ergebnis.notIncluded.join(' ')).toMatch(/Fremdlabor/);
    expect(ergebnis.notIncluded.join(' ')).toMatch(/Wegegeld/);
  });
});

describe('Nachvollziehbarkeit und Freigabe', () => {
  it('weist jede Position mit Basisbetrag, Faktor, Menge und Fundstelle aus', () => {
    const ergebnis = calculateCosts(
      {
        context: 'regular',
        species: null,
        lines: [{ officialItemId: 'S1', quantity: 3, factor: 2 }],
      },
      KATALOG,
    );
    const zeile = ergebnis.lines[0];
    expect(zeile?.baseAmount.amountMinor).toBe(1000);
    expect(zeile?.factor).toBe(2);
    expect(zeile?.quantity).toBe(3);
    expect(zeile?.sourceReference).toBe('synthetische Fundstelle');
    expect(zeile?.label).toBe('Synthetische Beispielposition');
  });

  it('nennt die Katalogfassung im Ergebnis', () => {
    const ergebnis = calculateCosts(
      {
        context: 'regular',
        species: null,
        lines: [{ officialItemId: 'S1', quantity: 1, factor: 1 }],
      },
      KATALOG,
    );
    expect(ergebnis.catalogVersion).toBe('SYNTHETISCH 2026');
  });

  it('zeigt ohne fachliche Freigabe keine Gesamtschätzung', () => {
    expect(COST_CONFIG.clinicalReview).toBe('pending');
    const ergebnis = calculateCosts(
      {
        context: 'regular',
        species: null,
        lines: [{ officialItemId: 'S1', quantity: 1, factor: 1 }],
      },
      KATALOG,
    );
    expect(mayShowTotal(ergebnis)).toBe(false);
  });

  it('unterstützt keine Sondervereinbarungen', () => {
    expect(COST_CONFIG.specialAgreementsSupported).toBe(false);
  });
});
