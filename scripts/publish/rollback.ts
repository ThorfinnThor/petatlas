/**
 * M17-06 — Rollback proben, nicht behaupten.
 *
 * Ein Rollback ist nicht „den alten Stand wieder hinstellen“. Es ist die
 * Frage: **darf der alte Stand heute noch ausgeliefert werden?** Die Antwort
 * kann nein lauten, obwohl er damals in Ordnung war:
 *
 * - Die Rechte einer Quelle können widerrufen worden sein. Ein alter
 *   Snapshot einer inzwischen gesperrten Quelle darf nicht zurückkehren.
 * - Eine Reiseregel kann abgelaufen sein. Ein Rollback darf sie nicht
 *   wiederbeleben.
 * - Ein alter Datenstand ist älter geworden, während er im Archiv lag.
 *
 * Deshalb prüft dieses Skript einen Kandidatenstand **gegen die heutige**
 * Registry und die heutigen Freigaben, nicht gegen die von damals.
 *
 * Es verändert nichts. Es liest einen Git-Stand, prüft ihn und sagt, ob er
 * zulässig wäre. Das Wiederherstellen selbst steht als Handgriff in
 * `docs/ROLLBACK.md` — ein Skript, das ungefragt Daten zurückschreibt, wäre
 * an genau der falschen Stelle bequem.
 *
 * Ausführen: `npm run rollback:pruefen -- <git-ref>`
 */
import { execFileSync } from 'node:child_process';

import { bewerte } from '../../src/features/freshness/policy.ts';
import { datensaetze } from '../../src/features/freshness/datasets.ts';
import { allSources } from '../../src/domain/source-registry.ts';

/**
 * Dateien, die ein Datenstand ausmacht, und die Quellen dahinter. Code
 * gehört nicht dazu.
 *
 * Die Quell-ID steht hier ausdrücklich dabei, weil nicht jeder Snapshot sie
 * mitführt: der Gebührenstand nennt Namen und Adresse, der Ortsdatensatz
 * seine sechzehn Regionen. Ohne diese Zuordnung liefe die Rechteprüfung ins
 * Leere und meldete stillschweigend „nichts zu beanstanden“.
 */
export const DATENPFADE: readonly {
  readonly pfad: string;
  readonly sourceIds: readonly string[];
}[] = [
  {
    pfad: 'data-snapshots/got/got-2022.json',
    sourceIds: ['got-2022-gesetze-im-internet'],
  },
  { pfad: 'data-snapshots/places/places-de.json', sourceIds: [] },
  {
    pfad: 'data-snapshots/municipal/berlin-hundefreilauf.json',
    sourceIds: ['berlin-hundefreilauf-wfs'],
  },
  { pfad: 'content-data/travel/rules/eu-intra-2026.json', sourceIds: [] },
  { pfad: 'content-data/travel/approvals.json', sourceIds: [] },
];

export interface Pruefpunkt {
  readonly name: string;
  readonly zulaessig: boolean;
  readonly begruendung: string;
}

export interface RollbackBericht {
  readonly ref: string;
  readonly commit: string;
  readonly punkte: readonly Pruefpunkt[];
  readonly zulaessig: boolean;
}

