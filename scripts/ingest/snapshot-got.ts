/**
 * M08-04 — Erzeugt den versionierten lokalen GOT-Snapshot.
 *
 * ADR-018 verlangt: Entwicklung, Tests und Website-Builds hängen nie von
 * einem Live-Abruf ab. Grundlage ist ein validierter lokaler Snapshot, den
 * dieses Skript schreibt. Besucher der Website lösen keine Anfragen an
 * gesetze-im-internet.de aus.
 *
 * Quelle ist standardmäßig die im Repository liegende amtliche Datei. Mit
 * `--fetch` wird stattdessen einmal abgerufen — höchstens das, kein Crawler.
 *
 * Ausführen: `npm run snapshot:got` oder `npm run snapshot:got -- --fetch`
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

import { canonicalJson, type JsonValue } from '../normalize/canonical.ts';
import { extrahiereXml, normalizeGot, parseGotXml, PARSER_VERSION } from './adapters/got.ts';
import { fetchSource } from './fetch.ts';
import type { FetchedResource } from './types.ts';

const ZIEL = 'data-snapshots/got/got-2022.json';
const LOKALE_QUELLE = 'tests/fixtures/got/got_2022.xml.zip';

async function holeRessource(mitAbruf: boolean): Promise<FetchedResource> {
  if (mitAbruf) {
    const ergebnis = await fetchSource('got-2022-gesetze-im-internet');
    if (ergebnis.status !== 'fetched' || ergebnis.resource === null) {
      throw new Error('Quelle meldet keine Änderung; der vorhandene Snapshot bleibt gültig.');
    }
    return ergebnis.resource;
  }

  const body = new Uint8Array(readFileSync(LOKALE_QUELLE));
  return {
    sourceId: 'got-2022-gesetze-im-internet',
    url: 'https://www.gesetze-im-internet.de/got_2022/xml.zip',
    body,
    contentType: 'application/zip',
    contentHash: createHash('sha256').update(body).digest('hex'),
    // Der Abrufzeitpunkt der im Repository liegenden Datei, nicht „jetzt“.
    retrievedAt: '2026-09-06T00:00:00+00:00',
    etag: null,
    lastModified: null,
  };
}

async function main(): Promise<number> {
  const mitAbruf = process.argv.includes('--fetch');
  const ressource = await holeRessource(mitAbruf);

  const geparst = parseGotXml(extrahiereXml(ressource.body).inhalt);
  const normalisiert = normalizeGot(geparst, { resource: ressource });

  const snapshot = {
    // Provenienz nach ADR-018.
    source: {
      name: 'Gebührenordnung für Tierärztinnen und Tierärzte (GOT)',
      url: ressource.url,
      retrievalDate: ressource.retrievedAt,
      sourceSha256: ressource.contentHash,
      sourceVersion: normalisiert.katalogVersion,
      effectiveFrom: geparst.ausfertigungsDatum,
      amendmentNote: geparst.standKommentar,
      parserVersion: PARSER_VERSION,
      legalBasis: 'amtliches Werk, § 5 Abs. 1 UrhG',
    },
    itemCount: normalisiert.items.length,
    items: normalisiert.items,
  };

  const inhalt = `${canonicalJson(snapshot as unknown as JsonValue)}\n`;
  writeFileSync(ZIEL, inhalt, 'utf8');

  console.log(
    `${ZIEL}: ${normalisiert.items.length} Positionen, Fassung ${normalisiert.katalogVersion}, ` +
      `Quelldatei ${ressource.contentHash.slice(0, 12)}…`,
  );
  if (normalisiert.abgelehnt.length > 0) {
    console.warn(`${normalisiert.abgelehnt.length} Position(en) abgelehnt.`);
  }
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((fehler: unknown) => {
    // Ein Fehlschlag lässt den vorhandenen Snapshot unangetastet.
    console.error(`Snapshot nicht erneuert: ${(fehler as Error).message}`);
    console.error('Der bisherige Snapshot bleibt gültig.');
    process.exit(1);
  });
