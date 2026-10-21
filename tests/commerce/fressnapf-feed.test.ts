import { describe, expect, it } from 'vitest';

import {
  fressnapfFeeds,
  katalogDiagnose,
  katalogProdukteAusZeilen,
  katalogProduktAusZeile,
  ordneProdukteZu,
  parseCsv,
  produktAusZeile,
  pruefeFeedListenUrl,
  type MatchTarget,
} from '../../scripts/awin/fressnapf.ts';
import { validiereFressnapfFeedEintrag } from '../../src/features/commerce/fressnapf-feed.ts';

const target: MatchTarget = {
  productId: 'kong-classic',
  brand: 'kong',
  aliases: ['kong classic'],
  exclude: ['extreme'],
};

function row(name = 'KONG Classic M'): Record<string, string> {
  return {
    product_name: name,
    merchant_product_brand: 'KONG',
    merchant_product_id: '1005028',
    large_image: 'https://media.os.fressnapf.com/products/1005028.jpg',
    merchant_deep_link: 'https://www.fressnapf.de/p/kong-classic-m-1005028/',
    aw_deep_link: 'https://www.awin1.com/cread.php?awinmid=14757&awinaffid=3037577&p=1005028',
  };
}

describe('Awin-Fressnapf-Feed', () => {
  it('liest Trennzeichen, Anführungszeichen und Zeilenumbrüche korrekt', () => {
    const rows = parseCsv('product_name,description\n"KONG, Classic","Zeile 1\nZeile 2"\n');
    expect(rows).toEqual([{ product_name: 'KONG, Classic', description: 'Zeile 1\nZeile 2' }]);
  });

  it('akzeptiert nur die private Awin-Feedlisten-Adresse', () => {
    expect(
      pruefeFeedListenUrl('https://productdata.awin.com/datafeed/list/apikey/secret_key-123'),
    ).toContain('productdata.awin.com');
    expect(pruefeFeedListenUrl('https://ui.awin.com/awin-feed-download/feedList')).toContain(
      'ui.awin.com',
    );
    expect(() => pruefeFeedListenUrl('https://example.test/feedList')).toThrow();
    expect(() =>
      pruefeFeedListenUrl(
        'https://productdata.awin.com/datafeed/list/apikey/secret_key-123?redirect=example.test',
      ),
    ).toThrow();
  });

  it('wählt nur den aktiven deutschen Fressnapf-Advertiser', () => {
    const feeds = fressnapfFeeds([
      {
        advertiser_id: '14757',
        advertiser_name: 'Fressnapf-Online-Shop DE',
        membership_status: 'joined',
        language: 'de',
        url: 'https://productdata.awin.com/datafeed/download/apikey/example',
      },
      {
        advertiser_id: '999',
        advertiser_name: 'Fremdshop',
        url: 'https://productdata.awin.com/datafeed/download/apikey/example2',
      },
    ]);
    expect(feeds).toHaveLength(1);
    expect(feeds[0]?.advertiserId).toBe('14757');
  });

  it('verlangt korrekte Awin-IDs, Fressnapf-Ziel und Bild', () => {
    expect(produktAusZeile(row(), target, 'KONG Classic')?.productId).toBe('kong-classic');
    expect(
      produktAusZeile(
        { ...row(), aw_deep_link: row().aw_deep_link?.replace('3037577', '1') ?? '' },
        target,
        'KONG Classic',
      ),
    ).toBeNull();
    expect(produktAusZeile(row('KONG Extreme'), target, 'KONG Classic')).toBeNull();
  });

  it('ordnet eine Feedzeile höchstens einem redaktionellen Produkt zu', () => {
    const ambiguous: MatchTarget[] = [target, { ...target, productId: 'zweites-produkt' }];
    expect(
      ordneProdukteZu([row()], ambiguous, {
        'kong-classic': 'KONG Classic',
        'zweites-produkt': 'KONG Classic Doppelung',
      }),
    ).toEqual([]);
  });

  it('weist manipulierte öffentliche Feedobjekte zurück', () => {
    const valid = produktAusZeile(row(), target, 'KONG Classic');
    expect(validiereFressnapfFeedEintrag(valid)).toEqual(valid);
    expect(
      validiereFressnapfFeedEintrag({ ...valid, merchantUrl: 'https://fressnapf.example/p/x' }),
    ).toBeNull();
  });

  it('übernimmt neue Katalogartikel nur bei klarer Kategorie und Tierart', () => {
    const katalogZeile = {
      ...row('KONG Classic M'),
      merchant_category: 'Hund > Spielzeug > Beschäftigungsspielzeug',
      species: 'Hund',
    };
    const produkt = katalogProduktAusZeile(
      katalogZeile,
      '14757',
      new Set(['fressnapf.de', 'www.fressnapf.de']),
    );
    expect(produkt).toMatchObject({ category: 'toy', species: 'dog', brand: 'KONG' });
    expect(
      katalogProduktAusZeile(
        { ...katalogZeile, merchant_category: 'Hund > Zubehör', species: '' },
        '14757',
        new Set(['fressnapf.de', 'www.fressnapf.de']),
      ),
    ).toBeNull();
  });

  it('übernimmt aus der groben Pflegerubrik nur eindeutig passende Artikel', () => {
    const pflegeZeile = {
      ...row('Krallenschere für Hunde'),
      merchant_category: 'Hund > Pflege',
      species: 'Hund',
    };
    expect(
      katalogProduktAusZeile(pflegeZeile, '14757', new Set(['fressnapf.de', 'www.fressnapf.de'])),
    ).toMatchObject({ category: 'care', productName: 'Krallenschere für Hunde' });
    expect(
      katalogProduktAusZeile(
        { ...pflegeZeile, product_name: 'Bio Schutz Hunde Fernhaltespray 500ml' },
        '14757',
        new Set(['fressnapf.de', 'www.fressnapf.de']),
      ),
    ).toBeNull();
  });

  it('dedupliziert und begrenzt den Katalog je Tierart und Kategorie', () => {
    const rows = [
      { ...row('KONG Alpha'), merchant_category: 'Hund > Spielzeug', species: 'Hund' },
      {
        ...row('KONG Beta'),
        merchant_product_id: '1005029',
        merchant_category: 'Hund > Spielzeug',
        species: 'Hund',
      },
      {
        ...row('KONG Katze'),
        merchant_product_id: '1005030',
        merchant_category: 'Katze > Spielzeug',
        species: 'Katze',
      },
    ];
    expect(
      katalogProdukteAusZeilen(rows, '14757', new Set(['fressnapf.de', 'www.fressnapf.de']), 1),
    ).toHaveLength(2);
  });
});

