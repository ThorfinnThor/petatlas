/**
 * M03-04 — Produkt und Angebot.
 *
 * `Product` ist die Sache, `Offer` ist ein Preis eines Händlers für diese
 * Sache in einem Markt zu einer Zeit. Beides zu vermischen erzeugt genau die
 * Fehler, die der Plan verbietet: Multipack als Einzelpackung, Preis ohne
 * Versand als „günstigstes Gesamtangebot“, abgelaufene Preise als aktuell.
 */
import { z } from 'zod';

import {
  CurrencyCode,
  Gtin,
  IsoTimestamp,
  MarketId,
  MinorAmount,
  Species,
  TriState,
} from './common.ts';

export const ProductSchema = z
  .object({
    productId: z.string().min(1),
    species: Species,
    category: z.string().min(1),
    brand: z.string().min(1),
    /** String, damit führende Nullen erhalten bleiben. `null` = unbekannt. */
    gtin: Gtin.nullable(),
    variant: z.string().nullable(),
    /** Nettofüllmenge in Gramm. `null` = unbekannt, nicht 0. */
    netContentGrams: z.number().int().positive().nullable(),
    /** Stückzahl im Gebinde. Ein Multipack ist keine Einzelpackung. */
    packUnits: z.number().int().positive(),
    material: z.string().nullable(),
    /** Nur belegte Herstellerangaben; keine abgeleitete medizinische Eignung. */
    verifiedAttributes: z.record(z.string(), z.union([z.string(), z.number(), TriState])),
  })
  .strict();
export type Product = z.infer<typeof ProductSchema>;

export const Availability = z.enum(['in_stock', 'out_of_stock', 'unknown']);
export const OfferKind = z.enum(['regular', 'discount', 'new_customer_only']);

export const OfferSchema = z
  .object({
    offerId: z.string().min(1),
    productId: z.string().min(1),
    merchantId: z.string().min(1),
    marketId: MarketId,
    currency: CurrencyCode,
    priceMinor: MinorAmount,
    /** `null` heißt unbekannter Versand — ausdrücklich nicht kostenlos. */
    shippingMinor: MinorAmount.nullable(),
    availability: Availability,
    kind: OfferKind,
    affiliateUrl: z.url(),
    fetchedAt: IsoTimestamp,
    expiresAt: IsoTimestamp.nullable(),
    /** Vertragliche Erlaubnis, dieses Angebot überhaupt anzuzeigen. */
    displayPermission: z.boolean(),
    imagePermission: z.boolean(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.expiresAt && value.expiresAt <= value.fetchedAt) {
      ctx.addIssue({
        code: 'custom',
        message: 'expiresAt liegt nicht nach fetchedAt.',
        path: ['expiresAt'],
      });
    }
    if (value.priceMinor === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Preis 0 ist kein Angebot, sondern ein Datenfehler.',
        path: ['priceMinor'],
      });
    }
  });
export type Offer = z.infer<typeof OfferSchema>;

export interface TotalPrice {
  readonly totalMinor: number;
  /** false, wenn der Versand unbekannt ist. */
  readonly shippingKnown: boolean;
  /** Label, das die Unsicherheit benennt statt sie zu verschweigen. */
  readonly label: 'Gesamtpreis inklusive Versand' | 'Artikelpreis ohne unbekannte Versandkosten';
}

/** Gesamtpreis eines Angebots. Unbekannter Versand wird nicht als 0 gerechnet. */
export function totalPrice(offer: Offer): TotalPrice {
  if (offer.shippingMinor === null) {
    return {
      totalMinor: offer.priceMinor,
      shippingKnown: false,
      label: 'Artikelpreis ohne unbekannte Versandkosten',
    };
  }
  return {
    totalMinor: offer.priceMinor + offer.shippingMinor,
    shippingKnown: true,
    label: 'Gesamtpreis inklusive Versand',
  };
}

/**
 * Darf das Angebot angezeigt werden? Fehlende Anzeigeerlaubnis, abgelaufener
 * Preis oder ein fremder Markt schließen die Anzeige aus.
 */
export function isDisplayable(offer: Offer, marketId: string, now: string): boolean {
  if (!offer.displayPermission) return false;
  if (offer.marketId !== marketId) return false;
  if (offer.expiresAt !== null && offer.expiresAt <= now) return false;
  return true;
}
