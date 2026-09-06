// M08-03 — Eine ungeprüfte Vorlage darf keine Gesamtschätzung ergeben.
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { extrahiereXml, normalizeGot, parseGotXml } from '../../scripts/ingest/adapters/got.ts';
import type { FetchedResource } from '../../scripts/ingest/types.ts';
import { CostScenarioSchema } from '../../src/domain/schemas/costs.ts';
import { CostError } from '../../src/features/costs/engine.ts';
import {
  allScenarios,
  approvedScenarios,
  estimateScenario,
  getScenario,
} from '../../src/features/costs/scenarios.ts';

const ARCHIV = new Uint8Array(
  readFileSync(new URL('../fixtures/got/got_2022.xml.zip', import.meta.url)),
);

const RESSOURCE: FetchedResource = {
  sourceId: 'got-2022-gesetze-im-internet',
  url: 'https://www.gesetze-im-internet.de/got_2022/xml.zip',
  body: ARCHIV,
  contentType: 'application/zip',
  contentHash: 'a'.repeat(64),
  retrievedAt: '2026-09-06T10:00:00+00:00',
  etag: null,
  lastModified: null,
};

const KATALOG = normalizeGot(parseGotXml(extrahiereXml(ARCHIV).inhalt), {
  resource: RESSOURCE,
}).items;

describe('Nur einfache, geprüfte Vorlagen', () => {
  it('lädt ausschließlich schema-valide Szenarien', () => {
    expect(allScenarios().length).toBeGreaterThan(0);
    for (const szenario of allScenarios()) {
      expect(CostScenarioSchema.safeParse(szenario).success, szenario.scenarioId).toBe(true);
    }
  });

  it('enthält im Startzustand kein freigegebenes Szenario', () => {
    expect(approvedScenarios()).toEqual([]);
  });

  it('hält jedes Szenario klein und abgrenzbar', () => {
    for (const szenario of allScenarios()) {
      // Eine Vorlage mit vielen situationsabhängigen Positionen würde eine
      // Genauigkeit vortäuschen, die es nicht gibt.
      expect(szenario.lines.length, szenario.scenarioId).toBeLessThanOrEqual(5);
      expect(szenario.exclusions.length, szenario.scenarioId).toBeGreaterThan(0);
    }
  });

  it('verweist nur auf Positionen, die es im Katalog gibt', () => {
    const ids = new Set(KATALOG.map((item) => item.officialItemId));
    for (const szenario of allScenarios()) {
      for (const zeile of szenario.lines) {
        expect(
          ids.has(zeile.officialItemId),
          `${szenario.scenarioId}/${zeile.officialItemId}`,
        ).toBe(true);
      }
    }
  });
});

describe('Ohne Freigabe keine Gesamtschätzung', () => {
  it('rechnet die Einzelpositionen, sperrt aber die Summe', () => {
    const schaetzung = estimateScenario('allgemeine-untersuchung-hund', KATALOG);
    expect(schaetzung.result.lines).toHaveLength(1);
    expect(schaetzung.result.netTotal.amountMinor).toBe(2362);
    expect(schaetzung.mayShowTotal).toBe(false);
  });

  it('nennt zuerst, dass die Zusammenstellung ungeprüft ist', () => {
    const schaetzung = estimateScenario('beratung-ohne-untersuchung', KATALOG);
    expect(schaetzung.limitations[0]).toMatch(/fachlich nicht geprüft/);
  });

  it('führt die Ausschlüsse des Szenarios und der Engine zusammen', () => {
    const schaetzung = estimateScenario('allgemeine-untersuchung-hund', KATALOG);
    const text = schaetzung.limitations.join(' | ');
    expect(text).toMatch(/weiterführende Diagnostik/);
    expect(text).toMatch(/Arzneimittel/);
    expect(text).toMatch(/Fremdlabor/);
  });

  it('kennt kein unbekanntes Szenario', () => {
    expect(() => estimateScenario('gibt-es-nicht', KATALOG)).toThrow(CostError);
    expect(getScenario('gibt-es-nicht')).toBeUndefined();
  });
});

describe('Eine halbe Freigabe ist keine Freigabe', () => {
  const basis = allScenarios()[0];

  it('lehnt approved ohne Prüfzeitpunkt ab', () => {
    const halb = { ...basis, clinicalReview: 'approved', reviewedBy: 'Synthetische Prüfperson' };
    expect(CostScenarioSchema.safeParse(halb).success).toBe(false);
  });

  it('lehnt approved ohne prüfende Person ab', () => {
    const halb = { ...basis, clinicalReview: 'approved', reviewedAt: '2026-09-06T10:00:00+00:00' };
    expect(CostScenarioSchema.safeParse(halb).success).toBe(false);
  });

  it('lehnt eine doppelte Position ab, statt sie zu summieren', () => {
    const doppelt = {
      ...basis,
      lines: [
        { officialItemId: '1', quantity: 1, factor: 1 },
        { officialItemId: '1', quantity: 2, factor: 1 },
      ],
    };
    expect(CostScenarioSchema.safeParse(doppelt).success).toBe(false);
  });

  it('würde eine vollständige Freigabe akzeptieren', () => {
    const ganz = {
      ...basis,
      clinicalReview: 'approved',
      reviewedAt: '2026-09-06T10:00:00+00:00',
      reviewedBy: 'Synthetische Prüfperson',
    };
    expect(CostScenarioSchema.safeParse(ganz).success).toBe(true);
  });
});
