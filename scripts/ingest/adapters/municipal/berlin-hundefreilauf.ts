/**
 * M11-05 — Kommunaler Pilot: Hundefreilauf Berlin.
 *
 * Die Quelle ist die offiziell angebotene WFS-Abgabe der Senatsverwaltung,
 * abgerufen als GeoJSON in EPSG:4326. Ein Abruf je Lauf, kein Crawler.
 *
 * Der Parser ist absichtlich streng, weil die fachliche Aussage streng ist:
 *
 * - **Kein Umrechnen von Koordinaten.** Meldet die Antwort ein anderes
 *   Bezugssystem als WGS84, bricht der Import ab, statt Zahlen zu verschieben.
 * - **Kein Teilimport.** Liefert der Dienst weniger Objekte, als er selbst
 *   als Treffer meldet, wird nichts übernommen. Ein halber Datensatz sähe aus
 *   wie eine geschrumpfte Wirklichkeit.
 * - **Keine geratene Art.** `typ` wird an zwei ausdrücklichen Werten erkannt.
 *   Ein dritter Wert führt zur Ablehnung des Datensatzes, nicht zu einer
 *   Einordnung „wird schon eine Freilauffläche sein“.
 * - **Keine erfundene Fläche.** Das Freitextfeld `info` bleibt Freitext.
 */
import { MunicipalAreaSchema, type MunicipalArea } from '../../../../src/domain/schemas/index.ts';
import { requireSource } from '../../../../src/domain/source-registry.ts';
import type { Provenance } from '../../../../src/domain/source.ts';
import {
  IngestError,
  type FetchedResource,
  type NormalizedBatch,
  type ParsedBatch,
} from '../../types.ts';

export const SOURCE_ID = 'berlin-hundefreilauf-wfs';
export const PARSER_VERSION = 'berlin-hundefreilauf-parser-1';

/** Ausdrückliche Wertliste. Alles andere ist kein bekannter Typ. */
const TYP_ZU_ART: Readonly<Record<string, MunicipalArea['kind']>> = {
  Hundefreilauf: 'dog_off_leash',
  Hundemitnahmeverbot: 'dog_prohibited',
};

export interface RohFlaeche {
  readonly id: string;
  readonly typ: string;
  readonly bezirk: string | null;
  readonly bezeichnung: string | null;
  readonly adresse: string | null;
  readonly zustaendig: string | null;
  readonly info: string | null;
  readonly datum: string | null;
  readonly ringe: readonly (readonly (readonly [number, number])[])[];
}

interface GeoJsonGeometrie {
  readonly type?: string;
  readonly coordinates?: unknown;
}

interface GeoJsonAntwort {
  readonly type?: string;
  readonly crs?: { readonly properties?: { readonly name?: string } };
  readonly numberMatched?: number;
  readonly numberReturned?: number;
  readonly timeStamp?: string;
  readonly features?: readonly {
    readonly id?: string;
    readonly geometry?: GeoJsonGeometrie;
    readonly properties?: Record<string, unknown>;
  }[];
}

function text(wert: unknown): string | null {
  if (typeof wert !== 'string') return null;
  const getrimmt = wert.trim();
  return getrimmt === '' ? null : getrimmt;
}

/** Ringe einer (Multi-)Polygon-Geometrie, flach in einer Liste. */
function ringeAus(
  sourceId: string,
  id: string,
  geometrie: GeoJsonGeometrie | undefined,
): readonly (readonly (readonly [number, number])[])[] {
  const typ = geometrie?.type;
  const koordinaten = geometrie?.coordinates;
  const ringe: (readonly [number, number])[][] = [];

  const alsRing = (roh: unknown): (readonly [number, number])[] => {
    if (!Array.isArray(roh)) {
      throw new IngestError(sourceId, 'parse', `Objekt ${id}: Ring ist keine Liste.`);
    }
    return roh.map((punkt) => {
      if (
        !Array.isArray(punkt) ||
        punkt.length < 2 ||
        typeof punkt[0] !== 'number' ||
        typeof punkt[1] !== 'number' ||
        !Number.isFinite(punkt[0]) ||
        !Number.isFinite(punkt[1])
      ) {
        throw new IngestError(sourceId, 'parse', `Objekt ${id}: Punkt ist kein Zahlenpaar.`);
      }
      return [punkt[0], punkt[1]] as const;
    });
  };

  if (typ === 'Polygon' && Array.isArray(koordinaten)) {
    for (const ring of koordinaten) ringe.push(alsRing(ring));
  } else if (typ === 'MultiPolygon' && Array.isArray(koordinaten)) {
    for (const polygon of koordinaten) {
      if (!Array.isArray(polygon)) {
        throw new IngestError(sourceId, 'parse', `Objekt ${id}: Polygon ist keine Liste.`);
      }
      for (const ring of polygon) ringe.push(alsRing(ring));
    }
  } else {
    throw new IngestError(
      sourceId,
      'parse',
      `Objekt ${id}: Geometrie "${String(typ)}" wird nicht unterstützt. Es wird nichts geraten.`,
    );
  }

  if (ringe.length === 0) {
    throw new IngestError(sourceId, 'parse', `Objekt ${id}: Geometrie ohne Ring.`);
  }
  return ringe;
}

/**
 * Liest die Antwort des Dienstes. Vollständigkeit und Bezugssystem werden
 * geprüft, bevor irgendetwas übernommen wird.
 */
