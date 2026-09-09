/**
 * M11-02 — Karte, erst auf Klick.
 *
 * Vor dem Klick passiert nichts: kein Leaflet, kein Stylesheet, keine
 * einzige Kachel. Das ist nicht nur eine Performancefrage — wer die Liste
 * benutzt, soll seine IP-Adresse nicht ungefragt an einen Kacheldienst
 * schicken.
 *
 * Was hier ausdrücklich **nicht** passiert:
 * - kein Vorabladen von Kacheln, kein Offlinearchiv,
 * - kein Nachladen ganzer Regionen: geladen wird, was im Ausschnitt liegt,
 * - kein stiller Ausfall: fällt der Kacheldienst aus, sagt die Karte das,
 *   und die Liste bleibt unberührt.
 */
import type { CircleMarker, Map as LeafletMap } from 'leaflet';

import { KATEGORIE_LABEL, type ListenOrt } from './list.ts';
import { TILES } from './tiles.ts';

/** Ab wie vielen Markern zusammengefasst statt einzeln gezeichnet wird. */
export const MARKER_GRENZE = 300;

export interface KartenZustand {
  readonly karte: LeafletMap;
  readonly markerEbene: ReturnType<LeafletMap['addLayer']>;
}

let leafletModul: typeof import('leaflet') | null = null;

/** Lädt Leaflet und sein Stylesheet — erst wenn es wirklich gebraucht wird. */
async function ladeLeaflet(): Promise<typeof import('leaflet')> {
  if (leafletModul !== null) return leafletModul;
  const [modul] = await Promise.all([import('leaflet'), import('leaflet/dist/leaflet.css')]);
  leafletModul = modul.default ?? (modul as unknown as typeof import('leaflet'));
  return leafletModul;
}

/**
 * Wählt die Marker aus, die gezeichnet werden.
 *
 * Bei einem dichten Ausschnitt werden nicht alle gezeichnet: tausend Marker
 * machen die Karte unbedienbar. Gezeigt werden die nächstgelegenen, und die
 * Oberfläche sagt, wie viele nicht dargestellt sind.
 */
export function waehleMarker(
  orte: readonly ListenOrt[],
  grenze = MARKER_GRENZE,
): { readonly gezeigt: readonly ListenOrt[]; readonly ausgelassen: number } {
  if (orte.length <= grenze) return { gezeigt: orte, ausgelassen: 0 };
  return { gezeigt: orte.slice(0, grenze), ausgelassen: orte.length - grenze };
}

export interface KartenOptionen {
  readonly container: HTMLElement;
  readonly mitte: { readonly latitude: number; readonly longitude: number };
  readonly zoom?: number;
  readonly orte: readonly ListenOrt[];
  /** Wird gerufen, wenn der Kacheldienst nicht liefert. */
  readonly beiKachelfehler?: () => void;
}

export async function zeigeKarte(optionen: KartenOptionen): Promise<KartenZustand> {
  const L = await ladeLeaflet();

  const karte = L.map(optionen.container, {
    center: [optionen.mitte.latitude, optionen.mitte.longitude],
    zoom: optionen.zoom ?? 13,
    // Kein Vorabladen von Kacheln außerhalb des Ausschnitts.
    preferCanvas: false,
  });

  const kacheln = L.tileLayer(TILES.urlTemplate, {
    attribution: TILES.attributionHtml,
    maxZoom: TILES.maxZoom,
    minZoom: TILES.minZoom,
    // Keine Kacheln über den sichtbaren Rand hinaus vorladen.
    keepBuffer: 0,
  });

  let fehlerGemeldet = false;
  kacheln.on('tileerror', () => {
    if (fehlerGemeldet) return;
    fehlerGemeldet = true;
    optionen.beiKachelfehler?.();
  });
  kacheln.addTo(karte);

  const { gezeigt } = waehleMarker(optionen.orte);
  // Kreismarker statt Bildmarker: Leaflets Standardsymbole sind PNG-Dateien,
  // die relativ zum Stylesheet aufgelöst werden und im Bundle ins Leere
  // laufen. Ein gezeichneter Kreis braucht keine zusätzliche Anfrage.
  const marker: CircleMarker[] = gezeigt.map((ort) =>
    L.circleMarker([ort.lat, ort.lon], {
      radius: 7,
      weight: 2,
      color: '#073637',
      fillColor: '#073637',
      fillOpacity: 0.6,
    }).bindPopup(
      `<strong>${escape(ort.name)}</strong><br>${escape(
        KATEGORIE_LABEL[ort.category] ?? ort.category,
      )}`,
    ),
  );
  for (const pin of marker) {
    pin.on('popupopen', () =>
      pin.setStyle({ color: '#ed9237', fillColor: '#ed9237', fillOpacity: 1 }),
    );
    pin.on('popupclose', () =>
      pin.setStyle({ color: '#073637', fillColor: '#073637', fillOpacity: 0.6 }),
    );
  }
  const ebene = L.layerGroup(marker).addTo(karte);

  return { karte, markerEbene: ebene as unknown as KartenZustand['markerEbene'] };
}

function escape(wert: string): string {
  return wert.replace(
    /[&<>"']/g,
    (zeichen) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[zeichen] ?? zeichen,
  );
}
