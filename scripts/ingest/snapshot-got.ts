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
 * Der Abruf ist **bedingt** (M17-07): der Snapshot führt `sourceEtag` und
 * `sourceLastModified` des zuletzt geholten Standes mit, und der nächste Lauf
 * schickt sie als `If-None-Match` und `If-Modified-Since`. Antwortet die
 * Quelle mit 304, bleibt der vorhandene Snapshot unverändert und der Lauf
 * endet erfolgreich — ein unveränderter Datenstand ist kein Fehler und darf
 * keinen leeren Commit erzeugen.
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

interface LetzterStand {
  readonly etag: string | null;
  readonly lastModified: string | null;
  readonly sha256: string | null;
  readonly retrievedAt: string | null;
}

/** Die Kennzeichen des zuletzt geholten Standes, falls es einen gibt. */
function letzterStand(): LetzterStand {
  try {
    const vorhanden = JSON.parse(readFileSync(ZIEL, 'utf8')) as {
      source?: {
        sourceEtag?: string | null;
        sourceLastModified?: string | null;
        sourceSha256?: string | null;
        retrievalDate?: string | null;
      };
    };
    return {
      etag: vorhanden.source?.sourceEtag ?? null,
      lastModified: vorhanden.source?.sourceLastModified ?? null,
      sha256: vorhanden.source?.sourceSha256 ?? null,
      retrievedAt: vorhanden.source?.retrievalDate ?? null,
    };
  } catch {
    return { etag: null, lastModified: null, sha256: null, retrievedAt: null };
  }
}

async function holeRessource(mitAbruf: boolean): Promise<FetchedResource | null> {
  if (mitAbruf) {
    const vorher = letzterStand();
    const ergebnis = await fetchSource('got-2022-gesetze-im-internet', {
      etag: vorher.etag,
      lastModified: vorher.lastModified,
    });
    if (ergebnis.status === 'not_modified' || ergebnis.resource === null) {
      // Unverändert ist ein gutes Ergebnis: der Snapshot bleibt, wie er ist.
      return null;
    }
    return ergebnis.resource;
  }

  const body = new Uint8Array(readFileSync(LOKALE_QUELLE));
  const contentHash = createHash('sha256').update(body).digest('hex');

  // Ohne Abruf wird aus der im Repository liegenden Datei neu gebaut. Deren
  // Kennzeichen stammen aus dem letzten echten Abruf und gelten nur, solange
  // es dieselben Bytes sind. Weicht der Hash ab, ist die Datei ausgetauscht
  // worden: dann sind ETag und Last-Modified unbekannt statt geerbt.
  const vorher = letzterStand();
  if (vorher.sha256 !== contentHash || vorher.retrievedAt === null) {
    throw new Error(
      'Die lokale Quelldatei gehört nicht zum vorhandenen Snapshot. Wann sie ' +
        'abgerufen wurde, ist damit unbekannt und wird nicht geraten. ' +
        'Bitte `npm run snapshot:got -- --fetch` ausführen.',
    );
  }

  return {
    sourceId: 'got-2022-gesetze-im-internet',
    url: 'https://www.gesetze-im-internet.de/got_2022/xml.zip',
    body,
    contentType: 'application/zip',
    contentHash,
    // Der Abrufzeitpunkt dieser Bytes stammt aus dem letzten echten Abruf,
    // nicht aus „jetzt“ und nicht aus einer Konstanten im Code.
    retrievedAt: vorher.retrievedAt,
    etag: vorher.etag,
    lastModified: vorher.lastModified,
  };
}

async function main(): Promise<number> {
  const mitAbruf = process.argv.includes('--fetch');
  const ressource = await holeRessource(mitAbruf);
  if (ressource === null) {
    console.log(
      'Die Quelle meldet keine Änderung (HTTP 304). Der vorhandene Snapshot bleibt unverändert.',
    );
    return 0;
  }

  const geparst = parseGotXml(extrahiereXml(ressource.body).inhalt);
  const normalisiert = normalizeGot(geparst, { resource: ressource });

  const snapshot = {
    // Provenienz nach ADR-018.
    source: {
      name: 'Gebührenordnung für Tierärztinnen und Tierärzte (GOT)',
      url: ressource.url,
      retrievalDate: ressource.retrievedAt,
      sourceSha256: ressource.contentHash,
      // Für den bedingten Abruf des nächsten Laufs (M17-07).
      sourceEtag: ressource.etag,
      sourceLastModified: ressource.lastModified,
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
