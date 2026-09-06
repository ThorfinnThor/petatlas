/**
 * M08-03 — Kostenszenarien.
 *
 * Ein Szenario ist eine redaktionelle Zusammenstellung, keine Aussage der
 * Verordnung. Ohne fachliche Freigabe darf daraus keine Gesamtschätzung
 * werden; der Nutzer sieht dann nur die Einzelpositionen und den Hinweis,
 * was das bedeutet.
 */
import beratung from '../../../content-data/cost-scenarios/beratung-ohne-untersuchung.json' with { type: 'json' };
import untersuchung from '../../../content-data/cost-scenarios/allgemeine-untersuchung-hund.json' with { type: 'json' };
import { CostScenarioSchema, type CostScenario, type FeeItem } from '../../domain/schemas/index.ts';
import { CostError, calculateCosts, type CostResult, type TreatmentContext } from './engine.ts';

function lade(roh: unknown): CostScenario {
  const ergebnis = CostScenarioSchema.safeParse(roh);
  if (!ergebnis.success) {
    const id =
      typeof roh === 'object' && roh !== null && 'scenarioId' in roh ? String(roh.scenarioId) : '?';
    throw new Error(`Szenario ${id} ist ungültig: ${ergebnis.error.message}`);
  }
  return ergebnis.data;
}

const SZENARIEN: readonly CostScenario[] = [beratung, untersuchung].map(lade);

export function allScenarios(): readonly CostScenario[] {
  return SZENARIEN;
}

export function getScenario(scenarioId: string): CostScenario | undefined {
  return SZENARIEN.find((szenario) => szenario.scenarioId === scenarioId);
}

/** Szenarien, deren Gesamtschätzung öffentlich gezeigt werden darf. */
export function approvedScenarios(): readonly CostScenario[] {
  return SZENARIEN.filter(
    (szenario) => szenario.clinicalReview === 'approved' && szenario.reviewedAt !== null,
  );
}

export interface ScenarioEstimate {
  readonly scenario: CostScenario;
  readonly result: CostResult;
  /**
   * Darf die Gesamtsumme als Schätzung gezeigt werden? Ohne Freigabe nein —
   * die Einzelpositionen bleiben sichtbar.
   */
  readonly mayShowTotal: boolean;
  /** Was der Nutzer über die Grenzen dieser Zahl wissen muss. */
  readonly limitations: readonly string[];
}

/**
 * Rechnet ein Szenario durch. Das Ergebnis sagt ausdrücklich, ob die Summe
 * als Schätzung gezeigt werden darf.
 */
export function estimateScenario(
  scenarioId: string,
  katalog: readonly FeeItem[],
  context: TreatmentContext = 'regular',
): ScenarioEstimate {
  const scenario = getScenario(scenarioId);
  if (!scenario) {
    throw new CostError('szenario_unbekannt', `Szenario ${scenarioId} gibt es nicht.`);
  }

  const result = calculateCosts(
    { context, species: scenario.species, lines: scenario.lines },
    katalog,
  );

  const freigegeben = scenario.clinicalReview === 'approved' && scenario.reviewedAt !== null;

  const limitations = [
    ...scenario.exclusions.map((eintrag) => `Nicht enthalten: ${eintrag}`),
    ...result.notIncluded.map((eintrag) => `Nicht enthalten: ${eintrag}`),
  ];
  if (!freigegeben) {
    limitations.unshift(
      'Diese Zusammenstellung ist fachlich nicht geprüft. Es wird deshalb keine Gesamtschätzung angezeigt, sondern nur die einzelnen Positionen.',
    );
  }

  return { scenario, result, mayShowTotal: freigegeben, limitations };
}
