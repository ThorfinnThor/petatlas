import { gunzipSync } from 'node:zlib';
import { pflegeKategorieFuerProduktname } from '../../src/features/commerce/care-product-relevance.ts';

export interface MatchTarget {
  readonly productId: string;
  readonly brand: string;
  readonly aliases: readonly string[];
  readonly required?: readonly string[];
  readonly exclude?: readonly string[];
}

export interface FeedProduct {
  readonly productId: string;
  readonly productName: string;
  readonly merchantProductId: string | null;
  readonly imageUrl: string;
  readonly affiliateUrl: string;
  readonly merchantUrl: string;
}

export type CatalogCategory = 'toy' | 'supplement' | 'food' | 'care';
export type CatalogSpecies = 'dog' | 'cat';

/** Ein direkt aus dem freigegebenen Awin-Feed übernommener Katalogeintrag. */
export interface CatalogFeedProduct {
  readonly productId: string;
  readonly productName: string;
  readonly brand: string;
  readonly species: CatalogSpecies;
  readonly category: CatalogCategory;
  readonly categoryLabel: string;
  /** Feinere Rubrik des Händlers, z. B. „Kauspielzeug“; nur zur Anzeige und Filterung. */
  readonly subcategoryLabel?: string;
  readonly merchantProductId: string;
  readonly imageUrl: string;
  readonly affiliateUrl: string;
  readonly merchantUrl: string;
}

export interface EligibleFeed {
  readonly advertiserId: string;
  readonly advertiserName: string;
  readonly feedUrl: string;
  readonly lastUpdated: string | null;
  readonly productCount: number | null;
}

const AWIN_TRACKING_HOSTS = new Set(['awin1.com', 'www.awin1.com', 'awin1.net', 'www.awin1.net']);
const FRESSNAPF_HOSTS = new Set(['fressnapf.de', 'www.fressnapf.de']);
const FEED_HOSTS = new Set([
  'ui.awin.com',
  'productdata.awin.com',
  'datafeed.api.productserve.com',
]);
const GERMAN = /^(?:de|de[-_]de|german|deutsch)$/i;

export function normalisiere(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Erster nicht leerer Wert in der Reihenfolge der genannten Felder. Früher
 * gewann die erste vorhandene Spalte, auch wenn sie leer war: Ein leeres
 * `merchant_product_brand` verdeckte so ein gefülltes `brand_name`.
 */
function feld(row: Record<string, string>, ...names: string[]): string | undefined {
  const schluessel = (name: string) => normalisiere(name).replaceAll(' ', '');
  const spalten = new Map(Object.keys(row).map((key) => [schluessel(key), key]));
  for (const name of names) {
    const key = spalten.get(schluessel(name));
    const value = key ? row[key]?.trim() : undefined;
    if (value) return value;
  }
  return undefined;
}

export function parseCsv(text: string, maxRows = 500_000): readonly Record<string, string>[] {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';
  const delimiter = [',', '\t', ';'].sort(
    (left, right) => firstLine.split(right).length - firstLine.split(left).length,
  )[0];
  if (!delimiter || !firstLine.includes(delimiter))
    throw new Error('Awin-CSV hat kein erkennbares Trennzeichen.');

  const records: string[][] = [];
  let record: string[] = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else if (character === '"') quoted = false;
      else value += character;
    } else if (character === '"') quoted = true;
    else if (character === delimiter) {
      record.push(value.trim());
      value = '';
    } else if (character === '\n') {
      record.push(value.trim());
      value = '';
      if (record.some(Boolean)) records.push(record);
      record = [];
      if (records.length > maxRows + 1) throw new Error('Awin-CSV überschreitet das Zeilenlimit.');
    } else if (character !== '\r') value += character;
  }
  if (value || record.length) {
    record.push(value.trim());
    if (record.some(Boolean)) records.push(record);
  }
  if (quoted) throw new Error('Awin-CSV enthält ein nicht geschlossenes Anführungszeichen.');
  const [headers, ...rows] = records;
  if (!headers?.length) throw new Error('Awin-CSV ist leer.');
  return rows.map((row) =>
    Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])),
  );
}