describe('Katalogausbau 2026-10', () => {
  const hosts = new Set(['fressnapf.de', 'www.fressnapf.de']);
  const katalog = (name: string, id: string, brand: Record<string, string>) => ({
    ...row(name),
    merchant_product_id: id,
    merchant_product_brand: '',
    ...brand,
    merchant_category: 'Hund > Spielzeug > Kauspielzeug',
    species: 'Hund',
  });

  it('liest die Marke auch aus brand_name und nimmt die Unterkategorie mit', () => {
    const produkt = katalogProduktAusZeile(
      katalog('Kauknochen M', '2001', { brand_name: 'TRIXIE' }),
      '14757',
      hosts,
    );
    expect(produkt).toMatchObject({ brand: 'TRIXIE', subcategoryLabel: 'Kauspielzeug' });
  });

  it('wechselt die Marken ab, statt alphabetisch die ersten Treffer zu nehmen', () => {
    const rows = [
      katalog('A Ball', '3001', { brand_name: 'All for paws' }),
      katalog('A Seil', '3002', { brand_name: 'All for paws' }),
      katalog('A Ring', '3003', { brand_name: 'All for paws' }),
      katalog('Z Ball', '3004', { brand_name: 'TRIXIE' }),
      katalog('Z Kong', '3005', { brand_name: 'KONG' }),
    ];
    const auswahl = katalogProdukteAusZeilen(rows, '14757', hosts, 3);
    expect(new Set(auswahl.map((p) => p.brand))).toEqual(
      new Set(['All for paws', 'KONG', 'TRIXIE']),
    );
  });

  it('nennt für jede verworfene Zeile einen Grund', () => {
    const diagnose = katalogDiagnose(
      [
        katalog('Kauknochen M', '4001', { brand_name: 'TRIXIE' }),
        { ...katalog('Ohne Kategorie', '4002', {}), merchant_category: 'Garten' },
        {
          ...katalog('Beides', '4003', {}),
          species: '',
          merchant_category: 'Hunde und Katzen > Spielzeug',
        },
      ],
      '14757',
      hosts,
    );
    expect(diagnose).toEqual({
      'übernommen (toy)': 1,
      'Kategorie unklar': 1,
      'Tierart unklar': 1,
    });
  });
});
