/**
 * M14-03 — Deterministisches Matching für Pflege und Spielzeug.
 *
 * Zwei Stufen, streng getrennt:
 *
 * 1. **Harte Filter** schließen aus: falsche Tierart, überschrittene
 *    Herstellergrenze, Größenbereich, der die Angabe des Halters ausschließt.
 *    Sie brauchen einen **belegten** Wert; eine unbekannte Eigenschaft
 *    schließt nichts aus — sie macht aber auch nichts passend.
 * 2. **Weiche Sortierung** ordnet nur nach erklärbaren Bedürfnissen wie
 *    „drinnen“ oder „apportiert gern“. Jeder Punkt hat einen Satz, der ihn
 *    erklärt; was sich nicht erklären lässt, zählt nicht.
 *
 * Was hier ausdrücklich **nicht** passiert: aus einer Rasse folgt nichts.
 * Keine Kategorie, kein Punkt, keine Empfehlung — Rasse ist keine Diagnose
 * und schon gar keine Produkteignung.
 */
import type {
  ProductAttribute,
  ProductAttributes,
} from '../../domain/schemas/product-attributes.ts';
import { matchbareAttribute, ungepruefteAttribute } from './attributes.ts';
import { kategorie } from './taxonomy.ts';

export interface Bedarf {
  readonly species: string;
  /** Gewicht in Kilogramm. `null` heißt unbekannt. */
  readonly weightKilograms: number | null;
  /** Erklärbare Bedürfnisse, etwa `indoor` oder `apportieren`. */
  readonly needs: readonly string[];
  /**
   * Rasse, falls angegeben. Sie wird **nicht** ausgewertet und steht hier
   * nur, damit sichtbar ist, dass sie nichts bewirkt.
   */
  readonly breed?: string | null;
}

/** Bedürfnisse, die es gibt — mit dem Satz, der sie erklärt. */
export const BEDUERFNISSE: Readonly<
  Record<string, { readonly label: string; readonly erklaerung: string }>
> = {
  indoor: {
    label: 'lebt drinnen',
    erklaerung: 'Bevorzugt Spielzeug für die Wohnung; nichts, was Platz oder Wurfweite braucht.',
  },
  apportieren: {
    label: 'apportiert gern',
    erklaerung: 'Bevorzugt Wurf- und Apportierspielzeug.',
  },
  kauen: {
    label: 'kaut viel',
    erklaerung: 'Bevorzugt Kauspielzeug. Eine Aussage über Haltbarkeit ist damit nicht verbunden.',
  },
  beschaeftigung: {
    label: 'braucht Beschäftigung',
    erklaerung: 'Bevorzugt Denk- und Suchspiele.',
  },
  wasser: {
    label: 'geht ins Wasser',
    erklaerung: 'Bevorzugt Spielzeug, das laut Hersteller schwimmt.',
  },
  langhaar: {
    label: 'langes Fell',
    erklaerung: 'Bevorzugt Pflegewerkzeug, das der Hersteller für langes Fell nennt.',
  },
};

/** Welche Kategorie zu welchem Bedürfnis passt. Ausdrücklich, nicht geraten. */
const BEDARF_KATEGORIEN: Readonly<Record<string, readonly string[]>> = {
  indoor: ['indoor-cat-toy', 'puzzle-toy', 'scratching'],
  apportieren: ['fetch-toy'],
  kauen: ['chew-toy'],
  beschaeftigung: ['puzzle-toy'],
  wasser: ['fetch-toy'],
  langhaar: ['grooming-brush'],
};

export interface Treffer {
  readonly productId: string;
  readonly categoryId: string;
  /** Übersteht das Produkt die harten Filter? */
  readonly zulaessig: boolean;
  /** Warum ein Produkt ausgeschlossen wurde. Leer, wenn zulässig. */
  readonly ausschluss: readonly string[];
  /** Punkte aus weichen Kriterien, je mit Erklärung. */
  readonly begruendung: readonly string[];
  readonly punkte: number;
  /** Merkmale der Kategorie ohne belegten Wert. */
  readonly ungeprueft: readonly string[];
}

function wert(attribute: readonly ProductAttribute[], name: string): ProductAttribute | undefined {
  return attribute.find((eintrag) => eintrag.attribute === name);
}

/** Zahl aus „ab 15 kg Körpergewicht“ oder „bis 10 kg“. Sonst `null`. */
export function grenzeAus(
  text: string,
): { readonly art: 'min' | 'max'; readonly kilogramm: number } | null {
  const roh = text.toLowerCase().replace(',', '.');
  const ab = /^ab\s+(\d+(?:\.\d+)?)\s*kg/.exec(roh);
  if (ab !== null) return { art: 'min', kilogramm: Number(ab[1]) };
  const bis = /^bis\s+(\d+(?:\.\d+)?)\s*kg/.exec(roh);
  if (bis !== null) return { art: 'max', kilogramm: Number(bis[1]) };
  return null;
}

