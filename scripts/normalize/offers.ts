/**
 * M13-02 — Aus Feedzeilen werden Angebote.
 *
 * Ein Angebot ist ein Preis eines Händlers zu einer Zeit — nicht die Sache
 * selbst. Drei Dinge werden hier nicht getan:
 *
 * 1. **Unbekannter Versand wird nicht 0.** Ein leeres Feld heißt unbekannt;
 *    `0` heißt versandkostenfrei. Der Unterschied entscheidet darüber, ob ein
 *    Gesamtpreis stimmt.
 * 2. **Unbekannte Verfügbarkeit wird nicht „auf Lager“.** Ein leeres Feld
 *    ergibt `unknown`.
 * 3. **Keine Anzeigeerlaubnis ohne Vertrag.** `displayPermission` und
 *    `imagePermission` kommen von außen und sind fail-closed `false`.
 */
import feeds from '../../config/commerce/feeds.json' with { type: 'json' };
import { OfferSchema, type Offer } from '../../src/domain/schemas/catalog.ts';
import { preisInMinor, type AwinRohzeile } from '../ingest/adapters/awin.ts';
import { produktId, type Normalisierung } from './products.ts';

export interface AngebotsKontext {
  readonly marketId: string;
  /** Abrufzeitpunkt des Feeds; nicht „jetzt“. */
  readonly fetchedAt: string;
  /**
   * Vertragliche Erlaubnisse. Ohne ausdrückliche Freigabe bleibt beides
   * `false` — ein Angebot ohne Anzeigeerlaubnis wird nirgends gezeigt.
   */
  readonly displayPermission?: boolean;
  readonly imagePermission?: boolean;
  /** Ablaufzeitpunkt laut Vertrag oder Feed. */
  readonly expiresAt?: string | null;
  /**
   * Haltbarkeit eines Preises, falls der Feed keine nennt. Ohne Ablauf wäre
   * ein Preis unbegrenzt haltbar — und genau das ist er nicht: eine statische
   * Seite kann stehen bleiben, und dann steht eine alte Zahl da (M17-04).
   * Vorgabe ist das TTL aus `config/commerce/feeds.json`.
   */
  readonly ttlStunden?: number;
}

/** Vorgabehaltbarkeit eines Preises in Stunden, wenn der Feed keine nennt. */
export const STANDARD_TTL_STUNDEN = feeds.ttlHours;

/**
 * Der Ablaufzeitpunkt eines Preises. Nennt der Feed einen, gilt dieser.
 * Sonst wird er aus dem Abrufzeitpunkt und der Haltbarkeit gerechnet — nicht
 * auf `null` gesetzt: ein Preis ohne Ablauf würde die Browserprüfung
 * stillschweigend überspringen.
 */
export function ablauf(kontext: {
  readonly fetchedAt: string;
  readonly expiresAt?: string | null;
  readonly ttlStunden?: number;
}): string | null {
  if (kontext.expiresAt !== undefined && kontext.expiresAt !== null) return kontext.expiresAt;
  const abruf = Date.parse(kontext.fetchedAt);
  if (Number.isNaN(abruf)) return null;
  const stunden = kontext.ttlStunden ?? STANDARD_TTL_STUNDEN;
  return new Date(abruf + stunden * 60 * 60 * 1000).toISOString();
}

/** Versandkosten: leer heißt unbekannt, „0“ heißt versandkostenfrei. */
export function versandInMinor(text: string): number | null {
  const roh = text.trim();
  if (roh === '') return null;
  return preisInMinor(roh);
}

/** Verfügbarkeit aus dem Feld `in_stock`. Leer bleibt unbekannt. */
export function verfuegbarkeit(text: string): Offer['availability'] {
  const roh = text.trim().toLowerCase();
  if (roh === '1' || roh === 'true' || roh === 'yes' || roh === 'y') return 'in_stock';
  if (roh === '0' || roh === 'false' || roh === 'no' || roh === 'n') return 'out_of_stock';
  return 'unknown';
}

export function normalisiereAngebot(
  zeile: AwinRohzeile,
  kontext: AngebotsKontext,
): Normalisierung<Offer> {
  const werte = zeile.werte;
  const preis = preisInMinor(werte.search_price ?? '');
  if (preis === null) {
    return { datensatz: null, ablehnung: `Preis "${werte.search_price}" ist nicht lesbar.` };
  }

  const kandidat = {
    offerId: `awin:${werte.merchant_id}:${werte.aw_product_id}`,
    productId: produktId(zeile),
    merchantId: werte.merchant_id,
    marketId: kontext.marketId,
    currency: (werte.currency ?? '').toUpperCase(),
    priceMinor: preis,
    shippingMinor: versandInMinor(werte.delivery_cost ?? ''),
    availability: verfuegbarkeit(werte.in_stock ?? ''),
    kind: 'regular' as const,
    affiliateUrl: werte.aw_deep_link,
    fetchedAt: kontext.fetchedAt,
    expiresAt: ablauf(kontext),
    // Fail-closed: ohne ausdrückliche vertragliche Erlaubnis wird nichts
    // angezeigt und kein Bild eingebunden.
    displayPermission: kontext.displayPermission === true,
    imagePermission: kontext.imagePermission === true,
  };

  const geprueft = OfferSchema.safeParse(kandidat);
  if (!geprueft.success) {
    return { datensatz: null, ablehnung: geprueft.error.message };
  }
  return { datensatz: geprueft.data, ablehnung: null };
}

export interface FeedErgebnis {
  readonly angebote: readonly Offer[];
  readonly abgelehnt: readonly { readonly zeile: number; readonly grund: string }[];
}

/** Normalisiert alle Zeilen eines Feeds; nichts fällt still weg. */
export function normalisiereAngebote(
  zeilen: readonly AwinRohzeile[],
  kontext: AngebotsKontext,
): FeedErgebnis {
  const angebote: Offer[] = [];
  const abgelehnt: { zeile: number; grund: string }[] = [];
  for (const zeile of zeilen) {
    const ergebnis = normalisiereAngebot(zeile, kontext);
    if (ergebnis.datensatz === null) {
      abgelehnt.push({ zeile: zeile.zeile, grund: ergebnis.ablehnung ?? 'unbekannter Grund' });
    } else {
      angebote.push(ergebnis.datensatz);
    }
  }
  return {
    angebote: angebote.sort((a, b) => (a.offerId < b.offerId ? -1 : 1)),
    abgelehnt,
  };
}
