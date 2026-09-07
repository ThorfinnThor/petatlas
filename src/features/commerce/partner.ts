/**
 * M09-01 — Zugang zu den Partnerprogrammen.
 *
 * Dieses Modul ist die einzige Stelle, die entscheidet, ob ein
 * Versicherungshinweis erscheinen darf. Es sagt in den allermeisten Fällen
 * nein, und das ist der Zweck: ohne Vertrag, ohne Feature Flag, im falschen
 * Markt, an der falschen Stelle oder nach Ablauf der Zulassung entsteht kein
 * Werbelink.
 *
 * Die Begründung wird mitgeliefert. Ein stilles `false` wäre im Betrieb nicht
 * zu unterscheiden von einem Fehler.
 */
import programme from '../../../config/publishers/insurance/programs.json' with { type: 'json' };
import { isFeatureEnabled, type MarketConfig } from '../../domain/market.ts';
import {
  PartnerRegistrySchema,
  type PartnerPlacement,
  type PartnerProgram,
} from '../../domain/schemas/partner.ts';

function lade(roh: unknown, quelle: string): readonly PartnerProgram[] {
  const ergebnis = PartnerRegistrySchema.safeParse(roh);
  if (!ergebnis.success) {
    throw new Error(`${quelle} ist ungültig: ${ergebnis.error.message}`);
  }
  return ergebnis.data.programs;
}

const VERSICHERUNG = lade(programme, 'config/publishers/insurance/programs.json');

export function insuranceProgramme(): readonly PartnerProgram[] {
  return VERSICHERUNG;
}

export interface PartnerEntscheidung {
  readonly erlaubt: boolean;
  /** Klartext, warum. Auch im erlaubten Fall gefüllt. */
  readonly grund: string;
  /** Das Programm, falls eines gilt. */
  readonly programm: PartnerProgram | null;
}

/** Ist die Zulassung am Stichtag noch gültig? Abgelaufen heißt nein. */
export function zulassungGilt(programm: PartnerProgram, stichtag: string): boolean {
  if (programm.status !== 'approved' || programm.approval === null) return false;
  if (programm.approval.approvedAt > stichtag) return false;
  return programm.approval.expiresAt === null || programm.approval.expiresAt >= stichtag;
}

export interface PartnerAnfrage {
  readonly market: MarketConfig;
  readonly placement: PartnerPlacement;
  /** Kalenderdatum, gegen das die Zulassung geprüft wird. */
  readonly stichtag: string;
  /** Programme, aus denen gewählt wird. Standard: die Versicherungsdatei. */
  readonly programme?: readonly PartnerProgram[];
}

/**
 * Darf an dieser Stelle ein Versicherungshinweis stehen?
 *
 * Es wird **nicht** nach dem besten Programm gesucht: gibt es mehrere gültige,
 * entscheidet die Reihenfolge in der Konfiguration. Eine Auswahl nach Ertrag
 * oder gar nach Tierprofil wäre eine Empfehlung, und die gibt dieses Modul
 * nicht ab.
 */
export function partnerHinweisErlaubt(anfrage: PartnerAnfrage): PartnerEntscheidung {
  const { market, placement, stichtag } = anfrage;
  const kandidaten = anfrage.programme ?? VERSICHERUNG;

  if (!isFeatureEnabled(market, 'commerce')) {
    return {
      erlaubt: false,
      grund: `Feature "commerce" ist im Markt ${market.id} nicht eingeschaltet.`,
      programm: null,
    };
  }
  if (kandidaten.length === 0) {
    return { erlaubt: false, grund: 'Es ist kein Partnerprogramm erfasst.', programm: null };
  }

  const imMarkt = kandidaten.filter((programm) => programm.markets.includes(market.primaryCountry));
  if (imMarkt.length === 0) {
    return {
      erlaubt: false,
      grund: `Kein Programm gilt für den Markt ${market.primaryCountry}.`,
      programm: null,
    };
  }

  const gueltig = imMarkt.filter((programm) => zulassungGilt(programm, stichtag));
  if (gueltig.length === 0) {
    return {
      erlaubt: false,
      grund: `Kein Programm hat am ${stichtag} eine gültige Zulassung.`,
      programm: null,
    };
  }

  const passend = gueltig.find((programm) => programm.allowedPlacements.includes(placement));
  if (passend === undefined) {
    return {
      erlaubt: false,
      grund: `Kein zugelassenes Programm erlaubt die Platzierung "${placement}".`,
      programm: null,
    };
  }

  // Ohne Werbekennzeichnung kein Werbehinweis. Das Schema verlangt sie
  // ohnehin; hier steht die Regel noch einmal, weil ein Hinweis ohne
  // Kennzeichnung schlimmer wäre als gar keiner.
  if (passend.disclosureText.trim() === '') {
    return {
      erlaubt: false,
      grund: `Programm ${passend.programId} hat keine Werbekennzeichnung.`,
      programm: null,
    };
  }

  return {
    erlaubt: true,
    grund: `Programm ${passend.programId} ist für ${market.primaryCountry} zugelassen und erlaubt "${placement}".`,
    programm: passend,
  };
}

/**
 * Der Pflichthinweis zu einem Programm. Ohne Programm gibt es keinen Text —
 * und ohne Text darf auch kein Link erscheinen.
 */
export function werbekennzeichnung(programm: PartnerProgram | null): string | null {
  if (programm === null) return null;
  return programm.disclosureText;
}