export function pruefeFeedListenUrl(raw: string): string {
  const url = new URL(raw);
  const istAktuelleFeedListe =
    url.hostname === 'productdata.awin.com' &&
    /^\/datafeed\/list\/apikey\/[A-Za-z0-9_-]+\/?$/.test(url.pathname);
  const istDarwinFeedListe = url.hostname === 'ui.awin.com' && /\/feedlist\/?$/i.test(url.pathname);
  if (
    url.protocol !== 'https:' ||
    (!istAktuelleFeedListe && !istDarwinFeedListe) ||
    url.username ||
    url.password ||
    url.port ||
    url.search ||
    url.hash
  ) {
    throw new Error('Die Feedlisten-Adresse ist keine zugelassene Awin-Adresse.');
  }
  return url.toString();
}

function pruefeDownloadUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (
      !FEED_HOSTS.has(url.hostname) ||
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.port ||
      url.hash
    ) {
      return null;
    }
    url.protocol = 'https:';
    return url.toString();
  } catch {
    return null;
  }
}

export function fressnapfFeeds(rows: readonly Record<string, string>[]): readonly EligibleFeed[] {
  return rows.flatMap((row) => {
    const advertiserId = feld(row, 'advertiser_id', 'advertiser id', 'merchant_id', 'merchant id');
    const advertiserName = feld(row, 'advertiser_name', 'advertiser name', 'merchant_name');
    const status = feld(row, 'membership_status', 'membership status', 'status');
    const language = feld(row, 'language', 'feed_language', 'feed language');
    const rawUrl = feld(
      row,
      'url',
      'download_url',
      'feed_url',
      'feed_download_url',
      'manual_download_url',
    );
    const feedUrl = rawUrl ? pruefeDownloadUrl(rawUrl) : null;
    if (
      advertiserId !== '14757' ||
      !advertiserName ||
      !normalisiere(advertiserName).includes('fressnapf') ||
      (status && !['active', 'joined'].includes(status.toLowerCase())) ||
      (language && !GERMAN.test(language)) ||
      !feedUrl
    ) {
      return [];
    }
    const productCount = Number(feld(row, 'products', 'product_count')?.replace(/[^0-9]/g, ''));
    return [
      {
        advertiserId,
        advertiserName,
        feedUrl,
        lastUpdated: feld(row, 'last_update', 'last_updated') ?? null,
        productCount: Number.isFinite(productCount) && productCount > 0 ? productCount : null,
      },
    ];
  });
}

function sichereUrl(raw: string | undefined): URL | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && !url.username && !url.password && !url.port ? url : null;
  } catch {
    return null;
  }
}

/**
 * Manche Händler liefern im Feld für den Händlerlink eine Weiterleitung über
 * ein fremdes Trackingnetz (ZooRoyal: a.nonstoppartner.net). Die eigentliche
 * Produktadresse steht dann als Parameter darin. Übernommen wird sie nur, wenn
 * sie sicher ist und auf einen erlaubten Händlerhost zeigt; die Weiterleitung
 * selbst wird nie veröffentlicht.
 */
export function haendlerZiel(url: URL, merchantHosts: ReadonlySet<string>): URL | null {
  if (merchantHosts.has(url.host)) return url;
  for (const wert of url.searchParams.values()) {
    for (const kandidat of [wert, safeDecode(wert)]) {
      const ziel = sichereUrl(kandidat);
      if (ziel && merchantHosts.has(ziel.host)) return ziel;
    }
  }
  return null;
}

/**
 * Produktbild: bevorzugt über den Awin-Bildserver, weil CSP und Audit jeden
 * Bildhost einzeln erlauben müssen; sonst das erste sichere Händlerbild.
 */
const AWIN_BILDHOST = 'images2.productserve.com';
function produktbild(row: Record<string, string>): URL | null {
  const kandidaten = [
    'aw_image_url',
    'large_image',
    'large_image_url',
    'merchant_image_url',
    'image_url',
  ]
    .map((field) => sichereUrl(feld(row, field)))
    .filter((url): url is URL => url !== null);
  return kandidaten.find((url) => url.host === AWIN_BILDHOST) ?? kandidaten[0] ?? null;
}

function safeDecode(wert: string): string {
  try {
    return decodeURIComponent(wert);
  } catch {
    return wert;
  }
}

