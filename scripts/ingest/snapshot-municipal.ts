/**
 * M11-05 — Erzeugt den versionierten Snapshot der kommunalen Pilotquelle.
 *
 * Wie beim GOT-Import gilt: Entwicklung, Tests und Website-Builds hängen nie
 * an einem Live-Abruf. Grundlage ist ein validierter lokaler Snapshot.
 * Standardquelle ist die im Repository liegende Antwort des Dienstes; mit
 * `--fetch` wird sie einmal neu geholt — einmal, nicht in einer Schleife.
 *
 * Ein fehlgeschlagener Abruf lässt den vorhandenen Snapshot unangetastet.
 *
 * Ausführen: `npm run snapshot:municipal` oder `… -- --fetch`
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

import { MunicipalSnapshotSchema } from '../../src/domain/schemas/municipal.ts';
import { requireSource } from '../../src/domain/source-registry.ts';
import { canonicalJson, type JsonValue } from '../normalize/canonical.ts';
import {
  PARSER_VERSION,
  SOURCE_ID,
  normalizeFlaechen,
  parseGeoJson,
} from './adapters/municipal/berlin-hundefreilauf.ts';
import { fetchSource } from './fetch.ts';
import type { FetchedResource } from './types.ts';

const ZIEL = 'data-snapshots/municipal/berlin-hundefreilauf.json';
const LOKALE_QUELLE = 'tests/fixtures/municipal/berlin-hundefreilauf.geojson';

/**
 * Geltungsbereich im Klartext. Er steht im Snapshot, weil er zur Aussage
 * gehört: der Datensatz deckt nicht ganz Berlin ab.
 */
const GELTUNG =
  'Ausgewiesene Hundefreilaufflächen und Hundemitnahmeverbote in den Bezirken ' +
  'Charlottenburg-Wilmersdorf, Friedrichshain-Kreuzberg und Reinickendorf sowie eine Fläche in ' +
  'Steglitz-Zehlendorf. Eine Fläche, die hier fehlt, ist weder erlaubt noch verboten, sondern ' +
  'nicht erfasst.';

async function holeRessource(mitAbruf: boolean): Promise<FetchedResource> {
  if (mitAbruf) {
    const ergebnis = await fetchSource(SOURCE_ID);
    if (ergebnis.status !== 'fetched' || ergebnis.resource === null) {
      throw new Error('Quelle meldet keine Änderung; der vorhandene Snapshot bleibt gültig.');
    }
    return ergebnis.resource;
  }

  const body = new Uint8Array(readFileSync(LOKALE_QUELLE));
  return {
    sourceId: SOURCE_ID,
    url: requireSource(SOURCE_ID).distributionUrl,
    body,
    contentType: 'application/json',
    contentHash: createHash('sha256').update(body).digest('hex'),
    // Abrufzeitpunkt der im Repository liegenden Antwort, nicht „jetzt“.
    retrievedAt: '2026-09-07T00:00:00+00:00',
    etag: null,
    lastModified: null,
  };
}

async function main(): Promise<number> {
  const mitAbruf = process.argv.includes('--fetch');
  const ressource = await holeRessource(mitAbruf);
  const quelle = requireSource(SOURCE_ID);

  const geparst = parseGeoJson(ressource);
  const normalisiert = normalizeFlaechen(geparst, ressource);
  if (normalisiert.records.length === 0) {
    throw new Error('Kein einziger Datensatz übernommen; der vorhandene Snapshot bleibt gültig.');
  }

  const byKind: Record<string, number> = {};
  for (const eintrag of normalisiert.records) {
    byKind[eintrag.record.kind] = (byKind[eintrag.record.kind] ?? 0) + 1;
  }

  const snapshot = {
    source: {
      sourceId: SOURCE_ID,
      name: quelle.resourceName,
      url: quelle.attributionUrl ?? quelle.distributionUrl,
      retrievalDate: ressource.retrievedAt,
      sourceSha256: ressource.contentHash,
      licenseId: quelle.rights.licenseId ?? 'unbekannt',
      licenseUrl: quelle.rights.licenseUrl ?? quelle.primaryTermsUrl,
      attribution: quelle.attributionText ?? quelle.publisher,
      attributionUrl: quelle.attributionUrl ?? quelle.primaryTermsUrl,
      validity: GELTUNG,
      parserVersion: PARSER_VERSION,
    },
    areaCount: normalisiert.records.length,
    byKind,
    areas: normalisiert.records.map((eintrag) => eintrag.record),
  };

  const geprueft = MunicipalSnapshotSchema.safeParse(snapshot);
  if (!geprueft.success) {
    throw new Error(`Erzeugter Snapshot ist ungültig: ${geprueft.error.message}`);
  }

  writeFileSync(ZIEL, `${canonicalJson(snapshot as unknown as JsonValue)}\n`, 'utf8');

  console.log(
    `${ZIEL}: ${snapshot.areaCount} Flächen ` +
      `(${byKind.dog_off_leash ?? 0} Freilauf, ${byKind.dog_prohibited ?? 0} Mitnahmeverbot), ` +
      `Quellantwort ${ressource.contentHash.slice(0, 12)}…`,
  );
  if (normalisiert.abgelehnt.length > 0) {
    console.warn(`${normalisiert.abgelehnt.length} Fläche(n) abgelehnt:`);
    for (const eintrag of normalisiert.abgelehnt) console.warn(`  ${eintrag.id}: ${eintrag.grund}`);
  }
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((fehler: unknown) => {
    console.error(`Snapshot nicht erneuert: ${(fehler as Error).message}`);
    console.error('Der bisherige Snapshot bleibt gültig.');
    process.exit(1);
  });
