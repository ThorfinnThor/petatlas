/**
 * M13-04 — Preise ehrlich darstellen.
 *
 * Vier Behauptungen, die eine Angebotsseite gern aufstellt und die hier
 * ausgeschlossen sind:
 *
 * 1. **„Versandkostenfrei“, wenn der Versand unbekannt ist.** `null` heißt
 *    unbekannt; nur eine ausdrückliche 0 heißt kostenlos.
 * 2. **„Bestpreis“ über ungleiche Dinge.** Verglichen wird nur, was nach
 *    `vergleichbar()` dasselbe Produkt in demselben Markt ist.
 * 3. **„Günstigster Gesamtpreis“ ohne bekannten Versand.** Fehlt bei einem
 *    Angebot der Versand, gibt es keine Gesamtpreisaussage, sondern nur eine
 *    über den Artikelpreis — und die sagt das auch.
 * 4. **Neukundenrabatte im allgemeinen Vergleich.** Ein Preis, den nur
 *    manche bekommen, ist kein Preis für alle.
 */
import { totalPrice, type Offer, type Product } from '../../domain/schemas/catalog.ts';
import { vergleichbar } from '../../../scripts/normalize/products.ts';

export interface Grundpreis {
  /** Preis je Kilogramm in Untereinheiten. */
  readonly proKilogrammMinor: number;
  readonly basis: string;
}

/**
 * Grundpreis je Kilogramm — nur wenn Füllmenge **und** Gebindegröße bekannt
 * sind. Bei unbekannter Menge gibt es keinen Grundpreis, keine Schätzung und
 * keinen Hinweis „ca.“.
 */
export function grundpreis(angebot: Offer, produkt: Product): Grundpreis | null {
  if (produkt.netContentGrams === null || produkt.packUnits === null) return null;
  const gesamtGramm = produkt.netContentGrams * produkt.packUnits;
  if (gesamtGramm <= 0) return null;
  return {
    proKilogrammMinor: Math.round((angebot.priceMinor / gesamtGramm) * 1000),
    basis: `${(gesamtGramm / 1000).toLocaleString('de-DE')} kg (${produkt.packUnits} × ${produkt.netContentGrams} g)`,
  };
}

/** Nur eine ausdrückliche 0 ist versandkostenfrei. */
export function versandkostenfrei(angebot: Offer): boolean {
  return angebot.shippingMinor === 0;
}

export interface PreisAussage {
  readonly betragMinor: number;
  readonly währung: string;
  /** Sagt, worauf sich der Betrag bezieht — und was fehlt. */
  readonly label: string;
  readonly versandBekannt: boolean;
}

export function preisAussage(angebot: Offer): PreisAussage {
  const gesamt = totalPrice(angebot);
  return {
    betragMinor: gesamt.totalMinor,
    währung: angebot.currency,
    label: gesamt.label,
    versandBekannt: gesamt.shippingKnown,
  };
}

export interface VergleichsErgebnis {
  /** Darf überhaupt verglichen werden? */
  readonly vergleichbar: boolean;
  /** Das günstigste Angebot — nur wenn ein Vergleich zulässig ist. */
  readonly guenstigstes: Offer | null;
  /** Bezieht sich der Vergleich auf den Gesamtpreis oder nur den Artikel? */
  readonly bezug: 'gesamtpreis' | 'artikelpreis' | 'keiner';
  /** Klartext, auch im zulässigen Fall. */
  readonly grund: string;
  /** Angebote, die nicht für alle gelten und deshalb außen vor bleiben. */
  readonly nurFuerManche: readonly Offer[];
}

/**
 * Vergleicht Angebote zu **einem** Produkt in **einem** Markt.
 *
 * Der Vergleich ist zulässig, wenn alle beteiligten Produkte nach
 * `vergleichbar()` dasselbe sind. Er bezieht sich auf den Gesamtpreis, wenn
 * bei allen der Versand bekannt ist — sonst ausdrücklich nur auf den
 * Artikelpreis.
 */
export function vergleicheAngebote(
  angebote: readonly Offer[],
  produkte: readonly Product[],
  marketId: string,
): VergleichsErgebnis {
  const imMarkt = angebote.filter((angebot) => angebot.marketId === marketId);
  const nurFuerManche = imMarkt.filter((angebot) => angebot.kind === 'new_customer_only');
  const allgemein = imMarkt.filter((angebot) => angebot.kind !== 'new_customer_only');

  if (allgemein.length < 2) {
    return {
      vergleichbar: false,
      guenstigstes: allgemein[0] ?? null,
      bezug: 'keiner',
      grund:
        allgemein.length === 0
          ? 'Kein Angebot in diesem Markt.'
          : 'Nur ein Angebot — es gibt nichts zu vergleichen.',
      nurFuerManche,
    };
  }

  const nachId = new Map(produkte.map((produkt) => [produkt.productId, produkt]));
  const erstes = nachId.get(allgemein[0]!.productId);
  if (erstes === undefined) {
    return {
      vergleichbar: false,
      guenstigstes: null,
      bezug: 'keiner',
      grund: 'Zu mindestens einem Angebot fehlt das Produkt.',
      nurFuerManche,
    };
  }

  for (const angebot of allgemein.slice(1)) {
    const weiteres = nachId.get(angebot.productId);
    if (weiteres === undefined) {
      return {
        vergleichbar: false,
        guenstigstes: null,
        bezug: 'keiner',
        grund: 'Zu mindestens einem Angebot fehlt das Produkt.',
        nurFuerManche,
      };
    }
    if (weiteres.productId === erstes.productId) continue;
    const urteil = vergleichbar(erstes, weiteres);
    if (!urteil.vergleichbar) {
      return {
        vergleichbar: false,
        guenstigstes: null,
        bezug: 'keiner',
        grund: `Kein Vergleich: ${urteil.grund}`,
        nurFuerManche,
      };
    }
  }

  const versandVollstaendig = allgemein.every((angebot) => angebot.shippingMinor !== null);
  const bewertet = allgemein
    .map((angebot) => ({
      angebot,
      betrag: versandVollstaendig ? totalPrice(angebot).totalMinor : angebot.priceMinor,
    }))
    .sort((a, b) => a.betrag - b.betrag || (a.angebot.offerId < b.angebot.offerId ? -1 : 1));

  return {
    vergleichbar: true,
    guenstigstes: bewertet[0]!.angebot,
    bezug: versandVollstaendig ? 'gesamtpreis' : 'artikelpreis',
    grund: versandVollstaendig
      ? 'Alle Angebote nennen ihre Versandkosten; verglichen wird der Gesamtpreis.'
      : 'Mindestens ein Angebot nennt keine Versandkosten; verglichen wird nur der Artikelpreis.',
    nurFuerManche,
  };
}

/** Betrag in Untereinheiten als deutscher Preistext. */
export function formatiereBetrag(minor: number, währung: string, locale = 'de-DE'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: währung }).format(
    minor / 100,
  );
}

/** Ist das Angebot abgelaufen? Ohne Ablaufdatum lautet die Antwort nein. */
export function abgelaufen(angebot: Offer, jetzt: string): boolean {
  return angebot.expiresAt !== null && angebot.expiresAt <= jetzt;
}

export const VERFUEGBARKEIT_LABEL: Readonly<Record<Offer['availability'], string>> = {
  in_stock: 'laut Händler verfügbar',
  out_of_stock: 'laut Händler nicht verfügbar',
  unknown: 'Verfügbarkeit nicht angegeben',
};
