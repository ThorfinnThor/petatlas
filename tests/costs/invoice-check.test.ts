import { describe, expect, it } from 'vitest';

import snapshot from '../../data-snapshots/got/got-2022.json' with { type: 'json' };
import type { FeeItem } from '../../src/domain/schemas/index.ts';
import { pruefeRechnung, type Pruefanfrage } from '../../src/features/costs/invoice-check.ts';

const katalog = snapshot.items as unknown as FeeItem[];

function pruefe(anfrage: Partial<Pruefanfrage> & Pick<Pruefanfrage, 'zeilen'>) {
  return pruefeRechnung(
    { kontext: 'regular', tierart: 'dog', notdienstgebuehren: 0, ...anfrage },
    katalog,
  );
}

describe('pruefeRechnung', () => {
  it('rechnet den Sollbetrag wie der Rechner und meldet nichts bei einer üblichen Zeile', () => {
    const ergebnis = pruefe({
      zeilen: [{ nummer: '16', faktor: 2, menge: 1, betragLautRechnungMinor: 4724 }],
    });
    expect(ergebnis.zeilen[0]?.sollNetto?.amountMinor).toBe(4724);
    expect(ergebnis.zeilen[0]?.befunde).toEqual([
      { stufe: 'ok', text: 'Nummer und Faktor passen zum Gebührenverzeichnis.' },
    ]);
    expect(ergebnis.befunde).toEqual([]);
  });

  it('nennt § 5 bei einem Faktor über dem Dreifachen außerhalb des Notdienstes', () => {
    const [zeile] = pruefe({ zeilen: [{ nummer: '16', faktor: 3.5, menge: 1 }] }).zeilen;
    expect(zeile?.befunde[0]?.stufe).toBe('pruefen');
    expect(zeile?.befunde[0]?.text).toContain('§ 5 Abs. 1 GOT');
  });

  it('lässt im Notdienst das Vierfache zu', () => {
    const [zeile] = pruefe({
      kontext: 'emergency',
      notdienstgebuehren: 1,
      zeilen: [{ nummer: '16', faktor: 4, menge: 1 }],
    }).zeilen;
    expect(zeile?.befunde[0]?.stufe).toBe('ok');
  });

  it('meldet eine unbekannte Nummer', () => {
    const [zeile] = pruefe({ zeilen: [{ nummer: '9999', faktor: 1, menge: 1 }] }).zeilen;
    expect(zeile?.bezeichnung).toBeNull();
    expect(zeile?.befunde[0]?.stufe).toBe('pruefen');
  });

  it('meldet eine doppelte Notdienstgebühr und eine ohne Notdienst', () => {
    const imNotdienst = pruefe({
      kontext: 'emergency',
      notdienstgebuehren: 2,
      zeilen: [{ nummer: '16', faktor: 2, menge: 1 }],
    });
    expect(imNotdienst.befunde.map((befund) => befund.text).join(' ')).toContain('§ 4 Abs. 2 GOT');
    const ohne = pruefe({ notdienstgebuehren: 1, zeilen: [{ nummer: '16', faktor: 1, menge: 1 }] });
    expect(ohne.befunde[0]?.stufe).toBe('pruefen');
  });

  it('weist auf eine Nummer für eine andere Tierart hin', () => {
    const [zeile] = pruefe({ zeilen: [{ nummer: '212', faktor: 1, menge: 1 }] }).zeilen;
    expect(zeile?.befunde.some((befund) => befund.text.includes('andere Tierart'))).toBe(true);
    const [hundKatze] = pruefe({ zeilen: [{ nummer: '221', faktor: 1, menge: 1 }] }).zeilen;
    expect(hundKatze?.befunde[0]?.stufe).toBe('ok');
  });

  it('weist auf eine abweichende Zeile und doppelte Nummern hin', () => {
    const ergebnis = pruefe({
      zeilen: [
        { nummer: '166', faktor: 1, menge: 1, betragLautRechnungMinor: 3157 },
        { nummer: '166', faktor: 1, menge: 1 },
      ],
    });
    expect(ergebnis.zeilen[0]?.befunde[0]?.stufe).toBe('hinweis');
    expect(ergebnis.befunde[0]?.text).toContain('§ 6 GOT');
  });
});
