/**
 * M18-06 — Ist dieser Stand freigabefähig?
 *
 * Die Prüfung beantwortet **nicht** die Frage, ob veröffentlicht werden
 * soll. Sie beantwortet, ob der Stand **behauptet**, was er belegen kann:
 *
 * - Ein Gate auf `approved: true` braucht eine Person und ein Datum. Ein
 *   Häkchen ohne Namen ist keine Freigabe.
 * - Zu jedem freigegebenen Gate muss ein Nachweis in `docs/reviews/`
 *   existieren. Ein Verweis auf eine Datei, die es nicht gibt, ist
 *   schlimmer als kein Verweis.
 * - Was noch nicht freigegeben ist, darf nicht ausgeliefert werden: die
 *   öffentliche Freigabe steht nur, wenn **alle** Gates stehen.
 * - Eine offene rechtliche Pflicht verhindert die öffentliche Freigabe.
 *
 * Kein Agent trägt hier eine Freigabe ein. Dieses Skript kann nur
 * widersprechen.
 *
 * Ausführen: `npm run check:release`
 */
import { existsSync } from 'node:fs';

import launch from '../../config/launch.json' with { type: 'json' };
import { PFLICHTANGABEN, werbeStand } from '../../config/legal.ts';

export interface Gate {
  readonly approved: boolean;
  readonly owner?: string;
  readonly note?: string;
  readonly approvedBy?: string | null;
  readonly approvedAt?: string | null;
  readonly evidence?: string | null;
}

export interface Beanstandung {
  readonly gate: string;
  readonly problem: string;
}

export const GATES = launch.gates as unknown as Record<string, Gate>;

/** Nachweis je Gate. Fehlt einer, ist das Gate nicht freigabefähig. */
export const NACHWEISE: Readonly<Record<string, string>> = {
  operatorImprint: 'docs/LEGAL_CHECKLIST.md',
  domain: 'docs/CLOUDFLARE_SETUP.md',
  dataRights: 'docs/SOURCE_REVIEWS.md',
  costsRules: 'docs/reviews/costs.md',
  travelRules: 'docs/reviews/travel.md',
  insuranceAffiliate: 'docs/reviews/insurance.md',
  commerceAffiliate: 'docs/reviews/commerce-partner.md',
  adsTracking: 'docs/LEGAL_CHECKLIST.md',
};

export function pruefeGates(
  gates: Record<string, Gate> = GATES,
  vorhanden: (pfad: string) => boolean = existsSync,
): Beanstandung[] {
  const beanstandungen: Beanstandung[] = [];

  for (const [name, gate] of Object.entries(gates)) {
    const nachweis = NACHWEISE[name];
    if (nachweis === undefined) {
      beanstandungen.push({
        gate: name,
        problem:
          'Kein Nachweispfad hinterlegt. Ein Gate ohne benannten Nachweis ist nicht prüfbar.',
      });
      continue;
    }
    if (!vorhanden(nachweis)) {
      beanstandungen.push({ gate: name, problem: `Der benannte Nachweis ${nachweis} fehlt.` });
    }
    if (!gate.approved) continue;

    // Ab hier: das Gate behauptet eine Freigabe.
    if (gate.approvedBy === undefined || gate.approvedBy === null || gate.approvedBy === '') {
      beanstandungen.push({
        gate: name,
        problem: 'Freigegeben, aber ohne Person. Ein Häkchen ohne Namen ist keine Freigabe.',
      });
    }
    if (gate.approvedAt === undefined || gate.approvedAt === null || gate.approvedAt === '') {
      beanstandungen.push({ gate: name, problem: 'Freigegeben, aber ohne Datum.' });
    }
  }
  return beanstandungen;
}

export interface Freigabestand {
  readonly oeffentlichFreigegeben: boolean;
  readonly offeneGates: readonly string[];
  readonly offenePflichten: readonly string[];
  readonly beanstandungen: readonly Beanstandung[];
  readonly begruendung: string;
}

export function freigabestand(
  gates: Record<string, Gate> = GATES,
  vorhanden: (pfad: string) => boolean = existsSync,
): Freigabestand {
  const offeneGates = Object.entries(gates)
    .filter(([, gate]) => !gate.approved)
    .map(([name]) => name);
  const offenePflichten = PFLICHTANGABEN.filter((pflicht) => pflicht.status === 'offen').map(
    (pflicht) => pflicht.id,
  );
  const beanstandungen = pruefeGates(gates, vorhanden);
  const oeffentlich = (launch.publicRelease as { approved: boolean }).approved;

  const teile: string[] = [];
  if (offeneGates.length > 0) teile.push(`${offeneGates.length} offene(s) Gate(s)`);
  if (offenePflichten.length > 0) teile.push(`${offenePflichten.length} offene Rechtspflicht(en)`);
  if (beanstandungen.length > 0) teile.push(`${beanstandungen.length} Beanstandung(en)`);

  return {
    oeffentlichFreigegeben: oeffentlich,
    offeneGates,
    offenePflichten,
    beanstandungen,
    begruendung:
      teile.length === 0
        ? 'Alle Gates stehen, keine offene Rechtspflicht, keine Beanstandung.'
        : `Nicht freigabefähig: ${teile.join(', ')}.`,
  };
}

function main(): number {
  const stand = freigabestand();
  const werbung = werbeStand();

  console.log(`Öffentliche Freigabe: ${stand.oeffentlichFreigegeben ? 'ja' : 'nein'}.`);
  console.log(stand.begruendung);
  if (stand.offeneGates.length > 0) console.log(`  Offene Gates: ${stand.offeneGates.join(', ')}`);
  if (stand.offenePflichten.length > 0) {
    console.log(`  Offene Rechtspflichten: ${stand.offenePflichten.join(', ')}`);
  }
  console.log(`  Werbung: ${werbung.begruendung}`);

  for (const eintrag of stand.beanstandungen) {
    console.error(`  ${eintrag.gate}: ${eintrag.problem}`);
  }

  // Ein nicht freigegebener Stand ist der Normalzustand und kein Fehler.
  // Rot wird der Lauf nur, wenn der Stand etwas behauptet, das er nicht
  // belegen kann — oder wenn öffentlich freigegeben wäre, obwohl Gates offen
  // sind.
  if (stand.beanstandungen.length > 0) return 1;
  if (stand.oeffentlichFreigegeben && stand.offeneGates.length > 0) {
    console.error('Öffentlich freigegeben, obwohl Gates offen sind. Das ist ein Widerspruch.');
    return 1;
  }
  if (stand.oeffentlichFreigegeben && stand.offenePflichten.length > 0) {
    console.error('Öffentlich freigegeben, obwohl Rechtspflichten offen sind.');
    return 1;
  }
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
