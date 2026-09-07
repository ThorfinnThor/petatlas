// M13-01 — Der Feedparser läuft ohne Zugangsdaten und wirft nichts still weg.
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import {
  PFLICHTSPALTEN,
  dekodiere,
  parseAwinCsv,
  parseCsv,
  preisInMinor,
} from '../../scripts/ingest/adapters/awin.ts';
import { IngestError, type FetchedResource } from '../../scripts/ingest/types.ts';

const FIXTURE = 'tests/fixtures/commerce/awin-sample.csv';

function ressource(inhalt: string | Uint8Array): FetchedResource {
  const body = typeof inhalt === 'string' ? new TextEncoder().encode(inhalt) : inhalt;
  return {
    sourceId: 'synthetischer-awin-feed',
    url: 'https://beispiel.invalid/feed.csv',
    body,
    contentType: 'text/csv',
    contentHash: createHash('sha256').update(body).digest('hex'),
    retrievedAt: '2026-09-07T00:00:00+00:00',
    etag: null,
    lastModified: null,
  };
}

describe('CSV nach RFC 4180', () => {
  it('schützt Trennzeichen in Anführungszeichen', () => {
    expect(parseCsv('a,"b,c",d')).toEqual([['a', 'b,c', 'd']]);
  });

  it('liest doppelte Anführungszeichen als eines', () => {
    expect(parseCsv('a,"sagte ""hallo""",b')).toEqual([['a', 'sagte "hallo"', 'b']]);
  });

  it('liest Zeilenumbrüche innerhalb eines Feldes', () => {
    expect(parseCsv('a,"erste\nzweite",c')).toEqual([['a', 'erste\nzweite', 'c']]);
  });

  it('behandelt CRLF als ein Zeilenende', () => {
    expect(parseCsv('a,b\r\nc,d')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  it('bricht bei einem offenen Anführungszeichen ab', () => {
    expect(() => parseCsv('a,"offen')).toThrow(IngestError);
  });

  it('kann ein anderes Trennzeichen', () => {
    expect(parseCsv('a;b;c', ';')).toEqual([['a', 'b', 'c']]);
  });
});

describe('Encoding', () => {
  it('liest UTF-8 mit Umlauten', () => {
    expect(dekodiere(new TextEncoder().encode('Größe äöüß'))).toBe('Größe äöüß');
  });

  it('entfernt eine BOM', () => {
    const mitBom = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode('a,b')]);
    expect(dekodiere(mitBom)).toBe('a,b');
  });

  it('lehnt Latin-1 ab, statt Ersatzzeichen zu erzeugen', () => {
    // 0xE4 ist „ä“ in Latin-1 und in UTF-8 ungültig.
    const latin1 = new Uint8Array([0x47, 0x72, 0xf6, 0xdf, 0x65]);
    expect(() => dekodiere(latin1)).toThrow(/nicht UTF-8/);
  });
});

describe('Preise', () => {
  it('rechnet in ganzzahlige Untereinheiten', () => {
    expect(preisInMinor('24.99')).toBe(2499);
    expect(preisInMinor('7,50')).toBe(750);
    expect(preisInMinor('12')).toBe(1200);
    expect(preisInMinor('0.05')).toBe(5);
  });

  it('lehnt ab, was nicht eindeutig ein Preis ist', () => {
    for (const text of ['', 'ab 9,99', '9.999', '-5', 'kostenlos', '1.2.3']) {
      expect(preisInMinor(text), text).toBeNull();
    }
  });

  it('verliert keinen Cent durch Gleitkomma', () => {
    // 0.29 wäre als Gleitkommazahl 0.28999999999999998.
    expect(preisInMinor('1.29')).toBe(129);
    expect(preisInMinor('19.99')).toBe(1999);
  });
});

describe('Feed lesen', () => {
  const roh = readFileSync(FIXTURE);
  const ergebnis = parseAwinCsv(ressource(new Uint8Array(roh)));

  it('kommt ohne Zugangsdaten aus', () => {
    // Der Parser bekommt Bytes, keine Anmeldung: kein Netz, kein Secret.
    expect(ergebnis.records.length).toBeGreaterThan(0);
    expect(ergebnis.kopf).toEqual(expect.arrayContaining([...PFLICHTSPALTEN]));
  });

  it('liest die gültigen Zeilen und lehnt die ungültigen mit Grund ab', () => {
    expect(ergebnis.records.length).toBe(4);
    expect(ergebnis.abgelehnt.length).toBe(3);
    const gruende = ergebnis.abgelehnt.map((eintrag) => eintrag.grund).join(' ');
    expect(gruende).toContain('Leere Pflichtfelder');
    expect(gruende).toContain('nicht eindeutig lesbar');
    expect(gruende).toContain('Felder statt');
    for (const eintrag of ergebnis.abgelehnt) expect(eintrag.zeile).toBeGreaterThan(1);
  });

  it('erhält Anführungszeichen, Kommas und Zeilenumbrüche im Wert', () => {
    const werte = ergebnis.records.map((eintrag) => eintrag.werte);
    expect(werte[1]?.product_name).toBe('Katzenspielzeug "Federangel"');
    expect(werte[0]?.description).toBe('Beispielbeschreibung, mit Komma');
    expect(werte[2]?.product_name).toContain('\n');
  });

  it('erhält führende Nullen und leere Felder als leer', () => {
    const ohneEan = ergebnis.records.find((eintrag) => eintrag.werte.aw_product_id === '1002');
    expect(ohneEan?.werte.ean).toBe('');
    expect(ohneEan?.werte.delivery_cost).toBe('');
  });

  it('bricht ab, wenn eine Pflichtspalte fehlt', () => {
    expect(() => parseAwinCsv(ressource('a,b,c\n1,2,3'))).toThrow(/Pflichtspalten/);
  });

  it('bricht bei einem leeren Feed ab', () => {
    expect(() => parseAwinCsv(ressource(''))).toThrow(IngestError);
  });

  it('zählt die gelesenen Zeilen', () => {
    expect(ergebnis.gelesen).toBe(ergebnis.records.length + ergebnis.abgelehnt.length);
  });
});

describe('Großer Feed', () => {
  it('liest 50.000 Zeilen in vertretbarer Zeit und ohne Datenverlust', () => {
    const kopf = [...PFLICHTSPALTEN].join(',');
    const zeilen = [kopf];
    for (let i = 0; i < 50_000; i += 1) {
      zeilen.push(
        `${i},SYN-${i},"Synthetisches Produkt ${i}, Größe 2 kg",901,` +
          `https://beispiel.invalid/p/${i},${(i % 100) + 1}.${String(i % 100).padStart(2, '0')},EUR`,
      );
    }
    const beginn = Date.now();
    const ergebnis = parseAwinCsv(ressource(zeilen.join('\n')));
    const dauer = Date.now() - beginn;

    expect(ergebnis.records.length).toBe(50_000);
    expect(ergebnis.abgelehnt).toEqual([]);
    expect(ergebnis.records[49_999]?.werte.merchant_product_id).toBe('SYN-49999');
    // Kein Zeitlimit als Leistungsversprechen, sondern als Reißleine gegen
    // einen Parser, der quadratisch wird.
    expect(dauer).toBeLessThan(10_000);
  });
});
