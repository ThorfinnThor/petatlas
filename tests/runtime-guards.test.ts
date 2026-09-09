// M22-02 — Die kleine Prüfung im Browser muss dasselbe sagen wie das Schema.
// Sonst ist sie keine Ersparnis, sondern eine zweite Meinung.
//
// Geprüft wird deshalb nicht, ob der Guard „funktioniert“, sondern ob er
// **übereinstimmt**: über echte Daten und über gezielt kaputt gemachte
// Fassungen davon. Jede Mutation wird einmal beiden vorgelegt.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import {
  istExportDatei,
  istGebuehrenposition,
  istKalenderdatum,
  istMerkEintrag,
  istMerkliste,
  istPackStand,
  istTierprofil,
  istZeitpunkt,
} from '../src/domain/runtime-guards.ts';
import { FeeItemSchema } from '../src/domain/schemas/costs.ts';
import { PetProfileSchema } from '../src/domain/schemas/profile.ts';
import { MAX_EINTRAEGE } from '../src/features/profile/favorites.ts';
import {
  ExportSchema,
  MerkEintragSchema,
  MerklisteSchema,
  PackStandSchema,
} from '../src/features/profile/storage-schemas.ts';
import { EXPORT_FORMAT, EXPORT_VERSION } from '../src/features/profile/import-export.ts';

/**
 * Legt Schema und Guard dieselbe Sache vor und verlangt dasselbe Urteil.
 * Der Vergleich läuft über den echten Wert und über jede Mutation.
 */
function stimmenUeberein(
  schema: z.ZodType,
  guard: (wert: unknown) => boolean,
  faelle: readonly { readonly name: string; readonly wert: unknown }[],
): void {
  for (const fall of faelle) {
    const vomSchema = schema.safeParse(fall.wert).success;
    const vomGuard = guard(fall.wert);
    expect(vomGuard, `${fall.name}: Schema sagt ${vomSchema}, Guard sagt ${vomGuard}`).toBe(
      vomSchema,
    );
  }
}

/**
 * Erzeugt aus einem gültigen Objekt die üblichen Verstümmelungen: jedes Feld
 * einmal entfernt, einmal auf `null`, einmal auf eine Zahl, einmal auf einen
 * fremden Text — dazu ein zusätzliches Feld und die falschen Grundformen.
 */
function mutationen(gueltig: Record<string, unknown>, name: string) {
  const faelle: { name: string; wert: unknown }[] = [
    { name: `${name}: gültig`, wert: gueltig },
    { name: `${name}: null`, wert: null },
    { name: `${name}: Text`, wert: 'nein' },
    { name: `${name}: Liste`, wert: [] },
    { name: `${name}: leeres Objekt`, wert: {} },
    { name: `${name}: zusätzliches Feld`, wert: { ...gueltig, zusatz: 1 } },
  ];
  for (const feld of Object.keys(gueltig)) {
    const ohne = { ...gueltig };
    delete ohne[feld];
    faelle.push({ name: `${name}: ${feld} fehlt`, wert: ohne });
    faelle.push({ name: `${name}: ${feld} = null`, wert: { ...gueltig, [feld]: null } });
    faelle.push({ name: `${name}: ${feld} = 0`, wert: { ...gueltig, [feld]: 0 } });
    faelle.push({ name: `${name}: ${feld} = ""`, wert: { ...gueltig, [feld]: '' } });
    faelle.push({ name: `${name}: ${feld} = "xxx"`, wert: { ...gueltig, [feld]: 'xxx' } });
    faelle.push({ name: `${name}: ${feld} = {}`, wert: { ...gueltig, [feld]: {} } });
  }
  return faelle;
}

