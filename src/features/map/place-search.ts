/**
 * M10-03 — Ortssuche im Browser.
 *
 * Läuft vollständig lokal über einen kleinen statischen Index. Kein
 * Geocoding-Dienst, keine Anfrage an Dritte, keine proprietäre Datenbank.
 *
 * Deutsche Ortsnamen sind häufig mehrdeutig — „Mitte“ gibt es in fast jeder
 * größeren Stadt, „Neustadt“ dutzendfach. Die Suche **rät deshalb nicht**:
 * bei mehreren gleichnamigen Treffern liefert sie alle zurück, jeden mit
 * einem Zusatz, der ihn unterscheidbar macht.
 */

export type OrtsArt = 'city' | 'town' | 'village' | 'suburb' | 'borough';

export interface OrtsEintrag {
  readonly placeId: string;
  readonly name: string;
  readonly kind: OrtsArt;
  readonly latitude: number;
  readonly longitude: number;
  readonly population: number | null;
  readonly state: string | null;
}

export interface Treffer {
  readonly eintrag: OrtsEintrag;
  /** Zusatz, der gleichnamige Orte unterscheidbar macht. `null` = eindeutig. */
  readonly unterscheidung: string | null;
  /** Für die Anzeige: „Neustadt (Ortsteil von Bremen)“. */
  readonly anzeige: string;
}

export interface SucheErgebnis {
  readonly treffer: readonly Treffer[];
  /** true, wenn mehrere Orte denselben Namen tragen. */
  readonly mehrdeutig: boolean;
  /** Klartext für die Oberfläche. */
  readonly hinweis: string;
}

const ART_RANG: Readonly<Record<OrtsArt, number>> = {
  city: 5,
  town: 4,
  village: 3,
  borough: 2,
  suburb: 1,
};

const ART_LABEL: Readonly<Record<OrtsArt, string>> = {
  city: 'Stadt',
  town: 'Stadt',
  village: 'Gemeinde',
  borough: 'Stadtbezirk',
  suburb: 'Ortsteil',
};

/**
 * Vergleichsform eines Namens: Kleinschreibung, Umlaute aufgelöst,
 * Bindestriche und Leerraum vereinheitlicht. „Höxter“ und „hoexter“ finden
 * denselben Ort.
 */
