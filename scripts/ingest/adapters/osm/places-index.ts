/**
 * M10-03 — Ortsnamen für die Suche.
 *
 * Die Namen kommen aus **derselben** freigegebenen Quelle wie die POIs. Es
 * wird ausdrücklich keine proprietäre Postleitzahlen- oder Gemeindedatenbank
 * vorausgesetzt: OSM führt Ortsknoten mit `place=city|town|village|…`, und
 * die stehen unter derselben ODbL-Lizenz wie der Rest des Extrakts.
 *
 * Ortsnamen sind in Deutschland häufig mehrdeutig. Deshalb trägt jeder
 * Eintrag mit, was ihn unterscheidbar macht, statt einen Treffer zu raten.
 */
import { createOSMStream } from 'osm-pbf-parser-node';

import type { OsmRohObjekt } from './index.ts';
import konfiguration from '../../../../config/osm-tags.json' with { type: 'json' };

const ORTSKNOTEN = konfiguration.placeNodes as {
  key: string;
  values: string[];
  populationTag: string;
  stateTag: string;
};

export type OrtsArt = 'city' | 'town' | 'village' | 'suburb' | 'borough';

export interface OrtsEintrag {
  /** Stabile Quell-ID, wie bei den POIs. */
  readonly placeId: string;
  readonly name: string;
  readonly kind: OrtsArt;
  readonly latitude: number;
  readonly longitude: number;
  /** Einwohnerzahl laut Quelle. `null`, wenn die Quelle keine nennt. */
  readonly population: number | null;
  /** Bundesland, soweit am Knoten erfasst. Hilft, Namensgleiche zu trennen. */
  readonly state: string | null;
}

function alsZahl(wert: string | undefined): number | null {
  if (wert === undefined) return null;
  // OSM schreibt Einwohnerzahlen mal mit Punkt, mal mit Leerzeichen.
  const bereinigt = wert.replace(/[.\s\u00a0]/g, '');
  if (!/^\d+$/.test(bereinigt)) return null;
  const zahl = Number(bereinigt);
  return Number.isSafeInteger(zahl) && zahl > 0 ? zahl : null;
}

/** Liest die Ortsknoten eines Extrakts. */
export async function sammleOrtsnamen(pfad: string): Promise<readonly OrtsEintrag[]> {
  const erlaubt = new Set(ORTSKNOTEN.values);
  const eintraege: OrtsEintrag[] = [];

  for await (const roh of createOSMStream(pfad, { withTags: true })) {
    const objekt = roh as OsmRohObjekt;
    if (objekt.type !== 'node') continue;
    const tags = objekt.tags ?? {};

    const art = tags[ORTSKNOTEN.key];
    if (art === undefined || !erlaubt.has(art)) continue;

    const name = tags.name?.trim();
    if (name === undefined || name === '') continue;
    if (objekt.lat === undefined || objekt.lon === undefined) continue;

    eintraege.push({
      placeId: `osm:node:${objekt.id}`,
      name,
      kind: art as OrtsArt,
      latitude: objekt.lat,
      longitude: objekt.lon,
      population: alsZahl(tags[ORTSKNOTEN.populationTag]),
      state: tags[ORTSKNOTEN.stateTag]?.trim() ?? null,
    });
  }

  // Stabile Reihenfolge, damit derselbe Eingang dieselbe Datei ergibt.
  return [...eintraege].sort((a, b) => (a.placeId < b.placeId ? -1 : 1));
}
