// M16-02 — Speichern ist eine Handlung, Löschen auch. Fehlschläge sind Ergebnisse.
import { describe, expect, it } from 'vitest';

import { PetProfileSchema, PROFILE_STORAGE_KEY } from '../src/domain/schemas/profile.ts';
import {
  SPEICHER_VERSION,
  lade,
  loesche,
  migriere,
  speichere,
  type Speicher,
} from '../src/features/profile/storage.ts';

const PROFIL = PetProfileSchema.parse({
  profileId: '00000000-0000-4000-8000-000000000000',
  schemaVersion: 1,
  species: 'dog',
  displayName: 'Bello',
  birthDate: '2020-05-01',
  weightGrams: 20_000,
  breed: 'Mischling',
});

/** Speicher im Arbeitsspeicher — mit den Fehlern, die echte Browser machen. */
function speicherAttrappe(optionen: { voll?: boolean; kaputt?: boolean } = {}): Speicher & {
  inhalt: Map<string, string>;
} {
  const inhalt = new Map<string, string>();
  return {
    inhalt,
    getItem: (schluessel) => inhalt.get(schluessel) ?? null,
    setItem: (schluessel, wert) => {
      if (optionen.voll === true) {
        const fehler = new Error('quota exceeded');
        fehler.name = 'QuotaExceededError';
        throw fehler;
      }
      if (optionen.kaputt === true) throw new Error('Speicher abgeschaltet');
      inhalt.set(schluessel, wert);
    },
    removeItem: (schluessel) => {
      inhalt.delete(schluessel);
    },
  };
}

describe('Speichern', () => {
  it('legt einen versionierten Stand ab', () => {
    const speicher = speicherAttrappe();
    const ergebnis = speichere(speicher, PROFIL, ['futter'], '2026-09-08T10:00:00+00:00');
    expect(ergebnis.ok).toBe(true);
    expect(ergebnis.wert?.version).toBe(SPEICHER_VERSION);
    const roh = JSON.parse(speicher.inhalt.get(PROFILE_STORAGE_KEY) as string) as Record<
      string,
      unknown
    >;
    expect(roh.version).toBe(SPEICHER_VERSION);
    expect(roh.savedAt).toBe('2026-09-08T10:00:00+00:00');
  });

  it('speichert nur bekannte Interessen', () => {
    const speicher = speicherAttrappe();
    const ergebnis = speichere(
      speicher,
      PROFIL,
      ['futter', 'unbekannt'],
      '2026-09-08T10:00:00+00:00',
    );
    expect(ergebnis.wert?.interests).toEqual(['futter']);
  });

  it('meldet ein volles Kontingent, statt zu werfen', () => {
    const ergebnis = speichere(
      speicherAttrappe({ voll: true }),
      PROFIL,
      [],
      '2026-09-08T10:00:00+00:00',
    );
    expect(ergebnis.ok).toBe(false);
    expect(ergebnis.fehler).toBe('kontingent');
    expect(ergebnis.meldung).toContain('voll');
  });

  it('meldet einen abgeschalteten Speicher, statt zu werfen', () => {
    const ergebnis = speichere(
      speicherAttrappe({ kaputt: true }),
      PROFIL,
      [],
      '2026-09-08T10:00:00+00:00',
    );
    expect(ergebnis.ok).toBe(false);
    expect(ergebnis.fehler).toBe('kein_speicher');
  });

  it('kommt ohne Speicher zurecht', () => {
    const ergebnis = speichere(null, PROFIL, [], '2026-09-08T10:00:00+00:00');
    expect(ergebnis.ok).toBe(false);
    expect(ergebnis.meldung).toContain('privaten Modus');
  });
});

