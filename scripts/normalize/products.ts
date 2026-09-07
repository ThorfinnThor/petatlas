/**
 * M13-02 — Aus Feedzeilen werden Produkte.
 *
 * Die teuersten Fehler in einem Preisvergleich sind Verwechslungen:
 *
 * - ein **Multipack** wird mit einer Einzelpackung verglichen,
 * - eine **andere Größe** wird für dieselbe gehalten,
 * - zwei Artikel werden über einen **ähnlichen Namen** zusammengeführt.
 *
 * Dagegen hilft nur eines: nichts ableiten, was nicht dasteht. Tierart und
 * Kategorie kommen aus einer ausdrücklichen Zuordnungstabelle, nie aus dem
 * Produktnamen. Größe und Gebinde kommen aus eigenen Spalten, nie aus dem
 * Namen. Was fehlt, bleibt `null` — und mit `null` wird nicht verglichen.
 */
import kategorien from '../../config/commerce/category-map.json' with { type: 'json' };
import { isValidGtin } from '../../src/domain/schemas/common.ts';
import { ProductSchema, type Product } from '../../src/domain/schemas/catalog.ts';
import type { AwinRohzeile } from '../ingest/adapters/awin.ts';

interface Kategoriezuordnung {
  readonly feedCategory: string;
  readonly species: string;
  readonly category: string;
}

const ZUORDNUNG = new Map<string, Kategoriezuordnung>(
  (kategorien.entries as Kategoriezuordnung[]).map((eintrag) => [
    eintrag.feedCategory.toLowerCase(),
    eintrag,
  ]),
);

export interface Normalisierung<T> {
  readonly datensatz: T | null;
  /** Grund der Ablehnung. `null`, wenn übernommen. */
  readonly ablehnung: string | null;
}

/** Gewicht in Gramm aus einer ausdrücklichen Mengenangabe. */
export function grammAus(text: string): number | null {
  const roh = text.trim().toLowerCase().replace(',', '.');
  const treffer = /^(\d+(?:\.\d+)?)\s*(g|kg|ml|l)$/.exec(roh);
  if (treffer === null) return null;
  const zahl = Number(treffer[1]);
  if (!Number.isFinite(zahl) || zahl <= 0) return null;
  // Milliliter werden **nicht** in Gramm umgerechnet: das wäre eine Annahme
  // über die Dichte. Sie bleiben unbekannt.
  switch (treffer[2]) {
    case 'g':
      return Number.isInteger(zahl) ? zahl : null;
    case 'kg':
      return Number.isInteger(zahl * 1000) ? zahl * 1000 : null;
    default:
      return null;
  }
}

/** Gebindegröße aus einer ausdrücklichen Angabe. Kein Raten aus dem Namen. */
export function gebindeAus(text: string): number | null {
  const roh = text.trim();
  if (!/^\d+$/.test(roh)) return null;
  const zahl = Number(roh);
  return zahl >= 1 ? zahl : null;
}

export function produktId(zeile: AwinRohzeile): string {
  return `awin:${zeile.werte.merchant_id}:${zeile.werte.merchant_product_id}`;
}

/**
 * Normalisiert eine Feedzeile zu einem Produkt.
 *
 * Abgelehnt wird, was sich nicht eindeutig zuordnen lässt: eine unbekannte
 * Feedkategorie, eine fehlende Marke. Beides ließe sich raten — und genau das
 * soll nicht passieren.
 */
export function normalisiereProdukt(zeile: AwinRohzeile): Normalisierung<Product> {
  const werte = zeile.werte;
  const kategorie = ZUORDNUNG.get((werte.category_name ?? '').trim().toLowerCase());
  if (kategorie === undefined) {
    return {
      datensatz: null,
      ablehnung:
        `Feedkategorie "${werte.category_name ?? ''}" ist nicht zugeordnet. ` +
        'Tierart und Kategorie werden nicht aus dem Produktnamen geraten.',
    };
  }
  if ((werte.brand_name ?? '') === '') {
    return { datensatz: null, ablehnung: 'Ohne Marke lässt sich das Produkt nicht zuordnen.' };
  }

  const gtin = (werte.ean ?? '').trim();
  const kandidat = {
    productId: produktId(zeile),
    species: kategorie.species,
    category: kategorie.category,
    brand: werte.brand_name,
    // Eine ungültige Prüfziffer macht die GTIN unbekannt, nicht das Produkt
    // ungültig: die Nummer ist ein Zusatz, kein Wesensmerkmal.
    gtin: gtin !== '' && isValidGtin(gtin) ? gtin : null,
    variant: (werte.specifications ?? '') === '' ? null : (werte.specifications as string),
    netContentGrams: grammAus(werte.unit_size ?? ''),
    packUnits: gebindeAus(werte.pack_quantity ?? ''),
    material: null,
    verifiedAttributes: {},
  };

  const geprueft = ProductSchema.safeParse(kandidat);
  if (!geprueft.success) {
    return { datensatz: null, ablehnung: geprueft.error.message };
  }
  return { datensatz: geprueft.data, ablehnung: null };
}

