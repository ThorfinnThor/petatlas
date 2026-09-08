/**
 * M11-05 / M20-03 — Abgleich der kommunalen Quellen mit den OSM-Ortsdaten.
 *
 * Das Skript entscheidet nichts, es macht sichtbar: welche Hundewiesen die
 * Verwaltung bestätigt, welche ihr widersprechen, zu welchen sie schweigt und
 * welche Flächen nur sie kennt.
 *
 * Ein Widerspruch ist **kein Fehlerzustand** dieses Skripts: zwei Quellen
 * dürfen sich widersprechen, das muss nur sichtbar bleiben. Exit 1 gibt es
 * bei echten Datenfehlern — etwa einer Fläche außerhalb der eigenen
 * Gemeinde oder einer abgeleiteten Erlaubnis ohne Beleg.
 *
 * Geprüft werden alle Quellen aus `scripts/ingest/municipal-sources.ts`.
 * Jede Stadt wird für sich abgeglichen: Berliner Flächen sagen nichts über
 * Hamburger Wiesen, und ein fehlender Hamburger Snapshot darf den Berliner
 * Befund nicht verfälschen.
 *
 * Ausführen: `npm run check:municipal`
 */
import { existsSync, readFileSync } from 'node:fs';

import {
  KOMMUNALE_QUELLEN,
  ausserhalbDerHuelle,
  type KommunaleQuelle,
} from '../ingest/municipal-sources.ts';
import { MunicipalSnapshotSchema, type MunicipalArea } from '../../src/domain/schemas/municipal.ts';
import type { Place } from '../../src/domain/schemas/places.ts';
import { belegteHundeerlaubnis, gleicheAb, type Zuordnung } from '../normalize/municipal.ts';

const ORTE = 'data-snapshots/places/places-de.json';

export interface Befund {
  readonly art: 'fehler' | 'hinweis';
  readonly text: string;
}

export function pruefeFlaechen(
  flaechen: readonly MunicipalArea[],
  quelle: Pick<KommunaleQuelle, 'gemeinde' | 'huelle'>,
): Befund[] {
  const befunde: Befund[] = [];

  const ausserhalb = ausserhalbDerHuelle(flaechen, quelle.huelle);
  if (ausserhalb.length > 0) {
    befunde.push({
      art: 'fehler',
      text: `${ausserhalb.length} Fläche(n) liegen außerhalb von ${quelle.gemeinde}: ${ausserhalb
        .map((flaeche) => flaeche.areaId)
        .join(', ')}.`,
    });
  }

  // Eine Erlaubnis darf nur dort stehen, wo die Quelle sie ausweist.
  for (const flaeche of flaechen) {
    const aussage = belegteHundeerlaubnis(flaeche.representativePoint, flaechen);
    if (aussage.erlaubt === true && flaeche.kind !== 'dog_off_leash') {
      befunde.push({
        art: 'fehler',
        text: `${flaeche.areaId}: Erlaubnis ohne passende Ausweisung.`,
      });
    }
    if (aussage.erlaubt !== null && aussage.beleg === null) {
      befunde.push({ art: 'fehler', text: `${flaeche.areaId}: Aussage ohne Beleg.` });
    }
  }

  return befunde;
}

function zeile(zuordnung: Zuordnung): string {
  const links = zuordnung.placeName ?? '—';
  const rechts = zuordnung.areaName ?? '—';
  return `  ${zuordnung.art.padEnd(13)} ${links} ↔ ${rechts}${
    zuordnung.district === null ? '' : ` (${zuordnung.district})`
  }`;
}

function main(): number {
  if (!existsSync(ORTE)) {
    console.error(`${ORTE} fehlt. Zuerst npm run ingest:osm-de ausführen.`);
    return 2;
  }
  const orte = (JSON.parse(readFileSync(ORTE, 'utf8')) as { places: Place[] }).places;

  let fehlerGesamt = 0;
  let fehlendeSnapshots = 0;

  for (const quelle of KOMMUNALE_QUELLEN) {
    console.log(`\n═══ ${quelle.gemeinde} — ${quelle.sourceId}`);
    if (!existsSync(quelle.snapshotPfad)) {
      console.error(`${quelle.snapshotPfad} fehlt. Zuerst npm run snapshot:municipal ausführen.`);
      fehlendeSnapshots += 1;
      continue;
    }

    const geprueft = MunicipalSnapshotSchema.safeParse(
      JSON.parse(readFileSync(quelle.snapshotPfad, 'utf8')),
    );
    if (!geprueft.success) {
      console.error(
        `${quelle.snapshotPfad} entspricht nicht dem Schema: ${geprueft.error.message}`,
      );
      fehlerGesamt += 1;
      continue;
    }
    const snapshot = geprueft.data;

    const befunde = pruefeFlaechen(snapshot.areas, quelle);
    const abgleich = gleicheAb(orte, snapshot.areas);

    console.log(`Quelle: ${snapshot.source.name}`);
    console.log(`Lizenz: ${snapshot.source.licenseId} (${snapshot.source.licenseUrl})`);
    console.log(`Geltung: ${snapshot.source.validity}\n`);
    console.log(
      `Flächen: ${snapshot.areaCount} (${snapshot.byKind.dog_off_leash ?? 0} Freilauf, ` +
        `${snapshot.byKind.dog_prohibited ?? 0} Mitnahmeverbot)`,
    );
    console.log(
      `Abgleich mit OSM: ${abgleich.zaehler.bestaetigt} bestätigt, ` +
        `${abgleich.zaehler.widerspruch} Widerspruch, ${abgleich.zaehler.unbestaetigt} unbestätigt, ` +
        `${abgleich.zaehler.nur_kommunal} nur kommunal.\n`,
    );

    for (const zuordnung of abgleich.zuordnungen) console.log(zeile(zuordnung));

    for (const befund of befunde) {
      console.log(`${befund.art === 'fehler' ? '✗' : '·'} ${befund.text}`);
    }
    fehlerGesamt += befunde.filter((befund) => befund.art === 'fehler').length;
  }

  if (fehlendeSnapshots > 0) {
    console.error(`\n${fehlendeSnapshots} Snapshot(s) fehlen.`);
    return 2;
  }
  if (fehlerGesamt > 0) {
    console.error(`\n${fehlerGesamt} Befund(e).`);
    return 1;
  }
  console.log('\nKeine Beanstandung. Widersprüche sind benannt, nicht aufgelöst.');
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
