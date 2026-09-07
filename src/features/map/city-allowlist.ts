/**
 * M11-04 — Stadtseiten aus der Allowlist.
 *
 * Die Allowlist ist eine Obergrenze, keine Zusicherung: hier wird jede
 * Stadt vor dem Build erneut an den Kriterien gemessen. Erfüllt sie sie
 * nicht mehr — weil Einträge aus der Quelle verschwunden sind oder eine
 * Kategorie leer läuft —, entsteht keine Seite. Lieber keine Seite als eine
 * mit einem leeren Abschnitt.
 */
import allowlist from '../../../content-data/city-allowlist.json' with { type: 'json' };
import { CityAllowlistSchema, type CityAllowlist } from '../../domain/schemas/city.ts';
import {
  STADT_KRITERIEN,
  bewerteStadt,
  orteDerStadt,
  type StadtBefund,
  type StadtKandidat,
} from './city.ts';
import type { ListenOrt, ListenTreffer } from './list.ts';

function lade(): CityAllowlist {
  const ergebnis = CityAllowlistSchema.safeParse(allowlist);
  if (!ergebnis.success) {
    throw new Error(`content-data/city-allowlist.json ist ungültig: ${ergebnis.error.message}`);
  }
  return ergebnis.data;
}

const ALLOWLIST = lade();

export function stadtAllowlist(): CityAllowlist {
  return ALLOWLIST;
}

export interface Stadtseite {
  readonly slug: string;
  readonly stadt: StadtKandidat;
  readonly befund: StadtBefund;
  readonly treffer: readonly ListenTreffer[];
}

/**
 * Die Städte, für die tatsächlich eine Seite gebaut wird: auf der Allowlist
 * **und** aktuell geeignet. Reihenfolge: nach Slug, damit die Liste der
 * Nachbarseiten überall gleich aussieht.
 */
export function baubareStadtseiten(orte: readonly ListenOrt[]): readonly Stadtseite[] {
  return ALLOWLIST.cities
    .map((eintrag) => {
      const stadt: StadtKandidat = {
        name: eintrag.name,
        placeId: eintrag.placeId,
        latitude: eintrag.coordinates.latitude,
        longitude: eintrag.coordinates.longitude,
      };
      return {
        slug: eintrag.slug,
        stadt,
        befund: bewerteStadt(orte, stadt, STADT_KRITERIEN),
        treffer: orteDerStadt(orte, stadt, STADT_KRITERIEN),
      };
    })
    .filter((seite) => seite.befund.geeignet);
}

/** Treffer einer Stadt je Kategorie. Leere Kategorien kommen nicht vor. */
export function nachKategorie(
  treffer: readonly ListenTreffer[],
): ReadonlyMap<string, readonly ListenTreffer[]> {
  const gruppen = new Map<string, ListenTreffer[]>();
  for (const eintrag of treffer) {
    const vorhanden = gruppen.get(eintrag.ort.category);
    if (vorhanden === undefined) gruppen.set(eintrag.ort.category, [eintrag]);
    else vorhanden.push(eintrag);
  }
  return gruppen;
}
