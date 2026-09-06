/**
 * M06-01 — Adapter-API.
 *
 * Ein Import zerfällt in sechs getrennte Schritte. Jeder hat einen eigenen
 * Ein- und Ausgang, damit sich einer davon austauschen lässt, ohne die
 * anderen anzufassen:
 *
 *   fetch → parse → normalize → validate → diff → publish
 *
 * Ein Adapter kennt nur seine Quelle. Er kennt weder das Ausgabeformat der
 * Website noch die Feature-Module. Eine neue Quelle bedeutet deshalb eine
 * neue Adapterdatei plus einen Registryeintrag — und keine Änderung an
 * Rechner, Karte oder Katalog.
 */
import type { Provenance } from '../../src/domain/source.ts';
import type { SourceEntry } from '../../src/domain/source-registry.ts';

/** Rohe Antwort der Quelle. `body` ist absichtlich unverändert. */
export interface FetchedResource {
  readonly sourceId: string;
  readonly url: string;
  readonly body: Uint8Array;
  readonly contentType: string | null;
  /** SHA-256 des unveränderten Körpers. */
  readonly contentHash: string;
  readonly retrievedAt: string;
  /** Wird für den bedingten Abruf beim nächsten Lauf gebraucht. */
  readonly etag: string | null;
  readonly lastModified: string | null;
}

/** Ergebnis des Parsens: quellnahe Datensätze, noch nicht normalisiert. */
export interface ParsedBatch<TRaw> {
  readonly sourceId: string;
  readonly records: readonly TRaw[];
  /** Fassungsstand, soweit die Quelle ihn zuverlässig hergibt. */
  readonly sourceVersion: string | null;
}

/** Ergebnis der Normalisierung: Fachdatensatz plus seine Provenienz. */
export interface NormalizedRecord<TRecord> {
  readonly record: TRecord;
  readonly provenance: Provenance;
}

export interface NormalizedBatch<TRecord> {
  readonly sourceId: string;
  readonly records: readonly NormalizedRecord<TRecord>[];
}

/** Ergebnis der Validierung. Ungültige Datensätze fallen nicht still weg. */
export interface ValidationResult<TRecord> {
  readonly valid: readonly NormalizedRecord<TRecord>[];
  readonly rejected: readonly { readonly index: number; readonly reason: string }[];
}

export type DiffKind = 'unchanged' | 'changed' | 'suspicious' | 'breaking';

export interface DiffResult {
  readonly kind: DiffKind;
  readonly added: number;
  readonly removed: number;
  readonly changed: number;
  /** Klartext für Log und Quarantänebericht. */
  readonly summary: string;
}

/**
 * Ein Adapter für genau eine Quelle.
 *
 * `TRaw` ist die quellnahe Zwischenform, `TRecord` der Fachdatensatz aus
 * `src/domain/schemas/`.
 */
export interface SourceAdapter<TRaw, TRecord> {
  readonly sourceId: string;
  /** Der Registryeintrag, aus dem Rechte und Bedingungen kommen. */
  readonly source: SourceEntry;

  parse(resource: FetchedResource): ParsedBatch<TRaw>;
  normalize(batch: ParsedBatch<TRaw>, resource: FetchedResource): NormalizedBatch<TRecord>;
  validate(batch: NormalizedBatch<TRecord>): ValidationResult<TRecord>;
}

export class IngestError extends Error {
  readonly sourceId: string;
  readonly step: 'fetch' | 'parse' | 'normalize' | 'validate' | 'diff' | 'publish';

  constructor(
    sourceId: string,
    step: IngestError['step'],
    message: string,
    options?: { cause?: unknown },
  ) {
    super(`[${sourceId}/${step}] ${message}`, options);
    this.name = 'IngestError';
    this.sourceId = sourceId;
    this.step = step;
  }
}
