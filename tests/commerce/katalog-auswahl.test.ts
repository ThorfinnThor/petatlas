import { describe, expect, it } from 'vitest';

import {
  katalogAuswahl,
  katalogEintraege,
  startauswahl,
  type CatalogProductOffer,
} from '../../src/features/commerce/feed-catalog.ts';

function produkt(
  id: string,
  species: 'dog' | 'cat',
  extra: Partial<CatalogProductOffer> = {},
): CatalogProductOffer {
  return {
    productId: id,
    productName: `Spielzeug ${id}`,
    brand: 'Marke',
    species,
    category: 'toy',
    categoryLabel: 'Spielzeug',
    merchantProductId: id,
    imageUrl: `https://images2.productserve.com/?id=${id}`,
    affiliateUrl: `https://www.awin1.com/pclick.php?p=${id}`,
    merchantUrl: `https://www.fressnapf.de/p/${id}`,
    ...extra,
  };
}

describe('Händlerkatalog: Auswahl und Startauswahl', () => {
  const liste = [
    produkt('h1', 'dog'),
    produkt('h2', 'dog'),
    produkt('h3', 'dog'),
    produkt('k1', 'cat'),
    produkt('f1', 'dog', { category: 'food' }),
  ];

  it('wählt nur die Kategorie', () => {
    expect(katalogAuswahl(liste, 'toy').map((p) => p.productId)).toEqual(['h1', 'h2', 'h3', 'k1']);
  });

  it('mischt Hund und Katze in der Startauswahl', () => {
    const start = startauswahl(katalogAuswahl(liste, 'toy'), 3);
    expect(start.map((p) => p.productId)).toEqual(['h1', 'k1', 'h2']);
  });

  it('macht aus Produkten Einträge mit Händler und Beschriftung', () => {
    const [eintrag] = katalogEintraege(
      [produkt('h1', 'dog', { subcategoryLabel: 'Bälle' })],
      'Fressnapf',
    );
    expect(eintrag).toMatchObject({
      id: 'h1',
      haendler: 'Fressnapf',
      art: 'dog',
      rubrik: 'Bälle',
      meta: 'Marke · Bälle',
    });
  });
});
