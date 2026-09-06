/**
 * M06-03 — Deterministische Normalisierung.
 *
 * Zweimal derselbe Eingang muss zweimal dasselbe Ergebnis liefern. Sonst
 * erzeugt jeder Lauf einen neuen Inhalts-Hash, jeder Hash einen neuen
 * Dateinamen und jeder Dateiname ein Deployment — auch wenn sich fachlich
 * nichts geändert hat.
 *
 * Drei Ursachen für Nichtdeterminismus werden hier ausgeschlossen:
 *
 * 1. **Schlüsselreihenfolge.** `JSON.stringify` folgt der Einfügereihenfolge.
 *    Kanonisiert wird deshalb mit sortierten Schlüsseln.
 * 2. **Listenreihenfolge.** Quellen liefern Datensätze nicht stabil sortiert.
 *    Sortiert wird nach einem fachlichen Schlüssel, nicht nach Zufall.
 * 3. **Laufmetadaten.** Abrufzeitpunkt und Laufnummer ändern sich bei jedem
 *    Lauf. Sie gehören nicht in den Inhalts-Hash der Fachdaten.
 *
 * `null` bleibt `null`: unbekannt wird beim Normalisieren nicht zu 0 oder ''.
 */
import { createHash } from 'node:crypto';

/** Felder, die sich je Lauf ändern und deshalb nicht in den Hash gehören. */
export const RUN_METADATA_FIELDS: readonly string[] = ['retrievedAt', 'runId', 'builtAt'];

export type JsonValue =
  string | number | boolean | null | readonly JsonValue[] | { readonly [key: string]: JsonValue };

/**
 * Kanonische Darstellung: Objektschlüssel sortiert, Arrays in ihrer
 * Reihenfolge belassen (die ist fachlich bedeutsam und wird vorher gezielt
 * sortiert).
 */
export function canonicalize(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map((eintrag) => canonicalize(eintrag));
  if (value !== null && typeof value === 'object') {
    const eingang = value as { readonly [key: string]: JsonValue };
    const ergebnis: Record<string, JsonValue> = {};
    for (const schluessel of Object.keys(eingang).sort()) {
      ergebnis[schluessel] = canonicalize(eingang[schluessel] as JsonValue);
    }
    return ergebnis;
  }
  if (typeof value === 'number' && !Number.isFinite(value)) {
    throw new Error('NaN und Infinity sind in normalisierten Daten nicht zulässig.');
  }
  return value;
}

/** Entfernt Laufmetadaten rekursiv, damit sie den Hash nicht beeinflussen. */
export function stripRunMetadata(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map((eintrag) => stripRunMetadata(eintrag));
  if (value !== null && typeof value === 'object') {
    const eingang = value as { readonly [key: string]: JsonValue };
    const ergebnis: Record<string, JsonValue> = {};
    for (const schluessel of Object.keys(eingang)) {
      if (RUN_METADATA_FIELDS.includes(schluessel)) continue;
      ergebnis[schluessel] = stripRunMetadata(eingang[schluessel] as JsonValue);
    }
    return ergebnis;
  }
  return value;
}

/** Kanonischer JSON-Text. Grundlage für Hash und Ausgabe. */
export function canonicalJson(value: JsonValue): string {
  return JSON.stringify(canonicalize(value));
}

/**
 * Inhalts-Hash der Fachdaten. Laufmetadaten sind ausgenommen, damit ein
 * unveränderter Datenstand denselben Hash behält.
 */
export function contentHashOf(value: JsonValue): string {
  return createHash('sha256')
    .update(canonicalJson(stripRunMetadata(value)))
    .digest('hex');
}

/**
 * Stabile Sortierung nach einem Schlüssel. Bei Gleichstand entscheidet der
 * Schlüssel selbst, damit die Reihenfolge nicht von der Eingabe abhängt.
 */
export function sortStable<T>(records: readonly T[], key: (record: T) => string): readonly T[] {
  return [...records].sort((a, b) => {
    const links = key(a);
    const rechts = key(b);
    // localeCompare wäre von der Systemsprache abhängig; hier zählt Bytefolge.
    if (links < rechts) return -1;
    if (links > rechts) return 1;
    return 0;
  });
}

/** Meldet doppelte Schlüssel, statt sie stillschweigend zu überschreiben. */
export function assertUniqueKeys<T>(records: readonly T[], key: (record: T) => string): void {
  const gesehen = new Set<string>();
  const doppelt: string[] = [];
  for (const record of records) {
    const wert = key(record);
    if (gesehen.has(wert)) doppelt.push(wert);
    gesehen.add(wert);
  }
  if (doppelt.length > 0) {
    throw new Error(
      `Doppelte Schlüssel in normalisierten Daten: ${[...new Set(doppelt)].join(', ')}`,
    );
  }
}
