/**
 * M06-04 — Differenzprüfung.
 *
 * Zwischen zwei Snapshots wird nicht nur „gleich oder ungleich“
 * unterschieden, sondern vier Fälle:
 *
 * - `unchanged` — derselbe Inhalts-Hash. Nichts zu tun.
 * - `changed` — plausible Änderung. Darf übernommen werden.
 * - `suspicious` — plausibel *unplausibel*: leerer Feed, starker Rückgang der
 *   Datensatzzahl, neue Gebührenfassung. Geht in Quarantäne, nicht live.
 * - `breaking` — die Struktur passt nicht mehr. Geht in Quarantäne.
 *
 * Der wichtigste Fall ist der leere Feed. Ein Ausfall bei der Quelle sieht in
 * den Daten aus wie „es gibt nichts mehr“. Wer das übernimmt, löscht seinen
 * eigenen funktionierenden Datenbestand.
 */
import type { DiffKind, DiffResult } from './types.ts';

export interface SnapshotSummary {
  readonly sourceId: string;
  readonly contentHash: string;
  readonly recordCount: number;
  /** Fassungsstand der Quelle, soweit bekannt. */
  readonly sourceVersion: string | null;
  /** Schlüssel der Datensätze, für den Vergleich einzelner Einträge. */
  readonly recordIds: readonly string[];
  /** Feldnamen des ersten Datensatzes, als grober Strukturabgleich. */
  readonly fields: readonly string[];
}

export interface DiffThresholds {
  /** Ab welchem relativen Rückgang ein Snapshot verdächtig ist. */
  readonly maxShrinkRatio: number;
  /** Unterhalb dieser Zahl ist ein Rückgang nicht aussagekräftig. */
  readonly minRecordsForRatio: number;
}

export const DEFAULT_THRESHOLDS: DiffThresholds = {
  // Ein Fünftel weniger Datensätze ist bei offenen Daten kein Alltag.
  maxShrinkRatio: 0.2,
  minRecordsForRatio: 20,
};

function zaehle(vorher: readonly string[], nachher: readonly string[]) {
  const alt = new Set(vorher);
  const neu = new Set(nachher);
  let added = 0;
  let removed = 0;
  for (const id of neu) if (!alt.has(id)) added += 1;
  for (const id of alt) if (!neu.has(id)) removed += 1;
  return { added, removed };
}

/**
 * Vergleicht einen neuen Snapshot mit dem letzten gültigen.
 * Ohne Vorgänger ist jede nicht leere Lieferung `changed`.
 */
export function diffSnapshots(
  previous: SnapshotSummary | null,
  next: SnapshotSummary,
  thresholds: DiffThresholds = DEFAULT_THRESHOLDS,
): DiffResult {
  if (next.recordCount === 0) {
    return {
      kind: 'suspicious',
      added: 0,
      removed: previous?.recordCount ?? 0,
      changed: 0,
      summary:
        'Der neue Snapshot enthält keinen einzigen Datensatz. Ein leerer Feed ersetzt keinen gültigen Stand.',
    };
  }

  if (previous === null) {
    return {
      kind: 'changed',
      added: next.recordCount,
      removed: 0,
      changed: 0,
      summary: `Erster Snapshot mit ${next.recordCount} Datensätzen.`,
    };
  }

  if (previous.contentHash === next.contentHash) {
    return { kind: 'unchanged', added: 0, removed: 0, changed: 0, summary: 'Inhalt unverändert.' };
  }

  const fehlendeFelder = previous.fields.filter((feld) => !next.fields.includes(feld));
  if (fehlendeFelder.length > 0) {
    return {
      kind: 'breaking',
      added: 0,
      removed: 0,
      changed: 0,
      summary: `Felder fehlen im neuen Snapshot: ${fehlendeFelder.join(', ')}. Struktur der Quelle hat sich geändert.`,
    };
  }

  const { added, removed } = zaehle(previous.recordIds, next.recordIds);
  const changed = Math.max(0, next.recordCount - added);

  if (
    previous.recordCount >= thresholds.minRecordsForRatio &&
    next.recordCount < previous.recordCount * (1 - thresholds.maxShrinkRatio)
  ) {
    return {
      kind: 'suspicious',
      added,
      removed,
      changed,
      summary: `Datensatzzahl fällt von ${previous.recordCount} auf ${next.recordCount}. Rückgang über ${Math.round(thresholds.maxShrinkRatio * 100)} Prozent.`,
    };
  }

  if (
    previous.sourceVersion !== null &&
    next.sourceVersion !== null &&
    previous.sourceVersion !== next.sourceVersion
  ) {
    return {
      kind: 'suspicious',
      added,
      removed,
      changed,
      summary: `Neue Fassung der Quelle: ${previous.sourceVersion} → ${next.sourceVersion}. Fachliche Prüfung nötig, bevor der Stand live geht.`,
    };
  }

  return {
    kind: 'changed',
    added,
    removed,
    changed,
    summary: `${added} neu, ${removed} entfallen, ${next.recordCount} insgesamt.`,
  };
}

/** Darf ein Snapshot mit diesem Ergebnis den bisherigen Stand ersetzen? */
export function mayPromote(kind: DiffKind): boolean {
  return kind === 'changed' || kind === 'unchanged';
}
