/**
 * M13-05 — Filtern und Sortieren im Katalog.
 *
 * Zwei Regeln bestimmen alles:
 *
 * 1. **Ein Filter findet nur zulässige Angebote.** Anzeigeerlaubnis, Markt
 *    und Ablauf werden vor jedem Filter geprüft — nicht danach und nicht
 *    optional. Ein Filter kann kein Angebot sichtbar machen, das ohne ihn
 *    nicht sichtbar wäre.
 * 2. **Die Sortierung ist erklärbar und provisionsunabhängig.** Jede
 *    Sortierung nennt im Klartext, wonach sie ordnet. Es gibt keine Ordnung
 *    nach Ertrag, Partnerschaft oder „Relevanz“ — Letzteres wäre nur ein
 *    anderes Wort für „nach unserem Vorteil“.
 */
import { isDisplayable, type Offer, type Product } from '../../domain/schemas/catalog.ts';
import { grundpreis } from './pricing.ts';

export interface KatalogEintrag {
  readonly angebot: Offer;
  readonly produkt: Product;
}

export interface KatalogFilter {
  readonly species?: string;
  readonly category?: string;
  readonly brand?: string;
  readonly availability?: Offer['availability'];
  readonly maxPreisMinor?: number;
}

export type SortierSchluessel = 'preis' | 'grundpreis' | 'marke' | 'stand';

export interface Sortierung {
  readonly schluessel: SortierSchluessel;
  /** Was die Sortierung tut — in einem Satz, für die Oberfläche. */
  readonly erklaerung: string;
}

/**
 * Die angebotenen Sortierungen. Bewusst kurz und bewusst ohne „Relevanz“:
 * eine Ordnung, die sich nicht erklären lässt, lässt sich auch nicht prüfen.
 */
export const SORTIERUNGEN: readonly Sortierung[] = [
  { schluessel: 'preis', erklaerung: 'Artikelpreis aufsteigend; der Versand steht daneben.' },
  {
    schluessel: 'grundpreis',
    erklaerung:
      'Preis je Kilogramm aufsteigend. Angebote ohne bekannte Füllmenge stehen am Ende, weil sich für sie kein Grundpreis rechnen lässt.',
  },
  { schluessel: 'marke', erklaerung: 'Marke alphabetisch von A bis Z, unabhängig vom Preis.' },
  {
    schluessel: 'stand',
    erklaerung: 'Zuletzt abgerufener Preis zuerst; ältere Stände stehen weiter unten.',
  },
];

/**
 * Die überhaupt zeigbaren Einträge: Anzeigeerlaubnis, richtiger Markt, nicht
 * abgelaufen, und zu jedem Angebot muss das Produkt vorliegen.
 */
export function zeigbareEintraege(
  angebote: readonly Offer[],
  produkte: readonly Product[],
  marketId: string,
  jetzt: string,
): readonly KatalogEintrag[] {
  const nachId = new Map(produkte.map((produkt) => [produkt.productId, produkt]));
  const eintraege: KatalogEintrag[] = [];
  for (const angebot of angebote) {
    if (!isDisplayable(angebot, marketId, jetzt)) continue;
    const produkt = nachId.get(angebot.productId);
    if (produkt === undefined) continue;
    eintraege.push({ angebot, produkt });
  }
  return eintraege;
}

/** Wendet die Filter an. Die Zulässigkeitsprüfung ist bereits geschehen. */
export function filtere(
  eintraege: readonly KatalogEintrag[],
  filter: KatalogFilter,
): readonly KatalogEintrag[] {
  return eintraege.filter((eintrag) => {
    if (filter.species !== undefined && eintrag.produkt.species !== filter.species) return false;
    if (filter.category !== undefined && eintrag.produkt.category !== filter.category) return false;
    if (filter.brand !== undefined && eintrag.produkt.brand !== filter.brand) return false;
    if (filter.availability !== undefined && eintrag.angebot.availability !== filter.availability) {
      return false;
    }
    if (filter.maxPreisMinor !== undefined && eintrag.angebot.priceMinor > filter.maxPreisMinor) {
      return false;
    }
    return true;
  });
}

/**
 * Sortiert. Der Vergleich benutzt ausschließlich die genannten Merkmale;
 * bei Gleichstand entscheidet die Angebots-ID, damit die Reihenfolge
 * reproduzierbar bleibt und nicht von der Eingabereihenfolge abhängt.
 */
export function sortiere(
  eintraege: readonly KatalogEintrag[],
  schluessel: SortierSchluessel,
): readonly KatalogEintrag[] {
  const kopie = [...eintraege];
  kopie.sort((a, b) => {
    switch (schluessel) {
      case 'preis':
        if (a.angebot.priceMinor !== b.angebot.priceMinor) {
          return a.angebot.priceMinor - b.angebot.priceMinor;
        }
        break;
      case 'grundpreis': {
        const links = grundpreis(a.angebot, a.produkt)?.proKilogrammMinor ?? null;
        const rechts = grundpreis(b.angebot, b.produkt)?.proKilogrammMinor ?? null;
        // Unbekannt ans Ende — nicht als teuerster und nicht als billigster.
        if (links === null && rechts !== null) return 1;
        if (links !== null && rechts === null) return -1;
        if (links !== null && rechts !== null && links !== rechts) return links - rechts;
        break;
      }
      case 'marke':
        if (a.produkt.brand !== b.produkt.brand) {
          return a.produkt.brand.localeCompare(b.produkt.brand, 'de-DE');
        }
        break;
      case 'stand':
        if (a.angebot.fetchedAt !== b.angebot.fetchedAt) {
          return a.angebot.fetchedAt < b.angebot.fetchedAt ? 1 : -1;
        }
        break;
    }
    return a.angebot.offerId < b.angebot.offerId ? -1 : 1;
  });
  return kopie;
}

export interface KatalogAnsicht {
  readonly eintraege: readonly KatalogEintrag[];
  readonly sortierung: Sortierung;
  /** Klartext für den leeren Fall. `null`, wenn es Treffer gibt. */
  readonly leerHinweis: string | null;
}

export function katalogAnsicht(
  angebote: readonly Offer[],
  produkte: readonly Product[],
  marketId: string,
  jetzt: string,
  filter: KatalogFilter = {},
  schluessel: SortierSchluessel = 'preis',
): KatalogAnsicht {
  const zeigbar = zeigbareEintraege(angebote, produkte, marketId, jetzt);
  const gefiltert = filtere(zeigbar, filter);
  const sortierung =
    SORTIERUNGEN.find((eintrag) => eintrag.schluessel === schluessel) ??
    (SORTIERUNGEN[0] as Sortierung);

  let leerHinweis: string | null = null;
  if (gefiltert.length === 0) {
    leerHinweis =
      zeigbar.length === 0
        ? 'Es gibt derzeit keine Angebote: ohne freigegebenen Partnervertrag wird keines angezeigt. ' +
          'Das ist kein Fehler und keine Aussage über den Markt.'
        : 'Zu diesen Filtern ist nichts vorhanden. Das heißt nicht, dass es solche Angebote nicht gibt — ' +
          'nur, dass hier keines erfasst ist.';
  }

  return { eintraege: gefiltert, sortierung, leerHinweis };
}
