/**
 * M06-01 — Referenzadapter gegen eine synthetische Quelle.
 *
 * Zweck ist die Prüfung der Adapter-API, nicht das Einlesen echter Daten.
 * Die Eingabedaten sind eindeutig erfunden (`fixtures/places.de.sample.json`).
 * Der echte OSM-Adapter entsteht in M10 und benutzt dieselbe Schnittstelle.
 */
import { PlaceSchema, type Place } from '../../../src/domain/schemas/index.ts';
import { requireSource } from '../../../src/domain/source-registry.ts';
import { IngestError, type FetchedResource, type SourceAdapter } from '../types.ts';

interface RawPlace {
  id: string;
  name: string;
  city: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  openingHours: string | null;
}

const NORMALIZATION_VERSION = '1';

export function createSyntheticPlacesAdapter(): SourceAdapter<RawPlace, Place> {
  const source = requireSource('osm-geofabrik-germany-pbf');

  return {
    sourceId: source.sourceId,
    source,

    parse(resource: FetchedResource) {
      let payload: unknown;
      try {
        payload = JSON.parse(new TextDecoder().decode(resource.body));
      } catch (cause) {
        throw new IngestError(source.sourceId, 'parse', 'Eingabe ist kein gültiges JSON.', {
          cause,
        });
      }

      if (
        typeof payload !== 'object' ||
        payload === null ||
        !('places' in payload) ||
        !Array.isArray(payload.places)
      ) {
        throw new IngestError(
          source.sourceId,
          'parse',
          'Feld "places" fehlt oder ist keine Liste.',
        );
      }

      return {
        sourceId: source.sourceId,
        records: payload.places as RawPlace[],
        sourceVersion:
          'marketId' in payload && typeof payload.marketId === 'string' ? payload.marketId : null,
      };
    },

    normalize(batch, resource) {
      return {
        sourceId: source.sourceId,
        records: batch.records.map((raw) => ({
          record: {
            // Stabile Quell-ID, nicht aus Name oder Adresse erzeugt.
            placeId: `osm:node:${raw.id.replace(/\D/g, '') || '0'}`,
            name: raw.name,
            category: 'veterinary' as const,
            coordinates: { latitude: raw.latitude, longitude: raw.longitude },
            municipality: raw.city,
            postalCode: raw.postalCode,
            // Unbekannt bleibt null; es wird nichts geraten.
            phone: raw.phone,
            website: null,
            openingHours: raw.openingHours,
            emergency: null,
            wheelchair: null,
            fenced: null,
            dogAllowed: null,
          },
          provenance: {
            sourceId: source.sourceId,
            sourceRecordId: raw.id,
            sourceUrl: source.distributionUrl,
            retrievedAt: resource.retrievedAt,
            sourceUpdatedAt: null,
            contentHash: resource.contentHash,
            licenseId: source.rights.licenseId ?? 'unbekannt',
            normalizationVersion: NORMALIZATION_VERSION,
            validFrom: null,
            validTo: null,
            // Ein Abruf ist keine fachliche Prüfung.
            reviewedAt: null,
            reviewStatus: 'unreviewed' as const,
          },
        })),
      };
    },

    validate(batch) {
      const valid: (typeof batch.records)[number][] = [];
      const rejected: { index: number; reason: string }[] = [];

      batch.records.forEach((eintrag, index) => {
        const result = PlaceSchema.safeParse(eintrag.record);
        if (result.success) valid.push(eintrag);
        // Ungültige Datensätze fallen nicht still weg, sie werden gemeldet.
        else rejected.push({ index, reason: result.error.issues[0]?.message ?? 'ungültig' });
      });

      return { valid, rejected };
    },
  };
}