export function normalisiere(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Entfernung in Metern nach der Haversine-Formel. */
export function entfernungMeter(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6_371_000;
  const rad = (grad: number) => (grad * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/**
 * Findet den nächstgelegenen größeren Ort. Damit lässt sich ein Ortsteil
 * benennen, auch wenn die Quelle kein Bundesland führt.
 */
function uebergeordneterOrt(
  eintrag: OrtsEintrag,
  index: readonly OrtsEintrag[],
): OrtsEintrag | null {
  const groessere = index.filter(
    (kandidat) =>
      kandidat.placeId !== eintrag.placeId && ART_RANG[kandidat.kind] > ART_RANG[eintrag.kind],
  );
  if (groessere.length === 0) return null;

  let naechster = groessere[0] as OrtsEintrag;
  let beste = entfernungMeter(eintrag, naechster);
  for (const kandidat of groessere.slice(1)) {
    const abstand = entfernungMeter(eintrag, kandidat);
    if (abstand < beste) {
      beste = abstand;
      naechster = kandidat;
    }
  }
  return naechster;
}

function unterscheidungFuer(eintrag: OrtsEintrag, index: readonly OrtsEintrag[]): string | null {
  if (eintrag.state !== null) return eintrag.state;
  const uebergeordnet = uebergeordneterOrt(eintrag, index);
  if (uebergeordnet !== null) return `${ART_LABEL[eintrag.kind]} von ${uebergeordnet.name}`;
  return ART_LABEL[eintrag.kind];
}

function bewerte(eintrag: OrtsEintrag, begriff: string): number | null {
  const name = normalisiere(eintrag.name);
  if (name === begriff) return 3;
  if (name.startsWith(begriff)) return 2;
  if (name.includes(begriff)) return 1;
  return null;
}

export interface SucheOptionen {
  readonly maxTreffer?: number;
  readonly minZeichen?: number;
}

/**
 * Sucht Orte. Ohne Treffer gibt es ein leeres Ergebnis mit Hinweis — nie
 * einen „ungefähr passenden“ Ort.
 */
export function sucheOrte(
  eingabe: string,
  index: readonly OrtsEintrag[],
  optionen: SucheOptionen = {},
): SucheErgebnis {
  const maxTreffer = optionen.maxTreffer ?? 10;
  const minZeichen = optionen.minZeichen ?? 2;

  const begriff = normalisiere(eingabe);
  if (begriff.length < minZeichen) {
    return {
      treffer: [],
      mehrdeutig: false,
      hinweis: `Bitte mindestens ${minZeichen} Zeichen eingeben.`,
    };
  }

  const bewertet = index
    .map((eintrag) => ({ eintrag, punkte: bewerte(eintrag, begriff) }))
    .filter(
      (kandidat): kandidat is { eintrag: OrtsEintrag; punkte: number } => kandidat.punkte !== null,
    )
    .sort((a, b) => {
      if (a.punkte !== b.punkte) return b.punkte - a.punkte;
      const rang = ART_RANG[b.eintrag.kind] - ART_RANG[a.eintrag.kind];
      if (rang !== 0) return rang;
      const einwohner = (b.eintrag.population ?? 0) - (a.eintrag.population ?? 0);
      if (einwohner !== 0) return einwohner;
      // Letzter Anker, damit die Reihenfolge deterministisch bleibt.
      return a.eintrag.placeId < b.eintrag.placeId ? -1 : 1;
    });

  if (bewertet.length === 0) {
    return {
      treffer: [],
      mehrdeutig: false,
      hinweis: `Kein Ort gefunden für „${eingabe.trim()}“.`,
    };
  }

  const namensZaehler = new Map<string, number>();
  for (const { eintrag } of bewertet) {
    const schluessel = normalisiere(eintrag.name);
    namensZaehler.set(schluessel, (namensZaehler.get(schluessel) ?? 0) + 1);
  }

  const treffer = bewertet.slice(0, maxTreffer).map(({ eintrag }) => {
    const gleichnamig = (namensZaehler.get(normalisiere(eintrag.name)) ?? 0) > 1;
    const unterscheidung = gleichnamig ? unterscheidungFuer(eintrag, index) : null;
    return {
      eintrag,
      unterscheidung,
      anzeige: unterscheidung === null ? eintrag.name : `${eintrag.name} (${unterscheidung})`,
    };
  });

  const mehrdeutig = treffer.some((eintrag) => eintrag.unterscheidung !== null);

  return {
    treffer,
    mehrdeutig,
    hinweis: mehrdeutig
      ? `${treffer.length} Orte tragen diesen Namen. Bitte auswählen, welcher gemeint ist.`
      : `${treffer.length} Ort(e) gefunden.`,
  };
}

/**
 * Beschreibt eine Ortszuordnung wahrheitsgemäß.
 *
 * Ein Treffer im Umkreis liegt nicht in der Gemeinde. Wer das gleichsetzt,
 * behauptet eine Verwaltungszugehörigkeit, die aus einer Entfernung nicht
 * folgt.
 */
export function ortsZuordnung(
  gemeindeDesOrts: string | null,
  gesuchteGemeinde: string,
): { readonly label: string; readonly istInGemeinde: boolean } {
  if (
    gemeindeDesOrts !== null &&
    normalisiere(gemeindeDesOrts) === normalisiere(gesuchteGemeinde)
  ) {
    return { label: `in ${gesuchteGemeinde}`, istInGemeinde: true };
  }
  return { label: `im Umkreis von ${gesuchteGemeinde}`, istInGemeinde: false };
}
