/**
 * M17-04 — Schreibt den öffentlichen Gesundheitsstand.
 *
 * Die Datei liegt unter einer **festen** Adresse ohne Inhalts-Hash: sie soll
 * abrufbar sein, ohne dass jemand erst das Manifest liest, und sie darf nicht
 * lange zwischengespeichert werden. Aus demselben Grund steht sie nicht im
 * Manifest — sie ist kein Fachdatenchunk, sondern eine Zustandsangabe.
 *
 * Ausführen: `npm run build:health` (läuft in `build:site` mit).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import { baueHealthBericht, HEALTH_PFAD } from '../../src/features/freshness/health.ts';
import { tageText } from '../../src/features/freshness/policy.ts';
import { canonicalJson, type JsonValue } from '../normalize/canonical.ts';

const OUT_DIR = 'dist';

function main(): number {
  const jetzt = new Date();
  const stichtag = jetzt.toISOString().slice(0, 10);
  const bericht = baueHealthBericht(stichtag, jetzt.toISOString());

  const ziel = join(OUT_DIR, HEALTH_PFAD.replace(/^\//, ''));
  mkdirSync(dirname(ziel), { recursive: true });
  writeFileSync(ziel, `${canonicalJson(bericht as unknown as JsonValue)}\n`, 'utf8');

  const gesperrt = bericht.gesamt.gesperrt;
  console.log(
    `${ziel}: ${bericht.datensaetze.length} Datensätze, Gesamtstand ${bericht.gesamt.frische}` +
      (gesperrt.length === 0 ? '.' : `, gesperrt: ${gesperrt.join(', ')}.`),
  );
  for (const eintrag of bericht.datensaetze) {
    console.log(
      `  ${eintrag.id}: ${eintrag.frische}` +
        (eintrag.alterTage === null ? '' : ` (${tageText(eintrag.alterTage)})`),
    );
  }
  return 0;
}

process.exit(main());
