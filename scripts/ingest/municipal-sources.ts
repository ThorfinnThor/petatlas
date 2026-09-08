/**
 * M20-03 — Verzeichnis der kommunalen Quellen.
 *
 * Mit der zweiten Stadt hörte „die kommunale Quelle“ auf, eine Sache zu sein.
 * Statt den Snapshot-Lauf und die Konfliktprüfung je Stadt zu kopieren, steht
 * hier **eine** Beschreibung je Quelle, aus der beide sich bedienen.
 *
 * Bewusst nicht hier: irgendeine Aussage über Flächen. Diese Datei sagt, wo
 * eine Quelle liegt, wofür sie gilt und welcher Parser sie liest — nicht, was
 * an einer Stelle erlaubt ist.
 *
 * Die `huelle` ist kein Auswahlkriterium, sondern ein Sicherheitsnetz: eine
 * Fläche außerhalb der eigenen Gemeinde bedeutet, dass Koordinaten vertauscht
 * oder in einem anderen Bezugssystem angekommen sind. Dann wird abgebrochen,
 * statt eine verschobene Stadt zu veröffentlichen.
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

import type { MunicipalArea } from '../../src/domain/schemas/municipal.ts';
import { requireSource } from '../../src/domain/source-registry.ts';
import type { Provenance } from '../../src/domain/source.ts';
import * as berlin from './adapters/municipal/berlin-hundefreilauf.ts';
import * as hamburg from './adapters/municipal/hamburg-hundeauslaufzonen.ts';
import { fetchSource } from './fetch.ts';
import type { FetchedResource } from './types.ts';

export interface Huelle {
  readonly minLat: number;
  readonly maxLat: number;
  readonly minLon: number;
  readonly maxLon: number;
}

export interface Ergebnis {
  readonly records: readonly { readonly record: MunicipalArea; readonly provenance: Provenance }[];
  readonly abgelehnt: readonly { readonly id: string; readonly grund: string }[];
}

export interface KommunaleQuelle {
  /** ID in der Source Registry; sie bestimmt Adresse, Lizenz und Rechte. */
  readonly sourceId: string;
  readonly gemeinde: string;
  /** Kartenslug der Stadt, an dem die Flächen später angezeigt werden. */
  readonly stadtSlug: string;
  readonly snapshotPfad: string;
  readonly parserVersion: string;
  /** Wofür der Datensatz gilt. Steht im Snapshot, weil es zur Aussage gehört. */
  readonly geltung: string;
  readonly huelle: Huelle;
  /**
   * Weitere Quell-IDs, die derselbe Lauf braucht — etwa die Trefferzahl zur
   * Vollständigkeitsprüfung. Sie werden mitgeholt, aber nichts aus ihnen wird
   * veröffentlicht.
   */
  readonly hilfsquellen: readonly { readonly sourceId: string; readonly datei: string }[];
  /** Im Repository liegende Antwort, damit Builds nie am Netz hängen. */
  readonly lokaleQuelle: string;
  /** Abrufzeitpunkt der abgelegten Antwort. Nie „jetzt“. */
  readonly lokalAbgerufenAm: string;
  readonly lokalerContentType: string;
  verarbeite(haupt: FetchedResource, hilfen: readonly FetchedResource[]): Ergebnis;
}

export const KOMMUNALE_QUELLEN: readonly KommunaleQuelle[] = [
  {
    sourceId: berlin.SOURCE_ID,
    gemeinde: 'Berlin',
    stadtSlug: 'berlin',
    snapshotPfad: 'data-snapshots/municipal/berlin-hundefreilauf.json',
    parserVersion: berlin.PARSER_VERSION,
    geltung:
      'Ausgewiesene Hundefreilaufflächen und Hundemitnahmeverbote in den Bezirken ' +
      'Charlottenburg-Wilmersdorf, Friedrichshain-Kreuzberg und Reinickendorf sowie eine Fläche in ' +
      'Steglitz-Zehlendorf. Eine Fläche, die hier fehlt, ist weder erlaubt noch verboten, sondern ' +
      'nicht erfasst.',
    huelle: { minLat: 52.3, maxLat: 52.7, minLon: 13.0, maxLon: 13.8 },
    hilfsquellen: [],
    lokaleQuelle: 'tests/fixtures/municipal/berlin-hundefreilauf.geojson',
    lokalAbgerufenAm: '2026-09-07T00:00:00+00:00',
    lokalerContentType: 'application/json',
    verarbeite: (haupt) => berlin.normalizeFlaechen(berlin.parseGeoJson(haupt), haupt),
  },
  {
    sourceId: hamburg.SOURCE_ID,
    gemeinde: 'Hamburg',
    stadtSlug: 'hamburg',
    snapshotPfad: 'data-snapshots/municipal/hamburg-hundeauslaufzonen.json',
    parserVersion: hamburg.PARSER_VERSION,
    geltung:
      'Ausgewiesene Hundeauslaufzonen nach § 8 Hamburgisches Hundegesetz im gesamten Stadtgebiet. ' +
      'Der Datensatz sagt nichts über Flächen nach § 9 (Freilauf nur für geprüfte Hunde) und nichts ' +
      'über Verbote. Eine Fläche, die hier fehlt, ist weder erlaubt noch verboten, sondern nicht ' +
      'als Auslaufzone ausgewiesen.',
    huelle: { minLat: 53.3, maxLat: 54.0, minLon: 8.4, maxLon: 10.4 },
    hilfsquellen: [
      {
        sourceId: hamburg.ANZAHL_SOURCE_ID,
        datei: 'tests/fixtures/municipal/hamburg-hundeauslaufzonen-hits.xml',
      },
    ],
    lokaleQuelle: 'tests/fixtures/municipal/hamburg-hundeauslaufzonen.geojson',
    lokalAbgerufenAm: '2026-09-08T00:00:00+00:00',
    lokalerContentType: 'application/geo+json',
    verarbeite: (haupt, hilfen) => {
      const hits = hilfen[0];
      if (hits === undefined) {
        throw new Error(
          'Die Trefferzahl fehlt. Ohne sie wird nicht übernommen: ein Teilimport bliebe unbemerkt.',
        );
      }
      const erwartet = hamburg.trefferzahl(hits);
      return hamburg.normalizeZonen(hamburg.parseGeoJson(haupt, erwartet), haupt);
    },
  },
];

