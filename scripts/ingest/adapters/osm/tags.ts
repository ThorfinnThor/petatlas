/**
 * M10-01 — Auswahl und Deutung der OSM-Tags.
 *
 * Die Konfiguration ist bewusst eng: übernommen wird nur, was das Produkt
 * tatsächlich zeigt. Alles andere wird ignoriert, statt „für später“
 * mitgeschleppt zu werden.
 *
 * Drei Regeln, die hier durchgehalten werden:
 *
 * 1. **Ein fehlender Tag heißt unbekannt, nicht nein.** `emergency`,
 *    `wheelchair`, `fenced` und `dogAllowed` sind tri-state.
 * 2. **Tierarzt ist nicht Klinik und nicht Notdienst.** Die Kategorie kommt
 *    aus dem Tag; ein Notdienst wird nur bei ausdrücklichem `emergency=yes`
 *    angenommen.
 * 3. **Kontaktdaten nur aus den gelisteten Tags.** Betreibernamen,
 *    E-Mail-Adressen und Bearbeiter-Metadaten werden nicht übernommen.
 */
import konfiguration from '../../../../config/osm-tags.json' with { type: 'json' };
import type { PlaceCategory } from '../../../../src/domain/schemas/places.ts';

export type OsmTags = Readonly<Record<string, string>>;

interface KategorieRegel {
  readonly category: string;
  readonly label: string;
  readonly match: readonly { readonly key: string; readonly value: string }[];
}

const KATEGORIEN = konfiguration.categories as readonly KategorieRegel[];
const TRI_STATE = konfiguration.triStateTags as Readonly<Record<string, string>>;
const KONTAKT = konfiguration.contactTags as Readonly<Record<string, readonly string[]>>;

/** Kategorie eines Objekts, oder `null`, wenn es uns nicht interessiert. */
export function kategorieVon(tags: OsmTags): PlaceCategory | null {
  for (const regel of KATEGORIEN) {
    for (const treffer of regel.match) {
      if (tags[treffer.key] === treffer.value) return regel.category as PlaceCategory;
    }
  }
  return null;
}

/**
 * Tri-state aus einem OSM-Tag.
 *
 * OSM kennt `yes`, `no`, `limited`, `designated` und vieles mehr. Nur die
 * eindeutigen Werte werden übernommen; alles andere bleibt `null`, weil eine
 * Vermutung hier eine falsche Zusicherung wäre.
 */
export function triState(wert: string | undefined): boolean | null {
  if (wert === undefined) return null;
  const normalisiert = wert.trim().toLowerCase();
  if (normalisiert === 'yes' || normalisiert === 'designated') return true;
  if (normalisiert === 'no') return false;
  // `limited`, `unknown`, `permissive` und Freitext bleiben unbekannt.
  return null;
}

export interface KontaktDaten {
  readonly phone: string | null;
  readonly website: string | null;
  readonly openingHours: string | null;
  readonly postalCode: string | null;
  readonly municipality: string | null;
}

function ersterWert(tags: OsmTags, schluessel: readonly string[]): string | null {
  for (const eintrag of schluessel) {
    const wert = tags[eintrag]?.trim();
    if (wert !== undefined && wert !== '') return wert;
  }
  return null;
}

export function kontaktVon(tags: OsmTags): KontaktDaten {
  const postalCode = ersterWert(tags, KONTAKT.postalCode ?? []);
  const website = ersterWert(tags, KONTAKT.website ?? []);
  return {
    phone: ersterWert(tags, KONTAKT.phone ?? []),
    // Eine Website ohne Schema ist keine brauchbare Adresse.
    website: website !== null && /^https?:\/\//i.test(website) ? website : null,
    openingHours: ersterWert(tags, KONTAKT.openingHours ?? []),
    // Deutsche Postleitzahl; alles andere wäre eine Vermutung.
    postalCode: postalCode !== null && /^\d{5}$/.test(postalCode) ? postalCode : null,
    municipality: ersterWert(tags, KONTAKT.municipality ?? []),
  };
}

export interface Merkmale {
  readonly emergency: boolean | null;
  readonly wheelchair: boolean | null;
  readonly fenced: boolean | null;
  readonly dogAllowed: boolean | null;
}

export function merkmaleVon(tags: OsmTags): Merkmale {
  return {
    emergency: triState(tags[TRI_STATE.emergency ?? 'emergency']),
    wheelchair: triState(tags[TRI_STATE.wheelchair ?? 'wheelchair']),
    // `barrier=fence` ist eine Umzäunung; jeder andere Wert ist keine Aussage.
    fenced: tags[TRI_STATE.fenced ?? 'barrier'] === 'fence' ? true : null,
    dogAllowed: triState(tags[TRI_STATE.dogAllowed ?? 'dog']),
  };
}

/** Anzeigename. Ohne `name` gibt es keinen Ort, den man benennen könnte. */
export function nameVon(tags: OsmTags): string | null {
  const name = tags.name?.trim();
  return name !== undefined && name !== '' ? name : null;
}

export function alleKategorien(): readonly KategorieRegel[] {
  return KATEGORIEN;
}
