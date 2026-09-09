/**
 * M16-03 — Merkliste.
 *
 * Gemerkt werden **Kennungen, keine Kopien**. Der Grund steht in der
 * Abnahme: eine gespeicherte Preisangabe wäre nach einer Woche falsch, und
 * ein gespeicherter Produktname nach einem Sortimentswechsel irreführend.
 * Die Merkliste hält deshalb nur fest, *worauf* sie zeigt, und holt den Rest
 * beim Anzeigen aus den aktuellen Daten.
 *
 * Bei Orten wird zusätzlich die Koordinate gemerkt. Sie ist kein Inhalt,
 * sondern der Schlüssel zur richtigen Datenzelle — ohne sie ließe sich ein
 * Ort in einem bundesweiten Bestand nicht wiederfinden, ohne alles zu laden.
 *
 * Was nicht mehr gefunden wird, verschwindet nicht still: es steht als
 * „nicht mehr erfasst“ da, mit einem Knopf zum Entfernen.
 */
import { istMerkEintrag, istMerkliste } from '../../domain/runtime-guards.ts';
import type { Coordinates } from '../../domain/schemas/common.ts';

export const FAVORITES_STORAGE_KEY = 'petatlas.favorites.v1';

/** Wie viele Einträge höchstens. Eine Merkliste ist kein Archiv. */
export const MAX_EINTRAEGE = 200;

export type MerkArt = 'place' | 'food';

/**
 * M22-02: Form und Regeln stehen weiterhin als Schema in
 * `storage-schemas.ts`; hier steht der Typ von Hand, damit die
 * Schemabibliothek nicht in den Browser wandert. Beide werden gegeneinander
 * geprüft — als Typ beim `astro check` und als Verhalten in
 * `tests/runtime-guards.test.ts`.
 */
export interface MerkEintrag {
  readonly kind: MerkArt;
  /** Stabile Kennung des Gegenstands, etwa `osm:node:1` oder eine foodId. */
  readonly id: string;
  /** Nur bei Orten: Schlüssel zur Datenzelle, kein Inhalt. */
  readonly coordinates: Coordinates | null;
  readonly addedAt: string;
}

export interface Merkliste {
  readonly version: 1;
  readonly entries: readonly MerkEintrag[];
}

export const LEERE_MERKLISTE: Merkliste = { version: 1, entries: [] };

function schluessel(eintrag: Pick<MerkEintrag, 'kind' | 'id'>): string {
  return `${eintrag.kind}:${eintrag.id}`;
}

/**
 * Fügt einen Eintrag hinzu. Doppelte werden nicht doppelt, und die Liste
 * wächst nicht über ihre Grenze: der älteste Eintrag fällt heraus.
 */
export function merke(liste: Merkliste, eintrag: MerkEintrag): Merkliste {
  if (!istMerkEintrag(eintrag)) return liste;

  const ohneDoppel = liste.entries.filter(
    (vorhanden) => schluessel(vorhanden) !== schluessel(eintrag),
  );
  const neu = [...ohneDoppel, eintrag].sort((a, b) =>
    a.addedAt === b.addedAt
      ? schluessel(a) < schluessel(b)
        ? -1
        : 1
      : a.addedAt < b.addedAt
        ? -1
        : 1,
  );
  return { version: 1, entries: neu.slice(Math.max(0, neu.length - MAX_EINTRAEGE)) };
}

export function vergiss(liste: Merkliste, kind: MerkArt, id: string): Merkliste {
  return {
    version: 1,
    entries: liste.entries.filter((eintrag) => schluessel(eintrag) !== schluessel({ kind, id })),
  };
}

export function istGemerkt(liste: Merkliste, kind: MerkArt, id: string): boolean {
  return liste.entries.some((eintrag) => schluessel(eintrag) === schluessel({ kind, id }));
}

/** Liest die Merkliste aus einem Speicher. Unbrauchbares wird verworfen. */
export function lese(roh: string | null): Merkliste {
  if (roh === null) return LEERE_MERKLISTE;
  let gelesen: unknown;
  try {
    gelesen = JSON.parse(roh);
  } catch {
    return LEERE_MERKLISTE;
  }
  if (istMerkliste(gelesen, MAX_EINTRAEGE)) return gelesen as Merkliste;

  // Teilweise brauchbar: gültige Einträge behalten, kaputte verwerfen. Eine
  // Merkliste ganz wegzuwerfen, weil ein Eintrag falsch ist, wäre unnötig
  // hart — sie enthält keine Angaben, die man rekonstruieren könnte.
  if (
    typeof gelesen === 'object' &&
    gelesen !== null &&
    Array.isArray((gelesen as { entries?: unknown }).entries)
  ) {
    const einzeln = (gelesen as { entries: unknown[] }).entries.filter((eintrag) =>
      istMerkEintrag(eintrag),
    ) as MerkEintrag[];
    return { version: 1, entries: einzeln.slice(0, MAX_EINTRAEGE) };
  }
  return LEERE_MERKLISTE;
}

export function schreibe(liste: Merkliste): string {
  return JSON.stringify(liste);
}

export type AufloesungsStand = 'vorhanden' | 'verschwunden';

export interface AufgeloesterEintrag<T> {
  readonly eintrag: MerkEintrag;
  readonly stand: AufloesungsStand;
  /** Die **aktuellen** Daten. `null`, wenn nichts mehr gefunden wurde. */
  readonly daten: T | null;
  readonly hinweis: string;
}

/**
 * Löst einen Eintrag gegen die aktuellen Daten auf.
 *
 * Der Nachschlagevorgang wird hereingereicht, damit dieselbe Logik für Orte
 * (asynchron aus Datenzellen) und Futter (aus dem Bundle) gilt.
 */
export async function loeseAuf<T>(
  eintrag: MerkEintrag,
  nachschlagen: (eintrag: MerkEintrag) => Promise<T | null> | (T | null),
): Promise<AufgeloesterEintrag<T>> {
  let daten: T | null;
  try {
    daten = await nachschlagen(eintrag);
  } catch {
    daten = null;
  }
  return daten === null
    ? {
        eintrag,
        stand: 'verschwunden',
        daten: null,
        hinweis:
          'Dieser Eintrag ist in den aktuellen Daten nicht mehr enthalten. Es wird deshalb nichts ' +
          'darüber angezeigt — auch kein alter Preis und kein alter Name.',
      }
    : { eintrag, stand: 'vorhanden', daten, hinweis: 'Aus den aktuellen Daten geladen.' };
}
