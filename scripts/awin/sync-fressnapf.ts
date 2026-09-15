import { readFile, writeFile } from 'node:fs/promises';

import matchesConfig from '../../config/commerce/fressnapf-product-matches.json' with { type: 'json' };
import editorial from '../../content-data/products/editorial.json' with { type: 'json' };
import supplements from '../../content-data/products/supplements.json' with { type: 'json' };
import {
  fressnapfFeeds,
  ladeCsv,
  ordneProdukteZu,
  pruefeFeedListenUrl,
  type MatchTarget,
} from './fressnapf.ts';

async function main(): Promise<void> {
  const rawUrl = process.env.AWIN_FEED_LIST_URL?.trim();
  if (!rawUrl) throw new Error('AWIN_FEED_LIST_URL ist nicht konfiguriert.');

  const listRows = await ladeCsv(pruefeFeedListenUrl(rawUrl), 25_000_000, 5_000);
  const feeds = fressnapfFeeds(listRows);
  if (feeds.length === 0)
    throw new Error('Kein aktiver deutscher Fressnapf-Feed für Advertiser 14757 gefunden.');
  const selected = [...feeds].sort(
    (left, right) => (right.productCount ?? 0) - (left.productCount ?? 0),
  )[0];
  if (!selected) throw new Error('Der Fressnapf-Feed konnte nicht ausgewählt werden.');

  const rows = await ladeCsv(selected.feedUrl, 268_435_456, 500_000);
  const names = Object.fromEntries(
    [...editorial.products, ...supplements.products].map((product) => [product.id, product.name]),
  );
  const products = ordneProdukteZu(rows, matchesConfig.targets as readonly MatchTarget[], names);
  if (products.length === 0)
    throw new Error(
      'Der Fressnapf-Feed enthält keine eindeutig zugeordneten redaktionellen Produkte.',
    );

  const path = 'content-data/products/fressnapf-feed.json';
  const previous = JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>;
  const substantive = {
    schemaVersion: 1,
    advertiserId: matchesConfig.advertiserId,
    publisherId: matchesConfig.publisherId,
    products,
  };
  const unchanged = JSON.stringify(previous.products ?? []) === JSON.stringify(products);
  const output = {
    ...substantive,
    generatedAt:
      unchanged && typeof previous.generatedAt === 'string'
        ? previous.generatedAt
        : new Date().toISOString(),
  };
  await writeFile(path, `${JSON.stringify(output, null, 2)}\n`, 'utf8');

  console.log(
    `Fressnapf-Feed geprüft: ${rows.length} Zeilen, ${products.length} eindeutige Produktzuordnungen.`,
  );
  console.log(
    'Es wurden nur Produktname, Bildadresse und geprüfte Deep Links gespeichert; keine Preise oder Verfügbarkeiten.',
  );
}

main().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'Der Fressnapf-Feed-Sync ist fehlgeschlagen.',
  );
  process.exitCode = 1;
});
