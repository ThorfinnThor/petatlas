/**
 * M10-03 — Erzeugt den versionierten Ortsdaten-Snapshot.
 *
 * Wie beim Gebührenkatalog gilt: der Website-Build hängt nie von einem
 * Live-Abruf ab. Grundlage ist ein lokaler Snapshot, den dieses Skript
 * schreibt. Ein Fehlschlag lässt den vorhandenen Snapshot unangetastet.
 *
 * Ausführen: `npm run snapshot:places -- --extract .work/bremen-latest.osm.pbf`
 */
import { createHash } from 'node:crypto';
import { readFileSync, statSync, writeFileSync } from 'node:fs';

import { importiereExtraktVollstaendig, type OsmImportErgebnis } from './adapters/osm/index.ts';
import { sammleOrtsnamen } from './adapters/osm/places-index.ts';
import { fuehreZusammen, zaehleJeKategorie } from '../normalize/geometry.ts';
import { canonicalJson, type JsonValue } from '../normalize/canonical.ts';
import { requireSource } from '../../src/domain/source-registry.ts';

const ZIEL_ORTE = 'data-snapshots/places/places-de.json';
const ZIEL_INDEX = 'data-snapshots/places/place-index-de.json';

function argument(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? null) : null;
}

async function main(): Promise<number> {
  const extrakt = argument('--extract');
  const sourceId = argument('--source') ?? 'osm-geofabrik-bremen-pbf';

  if (extrakt === null) {
    console.error('Aufruf: npm run snapshot:places -- --extract <datei.osm.pbf> [--source <id>]');
    return 2;
  }

  const quelle = requireSource(sourceId);
  const roh = readFileSync(extrakt);
  const contentHash = createHash('sha256').update(roh).digest('hex');
  const dateiInfo = statSync(extrakt);
  const groesse = dateiInfo.size;

  const ergebnis: OsmImportErgebnis & { ohneGeometrie: readonly string[] } =
    await importiereExtraktVollstaendig(extrakt, sourceId);
  const orte = fuehreZusammen(ergebnis.places);
  const ortsnamen = await sammleOrtsnamen(extrakt);

  if (orte.length === 0) {
    console.error('Der Import liefert keinen einzigen Ort; der vorhandene Snapshot bleibt gültig.');
    return 1;
  }

  const provenienz = {
    name: quelle.resourceName,
    url: quelle.distributionUrl,
    // Der Stand der Datei, nicht der Zeitpunkt des Skriptlaufs: sonst
    // erzeugt jeder Aufruf eine Änderung ohne inhaltlichen Unterschied.
    retrievalDate: dateiInfo.mtime.toISOString().slice(0, 10),
    sourceSha256: contentHash,
    sourceBytes: groesse,
    licenseId: quelle.rights.licenseId,
    attribution: quelle.attributionText,
    attributionUrl: quelle.attributionUrl,
    shareAlike: quelle.rights.shareAlike,
  };

  writeFileSync(
    ZIEL_ORTE,
    `${canonicalJson({
      source: provenienz,
      coverage: {
        region: quelle.coverage.spatial,
        placeCount: orte.length,
        byCategory: zaehleJeKategorie(orte),
        withoutGeometry: ergebnis.ohneGeometrie.length,
        withoutName: ergebnis.statistik.ohneNamen,
      },
      places: orte,
    } as unknown as JsonValue)}\n`,
    'utf8',
  );

  writeFileSync(
    ZIEL_INDEX,
    `${canonicalJson({
      source: provenienz,
      entryCount: ortsnamen.length,
      entries: ortsnamen,
    } as unknown as JsonValue)}\n`,
    'utf8',
  );

  console.log(
    `${ZIEL_ORTE}: ${orte.length} Orte (${JSON.stringify(zaehleJeKategorie(orte))})\n` +
      `${ZIEL_INDEX}: ${ortsnamen.length} Ortsnamen\n` +
      `Quelle: ${quelle.sourceId}, sha256 ${contentHash.slice(0, 12)}…`,
  );
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((fehler: unknown) => {
    console.error(`Snapshot nicht erneuert: ${(fehler as Error).message}`);
    console.error('Der bisherige Snapshot bleibt gültig.');
    process.exit(1);
  });
