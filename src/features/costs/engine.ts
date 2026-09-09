/**
 * M08-02 — Gebührenengine.
 *
 * Rechnet aus ausgewählten Katalogpositionen eine nachvollziehbare Summe.
 * Das Ergebnis ist eine **modellbasierte Orientierung**, kein
 * Kostenvoranschlag einer Praxis: eine echte Rechnung kann Positionen
 * enthalten, die hier niemand ausgewählt hat.
 *
 * Verbindliche Regeln, alle aus `docs/GOT_RULE_SPEC.md`:
 *
 * - Katalogbeträge sind **Nettobeträge** ohne Umsatzsteuer.
 * - Regulär gilt der einfache bis dreifache Satz, im einschlägigen Notdienst
 *   der zwei- bis vierfache zuzüglich einer Notdienstgebühr.
 * - Die Notdienstgebühr fällt **einmal je Angelegenheit** an, nicht je Tier
 *   und nicht je Position.
 * - Der Behandlungskontext wird vom Nutzer gewählt. Er wird **nicht** aus
 *   Uhrzeit oder `Date.now()` abgeleitet.
 * - Zusatzmaterial, Medikamente, Fremdlabor und Wegegeld sind **nicht**
 *   automatisch enthalten.
 * - Menge 0, negative Werte, unzulässige Faktoren oder eine unpassende
 *   Tierart ergeben einen Validierungsfehler, keine stille Korrektur.
 *
 * Gerechnet wird durchgehend in ganzzahligen Cent über `src/domain/money.ts`.
 */
import konfiguration from '../../../config/costs/DE.json' with { type: 'json' };
import {
  add,
  money,
  multiplyByFactor,
  multiplyByQuantity,
  percentageOf,
  sum,
  type Money,
} from '../../domain/money.ts';
import type { FeeItem, Species } from '../../domain/schemas/index.ts';

export type TreatmentContext = 'regular' | 'emergency';

/**
 * Bezugsgrößen, die der Rechner beherrscht.
 *
 * Die GOT 2022 führt in allen 1.006 Positionen „Einzelleistung“. Eine andere
 * Bezugsgröße — etwa je angefangene Zeiteinheit oder je Kilogramm — ließe
 * sich nicht einfach mit einer Menge multiplizieren; sie käme mit einer
 * eigenen Regel. Bis es sie gibt, wird sie abgelehnt und nicht geraten.
 */
export const BEKANNTE_BEZUGSGROESSEN: readonly string[] = ['Einzelleistung'];

export class CostError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'CostError';
    this.code = code;
  }
}

export interface CostConfig {
  readonly market: string;
  readonly currency: string;
  readonly standardFactorMin: number;
  readonly standardFactorMax: number;
  readonly emergencyFactorMin: number;
  readonly emergencyFactorMax: number;
  readonly emergencyFeeMinor: number;
  readonly factorPrecision: number;
  readonly vatPercent: number;
  readonly specialAgreementsSupported: boolean;
  readonly clinicalReview: 'pending' | 'approved' | 'withdrawn';
}

export const COST_CONFIG: CostConfig = {
  market: konfiguration.market,
  currency: konfiguration.currency,
  standardFactorMin: Number(konfiguration.standardFactorMin),
  standardFactorMax: Number(konfiguration.standardFactorMax),
  emergencyFactorMin: Number(konfiguration.emergencyFactorMin),
  emergencyFactorMax: Number(konfiguration.emergencyFactorMax),
  emergencyFeeMinor: konfiguration.emergencyFeeMinor,
  factorPrecision: konfiguration.factorPrecision,
  vatPercent: konfiguration.vatPercent,
  specialAgreementsSupported: konfiguration.specialAgreementsSupported,
  clinicalReview: konfiguration.clinicalReview as CostConfig['clinicalReview'],
};

/** Erlaubter Faktorbereich für einen Behandlungskontext. */
export function factorRange(
  context: TreatmentContext,
  config: CostConfig = COST_CONFIG,
): { readonly min: number; readonly max: number } {
  return context === 'emergency'
    ? { min: config.emergencyFactorMin, max: config.emergencyFactorMax }
    : { min: config.standardFactorMin, max: config.standardFactorMax };
}

export interface CostRequestLine {
  readonly officialItemId: string;
  readonly quantity: number;
  /** Leistungsfaktor. Muss im Bereich des gewählten Kontexts liegen. */
  readonly factor: number;
}

