/**
 * M11-03 — Standort.
 *
 * Der Standort wird **nur** auf eine ausdrückliche Nutzeraktion abgefragt,
 * **nicht** gespeichert und **nirgendwohin** gesendet. Er lebt in einer
 * Variablen, solange die Seite offen ist, und verschwindet mit ihr.
 *
 * Konkret heißt das:
 * - kein `navigator.geolocation` beim Laden der Seite,
 * - kein `localStorage`, kein Cookie, kein URL-Parameter,
 * - keine Anfrage an einen Server mit Koordinaten darin,
 * - kein `watchPosition`: eine Abfrage, ein Ergebnis.
 *
 * Ablehnung und Zeitüberschreitung sind normale Ergebnisse mit eigenem Text,
 * keine Fehler, die man wegdrückt.
 */

export type StandortErgebnis =
  | {
      readonly art: 'ok';
      readonly latitude: number;
      readonly longitude: number;
      readonly genauigkeitMeter: number | null;
    }
  | { readonly art: 'abgelehnt'; readonly text: string }
  | { readonly art: 'nicht_verfuegbar'; readonly text: string }
  | { readonly art: 'zeitueberschreitung'; readonly text: string };

export const STANDORT_TEXTE = {
  abgelehnt:
    'Der Standort wurde nicht freigegeben. Das ist in Ordnung — geben Sie einen Ort ein, das Ergebnis ist dasselbe.',
  nichtVerfuegbar:
    'Dieser Browser gibt keinen Standort her. Geben Sie einen Ort ein, das Ergebnis ist dasselbe.',
  zeitueberschreitung:
    'Die Standortbestimmung hat zu lange gedauert. Geben Sie einen Ort ein, das Ergebnis ist dasselbe.',
  hinweisVorher:
    'Die genauen Standortkoordinaten werden von uns nicht gespeichert und nicht übertragen. Eine zusätzlich angezeigte Karte lädt jedoch Kartenausschnitte beim externen Kacheldienst; daraus kann Ihr ungefährer Standort erkennbar sein.',
} as const;

export interface StandortOptionen {
  readonly timeoutMs?: number;
  /** Nur für Tests. Standard ist `navigator.geolocation`. */
  readonly geolocation?: Geolocation;
}

/**
 * Fragt den Standort einmal ab. Wird ausschließlich aus einem Klickhandler
 * gerufen — nie beim Laden.
 */
export function frageStandort(optionen: StandortOptionen = {}): Promise<StandortErgebnis> {
  const dienst =
    optionen.geolocation ?? (typeof navigator === 'undefined' ? undefined : navigator.geolocation);

  if (dienst === undefined) {
    return Promise.resolve({ art: 'nicht_verfuegbar', text: STANDORT_TEXTE.nichtVerfuegbar });
  }

  return new Promise((resolve) => {
    dienst.getCurrentPosition(
      (position) =>
        resolve({
          art: 'ok',
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          genauigkeitMeter: Number.isFinite(position.coords.accuracy)
            ? Math.round(position.coords.accuracy)
            : null,
        }),
      (fehler) => {
        if (fehler.code === fehler.PERMISSION_DENIED) {
          resolve({ art: 'abgelehnt', text: STANDORT_TEXTE.abgelehnt });
          return;
        }
        if (fehler.code === fehler.TIMEOUT) {
          resolve({ art: 'zeitueberschreitung', text: STANDORT_TEXTE.zeitueberschreitung });
          return;
        }
        resolve({ art: 'nicht_verfuegbar', text: STANDORT_TEXTE.nichtVerfuegbar });
      },
      {
        timeout: optionen.timeoutMs ?? 10_000,
        // Kein Dauerbetrieb, kein alter Wert aus dem Cache.
        maximumAge: 0,
        enableHighAccuracy: false,
      },
    );
  });
}

/**
 * Wie ein gefundener Standort benannt wird.
 *
 * Ausdrücklich nicht als Gemeinde: aus einer Koordinate folgt keine
 * Verwaltungszugehörigkeit, und ein Reverse-Geocoding gibt es hier nicht.
 */
export function standortLabel(genauigkeitMeter: number | null): string {
  if (genauigkeitMeter === null) return 'Ihr ungefährer Standort';
  return `Ihr ungefährer Standort (±${genauigkeitMeter} m)`;
}
