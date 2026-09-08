/**
 * M11-01/M16-03 — Ortsdaten im Browser nachladen.
 *
 * Herausgelöst aus der Trefferliste, weil die Merkliste dieselben Daten
 * braucht. Zwei Module, die je ihren eigenen Lader mitbringen, laden am Ende
 * verschieden — und nur eines davon richtig.
 *
 * Geladen wird, was gebraucht wird: das Manifest, der Zellenindex und die
 * Zellen um einen Punkt. Kein Vorabdownload des Gesamtbestands.
 */
import type { ListenOrt } from './list.ts';

export const MANIFEST = '/data/v1/manifest.json';

export interface ChunkEintrag {
  readonly chunkId: string;
  readonly kind: string;
  readonly marketId: string;
  readonly path: string;
}

export interface ZellenVerweis {
  readonly key: string;
  readonly bbox: readonly [number, number, number, number];
  readonly count: number;
  readonly path: string;
}

let manifestCache: ChunkEintrag[] | null = null;
const geladeneZellen = new Map<string, readonly ListenOrt[]>();

export async function ladeManifest(): Promise<readonly ChunkEintrag[]> {
  if (manifestCache !== null) return manifestCache;
  const antwort = await fetch(MANIFEST);
  if (!antwort.ok) throw new Error(`Manifest antwortet mit ${antwort.status}.`);
  const manifest = (await antwort.json()) as { chunks: ChunkEintrag[] };
  manifestCache = manifest.chunks;
  return manifestCache;
}

export async function pfadVon(chunkId: string): Promise<string> {
  const chunk = (await ladeManifest()).find((eintrag) => eintrag.chunkId === chunkId);
  if (chunk === undefined) throw new Error(`Das Manifest kennt ${chunkId} nicht.`);
  return chunk.path;
}

/** Lädt die Zellen, deren Bounding Box den Suchkreis schneiden kann. */
export async function ladeZellenUm(
  latitude: number,
  longitude: number,
  radiusMeter: number,
): Promise<readonly ListenOrt[]> {
  const indexPfad = await pfadVon('places-de-index');
  const index = (await (await fetch(indexPfad)).json()) as { cells: ZellenVerweis[] };

  // Ein Grad Breite sind rund 111 km; für die Länge kommt der Kosinus dazu.
  const gradLat = radiusMeter / 111_000;
  const gradLon = radiusMeter / (111_000 * Math.max(0.2, Math.cos((latitude * Math.PI) / 180)));

  const passende = index.cells.filter(
    (zelle) =>
      zelle.bbox[0] <= longitude + gradLon &&
      zelle.bbox[2] >= longitude - gradLon &&
      zelle.bbox[1] <= latitude + gradLat &&
      zelle.bbox[3] >= latitude - gradLat,
  );

  const orte: ListenOrt[] = [];
  for (const zelle of passende) {
    const vorhanden = geladeneZellen.get(zelle.key);
    if (vorhanden !== undefined) {
      orte.push(...vorhanden);
      continue;
    }
    const antwort = await fetch(zelle.path);
    if (!antwort.ok) continue;
    const daten = (await antwort.json()) as { places: ListenOrt[] };
    geladeneZellen.set(zelle.key, daten.places);
    orte.push(...daten.places);
  }
  return orte;
}

/**
 * Sucht einen einzelnen Ort über seine ID.
 *
 * Die Koordinate wird gebraucht, um die richtige Zelle zu finden — der Ort
 * selbst kommt **aus den aktuellen Daten**, nicht aus einer alten Kopie.
 * Findet sich nichts, ist der Ort nicht mehr erfasst; das ist eine Antwort
 * und kein Fehler.
 */
export async function ortMitId(
  placeId: string,
  latitude: number,
  longitude: number,
): Promise<ListenOrt | null> {
  const orte = await ladeZellenUm(latitude, longitude, 1000);
  return orte.find((ort) => ort.id === placeId) ?? null;
}