export interface CostRequest {
  readonly context: TreatmentContext;
  /** Tierart der Behandlung. `null`, wenn der Nutzer keine angibt. */
  readonly species: Species | null;
  readonly lines: readonly CostRequestLine[];
  /**
   * Anzahl der Tiere in derselben Angelegenheit. Die Notdienstgebühr fällt
   * trotzdem nur einmal an.
   */
  readonly animals?: number;
}

export interface CostResultLine {
  readonly officialItemId: string;
  readonly label: string;
  readonly quantity: number;
  readonly factor: number;
  readonly baseAmount: Money;
  readonly netAmount: Money;
  readonly sourceReference: string;
}

export interface CostResult {
  readonly context: TreatmentContext;
  readonly catalogVersion: string;
  readonly lines: readonly CostResultLine[];
  /** Notdienstgebühr, getrennt von den Positionen ausgewiesen. */
  readonly emergencyFee: Money | null;
  readonly netTotal: Money;
  readonly vatPercent: number;
  readonly vatAmount: Money;
  readonly grossTotal: Money;
  /** Was ausdrücklich nicht enthalten ist. */
  readonly notIncluded: readonly string[];
  /** Darf aus diesem Ergebnis eine Gesamtschätzung angezeigt werden? */
  readonly clinicalReview: CostConfig['clinicalReview'];
}

/** Kosten, die die GOT gesondert behandelt und die hier nie automatisch dazukommen. */
export const NICHT_ENTHALTEN: readonly string[] = [
  'Arzneimittel und Verbrauchsmaterial',
  'Fremdlabor',
  'Wegegeld und Reiseentschädigung',
  'Umsatzsteuer auf gesondert berechnete Auslagen',
  'Leistungen, die nicht ausdrücklich ausgewählt wurden',
];

function pruefeFaktor(factor: number, context: TreatmentContext, config: CostConfig): void {
  const { min, max } = factorRange(context, config);
  if (!Number.isFinite(factor)) {
    throw new CostError('faktor_ungueltig', `Faktor "${factor}" ist keine Zahl.`);
  }
  // Faktoren mit mehr Nachkommastellen als vorgesehen werden abgelehnt und
  // nicht stillschweigend gerundet.
  const skaliert = factor * 10 ** config.factorPrecision;
  if (Math.abs(skaliert - Math.round(skaliert)) > 1e-9) {
    throw new CostError(
      'faktor_zu_genau',
      `Faktor ${factor} hat mehr als ${config.factorPrecision} Nachkommastellen.`,
    );
  }
  if (factor < min || factor > max) {
    throw new CostError(
      'faktor_ausserhalb',
      `Faktor ${factor} liegt außerhalb des zulässigen Bereichs ${min} bis ${max} für den Kontext "${context}".`,
    );
  }
}

function pruefeMenge(quantity: number): void {
  if (!Number.isSafeInteger(quantity)) {
    throw new CostError('menge_ungueltig', `Menge ${quantity} ist keine ganze Zahl.`);
  }
  if (quantity <= 0) {
    throw new CostError('menge_ungueltig', `Menge ${quantity} muss größer als 0 sein.`);
  }
}

function pruefeTierart(item: FeeItem, gewuenscht: Species | null): void {
  // `null` an der Position heißt: die Quelle nennt keine Tierart. Dann ist
  // jede Auswahl zulässig, und die Oberfläche sagt das auch.
  if (item.species === null || gewuenscht === null) return;
  if (item.species !== gewuenscht) {
    throw new CostError(
      'tierart_unpassend',
      `Position ${item.officialItemId} gilt laut Quelle für "${item.species}", angefragt ist "${gewuenscht}".`,
    );
  }
}

/**
 * Rechnet eine Anfrage durch.
 *
 * Wirft bei jeder unzulässigen Eingabe. Es gibt bewusst kein „bestes Bemühen“:
 * ein stillschweigend korrigierter Faktor wäre eine falsche Gebühr.
 */
