// M03-04 — Fachschemas. Alle Werte sind synthetisch.
// Geprüft wird vor allem, dass falsche Daten auffallen: ungültige GTIN,
// negative Beträge, kaputte Koordinaten, verdrehte Zeiträume.
import { describe, expect, it } from 'vitest';

import {
  ChunkEntrySchema,
  Coordinates,
  CostScenarioSchema,
  FeeItemSchema,
  OfferSchema,
  OutputManifestSchema,
  Period,
  PetProfileSchema,
  PlaceSchema,
  ProductSchema,
  TravelRuleSchema,
  isDisplayable,
  isEmergencyService,
  isRuleLive,
  isValidGtin,
  locationLabel,
  mayShowTotalEstimate,
  overallState,
  totalPrice,
} from '../../src/domain/schemas/index.ts';

const PRODUCT = {
  productId: 'synthetic-product-1',
  species: 'dog' as const,
  category: 'toy',
  brand: 'Synthetische Marke',
  gtin: '4006381333931',
  variant: null,
  netContentGrams: 400,
  packUnits: 1,
  material: 'Naturkautschuk',
  verifiedAttributes: { chewIntensity: 'unbekannt' },
};

const OFFER = {
  offerId: 'synthetic-offer-1',
  productId: 'synthetic-product-1',
  merchantId: 'synthetic-merchant',
  marketId: 'DE',
  currency: 'EUR',
  priceMinor: 1299,
  shippingMinor: 499,
  availability: 'in_stock' as const,
  kind: 'regular' as const,
  affiliateUrl: 'https://example.invalid/angebot/1',
  fetchedAt: '2026-09-06T10:00:00+00:00',
  expiresAt: '2026-09-13T10:00:00+00:00',
  displayPermission: true,
  imagePermission: false,
};

const PLACE = {
  placeId: 'osm:node:12345',
  name: 'Beispielpraxis (synthetisch)',
  category: 'veterinary' as const,
  coordinates: { latitude: 52.52, longitude: 13.405 },
  coordinateSource: 'node' as const,
  municipality: 'Musterstadt',
  postalCode: '10115',
  phone: null,
  website: null,
  openingHours: null,
  emergency: null,
  wheelchair: null,
  fenced: null,
  dogAllowed: null,
};

describe('GTIN', () => {
  it('akzeptiert gültige Prüfziffern in allen zulässigen Längen', () => {
    expect(isValidGtin('96385074')).toBe(true);
    expect(isValidGtin('4006381333931')).toBe(true);
  });

  it('lehnt eine falsche Prüfziffer ab', () => {
    expect(isValidGtin('4006381333932')).toBe(false);
  });

  it('lehnt eine falsche Länge ab', () => {
    expect(isValidGtin('12345678901')).toBe(false);
  });

  it('erhält führende Nullen, statt die Zahl zu kürzen', () => {
    expect(isValidGtin('0614141000036')).toBe(true);
    const product = ProductSchema.parse({ ...PRODUCT, gtin: '0614141000036' });
    expect(product.gtin).toBe('0614141000036');
    expect(product.gtin?.startsWith('0')).toBe(true);
  });

  it('lehnt Buchstaben ab', () => {
    expect(isValidGtin('40063813339A1')).toBe(false);
  });
});

describe('Produkt', () => {
  it('akzeptiert ein vollständiges Produkt', () => {
    expect(ProductSchema.parse(PRODUCT).productId).toBe('synthetic-product-1');
  });

  it('erlaubt eine unbekannte GTIN als null', () => {
    expect(ProductSchema.parse({ ...PRODUCT, gtin: null }).gtin).toBeNull();
  });

  it('lehnt eine ungültige GTIN ab, statt sie zu übernehmen', () => {
    expect(ProductSchema.safeParse({ ...PRODUCT, gtin: '4006381333932' }).success).toBe(false);
  });

  it('lehnt eine Füllmenge von 0 ab; unbekannt ist null', () => {
    expect(ProductSchema.safeParse({ ...PRODUCT, netContentGrams: 0 }).success).toBe(false);
    expect(ProductSchema.parse({ ...PRODUCT, netContentGrams: null }).netContentGrams).toBeNull();
  });

  it('unterscheidet Einzelpackung und Multipack', () => {
    expect(ProductSchema.parse({ ...PRODUCT, packUnits: 6 }).packUnits).toBe(6);
    expect(ProductSchema.safeParse({ ...PRODUCT, packUnits: 0 }).success).toBe(false);
  });
});

