/**
 * Inhaltsoffensive, Seitentyp Stadtseite (`docs/CONTENT_STANDARD.md`):
 * „Wo finde ich hier was?“ – über die Kartensuche hinaus. Aus den erfassten
 * Orten einer Stadtseite wird ausgewertet, welche Tierarztpraxen laut
 * OpenStreetMap abends, samstags, sonntags oder rund um die Uhr geöffnet
 * haben, und welche Hundewiesen im Umkreis liegen.
 *
 * Grundlage sind nur die Öffnungszeiten, die `opening-hours.ts` sicher lesen
 * kann. Was nicht lesbar ist, zählt nicht mit und wird nicht geraten.
 */
import type { Stadtseite } from './city-allowlist.ts';
import type { ListenTreffer } from './list.ts';
import {
  spaetesteWerktagszeit,
  sprechzeiten,
  wochenplan,
  zeitenAm,
  type Wochenplan,
} from './opening-hours.ts';

export interface PraxisMitZeiten {
  readonly treffer: ListenTreffer;
  readonly plan: Wochenplan;
}

export interface Zeitliste {
  readonly anzahl: number;
  /** Die nächstgelegenen Einträge, nach Entfernung. */
  readonly naechste: readonly { readonly treffer: ListenTreffer; readonly zeiten: string }[];
}

export interface StadtUebersicht {
  readonly tieraerzte: number;
  /** Praxen, deren Öffnungszeiten sicher lesbar sind. */
  readonly mitLesbarenZeiten: number;
  readonly samstag: Zeitliste;
  readonly sonntag: Zeitliste;
  readonly abends: Zeitliste;
  readonly rundUmDieUhr: Zeitliste;
  readonly hundewiesen: {
    readonly anzahl: number;
    readonly eingezaeunt: number;
    readonly naechste: readonly ListenTreffer[];
  };
}

export const LISTENLAENGE = 8;

const UHR = (min: number) =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

function liste(
  praxen: readonly PraxisMitZeiten[],
  passt: (p: PraxisMitZeiten) => boolean,
  zeiten: (p: PraxisMitZeiten) => string,
): Zeitliste {
  const treffer = praxen.filter(passt);
  return {
    anzahl: treffer.length,
    naechste: treffer
      .slice(0, LISTENLAENGE)
      .map((p) => ({ treffer: p.treffer, zeiten: zeiten(p) })),
  };
}

export function stadtUebersicht(seite: Stadtseite): StadtUebersicht {
  // `treffer` ist bereits nach Entfernung zum Stadtmittelpunkt sortiert.
  const tieraerzte = seite.treffer.filter((t) => t.ort.category === 'veterinary');
  const praxen: PraxisMitZeiten[] = tieraerzte.flatMap((treffer) => {
    const plan = wochenplan(treffer.ort.openingHours);
    return plan ? [{ treffer, plan }] : [];
  });
  const s = (p: PraxisMitZeiten) => sprechzeiten(p.plan);
  const wiesen = seite.treffer.filter((t) => t.ort.category === 'dog_park');

  return {
    tieraerzte: tieraerzte.length,
    mitLesbarenZeiten: praxen.length,
    rundUmDieUhr: liste(
      praxen,
      (p) => s(p).rundUmDieUhr,
      () => 'täglich 0–24 Uhr',
    ),
    sonntag: liste(
      praxen,
      (p) => s(p).sonntag && !s(p).rundUmDieUhr,
      (p) => `So ${zeitenAm(p.plan, 'Su')}`,
    ),
    samstag: liste(
      praxen,
      (p) => s(p).samstag && !s(p).rundUmDieUhr,
      (p) => `Sa ${zeitenAm(p.plan, 'Sa')}`,
    ),
    abends: liste(
      praxen,
      (p) => s(p).abends && !s(p).rundUmDieUhr,
      (p) => `werktags bis ${UHR(spaetesteWerktagszeit(p.plan))} Uhr`,
    ),
    hundewiesen: {
      anzahl: wiesen.length,
      eingezaeunt: wiesen.filter((t) => t.ort.fenced === true).length,
      naechste: wiesen.slice(0, LISTENLAENGE),
    },
  };
}
