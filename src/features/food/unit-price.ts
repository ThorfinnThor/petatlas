/**
 * M15-02 — Grundpreis und Multipack.
 *
 * Der Grundpreis ist die einzige Zahl, mit der sich zwei Futterpackungen
 * überhaupt vergleichen lassen. Deshalb wird er hier streng gerechnet:
 *
 * - **Vollständige Mengenangabe oder gar nichts.** Fehlt Füllmenge oder
 *   Gebindegröße, gibt es keinen Grundpreis — keine Schätzung, kein „ca.“.
 * - **Multipack ist kein Einzelstück.** 6 × 400 g sind 2400 g; die Packung
 *   allein wäre eine falsche Basis.
 * - **Versand bleibt draußen.** Der Grundpreis bezieht sich auf den
 *   Artikelpreis; ein Versandanteil je Kilogramm hinge an der Bestellmenge
 *   und wäre für einen Vergleich unbrauchbar.
 * - **Ganzzahlige Untereinheiten.** Gerechnet wird in Cent, gerundet wird
 *   einmal am Ende und kaufmännisch.
 */
import type { Offer } from '../../domain/schemas/catalog.ts';
import { gesamtmengeGramm, type FoodProduct } from '../../domain/schemas/food.ts';

export interface Grundpreis {
  /** Preis je Kilogramm in Untereinheiten der Angebotswährung. */
  readonly proKilogrammMinor: number;
  /** Gesamtmenge, auf die sich der Preis bezieht. */
  readonly gesamtGramm: number;
  /** Klartext der Basis, etwa „6 × 400 g = 2,4 kg“. */
  readonly basis: string;
}

/** Menge in Klartext: „2 kg“ oder „6 × 400 g = 2,4 kg“. */
export function mengenText(futter: FoodProduct): string | null {
  const gesamt = gesamtmengeGramm(futter);
  if (gesamt === null || futter.netContentGrams === null || futter.packUnits === null) return null;
  const kilo = (gesamt / 1000).toLocaleString('de-DE', { maximumFractionDigits: 3 });
  if (futter.packUnits === 1) return `${kilo} kg`;
  return `${futter.packUnits} × ${futter.netContentGrams} g = ${kilo} kg`;
}

/**
 * Grundpreis je Kilogramm. `null`, sobald eine Mengenangabe fehlt.
 */
export function grundpreisJeKilogramm(angebot: Offer, futter: FoodProduct): Grundpreis | null {
  const gesamt = gesamtmengeGramm(futter);
  if (gesamt === null || gesamt <= 0) return null;
  const basis = mengenText(futter);
  if (basis === null) return null;
  return {
    proKilogrammMinor: Math.round((angebot.priceMinor * 1000) / gesamt),
    gesamtGramm: gesamt,
    basis,
  };
}

export interface FutterVergleich {
  readonly vergleichbar: boolean;
  /** Das Angebot mit dem niedrigsten Grundpreis. */
  readonly guenstigstes: Offer | null;
  readonly grund: string;
}

/**
 * Vergleicht Angebote zu Futterprodukten nach dem Grundpreis.
 *
 * Verglichen wird nur, was **dieselbe Variante** ist: gleiche Marke, gleicher
 * Produktname, gleiche Füllmenge je Packung und gleiche Tierart. Eine
 * abweichende Gebindegröße ist dabei ausdrücklich erlaubt — genau dafür ist
 * der Grundpreis da. Fehlt bei einem Angebot die Menge, unterbleibt der
 * Vergleich für alle: ein Ranking, in dem ein Teilnehmer nicht mitgerechnet
 * werden kann, ist irreführend.
 */
export function vergleicheFutter(
  eintraege: readonly { readonly angebot: Offer; readonly futter: FoodProduct }[],
  marketId: string,
): FutterVergleich {
  const imMarkt = eintraege.filter((eintrag) => eintrag.angebot.marketId === marketId);
  if (imMarkt.length < 2) {
    return {
      vergleichbar: false,
      guenstigstes: imMarkt[0]?.angebot ?? null,
      grund:
        imMarkt.length === 0
          ? 'Kein Angebot in diesem Markt.'
          : 'Nur ein Angebot — es gibt nichts zu vergleichen.',
    };
  }

  const erstes = imMarkt[0]!.futter;
  for (const eintrag of imMarkt.slice(1)) {
    const andere = eintrag.futter;
    if (andere.brand !== erstes.brand || andere.productName !== erstes.productName) {
      return { vergleichbar: false, guenstigstes: null, grund: 'Verschiedene Produkte.' };
    }
    if (andere.species !== erstes.species) {
      return { vergleichbar: false, guenstigstes: null, grund: 'Verschiedene Tierart.' };
    }
    if (andere.netContentGrams !== erstes.netContentGrams) {
      return {
        vergleichbar: false,
        guenstigstes: null,
        grund: 'Verschiedene Packungsgröße — das ist eine andere Variante, kein anderes Angebot.',
      };
    }
  }

  const bewertet: { angebot: Offer; proKilo: number }[] = [];
  for (const eintrag of imMarkt) {
    const grundpreis = grundpreisJeKilogramm(eintrag.angebot, eintrag.futter);
    if (grundpreis === null) {
      return {
        vergleichbar: false,
        guenstigstes: null,
        grund: 'Mindestens eine Mengenangabe fehlt; ein Grundpreisvergleich wäre geraten.',
      };
    }
    bewertet.push({ angebot: eintrag.angebot, proKilo: grundpreis.proKilogrammMinor });
  }

  bewertet.sort(
    (a, b) => a.proKilo - b.proKilo || (a.angebot.offerId < b.angebot.offerId ? -1 : 1),
  );
  return {
    vergleichbar: true,
    guenstigstes: bewertet[0]!.angebot,
    grund: 'Verglichen wird der Preis je Kilogramm; Versandkosten stehen daneben.',
  };
}
