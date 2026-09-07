/**
 * M12-04 — Vom Formular zur Checkliste.
 *
 * Reine Logik ohne DOM: dieselben Funktionen laufen im Test und im Browser.
 *
 * Der Ablauf hat eine feste Reihenfolge, und sie ist wichtig:
 *
 * 1. **Umfang zuerst.** Liegt die Reise außerhalb des geprüften Umfangs,
 *    entsteht gar kein Ergebnis — nur die Begründung, warum nicht. Eine
 *    Checkliste zu einer nicht unterstützten Route wäre eine Auskunft, die
 *    niemand geprüft hat.
 * 2. **Dann die Regeln.** Nur für unterstützte Reisen werden die vorbereiteten
 *    Regeln ausgewertet, im Vorschaumodus und damit ohne grünes Gesamtergebnis.
 * 3. **Unbekannt bleibt unbekannt.** „Weiß ich nicht“ ist eine gültige Antwort
 *    und wird nirgends zu „nein“ oder „ja“ gemacht.
 */
import type { RequirementState } from '../../domain/schemas/travel.ts';
import { pruefeReise, type Fakten, type ReiseErgebnis } from './engine.ts';
import { nurVorschau } from './freigabe.ts';
import { alleRegeln } from './rules.ts';
import { pruefeUmfang, type UmfangsErgebnis } from './scope.ts';

/** Antwortmöglichkeit für alles, was man auch nicht wissen kann. */
export type Angabe = 'ja' | 'nein' | 'unbekannt';

export interface WizardEingabe {
  readonly species: string;
  readonly destination: string;
  readonly transit: readonly string[];
  readonly direction: string;
  readonly animals: number;
  readonly travelDate: string;
  readonly birthDate: string | null;
  readonly microchipped: Angabe;
  readonly identificationDate: string | null;
  readonly rabiesVaccinated: Angabe;
  readonly rabiesVaccinationDate: string | null;
  readonly euPetPassport: Angabe;
  readonly accompaniedByOwner: Angabe;
}

/** `unbekannt` wird zu `undefined`, nicht zu `false`. */
function alsBoolean(angabe: Angabe): boolean | undefined {
  if (angabe === 'ja') return true;
  if (angabe === 'nein') return false;
  return undefined;
}

function alterInMonaten(geburt: string | null, stichtag: string): number | null {
  if (geburt === null) return null;
  const von = Date.parse(`${geburt}T00:00:00Z`);
  const bis = Date.parse(`${stichtag}T00:00:00Z`);
  if (Number.isNaN(von) || Number.isNaN(bis) || bis < von) return null;
  return Math.floor((bis - von) / (86_400_000 * 30.436_875));
}

/** Baut die Faktenlage. Was der Nutzer nicht weiß, steht hier nicht drin. */
export function fakten(eingabe: WizardEingabe): Fakten {
  const werte: Record<string, unknown> = {
    animals: eingabe.animals,
    travelDate: eingabe.travelDate,
  };
  const microchipped = alsBoolean(eingabe.microchipped);
  if (microchipped !== undefined) werte.microchipped = microchipped;
  const rabies = alsBoolean(eingabe.rabiesVaccinated);
  if (rabies !== undefined) werte.rabiesVaccinated = rabies;
  const pass = alsBoolean(eingabe.euPetPassport);
  if (pass !== undefined) werte.euPetPassport = pass;
  const begleitung = alsBoolean(eingabe.accompaniedByOwner);
  if (begleitung !== undefined) werte.accompaniedByOwner = begleitung;
  if (eingabe.birthDate !== null) werte.birthDate = eingabe.birthDate;
  if (eingabe.identificationDate !== null) werte.identificationDate = eingabe.identificationDate;
  if (eingabe.rabiesVaccinationDate !== null) {
    werte.rabiesVaccinationDate = eingabe.rabiesVaccinationDate;
  }
  return werte;
}

export interface WizardErgebnis {
  readonly umfang: UmfangsErgebnis;
  /** `null`, wenn die Reise außerhalb des Umfangs liegt. */
  readonly pruefung: ReiseErgebnis | null;
  readonly gesamt: RequirementState;
  readonly hinweise: readonly string[];
}

export const ZUSTAND_LABEL: Readonly<Record<RequirementState, string>> = {
  fulfilled: 'nach Ihren Angaben erfüllt',
  not_fulfilled: 'nach Ihren Angaben nicht erfüllt',
  unknown: 'offen — Angabe fehlt',
  not_applicable: 'für diese Reise nicht einschlägig',
};

/**
 * Führt Umfangsprüfung und Regelauswertung zusammen.
 *
 * Der Stichtag ist der Reisetag: Fristen und Geltung werden gegen den Tag
 * geprüft, an dem gereist wird — nicht gegen den Tag, an dem jemand das
 * Formular ausfüllt.
 */
export function pruefeWizard(eingabe: WizardEingabe): WizardErgebnis {
  const umfang = pruefeUmfang({
    species: eingabe.species,
    context: 'private_accompanied',
    direction: eingabe.direction,
    partnerCountry: eingabe.destination,
    transitCountries: eingabe.transit,
    animals: eingabe.animals,
    ageMonths: alterInMonaten(eingabe.birthDate, eingabe.travelDate),
  });

  if (!umfang.unterstuetzt) {
    return {
      umfang,
      pruefung: null,
      gesamt: 'not_applicable',
      hinweise: [
        'Diese Reise liegt außerhalb des geprüften Umfangs. Es wird deshalb keine Checkliste ' +
          'erzeugt: eine Auskunft, die niemand geprüft hat, wäre schlechter als keine. Was das ' +
          'für Ihren Fall bedeutet, sagt Ihnen die zuständige Behörde oder Ihre Tierarztpraxis.',
      ],
    };
  }

  const pruefung = pruefeReise({
    regeln: alleRegeln(),
    route: {
      originCountry: 'DE',
      destinationCountry: eingabe.destination,
      transitCountries: eingabe.transit,
      species: eingabe.species,
      context: 'private_accompanied',
    },
    fakten: fakten(eingabe),
    stichtag: eingabe.travelDate,
    // Vorschau, solange ein Regelsatz nicht fachlich freigegeben ist oder
    // sich seit seiner Freigabe geändert hat. Der Modus wird nicht hier
    // entschieden, sondern in `freigabe.ts` — und zwar aus den Daten.
    vorschau: nurVorschau(),
  });

  return {
    umfang,
    pruefung,
    gesamt: pruefung.gesamt,
    hinweise: pruefung.hinweise,
  };
}
