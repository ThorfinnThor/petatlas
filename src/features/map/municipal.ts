/**
 * M20-03 — Kommunal ausgewiesene Flächen auf der Stadtseite.
 *
 * Bis hierher lagen die kommunalen Snapshots nur im Repository: geprüft,
 * abgeglichen — und für niemanden sichtbar. Dieses Modul bringt sie auf die
 * Stadtseite, ohne die Aussage zu verändern.
 *
 * Drei Grenzen, die aus der Sache folgen:
 *
 * 1. **Nur die eigene Stadt.** Eine Zuordnung entsteht über eine
 *    ausdrückliche Liste, nicht über einen Namensvergleich. „Neustadt“ gibt
 *    es oft; eine Verwechslung wäre eine falsche Rechtsauskunft.
 * 2. **Kein Rückschluss auf Schweigen.** Steht eine Wiese nicht in der
 *    Liste, heißt das nicht, dass Hunde dort nicht laufen dürfen — die
 *    Quelle sagt dazu schlicht nichts. Der Geltungsbereich steht deshalb an
 *    der Anzeige, nicht im Kleingedruckten.
 * 3. **Namensnennung ist Pflicht, nicht Höflichkeit.** Die Hamburger Quelle
 *    steht unter dl-de/by-2-0. Wo die Flächen stehen, steht die Nennung.
 */
import { MunicipalSnapshotSchema, type MunicipalArea } from '../../domain/schemas/municipal.ts';
import berlinSnapshot from '../../../data-snapshots/municipal/berlin-hundefreilauf.json' with { type: 'json' };
import hamburgSnapshot from '../../../data-snapshots/municipal/hamburg-hundeauslaufzonen.json' with { type: 'json' };

/** Ausdrückliche Zuordnung Stadtslug → Snapshot. Kein Namensvergleich. */
const SNAPSHOTS: Readonly<Record<string, unknown>> = {
  berlin: berlinSnapshot,
  hamburg: hamburgSnapshot,
};

export interface AnzeigeFlaeche {
  readonly areaId: string;
  readonly kind: MunicipalArea['kind'];
  /** Bezeichnung laut Quelle. `null` heißt unbenannt, nicht namenlos. */
  readonly name: string | null;
  readonly address: string | null;
  readonly district: string | null;
  readonly note: string | null;
}

export interface KommunaleAnzeige {
  readonly gemeinde: string;
  readonly quelleName: string;
  readonly geltung: string;
  readonly licenseId: string;
  readonly licenseUrl: string;
  readonly attribution: string;
  readonly attributionUrl: string;
  /** Abrufdatum der Quellantwort, ISO. Kein Sachstand der Verwaltung. */
  readonly stand: string;
  readonly flaechen: readonly AnzeigeFlaeche[];
  readonly freilauf: number;
  readonly verbot: number;
}

const CACHE = new Map<string, KommunaleAnzeige | null>();

function sortiere(a: AnzeigeFlaeche, b: AnzeigeFlaeche): number {
  // Unbenannte Flächen ans Ende: sie sind schwerer zuzuordnen, nicht
  // weniger gültig.
  if (a.name === null && b.name !== null) return 1;
  if (a.name !== null && b.name === null) return -1;
  if (a.name !== null && b.name !== null && a.name !== b.name) {
    return a.name.localeCompare(b.name, 'de');
  }
  return a.areaId.localeCompare(b.areaId, 'de');
}

/**
 * Kommunal ausgewiesene Flächen einer Stadt — oder `null`, wenn für diese
 * Stadt keine kommunale Quelle erfasst ist. `null` heißt „nicht erfasst“,
 * nie „gibt es nicht“.
 */
export function kommunaleFlaechen(stadtSlug: string): KommunaleAnzeige | null {
  const zwischenstand = CACHE.get(stadtSlug);
  if (zwischenstand !== undefined) return zwischenstand;

  const roh = SNAPSHOTS[stadtSlug];
  if (roh === undefined) {
    CACHE.set(stadtSlug, null);
    return null;
  }

  const geprueft = MunicipalSnapshotSchema.safeParse(roh);
  if (!geprueft.success) {
    // Ein kaputter Snapshot wird nicht halb angezeigt.
    throw new Error(`Kommunaler Snapshot für ${stadtSlug} ist ungültig: ${geprueft.error.message}`);
  }
  const snapshot = geprueft.data;

  const flaechen = snapshot.areas
    .map((flaeche) => ({
      areaId: flaeche.areaId,
      kind: flaeche.kind,
      name: flaeche.name,
      address: flaeche.address,
      district: flaeche.district,
      note: flaeche.note,
    }))
    .sort(sortiere);

  const anzeige: KommunaleAnzeige = {
    gemeinde: snapshot.areas[0]?.municipality ?? stadtSlug,
    quelleName: snapshot.source.name,
    geltung: snapshot.source.validity,
    licenseId: snapshot.source.licenseId,
    licenseUrl: snapshot.source.licenseUrl,
    attribution: snapshot.source.attribution,
    attributionUrl: snapshot.source.attributionUrl,
    stand: snapshot.source.retrievalDate,
    flaechen,
    freilauf: snapshot.byKind.dog_off_leash ?? 0,
    verbot: snapshot.byKind.dog_prohibited ?? 0,
  };

  CACHE.set(stadtSlug, anzeige);
  return anzeige;
}

/** Städte, für die eine kommunale Quelle erfasst ist. */
export function staedteMitKommunalerQuelle(): readonly string[] {
  return Object.keys(SNAPSHOTS).sort();
}

export const ART_LABEL: Readonly<Record<MunicipalArea['kind'], string>> = {
  dog_off_leash: 'Hunde dürfen frei laufen',
  dog_prohibited: 'Hunde dürfen nicht mitgenommen werden',
};
