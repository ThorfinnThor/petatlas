/**
 * M10-04 — Bundesweiter Ortsdatenimport.
 *
 * Arbeitet **sequenziell und streamend**: eine Region wird geladen,
 * verarbeitet und ihre Rohdatei danach sofort gelöscht. Der Spitzenbedarf an
 * Plattenplatz ist damit die größte einzelne Region, nicht die Summe aller.
 *
 * Warum nicht parallel: die Quelle ist ein fremder Server, den dieses Projekt
 * nicht belasten soll, und die Verarbeitung ist ohnehin CPU-gebunden.
 * Kontrollierte Sequenz ist hier die freundlichere und die berechenbarere
 * Variante.
 *
 * Was gemessen wird: Ladezeit, Verarbeitungszeit und Spitzenspeicher je
 * Region. Ohne Messung wäre die Aussage „skaliert“ eine Behauptung.
 *
 * Ausführen: `npm run ingest:osm-de` — optional `--regions bremen,hamburg`
 * und `--keep`, um die Rohdateien zu behalten.
 */
import { rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { importiereExtraktVollstaendig } from './adapters/osm/index.ts';
import { sammleOrtsnamen, type OrtsEintrag } from './adapters/osm/places-index.ts';
import { fetchSource } from './fetch.ts';
import { fuehreZusammen, zaehleJeKategorie } from '../normalize/geometry.ts';
import { canonicalJson, type JsonValue } from '../normalize/canonical.ts';
import { allSources, requireSource } from '../../src/domain/source-registry.ts';
import type { Place } from '../../src/domain/schemas/places.ts';

const ARBEITS_VERZEICHNIS = '.work/osm';
const ZIEL_ORTE = 'data-snapshots/places/places-de.json';
const ZIEL_INDEX = 'data-snapshots/places/place-index-de.json';
const ZIEL_BERICHT = '.work/osm-benchmark.json';

/**
 * Pause zwischen zwei Regionen. Die Quelle ist ein fremder Server, der bei
 * zu schnellen Abrufen mit 502 antwortet. Sechzehn Dateien am Stück sind
 * normale Nutzung — sechzehn Dateien ohne Luft dazwischen nicht.
 */
const PAUSE_MS = 20_000;

export interface RegionsErgebnis {
  readonly sourceId: string;
  readonly region: string;
  readonly bytes: number;
  readonly ladeSekunden: number;
  readonly verarbeitungsSekunden: number;
  readonly spitzenSpeicherMiB: number;
  readonly gelesen: number;
  readonly orte: number;
  readonly ortsnamen: number;
  readonly ohneGeometrie: number;
  readonly ohneNamen: number;
}

function argument(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? null) : null;
}

function regionsQuellen(): readonly string[] {
  const gewuenscht = argument('--regions');
  const alle = allSources()
    .map((quelle) => quelle.sourceId)
    .filter((id) => id.startsWith('osm-geofabrik-') && id !== 'osm-geofabrik-germany-pbf');

  if (gewuenscht === null) return alle;
  const auswahl = gewuenscht.split(',').map((eintrag) => `osm-geofabrik-${eintrag.trim()}-pbf`);
  const unbekannt = auswahl.filter((id) => !alle.includes(id));
  if (unbekannt.length > 0) {
    throw new Error(`Unbekannte Region(en): ${unbekannt.join(', ')}`);
  }
  return auswahl;
}

async function verarbeiteRegion(
  sourceId: string,
  behalten: boolean,
): Promise<{ ergebnis: RegionsErgebnis; orte: readonly Place[]; namen: readonly OrtsEintrag[] }> {
  const quelle = requireSource(sourceId);
  const region = quelle.coverage.spatial;
  const datei = join(ARBEITS_VERZEICHNIS, `${sourceId}.osm.pbf`);

  const ladeStart = Date.now();
  const abruf = await fetchSource(sourceId, {
    maxBytes: 4 * 1024 * 1024 * 1024,
    timeoutMs: 15 * 60 * 1000,
    // Mehr Geduld als im Standardfall: die Quelle drosselt, und Drängeln
    // wäre hier das Gegenteil von hilfreich.
    maxRetries: 4,
    maxRetryDelayMs: 120_000,
  });
  if (abruf.status !== 'fetched' || abruf.resource === null) {
    throw new Error(`${sourceId}: die Quelle meldet keine Änderung.`);
  }
  writeFileSync(datei, abruf.resource.body);
  const ladeSekunden = (Date.now() - ladeStart) / 1000;
  const bytes = statSync(datei).size;

  const verarbeitungsStart = Date.now();
  const speicherVorher = process.memoryUsage().heapUsed;
  const importiert = await importiereExtraktVollstaendig(datei, sourceId);
  const namen = await sammleOrtsnamen(datei);
  const spitze = Math.max(process.memoryUsage().heapUsed, speicherVorher);
  const verarbeitungsSekunden = (Date.now() - verarbeitungsStart) / 1000;

  // Rohdaten vor dem Build entsorgen: sie gehören weder ins Repository noch
  // in ein Deployment, und der Plattenplatz wird für die nächste Region
  // gebraucht.
  if (!behalten) rmSync(datei, { force: true });

  return {
    ergebnis: {
      sourceId,
      region,
      bytes,
      ladeSekunden: Number(ladeSekunden.toFixed(1)),
      verarbeitungsSekunden: Number(verarbeitungsSekunden.toFixed(1)),
      spitzenSpeicherMiB: Number((spitze / 1024 / 1024).toFixed(0)),
      gelesen: importiert.statistik.gelesen,
      orte: importiert.places.length,
      ortsnamen: namen.length,
      ohneGeometrie: importiert.ohneGeometrie.length,
      ohneNamen: importiert.statistik.ohneNamen,
    },
    orte: importiert.places,
    namen,
  };
}