describe('Angebot', () => {
  it('lehnt einen negativen Preis ab', () => {
    expect(OfferSchema.safeParse({ ...OFFER, priceMinor: -1 }).success).toBe(false);
  });

  it('lehnt einen Preis von 0 als Datenfehler ab', () => {
    expect(OfferSchema.safeParse({ ...OFFER, priceMinor: 0 }).success).toBe(false);
  });

  it('lehnt einen nicht ganzzahligen Betrag ab', () => {
    expect(OfferSchema.safeParse({ ...OFFER, priceMinor: 12.99 }).success).toBe(false);
  });

  it('lehnt ein Ablaufdatum vor dem Abruf ab', () => {
    const result = OfferSchema.safeParse({ ...OFFER, expiresAt: '2026-09-01T10:00:00+00:00' });
    expect(result.success).toBe(false);
  });

  it('rechnet unbekannten Versand nicht als kostenlos', () => {
    const ohneVersand = OfferSchema.parse({ ...OFFER, shippingMinor: null });
    const gesamt = totalPrice(ohneVersand);
    expect(gesamt.totalMinor).toBe(1299);
    expect(gesamt.shippingKnown).toBe(false);
    expect(gesamt.label).toBe('Artikelpreis ohne unbekannte Versandkosten');
  });

  it('nennt bei bekanntem Versand den Gesamtpreis', () => {
    const gesamt = totalPrice(OfferSchema.parse(OFFER));
    expect(gesamt.totalMinor).toBe(1798);
    expect(gesamt.label).toBe('Gesamtpreis inklusive Versand');
  });

  it('zeigt kein Angebot ohne Anzeigeerlaubnis', () => {
    const ohneErlaubnis = OfferSchema.parse({ ...OFFER, displayPermission: false });
    expect(isDisplayable(ohneErlaubnis, 'DE', '2026-09-07T00:00:00+00:00')).toBe(false);
  });

  it('zeigt kein US-Angebot in der DE-Liste', () => {
    const usAngebot = OfferSchema.parse({ ...OFFER, marketId: 'US', currency: 'USD' });
    expect(isDisplayable(usAngebot, 'DE', '2026-09-07T00:00:00+00:00')).toBe(false);
  });

  it('zeigt kein abgelaufenes Angebot', () => {
    expect(isDisplayable(OfferSchema.parse(OFFER), 'DE', '2026-09-20T00:00:00+00:00')).toBe(false);
  });
});

describe('Koordinaten und Orte', () => {
  it('lehnt einen Breitengrad außerhalb des Bereichs ab', () => {
    expect(Coordinates.safeParse({ latitude: 91, longitude: 0 }).success).toBe(false);
    expect(Coordinates.safeParse({ latitude: 0, longitude: 181 }).success).toBe(false);
  });

  it('lehnt NaN als Koordinate ab', () => {
    expect(Coordinates.safeParse({ latitude: Number.NaN, longitude: 13 }).success).toBe(false);
  });

  it('lehnt die Null-Insel als Datenfehler ab', () => {
    expect(Coordinates.safeParse({ latitude: 0, longitude: 0 }).success).toBe(false);
  });

  it('verlangt eine Quell-ID statt eines aus dem Namen erzeugten Schlüssels', () => {
    expect(PlaceSchema.safeParse({ ...PLACE, placeId: 'beispielpraxis-musterstadt' }).success).toBe(
      false,
    );
  });

  it('behandelt eine fehlende Notdienstangabe nicht als Nein und nicht als Ja', () => {
    const ort = PlaceSchema.parse(PLACE);
    expect(ort.emergency).toBeNull();
    expect(isEmergencyService(ort)).toBe(false);
    expect(isEmergencyService(PlaceSchema.parse({ ...PLACE, emergency: true }))).toBe(true);
  });

  it('sagt „im Umkreis“, wenn die Gemeinde nicht übereinstimmt', () => {
    const ort = PlaceSchema.parse({ ...PLACE, municipality: 'Nachbarort' });
    expect(locationLabel(ort, 'Musterstadt')).toBe('im Umkreis von Musterstadt');
    expect(locationLabel(PlaceSchema.parse(PLACE), 'Musterstadt')).toBe('in Musterstadt');
  });

  it('sagt „im Umkreis“ auch bei unbekannter Gemeinde', () => {
    const ort = PlaceSchema.parse({ ...PLACE, municipality: null });
    expect(locationLabel(ort, 'Musterstadt')).toBe('im Umkreis von Musterstadt');
  });
});

