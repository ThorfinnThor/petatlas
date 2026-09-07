// M13-03 — Nichts Vertrauliches verlässt den Build: kein Token, kein privates Feld.
import { describe, expect, it } from 'vitest';

import {
  CommerceBuildError,
  FEEDS,
  MAX_BYTES,
  OEFFENTLICHE_ANGEBOTSFELDER,
  OEFFENTLICHE_PRODUKTFELDER,
  leseGedrosselt,
  oeffentlicheAusgabe,
  oeffentlichesAngebot,
  oeffentlichesProdukt,
  ohneGeheimnis,
  pruefeFeedUrl,
  secretStand,
  ttlAbgelaufen,
} from '../scripts/build/commerce.ts';
import {
  OfferSchema,
  ProductSchema,
  type Offer,
  type Product,
} from '../src/domain/schemas/catalog.ts';

/** Wert, der in keiner Ausgabe auftauchen darf. */
const CANARY = 'KANARIENVOGEL-a1b2c3d4e5';

function angebot(overrides: Partial<Offer> = {}): Offer {
  return OfferSchema.parse({
    offerId: 'awin:901:1001',
    productId: 'awin:901:SYN-100',
    merchantId: '901',
    marketId: 'DE',
    currency: 'EUR',
    priceMinor: 2499,
    shippingMinor: 395,
    availability: 'in_stock',
    kind: 'regular',
    affiliateUrl: 'https://beispiel.invalid/p/1001',
    fetchedAt: '2026-09-07T00:00:00+00:00',
    expiresAt: null,
    displayPermission: true,
    imagePermission: false,
    ...overrides,
  });
}

function produkt(overrides: Partial<Product> = {}): Product {
  return ProductSchema.parse({
    productId: 'awin:901:SYN-100',
    species: 'dog',
    category: 'dry_food',
    brand: 'Beispielmarke',
    gtin: '4006381333931',
    variant: null,
    netContentGrams: 2000,
    packUnits: 1,
    material: null,
    verifiedAttributes: {},
    ...overrides,
  });
}

describe('Secrets', () => {
  it('meldet ein fehlendes Secret mit Namen und ohne Wert', () => {
    const stand = secretStand({});
    expect(stand.length).toBe(FEEDS.length);
    expect(stand[0]?.vorhanden).toBe(false);
    expect(stand[0]?.meldung).toContain('AWIN_FEED_URL');
    expect(stand[0]?.meldung).toContain('fehlt');
  });

  it('nennt auch bei gesetztem Secret keinen Wert', () => {
    const name = FEEDS[0]!.secretName;
    const stand = secretStand({ [name]: `https://productdata.awin.com/feed?token=${CANARY}` });
    expect(stand[0]?.vorhanden).toBe(true);
    for (const eintrag of stand) {
      expect(eintrag.meldung).not.toContain(CANARY);
      // Auch kein Präfix, keine Länge, kein Hash.
      expect(eintrag.meldung).not.toMatch(/token|=|\d{4,}/);
    }
  });

  it('entfernt Query und Fragment aus jeder Adresse für Logs', () => {
    const adresse = `https://productdata.awin.com/datafeed.csv?token=${CANARY}#teil`;
    expect(ohneGeheimnis(adresse)).toBe('https://productdata.awin.com/datafeed.csv');
    expect(ohneGeheimnis(adresse)).not.toContain(CANARY);
  });
});

describe('Domain-Allowlist', () => {
  const erlaubt = FEEDS[0]!.allowedHosts;

  it('lässt einen erlaubten Host zu', () => {
    const url = pruefeFeedUrl(`https://${erlaubt[0]}/datafeed.csv?token=${CANARY}`, erlaubt);
    expect(url.host).toBe(erlaubt[0]);
  });

  it('lehnt einen fremden Host ab, ohne den Token zu nennen', () => {
    try {
      pruefeFeedUrl(`https://fremd.example/datafeed.csv?token=${CANARY}`, erlaubt);
      throw new Error('hätte werfen müssen');
    } catch (fehler) {
      expect(fehler).toBeInstanceOf(CommerceBuildError);
      expect((fehler as Error).message).toContain('fremd.example');
      expect((fehler as Error).message).not.toContain(CANARY);
    }
  });

  it('lehnt alles ohne https ab', () => {
    expect(() => pruefeFeedUrl(`http://${erlaubt[0]}/feed.csv`, erlaubt)).toThrow(
      CommerceBuildError,
    );
  });
});

describe('TTL', () => {
  it('ruft ohne vorherigen Abruf ab', () => {
    expect(ttlAbgelaufen(null, '2026-09-07T00:00:00+00:00')).toBe(true);
  });

  it('ruft innerhalb des TTL nicht erneut ab', () => {
    expect(ttlAbgelaufen('2026-09-07T00:00:00+00:00', '2026-09-07T05:00:00+00:00', 6)).toBe(false);
  });

  it('ruft nach Ablauf wieder ab', () => {
    expect(ttlAbgelaufen('2026-09-07T00:00:00+00:00', '2026-09-07T06:00:00+00:00', 6)).toBe(true);
  });
});

