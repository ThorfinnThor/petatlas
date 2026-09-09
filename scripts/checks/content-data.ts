/**
 * M22-02 — Die versionierten Inhaltsdaten gegen ihre Schemas prüfen.
 *
 * Bis hierher liefen diese Prüfungen **im Browser**: die Feature-Module
 * riefen beim Laden `Schema.safeParse()` auf die eingebauten JSON-Dateien
 * auf. Das hat 87 KiB Schemabibliothek in jede Seite gezogen, um Daten zu
 * prüfen, die sich zwischen Build und Aufruf gar nicht ändern können.
 *
 * Die Prüfung ist damit nicht weg, sondern früher: sie läuft hier, in
 * `npm run verify` und in der CI. Eine kaputte Datei bricht den Lauf ab,
 * statt in einer fremden Browsersitzung aufzufallen.
 *
 * Was **nicht** hierher gehört: alles, was zur Laufzeit ankommt —
 * nachgeladene Datenchunks, der lokale Speicher, eine gewählte Datei. Das
 * wird weiterhin im Browser geprüft, mit den Prüfungen aus
 * `src/domain/runtime-guards.ts`.
 *
 * Ausführen: `npm run check:content`
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import type { z } from 'zod';

import { AttributeReviewSchema } from '../../src/domain/schemas/product-attributes.ts';
import { CityAllowlistSchema } from '../../src/domain/schemas/city.ts';
import { CostScenarioSchema } from '../../src/domain/schemas/costs.ts';
import { InsuranceDisclosureSchema } from '../../src/domain/schemas/disclosure.ts';
import { TaxonomySchema } from '../../src/domain/schemas/taxonomy.ts';
import {
  PackingListSchema,
  TravelApprovalListSchema,
  TravelRuleSchema,
  TravelRuleSetSchema,
  TravelScopeSchema,
} from '../../src/domain/schemas/travel.ts';
import { FeeItemSchema } from '../../src/domain/schemas/costs.ts';
import { MunicipalSnapshotSchema } from '../../src/domain/schemas/municipal.ts';
import { PlaceSchema } from '../../src/domain/schemas/places.ts';
import { WatchStateFileSchema } from '../../src/domain/schemas/watchlist.ts';
import { attributPruefung } from '../../src/features/care/attributes.ts';
import { alleKategorien } from '../../src/features/care/taxonomy.ts';
import { alleRegeln } from '../../src/features/travel/rules.ts';
import { reisePackliste } from '../../src/features/travel/packing.ts';
import { FUTTER_DATENSATZ_SCHEMA } from '../../src/features/food/dataset-schema.ts';

export interface Pruefstueck {
  readonly datei: string;
  readonly schema: z.ZodType;
  /** Wofür die Datei da ist — steht im Bericht, damit ein Fund lesbar ist. */
  readonly zweck: string;
}

export const PRUEFSTUECKE: readonly Pruefstueck[] = [
  {
    datei: 'content-data/taxonomy/care.json',
    schema: TaxonomySchema,
    zweck: 'Pflegekategorien und ihre Ausschlüsse',
  },
  {
    datei: 'content-data/taxonomy/toys.json',
    schema: TaxonomySchema,
    zweck: 'Spielzeugkategorien und ihre Ausschlüsse',
  },
  {
    datei: 'content-data/taxonomy/food.json',
    schema: TaxonomySchema,
    zweck: 'Futterkategorien',
  },
  {
    datei: 'content-data/attributes/synthetic-review.json',
    schema: AttributeReviewSchema,
    zweck: 'Produkteigenschaften mit Herkunft',
  },
  {
    datei: 'content-data/food/synthetic-products.json',
    schema: FUTTER_DATENSATZ_SCHEMA,
    zweck: 'Futterprodukte',
  },
  {
    datei: 'content-data/travel/scope.json',
    schema: TravelScopeSchema,
    zweck: 'Geltungsbereich des Reisechecks',
  },
  {
    datei: 'content-data/travel/rules/eu-intra-2026.json',
    schema: TravelRuleSetSchema,
    zweck: 'Reiseregeln innerhalb der EU',
  },
  {
    datei: 'content-data/travel/approvals.json',
    schema: TravelApprovalListSchema,
    zweck: 'Fachliche Freigaben der Reiseregeln',
  },
  {
    datei: 'content-data/travel/packing-list.json',
    schema: PackingListSchema,
    zweck: 'Packliste zum Reisecheck',
  },
  {
    datei: 'content-data/city-allowlist.json',
    schema: CityAllowlistSchema,
    zweck: 'Städte mit eigener Seite',
  },
];