describe('Laden', () => {
  it('liest einen gespeicherten Stand zurück', () => {
    const speicher = speicherAttrappe();
    speichere(speicher, PROFIL, ['futter', 'orte'], '2026-09-08T10:00:00+00:00');
    const ergebnis = lade(speicher);
    expect(ergebnis.ok).toBe(true);
    expect(ergebnis.wert?.profile.displayName).toBe('Bello');
    expect(ergebnis.wert?.interests).toEqual(['futter', 'orte']);
  });

  it('meldet einen leeren Speicher als leer, nicht als Fehler', () => {
    const ergebnis = lade(speicherAttrappe());
    expect(ergebnis.ok).toBe(false);
    expect(ergebnis.fehler).toBeNull();
    expect(ergebnis.meldung).toContain('Kein gespeicherter Stand');
  });

  it('verwirft unlesbaren Inhalt', () => {
    const speicher = speicherAttrappe();
    speicher.inhalt.set(PROFILE_STORAGE_KEY, '{kein json');
    expect(lade(speicher).fehler).toBe('unlesbar');
  });

  it('verwirft einen Stand, der nicht zum Schema passt', () => {
    const speicher = speicherAttrappe();
    speicher.inhalt.set(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ version: SPEICHER_VERSION, profile: { species: 'dog' }, interests: [] }),
    );
    expect(lade(speicher).fehler).toBe('ungueltig');
  });

  it('liest einen Stand aus einer fremden Fassung nicht halb', () => {
    const speicher = speicherAttrappe();
    speicher.inhalt.set(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ version: 99, profile: PROFIL, interests: ['futter'] }),
    );
    const ergebnis = lade(speicher);
    expect(ergebnis.fehler).toBe('fremde_fassung');
    expect(ergebnis.wert).toBeNull();
  });

  it('verwirft eingeschmuggelte Interessen', () => {
    const speicher = speicherAttrappe();
    speicher.inhalt.set(
      PROFILE_STORAGE_KEY,
      JSON.stringify({
        version: SPEICHER_VERSION,
        profile: PROFIL,
        interests: ['futter', '__proto__', { boese: true }],
        savedAt: '2026-09-08T10:00:00+00:00',
      }),
    );
    expect(lade(speicher).wert?.interests).toEqual(['futter']);
  });
});

describe('Migration', () => {
  it('hebt Fassung 1 auf die aktuelle und erfindet keine Interessen', () => {
    const alt = { version: 1, profile: PROFIL, savedAt: '2026-01-01T00:00:00+00:00' };
    const neu = migriere(alt) as Record<string, unknown>;
    expect(neu.version).toBe(2);
    expect(neu.interests).toEqual([]);
  });

  it('lässt einen aktuellen Stand unverändert', () => {
    const stand = { version: SPEICHER_VERSION, profile: PROFIL, interests: ['futter'] };
    expect(migriere(stand)).toEqual(stand);
  });

  it('wird beim Laden angewandt', () => {
    const speicher = speicherAttrappe();
    speicher.inhalt.set(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ version: 1, profile: PROFIL, savedAt: '2026-01-01T00:00:00+00:00' }),
    );
    const ergebnis = lade(speicher);
    expect(ergebnis.ok).toBe(true);
    expect(ergebnis.wert?.interests).toEqual([]);
  });
});

describe('Löschen', () => {
  it('entfernt den Stand vollständig', () => {
    const speicher = speicherAttrappe();
    speichere(speicher, PROFIL, ['futter'], '2026-09-08T10:00:00+00:00');
    expect(loesche(speicher).ok).toBe(true);
    expect(speicher.inhalt.size).toBe(0);
    expect(lade(speicher).wert).toBeNull();
  });

  it('kommt ohne Speicher zurecht', () => {
    expect(loesche(null).ok).toBe(false);
  });
});

describe('Kein serverseitiges Profil', () => {
  it('benutzt genau einen Schlüssel und keinen zweiten Ablageort', () => {
    const speicher = speicherAttrappe();
    speichere(speicher, PROFIL, ['futter'], '2026-09-08T10:00:00+00:00');
    expect([...speicher.inhalt.keys()]).toEqual([PROFILE_STORAGE_KEY]);
  });

  it('schreibt keine Kennung, die anderswo etwas bedeutet', () => {
    const speicher = speicherAttrappe();
    speichere(speicher, PROFIL, [], '2026-09-08T10:00:00+00:00');
    const roh = speicher.inhalt.get(PROFILE_STORAGE_KEY) as string;
    // Die Profil-ID ist lokal erzeugt und wird nirgends registriert.
    expect(roh).toContain('00000000-0000-4000-8000-000000000000');
    expect(roh).not.toMatch(/token|session|userId|clientId/i);
  });
});
