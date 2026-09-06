// M08-01 — Der Import gibt die amtliche Quelle wieder.
//
// Die Erwartungswerte stammen aus einer **unabhängigen** Zweitextraktion mit
// einem anderen Parser (Python/ElementTree), nicht aus der Implementierung,
// die hier geprüft wird: `tests/fixtures/got/stichprobe.json`.
//
// Das ZIP-Fixture ist die unveränderte amtliche Datei; die Tests brauchen
// deshalb kein Netz.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  PARSER_VERSION,
  euroTextZuCent,
  extrahiereXml,
  normalizeGot,
  parseGotXml,
  tierartAus,
} from '../../scripts/ingest/adapters/got.ts';
import { IngestError, type FetchedResource } from '../../scripts/ingest/types.ts';

const ARCHIV = new Uint8Array(
  readFileSync(new URL('../fixtures/got/got_2022.xml.zip', import.meta.url)),
);
const VERGLEICH = JSON.parse(
  readFileSync(new URL('../fixtures/got/stichprobe.json', import.meta.url), 'utf8'),
) as {
  quelleSha256: string;
  erwarteteAnzahl: number;
  stichprobe: { officialItemId: string; originalLabel: string; baseAmountMinor: number }[];
};

const { inhalt } = extrahiereXml(ARCHIV);
const GEPARST = parseGotXml(inhalt);

function ressource(): FetchedResource {
  return {
    sourceId: 'got-2022-gesetze-im-internet',
    url: 'https://www.gesetze-im-internet.de/got_2022/xml.zip',
    body: ARCHIV,
    contentType: 'application/zip',
    contentHash: createHash('sha256').update(ARCHIV).digest('hex'),
    retrievedAt: '2026-09-06T10:00:00+00:00',
    etag: null,
    lastModified: null,
  };
}

describe('Das Fixture ist die amtliche Datei', () => {
  it('hat den geprüften Hash', () => {
    expect(createHash('sha256').update(ARCHIV).digest('hex')).toBe(VERGLEICH.quelleSha256);
  });

  it('enthält genau eine XML-Datei', () => {
    expect(extrahiereXml(ARCHIV).name).toMatch(/\.xml$/i);
  });

  it('lehnt ein kaputtes Archiv ab', () => {
    expect(() => extrahiereXml(new Uint8Array([1, 2, 3, 4]))).toThrow(IngestError);
  });
});

describe('Katalogkopf', () => {
  it('übernimmt die Fassung aus der Quelle', () => {
    expect(GEPARST.katalogVersion).toBe('GOT 2022');
  });

  it('führt den Änderungsstand mit', () => {
    expect(GEPARST.standKommentar).toContain('Geändert durch');
  });

  it('kennt das Ausfertigungsdatum', () => {
    expect(GEPARST.ausfertigungsDatum).toBe('2022-08-15');
  });
});

describe('Repräsentative Stichprobe entspricht der Quelle', () => {
  const normalisiert = normalizeGot(GEPARST, { resource: ressource() });

  it('liest so viele Positionen wie die unabhängige Zweitextraktion', () => {
    expect(GEPARST.rows).toHaveLength(VERGLEICH.erwarteteAnzahl);
    expect(normalisiert.items).toHaveLength(VERGLEICH.erwarteteAnzahl);
  });

  it.each(VERGLEICH.stichprobe)(
    'gibt Position $officialItemId wortgleich und centgenau wieder',
    ({ officialItemId, originalLabel, baseAmountMinor }) => {
      const eintrag = normalisiert.items.find((item) => item.officialItemId === officialItemId);
      expect(eintrag, `Position ${officialItemId} fehlt`).toBeDefined();
      expect(eintrag?.originalLabel).toBe(originalLabel);
      expect(eintrag?.baseAmountMinor).toBe(baseAmountMinor);
      expect(eintrag?.currency).toBe('EUR');
    },
  );

  it('behält die laufende Nummer der Verordnung als ID', () => {
    const ids = normalisiert.items.map((item) => item.officialItemId);
    expect(ids).toContain('1');
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => /^\d+[a-z]?$/.test(id))).toBe(true);
  });

  it('führt Abschnitt und laufende Nummer als Fundstelle mit', () => {
    const erste = normalisiert.items.find((item) => item.officialItemId === '1');
    expect(erste?.sourceReference).toContain('Teil A');
    expect(erste?.sourceReference).toContain('lfd. Nr. 1');
  });

  it('trägt Katalogversion und Geltungsbeginn an jeder Position', () => {
    for (const item of normalisiert.items) {
      expect(item.catalogVersion).toBe('GOT 2022');
      expect(item.validity.from).toBe('2022-08-15');
    }
  });

  it('führt Parserversion, Quelldatei-Hash und Abrufzeitpunkt mit', () => {
    expect(normalisiert.parserVersion).toBe(PARSER_VERSION);
    expect(normalisiert.sourceContentHash).toBe(VERGLEICH.quelleSha256);
    expect(normalisiert.retrievedAt).toBe('2026-09-06T10:00:00+00:00');
  });
});