describe('Bausteine', () => {
  it('erkennt Kalenderdaten und weist Erfundenes ab', () => {
    expect(istKalenderdatum('2026-09-09')).toBe(true);
    expect(istKalenderdatum('2026-02-30')).toBe(false);
    expect(istKalenderdatum('2026-9-9')).toBe(false);
    expect(istKalenderdatum('2026-09-09T00:00:00Z')).toBe(false);
  });

  it('verlangt beim Zeitpunkt einen Zonenversatz', () => {
    expect(istZeitpunkt('2026-09-09T10:00:00+02:00')).toBe(true);
    expect(istZeitpunkt('2026-09-09T10:00:00Z')).toBe(true);
    // Ohne Versatz ist der Zeitpunkt mehrdeutig.
    expect(istZeitpunkt('2026-09-09T10:00:00')).toBe(false);
  });
});

describe('Gebührenposition', () => {
  const echte = JSON.parse(readFileSync('data-snapshots/got/got-2022.json', 'utf8')) as {
    items: Record<string, unknown>[];
  };

  it('urteilt über jede echte Position wie das Schema', () => {
    expect(echte.items.length).toBeGreaterThan(1000);
    for (const eintrag of echte.items) {
      expect(istGebuehrenposition(eintrag), JSON.stringify(eintrag).slice(0, 120)).toBe(
        FeeItemSchema.safeParse(eintrag).success,
      );
    }
  });

  it('urteilt über kaputt gemachte Positionen wie das Schema', () => {
    const gueltig = echte.items[0] as Record<string, unknown>;
    expect(FeeItemSchema.safeParse(gueltig).success).toBe(true);
    stimmenUeberein(FeeItemSchema, istGebuehrenposition, [
      ...mutationen(gueltig, 'Position'),
      { name: 'negativer Betrag', wert: { ...gueltig, baseAmountMinor: -1 } },
      { name: 'Kommabetrag', wert: { ...gueltig, baseAmountMinor: 12.5 } },
      { name: 'Währung klein', wert: { ...gueltig, currency: 'eur' } },
      { name: 'erfundene Tierart', wert: { ...gueltig, species: 'drache' } },
      { name: 'Tierart null', wert: { ...gueltig, species: null } },
      {
        name: 'Geltung ohne Ende',
        wert: { ...gueltig, validity: { from: '2022-11-22', until: null } },
      },
      {
        name: 'Geltung mit Unsinn',
        wert: { ...gueltig, validity: { from: '2022-13-01', until: null } },
      },
    ]);
  });
});

describe('Tierprofil', () => {
  const gueltig = {
    profileId: '8f3f1a2e-4b6c-4d2e-8f1a-2e4b6c4d2e8f',
    schemaVersion: 1,
    species: 'dog',
    displayName: 'Bello',
    birthDate: '2022-04-01',
    weightGrams: 12000,
    breed: 'Mischling',
  };

  it('urteilt wie das Schema', () => {
    expect(PetProfileSchema.safeParse(gueltig).success).toBe(true);
    stimmenUeberein(PetProfileSchema, istTierprofil, [
      ...mutationen(gueltig, 'Profil'),
      { name: 'Gewicht 0', wert: { ...gueltig, weightGrams: 0 } },
      { name: 'Gewicht negativ', wert: { ...gueltig, weightGrams: -1 } },
      { name: 'Gewicht mit Komma', wert: { ...gueltig, weightGrams: 1.5 } },
      { name: 'Name zu lang', wert: { ...gueltig, displayName: 'x'.repeat(41) } },
      { name: 'Rasse zu lang', wert: { ...gueltig, breed: 'x'.repeat(61) } },
      { name: 'Rasse leer', wert: { ...gueltig, breed: '' } },
      { name: 'andere Fassung', wert: { ...gueltig, schemaVersion: 2 } },
      { name: 'keine UUID', wert: { ...gueltig, profileId: 'abc' } },
      { name: 'Geburtstag unbekannt', wert: { ...gueltig, birthDate: null } },
    ]);
  });
});

