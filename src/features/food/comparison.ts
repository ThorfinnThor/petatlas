/**
 * Futtervergleiche mit begründeter Empfehlung (ADR-021).
 *
 * Bewertet wird nur, was belegt ist: die Deklaration des Herstellers, seine
 * Fütterungsempfehlung und ein Preis mit Datum. Das Schema steht vollständig
 * auf der Seite; jede Teilnote lässt sich aus den angezeigten Zahlen
 * nachrechnen. Es ist eine redaktionelle Abwägung, kein Labortest (ADR-015).
 */
import { z } from 'zod';

import { IsoDate } from '../../domain/schemas/common.ts';

const Prozent = z.number().min(0).max(100).nullable();

export const VergleichsProduktSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    species: z.enum(['cat', 'dog']),
    format: z.enum(['dry', 'wet']),
    brand: z.string().min(1),
    productName: z.string().min(1),
    declaredKind: z.string().nullable(),
    kind: z.enum(['complete', 'complementary']).nullable(),
    lifeStage: z.enum(['puppy', 'kitten', 'adult', 'senior', 'all_stages']).nullable(),
    composition: z.string().nullable(),
    analytical: z
      .object({
        protein: Prozent,
        fat: Prozent,
        fiber: Prozent,
        ash: Prozent,
        moisture: Prozent,
        calcium: Prozent,
        phosphorus: Prozent,
      })
      .strict(),
    energy: z
      .object({
        value: z.number().positive(),
        unit: z.enum(['kcal/100g', 'kcal/kg', 'MJ/kg']),
        verbatim: z.string(),
      })
      .strict()
      .nullable(),
    declarationSourceUrl: z.url(),
    feeding: z.array(
      z
        .object({
          referenceAnimal: z.enum(['cat 4 kg adult', 'dog 10 kg adult', 'dog 25 kg adult']),
          gramsPerDay: z.number().positive().nullable(),
          verbatim: z.string(),
          sourceUrl: z.url(),
        })
        .strict(),
    ),
    price: z
      .object({
        retailer: z.string().min(1),
        packLabel: z.string().min(1),
        netGrams: z.number().positive(),
        priceEur: z.number().positive(),
        url: z.url(),
        note: z.string().optional(),
      })
      .strict()
      .nullable(),
    claims: z.array(z.string()),
    checkedAt: IsoDate,
    notes: z.string().optional(),
    imageUrl: z.url().optional(),
  })
  .strict();
export type VergleichsProdukt = z.infer<typeof VergleichsProduktSchema>;

export type Referenztier = VergleichsProdukt['feeding'][number]['referenceAnimal'];

/** Übliche Restfeuchte, wenn ein Trockenfutter sie nicht deklariert. */
export const ANGENOMMENE_FEUCHTE = { dry: 10, wet: 80 } as const;

const TIERISCH =
  /^(frische[sn]?\s+|getrocknete[sn]?\s+|entbeinte[sn]?\s+|dehydrierte[sn]?\s+)*(huhn|hühn|hähnchen|geflügel|pute|truthahn|ente|gans|lamm|rind|kalb|schwein|wild|hirsch|reh|kaninchen|pferd|lachs|forelle|hering|thunfisch|seehecht|makrele|sardine|fisch|fleisch|innereien|herz|leber|magen|eier?|krill|garnele)/i;
const SAMMELBEGRIFF =
  /(fleisch und tierische nebenerzeugnisse|tierische nebenerzeugnisse|pflanzliche nebenerzeugnisse|fisch und fischnebenerzeugnisse|getreide(?![a-zäöü])|gemüse(?![a-zäöü])|öle und fette|milch und molkereierzeugnisse)/i;
const ZUCKER = /(zucker|karamell|saccharose|glukose|glucose|fruktose|melasse)/i;

export interface Kennzahlen {
  readonly feuchte: number;
  readonly feuchteGeschaetzt: boolean;
  readonly proteinTs: number | null;
  readonly fettTs: number | null;
  /** Rechnerischer Rest (Kohlenhydrate, NfE) in der Trockenmasse. */
  readonly kohlenhydrateTs: number | null;
  readonly offeneDeklaration: boolean;
  readonly ersteZutatTierisch: boolean;
  readonly sammelbegriffe: readonly string[];
  readonly zuckerZugesetzt: boolean;
  readonly euroProTag: Partial<Record<Referenztier, number>>;
}

