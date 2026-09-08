/**
 * M20-01 — Detailseiten je Gebührenposition.
 *
 * Die Gebührenordnung enthält 1006 Positionen. Bisher waren sie nur im
 * Rechner erreichbar — als Suchtreffer, nicht als Seite. Jede Position
 * bekommt jetzt eine eigene Adresse mit Betrag, Faktortabelle, Fundstelle
 * und dem Weg in den Rechner (Designvertrag Abschnitt 25).
 *
 * Der Slug ist **deterministisch und stabil**: er entsteht aus der
 * amtlichen Nummer und der Bezeichnung. Die Nummer steht vorne, weil sie
 * eindeutig ist — zwei Positionen dürfen dieselbe Bezeichnung tragen, und
 * in dieser Verordnung tun sie das auch. Ein Slug, der sich beim nächsten
 * Import verschiebt, wäre ein toter Link.
 *
 * Es wird **nichts erklärt, was die Verordnung nicht hergibt**: keine
 * Angaben dazu, was eine Leistung umfasst, keine Dauer, keine Empfehlung,
 * wann sie nötig ist. Was hier steht, steht im amtlichen Text.
 */
import snapshot from '../../../data-snapshots/got/got-2022.json' with { type: 'json' };
import type { FeeItem } from '../../domain/schemas/costs.ts';
import { COST_CONFIG, factorRange, type TreatmentContext } from './engine.ts';

export interface Gebuehrenposition {
  readonly item: FeeItem;
  readonly slug: string;
  /** Der Teil der Verordnung, etwa „Teil A“. */
  readonly teil: string | null;
  /** Die Gruppe innerhalb des Teils, etwa „Grundleistungen“. */
  readonly gruppe: string | null;
}

const UMLAUTE: Readonly<Record<string, string>> = {
  ä: 'ae',
  ö: 'oe',
  ü: 'ue',
  ß: 'ss',
};

/** Aus einer Bezeichnung wird ein Slugteil: klein, ASCII, mit Bindestrichen. */
export function slugTeil(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (zeichen) => UMLAUTE[zeichen] ?? zeichen)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

/**
 * Der vollständige Slug. Die amtliche Nummer steht vorn und macht ihn
 * eindeutig, auch wenn zwei Positionen gleich heißen.
 */
export function positionsSlug(item: Pick<FeeItem, 'officialItemId' | 'originalLabel'>): string {
  const bezeichnung = slugTeil(item.originalLabel);
  const nummer = slugTeil(item.officialItemId);
  return bezeichnung === '' ? `nr-${nummer}` : `${nummer}-${bezeichnung}`;
}

/** Zerlegt die Fundstelle in Teil und Gruppe, soweit sie beides nennt. */
export function fundstelleZerlegen(referenz: string): {
  readonly teil: string | null;
  readonly gruppe: string | null;
} {
  const stuecke = referenz.split('·').map((stueck) => stueck.trim());
  const teil = stuecke.find((stueck) => /^Teil\s/.test(stueck)) ?? null;
  const nachTeil = teil === null ? -1 : stuecke.indexOf(teil);
  const gruppe =
    nachTeil >= 0 &&
    stuecke[nachTeil + 1] !== undefined &&
    !/^lfd\./.test(stuecke[nachTeil + 1] ?? '')
      ? (stuecke[nachTeil + 1] ?? null)
      : null;
  return { teil, gruppe };
}

let zwischenspeicher: readonly Gebuehrenposition[] | null = null;

/** Alle Positionen mit Slug, in der Reihenfolge der Verordnung. */
export function positionen(): readonly Gebuehrenposition[] {
  if (zwischenspeicher !== null) return zwischenspeicher;

  const gesehen = new Map<string, number>();
  const liste = (snapshot.items as unknown as FeeItem[]).map((item) => {
    let slug = positionsSlug(item);
    // Doppelte Slugs kann es nach der Nummernregel nicht geben; falls doch,
    // wird durchnummeriert statt still überschrieben.
    const anzahl = gesehen.get(slug) ?? 0;
    gesehen.set(slug, anzahl + 1);
    if (anzahl > 0) slug = `${slug}-${anzahl + 1}`;
    const { teil, gruppe } = fundstelleZerlegen(item.sourceReference);
    return { item, slug, teil, gruppe };
  });

  zwischenspeicher = liste;
  return liste;
}

