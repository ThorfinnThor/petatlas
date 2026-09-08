// M20-03 — Kommunale Flächen auf der Stadtseite: sichtbar, benannt, begrenzt.
import { describe, expect, it } from 'vitest';

import {
  ART_LABEL,
  kommunaleFlaechen,
  staedteMitKommunalerQuelle,
} from '../../src/features/map/municipal.ts';

describe('kommunaleFlaechen', () => {
  it('liefert für eine Stadt ohne kommunale Quelle null statt einer leeren Liste', () => {
    // `null` heißt „nicht erfasst“. Eine leere Liste würde behaupten, es gebe
    // dort keine ausgewiesenen Flächen.
    expect(kommunaleFlaechen('koeln')).toBeNull();
    expect(kommunaleFlaechen('gibt-es-nicht')).toBeNull();
  });

  it('zeigt die Hamburger Auslaufzonen mit Pflichtangabe zur Lizenz', () => {
    const hamburg = kommunaleFlaechen('hamburg');
    expect(hamburg).not.toBeNull();
    expect(hamburg?.flaechen).toHaveLength(140);
    expect(hamburg?.freilauf).toBe(140);
    expect(hamburg?.verbot).toBe(0);
    // dl-de/by-2-0 verlangt die Namensnennung — sie muss an der Anzeige
    // verfügbar sein, nicht nur in der Konfiguration.
    expect(hamburg?.licenseId).toBe('dl-de/by-2-0');
    expect(hamburg?.attribution.length ?? 0).toBeGreaterThan(0);
    expect(hamburg?.attributionUrl.startsWith('https://')).toBe(true);
  });

  it('nennt den Geltungsbereich, damit Schweigen nicht als Verbot gelesen wird', () => {
    const hamburg = kommunaleFlaechen('hamburg');
    expect(hamburg?.geltung).toContain('weder erlaubt noch verboten');
  });

  it('zeigt Berliner Freilaufflächen und Verbote getrennt', () => {
    const berlin = kommunaleFlaechen('berlin');
    expect(berlin?.freilauf).toBe(22);
    expect(berlin?.verbot).toBe(8);
    expect((berlin?.freilauf ?? 0) + (berlin?.verbot ?? 0)).toBe(berlin?.flaechen.length);
  });

  it('sortiert nach Bezeichnung und stellt unbenannte Flächen ans Ende', () => {
    const hamburg = kommunaleFlaechen('hamburg');
    const namen = (hamburg?.flaechen ?? []).map((flaeche) => flaeche.name);
    const ersteLeere = namen.indexOf(null);
    if (ersteLeere !== -1) {
      expect(namen.slice(ersteLeere).every((name) => name === null)).toBe(true);
    }
    const benannt = namen.filter((name): name is string => name !== null);
    const sortiert = [...benannt].sort((a, b) => a.localeCompare(b, 'de'));
    expect(benannt).toEqual(sortiert);
  });

  it('liefert bei wiederholtem Aufruf dasselbe Ergebnis', () => {
    expect(kommunaleFlaechen('berlin')).toBe(kommunaleFlaechen('berlin'));
  });
});

describe('ART_LABEL', () => {
  it('formuliert die Erlaubnis als Aussage der Verwaltung, nicht als Empfehlung', () => {
    expect(ART_LABEL.dog_off_leash).toBe('Hunde dürfen frei laufen');
    expect(ART_LABEL.dog_prohibited).toBe('Hunde dürfen nicht mitgenommen werden');
  });
});

describe('staedteMitKommunalerQuelle', () => {
  it('nennt genau die Städte, für die ein Snapshot vorliegt', () => {
    expect(staedteMitKommunalerQuelle()).toEqual(['berlin', 'hamburg']);
  });
});
