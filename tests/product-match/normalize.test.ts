// M13-02 — Ein falsches Match ist teurer als ein fehlendes.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { parseAwinCsv, type AwinRohzeile } from '../../scripts/ingest/adapters/awin.ts';
import {
  findeQuarantaene,
  gebindeAus,
  grammAus,
  normalisiereProdukt,
  produktId,
  vergleichbar,
} from '../../scripts/normalize/products.ts';
import {
  normalisiereAngebote,
  verfuegbarkeit,
  versandInMinor,
} from '../../scripts/normalize/offers.ts';
import { ProductSchema, type Product } from '../../src/domain/schemas/catalog.ts';
import type { FetchedResource } from '../../scripts/ingest/types.ts';

const FIXTURE = 'tests/fixtures/commerce/awin-sample.csv';

function ressource(): FetchedResource {
  const body = new Uint8Array(readFileSync(FIXTURE));
  return {
    sourceId: 'synthetischer-awin-feed',
    url: 'https://beispiel.invalid/feed.csv',
    body,
    contentType: 'text/csv',
    contentHash: createHash('sha256').update(body).digest('hex'),
    retrievedAt: '2026-09-07T00:00:00+00:00',
    etag: null,
    lastModified: null,
  };
}

const FEED = parseAwinCsv(ressource());

function produkt(overrides: Partial<Product> = {}): Product {
  return ProductSchema.parse({
    productId: 'awin:901:SYN-1',
    species: 'dog',
    category: 'dry_food',
    brand: 'Beispielmarke',
    gtin: null,
    variant: null,
    netContentGrams: 2000,
    packUnits: 1,
    material: null,
    verifiedAttributes: {},
    ...overrides,
  });
}

describe('Mengenangaben', () => {
  it('liest nur ausdrückliche Gewichtsangaben', () => {
    expect(grammAus('2000 g')).toBe(2000);
    expect(grammAus('2 kg')).toBe(2000);
    expect(grammAus('1,5 kg')).toBe(1500);
  });

  it('rechnet Milliliter nicht in Gramm um', () => {
    // Das wäre eine Annahme über die Dichte.
    expect(grammAus('400 ml')).toBeNull();
    expect(grammAus('1 l')).toBeNull();
  });

  it('rät nichts aus Freitext', () => {
    for (const text of ['', 'ca. 2 kg', 'Größe 2 kg', '2', 'groß']) {
      expect(grammAus(text), text).toBeNull();
    }
  });

  it('liest die Gebindegröße nur als Zahl', () => {
    expect(gebindeAus('6')).toBe(6);
    expect(gebindeAus('1')).toBe(1);
    expect(gebindeAus('6er-Pack')).toBeNull();
    expect(gebindeAus('')).toBeNull();
  });
});

describe('Produkte aus dem Feed', () => {
  const ergebnisse = FEED.records.map(normalisiereProdukt);
  const produkte = ergebnisse
    .map((eintrag) => eintrag.datensatz)
    .filter((eintrag): eintrag is Product => eintrag !== null);

  it('übernimmt die zugeordneten Zeilen', () => {
    expect(produkte.length).toBe(FEED.records.length);
  });

  it('bildet die ID aus Netzwerk, Händler und Händlerartikelnummer', () => {
    expect(produkte[0]?.productId).toBe('awin:901:SYN-100');
    expect(produktId(FEED.records[0] as AwinRohzeile)).toBe('awin:901:SYN-100');
  });

  it('nimmt Tierart und Kategorie aus der Zuordnung, nicht aus dem Namen', () => {
    const spielzeug = produkte.find((p) => p.productId === 'awin:901:SYN-101');
    expect(spielzeug?.species).toBe('cat');
    expect(spielzeug?.category).toBe('toy');
  });

  it('lehnt eine unbekannte Feedkategorie ab, statt sie zu raten', () => {
    const zeile: AwinRohzeile = {
      zeile: 2,
      werte: { ...(FEED.records[0] as AwinRohzeile).werte, category_name: 'Sonstiges > Allerlei' },
    };
    const ergebnis = normalisiereProdukt(zeile);
    expect(ergebnis.datensatz).toBeNull();
    expect(ergebnis.ablehnung).toContain('nicht zugeordnet');
  });

  it('behandelt eine ungültige GTIN als unbekannt, nicht als Fehler', () => {
    const zeile: AwinRohzeile = {
      zeile: 2,
      werte: { ...(FEED.records[0] as AwinRohzeile).werte, ean: '1234567890123' },
    };
    expect(normalisiereProdukt(zeile).datensatz?.gtin).toBeNull();
  });

  it('lässt unbekannte Füllmenge und unbekanntes Gebinde unbekannt', () => {
    const leine = produkte.find((p) => p.productId === 'awin:902:SYN-102');
    expect(leine?.netContentGrams).toBeNull();
    expect(leine?.packUnits).toBeNull();
  });
});

