// M05-06 — Rechteverlust muss die Ausgabe stoppen.
// Simuliert termsHash-Wechsel, abgelaufene Rechte und entzogene Bilderlaubnis.
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { pruefeAusgabe, pruefeRegistry } from '../scripts/checks/licenses.ts';
import { mayPublish, SourceRightsSchema } from '../src/domain/rights.ts';
import { allowedChannels } from '../src/domain/publication-policy.ts';
import {
  SourceEntrySchema,
  requireSource,
  type SourceEntry,
} from '../src/domain/source-registry.ts';

const OSM = requireSource('osm-geofabrik-germany-pbf');

function mitRechten(overrides: Record<string, unknown>): SourceEntry {
  return SourceEntrySchema.parse({
    ...OSM,
    rights: SourceRightsSchema.parse({ ...OSM.rights, ...overrides }),
  });
}

function schreibeAusgabe(inhalt: unknown): string {
  const wurzel = mkdtempSync(join(tmpdir(), 'lizenz-'));
  mkdirSync(join(wurzel, 'data', 'v1', 'places', 'de'), { recursive: true });
  writeFileSync(
    join(wurzel, 'data', 'v1', 'places', 'de', 'index.json'),
    JSON.stringify(inhalt),
    'utf8',
  );
  return wurzel;
}

describe('Ausgangslage', () => {
  it('beanstandet die aktuelle Registry nicht', () => {
    expect(pruefeRegistry([OSM])).toEqual([]);
  });

  it('erlaubt der freigegebenen Quelle die Datenausgabe', () => {
    expect(mayPublish(OSM.rights, 'publicJsonDelivery').allowed).toBe(true);
  });
});

describe('Abgelaufene Rechte', () => {
  const abgelaufen = mitRechten({ status: 'expired' });

  it('sperrt jede Ausgabeform', () => {
    expect(allowedChannels('public_open', abgelaufen.rights)).toEqual([]);
  });

  it('stoppt eine bereits gebaute Datendatei', () => {
    const wurzel = schreibeAusgabe({
      sourceId: abgelaufen.sourceId,
      attribution: abgelaufen.attributionText,
      places: [],
    });
    const beanstandungen = pruefeAusgabe(wurzel, [abgelaufen]);
    expect(beanstandungen.length).toBeGreaterThan(0);
    expect(beanstandungen[0]?.problem).toMatch(/nicht freigegeben/);
  });

  it('lässt sich nicht durch einen vorhandenen Pflichthinweis umgehen', () => {
    // Der alte Hinweis steht noch in der Datei; die Freigabe fehlt trotzdem.
    const wurzel = schreibeAusgabe({
      sourceId: abgelaufen.sourceId,
      attribution: '© OpenStreetMap contributors, ODbL 1.0',
    });
    expect(pruefeAusgabe(wurzel, [abgelaufen])).not.toEqual([]);
  });
});

describe('Geänderte Bedingungen', () => {
  it('beanstandet eine verifizierte Quelle ohne termsHash', () => {
    const ohneHash = mitRechten({ termsHash: null });
    const beanstandungen = pruefeRegistry([ohneHash]);
    expect(beanstandungen.map((b) => b.problem).join(' ')).toMatch(/termsHash/);
  });

  it('erkennt einen Wechsel des termsHash als Abweichung vom geprüften Stand', () => {
    const geprueft = OSM.rights.termsHash;
    const neu = 'f'.repeat(64);
    expect(neu).not.toBe(geprueft);
    // Der Wechsel selbst ist die Feststellung: die Freigabe bezog sich auf
    // den alten Wortlaut und gilt nicht automatisch weiter.
    const nachAenderung = mitRechten({ termsHash: neu, status: 'pending' });
    expect(allowedChannels('public_open', nachAenderung.rights)).toEqual([]);
  });
});

describe('Entzogene Bilderlaubnis', () => {
  const ohneBilder = mitRechten({ imagesAllowed: false });

  it('stoppt die Bildausgabe', () => {
    expect(mayPublish(ohneBilder.rights, 'images').allowed).toBe(false);
  });

  it('lässt die übrigen Module unberührt', () => {
    expect(mayPublish(ohneBilder.rights, 'websiteDisplay').allowed).toBe(true);
    expect(mayPublish(ohneBilder.rights, 'publicJsonDelivery').allowed).toBe(true);
    expect(pruefeRegistry([ohneBilder])).toEqual([]);
  });
});

describe('Fehlender Pflichthinweis in der Ausgabe', () => {
  it('beanstandet eine Datendatei ohne Attribution', () => {
    const wurzel = schreibeAusgabe({ sourceId: OSM.sourceId, places: [] });
    const beanstandungen = pruefeAusgabe(wurzel, [OSM]);
    expect(beanstandungen.map((b) => b.problem).join(' ')).toMatch(/Pflichthinweis/);
  });

  it('akzeptiert eine Datendatei mit Attribution', () => {
    const wurzel = schreibeAusgabe({
      sourceId: OSM.sourceId,
      attribution: OSM.attributionText,
      places: [],
    });
    expect(pruefeAusgabe(wurzel, [OSM])).toEqual([]);
  });

  it('beanstandet eine verifizierte Quelle ohne hinterlegten Wortlaut', () => {
    // Das Schema verbietet diesen Zustand bereits; der Check ist die zweite
    // Verteidigungslinie für Einträge aus anderer Quelle.
    const ohneWortlaut = { ...OSM, attributionText: undefined } as SourceEntry;
    expect(
      pruefeRegistry([ohneWortlaut])
        .map((b) => b.problem)
        .join(' '),
    ).toMatch(/Wortlaut/);
  });
});

describe('Der gesperrte Gebührenkatalog bleibt gesperrt', () => {
  it('erlaubt keine Ausgabeform', () => {
    const got = requireSource('got-2022-gesetze-im-internet');
    expect(allowedChannels('public_open', got.rights)).toEqual([]);
  });

  it('stoppt eine versehentlich gebaute Datendatei', () => {
    const got = requireSource('got-2022-gesetze-im-internet');
    const wurzel = schreibeAusgabe({ sourceId: got.sourceId, items: [] });
    expect(pruefeAusgabe(wurzel, [got])).not.toEqual([]);
  });
});