export function quelleOderFehler(sourceId: string): KommunaleQuelle {
  const treffer = KOMMUNALE_QUELLEN.find((quelle) => quelle.sourceId === sourceId);
  if (treffer === undefined) {
    throw new Error(
      `Unbekannte kommunale Quelle "${sourceId}". Bekannt: ${KOMMUNALE_QUELLEN.map(
        (quelle) => quelle.sourceId,
      ).join(', ')}.`,
    );
  }
  return treffer;
}

/** Liest eine im Repository abgelegte Antwort als Ressource. */
export function ausDatei(
  sourceId: string,
  pfad: string,
  abgerufenAm: string,
  contentType: string,
): FetchedResource {
  const body = new Uint8Array(readFileSync(pfad));
  return {
    sourceId,
    url: requireSource(sourceId).distributionUrl,
    body,
    contentType,
    contentHash: createHash('sha256').update(body).digest('hex'),
    retrievedAt: abgerufenAm,
    etag: null,
    lastModified: null,
  };
}

/** Holt Haupt- und Hilfsressourcen einer Quelle — je einmal, nicht in Schleife. */
export async function holeRessourcen(
  quelle: KommunaleQuelle,
  mitAbruf: boolean,
): Promise<{ haupt: FetchedResource; hilfen: readonly FetchedResource[] }> {
  if (!mitAbruf) {
    return {
      haupt: ausDatei(
        quelle.sourceId,
        quelle.lokaleQuelle,
        quelle.lokalAbgerufenAm,
        quelle.lokalerContentType,
      ),
      hilfen: quelle.hilfsquellen.map((hilfe) =>
        ausDatei(hilfe.sourceId, hilfe.datei, quelle.lokalAbgerufenAm, 'application/xml'),
      ),
    };
  }

  const hauptErgebnis = await fetchSource(quelle.sourceId);
  if (hauptErgebnis.status !== 'fetched' || hauptErgebnis.resource === null) {
    throw new Error('Quelle meldet keine Änderung; der vorhandene Snapshot bleibt gültig.');
  }

  const hilfen: FetchedResource[] = [];
  for (const hilfe of quelle.hilfsquellen) {
    const ergebnis = await fetchSource(hilfe.sourceId);
    if (ergebnis.status !== 'fetched' || ergebnis.resource === null) {
      throw new Error(
        `Hilfsquelle ${hilfe.sourceId} lieferte nichts. Ohne sie wird nicht übernommen.`,
      );
    }
    hilfen.push(ergebnis.resource);
  }
  return { haupt: hauptErgebnis.resource, hilfen };
}

/**
 * Liegt jede Fläche in der eigenen Gemeinde? Ein „nein“ heißt nicht, dass die
 * Stadt gewachsen ist, sondern dass Koordinaten vertauscht wurden.
 */
export function ausserhalbDerHuelle(
  flaechen: readonly MunicipalArea[],
  huelle: Huelle,
): readonly MunicipalArea[] {
  return flaechen.filter(
    (flaeche) =>
      flaeche.representativePoint.latitude < huelle.minLat ||
      flaeche.representativePoint.latitude > huelle.maxLat ||
      flaeche.representativePoint.longitude < huelle.minLon ||
      flaeche.representativePoint.longitude > huelle.maxLon,
  );
}
