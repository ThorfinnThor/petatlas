/**
 * M03-04 — Orte.
 *
 * Die ID kommt aus der Quelle (`osm:node:12345`) und wird nie aus Name oder
 * Adresse erzeugt: Namen ändern sich, IDs sollen stabil bleiben.
 *
 * `emergency`, `wheelchair`, `fenced` und `dogAllowed` sind tri-state. Eine
 * fehlende OSM-Angabe heißt „nicht erfasst“, nicht „nein“.
 */
import { z } from 'zod';

import { Coordinates, TriState } from './common.ts';

export const PlaceCategory = z.enum([
  'veterinary',
  'animal_clinic',
  'animal_shelter',
  'pet_shop',
  'dog_park',
  'other',
]);
export type PlaceCategory = z.infer<typeof PlaceCategory>;

export const PlaceSchema = z
  .object({
    /** Stabile Quell-ID, z. B. osm:node:12345. */
    placeId: z.string().regex(/^[a-z]+:[a-z]+:\d+$/, 'Erwartet wird eine Quell-ID wie osm:node:1.'),
    name: z.string().min(1),
    category: PlaceCategory,
    coordinates: Coordinates,
    /**
     * Woher der Punkt stammt. Ein Node hat eine erfasste Koordinate; bei
     * einer Fläche ist der Punkt berechnet und liegt nicht zwingend auf dem
     * Grundstück. Diese Unterscheidung gehört in die Anzeige, nicht nur in
     * die Daten.
     */
    coordinateSource: z.enum(['node', 'way_centroid', 'relation_centroid']),
    /** Gemeinde laut Quelle. `null`, wenn nur der Umkreis bekannt ist. */
    municipality: z.string().nullable(),
    postalCode: z
      .string()
      .regex(/^\d{5}$/)
      .nullable(),
    /** Nur übernehmen, wenn Quelle und Datenschutzprüfung das tragen. */
    phone: z.string().nullable(),
    website: z.url().nullable(),
    openingHours: z.string().nullable(),
    emergency: TriState,
    wheelchair: TriState,
    fenced: TriState,
    dogAllowed: TriState,
  })
  .strict();
export type Place = z.infer<typeof PlaceSchema>;

/**
 * Ein Tierarzt ist nicht automatisch eine Klinik und schon gar kein
 * Notdienst. Nur ein ausdrückliches `true` zählt.
 */
export function isEmergencyService(place: Place): boolean {
  return place.emergency === true;
}

/**
 * Beschreibt die Ortszuordnung wahrheitsgemäß: ohne bekannte Gemeinde ist ein
 * Treffer „im Umkreis“, nicht „in der Gemeinde“.
 */
export function locationLabel(place: Place, searchedMunicipality: string): string {
  return place.municipality === searchedMunicipality
    ? `in ${searchedMunicipality}`
    : `im Umkreis von ${searchedMunicipality}`;
}