const KATALOG_KATEGORIE_FELDER = [
  'merchant_category',
  'merchant category',
  'merchant_category_name',
  'merchant category name',
  'merchant_product_category',
  'merchant product category',
  'merchant_product_category_name',
  'merchant product category name',
  'merchant_product_category_path',
  'merchant product category path',
  'merchant_product_second_category',
  'merchant product second category',
  'merchant_product_third_category',
  'merchant product third category',
  'category',
  'category_name',
  'category name',
  'product_type',
  'product type',
  'product_type_name',
  'product type name',
  'merchant_product_type',
  'merchant product type',
] as const;
const KATALOG_TIERART_FELDER = [
  'species',
  'animal',
  'animal_type',
  'animal type',
  'target_animal',
  'target animal',
  'pet_type',
  'pet type',
  'merchant_product_type',
  'merchant product type',
  'merchant_product_category',
  'merchant product category',
  'merchant_product_category_name',
  'merchant product category name',
  'merchant_category_name',
  'merchant category name',
] as const;

function katalogText(row: Record<string, string>, fields: readonly string[]): string {
  return fields
    .map((field) => feld(row, field) ?? '')
    .filter(Boolean)
    .join(' / ');
}

function katalogKategorie(row: Record<string, string>): {
  readonly category: CatalogCategory;
  readonly label: string;
} | null {
  const raw = katalogText(row, KATALOG_KATEGORIE_FELDER);
  const text = normalisiere(raw);
  if (!text) return null;
  if (/(erganzungsfutter|supplement|vitamin|mineral|probiotik)/.test(text)) {
    return { category: 'supplement', label: 'Ergänzungsfuttermittel' };
  }
  if (/(spielzeug|toy|besch[aä]ftigung|kratz|ball|kauartikel)/.test(text)) {
    return { category: 'toy', label: 'Spielzeug' };
  }
  if (/(pflege|buerste|burste|kamm|krallen|zahnpflege|fellpflege|fellbuerste)/.test(text)) {
    return { category: 'care', label: 'Pflege' };
  }
  if (/(hundefutter|katzenfutter|tierfutter|alleinfutter|nassfutter|trockenfutter)/.test(text)) {
    return { category: 'food', label: 'Futter' };
  }
  return null;
}

/**
 * Tierart und Kategorie werden ausschließlich aus ausdrücklich dafür
 * vorgesehenen Feed-Feldern gelesen. Der Produktname allein ist keine
 * ausreichende Zuordnung und wird deshalb nie dafür verwendet.
 */
function katalogTierart(row: Record<string, string>): CatalogSpecies | null {
  const teile = [...KATALOG_TIERART_FELDER, ...KATALOG_KATEGORIE_FELDER]
    .map((field) => normalisiere(feld(row, field) ?? ''))
    .filter(Boolean);
  const zuordnungen = teile.flatMap((text) => {
    const dog =
      /(^| )(hund|hunde|dog|dogs)( |$)/.test(text) ||
      /(^| )(hunde?(futter|spielzeug|bedarf|pflege|zubehoer)|dog(food|toy|care|supplies))( |$)/.test(
        text,
      );
    const cat =
      /(^| )(katze|katzen|cat|cats)( |$)/.test(text) ||
      /(^| )(katzen?(futter|spielzeug|bedarf|pflege|zubehoer)|cat(food|toy|care|supplies))( |$)/.test(
        text,
      );
    return dog === cat ? [] : [dog ? 'dog' : 'cat'];
  });
  const arten = new Set(zuordnungen);
  if (arten.size !== 1) return null;
  return [...arten][0] as CatalogSpecies;
}

/** Warum eine Feedzeile nicht in den Katalog kommt; für das Sync-Protokoll. */
export type KatalogAblehnung =
  | 'ohne Name'
  | 'ohne Händler-ID'
  | 'Kategorie unklar'
  | 'Tierart unklar'
  | 'ohne Bild'
  | 'ohne Händlerlink'
  | 'ohne Partnerlink'
  | 'kein konkretes Pflegeprodukt'
  | 'fremder Händlerhost'
  | 'fremder Trackinghost'
  | 'falscher Advertiser oder Publisher';

/** Letzter Abschnitt eines Kategoriepfads („Hund > Spielzeug > Kauspielzeug“ → „Kauspielzeug“). */
function unterkategorie(row: Record<string, string>): string | undefined {
  for (const field of [
    'merchant_product_category_path',
    'merchant_category',
    'merchant_product_third_category',
    'merchant_product_second_category',
    'category_name',
  ]) {
    const wert = feld(row, field);
    if (!wert) continue;
    const teile = wert
      .split(/\s*(?:>|\/|\|)\s*/)
      .map((teil) => teil.trim())
      .filter(Boolean);
    const letzter = teile.at(-1);
    if (letzter && teile.length > 1 && letzter.length <= 60) return letzter;
  }
  return undefined;
}

