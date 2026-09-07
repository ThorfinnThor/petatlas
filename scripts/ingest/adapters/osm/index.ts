/**
 * M10-01 — OSM-Adapter.
 *
 * Liest ein `.osm.pbf`-Extrakt **streamend** und behält nur die Objekte, die
 * eine konfigurierte Kategorie treffen. Die Datei wird nicht in ein Array
 * geladen: ein Deutschland-Extrakt hat mehrere Gigabyte.
 *
 * Für Ways und Relations wird ein repräsentativer Punkt gebraucht. Diesen
 * Schritt macht M10-02; hier werden ihre Rohdaten gesammelt, damit die
 * Geometrie später in einem zweiten Durchgang aufgelöst werden kann.
 *
 * Was hier **nicht** passiert: kein Raten, keine Überschreibung fehlender
 * Werte, keine Übernahme von Bearbeiter-Metadaten.
 */
import { createOSMStream } from 'osm-pbf-parser-node';

import { PlaceSchema, type Place } from '../../../../src/domain/schemas/places.ts';
import { repraesentativerPunkt, type Knoten } from '../../../normalize/geometry.ts';
import { IngestError } from '../../types.ts';
import type { Coordinates } from '../../../../src/domain/schemas/common.ts';
import { kategorieVon, kontaktVon, merkmaleVon, nameVon, type OsmTags } from './tags.ts';

const SOURCE_ID_PREFIX = 'osm-geofabrik';

export interface OsmRohObjekt {
  readonly type: 'node' | 'way' | 'relation';
  readonly id: number;
  readonly lat?: number;
  readonly lon?: number;
  readonly tags?: OsmTags;
  readonly refs?: number[];
}

export interface OsmImportStatistik {
  readonly gelesen: number;
  readonly getroffen: number;
  readonly uebernommen: number;
  /** Objekte mit passender Kategorie, aber ohne verwertbare Geometrie. */
  readonly ohneGeometrie: number;
  /** Objekte mit passender Kategorie, aber ohne Namen. */
  readonly ohneNamen: number;
  /** Objekte, die das Fachschema abgelehnt hat. */
  readonly abgelehnt: readonly { readonly placeId: string; readonly grund: string }[];
}

export interface OsmImportErgebnis {
  readonly places: readonly Place[];
  /** Ways und Relations, deren Punkt erst in M10-02 aufgelöst wird. */
  readonly offeneGeometrien: readonly OsmRohObjekt[];
  readonly statistik: OsmImportStatistik;
}

/** Stabile ID aus Typ und Quell-ID. Niemals aus Name oder Adresse erzeugt. */
export function stabileId(typ: OsmRohObjekt['type'], id: number): string {
  return `osm:${typ}:${id}`;
}

/**
 * Wandelt ein OSM-Objekt in einen Ort, sofern es alles Nötige hat.
 * `null` heißt: nicht verwertbar — mit benanntem Grund in der Statistik.
 */
export function alsOrt(objekt: OsmRohObjekt, punkt?: Coordinates | null): Place | null {
  const tags = objekt.tags ?? {};
  const category = kategorieVon(tags);
  if (category === null) return null;

  const name = nameVon(tags);
  if (name === null) return null;

  const koordinaten =
    punkt ??
    (objekt.lat !== undefined && objekt.lon !== undefined
      ? { latitude: objekt.lat, longitude: objekt.lon }
      : null);
  // Ohne brauchbaren Punkt gibt es keinen Ort. Kein Ersatzwert.
  if (koordinaten === null) return null;

  const kontakt = kontaktVon(tags);
  const merkmale = merkmaleVon(tags);

  const kandidat = {
    placeId: stabileId(objekt.type, objekt.id),
    name,
    category,
    coordinates: koordinaten,
    coordinateSource:
      objekt.type === 'node'
        ? ('node' as const)
        : objekt.type === 'way'
          ? ('way_centroid' as const)
          : ('relation_centroid' as const),
    municipality: kontakt.municipality,
    postalCode: kontakt.postalCode,
    phone: kontakt.phone,
    website: kontakt.website,
    openingHours: kontakt.openingHours,
    emergency: merkmale.emergency,
    wheelchair: merkmale.wheelchair,
    fenced: merkmale.fenced,
    dogAllowed: merkmale.dogAllowed,
  };

  const ergebnis = PlaceSchema.safeParse(kandidat);
  return ergebnis.success ? ergebnis.data : null;
}

/**
 * Löst die Punkte offener Ways und Relations in einem zweiten Durchgang auf.
 *
 * Der erste Durchgang weiß noch nicht, welche Knoten gebraucht werden; der
 * zweite sammelt genau diese. Eine Fläche ohne auflösbare Knoten wird
 * verworfen und **nicht** mit einem Ersatzpunkt versehen.
 */
