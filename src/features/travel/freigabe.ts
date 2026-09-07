/**
 * M12-06 — Freigabestand der Reiseregeln.
 *
 * Zwei Dinge müssen zusammenkommen, damit der Reisecheck ein positives
 * Gesamtergebnis geben darf:
 *
 * 1. eine **fachliche Freigabe** des Regelsatzes, eingetragen in
 *    `content-data/travel/approvals.json` mit Datum, Person und Nachweis, und
 * 2. ein **unveränderter Regelsatz**: die Freigabe nennt die Signatur des
 *    Inhalts, den sie geprüft hat. Weicht die aktuelle davon ab, ist die
 *    Freigabe für den neuen Inhalt schlicht nicht erteilt.
 *
 * Punkt 2 ist der eigentliche Zweck dieser Datei. Eine Quelle ändert sich
 * still: eine Verordnung wird ersetzt, eine Frist verlängert, ein Wortlaut
 * präzisiert. Ohne diese Sperre liefe eine alte Freigabe auf neuen Inhalt
 * weiter — und niemand merkte es.
 *
 * Die Signatur ist ein **Änderungsmelder, keine Sicherheitsmaßnahme.** Sie
 * erkennt versehentliche Änderungen zuverlässig; gegen absichtliche
 * Manipulation im eigenen Repository schützt sie nicht und soll es nicht.
 */
import freigaben from '../../../content-data/travel/approvals.json' with { type: 'json' };
import {
  TravelApprovalListSchema,
  type TravelApproval,
  type TravelRuleSet,
} from '../../domain/schemas/travel.ts';
import { regelSaetze } from './rules.ts';

/** Kanonische Textform des fachlich geprüften Inhalts. */
export function signaturQuelle(satz: TravelRuleSet): string {
  return JSON.stringify({
    ruleSetId: satz.ruleSetId,
    legalBasis: satz.legalBasis,
    appliesFrom: satz.appliesFrom,
    appliesUntil: satz.appliesUntil,
    origins: [...satz.origins].sort(),
    destinations: [...satz.destinations].sort(),
    species: [...satz.species].sort(),
    contexts: [...satz.contexts].sort(),
    requirements: [...satz.requirements]
      .sort((a, b) => (a.requirementId < b.requirementId ? -1 : 1))
      .map((anforderung) => ({
        requirementId: anforderung.requirementId,
        citation: anforderung.citation,
        officialSourceUrl: anforderung.officialSourceUrl,
        guidance: anforderung.guidance,
        condition: anforderung.condition,
      })),
  });
}

/**
 * FNV-1a über die kanonische Textform, als 16-stellige Hexzahl.
 *
 * Bewusst ohne `node:crypto`: dieselbe Funktion läuft im Browser und im Test,
 * und für einen Änderungsmelder genügt sie.
 */
export function inhaltsSignatur(satz: TravelRuleSet): string {
  const text = signaturQuelle(satz);
  let hoch = 0x811c9dc5;
  let tief = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    const zeichen = text.charCodeAt(i);
    hoch = Math.imul(hoch ^ (zeichen & 0xff), 0x01000193) >>> 0;
    tief = Math.imul(tief ^ (zeichen >>> 8) ^ i, 0x01000193) >>> 0;
  }
  return `${hoch.toString(16).padStart(8, '0')}${tief.toString(16).padStart(8, '0')}`;
}

function ladeFreigaben(): readonly TravelApproval[] {
  const ergebnis = TravelApprovalListSchema.safeParse(freigaben);
  if (!ergebnis.success) {
    throw new Error(`content-data/travel/approvals.json ist ungültig: ${ergebnis.error.message}`);
  }
  return ergebnis.data.approvals;
}

const FREIGABEN = ladeFreigaben();

export interface FreigabeStand {
  readonly ruleSetId: string;
  readonly freigegeben: boolean;
  /** Klartext, warum. Auch im freigegebenen Fall gefüllt. */
  readonly grund: string;
  /** Signatur des aktuellen Inhalts. */
  readonly signatur: string;
}

export function freigabeFuer(
  satz: TravelRuleSet,
  eintraege: readonly TravelApproval[] = FREIGABEN,
): FreigabeStand {
  const signatur = inhaltsSignatur(satz);
  const eintrag = eintraege.find((freigabe) => freigabe.ruleSetId === satz.ruleSetId);

  if (eintrag === undefined) {
    return {
      ruleSetId: satz.ruleSetId,
      freigegeben: false,
      grund: 'Für diesen Regelsatz ist keine fachliche Freigabe eingetragen.',
      signatur,
    };
  }
  if (eintrag.sourceDigest !== signatur) {
    return {
      ruleSetId: satz.ruleSetId,
      freigegeben: false,
      grund:
        `Der Regelsatz hat sich seit der Freigabe vom ${eintrag.approvedAt} geändert ` +
        `(geprüft: ${eintrag.sourceDigest}, aktuell: ${signatur}). Die Freigabe gilt für den ` +
        'geprüften Inhalt, nicht für den neuen.',
      signatur,
    };
  }
  return {
    ruleSetId: satz.ruleSetId,
    freigegeben: true,
    grund: `Freigegeben am ${eintrag.approvedAt} durch ${eintrag.approvedBy}.`,
    signatur,
  };
}

/** Stand aller Regelsätze. */
export function freigabeStand(): readonly FreigabeStand[] {
  return regelSaetze().map((satz) => freigabeFuer(satz));
}

/**
 * Läuft der Reisecheck im Vorschaumodus? Er tut es, solange **irgendein**
 * Regelsatz nicht freigegeben ist — im Zweifel Vorschau.
 */
export function nurVorschau(): boolean {
  return freigabeStand().some((stand) => !stand.freigegeben);
}