/** Erste Zutat bis zum ersten Komma oder Semikolon außerhalb von Klammern. */
function erstesElement(text: string): string {
  let tiefe = 0;
  for (let i = 0; i < text.length; i += 1) {
    const zeichen = text[i];
    if (zeichen === '(') tiefe += 1;
    else if (zeichen === ')') tiefe = Math.max(0, tiefe - 1);
    else if ((zeichen === ',' || zeichen === ';') && tiefe === 0) {
      // „33,4 %“ ist eine Zahl, „Rindfleisch, -herz, -lunge“ eine Aufzählung.
      const dezimal =
        zeichen === ',' && /\d/.test(text[i - 1] ?? '') && /\d/.test(text[i + 1] ?? '');
      const fortsetzung = /^\s*-/.test(text.slice(i + 1));
      if (!dezimal && !fortsetzung) return text.slice(0, i);
    }
  }
  return text;
}

function runde(wert: number, stellen = 1): number {
  const faktor = 10 ** stellen;
  return Math.round(wert * faktor) / faktor;
}

export function kennzahlen(produkt: VergleichsProdukt): Kennzahlen {
  const a = produkt.analytical;
  const feuchteGeschaetzt = a.moisture === null;
  const feuchte = a.moisture ?? ANGENOMMENE_FEUCHTE[produkt.format];
  const ts = 100 - feuchte;
  const proTs = (wert: number | null) => (wert === null ? null : runde((wert / ts) * 100));
  const rest =
    a.protein !== null && a.fat !== null && a.fiber !== null && a.ash !== null
      ? 100 - a.protein - a.fat - a.fiber - a.ash - feuchte
      : null;
  const zusammensetzung = produkt.composition ?? '';
  const ersteZutat = erstesElement(zusammensetzung);
  const ohneMenge = ersteZutat.replace(/^\s*\d+(?:[.,]\d+)?\s*%\s*(bestehend aus\s*)?/i, '');
  const sammelbegriffe = [
    ...new Set(
      (zusammensetzung.match(new RegExp(SAMMELBEGRIFF.source, 'gi')) ?? []).map((t) =>
        t.toLowerCase(),
      ),
    ),
  ];
  const euroProTag: Partial<Record<Referenztier, number>> = {};
  if (produkt.price) {
    for (const zeile of produkt.feeding) {
      if (zeile.gramsPerDay !== null) {
        euroProTag[zeile.referenceAnimal] = runde(
          (zeile.gramsPerDay * produkt.price.priceEur) / produkt.price.netGrams,
          2,
        );
      }
    }
  }
  return {
    feuchte,
    feuchteGeschaetzt,
    proteinTs: proTs(a.protein),
    fettTs: proTs(a.fat),
    kohlenhydrateTs: rest === null ? null : runde((Math.max(rest, 0) / ts) * 100),
    offeneDeklaration:
      /\d+(?:[.,]\d+)?\s*%/.test(ersteZutat) &&
      !/tierische nebenerzeugnisse/i.test(zusammensetzung),
    ersteZutatTierisch: TIERISCH.test(ohneMenge.trim()),
    sammelbegriffe,
    zuckerZugesetzt: ZUCKER.test(zusammensetzung),
    euroProTag,
  };
}

export interface Teilnote {
  readonly kriterium: string;
  readonly punkte: number;
  readonly maximum: number;
  readonly begruendung: string;
}

export interface Bewertung {
  readonly produkt: VergleichsProdukt;
  readonly kennzahlen: Kennzahlen;
  readonly teilnoten: readonly Teilnote[];
  readonly gesamt: number;
  /** Nur Alleinfuttermittel mit vollständigen Kerndaten können empfohlen werden. */
  readonly empfehlbar: boolean;
}

/** Gewichte des Schemas; sie stehen so auch auf der Seite. */
export const GEWICHTE = {
  zusammensetzung: 25,
  naehrstoffe: 35,
  zucker: 10,
  preis: 20,
  transparenz: 10,
} as const;

