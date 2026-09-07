/**
 * M05-01 — Source Registry.
 *
 * Ein Eintrag beschreibt genau eine **Distribution**: eine konkrete Datei,
 * einen konkreten Endpunkt, einen konkreten Feed. Ein Anbietername wie
 * „GovData“ oder „OpenStreetMap“ ist kein Eintrag, weil sich Format, Lizenz
 * und Aktualität zwischen zwei Distributionen desselben Anbieters
 * unterscheiden.
 *
 * Neue Einträge sind `pending`. `pending` heißt: Adapter bauen ja,
 * veröffentlichen nein.
 */
import { z } from 'zod';

import got from '../../config/sources/got.json' with { type: 'json' };
import regionen from '../../config/sources/osm-regions.json' with { type: 'json' };
import osm from '../../config/sources/osm-geofabrik-de.json' with { type: 'json' };
import { SourceRightsSchema, type SourceRights } from './rights.ts';

export const SourceFormat = z.enum(['html', 'xml', 'json', 'csv', 'pbf', 'zip']);

export const SourceEntrySchema = z
  .object({
    sourceId: z.string().min(1),
    publisher: z.string().min(1),
    /** Name genau dieser Distribution, nicht des Anbieters. */
    resourceName: z.string().min(1),
    distributionUrl: z.url(),
    /** Wo die geltenden Bedingungen stehen. Pflicht, auch bei `pending`. */
    primaryTermsUrl: z.url(),
    format: SourceFormat,
    coverage: z.object({ spatial: z.string().min(1), temporal: z.string().min(1) }).strict(),
    updateCadence: z.string().min(1),
    role: z.string().min(1),
    rights: SourceRightsSchema,
    /** Wortlaut des Pflichthinweises, wie die Quelle ihn verlangt. */
    attributionText: z.string().min(1).optional(),
    /** Ziel des Attributionslinks, falls die Quelle einen verlangt. */
    attributionUrl: z.url().optional(),
    notes: z.array(z.string()),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.rights.sourceId !== value.sourceId) {
      ctx.addIssue({
        code: 'custom',
        message: `Rechteeintrag gehört zu ${value.rights.sourceId}, nicht zu ${value.sourceId}.`,
        path: ['rights', 'sourceId'],
      });
    }
    if (
      value.rights.attributionRequired &&
      value.rights.status === 'verified' &&
      !value.attributionText
    ) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Attribution ist Pflicht: eine verifizierte Quelle braucht den verlangten Wortlaut in attributionText.',
        path: ['attributionText'],
      });
    }
    // Ein Anbietername als resourceName ist der häufigste Registryfehler.
    if (value.resourceName.trim().split(/\s+/).length < 2) {
      ctx.addIssue({
        code: 'custom',
        message: 'resourceName muss die konkrete Distribution benennen, nicht nur den Anbieter.',
        path: ['resourceName'],
      });
    }
  });

export type SourceEntry = z.infer<typeof SourceEntrySchema>;

function parseEntry(raw: unknown): SourceEntry {
  const result = SourceEntrySchema.safeParse(raw);
  if (!result.success) {
    const id =
      typeof raw === 'object' && raw !== null && 'sourceId' in raw ? String(raw.sourceId) : '?';
    throw new Error(`Registryeintrag ${id} ist ungültig: ${result.error.message}`);
  }
  return result.data;
}

/**
 * Die deutschen Regionalextrakte. Jede Region ist eine eigene Distribution —
 * eigene Adresse, eigene Abdeckung, eigener Stand. Die Rechtelage ist für
 * alle dieselbe und wurde einmal geprüft; der gemeinsame Teil steht deshalb
 * einmal in der Konfiguration statt sechzehnmal kopiert.
 */
function regionaleEintraege(): SourceEntry[] {
  return regionen.regions.map((region) =>
    parseEntry({
      sourceId: `osm-geofabrik-${region.id}-pbf`,
      publisher: regionen.publisher,
      resourceName: `OpenStreetMap-Extrakt ${region.name}, Format .osm.pbf`,
      distributionUrl: regionen.urlTemplate.replace('{region}', region.id),
      primaryTermsUrl: regionen.primaryTermsUrl,
      format: 'pbf',
      coverage: { spatial: region.iso, temporal: 'tägliches Extrakt' },
      updateCadence: 'täglich',
      role: regionen.role,
      attributionText: regionen.attributionText,
      attributionUrl: regionen.attributionUrl,
      rights: { ...regionen.rights, sourceId: `osm-geofabrik-${region.id}-pbf` },
      notes: [
        `Regionalextrakt ${region.name} (${region.iso}). Eine Region ist eine eigene Distribution.`,
        'Die Rechtelage entspricht der geprüften Fassung des Deutschland- und des Bremen-Extrakts.',
      ],
    }),
  );
}

const ENTRIES: readonly SourceEntry[] = [got, osm].map(parseEntry).concat(regionaleEintraege());

const BY_ID = new Map(ENTRIES.map((entry) => [entry.sourceId, entry]));

export function allSources(): readonly SourceEntry[] {
  return ENTRIES;
}

export function getSource(sourceId: string): SourceEntry | undefined {
  return BY_ID.get(sourceId);
}

export function requireSource(sourceId: string): SourceEntry {
  const entry = BY_ID.get(sourceId);
  if (!entry) throw new Error(`Unbekannte Quelle: ${sourceId}`);
  return entry;
}

/** Quellen, deren Rechte geprüft und bestätigt sind. */
export function verifiedSources(): readonly SourceEntry[] {
  return ENTRIES.filter((entry) => entry.rights.status === 'verified');
}

/** Quellen, die noch keine Freigabe haben. Sie dürfen nichts veröffentlichen. */
export function pendingSources(): readonly SourceEntry[] {
  return ENTRIES.filter((entry) => entry.rights.status !== 'verified');
}

export function rightsFor(sourceId: string): SourceRights {
  return requireSource(sourceId).rights;
}
