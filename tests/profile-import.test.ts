// M16-05 — Eine Importdatei ist eine fremde Eingabe, auch wenn sie vom eigenen Export stammt.
import { describe, expect, it } from 'vitest';

import { PetProfileSchema } from '../src/domain/schemas/profile.ts';
import {
  EXPORT_FORMAT,
  EXPORT_VERSION,
  EXPORT_WARNUNG,
  MAX_IMPORT_BYTES,
  baueExport,
  pruefeImport,
} from '../src/features/profile/import-export.ts';

const PROFIL = PetProfileSchema.parse({
  profileId: '00000000-0000-4000-8000-000000000000',
  schemaVersion: 1,
  species: 'dog',
  displayName: 'Bello',
  birthDate: '2020-05-01',
  weightGrams: 20_000,
  breed: 'Mischling',
});

const EXPORT = baueExport({
  profile: PROFIL,
  interests: ['futter', 'orte'],
  favorites: {
    version: 1,
    entries: [
      {
        kind: 'food',
        id: 'synthetisch:trocken-1kg',
        coordinates: null,
        addedAt: '2026-09-08T10:00:00+00:00',
      },
    ],
  },
  packing: {
    version: 1,
    ziele: { oesterreich: ['kotbeutel'] },
    updatedAt: '2026-09-08T10:00:00+00:00',
  },
  exportedAt: '2026-09-08T10:00:00+00:00',
});

describe('Export', () => {
  it('enthält Format, Fassung und Zeitpunkt', () => {
    expect(EXPORT.format).toBe(EXPORT_FORMAT);
    expect(EXPORT.version).toBe(EXPORT_VERSION);
    expect(EXPORT.exportedAt).toBe('2026-09-08T10:00:00+00:00');
  });

  it('nimmt nur bekannte Interessen mit', () => {
    const gemischt = baueExport({
      profile: PROFIL,
      interests: ['futter', 'unbekannt'],
      favorites: null,
      packing: null,
      exportedAt: '2026-09-08T10:00:00+00:00',
    });
    expect(gemischt.interests).toEqual(['futter']);
  });

  it('warnt verständlich, was in der Datei steht', () => {
    expect(EXPORT_WARNUNG).toContain('unverschlüsselt');
    expect(EXPORT_WARNUNG).toContain('nirgends hochgeladen');
  });
});

describe('Import prüfen', () => {
  it('nimmt eine eigene Exportdatei an', () => {
    const ergebnis = pruefeImport(JSON.stringify(EXPORT));
    expect(ergebnis.ok).toBe(true);
    expect(ergebnis.daten?.profile?.displayName).toBe('Bello');
    expect(ergebnis.daten?.packing?.ziele.oesterreich).toEqual(['kotbeutel']);
  });

  it('lehnt eine zu große Datei ab, ohne sie zu lesen', () => {
    const gross = JSON.stringify({ ...EXPORT, füllung: 'x'.repeat(MAX_IMPORT_BYTES) });
    const ergebnis = pruefeImport(gross);
    expect(ergebnis.fehler).toBe('zu_gross');
    expect(ergebnis.meldung).toContain('nicht gelesen');
  });

  it('lehnt kaputtes JSON ab', () => {
    expect(pruefeImport('{kein json').fehler).toBe('unlesbar');
  });

  it('lehnt eine fremde Datei ab', () => {
    expect(pruefeImport(JSON.stringify({ format: 'etwas-anderes' })).fehler).toBe('fremdes_format');
    expect(pruefeImport(JSON.stringify([1, 2, 3])).fehler).toBe('ungueltig');
  });

  it('lehnt eine fremde Fassung ab, statt sie zu deuten', () => {
    const ergebnis = pruefeImport(JSON.stringify({ ...EXPORT, version: 99 }));
    expect(ergebnis.fehler).toBe('fremde_fassung');
    expect(ergebnis.daten).toBeNull();
  });

  it('übernimmt nichts teilweise', () => {
    const halb = { ...EXPORT, profile: { species: 'dog' } };
    const ergebnis = pruefeImport(JSON.stringify(halb));
    expect(ergebnis.ok).toBe(false);
    expect(ergebnis.daten).toBeNull();
    expect(ergebnis.meldung).toContain('auch nicht teilweise');
  });
});

describe('Manipulierte Importdaten', () => {
  it('führt kein Skript aus und übernimmt kein HTML als Auszeichnung', () => {
    const boese = {
      ...EXPORT,
      profile: { ...PROFIL, displayName: '<img src=x onerror=alert(1)>' },
    };
    const ergebnis = pruefeImport(JSON.stringify(boese));
    // Das Feld ist Text und bleibt Text; es wird nirgends als HTML eingesetzt.
    expect(ergebnis.ok).toBe(true);
    expect(ergebnis.daten?.profile?.displayName).toBe('<img src=x onerror=alert(1)>');
    expect(typeof ergebnis.daten?.profile?.displayName).toBe('string');
  });

  it('lehnt eine zu lange Zeichenkette im Rufnamen ab', () => {
    const lang = { ...EXPORT, profile: { ...PROFIL, displayName: 'x'.repeat(200) } };
    expect(pruefeImport(JSON.stringify(lang)).ok).toBe(false);
  });

  it('übernimmt keine unbekannten Felder', () => {
    const zusatz = { ...EXPORT, endpoint: 'https://fremd.example/sammeln' };
    const ergebnis = pruefeImport(JSON.stringify(zusatz));
    expect(ergebnis.ok).toBe(false);
    expect(ergebnis.fehler).toBe('ungueltig');
  });

  it('übernimmt keine Adresse in einem bekannten Feld', () => {
    const boese = {
      ...EXPORT,
      favorites: {
        version: 1,
        entries: [
          {
            kind: 'food',
            id: 'https://fremd.example/lade-mich',
            coordinates: null,
            addedAt: '2026-09-08T10:00:00+00:00',
            url: 'https://fremd.example',
          },
        ],
      },
    };
    // Das Zusatzfeld `url` lässt den Eintrag scheitern; die Kennung selbst
    // wäre harmlos, weil sie nie abgerufen wird.
    expect(pruefeImport(JSON.stringify(boese)).ok).toBe(false);
  });

  it('lässt sich kein Prototyp unterschieben', () => {
    const boese = JSON.stringify({
      ...EXPORT,
      packing: { version: 1, ziele: { __proto__: ['x'] }, updatedAt: '2026-09-08T10:00:00+00:00' },
    });
    const ergebnis = pruefeImport(boese);
    // Entweder abgelehnt oder ohne Wirkung — auf keinen Fall am Prototyp.
    expect(({} as Record<string, unknown>).x).toBeUndefined();
    if (ergebnis.ok) {
      expect(Object.keys(ergebnis.daten?.packing?.ziele ?? {})).not.toContain('__proto__');
    }
  });

  it('löst beim Prüfen keinen Abruf aus', () => {
    // Der Prüfer bekommt Text und gibt ein Ergebnis zurück. Es gibt keine
    // Stelle, an der er etwas nachladen könnte — das hält dieser Test fest.
    const quelle = pruefeImport.toString();
    expect(quelle).not.toContain('fetch(');
    expect(quelle).not.toContain('XMLHttpRequest');
    expect(quelle).not.toContain('import(');
  });
});
