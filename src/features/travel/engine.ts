/**
 * M12-02 — Auswertung der Reiseregeln.
 *
 * Die Regeln sind Daten, keine Programme. Ausgewertet wird eine kleine feste
 * Menge von Prädikaten; es gibt kein `eval`, keine Funktion aus JSON und
 * keinen Operator, der nicht hier steht. Ein unbekannter Operator ist ein
 * Fehler, kein Aufruf.
 *
 * Drei Regeln bestimmen alles Weitere:
 *
 * 1. **Unbekannt ist nicht erfüllt und nicht unerfüllt.** Fehlt eine Angabe,
 *    ist das Ergebnis `unknown`. Es wird nichts angenommen — weder zugunsten
 *    noch zulasten der Reise.
 * 2. **Ungeprüfte Regeln werden nicht ausgewertet.** Eine Regel ohne
 *    fachliche Freigabe oder außerhalb ihres Geltungszeitraums fließt nicht
 *    ins Ergebnis ein. Sie verschwindet aber nicht still, sondern wird als
 *    übersprungen ausgewiesen.
 * 3. **Kein Stichtag aus der Uhr.** Der Prüftag kommt von außen. Sonst hinge
 *    das Ergebnis an der Systemzeit des Browsers.
 */
import { isRuleLive, overallState } from '../../domain/domain-rules.ts';
import type { RequirementState, TravelRule } from '../../domain/schemas/travel.ts';

export type Fakten = Readonly<Record<string, unknown>>;

/** Route, für die geprüft wird. */
export interface Route {
  readonly originCountry: string;
  readonly destinationCountry: string;
  readonly transitCountries: readonly string[];
  readonly species: string;
  readonly context: string;
}

export class TravelEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TravelEngineError';
  }
}

const ISO_DATUM = /^\d{4}-\d{2}-\d{2}$/;

function alsDatum(wert: unknown): number | null {
  if (typeof wert !== 'string' || !ISO_DATUM.test(wert)) return null;
  const zeit = Date.parse(`${wert}T00:00:00Z`);
  if (Number.isNaN(zeit)) return null;
  // Date.parse akzeptiert den 31. Februar; der Rückweg deckt das auf.
  return new Date(zeit).toISOString().slice(0, 10) === wert ? zeit : null;
}

const TAG_MS = 86_400_000;

/** Ganze Kalendertage zwischen zwei Daten, in UTC gerechnet. */
export function tageZwischen(von: string, bis: string): number | null {
  const a = alsDatum(von);
  const b = alsDatum(bis);
  if (a === null || b === null) return null;
  return Math.round((b - a) / TAG_MS);
}

function feld(fakten: Fakten, name: string): unknown {
  return Object.prototype.hasOwnProperty.call(fakten, name) ? fakten[name] : undefined;
}

interface Praedikat {
  readonly op: string;
  readonly of?: readonly Praedikat[];
  readonly field?: string;
  readonly value?: unknown;
  readonly values?: readonly unknown[];
  readonly date?: string;
  readonly from?: string;
  readonly to?: string;
  readonly min?: number | null;
  readonly max?: number | null;
}

/**
 * Wertet ein Prädikat aus. Ergebnis ist `fulfilled`, `not_fulfilled` oder
 * `unknown`; `not_applicable` entsteht nicht hier, sondern eine Ebene höher.
 */