export function loeseGeometrienAuf(
  offene: readonly OsmRohObjekt[],
  knoten: ReadonlyMap<number, Knoten>,
): { readonly places: readonly Place[]; readonly ohneGeometrie: readonly string[] } {
  const places: Place[] = [];
  const ohneGeometrie: string[] = [];

  for (const objekt of offene) {
    const referenzen = objekt.refs ?? [];
    const gefunden = referenzen
      .map((ref) => knoten.get(ref))
      .filter((punkt): punkt is Knoten => punkt !== undefined);

    const punkt = repraesentativerPunkt(gefunden);
    if (punkt === null) {
      ohneGeometrie.push(stabileId(objekt.type, objekt.id));
      continue;
    }

    const ort = alsOrt(objekt, punkt);
    if (ort === null) ohneGeometrie.push(stabileId(objekt.type, objekt.id));
    else places.push(ort);
  }

  return { places, ohneGeometrie };
}

/** Wie `alsOrt`, meldet aber den Grund einer Ablehnung. */
export function pruefeOrt(objekt: OsmRohObjekt): { ort: Place | null; grund: string | null } {
  const tags = objekt.tags ?? {};
  if (kategorieVon(tags) === null) return { ort: null, grund: null };
  if (nameVon(tags) === null) return { ort: null, grund: 'ohne Namen' };
  if (objekt.lat === undefined || objekt.lon === undefined) {
    return { ort: null, grund: 'ohne Geometrie' };
  }

  const ort = alsOrt(objekt);
  if (ort === null) {
    const kandidat = { ...objekt };
    return {
      ort: null,
      grund: `vom Fachschema abgelehnt (${stabileId(kandidat.type, kandidat.id)})`,
    };
  }
  return { ort, grund: null };
}

/**
 * Liest ein Extrakt und gibt die verwertbaren Orte zurück.
 *
 * @param sourceId Registryeintrag der Distribution; er bestimmt Rechte und
 *                 Attribution und muss ein OSM-Extrakt sein.
 */
export async function importiereExtrakt(
  pfad: string,
  sourceId: string,
): Promise<OsmImportErgebnis> {
  if (!sourceId.startsWith(SOURCE_ID_PREFIX)) {
    throw new IngestError(sourceId, 'parse', `${sourceId} ist kein OSM-Extrakt.`);
  }

  const places: Place[] = [];
  const offeneGeometrien: OsmRohObjekt[] = [];
  const abgelehnt: { placeId: string; grund: string }[] = [];
  let gelesen = 0;
  let getroffen = 0;
  let ohneGeometrie = 0;
  let ohneNamen = 0;

  for await (const eintrag of createOSMStream(pfad, { withTags: true })) {
    const objekt = eintrag as OsmRohObjekt;
    if (objekt.type !== 'node' && objekt.type !== 'way' && objekt.type !== 'relation') continue;
    gelesen += 1;

    const tags = objekt.tags ?? {};
    if (kategorieVon(tags) === null) continue;
    getroffen += 1;

    if (nameVon(tags) === null) {
      ohneNamen += 1;
      continue;
    }

    if (objekt.type !== 'node') {
      // Ways und Relations brauchen einen berechneten Punkt (M10-02).
      offeneGeometrien.push(objekt);
      continue;
    }

    if (objekt.lat === undefined || objekt.lon === undefined) {
      ohneGeometrie += 1;
      continue;
    }

    const ort = alsOrt(objekt);
    if (ort === null) {
      abgelehnt.push({
        placeId: stabileId(objekt.type, objekt.id),
        grund: 'vom Fachschema abgelehnt',
      });
      continue;
    }
    places.push(ort);
  }

  return {
    places,
    offeneGeometrien,
    statistik: {
      gelesen,
      getroffen,
      uebernommen: places.length,
      ohneGeometrie,
      ohneNamen,
      abgelehnt,
    },
  };
}

/**
 * Vollständiger Import in zwei Durchgängen.
 *
 * Der erste Durchgang findet die interessanten Objekte, der zweite holt
 * genau die Knoten, die deren Flächen brauchen. Zwei Durchgänge sind
 * billiger als ein Durchgang, der vorsorglich alle zwei Millionen
 * Knotenpositionen im Speicher hält.
 */
export async function importiereExtraktVollstaendig(
  pfad: string,
  sourceId: string,
): Promise<OsmImportErgebnis & { readonly ohneGeometrie: readonly string[] }> {
  const erster = await importiereExtrakt(pfad, sourceId);

  const gebraucht = new Set<number>();
  for (const objekt of erster.offeneGeometrien) {
    for (const ref of objekt.refs ?? []) gebraucht.add(ref);
  }

  const knoten = new Map<number, Knoten>();
  if (gebraucht.size > 0) {
    for await (const eintrag of createOSMStream(pfad, { withTags: false })) {
      const objekt = eintrag as OsmRohObjekt;
      if (objekt.type !== 'node') continue;
      if (!gebraucht.has(objekt.id)) continue;
      if (objekt.lat === undefined || objekt.lon === undefined) continue;
      knoten.set(objekt.id, { lat: objekt.lat, lon: objekt.lon });
    }
  }

  const aufgeloest = loeseGeometrienAuf(erster.offeneGeometrien, knoten);

  return {
    places: [...erster.places, ...aufgeloest.places],
    offeneGeometrien: [],
    ohneGeometrie: aufgeloest.ohneGeometrie,
    statistik: {
      ...erster.statistik,
      uebernommen: erster.places.length + aufgeloest.places.length,
      ohneGeometrie: erster.statistik.ohneGeometrie + aufgeloest.ohneGeometrie.length,
    },
  };
}
