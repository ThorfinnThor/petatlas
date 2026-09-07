/**
 * M11-04 — Allowlist der lokalen Stadtseiten.
 *
 * Die Datei `content-data/city-allowlist.json` sagt, welche Städte eine
 * eigene Seite bekommen **dürfen** — nicht, wie viel dort zu finden ist. Die
 * mitgeführten Messwerte sind der Stand der Erzeugung und werden im Build
 * gegen die aktuellen Daten neu gemessen; weichen sie ab, gilt die Messung,
 * nicht die Datei.
 */
import { z } from 'zod';

import { Coordinates, IsoTimestamp } from './common.ts';

const Anzahl = z.number().int().nonnegative();

export const CityCriteriaSchema = z
  .object({
    radiusMeter: z.number().int().positive(),
    minJeKategorie: Anzahl,
    minGesamt: Anzahl,
    minTierarztpraxen: Anzahl,
    minMitKontakt: Anzahl,
    minInGemeinde: Anzahl,
    maxStaedte: z.number().int().positive(),
  })
  .strict();
export type CityCriteria = z.infer<typeof CityCriteriaSchema>;

export const CityAllowlistEntrySchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Slug erwartet, z. B. muelheim-an-der-ruhr.'),
    name: z.string().min(1),
    /** Quell-ID des Ortspunkts. Nie aus dem Namen erzeugt. */
    placeId: z.string().regex(/^[a-z]+:[a-z]+:\d+$/, 'Erwartet wird eine Quell-ID wie osm:node:1.'),
    coordinates: Coordinates,
    /** Gemessener Stand bei der Erzeugung, rein informativ. */
    measured: z
      .object({
        total: Anzahl,
        byCategory: z.record(z.string(), Anzahl),
        withContact: Anzahl,
        inMunicipality: Anzahl,
      })
      .strict(),
  })
  .strict();
export type CityAllowlistEntry = z.infer<typeof CityAllowlistEntrySchema>;

export const CityAllowlistSchema = z
  .object({
    /** Snapshot, aus dem die Auswahl entstanden ist. */
    generatedFrom: z.string().min(1),
    /** Laufmetadatum; steht bewusst nicht im Inhalts-Hash der Fachdaten. */
    builtAt: IsoTimestamp,
    criteria: CityCriteriaSchema,
    cities: z.array(CityAllowlistEntrySchema),
  })
  .strict()
  .refine((wert) => wert.cities.length <= wert.criteria.maxStaedte, {
    message: 'Mehr Städte als die eigene Obergrenze erlaubt.',
    path: ['cities'],
  })
  .refine((wert) => new Set(wert.cities.map((stadt) => stadt.slug)).size === wert.cities.length, {
    message: 'Slugs müssen eindeutig sein, sonst kollidieren zwei Seiten.',
    path: ['cities'],
  });
export type CityAllowlist = z.infer<typeof CityAllowlistSchema>;
