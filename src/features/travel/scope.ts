/**
 * M12-01 — Was der Reisecheck prüft, und was ausdrücklich nicht.
 *
 * Die Prüfung ist fail-closed: unterstützt ist ein Fall nur, wenn **jede**
 * Angabe im Umfang steht. Eine unbekannte Angabe macht den Fall nicht
 * unterstützt — sie macht ihn unbekannt, und unbekannt ist nicht geprüft.
 *
 * Jede Ablehnung nennt ihren Grund im Klartext. Ein bloßes „wird nicht
 * unterstützt“ ließe offen, ob die Reise unzulässig ist oder ob diese
 * Anwendung sie nur nicht beurteilt — und das ist ein großer Unterschied.
 */
import scope from '../../../content-data/travel/scope.json' with { type: 'json' };
import {
  TravelScopeSchema,
  type TravelDirection,
  type TravelScope,
} from '../../domain/schemas/travel.ts';

function lade(): TravelScope {
  const ergebnis = TravelScopeSchema.safeParse(scope);
  if (!ergebnis.success) {
    throw new Error(`content-data/travel/scope.json ist ungültig: ${ergebnis.error.message}`);
  }
  return ergebnis.data;
}

const UMFANG = lade();

export function reiseUmfang(): TravelScope {
  return UMFANG;
}

export interface Reisekontext {
  /** `dog`, `cat` oder etwas anderes — auch ein unbekannter Wert ist zulässig. */
  readonly species: string;
  readonly context: string;
  readonly direction: string;
  /** Ländercode des Ziels bei Hinreise, der Herkunft bei Rückreise. */
  readonly partnerCountry: string;
  readonly transitCountries: readonly string[];
  readonly animals: number;
  /** Alter in Monaten. `null` heißt unbekannt und ist nicht unterstützt. */
  readonly ageMonths: number | null;
}

export interface UmfangsErgebnis {
  readonly unterstuetzt: boolean;
  /** Warum nicht. Leer, wenn unterstützt. */
  readonly gruende: readonly string[];
  /** Kennungen der einschlägigen `unsupported`-Fälle, für die Anzeige. */
  readonly faelle: readonly string[];
}

function grundFuer(caseId: string): string {
  const fall = UMFANG.unsupported.find((eintrag) => eintrag.caseId === caseId);
  return fall === undefined ? caseId : `${fall.label}: ${fall.reason}`;
}

/**
 * Liegt dieser Fall im geprüften Umfang?
 *
 * Geprüft wird gegen die versionierte Umfangsdatei, nicht gegen im Code
 * verstreute Listen. Ein neues Zielland ist damit eine Datenänderung samt
 * Regeln — und nicht eine Zeile in einem `if`.
 */
export function pruefeUmfang(kontext: Reisekontext): UmfangsErgebnis {
  const gruende: string[] = [];
  const faelle: string[] = [];

  const merke = (caseId: string): void => {
    if (faelle.includes(caseId)) return;
    faelle.push(caseId);
    gruende.push(grundFuer(caseId));
  };

  if (!UMFANG.species.includes(kontext.species as TravelScope['species'][number])) {
    merke('andere-tierarten');
  }
  if (!UMFANG.contexts.includes(kontext.context as TravelScope['contexts'][number])) {
    merke(kontext.context === 'unaccompanied' ? 'ohne-begleitung' : 'gewerblich');
  }
  if (!UMFANG.directions.includes(kontext.direction as TravelDirection)) {
    merke('einreise-aus-drittstaat');
  }
  if (!UMFANG.destinations.includes(kontext.partnerCountry)) {
    merke('andere-zielstaaten');
  }
  for (const land of kontext.transitCountries) {
    if (!UMFANG.transitCountries.includes(land)) {
      merke('nicht-eu-transit');
      break;
    }
  }
  if (kontext.animals > UMFANG.maxAnimals || kontext.animals < 1) {
    merke('mehr-als-fuenf-tiere');
  }
  if (kontext.ageMonths === null || kontext.ageMonths < UMFANG.minAgeMonths) {
    merke('jungtiere');
  }

  return { unterstuetzt: gruende.length === 0, gruende, faelle };
}

/** Kurzfassung des Umfangs für die Oberfläche. */
export function umfangsSatz(): string {
  const ziele = UMFANG.destinations.join(', ');
  return (
    `Geprüft wird ein Fall: die private, begleitete Reise mit dem eigenen erwachsenen Hund oder ` +
    `der eigenen erwachsenen Katze von ${UMFANG.origin} nach ${ziele} — und zurück. ` +
    `Alles andere ist ausdrücklich nicht geprüft.`
  );
}