/**
 * Projiziert eine Feedzeile in einen sicheren, kleinen öffentlichen Katalog –
 * oder nennt den Grund, warum nicht. Preise, Verfügbarkeit und weitere
 * Feedfelder werden bewusst verworfen.
 */
export function katalogPruefung(
  row: Record<string, string>,
  advertiserId: string,
  merchantHosts: ReadonlySet<string>,
): CatalogFeedProduct | KatalogAblehnung {
  const name = feld(row, 'product_name', 'product name', 'name', 'title');
  const brand =
    feld(
      row,
      'merchant_product_brand',
      'product_brand',
      'brand_name',
      'brand name',
      'brand',
      'manufacturer',
    ) ?? 'Herstellerangabe nicht angegeben';
  const merchantProductId = feld(
    row,
    'merchant_product_id',
    'merchant product id',
    'aw_product_id',
    'product_id',
  );
  if (!name) return 'ohne Name';
  if (!merchantProductId) return 'ohne Händler-ID';
  const category = katalogKategorie(row);
  if (!category) return 'Kategorie unklar';
  const species = katalogTierart(row);
  if (!species) return 'Tierart unklar';
  const image = produktbild(row);
  if (!image) return 'ohne Bild';
  const merchant = sichereUrl(
    feld(row, 'merchant_deep_link', 'merchant_product_url', 'merchant_product_link', 'product_url'),
  );
  if (!merchant) return 'ohne Händlerlink';
  const ziel = haendlerZiel(merchant, merchantHosts);
  const affiliate = sichereUrl(feld(row, 'aw_deep_link', 'affiliate_url', 'tracking_url'));
  if (!affiliate) return 'ohne Partnerlink';
  if (category.category === 'care' && pflegeKategorieFuerProduktname(name) === null)
    return 'kein konkretes Pflegeprodukt';
  if (!ziel) return 'fremder Händlerhost';
  if (!AWIN_TRACKING_HOSTS.has(affiliate.host)) return 'fremder Trackinghost';
  const advertiser = affiliate.searchParams.get('m') ?? affiliate.searchParams.get('awinmid');
  const publisher = affiliate.searchParams.get('a') ?? affiliate.searchParams.get('awinaffid');
  if (advertiser !== advertiserId || publisher !== '3037577')
    return 'falscher Advertiser oder Publisher';
  const sub = unterkategorie(row);
  return {
    productId: `${advertiserId}:${merchantProductId}`,
    productName: name,
    brand,
    species,
    category: category.category,
    categoryLabel: category.label,
    ...(sub ? { subcategoryLabel: sub } : {}),
    merchantProductId,
    imageUrl: image.toString(),
    affiliateUrl: affiliate.toString(),
    merchantUrl: ziel.toString(),
  };
}

export function katalogProduktAusZeile(
  row: Record<string, string>,
  advertiserId: string,
  merchantHosts: ReadonlySet<string>,
): CatalogFeedProduct | null {
  const ergebnis = katalogPruefung(row, advertiserId, merchantHosts);
  return typeof ergebnis === 'string' ? null : ergebnis;
}

/** Zählt, warum Zeilen nicht in den Katalog kommen. Enthält keine Feedinhalte. */
export function katalogDiagnose(
  rows: readonly Record<string, string>[],
  advertiserId: string,
  merchantHosts: ReadonlySet<string>,
): Readonly<Record<string, number>> {
  const zaehler: Record<string, number> = {};
  for (const row of rows) {
    const ergebnis = katalogPruefung(row, advertiserId, merchantHosts);
    const grund = typeof ergebnis === 'string' ? ergebnis : `übernommen (${ergebnis.category})`;
    zaehler[grund] = (zaehler[grund] ?? 0) + 1;
  }
  return zaehler;
}

/**
 * Deterministische, deduplizierte Auswahl aus einem Händlerfeed. Je Tierart
 * und Kategorie wechseln sich die Marken ab, statt alphabetisch die ersten
 * Treffer zu nehmen – sonst füllt eine Marke mit „A“ den ganzen Katalog.
 */
