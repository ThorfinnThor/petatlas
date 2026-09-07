/**
 * M10-05 — Ortsdaten veröffentlichen.
 *
 * Zwei Dinge, die hier bewusst nicht passieren:
 *
 * 1. **Keine deutschlandweite Megadatei im ersten Browserpfad.** Der Index
 *    nennt nur Zellen mit Bounding Box und Zählern; die Marker selbst liegen
 *    in räumlichen Chunks, von denen der Browser lädt, was er zeigt.
 * 2. **Keine Rohübernahme.** Ausgegeben wird eine ausdrückliche Projektion.
 *    Ein Feld, das dort nicht aufgezählt ist, verlässt den Build nicht.
 *
 * Ausführen: `npm run build:places` (läuft in `build:site` mit).
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import { resolveBuildConfig } from '../../config/build.ts';
import { mayPublishAs } from '../../src/domain/publication-policy.ts';
import { requireSource } from '../../src/domain/source-registry.ts';
import { MAX_GEO_CHUNK_BYTES, type ChunkEntry } from '../../src/domain/schemas/manifest.ts';
import type { Place } from '../../src/domain/schemas/places.ts';
import { canonicalJson, type JsonValue } from '../normalize/canonical.ts';
import { buildManifest, writeFiles, writeManifest, type PublishableFile } from './manifest.ts';

const SNAPSHOT = 'data-snapshots/places/places-de.json';
const INDEX_SNAPSHOT = 'data-snapshots/places/place-index-de.json';
const OUT_DIR = 'dist';

/** Kantenlänge einer Zelle in Grad, grob 55 km in der Breite. */
export const ZELLEN_GRAD = 0.5;

export interface PlacesSnapshot {
  readonly source: Record<string, unknown>;
  readonly coverage: Record<string, unknown>;
  readonly places: readonly Place[];
}

/** Zellenschlüssel eines Punktes, z. B. `53.0_8.5`. */
export function zelleVon(latitude: number, longitude: number): string {
  const lat = Math.floor(latitude / ZELLEN_GRAD) * ZELLEN_GRAD;
  const lon = Math.floor(longitude / ZELLEN_GRAD) * ZELLEN_GRAD;
  return `${lat.toFixed(1)}_${lon.toFixed(1)}`;
}

/**
 * Öffentliche Projektion eines Ortes. Ausdrücklich aufgezählt statt kopiert,
 * damit kein neues Feld stillschweigend nach außen gelangt.
 */
export function oeffentlicheProjektion(ort: Place): Record<string, JsonValue> {
  return {
    id: ort.placeId,
    name: ort.name,
    category: ort.category,
    lat: ort.coordinates.latitude,
    lon: ort.coordinates.longitude,
    coordinateSource: ort.coordinateSource,
    municipality: ort.municipality,
    postalCode: ort.postalCode,
    phone: ort.phone,
    website: ort.website,
    openingHours: ort.openingHours,
    emergency: ort.emergency,
    wheelchair: ort.wheelchair,
    fenced: ort.fenced,
    dogAllowed: ort.dogAllowed,
  };
}

export interface Zelle {
  readonly key: string;
  readonly bbox: readonly [number, number, number, number];
  readonly count: number;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly places: readonly Record<string, JsonValue>[];
}

export function baueZellen(orte: readonly Place[]): readonly Zelle[] {
  const gruppen = new Map<string, Place[]>();
  for (const ort of orte) {
    const schluessel = zelleVon(ort.coordinates.latitude, ort.coordinates.longitude);
    const vorhanden = gruppen.get(schluessel);
    if (vorhanden === undefined) gruppen.set(schluessel, [ort]);
    else vorhanden.push(ort);
  }

  return [...gruppen.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([key, gruppe]) => {
      const lats = gruppe.map((ort) => ort.coordinates.latitude);
      const lons = gruppe.map((ort) => ort.coordinates.longitude);
      const byCategory: Record<string, number> = {};
      for (const ort of gruppe) byCategory[ort.category] = (byCategory[ort.category] ?? 0) + 1;

      return {
        key,
        bbox: [
          Number(Math.min(...lons).toFixed(6)),
          Number(Math.min(...lats).toFixed(6)),
          Number(Math.max(...lons).toFixed(6)),
          Number(Math.max(...lats).toFixed(6)),
        ] as [number, number, number, number],
        count: gruppe.length,
        byCategory,
        places: [...gruppe]
          .sort((a, b) => (a.placeId < b.placeId ? -1 : 1))
          .map(oeffentlicheProjektion),
      };
    });
}

function sha256(inhalt: string): string {
  return createHash('sha256').update(inhalt).digest('hex');
}

/** Datei samt Chunk-Eintrag; der Hash steht im Namen, wie im Manifestschema verlangt. */
function alsChunk(
  basisPfad: string,
  inhalt: string,
  chunkId: string,
): { readonly datei: PublishableFile; readonly chunk: ChunkEntry } {
  const hash = sha256(inhalt);
  const pfad = `${basisPfad}.${hash.slice(0, 8)}.json`;
  return {
    datei: { path: pfad, content: inhalt },
    chunk: {
      chunkId,
      kind: 'places',
      marketId: 'DE',
      path: pfad,
      contentHash: hash,
      byteSize: Buffer.byteLength(inhalt, 'utf8'),
      validity: { from: '2026-01-01', until: null },
      dependsOn: [],
    },
  };
}