export function calculateCosts(
  request: CostRequest,
  katalog: readonly FeeItem[],
  config: CostConfig = COST_CONFIG,
): CostResult {
  if (request.lines.length === 0) {
    throw new CostError('leer', 'Es ist keine Position ausgewählt.');
  }

  const animals = request.animals ?? 1;
  if (!Number.isSafeInteger(animals) || animals < 1) {
    throw new CostError('tierzahl_ungueltig', `Anzahl der Tiere muss mindestens 1 sein.`);
  }

  const nachId = new Map(katalog.map((item) => [item.officialItemId, item]));
  const gesehen = new Set<string>();
  const lines: CostResultLine[] = [];
  let katalogVersion: string | null = null;

  for (const anfrage of request.lines) {
    const item = nachId.get(anfrage.officialItemId);
    if (!item) {
      throw new CostError(
        'position_unbekannt',
        `Position ${anfrage.officialItemId} steht nicht im Katalog.`,
      );
    }
    // § 6 GOT verbietet Doppelbewertungen. Dieselbe Position zweimal in einer
    // Anfrage ist ein Eingabefehler; Mengen gehören in `quantity`.
    if (gesehen.has(item.officialItemId)) {
      throw new CostError(
        'position_doppelt',
        `Position ${item.officialItemId} ist doppelt angefragt. Mengen gehören in die Menge.`,
      );
    }
    gesehen.add(item.officialItemId);

    // Der Rechner multipliziert den Grundbetrag mit einer glatten Menge. Das
    // stimmt nur, solange sich die Bezugsgröße auf eine einzelne Leistung
    // bezieht. Stünde dort „je angefangene 15 Minuten“ oder „je kg“, wäre
    // dieselbe Rechnung stillschweigend falsch — deshalb wird eine unbekannte
    // Bezugsgröße abgelehnt statt behandelt, als wäre sie eine Einzelleistung.
    if (!BEKANNTE_BEZUGSGROESSEN.includes(item.baseUnit)) {
      throw new CostError(
        'bezugsgroesse_unbekannt',
        `Position ${item.officialItemId} hat die Bezugsgröße "${item.baseUnit}". ` +
          'Der Rechner kann nur Einzelleistungen mit einer Menge multiplizieren.',
      );
    }
    if (item.currency !== config.currency) {
      throw new CostError(
        'waehrung_unpassend',
        `Position ${item.officialItemId} ist in ${item.currency}, gerechnet wird in ${config.currency}.`,
      );
    }
    if (katalogVersion !== null && katalogVersion !== item.catalogVersion) {
      throw new CostError(
        'katalog_gemischt',
        'Positionen stammen aus verschiedenen Katalogfassungen.',
      );
    }
    katalogVersion = item.catalogVersion;

    pruefeMenge(anfrage.quantity);
    pruefeFaktor(anfrage.factor, request.context, config);
    pruefeTierart(item, request.species);

    const basis = money(item.baseAmountMinor, item.currency);
    // Reihenfolge: erst Faktor mit centgenauer Rundung, dann Menge. Eine
    // Menge multipliziert eine bereits gerundete Einzelgebühr.
    const mitFaktor = multiplyByFactor(basis, anfrage.factor);
    const netto = multiplyByQuantity(mitFaktor, anfrage.quantity);

    lines.push({
      officialItemId: item.officialItemId,
      label: item.originalLabel,
      quantity: anfrage.quantity,
      factor: anfrage.factor,
      baseAmount: basis,
      netAmount: netto,
      sourceReference: item.sourceReference,
    });
  }

  const positionenNetto = sum(
    lines.map((zeile) => zeile.netAmount),
    config.currency,
  );

  // Einmal je Angelegenheit, unabhängig von der Zahl der Tiere und der
  // Positionen.
  const emergencyFee =
    request.context === 'emergency' ? money(config.emergencyFeeMinor, config.currency) : null;

  const netTotal = emergencyFee === null ? positionenNetto : add(positionenNetto, emergencyFee);
  const vatAmount = percentageOf(netTotal, config.vatPercent);
  const grossTotal = add(netTotal, vatAmount);

  return {
    context: request.context,
    catalogVersion: katalogVersion ?? 'unbekannt',
    lines,
    emergencyFee,
    netTotal,
    vatPercent: config.vatPercent,
    vatAmount,
    grossTotal,
    notIncluded: NICHT_ENTHALTEN,
    clinicalReview: config.clinicalReview,
  };
}

/**
 * Darf das Ergebnis öffentlich als Gesamtschätzung gezeigt werden?
 * Ohne fachliche Freigabe zeigt die Oberfläche nur die Einzelpositionen und
 * benennt, was fehlt.
 */
export function mayShowTotal(result: CostResult): boolean {
  return result.clinicalReview === 'approved';
}
