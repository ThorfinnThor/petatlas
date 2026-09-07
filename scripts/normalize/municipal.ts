/**
 * M11-05 — Abgleich der kommunalen Quelle mit OpenStreetMap.
 *
 * Zwei Quellen über dieselbe Wiese können sich widersprechen. Dieser Abgleich
 * löst den Widerspruch **nicht** still auf, sondern benennt ihn. Vier Fälle:
 *
 * | Fall | Bedeutung |
 * |---|---|
 * | `bestaetigt` | OSM kennt die Fläche, die Verwaltung weist sie als Hundefreilauf aus. |
 * | `widerspruch` | OSM führt eine Hundewiese dort, wo die Verwaltung ein Mitnahmeverbot ausweist. |
 * | `unbestaetigt` | OSM führt eine Hundewiese, die Verwaltung sagt dazu nichts. |
 * | `nur_kommunal` | Die Verwaltung weist eine Fläche aus, die OSM nicht führt. |
 *
 * `unbestaetigt` ist ausdrücklich **kein** Widerspruch: der Pilotdatensatz
 * deckt nur drei Bezirke ab. Schweigen einer Quelle ist keine Verneinung.
 *
 * Ebenso wird aus einem fehlenden Verbot keine Erlaubnis: `dogAllowed` wird
 * nur gesetzt, wenn die Verwaltung die Fläche ausdrücklich als Freilauf
 * ausweist. Sonst bleibt es `null`.
 */
import type { Coordinates } from '../../src/domain/schemas/common.ts';
import type { MunicipalArea } from '../../src/domain/schemas/municipal.ts';
import type { Place } from '../../src/domain/schemas/places.ts';

export type AbgleichArt = 'bestaetigt' | 'widerspruch' | 'unbestaetigt' | 'nur_kommunal';

export interface Zuordnung {
  readonly art: AbgleichArt;
  /** OSM-Ort, falls beteiligt. */
  readonly placeId: string | null;
  readonly placeName: string | null;
  /** Kommunale Fläche, falls beteiligt. */
  readonly areaId: string | null;
  readonly areaName: string | null;
  readonly district: string | null;
  /** Klartext, der auch außerhalb dieses Moduls verständlich ist. */
  readonly begruendung: string;
}

/**
 * Punkt-in-Ring nach dem Strahlensatz-Verfahren. Ein Punkt genau auf der
 * Kante ist ein Grenzfall, der hier nicht künstlich entschieden wird — er
 * fällt so aus, wie die Zählung der Kantenschnitte ausfällt.
 */
export function punktInRing(
  punkt: Coordinates,
  ring: readonly (readonly [number, number])[],
): boolean {
  let drin = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i] as readonly [number, number];
    const [xj, yj] = ring[j] as readonly [number, number];
    const schneidet =
      yi > punkt.latitude !== yj > punkt.latitude &&
      punkt.longitude < ((xj - xi) * (punkt.latitude - yi)) / (yj - yi) + xi;
    if (schneidet) drin = !drin;
  }
  return drin;
}

/**
 * Liegt der Punkt in der Fläche? Innenringe (Löcher) heben die Zugehörigkeit
 * wieder auf, deshalb wird über alle Ringe gezählt und nicht nur über den
 * ersten.
 */
export function punktInFlaeche(punkt: Coordinates, flaeche: MunicipalArea): boolean {
  const [west, sued, ost, nord] = flaeche.boundingBox;
  if (
    punkt.longitude < west ||
    punkt.longitude > ost ||
    punkt.latitude < sued ||
    punkt.latitude > nord
  ) {
    return false;
  }
  let drin = false;
  for (const ring of flaeche.outline) {
    if (punktInRing(punkt, ring)) drin = !drin;
  }
  return drin;
}

/** Liegt der Punkt im Gebiet, über das die Quelle überhaupt Aussagen macht? */
export function imGeltungsbereich(
  punkt: Coordinates,
  flaechen: readonly MunicipalArea[],
  puffer = 0.02,
): boolean {
  if (flaechen.length === 0) return false;
  let west = Number.POSITIVE_INFINITY;
  let sued = Number.POSITIVE_INFINITY;
  let ost = Number.NEGATIVE_INFINITY;
  let nord = Number.NEGATIVE_INFINITY;
  for (const flaeche of flaechen) {
    const [w, s, o, n] = flaeche.boundingBox;
    if (w < west) west = w;
    if (s < sued) sued = s;
    if (o > ost) ost = o;
    if (n > nord) nord = n;
  }
  return (
    punkt.longitude >= west - puffer &&
    punkt.longitude <= ost + puffer &&
    punkt.latitude >= sued - puffer &&
    punkt.latitude <= nord + puffer
  );
}

export interface Abgleich {
  readonly zuordnungen: readonly Zuordnung[];
  readonly zaehler: Readonly<Record<AbgleichArt, number>>;
}

/**
 * Gleicht Hundewiesen aus OSM mit den kommunal ausgewiesenen Flächen ab.
 *
 * Verglichen werden ausschließlich Hundewiesen: eine Tierarztpraxis in einem
 * Mitnahmeverbotsgebiet ist kein Widerspruch, sondern eine Praxis an einer
 * Straße.
 */