function main(): number {
  const build = resolveBuildConfig();
  const snapshot = JSON.parse(readFileSync(SNAPSHOT, 'utf8')) as PlacesSnapshot;
  const ortsIndex = JSON.parse(readFileSync(INDEX_SNAPSHOT, 'utf8')) as {
    source: Record<string, unknown>;
    entries: readonly Record<string, JsonValue>[];
  };

  const quelle = requireSource('osm-geofabrik-bremen-pbf');
  const entscheidung = mayPublishAs('public_open', quelle.rights, 'publicJsonDelivery');
  if (!entscheidung.allowed) {
    console.error(`Ortsdaten werden nicht ausgeliefert: ${entscheidung.reason}`);
    return 1;
  }
  if (snapshot.places.length === 0) {
    console.error('Der Snapshot enthält keinen Ort; es wird nichts geschrieben.');
    return 1;
  }

  const huelle = {
    marketId: 'DE',
    licenseId: 'ODbL-1.0',
    attribution: quelle.attributionText,
    attributionUrl: quelle.attributionUrl,
  };

  const zellen = baueZellen(snapshot.places);
  const dateien: PublishableFile[] = [];
  const chunks: ChunkEntry[] = [];
  const zellenVerweise: {
    key: string;
    path: string;
    count: number;
    bbox: readonly number[];
    byCategory: Record<string, number>;
  }[] = [];

  for (const zelle of zellen) {
    const inhalt = canonicalJson({ ...huelle, cell: zelle.key, places: zelle.places } as JsonValue);
    const byteSize = Buffer.byteLength(inhalt, 'utf8');
    if (byteSize > MAX_GEO_CHUNK_BYTES) {
      console.error(
        `Zelle ${zelle.key} ist ${byteSize} Byte groß. Zellengröße verkleinern, nicht Grenze anheben.`,
      );
      return 1;
    }
    const { datei, chunk } = alsChunk(
      `/data/v1/places/de/cells/${zelle.key}`,
      inhalt,
      `places-de-${zelle.key}`,
    );
    dateien.push(datei);
    chunks.push(chunk);
    zellenVerweise.push({
      key: zelle.key,
      path: datei.path,
      count: zelle.count,
      bbox: zelle.bbox,
      byCategory: { ...zelle.byCategory },
    });
  }

  const indexInhalt = canonicalJson({
    ...huelle,
    source: snapshot.source as unknown as JsonValue,
    coverage: snapshot.coverage as unknown as JsonValue,
    cellSizeDegrees: ZELLEN_GRAD,
    cells: zellenVerweise as unknown as JsonValue,
  } as JsonValue);
  const index = alsChunk('/data/v1/places/de/index', indexInhalt, 'places-de-index');
  dateien.push(index.datei);
  chunks.push({ ...index.chunk, dependsOn: chunks.map((chunk) => chunk.chunkId) });

  const ortsIndexInhalt = canonicalJson({
    ...huelle,
    source: ortsIndex.source as unknown as JsonValue,
    entries: ortsIndex.entries as unknown as JsonValue,
  } as JsonValue);
  const ortsIndexChunk = alsChunk(
    '/data/v1/places/de/place-index',
    ortsIndexInhalt,
    'places-de-place-index',
  );
  dateien.push(ortsIndexChunk.datei);
  chunks.push(ortsIndexChunk.chunk);

  writeFiles(OUT_DIR, dateien);

  // Vorhandene Chunks anderer Bereiche behalten: das Manifest beschreibt den
  // ganzen Ausgabestand, nicht nur diesen Lauf.
  const vorhandene = ladeVorhandeneChunks();
  const manifest = buildManifest({
    outDir: OUT_DIR,
    buildMode: build.mode,
    builtAt: new Date().toISOString(),
    chunks: [...vorhandene, ...chunks],
  });
  writeManifest(OUT_DIR, manifest);

  const gesamt = chunks.reduce((summe, chunk) => summe + chunk.byteSize, 0);
  console.log(
    `Ortsdaten veröffentlicht: ${zellen.length} Zellen, ${snapshot.places.length} Orte, ` +
      `${(gesamt / 1024).toFixed(0)} KiB gesamt, Index ${(index.chunk.byteSize / 1024).toFixed(1)} KiB.`,
  );
  return 0;
}

/** Chunks, die ein früherer Schritt in diesem Build bereits geschrieben hat. */
function ladeVorhandeneChunks(): readonly ChunkEntry[] {
  try {
    const manifest = JSON.parse(readFileSync(`${OUT_DIR}/data/v1/manifest.json`, 'utf8')) as {
      chunks: ChunkEntry[];
    };
    return manifest.chunks.filter((chunk) => chunk.kind !== 'places');
  } catch {
    return [];
  }
}

// Nur ausführen, wenn das Skript direkt aufgerufen wird: die Hilfsfunktionen
// oben werden auch importiert und getestet.
if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
