/**
 * M10-02 — Geometrie und Dubletten.
 *
 * Drei Dinge, die hier ausdrücklich **nicht** passieren:
 *
 * 1. **Kein stiller Ersatzpunkt.** Eine Fläche, deren Knoten sich nicht
 *    auflösen lassen, wird verworfen. Sie bekommt keinen Mittelpunkt der
 *    Region und landet nicht in Berlin.
 * 2. **Keine Doppelzählung.** Regionale Extrakte überlappen sich an ihren
 *    Grenzen: dasselbe OSM-Objekt kommt in zwei Dateien vor. Zusammengeführt
 *    wird über die stabile Quell-ID, nicht über Name oder Adresse.
 * 3. **Kein verschwiegener Unterschied.** Ein berechneter Punkt wird als
 *    solcher gekennzeichnet (`coordinateSource`), weil er nicht dasselbe ist
 *    wie eine erfasste Koordinate.
 */
import type { Place } from '../../src/domain/schemas/places.ts';
import type { Coordinates } from '../../src/domain/schemas/common.ts';

export interface Knoten {
  readonly lat: number;
  readonly lon: number;
}

export class GeometryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeometryError';
  }
}

function istBrauchbar(punkt: Knoten): boolean {
  if (!Number.isFinite(punkt.lat) || !Number.isFinite(punkt.lon)) return false;
  if (punkt.lat < -90 || punkt.lat > 90) return false;
  if (punkt.lon < -180 || punkt.lon > 180) return false;
  // (0,0) ist fast immer ein Datenfehler, kein Ort.
  return !(punkt.lat === 0 && punkt.lon === 0);
}

/**
 * Repräsentativer Punkt einer Fläche oder Linie.
 *
 * Gerechnet wird der Schwerpunkt der Stützpunkte. Bei einer stark konkaven
 * Fläche kann er außerhalb liegen; deshalb wird er als berechnet
 * gekennzeichnet und nicht als erfasste Position ausgegeben.
 *
 * `null` heißt: kein brauchbarer Punkt. Das ist ein Ergebnis, kein Anlass
 * für einen Ersatzwert.
 */
export function repraesentativerPunkt(knoten: readonly Knoten[]): Coordinates | null {
  const brauchbar = knoten.filter(istBrauchbar);
  if (brauchbar.length === 0) return null;

  const summeLat = brauchbar.reduce((summe, punkt) => summe + punkt.lat, 0);
  const summeLon = brauchbar.reduce((summe, punkt) => summe + punkt.lon, 0);
  const latitude = summeLat / brauchbar.length;
  const longitude = summeLon / brauchbar.length;

  if (!istBrauchbar({ lat: latitude, lon: longitude })) return null;
  // Auf sieben Nachkommastellen: mehr Genauigkeit als OSM selbst führt wäre
  // eine Behauptung.
  return {
    latitude: Number(latitude.toFixed(7)),
    longitude: Number(longitude.toFixed(7)),
  };
}

/** Anteil der Stützpunkte, die sich auflösen ließen. */
export function aufloesungsAnteil(gefunden: number, erwartet: number): number {
  if (erwartet === 0) return 0;
  return gefunden / erwartet;
}

/**
 * Führt Orte aus mehreren Extrakten zusammen.
 *
 * Grenzt eine Region an eine andere, liegt dasselbe Objekt in beiden Dateien.
 * Zusammengeführt wird über `placeId`. Bei einem Konflikt gewinnt der
 * Datensatz mit der besseren Koordinatenherkunft, danach der mit mehr
 * ausgefüllten Feldern — nie ein zufälliger.
 */
export function fuehreZusammen(orte: readonly Place[]): readonly Place[] {
  const nachId = new Map<string, Place>();

  for (const ort of orte) {
    const vorhanden = nachId.get(ort.placeId);
    if (vorhanden === undefined) {
      nachId.set(ort.placeId, ort);
      continue;
    }
    nachId.set(ort.placeId, besserer(vorhanden, ort));
  }

  return [...nachId.values()].sort((a, b) => (a.placeId < b.placeId ? -1 : 1));
}

const HERKUNFT_RANG: Readonly<Record<Place['coordinateSource'], number>> = {
  node: 3,
  way_centroid: 2,
  relation_centroid: 1,
};

function gefuellteFelder(ort: Place): number {
  return [
    ort.municipality,
    ort.postalCode,
    ort.phone,
    ort.website,
    ort.openingHours,
    ort.emergency,
    ort.wheelchair,
    ort.fenced,
    ort.dogAllowed,
  ].filter((wert) => wert !== null).length;
}

export function besserer(links: Place, rechts: Place): Place {
  const rangLinks = HERKUNFT_RANG[links.coordinateSource];
  const rangRechts = HERKUNFT_RANG[rechts.coordinateSource];
  if (rangLinks !== rangRechts) return rangLinks > rangRechts ? links : rechts;

  const feldLinks = gefuellteFelder(links);
  const feldRechts = gefuellteFelder(rechts);
  if (feldLinks !== feldRechts) return feldLinks > feldRechts ? links : rechts;

  // Gleichstand: der erste bleibt, damit das Ergebnis deterministisch ist.
  return links;
}

/**
 * Zählt Orte je Kategorie. Grundlage der Abdeckungsangabe; zählt jede
 * `placeId` genau einmal, auch wenn sie mehrfach geliefert wurde.
 */
export function zaehleJeKategorie(orte: readonly Place[]): Readonly<Record<string, number>> {
  const zaehler: Record<string, number> = {};
  const gesehen = new Set<string>();
  for (const ort of orte) {
    if (gesehen.has(ort.placeId)) continue;
    gesehen.add(ort.placeId);
    zaehler[ort.category] = (zaehler[ort.category] ?? 0) + 1;
  }
  return zaehler;
}
