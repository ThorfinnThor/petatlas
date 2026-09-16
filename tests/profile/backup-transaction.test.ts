import { describe, expect, it } from 'vitest';

import { PROFILE_STORAGE_KEY } from '../../src/domain/domain-rules.ts';
import {
  BACKUP_TRANSACTION_KEY,
  ersetzeDurchSicherung,
  offeneSicherungZuruecksetzen,
} from '../../src/features/profile/backup-transaction.ts';
import { FAVORITES_STORAGE_KEY } from '../../src/features/profile/favorites.ts';
import type { ExportDatei } from '../../src/features/profile/import-export.ts';
import { PACKING_STORAGE_KEY } from '../../src/features/profile/packing-state.ts';
import type { Speicher } from '../../src/features/profile/storage.ts';

class TestSpeicher implements Speicher {
  readonly daten = new Map<string, string>();
  fehlerBei: string | null = null;

  getItem(schluessel: string): string | null {
    return this.daten.get(schluessel) ?? null;
  }
  setItem(schluessel: string, wert: string): void {
    if (this.fehlerBei === schluessel) {
      this.fehlerBei = null;
      throw new Error('synthetischer Schreibfehler');
    }
    this.daten.set(schluessel, wert);
  }
  removeItem(schluessel: string): void {
    this.daten.delete(schluessel);
  }
}

const LEERER_EXPORT: ExportDatei = {
  format: 'petatlas-lokal',
  version: 1,
  exportedAt: '2026-09-16T10:00:00+00:00',
  profile: null,
  interests: [],
  favorites: null,
  packing: null,
};

describe('Sicherungsübernahme', () => {
  it('löscht mit null ausdrücklich alle drei alten Bereiche', () => {
    const speicher = new TestSpeicher();
    speicher.daten.set(PROFILE_STORAGE_KEY, 'alt-profil');
    speicher.daten.set(FAVORITES_STORAGE_KEY, 'alte-merkliste');
    speicher.daten.set(PACKING_STORAGE_KEY, 'alte-packliste');

    expect(ersetzeDurchSicherung(speicher, LEERER_EXPORT, '2026-09-16T11:00:00Z').ok).toBe(true);
    expect(speicher.getItem(PROFILE_STORAGE_KEY)).toBeNull();
    expect(speicher.getItem(FAVORITES_STORAGE_KEY)).toBeNull();
    expect(speicher.getItem(PACKING_STORAGE_KEY)).toBeNull();
    expect(speicher.getItem(BACKUP_TRANSACTION_KEY)).toBeNull();
  });

  it('stellt bei einem mittleren Schreibfehler exakt den Vorzustand wieder her', () => {
    const speicher = new TestSpeicher();
    const vorher = {
      [PROFILE_STORAGE_KEY]: 'alt-profil',
      [FAVORITES_STORAGE_KEY]: 'alte-merkliste',
      [PACKING_STORAGE_KEY]: 'alte-packliste',
    };
    for (const [key, value] of Object.entries(vorher)) speicher.daten.set(key, value);
    speicher.fehlerBei = FAVORITES_STORAGE_KEY;

    const daten: ExportDatei = {
      ...LEERER_EXPORT,
      favorites: { version: 1, entries: [] },
      packing: { version: 1, ziele: {}, updatedAt: '2026-09-16T10:00:00Z' },
    };
    const ergebnis = ersetzeDurchSicherung(speicher, daten, '2026-09-16T11:00:00Z');
    expect(ergebnis.ok).toBe(false);
    for (const [key, value] of Object.entries(vorher)) expect(speicher.getItem(key)).toBe(value);
    expect(speicher.getItem(BACKUP_TRANSACTION_KEY)).toBeNull();
  });

  it('holt eine beim Seitenwechsel unterbrochene Übernahme aus dem Journal zurück', () => {
    const speicher = new TestSpeicher();
    speicher.daten.set(PROFILE_STORAGE_KEY, 'teilweise-neu');
    speicher.daten.set(
      BACKUP_TRANSACTION_KEY,
      JSON.stringify({
        version: 1,
        before: {
          [PROFILE_STORAGE_KEY]: 'alt-profil',
          [FAVORITES_STORAGE_KEY]: null,
          [PACKING_STORAGE_KEY]: 'alte-packliste',
        },
      }),
    );

    expect(offeneSicherungZuruecksetzen(speicher).ok).toBe(true);
    expect(speicher.getItem(PROFILE_STORAGE_KEY)).toBe('alt-profil');
    expect(speicher.getItem(FAVORITES_STORAGE_KEY)).toBeNull();
    expect(speicher.getItem(PACKING_STORAGE_KEY)).toBe('alte-packliste');
    expect(speicher.getItem(BACKUP_TRANSACTION_KEY)).toBeNull();
  });

  it('meldet fehlenden Speicher, ohne einen Erfolg vorzutäuschen', () => {
    expect(ersetzeDurchSicherung(null, LEERER_EXPORT, '2026-09-16T11:00:00Z').ok).toBe(false);
  });
});