describe('Gedrosseltes Lesen', () => {
  function strom(stuecke: readonly Uint8Array[]): ReadableStream<Uint8Array> {
    let index = 0;
    return new ReadableStream({
      pull(controller) {
        if (index >= stuecke.length) {
          controller.close();
          return;
        }
        controller.enqueue(stuecke[index] as Uint8Array);
        index += 1;
      },
    });
  }

  it('liest einen Strom in Stücken zusammen', async () => {
    const daten = await leseGedrosselt(
      strom([new Uint8Array([1, 2]), new Uint8Array([3])]),
      MAX_BYTES,
    );
    expect([...daten]).toEqual([1, 2, 3]);
  });

  it('bricht ab, sobald die Grenze überschritten wird', async () => {
    const gross = [new Uint8Array(10), new Uint8Array(10)];
    await expect(leseGedrosselt(strom(gross), 15)).rejects.toBeInstanceOf(CommerceBuildError);
  });
});

describe('Öffentliche Projektion', () => {
  it('gibt genau die aufgezählten Felder aus', () => {
    expect(Object.keys(oeffentlichesAngebot(angebot())).sort()).toEqual(
      [...OEFFENTLICHE_ANGEBOTSFELDER].sort(),
    );
    expect(Object.keys(oeffentlichesProdukt(produkt())).sort()).toEqual(
      [...OEFFENTLICHE_PRODUKTFELDER].sort(),
    );
  });

  it('trägt keine Erlaubnisfelder nach außen', () => {
    const projektion = oeffentlichesAngebot(angebot());
    expect('displayPermission' in projektion).toBe(false);
    expect('imagePermission' in projektion).toBe(false);
  });

  it('trägt keine internen Attribute nach außen', () => {
    const mitInternem = produkt({
      verifiedAttributes: { interneNotiz: CANARY, einkaufspreis: 1234 },
    });
    const projektion = oeffentlichesProdukt(mitInternem);
    expect(JSON.stringify(projektion)).not.toContain(CANARY);
    expect('verifiedAttributes' in projektion).toBe(false);
  });

  it('lässt ein Feld, das später dazukommt, nicht automatisch durch', () => {
    // Ein zusätzliches Feld am Eingang darf am Ausgang nicht erscheinen:
    // die Projektion zählt auf, statt zu kopieren.
    const erweitert = { ...angebot(), geheimerRabatt: CANARY } as unknown as Offer;
    expect(JSON.stringify(oeffentlichesAngebot(erweitert))).not.toContain(CANARY);
  });
});

describe('Ausgabe ohne Vertrag', () => {
  const jetzt = '2026-09-07T12:00:00+00:00';

  it('bleibt leer, solange keine Anzeigeerlaubnis vorliegt', () => {
    const ausgabe = oeffentlicheAusgabe(
      [angebot({ displayPermission: false })],
      [produkt()],
      'DE',
      jetzt,
    );
    expect(ausgabe.offers).toEqual([]);
    expect(ausgabe.products).toEqual([]);
  });

  it('zeigt nichts aus einem fremden Markt', () => {
    const ausgabe = oeffentlicheAusgabe([angebot({ marketId: 'US' })], [produkt()], 'DE', jetzt);
    expect(ausgabe.offers).toEqual([]);
  });

  it('zeigt kein abgelaufenes Angebot', () => {
    const abgelaufen = angebot({ expiresAt: '2026-09-07T06:00:00+00:00' });
    expect(oeffentlicheAusgabe([abgelaufen], [produkt()], 'DE', jetzt).offers).toEqual([]);
  });

  it('liefert mit Erlaubnis nur die zugehörigen Produkte mit', () => {
    const ausgabe = oeffentlicheAusgabe(
      [angebot()],
      [produkt(), produkt({ productId: 'awin:901:SYN-999' })],
      'DE',
      jetzt,
    );
    expect(ausgabe.offers.length).toBe(1);
    expect(ausgabe.products.length).toBe(1);
  });
});

describe('Canary durch die ganze Kette', () => {
  it('taucht in keiner öffentlichen Ausgabe auf', () => {
    const mitCanary = angebot({
      affiliateUrl: 'https://beispiel.invalid/p/1001',
      displayPermission: true,
    });
    const produktMitCanary = produkt({ verifiedAttributes: { interneNotiz: CANARY } });
    const ausgabe = oeffentlicheAusgabe(
      [mitCanary],
      [produktMitCanary],
      'DE',
      '2026-09-07T12:00:00+00:00',
    );
    const text = JSON.stringify(ausgabe);
    expect(text).not.toContain(CANARY);
    expect(text).not.toContain('displayPermission');
    expect(text).not.toContain('verifiedAttributes');
  });
});