/** Weitere Dateien derselben Art, je Verzeichnis. */
export const VERZEICHNISSE: readonly {
  readonly verzeichnis: string;
  readonly schema: z.ZodType;
  readonly zweck: string;
}[] = [
  {
    verzeichnis: 'content-data/insurance-disclosures',
    schema: InsuranceDisclosureSchema,
    zweck: 'Offenlegungen zur Versicherungsvermittlung',
  },
  {
    verzeichnis: 'content-data/cost-scenarios',
    schema: CostScenarioSchema,
    zweck: 'Kostenszenarien',
  },
];

export interface Befund {
  readonly datei: string;
  readonly problem: string;
}

/**
 * Die versionierten Datenstände.
 *
 * Sie entstehen aus einem Importlauf und werden dabei geprüft — aber ein
 * Snapshot kann später von Hand angefasst werden, und dann prüft ihn
 * niemand mehr. Hier geschieht das bei jedem Lauf, gegen dieselben Schemas,
 * mit denen er entstanden ist.
 *
 * Zählfelder werden mitgeprüft: eine Datei, die 1.006 Positionen ankündigt
 * und 900 enthält, ist kaputt, auch wenn jede einzelne gültig ist.
 */
export function pruefeSnapshots(lies: (datei: string) => string | null): Befund[] {
  const befunde: Befund[] = [];

  const lade = (datei: string): Record<string, unknown> | null => {
    const inhalt = lies(datei);
    if (inhalt === null) {
      befunde.push({ datei, problem: 'Die Datei fehlt.' });
      return null;
    }
    try {
      return JSON.parse(inhalt) as Record<string, unknown>;
    } catch (fehler) {
      befunde.push({ datei, problem: `Kein gültiges JSON: ${String(fehler)}` });
      return null;
    }
  };

  const listePruefen = (
    datei: string,
    liste: unknown,
    angekuendigt: unknown,
    schema: z.ZodType,
    was: string,
  ): void => {
    if (!Array.isArray(liste)) {
      befunde.push({ datei, problem: `${was}: keine Liste.` });
      return;
    }
    if (typeof angekuendigt === 'number' && angekuendigt !== liste.length) {
      befunde.push({
        datei,
        problem: `${was}: angekündigt ${angekuendigt}, enthalten ${liste.length}.`,
      });
    }
    for (const [index, eintrag] of liste.entries()) {
      const ergebnis = schema.safeParse(eintrag);
      if (!ergebnis.success) {
        befunde.push({ datei, problem: `${was} Nr. ${index}: ${ergebnis.error.message}` });
        // Ein kaputter Datensatz reicht als Befund; tausend Meldungen helfen
        // niemandem beim Lesen.
        return;
      }
    }
  };

  const got = lade('data-snapshots/got/got-2022.json');
  if (got !== null) {
    listePruefen(
      'data-snapshots/got/got-2022.json',
      got.items,
      got.itemCount,
      FeeItemSchema,
      'Gebührenpositionen',
    );
  }

  const orte = lade('data-snapshots/places/places-de.json');
  if (orte !== null) {
    const abdeckung = (orte.coverage ?? {}) as Record<string, unknown>;
    listePruefen(
      'data-snapshots/places/places-de.json',
      orte.places,
      abdeckung.placeCount,
      PlaceSchema,
      'Orte',
    );
  }

  for (const datei of [
    'data-snapshots/municipal/berlin-hundefreilauf.json',
    'data-snapshots/municipal/hamburg-hundeauslaufzonen.json',
  ]) {
    const roh = lade(datei);
    if (roh === null) continue;
    const ergebnis = MunicipalSnapshotSchema.safeParse(roh);
    if (!ergebnis.success) befunde.push({ datei, problem: ergebnis.error.message });
  }

  const beobachtung = lies('data-snapshots/watch/rule-sources.json');
  if (beobachtung !== null) {
    try {
      const ergebnis = WatchStateFileSchema.safeParse(JSON.parse(beobachtung));
      if (!ergebnis.success) {
        befunde.push({
          datei: 'data-snapshots/watch/rule-sources.json',
          problem: ergebnis.error.message,
        });
      }
    } catch (fehler) {
      befunde.push({
        datei: 'data-snapshots/watch/rule-sources.json',
        problem: `Kein gültiges JSON: ${String(fehler)}`,
      });
    }
  }

  return befunde;
}

