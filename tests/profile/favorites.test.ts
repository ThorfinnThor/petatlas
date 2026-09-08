// M16-03 — Gemerkt werden Kennungen, keine Kopien.
import { describe, expect, it } from 'vitest';

import {
  FAVORITES_STORAGE_KEY,
  LEERE_MERKLISTE,
  MAX_EINTRAEGE,
  MerkEintragSchema,
  istGemerkt,
  lese,
  loeseAuf,
  merke,
  schreibe,
  vergiss,
  type MerkEintrag,
} from '../../src/features/profile/favorites.ts';

function ort(id = 'osm:node:1', zeit = '2026-09-08T10:00:00+00:00'): MerkEintrag {
  return {
    kind: 'place',
    id,
    coordinates: { latitude: 53.0758, longitude: 8.8072 },
    addedAt: zeit,
  };
}

function futter(id = 'synthetisch:trocken-1kg', zeit = '2026-09-08T11:00:00+00:00'): MerkEintrag {
  return { kind: 'food', id, coordinates: null, addedAt: zeit };
}

describe('Eintrag', () => {
  it('verlangt für einen Ort die Koordinate', () => {
    expect(MerkEintragSchema.safeParse({ ...ort(), coordinates: null }).success).toBe(false);
    expect(MerkEintragSchema.safeParse(futter()).success).toBe(true);
  });

  it('speichert keinen Namen und keinen Preis', () => {
    expect(Object.keys(ort()).sort()).toEqual(['addedAt', 'coordinates', 'id', 'kind']);
  });

  it('lehnt unbekannte Zusatzfelder ab', () => {
    expect(MerkEintragSchema.safeParse({ ...futter(), preis: 999 }).success).toBe(false);
  });
});

describe('Merken und Vergessen', () => {
  it('merkt einen Eintrag genau einmal', () => {
    const eins = merke(LEERE_MERKLISTE, futter());
    const zwei = merke(eins, futter('synthetisch:trocken-1kg', '2026-09-08T12:00:00+00:00'));
    expect(zwei.entries.length).toBe(1);
    expect(zwei.entries[0]?.addedAt).toBe('2026-09-08T12:00:00+00:00');
  });

  it('unterscheidet Orte und Futter mit gleicher Kennung', () => {
    const liste = merke(merke(LEERE_MERKLISTE, futter('x')), {
      ...ort('x'),
      addedAt: '2026-09-08T12:00:00+00:00',
    });
    expect(liste.entries.length).toBe(2);
  });

  it('vergisst gezielt', () => {
    const liste = merke(merke(LEERE_MERKLISTE, futter()), ort());
    const danach = vergiss(liste, 'food', 'synthetisch:trocken-1kg');
    expect(istGemerkt(danach, 'food', 'synthetisch:trocken-1kg')).toBe(false);
    expect(istGemerkt(danach, 'place', 'osm:node:1')).toBe(true);
  });

  it('lehnt einen ungültigen Eintrag ab, statt die Liste zu beschädigen', () => {
    const kaputt = { ...ort(), coordinates: null } as MerkEintrag;
    expect(merke(LEERE_MERKLISTE, kaputt)).toEqual(LEERE_MERKLISTE);
  });

  it('wächst nicht über die Grenze', () => {
    let liste = LEERE_MERKLISTE;
    for (let i = 0; i < MAX_EINTRAEGE + 10; i += 1) {
      const zeit = new Date(Date.UTC(2026, 0, 1, 0, 0, i)).toISOString().replace('Z', '+00:00');
      liste = merke(liste, futter(`futter-${i}`, zeit));
    }
    expect(liste.entries.length).toBe(MAX_EINTRAEGE);
    // Der älteste ist herausgefallen, der neueste ist da.
    expect(istGemerkt(liste, 'food', 'futter-0')).toBe(false);
    expect(istGemerkt(liste, 'food', `futter-${MAX_EINTRAEGE + 9}`)).toBe(true);
  });
});

describe('Lesen und Schreiben', () => {
  it('liest, was es geschrieben hat', () => {
    const liste = merke(LEERE_MERKLISTE, ort());
    expect(lese(schreibe(liste))).toEqual(liste);
  });

  it('kommt mit fehlendem und kaputtem Inhalt zurecht', () => {
    expect(lese(null)).toEqual(LEERE_MERKLISTE);
    expect(lese('{kein json')).toEqual(LEERE_MERKLISTE);
    expect(lese('42')).toEqual(LEERE_MERKLISTE);
  });

  it('behält die gültigen Einträge, wenn einer kaputt ist', () => {
    const roh = JSON.stringify({
      version: 1,
      entries: [
        futter(),
        { kind: 'place', id: 'ohne-koordinate', coordinates: null, addedAt: 'x' },
      ],
    });
    const gelesen = lese(roh);
    expect(gelesen.entries.length).toBe(1);
    expect(gelesen.entries[0]?.id).toBe('synthetisch:trocken-1kg');
  });

  it('benutzt einen eigenen Schlüssel, getrennt vom Profil', () => {
    expect(FAVORITES_STORAGE_KEY).toBe('petatlas.favorites.v1');
    expect(FAVORITES_STORAGE_KEY).not.toContain('profile');
  });
});

describe('Auflösen gegen aktuelle Daten', () => {
  it('liefert die aktuellen Daten, nicht die gemerkten', async () => {
    const aufgeloest = await loeseAuf(futter(), () => ({ name: 'Aktueller Name' }));
    expect(aufgeloest.stand).toBe('vorhanden');
    expect(aufgeloest.daten).toEqual({ name: 'Aktueller Name' });
  });

  it('meldet einen verschwundenen Eintrag, statt alte Daten zu zeigen', async () => {
    const aufgeloest = await loeseAuf(futter(), () => null);
    expect(aufgeloest.stand).toBe('verschwunden');
    expect(aufgeloest.daten).toBeNull();
    expect(aufgeloest.hinweis).toContain('kein alter Preis');
  });

  it('behandelt einen Fehler beim Nachschlagen wie ein Verschwinden', async () => {
    const aufgeloest = await loeseAuf(ort(), () => {
      throw new Error('Netz weg');
    });
    expect(aufgeloest.stand).toBe('verschwunden');
  });
});