describe('Vergleichbarkeit', () => {
  it('erlaubt den Vergleich bei gleicher geprüfter GTIN', () => {
    const a = produkt({ productId: 'a', gtin: '4006381333931' });
    const b = produkt({ productId: 'b', gtin: '4006381333931' });
    expect(vergleichbar(a, b).vergleichbar).toBe(true);
  });

  it('vergleicht kein Multipack mit einer Einzelpackung', () => {
    const einzeln = produkt({ productId: 'a', packUnits: 1 });
    const sechser = produkt({ productId: 'b', packUnits: 6 });
    const urteil = vergleichbar(einzeln, sechser);
    expect(urteil.vergleichbar).toBe(false);
    expect(urteil.grund).toContain('Multipack');
  });

  it('vergleicht keine verschiedenen Größen', () => {
    const klein = produkt({ productId: 'a', netContentGrams: 800 });
    const gross = produkt({ productId: 'b', netContentGrams: 2000 });
    expect(vergleichbar(klein, gross).vergleichbar).toBe(false);
  });

  it('vergleicht nicht, wenn eine Angabe fehlt', () => {
    const bekannt = produkt({ productId: 'a' });
    expect(
      vergleichbar(bekannt, produkt({ productId: 'b', netContentGrams: null })).vergleichbar,
    ).toBe(false);
    expect(vergleichbar(bekannt, produkt({ productId: 'b', packUnits: null })).vergleichbar).toBe(
      false,
    );
  });

  it('vergleicht keine verschiedenen Marken, Varianten oder Kategorien', () => {
    const basis = produkt({ productId: 'a' });
    expect(vergleichbar(basis, produkt({ productId: 'b', brand: 'Andere' })).vergleichbar).toBe(
      false,
    );
    expect(vergleichbar(basis, produkt({ productId: 'b', variant: 'Lachs' })).vergleichbar).toBe(
      false,
    );
    expect(
      vergleichbar(basis, produkt({ productId: 'b', category: 'wet_food' })).vergleichbar,
    ).toBe(false);
  });

  it('vergleicht ein Produkt nicht mit sich selbst', () => {
    expect(vergleichbar(produkt(), produkt()).vergleichbar).toBe(false);
  });

  it('glaubt bei widersprüchlicher GTIN keiner Seite', () => {
    const a = produkt({ productId: 'a', gtin: '4006381333931', netContentGrams: 800 });
    const b = produkt({ productId: 'b', gtin: '4006381333931', netContentGrams: 2000 });
    const urteil = vergleichbar(a, b);
    expect(urteil.vergleichbar).toBe(false);
    expect(urteil.grund).toContain('widersprechen');
  });
});

describe('Quarantäne', () => {
  it('meldet gleiche GTIN mit widersprüchlichen Mengen', () => {
    const funde = findeQuarantaene([
      produkt({ productId: 'a', gtin: '4006381333931', packUnits: 1 }),
      produkt({ productId: 'b', gtin: '4006381333931', packUnits: 6 }),
    ]);
    expect(funde.length).toBe(1);
    expect(funde[0]?.productIds).toEqual(['a', 'b']);
    expect(funde[0]?.grund).toContain('Gebindegröße');
  });

  it('meldet nichts bei stimmigen Daten', () => {
    expect(
      findeQuarantaene([
        produkt({ productId: 'a', gtin: '4006381333931' }),
        produkt({ productId: 'b', gtin: '4006381333931' }),
      ]),
    ).toEqual([]);
  });

  it('ignoriert Produkte ohne GTIN', () => {
    expect(findeQuarantaene([produkt({ productId: 'a' }), produkt({ productId: 'b' })])).toEqual(
      [],
    );
  });
});

describe('Angebote aus dem Feed', () => {
  const kontext = { marketId: 'DE', fetchedAt: '2026-09-07T00:00:00+00:00' };
  const ergebnis = normalisiereAngebote(FEED.records, kontext);

  it('übernimmt jede Zeile mit lesbarem Preis', () => {
    expect(ergebnis.angebote.length).toBe(FEED.records.length);
    expect(ergebnis.abgelehnt).toEqual([]);
  });

  it('macht aus unbekanntem Versand keine Null', () => {
    const ohneVersand = ergebnis.angebote.find((a) => a.offerId === 'awin:901:1002');
    expect(ohneVersand?.shippingMinor).toBeNull();
    expect(versandInMinor('')).toBeNull();
    expect(versandInMinor('0.00')).toBe(0);
  });

  it('macht aus unbekannter Verfügbarkeit kein „auf Lager“', () => {
    expect(verfuegbarkeit('')).toBe('unknown');
    expect(verfuegbarkeit('1')).toBe('in_stock');
    expect(verfuegbarkeit('0')).toBe('out_of_stock');
    const unbekannt = ergebnis.angebote.find((a) => a.offerId === 'awin:901:1004');
    expect(unbekannt?.availability).toBe('unknown');
  });

  it('erteilt ohne Vertrag keine Anzeige- und keine Bilderlaubnis', () => {
    for (const angebot of ergebnis.angebote) {
      expect(angebot.displayPermission).toBe(false);
      expect(angebot.imagePermission).toBe(false);
    }
  });

  it('nimmt den Abrufzeitpunkt des Feeds, nicht die Uhr', () => {
    for (const angebot of ergebnis.angebote) {
      expect(angebot.fetchedAt).toBe(kontext.fetchedAt);
    }
  });
});