function stufe(wert: number, stufen: readonly [number, number][]): number {
  for (const [grenze, punkte] of stufen) if (wert >= grenze) return punkte;
  return 0;
}

function naehrstoffnote(produkt: VergleichsProdukt, k: Kennzahlen): Teilnote {
  const max = GEWICHTE.naehrstoffe;
  if (k.proteinTs === null) {
    return {
      kriterium: 'Nährstoffprofil',
      punkte: 0,
      maximum: max,
      begruendung: 'Protein nicht deklariert',
    };
  }
  if (produkt.species === 'cat') {
    // Katzen decken ihren Energiebedarf vor allem aus Protein und Fett; viel
    // Protein und wenig rechnerische Kohlenhydrate geben die meisten Punkte.
    const p = stufe(k.proteinTs, [
      [50, 20],
      [45, 17],
      [40, 14],
      [35, 10],
      [30, 6],
    ]);
    const kh =
      k.kohlenhydrateTs === null
        ? 0
        : stufe(-k.kohlenhydrateTs, [
            [-8, 15],
            [-15, 12],
            [-25, 8],
            [-35, 4],
            [-45, 1],
          ]);
    return {
      kriterium: 'Nährstoffprofil',
      punkte: p + kh,
      maximum: max,
      begruendung: `${k.proteinTs} % Protein und ${k.kohlenhydrateTs ?? '–'} % Kohlenhydrate in der Trockenmasse`,
    };
  }
  // Hunde: deutlich über dem FEDIAF-Mindestwert; Fett in einem üblichen Bereich.
  const p = stufe(k.proteinTs, [
    [24, 20],
    [21, 14],
    [18, 8],
  ]);
  const f =
    k.fettTs === null
      ? 0
      : k.fettTs >= 10 && k.fettTs <= 30
        ? 15
        : k.fettTs >= 8 && k.fettTs <= 40
          ? 9
          : 4;
  return {
    kriterium: 'Nährstoffprofil',
    punkte: Math.min(p + f, max),
    maximum: max,
    begruendung: `${k.proteinTs} % Protein und ${k.fettTs ?? '–'} % Fett in der Trockenmasse`,
  };
}

export function bewerte(
  produkte: readonly VergleichsProdukt[],
  referenz: Referenztier,
): readonly Bewertung[] {
  const basis = produkte.map((produkt) => ({ produkt, kennzahlen: kennzahlen(produkt) }));
  const kosten = basis
    .map(({ kennzahlen: k }) => k.euroProTag[referenz])
    .filter((wert): wert is number => wert !== undefined);
  const billig = Math.min(...kosten);
  const teuer = Math.max(...kosten);

  return basis
    .map(({ produkt, kennzahlen: k }) => {
      const zus =
        (k.ersteZutatTierisch ? 10 : 0) +
        (k.offeneDeklaration ? 15 : 0) -
        Math.min(k.sammelbegriffe.length * 5, 15);
      const teilnoten: Teilnote[] = [
        {
          kriterium: 'Zusammensetzung',
          punkte: Math.max(0, Math.min(zus, GEWICHTE.zusammensetzung)),
          maximum: GEWICHTE.zusammensetzung,
          begruendung: [
            k.ersteZutatTierisch
              ? 'tierische Zutat an erster Stelle'
              : 'erste Zutat nicht tierisch',
            k.offeneDeklaration ? 'Hauptzutat mit Prozentangabe' : 'Hauptzutat ohne Prozentangabe',
            k.sammelbegriffe.length > 0
              ? `Sammelbegriffe: ${k.sammelbegriffe.join(', ')}`
              : 'keine Sammelbegriffe',
          ].join('; '),
        },
        naehrstoffnote(produkt, k),
        {
          kriterium: 'Kein Zuckerzusatz',
          punkte: k.zuckerZugesetzt ? 0 : GEWICHTE.zucker,
          maximum: GEWICHTE.zucker,
          begruendung: k.zuckerZugesetzt
            ? 'Zucker oder Karamell in der Zusammensetzung'
            : 'kein Zucker deklariert',
        },
      ];
      const tag = k.euroProTag[referenz];
      teilnoten.push({
        kriterium: 'Preis pro Tag',
        punkte:
          tag === undefined
            ? 0
            : teuer === billig
              ? GEWICHTE.preis
              : Math.round(4 + (16 * Math.log(teuer / tag)) / Math.log(teuer / billig)),
        maximum: GEWICHTE.preis,
        begruendung:
          tag === undefined
            ? 'kein belegter Preis oder keine Fütterungsmenge'
            : `${tag.toFixed(2).replace('.', ',')} € pro Tag`,
      });
      const a = produkt.analytical;
      teilnoten.push({
        kriterium: 'Transparenz',
        punkte:
          (produkt.energy ? 4 : 0) +
          (produkt.feeding.some((z) => z.gramsPerDay !== null) ? 3 : 0) +
          (a.calcium !== null && a.phosphorus !== null ? 3 : 0),
        maximum: GEWICHTE.transparenz,
        begruendung: [
          produkt.energy ? 'Energiegehalt angegeben' : 'kein Energiegehalt',
          a.calcium !== null && a.phosphorus !== null
            ? 'Calcium und Phosphor angegeben'
            : 'Calcium/Phosphor fehlen',
        ].join('; '),
      });
      const gesamt = teilnoten.reduce((summe, note) => summe + note.punkte, 0);
      const empfehlbar =
        produkt.kind === 'complete' &&
        k.proteinTs !== null &&
        tag !== undefined &&
        produkt.composition !== null;
      return { produkt, kennzahlen: k, teilnoten, gesamt, empfehlbar };
    })
    .sort((a, b) => b.gesamt - a.gesamt || a.produkt.id.localeCompare(b.produkt.id));
}