export function werteAus(bedingung: unknown, fakten: Fakten): RequirementState {
  const praedikat = bedingung as Praedikat;
  if (praedikat === null || typeof praedikat !== 'object' || typeof praedikat.op !== 'string') {
    throw new TravelEngineError('Bedingung ist kein Prädikat.');
  }

  switch (praedikat.op) {
    case 'all': {
      const teile = (praedikat.of ?? []).map((teil) => werteAus(teil, fakten));
      if (teile.length === 0) throw new TravelEngineError('„all“ ohne Teilbedingung.');
      if (teile.includes('not_fulfilled')) return 'not_fulfilled';
      if (teile.includes('unknown')) return 'unknown';
      return 'fulfilled';
    }
    case 'any': {
      const teile = (praedikat.of ?? []).map((teil) => werteAus(teil, fakten));
      if (teile.length === 0) throw new TravelEngineError('„any“ ohne Teilbedingung.');
      if (teile.includes('fulfilled')) return 'fulfilled';
      // Erst wenn nichts erfüllt ist, entscheidet die Ungewissheit: ein
      // unbekannter Teil könnte die Bedingung noch erfüllen.
      if (teile.includes('unknown')) return 'unknown';
      return 'not_fulfilled';
    }
    case 'eq': {
      const wert = feld(fakten, praedikat.field as string);
      if (wert === undefined || wert === null) return 'unknown';
      return wert === praedikat.value ? 'fulfilled' : 'not_fulfilled';
    }
    case 'in': {
      const wert = feld(fakten, praedikat.field as string);
      if (wert === undefined || wert === null) return 'unknown';
      return (praedikat.values ?? []).includes(wert) ? 'fulfilled' : 'not_fulfilled';
    }
    case 'dateBefore':
    case 'dateAfter': {
      const wert = feld(fakten, praedikat.field as string);
      const links = alsDatum(wert);
      const rechts = alsDatum(praedikat.date);
      if (links === null) return 'unknown';
      if (rechts === null) throw new TravelEngineError('Vergleichsdatum ist kein Kalenderdatum.');
      const erfuellt = praedikat.op === 'dateBefore' ? links < rechts : links > rechts;
      return erfuellt ? 'fulfilled' : 'not_fulfilled';
    }
    case 'daysBetween': {
      const von = feld(fakten, praedikat.from as string);
      const bis = feld(fakten, praedikat.to as string);
      if (typeof von !== 'string' || typeof bis !== 'string') return 'unknown';
      const tage = tageZwischen(von, bis);
      if (tage === null) return 'unknown';
      const min = praedikat.min ?? null;
      const max = praedikat.max ?? null;
      if (min !== null && tage < min) return 'not_fulfilled';
      if (max !== null && tage > max) return 'not_fulfilled';
      return 'fulfilled';
    }
    default:
      // Kein „unbekannter Operator wird ignoriert“: das würde eine Regel
      // still zur Hälfte auswerten.
      throw new TravelEngineError(`Unbekannter Operator "${praedikat.op}".`);
  }
}

/** Gilt die Regel für diese Route? */
export function istAnwendbar(regel: TravelRule, route: Route): boolean {
  if (regel.originCountry !== route.originCountry) return false;
  if (regel.destinationCountry !== route.destinationCountry) return false;
  if (regel.species !== route.species) return false;
  if (regel.context !== route.context) return false;
  // Eine Regel mit Transitbedingung gilt nur, wenn die Route dort durchführt.
  return regel.transitCountries.every((land) => route.transitCountries.includes(land));
}

export interface RegelErgebnis {
  readonly ruleId: string;
  readonly requirementId: string;
  readonly state: RequirementState;
  readonly guidance: string;
  readonly officialSourceUrl: string;
}

export interface UebersprungeneRegel {
  readonly ruleId: string;
  readonly grund: string;
}

export interface ReiseErgebnis {
  readonly gesamt: RequirementState;
  readonly positionen: readonly RegelErgebnis[];
  readonly uebersprungen: readonly UebersprungeneRegel[];
  /** Klartext für die Oberfläche, immer gefüllt. */
  readonly hinweise: readonly string[];
  /** Wurde mit nicht freigegebenen Regeln gerechnet? */
  readonly vorschau: boolean;
}

export interface Pruefauftrag {
  readonly regeln: readonly TravelRule[];
  readonly route: Route;
  readonly fakten: Fakten;
  /** Kalendertag, gegen den Geltung und Fristen geprüft werden. */
  readonly stichtag: string;
  /**
   * Vorschaumodus: wertet auch fachlich **nicht freigegebene** Regeln aus,
   * damit sich die Oberfläche vor der Freigabe überhaupt bedienen lässt.
   *
   * Der Preis dafür ist fest eingebaut: im Vorschaumodus gibt es kein
   * `fulfilled` als Gesamtergebnis. Ein „alles in Ordnung“ aus ungeprüften
   * Regeln wäre genau die unüberprüfte Reiseberatung, die hier nicht
   * entstehen soll. Ein `not_fulfilled` bleibt dagegen stehen: ein klarer
   * Mangel ist auch aus einer vorbereiteten Regel ein nützlicher Hinweis.
   */
  readonly vorschau?: boolean;
}

/**
 * Prüft eine Reise gegen die freigegebenen Regeln.
 *
 * Ohne eine einzige auswertbare Regel ist das Gesamtergebnis `unknown` — nicht
 * `fulfilled`. „Wir haben nichts gefunden“ ist keine Unbedenklichkeit.
 */
