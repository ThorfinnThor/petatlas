/**
 * M11-05 / M20-03 — Erzeugt die versionierten Snapshots der kommunalen Quellen.
 *
 * Wie beim GOT-Import gilt: Entwicklung, Tests und Website-Builds hängen nie
 * an einem Live-Abruf. Grundlage ist ein validierter lokaler Snapshot.
 * Standardquelle ist die im Repository liegende Antwort des Dienstes; mit
 * `--fetch` wird sie einmal neu geholt — einmal, nicht in einer Schleife.
 *
 * Ein fehlgeschlagener Abruf lässt den vorhandenen Snapshot unangetastet.
 * Scheitert eine Stadt, bleiben die übrigen davon unberührt; der Lauf endet
 * trotzdem mit einem Fehler, damit nichts still liegen bleibt.
 *
 * Ausführen: `npm run snapshot:municipal`, `… -- --fetch`,
 * `… -- --nur berlin-hundefreilauf-wfs`
 */
import { writeFileSync } from 'node:fs';

import { MunicipalSnapshotSchema } from '../../src/domain/schemas/municipal.ts';
import { requireSource } from '../../src/domain/source-registry.ts';
import { canonicalJson, type JsonValue } from '../normalize/canonical.ts';
import {
  KOMMUNALE_QUELLEN,
  ausserhalbDerHuelle,
  holeRessourcen,
  quelleOderFehler,
  type KommunaleQuelle,
} from './municipal-sources.ts';

async function erneuere(quelle: KommunaleQuelle, mitAbruf: boolean): Promise<void> {
  const { haupt, hilfen } = await holeRessourcen(quelle, mitAbruf);
  const registrierung = requireSource(quelle.sourceId);
  const normalisiert = quelle.verarbeite(haupt, hilfen);

  if (normalisiert.records.length === 0) {
    throw new Error('Kein einziger Datensatz übernommen; der vorhandene Snapshot bleibt gültig.');
  }

  const flaechen = normalisiert.records.map((eintrag) => eintrag.record);
  const verirrt = ausserhalbDerHuelle(flaechen, quelle.huelle);
  if (verirrt.length > 0) {
    throw new Error(
      `${verirrt.length} Fläche(n) liegen außerhalb von ${quelle.gemeinde} ` +
        `(erste: ${verirrt[0]?.areaId}). Das deutet auf vertauschte Koordinaten hin; ` +
        'es wird nichts geschrieben.',
    );
  }

  const byKind: Record<string, number> = {};
  for (const flaeche of flaechen) byKind[flaeche.kind] = (byKind[flaeche.kind] ?? 0) + 1;

  const snapshot = {
    source: {
      sourceId: quelle.sourceId,
      name: registrierung.resourceName,
      url: registrierung.attributionUrl ?? registrierung.distributionUrl,
      retrievalDate: haupt.retrievedAt,
      sourceSha256: haupt.contentHash,
      licenseId: registrierung.rights.licenseId ?? 'unbekannt',
      licenseUrl: registrierung.rights.licenseUrl ?? registrierung.primaryTermsUrl,
      attribution: registrierung.attributionText ?? registrierung.publisher,
      attributionUrl: registrierung.attributionUrl ?? registrierung.primaryTermsUrl,
      validity: quelle.geltung,
      parserVersion: quelle.parserVersion,
    },
    areaCount: flaechen.length,
    byKind,
    areas: flaechen,
  };

  const geprueft = MunicipalSnapshotSchema.safeParse(snapshot);
  if (!geprueft.success) {
    throw new Error(`Erzeugter Snapshot ist ungültig: ${geprueft.error.message}`);
  }

  writeFileSync(
    quelle.snapshotPfad,
    `${canonicalJson(snapshot as unknown as JsonValue)}\n`,
    'utf8',
  );

  console.log(
    `${quelle.snapshotPfad}: ${snapshot.areaCount} Flächen ` +
      `(${byKind.dog_off_leash ?? 0} Freilauf, ${byKind.dog_prohibited ?? 0} Mitnahmeverbot), ` +
      `Quellantwort ${haupt.contentHash.slice(0, 12)}…`,
  );
  if (normalisiert.abgelehnt.length > 0) {
    console.warn(`  ${normalisiert.abgelehnt.length} Fläche(n) abgelehnt:`);
    for (const eintrag of normalisiert.abgelehnt) {
      console.warn(`    ${eintrag.id}: ${eintrag.grund}`);
    }
  }
}

async function main(): Promise<number> {
  const mitAbruf = process.argv.includes('--fetch');
  const nurIndex = process.argv.indexOf('--nur');
  const auswahl =
    nurIndex === -1 ? KOMMUNALE_QUELLEN : [quelleOderFehler(process.argv[nurIndex + 1] ?? '')];

  let gescheitert = 0;
  for (const quelle of auswahl) {
    try {
      await erneuere(quelle, mitAbruf);
    } catch (fehler: unknown) {
      gescheitert += 1;
      console.error(`${quelle.sourceId} nicht erneuert: ${(fehler as Error).message}`);
      console.error('  Der bisherige Snapshot dieser Quelle bleibt gültig.');
    }
  }

  if (gescheitert > 0) {
    console.error(`\n${gescheitert} von ${auswahl.length} Quelle(n) nicht erneuert.`);
    return 1;
  }
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((fehler: unknown) => {
    console.error(`Snapshot-Lauf abgebrochen: ${(fehler as Error).message}`);
    process.exit(1);
  });
