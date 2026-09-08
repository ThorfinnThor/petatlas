// M17-05 — Ein Monitor, der nie Alarm schlägt, ist kein Monitor. Deshalb
// wird hier vor allem geprüft, dass er es tut: fehlende Seite, falsche
// Seite, stehen gebliebener Build, veraltete Daten.
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  HEALTH_PFAD,
  MANIFEST_PFAD,
  PFLICHTSEITEN,
  alsText,
  dateiLeser,
  httpLeser,
  pruefe,
  type Leser,
} from '../../scripts/monitor/smoke.ts';

const JETZT = '2026-09-08T12:00:00.000Z';

interface HealthEingabe {
  readonly builtAt?: string;
  readonly veraltet?: readonly string[];
  readonly unbekannt?: readonly string[];
  readonly gesperrt?: readonly string[];
}

function health(eingabe: HealthEingabe = {}): string {
  return JSON.stringify({
    healthVersion: 1,
    builtAt: eingabe.builtAt ?? '2026-09-08T09:00:00.000Z',
    stichtag: '2026-09-08',
    gesamt: { frische: 'frisch', gesperrt: eingabe.gesperrt ?? [], begruendung: '' },
    datensaetze: [
      ...(eingabe.veraltet ?? []).map((id) => ({ id, frische: 'veraltet', ausgeliefert: true })),
      ...(eingabe.unbekannt ?? []).map((id) => ({ id, frische: 'unbekannt', ausgeliefert: true })),
      { id: 'heil', frische: 'frisch', ausgeliefert: true },
    ],
  });
}

function leser(
  ueberschreibung: Record<string, { text: string; status: number } | null> = {},
  gesundheit = health(),
): Leser {
  const standard: Record<string, { text: string; status: number }> = {
    [MANIFEST_PFAD]: { text: '{}', status: 200 },
    [HEALTH_PFAD]: { text: gesundheit, status: 200 },
  };
  for (const seite of PFLICHTSEITEN) {
    standard[seite.pfad] = { text: `<html>${seite.marker}…</html>`, status: 200 };
  }
  return async (pfad: string) =>
    pfad in ueberschreibung ? ueberschreibung[pfad]! : (standard[pfad] ?? null);
}

describe('Alles in Ordnung', () => {
  it('meldet keinen Fehler, wenn alles da und aktuell ist', async () => {
    const ergebnis = await pruefe(leser(), JETZT);
    expect(ergebnis.fehler).toBe(0);
    expect(ergebnis.warnungen).toBe(0);
  });

  it('prüft jede Pflichtseite', async () => {
    const ergebnis = await pruefe(leser(), JETZT);
    for (const seite of PFLICHTSEITEN) {
      expect(ergebnis.pruefungen.some((eintrag) => eintrag.name.includes(seite.pfad))).toBe(true);
    }
  });
});

describe('Ausfall', () => {
  it('schlägt bei einer fehlenden Seite Alarm', async () => {
    const ergebnis = await pruefe(leser({ '/de-de/impressum/': null }), JETZT);
    expect(ergebnis.fehler).toBe(1);
    expect(alsText(ergebnis)).toContain('/de-de/impressum/');
  });

  it('schlägt bei einer Fehlerseite Alarm', async () => {
    const ergebnis = await pruefe(leser({ '/de-de/': { text: '', status: 503 } }), JETZT);
    expect(ergebnis.fehler).toBe(1);
    expect(alsText(ergebnis)).toContain('503');
  });

  it('hält eine fremde Seite unter der richtigen Adresse nicht für in Ordnung', async () => {
    const ergebnis = await pruefe(
      leser({ '/de-de/datenstand/': { text: '<html>Parkplatz</html>', status: 200 } }),
      JETZT,
    );
    expect(ergebnis.fehler).toBe(1);
    expect(alsText(ergebnis)).toContain('nicht die erwartete');
  });

  it('schlägt Alarm, wenn der Gesundheitsstand fehlt', async () => {
    const ergebnis = await pruefe(leser({ [HEALTH_PFAD]: null }), JETZT);
    expect(ergebnis.fehler).toBe(1);
    expect(alsText(ergebnis)).toContain('kein Datenstand prüfbar');
  });

  it('schlägt Alarm, wenn der Gesundheitsstand kein JSON ist', async () => {
    const ergebnis = await pruefe(
      leser({ [HEALTH_PFAD]: { text: '<html>Fehler</html>', status: 200 } }),
      JETZT,
    );
    expect(ergebnis.fehler).toBe(1);
  });

  it('meldet einen Abrufabbruch als Fehler statt zu werfen', async () => {
    const kaputt: Leser = async () => {
      throw new Error('fetch failed', { cause: new Error('ECONNREFUSED') });
    };
    const ergebnis = await pruefe(kaputt, JETZT);
    expect(ergebnis.fehler).toBeGreaterThan(0);
    expect(alsText(ergebnis)).toContain('ECONNREFUSED');
  });
});