describe('Zeiträume', () => {
  it('lehnt ein Ende vor dem Beginn ab', () => {
    expect(Period.safeParse({ from: '2026-06-01', until: '2026-05-01' }).success).toBe(false);
  });

  it('erlaubt ein offenes Ende', () => {
    expect(Period.safeParse({ from: '2026-06-01', until: null }).success).toBe(true);
  });

  it('lehnt ein Datum in falschem Format ab', () => {
    expect(Period.safeParse({ from: '01.06.2026', until: null }).success).toBe(false);
  });
});

describe('Gebühren und Szenarien', () => {
  const FEE = {
    officialItemId: 'synthetic-position-1',
    catalogVersion: 'synthetic-2026',
    originalLabel: 'Synthetische Beispielposition',
    species: 'dog' as const,
    baseUnit: 'Einzelleistung',
    baseAmountMinor: 1000,
    currency: 'EUR',
    sourceReference: 'synthetische Fundstelle',
    validity: { from: '2026-01-01', until: null },
  };

  const SCENARIO = {
    scenarioId: 'synthetic-scenario-1',
    title: 'Synthetisches Szenario',
    species: 'dog' as const,
    lines: [{ officialItemId: 'synthetic-position-1', quantity: 3, factor: 2 }],
    exclusions: ['Medikamente'],
    clinicalReview: 'unreviewed' as const,
    reviewedAt: null,
    reviewedBy: null,
  };

  it('akzeptiert eine vollständige Gebührenposition', () => {
    expect(FeeItemSchema.parse(FEE).baseAmountMinor).toBe(1000);
  });

  it('lehnt einen negativen Gebührenbetrag ab', () => {
    expect(FeeItemSchema.safeParse({ ...FEE, baseAmountMinor: -100 }).success).toBe(false);
  });

  it('lehnt einen Leistungsfaktor außerhalb von 1 bis 4 ab', () => {
    const zuHoch = { ...SCENARIO, lines: [{ ...SCENARIO.lines[0]!, factor: 5 }] };
    expect(CostScenarioSchema.safeParse(zuHoch).success).toBe(false);
  });

  it('lehnt eine doppelte Position ab; Mengen gehören in quantity', () => {
    const doppelt = {
      ...SCENARIO,
      lines: [SCENARIO.lines[0]!, { ...SCENARIO.lines[0]! }],
    };
    expect(CostScenarioSchema.safeParse(doppelt).success).toBe(false);
  });

  it('zeigt ohne fachliche Freigabe keine Gesamtschätzung', () => {
    expect(mayShowTotalEstimate(CostScenarioSchema.parse(SCENARIO))).toBe(false);
  });

  it('lehnt approved ohne prüfende Person ab', () => {
    const halbeFreigabe = {
      ...SCENARIO,
      clinicalReview: 'approved' as const,
      reviewedAt: '2026-09-06T10:00:00+00:00',
      reviewedBy: null,
    };
    expect(CostScenarioSchema.safeParse(halbeFreigabe).success).toBe(false);
  });

  it('zeigt eine Gesamtschätzung erst nach vollständiger Freigabe', () => {
    const freigegeben = CostScenarioSchema.parse({
      ...SCENARIO,
      clinicalReview: 'approved',
      reviewedAt: '2026-09-06T10:00:00+00:00',
      reviewedBy: 'Synthetische Prüfperson',
    });
    expect(mayShowTotalEstimate(freigegeben)).toBe(true);
  });
});

describe('Reiseregeln', () => {
  const RULE = {
    ruleId: 'synthetic-rule-1',
    originCountry: 'DE',
    destinationCountry: 'IT',
    transitCountries: ['AT'],
    species: 'dog' as const,
    context: 'private_accompanied' as const,
    validity: { from: '2026-01-01', until: null },
    officialSourceUrl: 'https://example.invalid/amtliche-quelle',
    condition: { op: 'eq', field: 'microchipped', value: true },
    guidance: 'Synthetischer Hinweistext.',
    reviewedAt: null,
    reviewedBy: null,
  };

  it('akzeptiert eine vollständige Regel', () => {
    expect(TravelRuleSchema.parse(RULE).ruleId).toBe('synthetic-rule-1');
  });

  it('lehnt einen unbekannten Operator ab, statt Code auszuführen', () => {
    const boese = { ...RULE, condition: { op: 'eval', code: 'process.exit(1)' } };
    expect(TravelRuleSchema.safeParse(boese).success).toBe(false);
  });

  it('lehnt identische Herkunft und Ziel ab', () => {
    expect(TravelRuleSchema.safeParse({ ...RULE, destinationCountry: 'DE' }).success).toBe(false);
  });

  it('lehnt eine Regel für einen unbekannten Reisekontext ab', () => {
    expect(TravelRuleSchema.safeParse({ ...RULE, context: 'unknown' }).success).toBe(false);
  });

  it('schaltet eine Regel ohne Fachfreigabe nicht live', () => {
    expect(isRuleLive(TravelRuleSchema.parse(RULE), '2026-09-06')).toBe(false);
  });

  it('schaltet eine Regel vor Inkrafttreten nicht live', () => {
    const geprueft = TravelRuleSchema.parse({
      ...RULE,
      validity: { from: '2027-01-01', until: null },
      reviewedAt: '2026-09-06T10:00:00+00:00',
      reviewedBy: 'Synthetische Prüfperson',
    });
    expect(isRuleLive(geprueft, '2026-09-06')).toBe(false);
    expect(isRuleLive(geprueft, '2027-01-01')).toBe(true);
  });

  it('macht aus einer unbekannten Position keinen erfüllten Gesamtstatus', () => {
    expect(overallState(['fulfilled', 'unknown'])).toBe('unknown');
    expect(overallState(['fulfilled', 'not_fulfilled', 'unknown'])).toBe('not_fulfilled');
    expect(overallState(['fulfilled', 'not_applicable'])).toBe('fulfilled');
  });
});

