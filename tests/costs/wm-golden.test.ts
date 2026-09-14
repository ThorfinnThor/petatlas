import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import snapshot from '../../data-snapshots/got/got-2022.json' with { type: 'json' };
import type { FeeItem } from '../../src/domain/schemas/costs.ts';
import { calculateCosts } from '../../src/features/costs/engine.ts';

const katalog = snapshot.items as FeeItem[];

describe('WM-12 Sollwerte mit GOT-Position 16', () => {
  it('erklärt die einmalige Notdienstgebühr unmittelbar im Rechner', () => {
    const page = readFileSync('src/components/pages/Costs.astro', 'utf8');
    expect(page).toContain('Die Notdienstgebühr beträgt grundsätzlich 50,00 Euro netto.');
    expect(page).toContain('Diese Berechnung bildet eine Angelegenheit ab.');
  });

  it('nutzt den amtlichen einfachen Nettobetrag von 23,62 Euro', () => {
    expect(katalog.find((item) => item.officialItemId === '16')?.baseAmountMinor).toBe(2362);
  });

  it.each([
    ['GOT-01', 'regular', 1, 1, 2362, 449, 2811],
    ['GOT-02', 'regular', 1, 3, 7086, 1346, 8432],
    ['GOT-03', 'emergency', 1, 2, 9724, 1848, 11572],
    ['GOT-04', 'emergency', 2, 2, 14448, 2745, 17193],
  ] as const)(
    '%s ergibt den freigegebenen Rechenwert',
    (_id, context, quantity, factor, net, vat, gross) => {
      const result = calculateCosts(
        {
          context,
          species: null,
          lines: [{ officialItemId: '16', quantity, factor }],
        },
        katalog,
      );
      expect(result.netTotal.amountMinor).toBe(net);
      expect(result.vatAmount.amountMinor).toBe(vat);
      expect(result.grossTotal.amountMinor).toBe(gross);
      expect(result.emergencyFee?.amountMinor ?? 0).toBe(context === 'emergency' ? 5000 : 0);
    },
  );

  it.each([
    ['regulär 0,99', 'regular', 0.99],
    ['regulär 3,01', 'regular', 3.01],
    ['Notdienst 1,99', 'emergency', 1.99],
    ['Notdienst 4,01', 'emergency', 4.01],
  ] as const)('lehnt %s ohne bestätigten Sonderfall ab', (_name, context, factor) => {
    expect(() =>
      calculateCosts(
        {
          context,
          species: null,
          lines: [{ officialItemId: '16', quantity: 1, factor }],
        },
        katalog,
      ),
    ).toThrow(/außerhalb des zulässigen Bereichs/);
  });
});
