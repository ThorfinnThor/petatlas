// M11-03 — Standort: nur auf Aktion, nie gespeichert, nie gesendet.
import { describe, expect, it, vi } from 'vitest';

import {
  STANDORT_TEXTE,
  frageStandort,
  standortLabel,
} from '../../src/features/map/geolocation.ts';

function dienst(
  verhalten: (erfolg: PositionCallback, fehler: PositionErrorCallback) => void,
): Geolocation {
  return {
    getCurrentPosition: (erfolg, fehler) => verhalten(erfolg, fehler as PositionErrorCallback),
    watchPosition: () => {
      throw new Error('watchPosition darf nicht verwendet werden.');
    },
    clearWatch: () => undefined,
  } as unknown as Geolocation;
}

function position(latitude: number, longitude: number, accuracy: number): GeolocationPosition {
  return {
    coords: { latitude, longitude, accuracy } as GeolocationCoordinates,
    timestamp: Date.now(),
  } as GeolocationPosition;
}

function fehlerMit(code: number): GeolocationPositionError {
  return {
    code,
    message: '',
    PERMISSION_DENIED: 1,
    POSITION_UNAVAILABLE: 2,
    TIMEOUT: 3,
  } as GeolocationPositionError;
}

describe('Erfolgsfall', () => {
  it('gibt Koordinaten und Genauigkeit zurück', async () => {
    const ergebnis = await frageStandort({
      geolocation: dienst((erfolg) => erfolg(position(53.1, 8.8, 42.4))),
    });
    expect(ergebnis).toEqual({
      art: 'ok',
      latitude: 53.1,
      longitude: 8.8,
      genauigkeitMeter: 42,
    });
  });

  it('fragt genau einmal ab, nicht dauerhaft', async () => {
    const getCurrentPosition = vi.fn((erfolg: PositionCallback) => erfolg(position(53, 8, 10)));
    const watchPosition = vi.fn();
    await frageStandort({
      geolocation: {
        getCurrentPosition,
        watchPosition,
        clearWatch: vi.fn(),
      } as unknown as Geolocation,
    });
    expect(getCurrentPosition).toHaveBeenCalledTimes(1);
    expect(watchPosition).not.toHaveBeenCalled();
  });

  it('verlangt einen frischen Wert statt eines zwischengespeicherten', async () => {
    const getCurrentPosition = vi.fn((erfolg: PositionCallback) => erfolg(position(53, 8, 10)));
    await frageStandort({
      geolocation: {
        getCurrentPosition,
        watchPosition: vi.fn(),
        clearWatch: vi.fn(),
      } as unknown as Geolocation,
    });
    const optionen = getCurrentPosition.mock.calls[0]?.[2] as PositionOptions | undefined;
    expect(optionen?.maximumAge).toBe(0);
  });
});

describe('Ablehnung und Ausfall sind normale Ergebnisse', () => {
  it('behandelt eine Ablehnung freundlich und ohne Wiederholung', async () => {
    const ergebnis = await frageStandort({
      geolocation: dienst((_erfolg, fehler) => fehler(fehlerMit(1))),
    });
    expect(ergebnis.art).toBe('abgelehnt');
    expect(ergebnis.art === 'abgelehnt' && ergebnis.text).toBe(STANDORT_TEXTE.abgelehnt);
    expect(STANDORT_TEXTE.abgelehnt).toMatch(/Das ist in Ordnung/);
  });

  it('behandelt eine Zeitüberschreitung als eigenen Fall', async () => {
    const ergebnis = await frageStandort({
      geolocation: dienst((_erfolg, fehler) => fehler(fehlerMit(3))),
    });
    expect(ergebnis.art).toBe('zeitueberschreitung');
  });

  it('behandelt einen nicht verfügbaren Standort als eigenen Fall', async () => {
    const ergebnis = await frageStandort({
      geolocation: dienst((_erfolg, fehler) => fehler(fehlerMit(2))),
    });
    expect(ergebnis.art).toBe('nicht_verfuegbar');
  });

  it('kommt ohne Geolocation-Dienst zurecht', async () => {
    const ergebnis = await frageStandort({ geolocation: undefined });
    expect(['nicht_verfuegbar', 'ok']).toContain(ergebnis.art);
  });

  it('bietet in jedem Fehlerfall den Weg über die Ortseingabe an', () => {
    for (const text of [
      STANDORT_TEXTE.abgelehnt,
      STANDORT_TEXTE.nichtVerfuegbar,
      STANDORT_TEXTE.zeitueberschreitung,
    ]) {
      expect(text).toMatch(/geben Sie einen Ort ein|Geben Sie einen Ort ein/);
    }
  });
});

describe('Beschriftung', () => {
  it('nennt den Standort ungefähr, nicht als Gemeinde', () => {
    expect(standortLabel(50)).toBe('Ihr ungefährer Standort (±50 m)');
    expect(standortLabel(null)).toBe('Ihr ungefährer Standort');
  });

  it('sagt vorher, dass nichts gespeichert oder übertragen wird', () => {
    expect(STANDORT_TEXTE.hinweisVorher).toMatch(/nicht gespeichert/);
    expect(STANDORT_TEXTE.hinweisVorher).toMatch(/nicht übertragen/);
  });
});
