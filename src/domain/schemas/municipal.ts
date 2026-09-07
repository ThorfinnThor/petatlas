/**
 * M11-05 — Kommunale Zusatzquelle.
 *
 * Eine kommunale Fläche ist etwas anderes als ein Ort aus OpenStreetMap: sie
 * ist eine **Aussage der zuständigen Verwaltung** über ein Stück Fläche —
 * „hier dürfen Hunde frei laufen“ oder „hier dürfen Hunde nicht mitgenommen
 * werden“. Deshalb ein eigenes Schema statt einer weiteren Kategorie in
 * `PlaceSchema`.
 *
 * Zwei Dinge, die hier bewusst fehlen:
 *
 * 1. **Keine abgeleitete Erlaubnis.** `kind` sagt nur, was die Quelle
 *    ausdrücklich ausweist. Eine Fläche, die nicht im Datensatz steht, ist
 *    weder erlaubt noch verboten, sondern unbekannt.
 * 2. **Keine Flächenzahl.** Das Freitextfeld der Quelle enthält mal „9186 m²“,
 *    mal „ca. 2900 qm“, mal „aktuell nicht nutzbar“. Daraus eine Zahl zu
 *    machen wäre erfundene Genauigkeit; der Text bleibt Text.
 */
import { z } from 'zod';

import { Coordinates, IsoDate } from './common.ts';

export const MunicipalAreaKind = z.enum([
  /** Ausdrücklich ausgewiesene Hundefreilauffläche. */
  'dog_off_leash',
  /** Ausdrückliches Hundemitnahmeverbot. */
  'dog_prohibited',
]);
export type MunicipalAreaKind = z.infer<typeof MunicipalAreaKind>;

/** Ein Ring in [Länge, Breite]-Paaren, wie GeoJSON ihn führt. */
const Ring = z.array(z.tuple([z.number(), z.number()])).min(4);

export const MunicipalAreaSchema = z
  .object({
    /** Stabile ID aus Quelle und Quell-ID, nie aus dem Namen erzeugt. */
    areaId: z.string().regex(/^[a-z0-9-]+:[A-Za-z0-9_.-]+$/, 'Erwartet wird quelle:id.'),
    sourceId: z.string().min(1),
    municipality: z.string().min(1),
    /** Bezirk laut Quelle. `null`, wenn die Quelle keinen führt. */
    district: z.string().nullable(),
    kind: MunicipalAreaKind,
    /** Bezeichnung laut Quelle. `null` heißt unbenannt, nicht namenlos. */
    name: z.string().nullable(),
    address: z.string().nullable(),
    /** Zuständige Stelle laut Quelle. */
    responsible: z.string().nullable(),
    /** Freitext der Quelle, unverändert. Keine Zahl, keine Deutung. */
    note: z.string().nullable(),
    /** Sachstand laut Quelle. */
    statedAt: IsoDate.nullable(),
    /** Berechneter Punkt der Fläche, für Anzeige und Entfernung. */
    representativePoint: Coordinates,
    /** [West, Süd, Ost, Nord]. */
    boundingBox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    /** Umrisse; der erste Ring ist außen. Für die Punkt-in-Fläche-Prüfung. */
    outline: z.array(Ring).min(1),
  })
  .strict();
export type MunicipalArea = z.infer<typeof MunicipalAreaSchema>;

export const MunicipalSnapshotSchema = z
  .object({
    source: z
      .object({
        sourceId: z.string().min(1),
        name: z.string().min(1),
        url: z.url(),
        retrievalDate: z.string().min(1),
        sourceSha256: z.string().length(64),
        licenseId: z.string().min(1),
        licenseUrl: z.url(),
        attribution: z.string().min(1),
        attributionUrl: z.url(),
        /** Wofür der Datensatz überhaupt gilt. Pflichtfeld, kein Beiwerk. */
        validity: z.string().min(1),
        parserVersion: z.string().min(1),
      })
      .strict(),
    areaCount: z.number().int().nonnegative(),
    byKind: z.record(z.string(), z.number().int().nonnegative()),
    areas: z.array(MunicipalAreaSchema),
  })
  .strict();
export type MunicipalSnapshot = z.infer<typeof MunicipalSnapshotSchema>;
