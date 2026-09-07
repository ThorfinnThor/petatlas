/**
 * M11-05 — Abgleich der kommunalen Pilotquelle mit den OSM-Ortsdaten.
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
 * Ausführen: `npm run check:municipal`
 */
import { existsSync, readFileSync } from 'node:fs';

import { MunicipalSnapshotSchema, type MunicipalArea } from '../../src/domain/schemas/municipal.ts';
import type { Place } from '../../src/domain/schemas/places.ts';
import { belegteHundeerlaubnis, gleicheAb, type Zuordnung } from '../normalize/municipal.ts';

const KOMMUNAL = 'data-snapshots/municipal/berlin-hundefreilauf.json';
const ORTE = 'data-snapshots/places/places-de.json';

/** Grobe Hülle um Berlin. Eine Fläche außerhalb wäre ein Datenfehler. */
const BERLIN_BBOX = { minLat: 52.3, maxLat: 52.7, minLon: 13.0, maxLon: 13.8 };

export interface Befund {
  readonly art: 'fehler' | 'hinweis';
  readonly text: string;
}

export function pruefeFlaechen(flaechen: readonly MunicipalArea[]): Befund[] {
  const befunde: Befund[] = [];

  const ausserhalb = flaechen.filter(
    (flaeche) =>
      flaeche.representativePoint.latitude < BERLIN_BBOX.minLat ||
      flaeche.representativePoint.latitude > BERLIN_BBOX.maxLat ||
      flaeche.representativePoint.longitude < BERLIN_BBOX.minLon ||
      flaeche.representativePoint.longitude > BERLIN_BBOX.maxLon,
  );
  if (ausserhalb.length > 0) {
    befunde.push({
      art: 'fehler',
      text: `${ausserhalb.length} Fläche(n) liegen außerhalb von Berlin: ${ausserhalb
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
  if (!existsSync(KOMMUNAL)) {
    console.error(`${KOMMUNAL} fehlt. Zuerst npm run snapshot:municipal ausführen.`);
    return 2;
  }
  if (!existsSync(ORTE)) {
    console.error(`${ORTE} fehlt. Zuerst npm run ingest:osm-de ausführen.`);
    return 2;
  }

  const geprueft = MunicipalSnapshotSchema.safeParse(JSON.parse(readFileSync(KOMMUNAL, 'utf8')));
  if (!geprueft.success) {
    console.error(`${KOMMUNAL} entspricht nicht dem Schema: ${geprueft.error.message}`);
    return 1;
  }
  const snapshot = geprueft.data;
  const orte = (JSON.parse(readFileSync(ORTE, 'utf8')) as { places: Place[] }).places;

  const befunde = pruefeFlaechen(snapshot.areas);
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

  const fehler = befunde.filter((befund) => befund.art === 'fehler');
  for (const befund of befunde) {
    console.log(`${befund.art === 'fehler' ? '✗' : '·'} ${befund.text}`);
  }

  if (fehler.length > 0) {
    console.error(`\n${fehler.length} Befund(e).`);
    return 1;
  }
  console.log('\nKeine Beanstandung. Widersprüche sind benannt, nicht aufgelöst.');
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
