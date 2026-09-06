/**
 * M04-04 — Statischer Suchindex.
 *
 * Pagefind läuft **nach** dem HTML-Build über `dist/` und legt den Index als
 * statische Dateien daneben. Es gibt keinen Suchserver und keine Anfrage an
 * einen Dritten: die Suche läuft im Browser des Besuchers.
 *
 * Indexiert wird nur, was ausgeliefert werden darf. Seiten mit
 * `data-pagefind-ignore` — also alle nicht indexierbaren und alle technischen
 * Entwicklungsseiten — bleiben draußen.
 *
 * Ausführen: `npm run build:search` (läuft in `npm run build:site` mit).
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import * as pagefind from 'pagefind';

const OUTPUT_DIR = 'dist';
const BUNDLE_DIR = join(OUTPUT_DIR, 'pagefind');

function countHtmlFiles(directory: string): number {
  let total = 0;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) total += countHtmlFiles(path);
    else if (entry.name.endsWith('.html')) total += 1;
  }
  return total;
}

async function main(): Promise<number> {
  if (!existsSync(OUTPUT_DIR)) {
    console.error(`${OUTPUT_DIR}/ fehlt. Zuerst bauen, dann indexieren.`);
    return 2;
  }

  const htmlFiles = countHtmlFiles(OUTPUT_DIR);
  if (htmlFiles === 0) {
    console.error(`${OUTPUT_DIR}/ enthält kein HTML. Nichts zu indexieren.`);
    return 2;
  }

  const { index, errors: createErrors } = await pagefind.createIndex({
    // Deutsch als Indexsprache; weitere Sprachen erst mit echtem Markt.
    forceLanguage: 'de',
  });
  if (!index) {
    console.error('Pagefind-Index konnte nicht erstellt werden:', createErrors);
    return 1;
  }

  const { errors: addErrors } = await index.addDirectory({ path: OUTPUT_DIR });
  if (addErrors.length > 0) {
    console.error('Fehler beim Indexieren:', addErrors);
    return 1;
  }

  const { errors: writeErrors } = await index.writeFiles({ outputPath: BUNDLE_DIR });
  if (writeErrors.length > 0) {
    console.error('Fehler beim Schreiben des Index:', writeErrors);
    return 1;
  }

  // Die tatsächlich indexierten Seiten sind die geschriebenen Fragmente.
  // `addDirectory` meldet die gelesenen Dateien, nicht die aufgenommenen.
  const fragmentDir = join(BUNDLE_DIR, 'fragment');
  const indexed = existsSync(fragmentDir) ? readdirSync(fragmentDir).length : 0;
  const excluded = htmlFiles - indexed;

  console.log(
    `Suchindex erstellt: ${indexed} von ${htmlFiles} HTML-Seiten aufgenommen, ` +
      `${excluded} durch data-pagefind-ignore ausgeschlossen. Ausgabe: ${BUNDLE_DIR}/`,
  );

  if (indexed === 0) {
    console.error('Kein einziger Treffer im Index. Das ist keine funktionierende Suche.');
    return 1;
  }
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((error: unknown) => {
    console.error('Suchindex fehlgeschlagen:', error);
    process.exit(1);
  });