export function katalogProdukteAusZeilen(
  rows: readonly Record<string, string>[],
  advertiserId: string,
  merchantHosts: ReadonlySet<string>,
  maxPerBucket = 60,
): readonly CatalogFeedProduct[] {
  const unique = new Map<string, CatalogFeedProduct>();
  for (const row of rows) {
    const product = katalogProduktAusZeile(row, advertiserId, merchantHosts);
    if (product && !unique.has(product.merchantProductId))
      unique.set(product.merchantProductId, product);
  }
  const vergleich = (left: CatalogFeedProduct, right: CatalogFeedProduct) =>
    `${left.productName}:${left.merchantProductId}`.localeCompare(
      `${right.productName}:${right.merchantProductId}`,
      'de',
    );
  const buckets = new Map<string, Map<string, CatalogFeedProduct[]>>();
  for (const product of unique.values()) {
    const key = `${product.category}:${product.species}`;
    const marken = buckets.get(key) ?? new Map<string, CatalogFeedProduct[]>();
    const liste = marken.get(product.brand) ?? [];
    liste.push(product);
    marken.set(product.brand, liste);
    buckets.set(key, marken);
  }
  const ergebnis: CatalogFeedProduct[] = [];
  for (const key of [...buckets.keys()].sort()) {
    const marken = [...buckets.get(key)!.entries()]
      .map(([marke, liste]) => [marke, liste.sort(vergleich)] as const)
      .sort(([a], [b]) => a.localeCompare(b, 'de'));
    const auswahl: CatalogFeedProduct[] = [];
    for (let runde = 0; auswahl.length < maxPerBucket; runde += 1) {
      let neu = false;
      for (const [, liste] of marken) {
        const produkt = liste[runde];
        if (!produkt) continue;
        neu = true;
        auswahl.push(produkt);
        if (auswahl.length >= maxPerBucket) break;
      }
      if (!neu) break;
    }
    ergebnis.push(...auswahl.sort(vergleich));
  }
  return ergebnis;
}

export function produktAusZeile(
  row: Record<string, string>,
  target: MatchTarget,
  productName: string,
): FeedProduct | null {
  return produktAusZeileFuerPartner(row, target, productName, '14757', FRESSNAPF_HOSTS);
}

/** Match a product row for another approved Awin retailer. */
export function produktAusZeileFuerPartner(
  row: Record<string, string>,
  target: MatchTarget,
  productName: string,
  advertiserId: string,
  merchantHosts: ReadonlySet<string>,
): FeedProduct | null {
  const name = feld(row, 'product_name', 'product name', 'name', 'title') ?? '';
  const brand = feld(row, 'merchant_product_brand', 'product_brand', 'brand', 'manufacturer') ?? '';
  const haystack = normalisiere(`${brand} ${name}`);
  if (!haystack.includes(normalisiere(target.brand))) return null;
  if (!target.aliases.some((alias) => haystack.includes(normalisiere(alias)))) return null;
  if (target.required?.some((term) => !haystack.includes(normalisiere(term)))) return null;
  if (target.exclude?.some((term) => haystack.includes(normalisiere(term)))) return null;

  const image = produktbild(row);
  const merchant = sichereUrl(
    feld(row, 'merchant_deep_link', 'merchant_product_url', 'merchant_product_link', 'product_url'),
  );
  const affiliate = sichereUrl(feld(row, 'aw_deep_link', 'affiliate_url', 'tracking_url'));
  const ziel = merchant ? haendlerZiel(merchant, merchantHosts) : null;
  if (!image || !ziel || !affiliate) return null;
  if (!AWIN_TRACKING_HOSTS.has(affiliate.host)) return null;
  const advertiser = affiliate.searchParams.get('m') ?? affiliate.searchParams.get('awinmid');
  const publisher = affiliate.searchParams.get('a') ?? affiliate.searchParams.get('awinaffid');
  if (advertiser !== advertiserId || publisher !== '3037577') return null;

  return {
    productId: target.productId,
    productName,
    merchantProductId:
      feld(row, 'merchant_product_id', 'merchant product id', 'aw_product_id') ?? null,
    imageUrl: image.toString(),
    affiliateUrl: affiliate.toString(),
    merchantUrl: ziel.toString(),
  };
}

