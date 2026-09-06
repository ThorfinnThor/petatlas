/**
 * M06-04 — Quarantäne.
 *
 * Ein verdächtiger oder struktur-brechender Snapshot wird nicht verworfen und
 * nicht übernommen, sondern beiseitegelegt: mit Bericht, damit ein Mensch
 * entscheiden kann.
 *
 * Zentrale Zusicherung: **Der letzte gültige Snapshot bleibt unverändert.**
 * Ein Fehlschlag darf keinen funktionierenden Datenbestand kosten.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { DiffResult } from './types.ts';
import { mayPromote } from './diff.ts';

export interface QuarantineReport {
  readonly sourceId: string;
  readonly reason: string;
  readonly diff: DiffResult;
  readonly quarantinedAt: string;
  readonly rejectedPath: string;
}

export interface PromotionOutcome {
  readonly promoted: boolean;
  readonly reason: string;
  readonly quarantine: QuarantineReport | null;
}

function schreibe(pfad: string, inhalt: string): void {
  mkdirSync(dirname(pfad), { recursive: true });
  writeFileSync(pfad, inhalt, 'utf8');
}

/**
 * Übernimmt den neuen Snapshot oder legt ihn in Quarantäne.
 *
 * @param liveePath  Datei des zuletzt gültigen Snapshots.
 * @param quarantineDir Verzeichnis für abgelehnte Stände samt Bericht.
 */
export function promoteOrQuarantine(options: {
  sourceId: string;
  livePath: string;
  quarantineDir: string;
  nextContent: string;
  diff: DiffResult;
  now: string;
}): PromotionOutcome {
  const { sourceId, livePath, quarantineDir, nextContent, diff, now } = options;

  if (mayPromote(diff.kind)) {
    if (diff.kind === 'unchanged' && existsSync(livePath)) {
      return {
        promoted: false,
        reason: 'Inhalt unverändert; Snapshot bleibt wie er ist.',
        quarantine: null,
      };
    }
    schreibe(livePath, nextContent);
    return { promoted: true, reason: diff.summary, quarantine: null };
  }

  const abgelehnt = join(quarantineDir, `${sourceId}.${now.replace(/[:.]/g, '-')}.json`);
  schreibe(abgelehnt, nextContent);

  const bericht: QuarantineReport = {
    sourceId,
    reason: diff.summary,
    diff,
    quarantinedAt: now,
    rejectedPath: abgelehnt,
  };
  schreibe(`${abgelehnt}.report.json`, `${JSON.stringify(bericht, null, 2)}\n`);

  return {
    promoted: false,
    reason: `In Quarantäne: ${diff.summary}`,
    quarantine: bericht,
  };
}

/** Der zuletzt gültige Snapshot, falls vorhanden. */
export function readLiveSnapshot(livePath: string): string | null {
  return existsSync(livePath) ? readFileSync(livePath, 'utf8') : null;
}