describe('Merkliste', () => {
  const ort = {
    kind: 'place',
    id: 'osm:node:1',
    coordinates: { latitude: 52.5, longitude: 13.4 },
    addedAt: '2026-09-09T10:00:00+02:00',
  };
  const futter = { kind: 'food', id: 'synthetisch:1', coordinates: null, addedAt: ort.addedAt };

  it('urteilt über Einträge wie das Schema', () => {
    stimmenUeberein(MerkEintragSchema, istMerkEintrag, [
      ...mutationen(ort, 'Ort'),
      ...mutationen(futter, 'Futter'),
      { name: 'Ort ohne Koordinate', wert: { ...ort, coordinates: null } },
      {
        name: 'Koordinate außerhalb',
        wert: { ...ort, coordinates: { latitude: 95, longitude: 13 } },
      },
      { name: 'fremde Art', wert: { ...ort, kind: 'auto' } },
    ]);
  });

  it('urteilt über die Liste wie das Schema, Grenze eingeschlossen', () => {
    const guard = (wert: unknown): boolean => istMerkliste(wert, MAX_EINTRAEGE);
    stimmenUeberein(MerklisteSchema, guard, [
      { name: 'leer', wert: { version: 1, entries: [] } },
      { name: 'mit Einträgen', wert: { version: 1, entries: [ort, futter] } },
      { name: 'ein Eintrag kaputt', wert: { version: 1, entries: [ort, { ...futter, id: '' }] } },
      {
        name: 'genau an der Grenze',
        wert: { version: 1, entries: Array.from({ length: MAX_EINTRAEGE }, () => futter) },
      },
      {
        name: 'über der Grenze',
        wert: { version: 1, entries: Array.from({ length: MAX_EINTRAEGE + 1 }, () => futter) },
      },
      ...mutationen({ version: 1, entries: [] }, 'Liste'),
    ]);
  });
});

describe('Packstand', () => {
  const gueltig = {
    version: 1,
    ziele: { italien: ['heimtierausweis', 'transportbox'], oesterreich: [] },
    updatedAt: '2026-09-09T10:00:00+02:00',
  };

  it('urteilt wie das Schema', () => {
    expect(PackStandSchema.safeParse(gueltig).success).toBe(true);
    stimmenUeberein(PackStandSchema, istPackStand, [
      ...mutationen(gueltig, 'Packstand'),
      { name: 'Ziel mit Großbuchstaben', wert: { ...gueltig, ziele: { Italien: [] } } },
      { name: 'Eintrag mit Leerzeichen', wert: { ...gueltig, ziele: { italien: ['mit lücke'] } } },
      {
        name: 'zu viele Einträge',
        wert: { ...gueltig, ziele: { italien: Array.from({ length: 201 }, () => 'x') } },
      },
      { name: 'Eintrag keine Liste', wert: { ...gueltig, ziele: { italien: 'x' } } },
    ]);
  });
});

describe('Exportdatei', () => {
  const gueltig = {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: '2026-09-09T10:00:00+02:00',
    profile: null,
    interests: ['reise'],
    favorites: null,
    packing: null,
  };

  it('urteilt wie das Schema', () => {
    const guard = (wert: unknown): boolean =>
      istExportDatei(wert, EXPORT_FORMAT, EXPORT_VERSION, MAX_EINTRAEGE);
    expect(ExportSchema.safeParse(gueltig).success).toBe(true);
    stimmenUeberein(ExportSchema, guard, [
      ...mutationen(gueltig, 'Export'),
      { name: 'fremdes Format', wert: { ...gueltig, format: 'anderes' } },
      { name: 'fremde Fassung', wert: { ...gueltig, version: 2 } },
      {
        name: 'mit Profil',
        wert: {
          ...gueltig,
          profile: {
            profileId: '8f3f1a2e-4b6c-4d2e-8f1a-2e4b6c4d2e8f',
            schemaVersion: 1,
            species: 'cat',
            displayName: 'Mia',
            birthDate: null,
            weightGrams: null,
            breed: null,
          },
        },
      },
      { name: 'kaputtes Profil', wert: { ...gueltig, profile: { species: 'cat' } } },
      { name: 'Interessen keine Liste', wert: { ...gueltig, interests: 'reise' } },
    ]);
  });
});
