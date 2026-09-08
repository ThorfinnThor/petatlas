/**
 * M20-03 — Kommunale Quelle: Hundeauslaufzonen Hamburg.
 *
 * Zweite Quelle derselben Art wie der Berliner Pilot, mit drei
 * Unterschieden, die alle in den Daten liegen:
 *
 * 1. **Kein Typfeld.** Der Dienst führt ausschließlich Auslaufzonen nach
 *    § 8 HundeG. Die Art steht also im Datensatz, nicht im Datensatz*feld* —
 *    und wird hier genau deshalb fest gesetzt und nicht geraten. Der
 *    Datensatz nach § 9 (Freilauf nur für geprüfte Hunde) ist eine andere
 *    Aussage und nicht Teil dieser Quelle.
 * 2. **Bezugssystem je Fläche.** Die Antwort trägt keinen `crs`-Block,
 *    sondern an jeder Fläche ein `srsName`. Ohne ausdrückliches
 *    `srsName=EPSG:4326` in der Adresse liefert der Dienst EPSG:25832.
 *    Meldet auch nur eine Fläche etwas anderes als WGS84, bricht der Import
 *    ab, statt Koordinaten zu verschieben.
 * 3. **Keine Trefferzahl in der Antwort.** Der GeoJSON-Ausgabepfad nennt
 *    weder `numberMatched` noch `numberReturned`. Die erwartete Zahl kommt
 *    deshalb aus einer eigenen, winzigen Anfrage (`resulttype=hits`) und
 *    wird hier hineingereicht. Ohne sie wird nicht übernommen: ein
 *    Teilimport sähe aus wie eine geschrumpfte Wirklichkeit.
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

export const SOURCE_ID = 'hamburg-hundeauslaufzonen-wfs';
export const ANZAHL_SOURCE_ID = 'hamburg-hundeauslaufzonen-anzahl';
export const PARSER_VERSION = 'hamburg-hundeauslaufzonen-parser-1';

/**
 * Die Art aller Flächen dieser Quelle. Sie steht in keinem Feld, sondern im
 * Datensatz selbst — siehe Kopfkommentar.
 */
export const ART: MunicipalArea['kind'] = 'dog_off_leash';

export interface RohZone {
  readonly id: string;
  readonly bezeichnung: string | null;
  readonly belegenheit: string | null;
  readonly gesamtanlage: string | null;
  readonly anlagenname: string | null;
  readonly ortsteilnummer: string | null;
  readonly flaecheQm: string | null;
  readonly ringe: readonly (readonly (readonly [number, number])[])[];
}

interface GeoJsonFeature {
  readonly id?: string;
  readonly srsName?: string;
  readonly geometry?: { readonly type?: string; readonly coordinates?: unknown };
  readonly properties?: Record<string, unknown>;
}

interface GeoJsonAntwort {
  readonly type?: string;
  readonly features?: readonly GeoJsonFeature[];
}

function text(wert: unknown): string | null {
  if (typeof wert === 'number' && Number.isFinite(wert)) return String(wert);
  if (typeof wert !== 'string') return null;
  const getrimmt = wert.trim();
  return getrimmt === '' ? null : getrimmt;
}

/** Liest die Trefferzahl aus der `hits`-Antwort des Dienstes. */
export function trefferzahl(resource: FetchedResource): number {
  const xml = new TextDecoder().decode(resource.body);
  const treffer = /numberMatched="(\d+)"/.exec(xml);
  if (treffer === null) {
    throw new IngestError(
      ANZAHL_SOURCE_ID,
      'parse',
      'Die Antwort nennt keine numberMatched. Ohne erwartete Zahl wird nichts übernommen.',
    );
  }
  return Number(treffer[1]);
}

function ringeAus(
  id: string,
  geometrie: GeoJsonFeature['geometry'],
): readonly (readonly (readonly [number, number])[])[] {
  const ringe: (readonly [number, number])[][] = [];

  const alsRing = (roh: unknown): (readonly [number, number])[] => {
    if (!Array.isArray(roh)) {
      throw new IngestError(SOURCE_ID, 'parse', `Fläche ${id}: Ring ist keine Liste.`);
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
        throw new IngestError(SOURCE_ID, 'parse', `Fläche ${id}: Punkt ist kein Zahlenpaar.`);
      }
      return [punkt[0], punkt[1]] as const;
    });
  };

  const typ = geometrie?.type;
  const koordinaten = geometrie?.coordinates;
  if (typ === 'Polygon' && Array.isArray(koordinaten)) {
    for (const ring of koordinaten) ringe.push(alsRing(ring));
  } else if (typ === 'MultiPolygon' && Array.isArray(koordinaten)) {
    for (const polygon of koordinaten) {
      if (!Array.isArray(polygon)) {
        throw new IngestError(SOURCE_ID, 'parse', `Fläche ${id}: Polygon ist keine Liste.`);
      }
      for (const ring of polygon) ringe.push(alsRing(ring));
    }
  } else {
    throw new IngestError(
      SOURCE_ID,
      'parse',
      `Fläche ${id}: Geometrie "${String(typ)}" wird nicht unterstützt. Es wird nichts geraten.`,
    );
  }

  if (ringe.length === 0) {
    throw new IngestError(SOURCE_ID, 'parse', `Fläche ${id}: Geometrie ohne Ring.`);
  }
  return ringe;
}

