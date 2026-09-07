/**
 * M11-04 — Qualitätsprüfung für lokale Stadtseiten.
 *
 * Lokale Landingpages sind der übliche Weg, aus einem Datensatz tausende
 * dünne Seiten zu erzeugen. Genau das soll hier nicht passieren: eine Stadt
 * bekommt nur dann eine eigene Seite, wenn im Umkreis **tatsächlich** genug
 * erfasste Orte liegen — in jeder Kategorie mindestens einer, mit genug
 * Einträgen, die überhaupt eine Kontaktangabe führen, und mit genug
 * Einträgen, die der Stadt selbst zugeordnet sind und nicht nur ihrem
 * Umland.
 *
 * Die Kriterien stehen als Zahlen in `STADT_KRITERIEN` und werden bei jedem
 * Build gegen die echten Daten neu gemessen. Eine Stadt, die sie nicht mehr
 * erfüllt, verliert ihre Seite — die Allowlist ist eine Obergrenze, keine
 * Zusicherung. Umgekehrt wird kein Mindestbestand erfunden: fehlt eine
 * Kategorie, entsteht keine Seite mit einem leeren Abschnitt.
 */
import { filtereOrte, type Kategorie, type ListenOrt, type ListenTreffer } from './list.ts';
import { normalisiere } from './place-search.ts';

/** Kategorien, die eine Stadtseite alle vier belegen muss. */
export const PFLICHT_KATEGORIEN: readonly Kategorie[] = [
  'veterinary',
  'animal_shelter',
  'pet_shop',
  'dog_park',
];

export interface StadtKriterien {
  /** Umkreis um den Stadtpunkt, in dem gezählt wird. */
  readonly radiusMeter: number;
  /** Mindestzahl je Pflichtkategorie. Null wäre eine leere Rubrik. */
  readonly minJeKategorie: number;
  readonly minGesamt: number;
  readonly minTierarztpraxen: number;
  /** Einträge mit Telefon, Website oder Öffnungszeiten. */
  readonly minMitKontakt: number;
  /** Einträge, die laut Quelle in der Stadt selbst liegen. */
  readonly minInGemeinde: number;
  /** Obergrenze der Startziele. Mehr Seiten sind kein besseres Angebot. */
  readonly maxStaedte: number;
}

/**
 * Die Zahlen sind an den gemessenen Daten gewählt, nicht umgekehrt: sie
 * trennen Städte mit einem brauchbaren lokalen Bestand von solchen, bei
 * denen die Seite nur aus Hinweisen auf fehlende Daten bestünde.
 */
export const STADT_KRITERIEN: StadtKriterien = {
  radiusMeter: 10_000,
  minJeKategorie: 1,
  minGesamt: 25,
  minTierarztpraxen: 10,
  minMitKontakt: 15,
  minInGemeinde: 10,
  maxStaedte: 25,
};

export interface StadtKandidat {
  readonly name: string;
  /** Stabile Quell-ID des Ortspunkts, z. B. `osm:node:240109189`. */
  readonly placeId: string;
  readonly latitude: number;
  readonly longitude: number;
}

export interface StadtBefund {
  readonly gesamt: number;
  readonly jeKategorie: Readonly<Record<string, number>>;
  readonly mitKontakt: number;
  readonly inGemeinde: number;
  readonly geeignet: boolean;
  /** Warum nicht geeignet. Leer, wenn geeignet. */
  readonly maengel: readonly string[];
}

/**
 * Slug einer Stadt. Umlaute werden ausgeschrieben (`München` → `muenchen`),
 * damit der Pfad stabil und ohne Prozentkodierung bleibt.
 */
export function stadtSlug(name: string): string {
  const slug = normalisiere(name).replace(/ +/g, '-');
  if (slug === '') throw new Error(`Aus "${name}" entsteht kein Slug.`);
  return slug;
}