export interface Gruppe {
  readonly slug: string;
  readonly teil: string;
  readonly name: string;
  readonly positionen: readonly Gebuehrenposition[];
}

let gruppenSpeicher: readonly Gruppe[] | null = null;

/**
 * Die Verordnung ist in Teile und Gruppen gegliedert. Diese Gliederung ist
 * der Einstieg in die 1006 Positionen: eine Seite mit tausend Links wäre
 * weder les- noch bedienbar.
 */
export function gruppen(): readonly Gruppe[] {
  if (gruppenSpeicher !== null) return gruppenSpeicher;

  const nachSchluessel = new Map<string, Gebuehrenposition[]>();
  for (const eintrag of positionen()) {
    const teil = eintrag.teil ?? 'Ohne Teil';
    const name = eintrag.gruppe ?? 'Ohne Gruppe';
    const schluessel = `${teil}|${name}`;
    nachSchluessel.set(schluessel, [...(nachSchluessel.get(schluessel) ?? []), eintrag]);
  }

  const gesehen = new Set<string>();
  gruppenSpeicher = [...nachSchluessel.entries()].map(([schluessel, eintraege]) => {
    const [teil = '', name = ''] = schluessel.split('|');
    let slug = `${slugTeil(teil)}-${slugTeil(name)}`;
    let zaehler = 2;
    while (gesehen.has(slug)) {
      slug = `${slugTeil(teil)}-${slugTeil(name)}-${zaehler}`;
      zaehler += 1;
    }
    gesehen.add(slug);
    return { slug, teil, name, positionen: eintraege };
  });
  return gruppenSpeicher;
}

export function gruppeNachSlug(slug: string): Gruppe | undefined {
  return gruppen().find((eintrag) => eintrag.slug === slug);
}

/** Die Gruppe, in der eine Position steht. */
export function gruppeVon(position: Gebuehrenposition): Gruppe | undefined {
  return gruppen().find(
    (gruppe) =>
      gruppe.teil === (position.teil ?? 'Ohne Teil') &&
      gruppe.name === (position.gruppe ?? 'Ohne Gruppe'),
  );
}

/** Teile mit ihren Gruppen, in der Reihenfolge der Verordnung. */
export function teile(): readonly { readonly name: string; readonly gruppen: readonly Gruppe[] }[] {
  const nachTeil = new Map<string, Gruppe[]>();
  for (const gruppe of gruppen()) {
    nachTeil.set(gruppe.teil, [...(nachTeil.get(gruppe.teil) ?? []), gruppe]);
  }
  return [...nachTeil.entries()].map(([name, liste]) => ({ name, gruppen: liste }));
}

export function positionNachSlug(slug: string): Gebuehrenposition | undefined {
  return positionen().find((eintrag) => eintrag.slug === slug);
}

/** Positionen derselben Gruppe, ohne die gezeigte selbst. */
export function nachbarn(
  position: Gebuehrenposition,
  hoechstens = 6,
): readonly Gebuehrenposition[] {
  return positionen()
    .filter(
      (eintrag) =>
        eintrag.slug !== position.slug &&
        eintrag.teil === position.teil &&
        eintrag.gruppe === position.gruppe,
    )
    .slice(0, hoechstens);
}

export interface Faktorzeile {
  readonly faktor: number;
  readonly nettoMinor: number;
  readonly bruttoMinor: number;
}

/**
 * Die Faktorstufen einer Position: der Betrag mal dem einfachen bis zum
 * höchsten zulässigen Satz des Kontexts, netto und mit Umsatzsteuer.
 *
 * Gerundet wird kaufmännisch auf den Cent — dieselbe Regel wie im Rechner.
 */
export function faktorzeilen(
  item: FeeItem,
  kontext: TreatmentContext = 'regular',
  config = COST_CONFIG,
): readonly Faktorzeile[] {
  const bereich = factorRange(kontext, config);
  const stufen: number[] = [];
  for (let faktor = bereich.min; faktor <= bereich.max + 1e-9; faktor += 1) {
    stufen.push(Number(faktor.toFixed(config.factorPrecision)));
  }
  return stufen.map((faktor) => {
    const netto = Math.round(item.baseAmountMinor * faktor);
    const steuer = Math.round((netto * config.vatPercent) / 100);
    return { faktor, nettoMinor: netto, bruttoMinor: netto + steuer };
  });
}
