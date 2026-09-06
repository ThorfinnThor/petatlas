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
import { IngestError } from '../../types.ts';
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
export function alsOrt(objekt: OsmRohObjekt): Place | null {
  const tags = objekt.tags ?? {};
  const category = kategorieVon(tags);
  if (category === null) return null;

  const name = nameVon(tags);
  if (name === null) return null;
  if (objekt.lat === undefined || objekt.lon === undefined) return null;

  const kontakt = kontaktVon(tags);
  const merkmale = merkmaleVon(tags);

  const kandidat = {
    placeId: stabileId(objekt.type, objekt.id),
    name,
    category,
    coordinates: { latitude: objekt.lat, longitude: objekt.lon },
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