describe('Tierart wird abgelesen, nicht geraten', () => {
  const normalisiert = normalizeGot(GEPARST, { resource: ressource() });

  it('erkennt nur die ausdrücklich gelisteten Wörter', () => {
    expect(tierartAus('Kastration, Hund')).toBe('dog');
    expect(tierartAus('Kastration, Katze')).toBe('cat');
  });

  it('bleibt bei mehreren genannten Tierarten unbestimmt', () => {
    expect(tierartAus('Untersuchung, Hund und Katze')).toBeNull();
  });

  it('bleibt bei fehlender Angabe unbestimmt statt „other“ zu behaupten', () => {
    expect(tierartAus('Allgemeine Untersuchung mit Beratung, Pferd')).toBeNull();
    expect(tierartAus('Nephrektomie')).toBeNull();
  });

  it('lässt den größten Teil des Katalogs ohne Tierart', () => {
    const ohne = normalisiert.items.filter((item) => item.species === null);
    expect(ohne.length).toBeGreaterThan(0);
    expect(ohne.length).toBeLessThan(normalisiert.items.length);
  });
});

describe('Beträge', () => {
  it('rechnet Euro-Text centgenau um', () => {
    expect(euroTextZuCent('11,26')).toBe(1126);
    expect(euroTextZuCent('267,12')).toBe(26712);
    expect(euroTextZuCent('1234,00')).toBe(123400);
  });

  it('lehnt unlesbare Beträge ab, statt zu schätzen', () => {
    for (const roh of ['11.26', '11,2', 'elf', '', '11,265']) {
      expect(() => euroTextZuCent(roh), roh).toThrow(IngestError);
    }
  });
});

describe('Parserfehler bleiben sichtbar', () => {
  it('meldet, wenn die Anlage fehlt', () => {
    const ohneAnlage = inhalt.replace(/<enbez>Anlage<\/enbez>/g, '<enbez>Nichts</enbez>');
    expect(() => parseGotXml(ohneAnlage)).toThrow(/Anlage/);
  });

  it('meldet unlesbares XML', () => {
    expect(() => parseGotXml('<dokumente>')).toThrow(IngestError);
  });

  it('bricht ab, wenn zu viele Zeilen unlesbar sind', () => {
    const kaputt = {
      ...GEPARST,
      rows: GEPARST.rows.slice(0, 10),
      unlesbar: Array.from({ length: 10 }, (_, i) => ({ zeile: i, grund: 'synthetisch' })),
    };
    expect(() => normalizeGot(kaputt, { resource: ressource() })).toThrow(/Struktur der Quelle/);
  });

  it('liest den echten Katalog ohne eine einzige unlesbare Zeile', () => {
    expect(GEPARST.unlesbar).toEqual([]);
    expect(normalizeGot(GEPARST, { resource: ressource() }).abgelehnt).toEqual([]);
  });
});