export function pruefeReise(auftrag: Pruefauftrag): ReiseErgebnis {
  const { regeln, route, fakten, stichtag, vorschau = false } = auftrag;
  if (alsDatum(stichtag) === null) {
    throw new TravelEngineError('Stichtag ist kein Kalenderdatum.');
  }

  const uebersprungen: UebersprungeneRegel[] = [];
  const anwendbar: TravelRule[] = [];

  for (const regel of regeln) {
    if (!istAnwendbar(regel, route)) {
      uebersprungen.push({ ruleId: regel.ruleId, grund: 'Gilt für eine andere Route.' });
      continue;
    }
    const imZeitraum =
      stichtag >= regel.validity.from &&
      (regel.validity.until === null || stichtag <= regel.validity.until);
    const freigegeben = regel.reviewedAt !== null && regel.reviewedBy !== null;

    if (!imZeitraum) {
      uebersprungen.push({
        ruleId: regel.ruleId,
        grund: `Außerhalb ihres Geltungszeitraums am ${stichtag}.`,
      });
      continue;
    }
    if (!freigegeben && !vorschau) {
      uebersprungen.push({
        ruleId: regel.ruleId,
        grund: 'Ohne fachliche Freigabe; wird nicht ausgewertet.',
      });
      continue;
    }
    // Im Vorschaumodus ist eine freigegebene Regel trotzdem an ihren
    // Zeitraum gebunden — `isRuleLive` bleibt die Messlatte für den
    // Regelbetrieb.
    if (freigegeben && !isRuleLive(regel, stichtag)) {
      uebersprungen.push({
        ruleId: regel.ruleId,
        grund: `Außerhalb ihres Geltungszeitraums am ${stichtag}.`,
      });
      continue;
    }
    anwendbar.push(regel);
  }

  // Bei gleicher Anforderung gewinnt die höhere Priorität; die anderen
  // stehen als verdrängt in der Liste, damit niemand rätselt, wo sie blieben.
  const beste = new Map<string, TravelRule>();
  for (const regel of anwendbar) {
    const vorhanden = beste.get(regel.requirementId);
    if (vorhanden === undefined || regel.priority > vorhanden.priority) {
      if (vorhanden !== undefined) {
        uebersprungen.push({
          ruleId: vorhanden.ruleId,
          grund: `Verdrängt von ${regel.ruleId} (höhere Priorität bei "${regel.requirementId}").`,
        });
      }
      beste.set(regel.requirementId, regel);
    } else {
      uebersprungen.push({
        ruleId: regel.ruleId,
        grund: `Verdrängt von ${vorhanden.ruleId} (höhere Priorität bei "${regel.requirementId}").`,
      });
    }
  }

  const positionen = [...beste.values()]
    .sort((a, b) => b.priority - a.priority || (a.requirementId < b.requirementId ? -1 : 1))
    .map((regel) => ({
      ruleId: regel.ruleId,
      requirementId: regel.requirementId,
      state: werteAus(regel.condition, fakten),
      guidance: regel.guidance,
      officialSourceUrl: regel.officialSourceUrl,
    }));

  const hinweise: string[] = [];
  let gesamt: RequirementState;

  if (positionen.length === 0) {
    gesamt = 'unknown';
    hinweise.push(
      'Für diese Reise liegt keine einzige freigegebene Regel vor. Das ist keine Unbedenklichkeit, ' +
        'sondern eine Lücke: die Auskunft muss von der zuständigen Behörde kommen.',
    );
  } else {
    gesamt = overallState(positionen.map((position) => position.state));
    if (gesamt === 'unknown') {
      hinweise.push(
        'Mindestens eine Angabe fehlt. Solange sie fehlt, steht kein Gesamtergebnis fest — weder ein gutes noch ein schlechtes.',
      );
    }
    if (gesamt === 'fulfilled') {
      if (vorschau) {
        // Deckel im Vorschaumodus: kein grünes Gesamtergebnis aus Regeln,
        // die niemand fachlich geprüft hat.
        gesamt = 'unknown';
        hinweise.push(
          'Nach Ihren Angaben spricht in den vorbereiteten Regeln nichts dagegen. Ein Gesamtergebnis ' +
            'gibt es trotzdem nicht: diese Regeln sind fachlich noch nicht geprüft, und eine ungeprüfte ' +
            'Unbedenklichkeit wäre keine.',
        );
      } else {
        hinweise.push(
          'Alle geprüften Voraussetzungen sind nach Ihren Angaben erfüllt. Das ist keine Einreisegarantie: ' +
            'geprüft wurde nur, was hier hinterlegt ist, und die Entscheidung trifft die Grenzkontrolle.',
        );
      }
    }
  }

  // Nur inhaltlich bedeutsame Auslassungen erwähnen: dass Regeln für andere
  // Routen nicht gelten, ist kein Befund, sondern der Normalfall.
  const bedeutsam = uebersprungen.filter(
    (eintrag) => eintrag.grund !== 'Gilt für eine andere Route.',
  );
  if (bedeutsam.length > 0) {
    hinweise.push(
      `${bedeutsam.length} Regel(n) wurden nicht ausgewertet; die Gründe stehen in der Liste.`,
    );
  }

  return { gesamt, positionen, uebersprungen, hinweise, vorschau };
}
