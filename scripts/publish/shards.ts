/**
 * M06-05 — Aufteilung der Ausgabedaten.
 *
 * Es gibt bewusst keine `all-data.json`. Der Browser soll laden, was er
 * braucht, und nicht den gesamten Bestand.
 *
 * Überschreitet ein Shard sein Budget, wird **weiter geteilt** und nicht das
 * Budget erhöht. Ein Index nennt nur Metadaten und Dateiverweise, niemals
 * alle Datensätze — sonst wäre er die `all-data.json` unter anderem Namen.
 */
import { createHash } from 'node:crypto';

import { canonicalJson, sortStable, type JsonValue } from '../normalize/canonical.ts';
import { MAX_CHUNK_BYTES, MAX_GEO_CHUNK_BYTES } from '../../src/domain/schemas/manifest.ts';

export interface Shard {
  readonly shardId: string;
  readonly path: string;
  readonly contentHash: string;
  readonly byteSize: number;
  readonly recordCount: number;
  readonly content: string;
}

export class ShardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ShardError';
  }
}

function byteLength(text: string): number {
  return Buffer.byteLength(text, 'utf8');
}

function hashOf(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export interface ShardOptions {
  /** Basispfad unter `/data/v1/`, z. B. `places/de`. */
  readonly basePath: string;
  /** `places` bekommt das größere Geo-Budget. */
  readonly kind: 'fees' | 'places' | 'travel' | 'catalog' | 'offers' | 'sources';
  /** Gemeinsame Felder, die jeder Shard mitführt (Lizenz, Attribution …). */
  readonly envelope: Readonly<Record<string, JsonValue>>;
  /** Höchstzahl an Teilungsrunden, bevor aufgegeben wird. */
  readonly maxSplits?: number;
}

/**
 * Teilt Datensätze in Shards, die ihr Budget einhalten.
 *
 * Die Datensätze werden zuerst stabil sortiert, damit dieselbe Eingabe
 * dieselbe Aufteilung ergibt.
 */
export function buildShards<T>(
  records: readonly T[],
  key: (record: T) => string,
  options: ShardOptions,
): readonly Shard[] {
  const budget = options.kind === 'places' ? MAX_GEO_CHUNK_BYTES : MAX_CHUNK_BYTES;
  const maxSplits = options.maxSplits ?? 12;
  const sortiert = sortStable(records, key);

  if (sortiert.length === 0) {
    throw new ShardError('Es gibt keine Datensätze; ein leerer Shard wird nicht geschrieben.');
  }

  let gruppen: (readonly T[])[] = [sortiert];

  for (let runde = 0; ; runde += 1) {
    const zuGross = gruppen.filter((gruppe) => byteLength(serialisiere(gruppe, options)) > budget);
    if (zuGross.length === 0) break;

    if (runde >= maxSplits) {
      throw new ShardError(
        `Nach ${maxSplits} Teilungen halten Shards das Budget von ${budget} Byte nicht ein. ` +
          'Datensatz verkleinern statt Budget erhöhen.',
      );
    }
    if (gruppen.some((gruppe) => gruppe.length === 1) && zuGross.length > 0) {
      throw new ShardError(
        `Ein einzelner Datensatz überschreitet das Budget von ${budget} Byte. Weiter teilen ist nicht möglich.`,
      );
    }

    gruppen = gruppen.flatMap((gruppe) => {
      if (byteLength(serialisiere(gruppe, options)) <= budget) return [gruppe];
      const mitte = Math.ceil(gruppe.length / 2);
      return [gruppe.slice(0, mitte), gruppe.slice(mitte)];
    });
  }

  return gruppen.map((gruppe, index) => {
    const content = serialisiere(gruppe, options);
    const contentHash = hashOf(content);
    const shardId = `${options.basePath.replace(/\//g, '-')}-${String(index).padStart(3, '0')}`;
    return {
      shardId,
      // Der Inhalts-Hash steht im Dateinamen: derselbe Inhalt, derselbe Name.
      path: `/data/v1/${options.basePath}/${String(index).padStart(3, '0')}.${contentHash.slice(0, 8)}.json`,
      contentHash,
      byteSize: byteLength(content),
      recordCount: gruppe.length,
      content,
    };
  });
}

function serialisiere<T>(records: readonly T[], options: ShardOptions): string {
  return canonicalJson({
    ...options.envelope,
    records: records as unknown as JsonValue,
  } as JsonValue);
}

export interface ShardIndex {
  readonly path: string;
  readonly contentHash: string;
  readonly byteSize: number;
  readonly content: string;
}

/**
 * Index über die Shards. Er nennt nur Metadaten und Dateiverweise; die
 * Datensätze selbst stehen ausschließlich in den Shards.
 */
export function buildIndex(shards: readonly Shard[], options: ShardOptions): ShardIndex {
  const content = canonicalJson({
    ...options.envelope,
    shards: shards.map((shard) => ({
      shardId: shard.shardId,
      path: shard.path,
      contentHash: shard.contentHash,
      byteSize: shard.byteSize,
      recordCount: shard.recordCount,
    })),
  } as JsonValue);

  const byteSize = byteLength(content);
  if (byteSize > MAX_CHUNK_BYTES) {
    throw new ShardError(
      `Der Index ist ${byteSize} Byte groß. Er darf nur Metadaten enthalten, keine Datensätze.`,
    );
  }

  const contentHash = hashOf(content);
  return {
    path: `/data/v1/${options.basePath}/index.${contentHash.slice(0, 8)}.json`,
    contentHash,
    byteSize,
    content,
  };
}