export function gleicheAb(orte: readonly Place[], flaechen: readonly MunicipalArea[]): Abgleich {
  const zuordnungen: Zuordnung[] = [];
  const zugeordneteFlaechen = new Set<string>();

  for (const ort of orte) {
    if (ort.category !== 'dog_park') continue;
    if (!imGeltungsbereich(ort.coordinates, flaechen)) continue;

    const treffer = flaechen.filter((flaeche) => punktInFlaeche(ort.coordinates, flaeche));
    if (treffer.length === 0) {
      zuordnungen.push({
        art: 'unbestaetigt',
        placeId: ort.placeId,
        placeName: ort.name,
        areaId: null,
        areaName: null,
        district: null,
        begruendung:
          'Die kommunale Quelle sagt zu dieser Fläche nichts. Sie deckt nur einen Teil der Stadt ab; ' +
          'das ist keine Aussage gegen die Hundewiese.',
      });
      continue;
    }

    for (const flaeche of treffer) {
      zugeordneteFlaechen.add(flaeche.areaId);
      zuordnungen.push({
        art: flaeche.kind === 'dog_off_leash' ? 'bestaetigt' : 'widerspruch',
        placeId: ort.placeId,
        placeName: ort.name,
        areaId: flaeche.areaId,
        areaName: flaeche.name,
        district: flaeche.district,
        begruendung:
          flaeche.kind === 'dog_off_leash'
            ? 'Die Verwaltung weist diese Fläche als Hundefreilauf aus; die OSM-Angabe ist damit belegt.'
            : 'OSM führt hier eine Hundewiese, die Verwaltung ein Hundemitnahmeverbot. Der Widerspruch ' +
              'wird nicht aufgelöst: die kommunale Angabe ist die verbindlichere, die OSM-Angabe bleibt sichtbar.',
      });
    }
  }

  for (const flaeche of flaechen) {
    if (zugeordneteFlaechen.has(flaeche.areaId)) continue;
    if (flaeche.kind !== 'dog_off_leash') continue;
    zuordnungen.push({
      art: 'nur_kommunal',
      placeId: null,
      placeName: null,
      areaId: flaeche.areaId,
      areaName: flaeche.name,
      district: flaeche.district,
      begruendung:
        'Ausgewiesene Freilauffläche, zu der OSM keine Hundewiese führt. Ein Zugewinn der kommunalen Quelle.',
    });
  }

  zuordnungen.sort((a, b) => {
    const linksSchluessel = `${a.art}:${a.placeId ?? ''}:${a.areaId ?? ''}`;
    const rechtsSchluessel = `${b.art}:${b.placeId ?? ''}:${b.areaId ?? ''}`;
    return linksSchluessel < rechtsSchluessel ? -1 : 1;
  });

  const zaehler: Record<AbgleichArt, number> = {
    bestaetigt: 0,
    widerspruch: 0,
    unbestaetigt: 0,
    nur_kommunal: 0,
  };
  for (const zuordnung of zuordnungen) zaehler[zuordnung.art] += 1;

  return { zuordnungen, zaehler };
}

export interface Hundeerlaubnis {
  /** `true` nur bei ausdrücklicher Ausweisung. Nie aus Schweigen abgeleitet. */
  readonly erlaubt: boolean | null;
  /** Worauf sich die Aussage stützt. `null`, wenn es keine gibt. */
  readonly beleg: string | null;
}

/**
 * Die belegte Aussage zu einem Punkt. Ohne Beleg bleibt das Ergebnis `null` —
 * unbekannt heißt weder erlaubt noch verboten.
 *
 * Ein Widerspruch (Punkt liegt zugleich in einer Freilauffläche und in einem
 * Verbotsgebiet) ergibt ebenfalls `null`: zwei einander widersprechende
 * Belege sind kein Beleg.
 */
export function belegteHundeerlaubnis(
  punkt: Coordinates,
  flaechen: readonly MunicipalArea[],
): Hundeerlaubnis {
  const treffer = flaechen.filter((flaeche) => punktInFlaeche(punkt, flaeche));
  const freilauf = treffer.filter((flaeche) => flaeche.kind === 'dog_off_leash');
  const verboten = treffer.filter((flaeche) => flaeche.kind === 'dog_prohibited');

  if (freilauf.length > 0 && verboten.length > 0) {
    return {
      erlaubt: null,
      beleg: `Widersprüchliche Ausweisungen: ${freilauf[0]?.areaId} und ${verboten[0]?.areaId}.`,
    };
  }
  if (freilauf.length > 0) {
    const flaeche = freilauf[0] as MunicipalArea;
    return {
      erlaubt: true,
      beleg: `Ausgewiesene Hundefreilauffläche ${flaeche.areaId} (${flaeche.municipality}, Stand ${flaeche.statedAt ?? 'unbekannt'}).`,
    };
  }
  if (verboten.length > 0) {
    const flaeche = verboten[0] as MunicipalArea;
    return {
      erlaubt: false,
      beleg: `Ausgewiesenes Hundemitnahmeverbot ${flaeche.areaId} (${flaeche.municipality}, Stand ${flaeche.statedAt ?? 'unbekannt'}).`,
    };
  }
  return { erlaubt: null, beleg: null };
}