export interface Empfehlung {
  readonly titel: string;
  readonly bewertung: Bewertung;
  readonly warum: string;
}

const qualitaet = (b: Bewertung) =>
  b.teilnoten.filter((n) => n.kriterium !== 'Preis pro Tag').reduce((s, n) => s + n.punkte, 0);

/**
 * Drei Empfehlungen: beste Gesamtnote, bestes Verhältnis aus Qualität und
 * Preis (die günstigste Wahl unter den Produkten mit überdurchschnittlicher
 * Qualitätsnote) und die höchste Qualitätsnote ohne Rücksicht auf den Preis.
 * Ein Produkt erscheint höchstens einmal.
 */
export function empfehlungen(
  bewertungen: readonly Bewertung[],
  referenz: Referenztier,
): readonly Empfehlung[] {
  const kandidaten = bewertungen.filter((b) => b.empfehlbar);
  if (kandidaten.length === 0) return [];
  const vergeben = new Set<string>();
  const ergebnis: Empfehlung[] = [];
  const nimm = (titel: string, b: Bewertung | undefined, warum: (b: Bewertung) => string) => {
    if (!b || vergeben.has(b.produkt.id)) return;
    vergeben.add(b.produkt.id);
    ergebnis.push({ titel, bewertung: b, warum: warum(b) });
  };
  nimm('Unsere Empfehlung', kandidaten[0], (b) => `höchste Gesamtnote (${b.gesamt} von 100)`);
  const mittel = kandidaten.reduce((s, b) => s + qualitaet(b), 0) / kandidaten.length;
  const preiswert = kandidaten
    .filter((b) => qualitaet(b) >= mittel && !vergeben.has(b.produkt.id))
    .sort(
      (a, b) =>
        (a.kennzahlen.euroProTag[referenz] ?? 1e9) - (b.kennzahlen.euroProTag[referenz] ?? 1e9),
    )[0];
  nimm(
    'Preis-Leistung',
    preiswert,
    (b) => `günstigste Wahl mit überdurchschnittlicher Qualitätsnote (${qualitaet(b)} von 80)`,
  );
  const premium = [...kandidaten]
    .filter((b) => !vergeben.has(b.produkt.id))
    .sort((a, b) => qualitaet(b) - qualitaet(a))[0];
  nimm(
    'Wenn der Preis zweitrangig ist',
    premium,
    (b) => `höchste Qualitätsnote ohne Preis (${qualitaet(b)} von 80)`,
  );
  return ergebnis;
}
