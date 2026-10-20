/**
 * Produktvergleiche mit begründeter Empfehlung (ADR-021).
 *
 * Jede Seite legt ihre Kriterien mit Gewicht offen; jede Teilnote folgt aus
 * einem belegten Wert (Herstellerangabe oder Händlerpreis mit Datum) und
 * lässt sich auf der Seite nachrechnen. Es ist eine redaktionelle Abwägung
 * nach unseren Kriterien, kein Praxistest (ADR-015).
 */
import { z } from 'zod';

import { IsoDate } from '../../domain/schemas/common.ts';

export const KATEGORIEN = [
  'katzentrinkbrunnen',
  'katzen-futterautomat',
  'katzentoilette',
  'katzenspielzeug-kugelbahn',
  'katzentransportbox',
  'hunderampe-auto',
  'kauspielzeug-hund',
  'rollleine',
  'hundetransportbox-auto',
] as const;
export type Kategorie = (typeof KATEGORIEN)[number];

export type Wert = number | string | boolean | null;

const AngabeSchema = z
  .object({
    value: z.union([z.number(), z.string(), z.boolean(), z.null()]),
    /** Wörtlicher Ausschnitt der Quelle, der den Wert belegt. */
    verbatim: z.string().nullable(),
    sourceUrl: z.url().nullable(),
  })
  .strict();
export type Angabe = z.infer<typeof AngabeSchema>;

export const ProduktSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    category: z.enum(KATEGORIEN),
    brand: z.string().min(1),
    model: z.string().min(1),
    variant: z.string().nullable(),
    sourceUrl: z.url(),
    specs: z.record(z.string(), AngabeSchema),
    price: z
      .object({
        retailer: z.string().min(1),
        priceEur: z.number().positive(),
        label: z.string().min(1),
        url: z.url(),
        verbatim: z.string().min(1),
      })
      .strict()
      .nullable(),
    checkedAt: IsoDate,
    notes: z.string().optional(),
  })
  .strict();
export type Produkt = z.infer<typeof ProduktSchema>;

export function wert(produkt: Produkt, schluessel: string): Wert {
  return produkt.specs[schluessel]?.value ?? null;
}

export function zahl(produkt: Produkt, schluessel: string): number | null {
  const w = wert(produkt, schluessel);
  return typeof w === 'number' ? w : null;
}

export function ja(produkt: Produkt, schluessel: string): boolean | null {
  const w = wert(produkt, schluessel);
  return typeof w === 'boolean' ? w : null;
}

export function text(produkt: Produkt, schluessel: string): string | null {
  const w = wert(produkt, schluessel);
  return typeof w === 'string' ? w : null;
}

/** Linear zwischen „schlecht“ (0) und „gut“ (1), außerhalb begrenzt. */
export function skala(wert: number, schlecht: number, gut: number): number {
  if (schlecht === gut) return 1;
  return Math.min(1, Math.max(0, (wert - schlecht) / (gut - schlecht)));
}

export function deutsch(wert: number, stellen = 1): string {
  const gerundet = Math.round(wert * 10 ** stellen) / 10 ** stellen;
  return String(gerundet).replace('.', ',');
}

export function euro(wert: number): string {
  return `${wert.toFixed(2).replace('.', ',')} €`;
}

export interface Ergebnis {
  /** Anteil der möglichen Punkte, 0 bis 1. */
  readonly anteil: number;
  readonly begruendung: string;
}

export interface Kriterium {
  readonly name: string;
  readonly gewicht: number;
  /** Die Regel in einem Satz, so wie sie auf der Seite steht. */
  readonly regel: string;
  readonly bewerte: (produkt: Produkt, alle: readonly Produkt[]) => Ergebnis;
}

/**
 * Preis: das günstigste Modell bekommt alle Punkte, das teuerste ein Fünftel,
 * dazwischen logarithmisch (wie im Futtervergleich). Ohne belegten Preis 0.
 */
