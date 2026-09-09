// M15-03 — Suche über Name, Marke und die Nummer vom Etikett.
import { describe, expect, it, vi } from 'vitest';

import {
  alleFutter,
  futterDatenArt,
  futterMitId,
  gleicheVariante,
  sucheFutter,
} from '../../src/features/food/catalog.ts';

describe('Datensatz', () => {
  it('ist als synthetisch gekennzeichnet', () => {
    expect(futterDatenArt()).toBe('synthetic');
  });

  it('führt vier Produkte mit gültigen Nummern', () => {
    const produkte = alleFutter();
    expect(produkte.length).toBe(4);
    for (const produkt of produkte) {
      expect(produkt.gtin, produkt.foodId).toMatch(/^\d{13}$/);
    }
  });
});

describe('Suche', () => {
  it('findet über die vollständige Nummer', () => {
    const treffer = sucheFutter('4006381333931');
    expect(treffer.length).toBe(1);
    expect(treffer[0]?.grund).toBe('gtin');
    expect(treffer[0]?.produkt.foodId).toBe('synthetisch:trocken-1kg');
  });

  it('ignoriert Bindestriche und Leerzeichen in der Nummer', () => {
    expect(sucheFutter('4006-3813 33931')[0]?.produkt.foodId).toBe('synthetisch:trocken-1kg');
  });

  it('findet über den Produktnamen', () => {
    const treffer = sucheFutter('nassfutter');
    expect(treffer.map((eintrag) => eintrag.produkt.foodId)).toEqual([
      'synthetisch:nass-400g',
      'synthetisch:nass-6x400',
    ]);
    expect(treffer[0]?.grund).toBe('name');
  });

  it('findet über die Marke', () => {
    const treffer = sucheFutter('zweite marke');
    expect(treffer.length).toBe(2);
    expect(treffer[0]?.grund).toBe('marke');
  });

  it('findet bei zu kurzer Eingabe nichts', () => {
    expect(sucheFutter('na')).toEqual([]);
    expect(sucheFutter('  ')).toEqual([]);
  });

  it('meldet einen fehlenden Treffer als fehlenden Treffer', () => {
    expect(sucheFutter('gibtesnicht')).toEqual([]);
  });

  it('ist reproduzierbar sortiert', () => {
    expect(sucheFutter('marke').map((e) => e.produkt.foodId)).toEqual(
      sucheFutter('marke').map((e) => e.produkt.foodId),
    );
  });
});

describe('Varianten', () => {
  it('fasst dieselbe Packung mit anderem Gebinde zusammen', () => {
    const einzeln = futterMitId('synthetisch:nass-400g');
    expect(gleicheVariante(einzeln!).map((e) => e.foodId)).toEqual([
      'synthetisch:nass-400g',
      'synthetisch:nass-6x400',
    ]);
  });

  it('trennt verschiedene Packungsgrößen', () => {
    const klein = futterMitId('synthetisch:trocken-1kg');
    expect(gleicheVariante(klein!).map((e) => e.foodId)).toEqual(['synthetisch:trocken-1kg']);
  });
});

// These algorithm cases deliberately use fixed fixtures; live records have separate coverage.
vi.mock('../../content-data/food/real-products.json', async () => ({
  default: (await import('../../content-data/food/synthetic-products.json')).default,
}));
