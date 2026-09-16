import { readFile, writeFile } from 'node:fs/promises';

import matchesConfig from '../../config/commerce/fressnapf-product-matches.json' with { type: 'json' };
import editorial from '../../content-data/products/editorial.json' with { type: 'json' };
import supplements from '../../content-data/products/supplements.json' with { type: 'json' };
import {
  ladeCsv,
  katalogProdukteAusZeilen,
  ordneProdukteZuPartner,
  partnerFeeds,
  pruefeFeedListenUrl,
  type MatchTarget,
} from './fressnapf.ts';

const ADVERTISER_ID = '14979';
const PUBLISHER_ID = '3037577';
const ZOOROYAL_HOSTS = new Set(['zooroyal.de', 'www.zooroyal.de']);

async function main(): Promise<void> {
  const rawUrl = process.env.AWIN_FEED_LIST_URL?.trim();
  if (!rawUrl) throw new Error('AWIN_FEED_LIST_URL ist nicht konfiguriert.');

  const listRows = await ladeCsv(pruefeFeedListenUrl(rawUrl), 25_000_000, 5_000);
  const feeds = partnerFeeds(listRows, ADVERTISER_ID, 'zooroyal');
  if (feeds.length === 0)
    throw new Error('Kein aktiver deutscher ZooRoyal-Feed für Advertiser 14979 gefunden.');
  const selected = [...feeds].sort(
    (left, right) => (right.productCount ?? 0) - (left.productCount ?? 0),
  )[0];
  if (!selected) throw new Error('Der ZooRoyal-Feed konnte nicht ausgewählt werden.');

  const rows = await ladeCsv(selected.feedUrl, 268_435_456, 500_000);
  const katalogFelder = Object.keys(rows[0] ?? {}).filter((field) =>
    /category|species|animal|pet|product.?type/i.test(field),
  );
  console.log(`Awin-Feedfelder für Katalogzuordnung: ${katalogFelder.join(', ') || 'keine'}`);
  const katalogBeispiele = [
    ...new Set(
      rows
        .flatMap((row) => ['category_name', 'merchant_category'].map((field) => row[field] ?? ''))
        .filter(Boolean),
    ),
  ]
    .slice(0, 12)
    .map((value) => value.slice(0, 80));
  console.log(`Awin-Kategoriewerte (Beispiele): ${katalogBeispiele.join(' | ') || 'keine'}`);
  const names = Object.fromEntries(
    [...editorial.products, ...supplements.products].map((product) => [product.id, product.name]),
  );
  const products = ordneProdukteZuPartner(
    rows,
    matchesConfig.targets as readonly MatchTarget[],
    names,
    ADVERTISER_ID,
    ZOOROYAL_HOSTS,
  );
  const catalog = katalogProdukteAusZeilen(rows, ADVERTISER_ID, ZOOROYAL_HOSTS);
  const path = 'content-data/products/zooroyal-feed.json';
  const previous = JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>;
  if (products.length > 0) {
    const unchanged = JSON.stringify(previous.products ?? []) === JSON.stringify(products);
    const output = {
      schemaVersion: 1,
      advertiserId: ADVERTISER_ID,
      publisherId: PUBLISHER_ID,
      products,
      generatedAt:
        unchanged && typeof previous.generatedAt === 'string'
          ? previous.generatedAt
          : new Date().toISOString(),
    };
    await writeFile(path, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  }
  const catalogPath = 'content-data/products/zooroyal-catalog.json';
  const previousCatalog = JSON.parse(await readFile(catalogPath, 'utf8')) as Record<
    string,
    unknown
  >;
  if (catalog.length > 0) {
    const catalogUnchanged =
      JSON.stringify(previousCatalog.products ?? []) === JSON.stringify(catalog);
    const catalogOutput = {
      schemaVersion: 1,
      advertiserId: ADVERTISER_ID,
      publisherId: PUBLISHER_ID,
      merchantName: 'ZooRoyal',
      products: catalog,
      generatedAt:
        catalogUnchanged && typeof previousCatalog.generatedAt === 'string'
          ? previousCatalog.generatedAt
          : new Date().toISOString(),
    };
    await writeFile(catalogPath, `${JSON.stringify(catalogOutput, null, 2)}\n`, 'utf8');
  }
  console.log(
    `ZooRoyal-Feed geprüft: ${rows.length} Zeilen, ${products.length} redaktionelle Zuordnungen, ${catalog.length} Katalogprodukte.`,
  );
  if (products.length === 0)
    console.log('Keine redaktionelle Zuordnung; der bisherige Zuordnungsstand bleibt erhalten.');
  console.log(
    'Es wurden nur Produktname, Bildadresse und geprüfte Deep Links gespeichert; keine Preise oder Verfügbarkeiten.',
  );
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Der ZooRoyal-Feed-Sync ist fehlgeschlagen.',
  );
  process.exitCode = 1;
});