describe('Überalterung', () => {
  it('schlägt bei einem stehen gebliebenen Deployment Alarm', async () => {
    const ergebnis = await pruefe(
      leser({}, health({ builtAt: '2026-09-01T09:00:00.000Z' })),
      JETZT,
    );
    expect(ergebnis.fehler).toBe(1);
    expect(alsText(ergebnis)).toContain('Stunden alt');
  });

  it('lässt einen Build knapp unter der Grenze durchgehen', async () => {
    const ergebnis = await pruefe(
      leser({}, health({ builtAt: '2026-09-06T13:00:00.000Z' })),
      JETZT,
    );
    expect(ergebnis.fehler).toBe(0);
  });

  it('schlägt bei veralteten Daten Alarm', async () => {
    const ergebnis = await pruefe(leser({}, health({ veraltet: ['gebuehren-got'] })), JETZT);
    expect(ergebnis.fehler).toBe(1);
    expect(alsText(ergebnis)).toContain('gebuehren-got');
  });

  it('warnt bei unbekanntem Alter, ohne den Lauf rot zu machen', async () => {
    const ergebnis = await pruefe(leser({}, health({ unbekannt: ['orte-osm'] })), JETZT);
    expect(ergebnis.fehler).toBe(0);
    expect(ergebnis.warnungen).toBe(1);
  });

  it('hält einen bekannten gesperrten Datensatz nicht für einen Ausfall', async () => {
    const ergebnis = await pruefe(leser({}, health({ gesperrt: ['reiseregeln'] })), JETZT);
    expect(ergebnis.fehler).toBe(0);
    expect(alsText(ergebnis)).toContain('kein Ausfall');
  });

  it('schlägt Alarm, wenn kein Bauzeitpunkt dasteht', async () => {
    const ohneZeit = JSON.stringify({ gesamt: { gesperrt: [] }, datensaetze: [] });
    const ergebnis = await pruefe(leser({}, ohneZeit), JETZT);
    expect(alsText(ergebnis)).toContain('keinen lesbaren Bauzeitpunkt');
    expect(ergebnis.fehler).toBe(1);
  });
});

describe('Leser', () => {
  // Ein eigenes kleines Verzeichnis, kein `dist`: ein Unit-Test darf nicht
  // davon abhängen, dass vorher jemand gebaut hat. In der CI läuft er vor
  // dem Build.
  const wurzel = mkdtempSync(join(tmpdir(), 'smoke-'));
  mkdirSync(join(wurzel, 'de-de'), { recursive: true });
  writeFileSync(join(wurzel, 'de-de', 'index.html'), '<html>Start</html>', 'utf8');

  it('macht aus einem Verzeichnispfad eine index.html', async () => {
    const inhalt = await dateiLeser(wurzel)('/de-de/');
    expect(inhalt?.text).toContain('<html');
  });

  it('meldet eine fehlende Datei als nicht vorhanden statt zu werfen', async () => {
    expect(await dateiLeser(wurzel)('/gibt-es-nicht/')).toBeNull();
  });

  it('ruft nichts über http ab', async () => {
    await expect(httpLeser('http://beispiel.invalid/')('/de-de/')).rejects.toThrow('Nur https');
  });
});
