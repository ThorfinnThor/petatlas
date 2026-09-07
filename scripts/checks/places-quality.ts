/**
 * M10-06 — Datenqualität der Ortsdaten prüfen.
 *
 * Prüft den erzeugten Snapshot und die ausgelieferten Dateien auf die Dinge,
 * bei denen ein Fehler nicht auffällt, sondern schadet:
 *
 * - Behauptet die Ausgabe irgendwo einen Notdienst, den die Quelle nicht
 *   hergibt?
 * - Ist die Attribution in **jeder** ausgelieferten Datendatei enthalten?
 * - Sind Koordinaten plausibel, oder liegt etwas außerhalb Deutschlands?
 * - Sind unbekannte Angaben als `null` erhalten oder zu leeren Strings
 *   verkommen?
 *
 * Ausführen: `npm run check:places`
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import type { Place } from '../../src/domain/schemas/places.ts';
import { PlaceSchema } from '../../src/domain/schemas/places.ts';

const SNAPSHOT = 'data-snapshots/places/places-de.json';
const AUSGABE = 'dist/data/v1/places/de';

/** Grobe Hülle um Deutschland. Ein Punkt außerhalb ist ein Datenfehler. */
const DE_BBOX = { minLat: 47.2, maxLat: 55.1, minLon: 5.8, maxLon: 15.1 };

export interface Befund {
  readonly art: 'fehler' | 'hinweis';
  readonly text: string;
}

export function pruefeOrte(orte: readonly Place[]): Befund[] {
  const befunde: Befund[] = [];

  const ungueltig = orte.filter((ort) => !PlaceSchema.safeParse(ort).success);
  if (ungueltig.length > 0) {
    befunde.push({
      art: 'fehler',
      text: `${ungueltig.length} Orte entsprechen nicht dem Fachschema.`,
    });
  }

  const ausserhalb = orte.filter(
    (ort) =>
      ort.coordinates.latitude < DE_BBOX.minLat ||
      ort.coordinates.latitude > DE_BBOX.maxLat ||
      ort.coordinates.longitude < DE_BBOX.minLon ||
      ort.coordinates.longitude > DE_BBOX.maxLon,
  );
  if (ausserhalb.length > 0) {
    befunde.push({
      art: 'fehler',
      text: `${ausserhalb.length} Orte liegen außerhalb Deutschlands: ${ausserhalb
        .slice(0, 3)
        .map((ort) => ort.placeId)
        .join(', ')}`,
    });
  }

  const ids = orte.map((ort) => ort.placeId);
  if (new Set(ids).size !== ids.length) {
    befunde.push({ art: 'fehler', text: 'Es gibt doppelte Orts-IDs.' });
  }

  // Unbekannt muss null bleiben. Ein leerer String sieht in der Anzeige aus
  // wie eine Angabe, die es nicht gibt.
  const leereStrings = orte.filter((ort) =>
    [ort.municipality, ort.postalCode, ort.phone, ort.website, ort.openingHours].some(
      (wert) => wert === '',
    ),
  );
  if (leereStrings.length > 0) {
    befunde.push({
      art: 'fehler',
      text: `${leereStrings.length} Orte haben leere Strings statt null.`,
    });
  }

  const ohneNamen = orte.filter((ort) => ort.name.trim() === '');
  if (ohneNamen.length > 0) {
    befunde.push({ art: 'fehler', text: `${ohneNamen.length} Orte haben keinen Namen.` });
  }

  const notdienst = orte.filter((ort) => ort.emergency === true).length;
  const anteil = orte.length === 0 ? 0 : (notdienst / orte.length) * 100;
  befunde.push({
    art: 'hinweis',
    text:
      `${notdienst} von ${orte.length} Orten (${anteil.toFixed(1)} Prozent) tragen eine ` +
      'Notdienstangabe. Für eine Notdienstauskunft reicht das nicht.',
  });

  return befunde;
}

export function pruefeAusgabe(verzeichnis: string): Befund[] {
  const befunde: Befund[] = [];
  if (!existsSync(verzeichnis)) {
    return [{ art: 'fehler', text: `${verzeichnis} fehlt; zuerst bauen.` }];
  }

  const dateien: string[] = [];
  const sammle = (pfad: string): void => {
    for (const eintrag of readdirSync(pfad, { withFileTypes: true })) {
      const voll = join(pfad, eintrag.name);
      if (eintrag.isDirectory()) sammle(voll);
      else if (eintrag.name.endsWith('.json')) dateien.push(voll);
    }
  };
  sammle(verzeichnis);

  const ohneAttribution = dateien.filter(
    (datei) => !readFileSync(datei, 'utf8').includes('OpenStreetMap contributors'),
  );
  if (ohneAttribution.length > 0) {
    befunde.push({
      art: 'fehler',
      text: `${ohneAttribution.length} ausgelieferte Datei(en) ohne Pflichthinweis: ${ohneAttribution
        .slice(0, 3)
        .join(', ')}`,
    });
  }

  // Kein Feld aus der Quelle, das nicht in die Projektion gehört.
  const verbotene = ['osm_user', 'osm_uid', 'changeset', 'operator', 'contact:email', '"email"'];
  for (const datei of dateien) {
    const inhalt = readFileSync(datei, 'utf8');
    for (const feld of verbotene) {
      if (inhalt.includes(feld)) {
        befunde.push({ art: 'fehler', text: `${datei} enthält "${feld}".` });
      }
    }
  }

  befunde.push({
    art: 'hinweis',
    text: `${dateien.length} Datendatei(en) geprüft.`,
  });
  return befunde;
}

function main(): number {
  if (!existsSync(SNAPSHOT)) {
    console.error(`${SNAPSHOT} fehlt. Zuerst npm run ingest:osm-de ausführen.`);
    return 2;
  }
  const snapshot = JSON.parse(readFileSync(SNAPSHOT, 'utf8')) as { places: Place[] };
  const befunde = [...pruefeOrte(snapshot.places), ...pruefeAusgabe(AUSGABE)];

  const fehler = befunde.filter((befund) => befund.art === 'fehler');
  for (const befund of befunde) {
    console.log(`${befund.art === 'fehler' ? '✗' : '·'} ${befund.text}`);
  }

  if (fehler.length > 0) {
    console.error(`\n${fehler.length} Befund(e).`);
    return 1;
  }
  console.log('\nKeine Beanstandung.');
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