async function main(): Promise<number> {
  const behalten = process.argv.includes('--keep');
  const quellen = regionsQuellen();

  const { mkdirSync } = await import('node:fs');
  mkdirSync(ARBEITS_VERZEICHNIS, { recursive: true });

  console.log(`Bundesweiter Import: ${quellen.length} Region(en), sequenziell.\n`);

  const berichte: RegionsErgebnis[] = [];
  const alleOrte: Place[] = [];
  const alleNamen: OrtsEintrag[] = [];
  const gescheitert: { sourceId: string; grund: string }[] = [];

  for (const [nummer, sourceId] of quellen.entries()) {
    if (nummer > 0) {
      await new Promise((resolve) => setTimeout(resolve, PAUSE_MS));
    }
    process.stdout.write(`[${nummer + 1}/${quellen.length}] ${sourceId} … `);
    try {
      const { ergebnis, orte, namen } = await verarbeiteRegion(sourceId, behalten);
      berichte.push(ergebnis);
      alleOrte.push(...orte);
      alleNamen.push(...namen);
      console.log(
        `${(ergebnis.bytes / 1024 / 1024).toFixed(0)} MiB, ${ergebnis.orte} Orte, ` +
          `${ergebnis.ladeSekunden}s laden, ${ergebnis.verarbeitungsSekunden}s rechnen, ` +
          `${ergebnis.spitzenSpeicherMiB} MiB Heap`,
      );
    } catch (fehler) {
      // Eine gescheiterte Region beendet den Lauf nicht; sie wird benannt.
      console.log(`FEHLER: ${(fehler as Error).message}`);
      gescheitert.push({ sourceId, grund: (fehler as Error).message });
    }
  }

  if (berichte.length === 0) {
    console.error('\nKeine einzige Region verarbeitet; der vorhandene Snapshot bleibt gültig.');
    return 1;
  }

  const orte = fuehreZusammen(alleOrte);
  const namenNachId = new Map(alleNamen.map((eintrag) => [eintrag.placeId, eintrag]));
  const namen = [...namenNachId.values()].sort((a, b) => (a.placeId < b.placeId ? -1 : 1));

  const provenienz = {
    name: 'OpenStreetMap-Regionalextrakte Deutschland (Geofabrik)',
    licenseId: 'ODbL-1.0',
    attribution: '© OpenStreetMap contributors, ODbL 1.0',
    attributionUrl: 'https://www.openstreetmap.org/copyright',
    shareAlike: true,
    regions: berichte.map((bericht) => ({
      sourceId: bericht.sourceId,
      region: bericht.region,
      places: bericht.orte,
    })),
    // Regionen ohne Snapshot werden benannt, nicht verschwiegen.
    missingRegions: gescheitert.map((eintrag) => eintrag.sourceId),
  };

  writeFileSync(
    ZIEL_ORTE,
    `${canonicalJson({
      source: provenienz,
      coverage: {
        region: 'DE',
        placeCount: orte.length,
        byCategory: zaehleJeKategorie(orte),
        regionCount: berichte.length,
        missingRegionCount: gescheitert.length,
      },
      places: orte,
    } as unknown as JsonValue)}\n`,
    'utf8',
  );
  writeFileSync(
    ZIEL_INDEX,
    `${canonicalJson({ source: provenienz, entryCount: namen.length, entries: namen } as unknown as JsonValue)}\n`,
    'utf8',
  );

  const gesamtBytes = berichte.reduce((summe, bericht) => summe + bericht.bytes, 0);
  const gesamtLaden = berichte.reduce((summe, bericht) => summe + bericht.ladeSekunden, 0);
  const gesamtRechnen = berichte.reduce(
    (summe, bericht) => summe + bericht.verarbeitungsSekunden,
    0,
  );
  const spitze = Math.max(...berichte.map((bericht) => bericht.spitzenSpeicherMiB));

  writeFileSync(
    ZIEL_BERICHT,
    `${JSON.stringify({ regions: berichte, failed: gescheitert }, null, 2)}\n`,
    'utf8',
  );

  console.log(
    `\nFertig: ${orte.length} Orte, ${namen.length} Ortsnamen aus ${berichte.length} Region(en).\n` +
      `Geladen: ${(gesamtBytes / 1024 / 1024 / 1024).toFixed(2)} GiB in ${gesamtLaden.toFixed(0)}s, ` +
      `verarbeitet in ${gesamtRechnen.toFixed(0)}s, Spitzenspeicher ${spitze} MiB.` +
      (gescheitert.length > 0
        ? `\nNicht verarbeitet: ${gescheitert.map((e) => e.sourceId).join(', ')}`
        : ''),
  );
  return gescheitert.length > 0 ? 1 : 0;
}

main()
  .then((code) => process.exit(code))
  .catch((fehler: unknown) => {
    console.error(`Import abgebrochen: ${(fehler as Error).message}`);
    console.error('Der bisherige Snapshot bleibt gültig.');
    process.exit(1);
  });
