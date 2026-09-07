/**
 * M11-04 — Allowlist der Stadtseiten erzeugen.
 *
 * Nicht die Redaktion wählt die Städte aus, sondern die Daten: das Skript
 * misst jeden Kandidaten an `STADT_KRITERIEN` und schreibt die geeigneten in
 * `content-data/city-allowlist.json`. Wer eine weitere Stadt aufnehmen will,
 * braucht dort erfasste Orte — nicht einen Eintrag in dieser Datei.
 *
 * Ausführen: `npm run build:city-allowlist`.
 */
import { readFileSync, writeFileSync } from 'node:fs';

import { CityAllowlistSchema } from '../../src/domain/schemas/city.ts';
import type { ListenOrt } from '../../src/features/map/list.ts';
import {
  STADT_KRITERIEN,
  bewerteStadt,
  stadtSlug,
  waehleStaedte,
  type BewerteterKandidat,
} from '../../src/features/map/city.ts';
import { canonicalJson, type JsonValue } from '../normalize/canonical.ts';
import { oeffentlicheProjektion, type PlacesSnapshot } from './places.ts';

const SNAPSHOT = 'data-snapshots/places/places-de.json';
const INDEX_SNAPSHOT = 'data-snapshots/places/place-index-de.json';
const ZIEL = 'content-data/city-allowlist.json';

/**
 * Kandidaten sind Städte des Ortsindex ab dieser Einwohnerzahl. Die Schwelle
 * begrenzt nur die Rechenarbeit; ob eine Stadt eine Seite bekommt,
 * entscheiden allein die erfassten Orte.
 */
const MIN_EINWOHNER = 50_000;

interface OrtsIndexEintrag {
  readonly placeId: string;
  readonly name: string;
  readonly kind: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly population: number | null;
}

export function kandidatenAus(eintraege: readonly OrtsIndexEintrag[]): readonly OrtsIndexEintrag[] {
  return eintraege
    .filter((eintrag) => eintrag.kind === 'city' || eintrag.kind === 'town')
    .filter((eintrag) => (eintrag.population ?? 0) >= MIN_EINWOHNER)
    .slice()
    .sort((a, b) => (a.placeId < b.placeId ? -1 : 1));
}

function main(): number {
  const snapshot = JSON.parse(readFileSync(SNAPSHOT, 'utf8')) as PlacesSnapshot;
  const ortsIndex = JSON.parse(readFileSync(INDEX_SNAPSHOT, 'utf8')) as {
    entries: readonly OrtsIndexEintrag[];
  };

  const orte = snapshot.places.map(oeffentlicheProjektion) as unknown as ListenOrt[];
  const kandidaten: BewerteterKandidat[] = kandidatenAus(ortsIndex.entries).map((eintrag) => {
    const stadt = {
      name: eintrag.name,
      placeId: eintrag.placeId,
      latitude: eintrag.latitude,
      longitude: eintrag.longitude,
    };
    return { stadt, befund: bewerteStadt(orte, stadt) };
  });

  const gewaehlt = waehleStaedte(kandidaten);
  if (gewaehlt.length === 0) {
    console.error('Keine Stadt erfüllt die Kriterien. Es wird nichts geschrieben.');
    return 1;
  }

  // Slugs müssen eindeutig sein; zwei gleichnamige Städte bekämen sonst
  // dieselbe Seite. Dann lieber abbrechen als eine davon still verlieren.
  const slugs = gewaehlt.map((kandidat) => stadtSlug(kandidat.stadt.name));
  if (new Set(slugs).size !== slugs.length) {
    console.error('Zwei ausgewählte Städte ergeben denselben Slug. Auswahl prüfen.');
    return 1;
  }

  const allowlist = {
    generatedFrom: SNAPSHOT,
    builtAt: new Date().toISOString(),
    criteria: { ...STADT_KRITERIEN },
    // Sortierung nach Slug: die Datei ist damit unabhängig von der Rangfolge
    // stabil und gut zu lesen.
    cities: gewaehlt
      .map((kandidat) => ({
        slug: stadtSlug(kandidat.stadt.name),
        name: kandidat.stadt.name,
        placeId: kandidat.stadt.placeId,
        coordinates: {
          latitude: kandidat.stadt.latitude,
          longitude: kandidat.stadt.longitude,
        },
        measured: {
          total: kandidat.befund.gesamt,
          byCategory: { ...kandidat.befund.jeKategorie },
          withContact: kandidat.befund.mitKontakt,
          inMunicipality: kandidat.befund.inGemeinde,
        },
      }))
      .sort((a, b) => (a.slug < b.slug ? -1 : 1)),
  };

  const geprueft = CityAllowlistSchema.safeParse(allowlist);
  if (!geprueft.success) {
    console.error(`Erzeugte Allowlist ist ungültig: ${geprueft.error.message}`);
    return 1;
  }

  writeFileSync(ZIEL, `${canonicalJson(allowlist as unknown as JsonValue)}\n`, 'utf8');

  const abgelehnt = kandidaten.length - gewaehlt.length;
  console.log(
    `Allowlist geschrieben: ${gewaehlt.length} von ${kandidaten.length} Kandidaten ` +
      `(${abgelehnt} erfüllen die Kriterien nicht oder liegen hinter Platz ${STADT_KRITERIEN.maxStaedte}). ` +
      `Kleinster Bestand: ${Math.min(...gewaehlt.map((k) => k.befund.gesamt))} erfasste Orte.`,
  );
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
