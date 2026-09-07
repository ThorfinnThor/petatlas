/**
 * M12-05 — Packliste.
 *
 * Die Liste kommt aus `content-data/travel/packing-list.json` und wird hier
 * einmal geprüft. Zwei Regeln sind eingebaut, weil sie sonst irgendwann
 * jemand übersieht:
 *
 * 1. Eine regelbezogene Aufgabe muss zu einer **tatsächlich vorhandenen**
 *    Anforderung gehören. Verschwindet eine Regel, fällt die Aufgabe auf.
 * 2. Auf der Liste stehen keine Medikamente. Das prüft zusätzlich
 *    `tests/travel/packing.test.ts` am Wortlaut.
 */
import packliste from '../../../content-data/travel/packing-list.json' with { type: 'json' };
import {
  PackingListSchema,
  type PackingItem,
  type PackingList,
} from '../../domain/schemas/travel.ts';
import { alleRegeln } from './rules.ts';

function lade(): PackingList {
  const ergebnis = PackingListSchema.safeParse(packliste);
  if (!ergebnis.success) {
    throw new Error(
      `content-data/travel/packing-list.json ist ungültig: ${ergebnis.error.message}`,
    );
  }
  const bekannt = new Set(alleRegeln().map((regel) => regel.requirementId));
  for (const eintrag of ergebnis.data.items) {
    if (eintrag.requirementId !== null && !bekannt.has(eintrag.requirementId)) {
      throw new Error(
        `Packlisteneintrag ${eintrag.itemId} verweist auf die unbekannte Anforderung ` +
          `"${eintrag.requirementId}".`,
      );
    }
  }
  return ergebnis.data;
}

const LISTE = lade();

export function reisePackliste(): PackingList {
  return LISTE;
}

/** Einträge einer Rubrik, in ihrer festgelegten Reihenfolge. */
export function packlisteNach(kategorie: PackingItem['category']): readonly PackingItem[] {
  return LISTE.items
    .filter((eintrag) => eintrag.category === kategorie)
    .sort((a, b) => a.order - b.order);
}

export const KATEGORIE_TITEL: Readonly<Record<PackingItem['category'], string>> = {
  rule_task: 'Aufgaben aus den Regeln',
  documents: 'Unterlagen',
  equipment: 'Ausrüstung',
};
