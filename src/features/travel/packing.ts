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
import type { PackingItem, PackingList } from '../../domain/schemas/travel.ts';

/**
 * M22-02: Die Datei liegt im Repository und ist zur Bauzeit unveränderlich.
 * Geprüft wird sie dort (`npm run check:content`) — einschließlich der
 * Querbezüge, die vorher hier beim Laden geprüft wurden.
 */
const LISTE = packliste as unknown as PackingList;

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
