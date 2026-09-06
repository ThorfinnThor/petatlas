/**
 * M06-03 — Normalisierung von Ortsdaten in eine deterministische Ausgabe.
 *
 * Nimmt validierte Datensätze eines Adapters und erzeugt daraus die Form,
 * die später als JSON ausgeliefert wird: stabil sortiert, ohne Dubletten,
 * mit erhaltener Provenienz und ohne Laufmetadaten im Inhalts-Hash.
 */
import type { NormalizedRecord } from '../ingest/types.ts';
import type { Place } from '../../src/domain/schemas/index.ts';
import { assertUniqueKeys, contentHashOf, sortStable, type JsonValue } from './canonical.ts';

export interface NormalizedPlacesOutput {
  readonly marketId: string;
  readonly sourceId: string;
  readonly licenseId: string;
  readonly attribution: string;
  readonly places: readonly Place[];
  /** Provenienz je Datensatz, über die stabile Orts-ID zugeordnet. */
  readonly provenance: Readonly<
    Record<string, Omit<NormalizedRecord<Place>['provenance'], 'retrievedAt'>>
  >;
  /** Hash der Fachdaten ohne Laufmetadaten. */
  readonly contentHash: string;
  /** Laufmetadaten, ausdrücklich getrennt und nicht im Hash. */
  readonly retrievedAt: string;
}

export function normalizePlaces(
  records: readonly NormalizedRecord<Place>[],
  options: { marketId: string; sourceId: string; licenseId: string; attribution: string },
): NormalizedPlacesOutput {
  const sortiert = sortStable(records, (eintrag) => eintrag.record.placeId);
  assertUniqueKeys(sortiert, (eintrag) => eintrag.record.placeId);

  const places = sortiert.map((eintrag) => eintrag.record);

  const provenance: Record<string, Omit<NormalizedRecord<Place>['provenance'], 'retrievedAt'>> = {};
  let letzterAbruf = '';
  for (const eintrag of sortiert) {
    const { retrievedAt, ...rest } = eintrag.provenance;
    provenance[eintrag.record.placeId] = rest;
    if (retrievedAt > letzterAbruf) letzterAbruf = retrievedAt;
  }

  const fachdaten = {
    marketId: options.marketId,
    sourceId: options.sourceId,
    licenseId: options.licenseId,
    attribution: options.attribution,
    places,
    provenance,
  } as unknown as JsonValue;

  return {
    marketId: options.marketId,
    sourceId: options.sourceId,
    licenseId: options.licenseId,
    attribution: options.attribution,
    places,
    provenance,
    contentHash: contentHashOf(fachdaten),
    retrievedAt: letzterAbruf,
  };
}