export function partnerFeeds(
  rows: readonly Record<string, string>[],
  advertiserId: string,
  advertiserNeedle: string,
): readonly EligibleFeed[] {
  return rows.flatMap((row) => {
    const id = feld(row, 'advertiser_id', 'advertiser id', 'merchant_id', 'merchant id');
    const name = feld(row, 'advertiser_name', 'advertiser name', 'merchant_name');
    const status = feld(row, 'membership_status', 'membership status', 'status');
    const language = feld(row, 'language', 'feed_language', 'feed language');
    const rawUrl = feld(
      row,
      'url',
      'download_url',
      'feed_url',
      'feed_download_url',
      'manual_download_url',
    );
    const feedUrl = rawUrl ? pruefeDownloadUrl(rawUrl) : null;
    if (
      id !== advertiserId ||
      !name ||
      !normalisiere(name).includes(normalisiere(advertiserNeedle)) ||
      (status && !['active', 'joined'].includes(status.toLowerCase())) ||
      (language && !GERMAN.test(language)) ||
      !feedUrl
    )
      return [];
    const productCount = Number(feld(row, 'products', 'product_count')?.replace(/[^0-9]/g, ''));
    return [
      {
        advertiserId: id,
        advertiserName: name,
        feedUrl,
        lastUpdated: feld(row, 'last_update', 'last_updated') ?? null,
        productCount: Number.isFinite(productCount) && productCount > 0 ? productCount : null,
      },
    ];
  });
}

export function ordneProdukteZuPartner(
  rows: readonly Record<string, string>[],
  targets: readonly MatchTarget[],
  names: Readonly<Record<string, string>>,
  advertiserId: string,
  merchantHosts: ReadonlySet<string>,
): readonly FeedProduct[] {
  const matches = new Map<string, FeedProduct[]>();
  for (const row of rows) {
    const rowMatches = targets.flatMap((target) => {
      const productName = names[target.productId];
      if (!productName) return [];
      const match = produktAusZeileFuerPartner(
        row,
        target,
        productName,
        advertiserId,
        merchantHosts,
      );
      return match ? [match] : [];
    });
    if (rowMatches.length !== 1) continue;
    const match = rowMatches[0] as FeedProduct;
    matches.set(match.productId, [...(matches.get(match.productId) ?? []), match]);
  }
  return [...matches]
    .map(
      ([, candidates]) =>
        [...candidates].sort((left, right) =>
          (left.merchantProductId ?? '').localeCompare(right.merchantProductId ?? '', 'de'),
        )[0],
    )
    .filter((product): product is FeedProduct => product !== undefined)
    .sort((left, right) => left.productId.localeCompare(right.productId, 'de'));
}

export function ordneProdukteZu(
  rows: readonly Record<string, string>[],
  targets: readonly MatchTarget[],
  names: Readonly<Record<string, string>>,
): readonly FeedProduct[] {
  const matches = new Map<string, FeedProduct[]>();
  for (const row of rows) {
    const rowMatches = targets.flatMap((target) => {
      const productName = names[target.productId];
      if (!productName) return [];
      const match = produktAusZeile(row, target, productName);
      return match ? [match] : [];
    });
    if (rowMatches.length !== 1) continue;
    const match = rowMatches[0] as FeedProduct;
    matches.set(match.productId, [...(matches.get(match.productId) ?? []), match]);
  }

  return [...matches]
    .map(
      ([, candidates]) =>
        [...candidates].sort((left, right) =>
          (left.merchantProductId ?? '').localeCompare(right.merchantProductId ?? '', 'de'),
        )[0],
    )
    .filter((product): product is FeedProduct => product !== undefined)
    .sort((left, right) => left.productId.localeCompare(right.productId, 'de'));
}

export async function ladeCsv(
  url: string,
  maxBytes: number,
  maxRows: number,
): Promise<readonly Record<string, string>[]> {
  const response = await fetch(url, {
    redirect: 'follow',
    headers: { 'user-agent': 'WauUndMiau-AwinFeed/1.0' },
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`Awin-Abruf fehlgeschlagen (HTTP ${response.status}).`);
  const declared = Number(response.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes)
    throw new Error('Awin-Abruf überschreitet das Bytelimit.');
  const compressed = Buffer.from(await response.arrayBuffer());
  if (compressed.length > maxBytes) throw new Error('Awin-Abruf überschreitet das Bytelimit.');
  const uncompressed =
    compressed[0] === 0x1f && compressed[1] === 0x8b
      ? gunzipSync(compressed, { maxOutputLength: maxBytes })
      : compressed;
  return parseCsv(uncompressed.toString('utf8').replace(/^\uFEFF/, ''), maxRows);
}