describe('Tierprofil', () => {
  const PROFILE = {
    profileId: '00000000-0000-4000-8000-000000000001',
    schemaVersion: 1 as const,
    species: 'dog' as const,
    displayName: 'Testhund',
    birthDate: null,
    weightGrams: 12500,
    breed: null,
  };

  it('akzeptiert ein lokales Profil', () => {
    expect(PetProfileSchema.parse(PROFILE).displayName).toBe('Testhund');
  });

  it('lehnt unbekannte Zusatzfelder ab, etwa eine E-Mail-Adresse', () => {
    const result = PetProfileSchema.safeParse({ ...PROFILE, email: 'a@b.example' });
    expect(result.success).toBe(false);
  });

  it('lehnt ein Gewicht von 0 ab; unbekannt ist null', () => {
    expect(PetProfileSchema.safeParse({ ...PROFILE, weightGrams: 0 }).success).toBe(false);
    expect(PetProfileSchema.parse({ ...PROFILE, weightGrams: null }).weightGrams).toBeNull();
  });
});

describe('Ausgabemanifest', () => {
  const CHUNK = {
    chunkId: 'places-de-1',
    kind: 'places' as const,
    marketId: 'DE',
    path: '/data/v1/places/de/index.abcdef12.json',
    contentHash: 'abcdef12' + '0'.repeat(56),
    byteSize: 400_000,
    validity: { from: '2026-01-01', until: null },
    dependsOn: [],
  };

  it('akzeptiert einen gültigen Eintrag', () => {
    expect(ChunkEntrySchema.parse(CHUNK).chunkId).toBe('places-de-1');
  });

  it('verlangt den Inhalts-Hash im Dateinamen', () => {
    const ohneHash = { ...CHUNK, path: '/data/v1/places/de/index.json' };
    expect(ChunkEntrySchema.safeParse(ohneHash).success).toBe(false);
  });

  it('lehnt einen zu großen Chunk ab, statt die Grenze anzuheben', () => {
    const zuGross = { ...CHUNK, byteSize: 2 * 1024 * 1024 };
    expect(ChunkEntrySchema.safeParse(zuGross).success).toBe(false);
  });

  it('erlaubt Geo-Chunks bis 1 MiB, andere nur bis 512 KiB', () => {
    expect(ChunkEntrySchema.safeParse({ ...CHUNK, byteSize: 900_000 }).success).toBe(true);
    const katalog = {
      ...CHUNK,
      chunkId: 'catalog-de-1',
      kind: 'catalog' as const,
      path: '/data/v1/catalog/de/toys.abcdef12.json',
      byteSize: 900_000,
    };
    expect(ChunkEntrySchema.safeParse(katalog).success).toBe(false);
  });

  it('lehnt einen Verweis auf einen unbekannten Chunk ab', () => {
    const manifest = {
      manifestVersion: 1 as const,
      builtAt: '2026-09-06T10:00:00+00:00',
      buildMode: 'development' as const,
      chunks: [{ ...CHUNK, dependsOn: ['gibt-es-nicht'] }],
    };
    expect(OutputManifestSchema.safeParse(manifest).success).toBe(false);
  });

  it('lehnt doppelte Chunk-IDs ab', () => {
    const manifest = {
      manifestVersion: 1 as const,
      builtAt: '2026-09-06T10:00:00+00:00',
      buildMode: 'development' as const,
      chunks: [CHUNK, { ...CHUNK }],
    };
    expect(OutputManifestSchema.safeParse(manifest).success).toBe(false);
  });
});