/**
 * Bewertet ein Produkt gegen einen Bedarf.
 *
 * Ein Produkt wird nie „passend“, weil eine Eigenschaft fehlt: Punkte gibt es
 * ausschließlich für belegte Werte.
 */
export function bewerte(produkt: ProductAttributes, bedarf: Bedarf): Treffer {
  const eintrag = kategorie(produkt.categoryId);
  const ausschluss: string[] = [];
  const begruendung: string[] = [];
  let punkte = 0;

  if (eintrag === undefined) {
    return {
      productId: produkt.productId,
      categoryId: produkt.categoryId,
      zulaessig: false,
      ausschluss: ['Unbekannte Kategorie.'],
      begruendung: [],
      punkte: 0,
      ungeprueft: [],
    };
  }

  if (!eintrag.species.includes(bedarf.species as (typeof eintrag.species)[number])) {
    ausschluss.push(`${eintrag.label} ist nicht für diese Tierart vorgesehen.`);
  }

  const belegt = matchbareAttribute(produkt);
  const produktTierart = wert(belegt, 'species');
  if (
    produktTierart &&
    typeof produktTierart.value === 'string' &&
    produktTierart.value !== bedarf.species
  ) {
    ausschluss.push('Der Hersteller nennt für dieses Produkt eine andere Tierart.');
  }

  // Herstellergrenze: nur mit belegtem Wert und bekanntem Gewicht.
  const maxLast = wert(belegt, 'maxLoadKilograms');
  if (
    maxLast !== undefined &&
    typeof maxLast.value === 'number' &&
    bedarf.weightKilograms !== null
  ) {
    if (bedarf.weightKilograms > maxLast.value) {
      ausschluss.push(
        `Hersteller nennt ${maxLast.value} kg als Grenze; angegeben sind ${bedarf.weightKilograms} kg.`,
      );
    } else {
      begruendung.push(`Herstellergrenze ${maxLast.value} kg wird eingehalten.`);
      punkte += 1;
    }
  }

  const bereich = wert(belegt, 'sizeRange');
  if (
    bereich !== undefined &&
    typeof bereich.value === 'string' &&
    bedarf.weightKilograms !== null
  ) {
    const grenze = grenzeAus(bereich.value);
    if (grenze !== null) {
      const passt =
        grenze.art === 'min'
          ? bedarf.weightKilograms >= grenze.kilogramm
          : bedarf.weightKilograms <= grenze.kilogramm;
      if (!passt) {
        ausschluss.push(
          `Herstellerangabe „${bereich.value}“ schließt ${bedarf.weightKilograms} kg aus.`,
        );
      } else {
        begruendung.push(`Herstellerangabe „${bereich.value}“ passt zum angegebenen Gewicht.`);
        punkte += 1;
      }
    }
  }

  // Weiche Kriterien: nur erklärbare Bedürfnisse, nur belegte Merkmale.
  for (const beduerfnis of bedarf.needs) {
    const beschreibung = BEDUERFNISSE[beduerfnis];
    if (beschreibung === undefined) continue;
    if ((BEDARF_KATEGORIEN[beduerfnis] ?? []).includes(produkt.categoryId)) {
      punkte += 2;
      begruendung.push(`${beschreibung.label}: ${beschreibung.erklaerung}`);
    }
    if (beduerfnis === 'wasser') {
      const schwimmt = wert(belegt, 'floats');
      if (schwimmt?.value === true) {
        punkte += 1;
        begruendung.push('Laut Hersteller schwimmfähig.');
      }
    }
  }

  return {
    productId: produkt.productId,
    categoryId: produkt.categoryId,
    zulaessig: ausschluss.length === 0,
    ausschluss,
    begruendung,
    punkte,
    ungeprueft: ungepruefteAttribute(produkt),
  };
}

/**
 * Bewertet alle Produkte und sortiert die zulässigen nach Punkten.
 *
 * Ein Produkt ohne einen einzigen belegten Punkt erscheint mit Punktzahl 0 —
 * und die Oberfläche sagt dazu, dass nichts geprüft ist, statt es als
 * passend auszugeben.
 */
export function finde(produkte: readonly ProductAttributes[], bedarf: Bedarf): readonly Treffer[] {
  return produkte
    .map((produkt) => bewerte(produkt, bedarf))
    .filter((treffer) => treffer.zulaessig)
    .sort((a, b) => b.punkte - a.punkte || (a.productId < b.productId ? -1 : 1));
}
