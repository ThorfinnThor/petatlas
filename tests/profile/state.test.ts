// M16-01 — Ein leeres Profil ist gültig, und nichts davon verlässt das Gerät.
import { describe, expect, it } from 'vitest';

import { PetProfileSchema } from '../../src/domain/schemas/profile.ts';
import {
  INTERESSEN,
  LEERER_ENTWURF,
  alsProfil,
  bereinigeInteressen,
  bewerte,
  gewichtInGramm,
  type ProfilEntwurf,
} from '../../src/features/profile/state.ts';

const VOLLSTAENDIG: ProfilEntwurf = {
  species: 'dog',
  displayName: 'Bello',
  birthDate: '2020-05-01',
  weightGrams: 20_000,
  breed: 'Mischling',
  interests: ['futter', 'orte'],
};

describe('Entwurf', () => {
  it('ist leer zulässig und meldet, was fehlt', () => {
    const zustand = bewerte(LEERER_ENTWURF);
    expect(zustand.gueltig).toBe(false);
    expect(zustand.offen.length).toBeGreaterThan(0);
    expect(zustand.offen.join(' ')).toContain('Tierart');
  });

  it('ist mit Tierart und Rufname gültig — mehr braucht es nicht', () => {
    const knapp = { ...LEERER_ENTWURF, species: 'cat', displayName: 'Mira' };
    expect(bewerte(knapp).gueltig).toBe(true);
  });

  it('sagt bei fehlendem Gewicht, dass nicht gefiltert wird', () => {
    expect(bewerte({ ...VOLLSTAENDIG, weightGrams: null }).offen.join(' ')).toContain(
      'nichts wegen der Größe',
    );
  });
});

describe('Gewicht', () => {
  it('liest Kilogramm mit Komma und Punkt', () => {
    expect(gewichtInGramm('20')).toBe(20_000);
    expect(gewichtInGramm('4,5')).toBe(4500);
    expect(gewichtInGramm('0.25')).toBe(250);
  });

  it('lehnt Unsinn ab, statt zu raten', () => {
    for (const text of ['', 'schwer', '-5', '0', '500', 'ca. 20']) {
      expect(gewichtInGramm(text), text).toBeNull();
    }
  });
});

describe('Profil', () => {
  it('entsteht nur aus einem gültigen Entwurf', () => {
    expect(alsProfil(LEERER_ENTWURF)).toBeNull();
    const profil = alsProfil(VOLLSTAENDIG, '00000000-0000-4000-8000-000000000000');
    expect(profil).not.toBeNull();
    expect(PetProfileSchema.safeParse(profil).success).toBe(true);
  });

  it('enthält kein Feld, das eine Person identifiziert', () => {
    const profil = alsProfil(VOLLSTAENDIG, '00000000-0000-4000-8000-000000000000');
    const felder = Object.keys(profil ?? {});
    for (const verboten of ['email', 'address', 'phone', 'ownerName', 'postalCode']) {
      expect(felder, verboten).not.toContain(verboten);
    }
    expect(felder.sort()).toEqual(
      [
        'birthDate',
        'breed',
        'displayName',
        'profileId',
        'schemaVersion',
        'species',
        'weightGrams',
      ].sort(),
    );
  });

  it('kürzt einen zu langen Rufnamen, statt ihn abzulehnen', () => {
    const lang = { ...VOLLSTAENDIG, displayName: 'x'.repeat(80) };
    expect(alsProfil(lang, '00000000-0000-4000-8000-000000000000')?.displayName.length).toBe(40);
  });

  it('macht aus einer leeren Rasse null', () => {
    const ohne = { ...VOLLSTAENDIG, breed: '   ' };
    expect(alsProfil(ohne, '00000000-0000-4000-8000-000000000000')?.breed).toBeNull();
  });
});

describe('Interessen', () => {
  it('nimmt nur bekannte Werte an', () => {
    expect(bereinigeInteressen(['futter', 'unbekannt', 'reise'])).toEqual(['futter', 'reise']);
    expect(bereinigeInteressen(['__proto__', 'constructor'])).toEqual([]);
  });

  it('bietet nur eine feste Liste an, keine Freitexte', () => {
    expect(Object.keys(INTERESSEN).sort()).toEqual(
      ['futter', 'orte', 'pflege', 'reise', 'spielzeug'].sort(),
    );
  });
});