export function parseGeoJson(resource: FetchedResource): ParsedBatch<RohFlaeche> {
  let antwort: GeoJsonAntwort;
  try {
    antwort = JSON.parse(new TextDecoder().decode(resource.body)) as GeoJsonAntwort;
  } catch (cause) {
    throw new IngestError(SOURCE_ID, 'parse', 'Antwort ist kein gültiges JSON.', { cause });
  }

  if (antwort.type !== 'FeatureCollection') {
    throw new IngestError(
      SOURCE_ID,
      'parse',
      `Erwartet wird eine FeatureCollection, nicht "${String(antwort.type)}".`,
    );
  }

  const crs = antwort.crs?.properties?.name ?? '';
  if (!/(^|:)4326$/.test(crs) && !crs.includes('CRS84')) {
    throw new IngestError(
      SOURCE_ID,
      'parse',
      `Bezugssystem "${crs}" ist nicht WGS84. Es wird nicht umgerechnet, sondern abgebrochen.`,
    );
  }

  const features = antwort.features ?? [];
  const gemeldet = antwort.numberMatched ?? antwort.numberReturned ?? features.length;
  if (features.length !== gemeldet) {
    throw new IngestError(
      SOURCE_ID,
      'parse',
      `Dienst meldet ${gemeldet} Treffer, liefert aber ${features.length}. Ein Teilimport wäre eine geschrumpfte Wirklichkeit.`,
    );
  }

  const records = features.map((feature, index) => {
    const eigenschaften = feature.properties ?? {};
    const id = text(feature.id) ?? text(eigenschaften.uid) ?? `index-${index}`;
    const typ = text(eigenschaften.typ);
    if (typ === null) {
      throw new IngestError(SOURCE_ID, 'parse', `Objekt ${id} hat kein Feld typ.`);
    }
    return {
      id,
      typ,
      bezirk: text(eigenschaften.bezirk),
      bezeichnung: text(eigenschaften.bezeich),
      adresse: text(eigenschaften.adresse),
      zustaendig: text(eigenschaften.zustaendig),
      info: text(eigenschaften.info),
      datum: text(eigenschaften.datum),
      ringe: ringeAus(SOURCE_ID, id, feature.geometry),
    };
  });

  return { sourceId: SOURCE_ID, records, sourceVersion: antwort.timeStamp ?? null };
}

/** Mittelpunkt der Bounding Box. Er liegt nicht zwingend in der Fläche. */
function eckdaten(ringe: RohFlaeche['ringe']): {
  readonly bbox: readonly [number, number, number, number];
  readonly punkt: { readonly latitude: number; readonly longitude: number };
} {
  let west = Number.POSITIVE_INFINITY;
  let sued = Number.POSITIVE_INFINITY;
  let ost = Number.NEGATIVE_INFINITY;
  let nord = Number.NEGATIVE_INFINITY;
  for (const ring of ringe) {
    for (const [lon, lat] of ring) {
      if (lon < west) west = lon;
      if (lon > ost) ost = lon;
      if (lat < sued) sued = lat;
      if (lat > nord) nord = lat;
    }
  }
  return {
    bbox: [west, sued, ost, nord],
    punkt: { latitude: (sued + nord) / 2, longitude: (west + ost) / 2 },
  };
}

export interface NormalisierungsErgebnis extends NormalizedBatch<MunicipalArea> {
  /** Abgelehnte Datensätze samt Grund. Sie fallen nicht still weg. */
  readonly abgelehnt: readonly { readonly id: string; readonly grund: string }[];
}

export function normalizeFlaechen(
  batch: ParsedBatch<RohFlaeche>,
  resource: FetchedResource,
): NormalisierungsErgebnis {
  const quelle = requireSource(SOURCE_ID);
  const records: { record: MunicipalArea; provenance: Provenance }[] = [];
  const abgelehnt: { id: string; grund: string }[] = [];

  for (const roh of batch.records) {
    const art = TYP_ZU_ART[roh.typ];
    if (art === undefined) {
      abgelehnt.push({
        id: roh.id,
        grund: `Unbekannter typ "${roh.typ}". Eine unbekannte Ausweisung wird nicht eingeordnet.`,
      });
      continue;
    }

    const { bbox, punkt } = eckdaten(roh.ringe);
    const kandidat = {
      areaId: `berlin-hundefreilauf:${roh.id}`,
      sourceId: SOURCE_ID,
      municipality: 'Berlin',
      district: roh.bezirk,
      kind: art,
      name: roh.bezeichnung,
      address: roh.adresse,
      responsible: roh.zustaendig,
      note: roh.info,
      statedAt: roh.datum,
      representativePoint: punkt,
      boundingBox: bbox,
      outline: roh.ringe.map((ring) => ring.map(([lon, lat]) => [lon, lat])),
    };

    const geprueft = MunicipalAreaSchema.safeParse(kandidat);
    if (!geprueft.success) {
      abgelehnt.push({ id: roh.id, grund: geprueft.error.message });
      continue;
    }

    records.push({
      record: geprueft.data,
      provenance: {
        sourceId: SOURCE_ID,
        sourceRecordId: roh.id,
        sourceUrl: quelle.attributionUrl ?? quelle.distributionUrl,
        retrievedAt: resource.retrievedAt,
        sourceUpdatedAt: null,
        contentHash: resource.contentHash,
        licenseId: quelle.rights.licenseId ?? 'unbekannt',
        normalizationVersion: PARSER_VERSION,
        // Der Sachstand der Quelle ist der Beginn der Geltung; ein Ende
        // nennt die Quelle nicht, also steht dort auch keines.
        validFrom: geprueft.data.statedAt,
        validTo: null,
        reviewedAt: null,
        reviewStatus: 'unreviewed',
      },
    });
  }

  // Stabile Reihenfolge: die Ausgabe darf nicht an der Reihenfolge des
  // Dienstes hängen.
  records.sort((a, b) => (a.record.areaId < b.record.areaId ? -1 : 1));
  return { sourceId: SOURCE_ID, records, abgelehnt };
}