/** Alle erfassten Orte im Umkreis der Stadt, nach Entfernung sortiert. */
export function orteDerStadt(
  orte: readonly ListenOrt[],
  stadt: StadtKandidat,
  kriterien: StadtKriterien = STADT_KRITERIEN,
): readonly ListenTreffer[] {
  return filtereOrte(orte, {
    mitte: { latitude: stadt.latitude, longitude: stadt.longitude },
    gemeinde: stadt.name,
    radiusMeter: kriterien.radiusMeter,
    kategorien: [],
    // Die Zählung darf nicht an einer Anzeigegrenze hängen.
    maxTreffer: orte.length,
  });
}

/** Führt ein Kontaktmerkmal — sonst ist der Eintrag kaum lokaler Mehrwert. */
function hatKontakt(ort: ListenOrt): boolean {
  return ort.phone !== null || ort.website !== null || ort.openingHours !== null;
}

/**
 * Misst eine Stadt an den Kriterien. Fällt etwas durch, steht der Grund im
 * Klartext in `maengel`; „geeignet“ ist nie eine Annahme, sondern immer das
 * Ergebnis aller Einzelprüfungen.
 */
export function bewerteStadt(
  orte: readonly ListenOrt[],
  stadt: StadtKandidat,
  kriterien: StadtKriterien = STADT_KRITERIEN,
): StadtBefund {
  const treffer = orteDerStadt(orte, stadt, kriterien);

  const jeKategorie: Record<string, number> = {};
  for (const kategorie of PFLICHT_KATEGORIEN) jeKategorie[kategorie] = 0;
  let mitKontakt = 0;
  let inGemeinde = 0;
  for (const eintrag of treffer) {
    jeKategorie[eintrag.ort.category] = (jeKategorie[eintrag.ort.category] ?? 0) + 1;
    if (hatKontakt(eintrag.ort)) mitKontakt += 1;
    if (eintrag.istInGemeinde) inGemeinde += 1;
  }

  const maengel: string[] = [];
  for (const kategorie of PFLICHT_KATEGORIEN) {
    const anzahl = jeKategorie[kategorie] ?? 0;
    if (anzahl < kriterien.minJeKategorie) {
      maengel.push(`${kategorie}: ${anzahl} statt ${kriterien.minJeKategorie}`);
    }
  }
  if (treffer.length < kriterien.minGesamt) {
    maengel.push(`insgesamt: ${treffer.length} statt ${kriterien.minGesamt}`);
  }
  if ((jeKategorie.veterinary ?? 0) < kriterien.minTierarztpraxen) {
    maengel.push(
      `Tierarztpraxen: ${jeKategorie.veterinary ?? 0} statt ${kriterien.minTierarztpraxen}`,
    );
  }
  if (mitKontakt < kriterien.minMitKontakt) {
    maengel.push(`mit Kontaktangabe: ${mitKontakt} statt ${kriterien.minMitKontakt}`);
  }
  if (inGemeinde < kriterien.minInGemeinde) {
    maengel.push(`in der Stadt selbst: ${inGemeinde} statt ${kriterien.minInGemeinde}`);
  }

  return {
    gesamt: treffer.length,
    jeKategorie,
    mitKontakt,
    inGemeinde,
    geeignet: maengel.length === 0,
    maengel,
  };
}

export interface BewerteterKandidat {
  readonly stadt: StadtKandidat;
  readonly befund: StadtBefund;
}

/**
 * Auswahl der Startziele: nur geeignete Städte, absteigend nach erfassten
 * Orten, bei Gleichstand nach Name. Die Reihenfolge ist damit reproduzierbar
 * und hängt nicht an der Reihenfolge der Eingabe.
 */
export function waehleStaedte(
  kandidaten: readonly BewerteterKandidat[],
  kriterien: StadtKriterien = STADT_KRITERIEN,
): readonly BewerteterKandidat[] {
  return kandidaten
    .filter((kandidat) => kandidat.befund.geeignet)
    .slice()
    .sort((a, b) => {
      if (a.befund.gesamt !== b.befund.gesamt) return b.befund.gesamt - a.befund.gesamt;
      return a.stadt.name < b.stadt.name ? -1 : 1;
    })
    .slice(0, kriterien.maxStaedte);
}