export function preisKriterium(gewicht: number, regel?: string): Kriterium {
  return {
    name: 'Preis',
    gewicht,
    regel:
      regel ??
      'Günstigstes Modell volle Punkte, teuerstes ein Fünftel, dazwischen logarithmisch. Grundlage ist der Händlerpreis mit Datum.',
    bewerte: (produkt, alle) => {
      if (produkt.price === null) return { anteil: 0, begruendung: 'kein belegter Preis' };
      const preise = alle.flatMap((p) => (p.price ? [p.price.priceEur] : []));
      const billig = Math.min(...preise);
      const teuer = Math.max(...preise);
      const p = produkt.price.priceEur;
      const anteil =
        teuer === billig ? 1 : 0.2 + (0.8 * Math.log(teuer / p)) / Math.log(teuer / billig);
      return { anteil, begruendung: `${euro(p)} (${produkt.price.label})` };
    },
  };
}

export interface Teilnote {
  readonly kriterium: string;
  readonly punkte: number;
  readonly maximum: number;
  readonly begruendung: string;
}

export interface Bewertung {
  readonly produkt: Produkt;
  readonly teilnoten: readonly Teilnote[];
  readonly gesamt: number;
}

export function summeDerGewichte(kriterien: readonly Kriterium[]): number {
  return kriterien.reduce((summe, k) => summe + k.gewicht, 0);
}

export function bewerte(
  produkte: readonly Produkt[],
  kriterien: readonly Kriterium[],
): readonly Bewertung[] {
  if (summeDerGewichte(kriterien) !== 100) {
    throw new Error('Die Gewichte eines Vergleichs müssen zusammen 100 ergeben.');
  }
  return produkte
    .map((produkt) => {
      const teilnoten = kriterien.map((k) => {
        const { anteil, begruendung } = k.bewerte(produkt, produkte);
        return {
          kriterium: k.name,
          punkte: Math.round(Math.min(1, Math.max(0, anteil)) * k.gewicht),
          maximum: k.gewicht,
          begruendung,
        };
      });
      return { produkt, teilnoten, gesamt: teilnoten.reduce((s, n) => s + n.punkte, 0) };
    })
    .sort((a, b) => b.gesamt - a.gesamt || a.produkt.id.localeCompare(b.produkt.id));
}

export interface Einsatz {
  /** „Für Wohnungskatzen“, „Für große Hunde“ … */
  readonly titel: string;
  /** Welche Modelle für diesen Einsatz infrage kommen; ohne Filter alle. */
  readonly passt?: (produkt: Produkt) => boolean;
  /** Reihenfolge innerhalb des Einsatzes; Standard ist die Gesamtnote. */
  readonly vergleiche?: (a: Bewertung, b: Bewertung) => number;
  /** Begründung, die aus den Daten des gewählten Modells folgt. */
  readonly warum: (bewertung: Bewertung) => string;
}

export interface Empfehlung {
  readonly titel: string;
  readonly bewertung: Bewertung;
  readonly warum: string;
}

/**
 * Je Einsatz das Modell mit der höchsten Note unter den passenden; empfohlen
 * wird nur, was einen belegten Preis hat. Ein Modell
 * darf mehrere Einsätze gewinnen: Eine schlechtere Wahl nur der Abwechslung
 * wegen wäre keine ehrliche Empfehlung.
 */
export function empfehlungen(
  bewertungen: readonly Bewertung[],
  einsaetze: readonly Einsatz[],
): readonly Empfehlung[] {
  return einsaetze.flatMap((einsatz) => {
    const passend = bewertungen.filter(
      (b) => b.produkt.price !== null && (einsatz.passt ? einsatz.passt(b.produkt) : true),
    );
    const sortiert = einsatz.vergleiche ? [...passend].sort(einsatz.vergleiche) : passend;
    const gewaehlt = sortiert[0];
    return gewaehlt
      ? [{ titel: einsatz.titel, bewertung: gewaehlt, warum: einsatz.warum(gewaehlt) }]
      : [];
  });
}