/**
 * Querbezüge zwischen den Dateien. Sie liefen bis M22-02 beim Laden im
 * Browser mit; sie prüfen aber ausschließlich Konstantes und gehören
 * deshalb hierher.
 */
export function pruefeQuerbezuege(): Befund[] {
  const befunde: Befund[] = [];

  // Jedes Produkt nennt eine Kategorie, die es gibt.
  const bekannteKategorien = new Set(alleKategorien().map((eintrag) => eintrag.categoryId));
  for (const produkt of attributPruefung().products) {
    if (!bekannteKategorien.has(produkt.categoryId)) {
      befunde.push({
        datei: 'content-data/attributes/synthetic-review.json',
        problem:
          `Produkt ${produkt.productId} nennt die unbekannte Kategorie ` +
          `"${produkt.categoryId}".`,
      });
    }
  }

  // Jeder Packlisteneintrag zeigt auf eine Anforderung, die es gibt.
  const bekannteAnforderungen = new Set(alleRegeln().map((regel) => regel.requirementId));
  for (const eintrag of reisePackliste().items) {
    if (eintrag.requirementId !== null && !bekannteAnforderungen.has(eintrag.requirementId)) {
      befunde.push({
        datei: 'content-data/travel/packing-list.json',
        problem:
          `Eintrag ${eintrag.itemId} verweist auf die unbekannte Anforderung ` +
          `"${eintrag.requirementId}".`,
      });
    }
  }

  // Die aus den Regelsätzen entfalteten Einzelregeln sind ebenfalls
  // konstant — und werden deshalb hier geprüft, nicht im Browser.
  for (const regel of alleRegeln()) {
    const ergebnis = TravelRuleSchema.safeParse(regel);
    if (!ergebnis.success) {
      befunde.push({
        datei: 'content-data/travel/rules/eu-intra-2026.json',
        problem: `Entfaltete Regel ${regel.ruleId} ist ungültig: ${ergebnis.error.message}`,
      });
    }
  }

  return befunde;
}

export function pruefe(
  stuecke: readonly Pruefstueck[],
  lies: (datei: string) => string | null,
): Befund[] {
  const befunde: Befund[] = [];
  for (const stueck of stuecke) {
    const inhalt = lies(stueck.datei);
    if (inhalt === null) {
      befunde.push({ datei: stueck.datei, problem: 'Die Datei fehlt.' });
      continue;
    }
    let roh: unknown;
    try {
      roh = JSON.parse(inhalt);
    } catch (fehler) {
      befunde.push({ datei: stueck.datei, problem: `Kein gültiges JSON: ${String(fehler)}` });
      continue;
    }
    const ergebnis = stueck.schema.safeParse(roh);
    if (!ergebnis.success) {
      befunde.push({ datei: stueck.datei, problem: ergebnis.error.message });
    }
  }
  return befunde;
}

function main(): number {
  const lies = (datei: string): string | null => {
    try {
      return readFileSync(datei, 'utf8');
    } catch {
      return null;
    }
  };

  const ausVerzeichnissen = VERZEICHNISSE.flatMap((eintrag) =>
    readdirSync(eintrag.verzeichnis)
      .filter((name) => name.endsWith('.json'))
      .map((name) => ({
        datei: join(eintrag.verzeichnis, name),
        schema: eintrag.schema,
        zweck: eintrag.zweck,
      })),
  );
  const alle = [...PRUEFSTUECKE, ...ausVerzeichnissen];
  const befunde = [...pruefe(alle, lies), ...pruefeSnapshots(lies), ...pruefeQuerbezuege()];

  for (const befund of befunde) console.error(`✗ ${befund.datei}: ${befund.problem}`);
  if (befunde.length > 0) {
    console.error(`\n${befunde.length} Beanstandung(en) in den Inhaltsdaten.`);
    return 1;
  }
  console.log(
    `Inhaltsdaten und Datenstände: ${alle.length} Inhaltsdatei(en) und 6 Snapshot(s) ` +
      'gegen ihr Schema geprüft, Querbezüge stimmen, keine Beanstandung.',
  );
  return 0;
}

if (import.meta.filename === process.argv[1]) {
  process.exit(main());
}
