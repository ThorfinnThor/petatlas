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
import {
  MAX_CHUNK_BYTES,
  MAX_GEO_CHUNK_BYTES,
  type ChunkEntry,
} from '../../src/domain/schemas/manifest.ts';
import type { Place } from '../../src/domain/schemas/places.ts';
import { normalisiere } from '../../src/features/map/place-search.ts';
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

/**
 * Teilt den Ortsnamenindex nach Anfangsbuchstaben.
 *
 * Bundesweit sind es über 46.000 Ortsnamen; als eine Datei wären das
 * mehrere Megabyte im ersten Browserpfad. Für ein Autocomplete braucht der
 * Browser aber nur den Teil, der zum getippten Anfang passt.
 *
 * Eine zu große Gruppe wird weiter geteilt — nach zwei Zeichen statt einem.
 * Das Budget wird nicht angehoben.
 */
export function teileOrtsnamen(
  eintraege: readonly Record<string, JsonValue>[],
  maxBytes: number,
): ReadonlyMap<string, readonly Record<string, JsonValue>[]> {
  const nachPraefix = new Map<string, Record<string, JsonValue>[]>();

  for (const eintrag of eintraege) {
    const name = normalisiere(String(eintrag.name ?? ''));
    // Namen, die nicht mit a–z beginnen, landen gesammelt unter '0'.
    const erster = /^[a-z]/.test(name) ? (name[0] as string) : '0';
    const vorhanden = nachPraefix.get(erster);
    if (vorhanden === undefined) nachPraefix.set(erster, [eintrag]);
    else vorhanden.push(eintrag);
  }

  const ergebnis = new Map<string, readonly Record<string, JsonValue>[]>();
  for (const [praefix, gruppe] of nachPraefix) {
    if (Buffer.byteLength(canonicalJson(gruppe as unknown as JsonValue), 'utf8') <= maxBytes) {
      ergebnis.set(praefix, gruppe);
      continue;
    }
    const feiner = new Map<string, Record<string, JsonValue>[]>();
    for (const eintrag of gruppe) {
      const name = normalisiere(String(eintrag.name ?? ''));
      const zwei = name.slice(0, 2).padEnd(2, '_');
      const vorhanden = feiner.get(zwei);
      if (vorhanden === undefined) feiner.set(zwei, [eintrag]);
      else vorhanden.push(eintrag);
    }
    for (const [zwei, teil] of feiner) ergebnis.set(zwei, teil);
  }

  return new Map([...ergebnis.entries()].sort(([a], [b]) => (a < b ? -1 : 1)));
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

  // Ortsnamen nach Anfangsbuchstaben teilen: der Browser lädt nur den Teil,
  // der zum getippten Anfang passt.
  const namensGruppen = teileOrtsnamen(ortsIndex.entries, MAX_CHUNK_BYTES - 4096);
  const namensVerweise: { praefix: string; path: string; count: number }[] = [];

  for (const [praefix, gruppe] of namensGruppen) {
    const inhalt = canonicalJson({ ...huelle, prefix: praefix, entries: gruppe } as JsonValue);
    const { datei, chunk } = alsChunk(
      `/data/v1/places/de/names/${praefix}`,
      inhalt,
      `places-de-names-${praefix}`,
    );
    dateien.push(datei);
    chunks.push(chunk);
    namensVerweise.push({ praefix, path: datei.path, count: gruppe.length });
  }

  const namensIndexInhalt = canonicalJson({
    ...huelle,
    source: ortsIndex.source as unknown as JsonValue,
    entryCount: ortsIndex.entries.length,
    shards: namensVerweise as unknown as JsonValue,
  } as JsonValue);
  const namensIndex = alsChunk(
    '/data/v1/places/de/place-index',
    namensIndexInhalt,
    'places-de-place-index',
  );
  dateien.push(namensIndex.datei);
  chunks.push({
    ...namensIndex.chunk,
    dependsOn: namensVerweise.map((verweis) => `places-de-names-${verweis.praefix}`),
  });

  // Der Lizenzhinweis wird mit den Daten ausgeliefert, nicht nur daneben
  // gelegt: wer die Dateien herunterlädt, hat ihn dabei.
  dateien.push({
    path: '/data/v1/places/de/LICENSE.txt',
    content: readFileSync('licenses/ODbL-notice.md', 'utf8'),
  });

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
      `${namensGruppen.size} Namensteile mit ${ortsIndex.entries.length} Ortsnamen, ` +
      `${(gesamt / 1024 / 1024).toFixed(1)} MiB gesamt. ` +
      `Kartenindex ${(index.chunk.byteSize / 1024).toFixed(0)} KiB, ` +
      `Namensindex ${(namensIndex.chunk.byteSize / 1024).toFixed(1)} KiB.`,
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