export interface Vergleichbarkeit {
  readonly vergleichbar: boolean;
  /** Klartext, auch im vergleichbaren Fall. */
  readonly grund: string;
}

/**
 * Dürfen zwei Produkte als **dasselbe** behandelt und ihre Preise verglichen
 * werden?
 *
 * Zwei Wege führen zu ja: dieselbe geprüfte GTIN, oder Marke, Variante,
 * Füllmenge und Gebinde stimmen überein und sind alle bekannt. Alles andere
 * ist nein — insbesondere jede Unbekannte.
 */
export function vergleichbar(links: Product, rechts: Product): Vergleichbarkeit {
  if (links.productId === rechts.productId) {
    return { vergleichbar: false, grund: 'Dasselbe Angebot, kein Vergleich.' };
  }
  if (links.gtin !== null && rechts.gtin !== null) {
    if (links.gtin === rechts.gtin) {
      // Gleiche GTIN, aber widersprüchliche Mengen: dann stimmt etwas nicht,
      // und der Vergleich unterbleibt, statt eine Seite zu glauben.
      if (
        links.netContentGrams !== null &&
        rechts.netContentGrams !== null &&
        links.netContentGrams !== rechts.netContentGrams
      ) {
        return {
          vergleichbar: false,
          grund: 'Gleiche GTIN, verschiedene Füllmenge — die Daten widersprechen sich.',
        };
      }
      if (
        links.packUnits !== null &&
        rechts.packUnits !== null &&
        links.packUnits !== rechts.packUnits
      ) {
        return {
          vergleichbar: false,
          grund: 'Gleiche GTIN, verschiedene Gebindegröße — die Daten widersprechen sich.',
        };
      }
      return { vergleichbar: true, grund: 'Gleiche geprüfte GTIN.' };
    }
    return { vergleichbar: false, grund: 'Verschiedene GTIN.' };
  }

  if (links.brand !== rechts.brand) {
    return { vergleichbar: false, grund: 'Verschiedene Marken.' };
  }
  if (links.species !== rechts.species || links.category !== rechts.category) {
    return { vergleichbar: false, grund: 'Verschiedene Tierart oder Kategorie.' };
  }
  if (links.netContentGrams === null || rechts.netContentGrams === null) {
    return { vergleichbar: false, grund: 'Füllmenge mindestens einmal unbekannt.' };
  }
  if (links.netContentGrams !== rechts.netContentGrams) {
    return { vergleichbar: false, grund: 'Verschiedene Füllmenge.' };
  }
  if (links.packUnits === null || rechts.packUnits === null) {
    return { vergleichbar: false, grund: 'Gebindegröße mindestens einmal unbekannt.' };
  }
  if (links.packUnits !== rechts.packUnits) {
    return {
      vergleichbar: false,
      grund: 'Verschiedene Gebindegröße — Multipack ist kein Einzelstück.',
    };
  }
  if (links.variant !== rechts.variant) {
    return { vergleichbar: false, grund: 'Verschiedene Variante.' };
  }
  return {
    vergleichbar: true,
    grund: 'Marke, Kategorie, Füllmenge, Gebinde und Variante stimmen überein.',
  };
}

export interface Quarantaene {
  readonly gtin: string;
  readonly productIds: readonly string[];
  readonly grund: string;
}

/**
 * Produkte, die dieselbe GTIN tragen, aber einander widersprechen. Sie
 * werden nicht zusammengeführt und nicht verglichen, sondern gemeldet.
 */
export function findeQuarantaene(produkte: readonly Product[]): readonly Quarantaene[] {
  const nachGtin = new Map<string, Product[]>();
  for (const produkt of produkte) {
    if (produkt.gtin === null) continue;
    const vorhanden = nachGtin.get(produkt.gtin);
    if (vorhanden === undefined) nachGtin.set(produkt.gtin, [produkt]);
    else vorhanden.push(produkt);
  }

  const funde: Quarantaene[] = [];
  for (const [gtin, gruppe] of nachGtin) {
    if (gruppe.length < 2) continue;
    const erste = gruppe[0] as Product;
    for (const weiterer of gruppe.slice(1)) {
      const urteil = vergleichbar(erste, weiterer);
      if (!urteil.vergleichbar) {
        funde.push({
          gtin,
          productIds: gruppe.map((produkt) => produkt.productId).sort(),
          grund: urteil.grund,
        });
        break;
      }
    }
  }
  return funde.sort((a, b) => (a.gtin < b.gtin ? -1 : 1));
}