export function leseAusRef(ref: string, pfad: string): string | null {
  try {
    return execFileSync('git', ['show', `${ref}:${pfad}`], {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      // Ein unbekannter Ref ist hier eine Antwort, kein Grund, die
      // Fehlermeldung von git in die Ausgabe zu schreiben.
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return null;
  }
}

export function commitVon(ref: string): string {
  return execFileSync('git', ['rev-parse', ref], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

interface Snapshot {
  readonly source?: {
    readonly sourceId?: unknown;
    readonly regions?: readonly { readonly sourceId?: unknown }[];
  };
}

/**
 * Die Quellen hinter einer Datei: die erklärte Zuordnung, dazu was der
 * Snapshot selbst nennt — eine `sourceId` oder die Regionen eines
 * zusammengesetzten Standes.
 */
export function quellenAus(inhalt: string, erklaert: readonly string[]): readonly string[] {
  const gefunden = new Set<string>(erklaert);
  try {
    const daten = JSON.parse(inhalt) as Snapshot;
    if (typeof daten.source?.sourceId === 'string') gefunden.add(daten.source.sourceId);
    for (const region of daten.source?.regions ?? []) {
      if (typeof region.sourceId === 'string') gefunden.add(region.sourceId);
    }
  } catch {
    // Unlesbares JSON wird an anderer Stelle gemeldet.
  }
  return [...gefunden].sort();
}

/**
 * Prüft einen Kandidatenstand gegen die **heutigen** Regeln.
 *
 * `stichtag` ist der Tag, an dem zurückgerollt würde. Er entscheidet, ob ein
 * alter Datenstand inzwischen zu alt ist.
 */
export function pruefeRollback(
  ref: string,
  stichtag: string,
  leser: (ref: string, pfad: string) => string | null = leseAusRef,
): RollbackBericht {
  const punkte: Pruefpunkt[] = [];
  const commit = (() => {
    try {
      return commitVon(ref);
    } catch {
      return 'unbekannt';
    }
  })();

  // 1. Sind die Dateien im Kandidatenstand überhaupt vorhanden und lesbar?
  const inhalte = new Map<string, string>();
  for (const { pfad } of DATENPFADE) {
    const inhalt = leser(ref, pfad);
    if (inhalt === null) {
      punkte.push({
        name: `Datei ${pfad}`,
        zulaessig: false,
        begruendung: 'Fehlt im Kandidatenstand. Ein unvollständiger Stand wird nicht ausgeliefert.',
      });
      continue;
    }
    try {
      JSON.parse(inhalt);
    } catch {
      punkte.push({
        name: `Datei ${pfad}`,
        zulaessig: false,
        begruendung: 'Kein lesbares JSON.',
      });
      continue;
    }
    inhalte.set(pfad, inhalt);
    punkte.push({ name: `Datei ${pfad}`, zulaessig: true, begruendung: 'Vorhanden und lesbar.' });
  }

  // 2. Sind die Quellen dieses Standes heute noch freigegeben? Rechte können
  //    widerrufen worden sein, seit der Stand entstand.
  const heutigeRechte = new Map(allSources().map((quelle) => [quelle.sourceId, quelle.rights]));
  for (const { pfad, sourceIds } of DATENPFADE) {
    const inhalt = inhalte.get(pfad);
    if (inhalt === undefined) continue;
    const quellen = quellenAus(inhalt, sourceIds);
    if (quellen.length === 0) continue;

    const beanstandet: string[] = [];
    for (const sourceId of quellen) {
      const rechte = heutigeRechte.get(sourceId);
      if (rechte === undefined) {
        beanstandet.push(`${sourceId}: steht heute nicht mehr im Register`);
      } else if (rechte.status !== 'verified') {
        beanstandet.push(`${sourceId}: Rechte stehen heute auf „${rechte.status}“`);
      }
    }
    punkte.push({
      name: `Rechte hinter ${pfad}`,
      zulaessig: beanstandet.length === 0,
      begruendung:
        beanstandet.length === 0
          ? `${quellen.length} Quelle(n) heute weiterhin freigegeben.`
          : `Ein Rollback darf einen Widerruf nicht rückgängig machen — ${beanstandet.join('; ')}.`,
    });
  }

  // 3. Ist der Stand inzwischen zu alt? Ein Archiv altert weiter.
  const got = inhalte.get('data-snapshots/got/got-2022.json');
  const politik = datensaetze().find((satz) => satz.id === 'gebuehren-got')?.politik ?? null;
  if (got !== undefined && politik !== null) {
    const stand = (() => {
      try {
        const daten = JSON.parse(got) as { source?: { retrievalDate?: unknown } };
        return typeof daten.source?.retrievalDate === 'string' ? daten.source.retrievalDate : null;
      } catch {
        return null;
      }
    })();
    const bewertung = bewerte(stand, stichtag, politik);
    punkte.push({
      name: 'Alter des Gebührenstandes',
      zulaessig: !bewertung.blockiert,
      begruendung: bewertung.blockiert
        ? `Der zurückgerollte Stand wäre am ${stichtag} nicht mehr brauchbar: ${bewertung.begruendung}`
        : `Am ${stichtag} noch brauchbar: ${bewertung.begruendung}`,
    });
  }

  // 4. Freigaben: eine Reiseregel ohne gültige Freigabe darf nicht durch
  //    einen Rollback wieder scharf werden.
  const freigaben = inhalte.get('content-data/travel/approvals.json');
  if (freigaben !== undefined) {
    const anzahl = (() => {
      try {
        const daten = JSON.parse(freigaben) as { approvals?: unknown[] };
        return Array.isArray(daten.approvals) ? daten.approvals.length : 0;
      } catch {
        return 0;
      }
    })();
    punkte.push({
      name: 'Reisefreigaben',
      zulaessig: true,
      begruendung:
        anzahl === 0
          ? 'Der Stand enthält keine fachliche Freigabe; der Reisecheck bliebe in der Vorschau.'
          : `Der Stand enthält ${anzahl} Freigabe(n). Deren Signatur und Alter prüft die Regelmaschine beim Ausliefern erneut.`,
    });
  }

  return { ref, commit, punkte, zulaessig: punkte.every((punkt) => punkt.zulaessig) };
}

export function alsText(bericht: RollbackBericht): string {
  const zeilen = [`Kandidatenstand ${bericht.ref} (${bericht.commit.slice(0, 12)}):`];
  for (const punkt of bericht.punkte) {
    zeilen.push(`  [${punkt.zulaessig ? 'ok  ' : 'NEIN'}] ${punkt.name}: ${punkt.begruendung}`);
  }
  zeilen.push(
    bericht.zulaessig
      ? 'Dieser Stand wäre heute zulässig.'
      : 'Dieser Stand wäre heute NICHT zulässig.',
  );
  return zeilen.join('\n');
}

function main(): number {
  const ref = process.argv[2] ?? 'HEAD';
  const bericht = pruefeRollback(ref, new Date().toISOString().slice(0, 10));
  console.log(alsText(bericht));
  return bericht.zulaessig ? 0 : 1;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