/** Prüft Vollständigkeit und Bezugssystem, bevor irgendetwas übernommen wird. */
export function parseGeoJson(resource: FetchedResource, erwartet: number): ParsedBatch<RohZone> {
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

  const features = antwort.features ?? [];
  if (features.length !== erwartet) {
    throw new IngestError(
      SOURCE_ID,
      'parse',
      `Dienst meldet ${erwartet} Flächen, liefert aber ${features.length}. Ein Teilimport wäre eine geschrumpfte Wirklichkeit.`,
    );
  }

  const records = features.map((feature, index) => {
    const eigenschaften = feature.properties ?? {};
    const id = text(feature.id) ?? `index-${index}`;
    const srs = text(feature.srsName) ?? '';
    if (!/(^|:)4326$/.test(srs) && !srs.includes('CRS84')) {
      throw new IngestError(
        SOURCE_ID,
        'parse',
        `Fläche ${id} meldet Bezugssystem "${srs}" statt WGS84. Es wird nicht umgerechnet, sondern abgebrochen.`,
      );
    }
    return {
      id,
      bezeichnung: text(eigenschaften.bezeichnung),
      belegenheit: text(eigenschaften.belegenheit),
      gesamtanlage: text(eigenschaften.gesamtanlage),
      anlagenname: text(eigenschaften.anlagenname),
      ortsteilnummer: text(eigenschaften.ortsteilnummer),
      flaecheQm: text(eigenschaften.flaeche_in_qm),
      ringe: ringeAus(id, feature.geometry),
    };
  });

  return { sourceId: SOURCE_ID, records, sourceVersion: null };
}

function eckdaten(ringe: RohZone['ringe']): {
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
  readonly abgelehnt: readonly { readonly id: string; readonly grund: string }[];
}

export function normalizeZonen(
  batch: ParsedBatch<RohZone>,
  resource: FetchedResource,
): NormalisierungsErgebnis {
  const quelle = requireSource(SOURCE_ID);
  const records: { record: MunicipalArea; provenance: Provenance }[] = [];
  const abgelehnt: { id: string; grund: string }[] = [];

  for (const roh of batch.records) {
    const { bbox, punkt } = eckdaten(roh.ringe);

    // Der Freitext bleibt Freitext: die Angaben zur Anlage werden
    // zusammengeführt, aber nicht gedeutet. Die Flächenzahl steht als Text
    // der Quelle da und wird nicht in eine eigene Zahl umgedeutet.
    const notizteile = [
      roh.gesamtanlage === null ? null : `Gesamtanlage: ${roh.gesamtanlage}`,
      roh.anlagenname === null ? null : `Anlage: ${roh.anlagenname}`,
      roh.flaecheQm === null ? null : `Fläche laut Quelle: ${roh.flaecheQm} m²`,
    ].filter((teil): teil is string => teil !== null);

    const kandidat = {
      areaId: `hamburg-hundeauslaufzonen:${roh.id}`,
      sourceId: SOURCE_ID,
      municipality: 'Hamburg',
      // Die Quelle führt eine Ortsteilnummer, keinen Bezirksnamen. Eine
      // Nummer ist kein Bezirk, deshalb bleibt das Feld leer.
      district: null,
      kind: ART,
      name: roh.bezeichnung,
      address: roh.belegenheit,
      responsible: null,
      note: notizteile.length === 0 ? null : notizteile.join(' · '),
      // Die Quelle nennt kein Datum je Fläche. Ein erfundenes wäre schlimmer
      // als keines.
      statedAt: null,
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
        validFrom: null,
        validTo: null,
        reviewedAt: null,
        reviewStatus: 'unreviewed',
      },
    });
  }

  records.sort((a, b) => (a.record.areaId < b.record.areaId ? -1 : 1));
  return { sourceId: SOURCE_ID, records, abgelehnt };
}
