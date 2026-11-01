/**
 * Welche GOT-Positionen ein Artikel behandelt, steht in seinen Tabellenzeilen
 * („| 951 | Zahnextraktion | …“) und in Textangaben wie „Nr. 16, zweimal 166,
 * 337“. Daraus entstehen die Verweise von den Positionsseiten auf die Artikel.
 */

const TABELLENZEILE = /^\|\s*(\d{1,4})\s*\|/gm;
const NUMMERNFOLGE =
  /Nr\.\s*(\d{1,4}(?:\s*(?:,|und|oder|bis|–)\s*(?:zweimal|dreimal\s+)?\s*(?:Nr\.\s*)?\d{1,4})*)/g;

export function gotNummernImText(text: string): ReadonlySet<string> {
  const nummern = new Set<string>();
  for (const treffer of text.matchAll(TABELLENZEILE)) nummern.add(treffer[1]!);
  for (const treffer of text.matchAll(NUMMERNFOLGE)) {
    for (const zahl of treffer[1]!.matchAll(/\d{1,4}/g)) nummern.add(zahl[0]);
  }
  return nummern;
}

export interface ArtikelVerweis {
  readonly href: string;
  readonly titel: string;
}

/** Ordnet jeder GOT-Nummer die Artikel zu, die sie behandeln, alphabetisch nach Titel. */
export function artikelJeGotNummer(
  artikel: readonly { readonly href: string; readonly titel: string; readonly text: string }[],
): ReadonlyMap<string, readonly ArtikelVerweis[]> {
  const verweise = new Map<string, ArtikelVerweis[]>();
  for (const eintrag of artikel) {
    for (const nummer of gotNummernImText(eintrag.text)) {
      const liste = verweise.get(nummer) ?? [];
      liste.push({ href: eintrag.href, titel: eintrag.titel });
      verweise.set(nummer, liste);
    }
  }
  for (const liste of verweise.values()) liste.sort((a, b) => a.titel.localeCompare(b.titel, 'de'));
  return verweise;
}
