/** Owner supplied tracking ID, 10.09.2026. Static text links only, no account approval claim. */
export const AMAZON_TAG = 'wauandmiau-21';
export const AMAZON_DISCLOSURE = 'Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.';
export const AMAZON_SEARCHES = {
  'kong-classic': 'KONG Classic Hundespielzeug',
  'west-paw-toppl-large': 'West Paw Toppl Large Eggplant Hundespielzeug',
  'catit-senses-play-circuit': 'Catit Senses Play Circuit 43154',
  'kong-cat-tennis-balls': 'KONG Cat Active Tennis Balls with Bells Katze',
  'kong-wobbler': 'KONG KONG Wobbler Hundespielzeug',
  'west-paw-hurley': 'West Paw Hurley Hundespielzeug',
  'west-paw-zisc': 'West Paw Zisc Hundespielzeug',
  'west-paw-qwizl': 'West Paw Qwizl Hundespielzeug',
  'catit-senses-digger': 'Catit Senses Digger Katzenspielzeug',
  'catit-senses-food-tree': 'Catit Senses Food Tree Katzenspielzeug',
  'catit-senses-treat-puzzle': 'Catit Senses Treat Puzzle · 43010 Katzenspielzeug',
  'catit-senses-treat-spinner': 'Catit Senses Treat Spinner · 43750 Katzenspielzeug',
  'supplements-dog': 'Ergänzungsfuttermittel Hund',
  'supplements-cat': 'Ergänzungsfuttermittel Katze',
} as const;
export type AmazonSelection = keyof typeof AMAZON_SEARCHES;
/** No visitor inputs, session IDs, profiles, prices or intermediary redirects. */
export function amazonSearchUrl(selection: string): string | null {
  if (!Object.hasOwn(AMAZON_SEARCHES, selection)) return null;
  const url = new URL('https://www.amazon.de/s');
  url.searchParams.set('k', AMAZON_SEARCHES[selection as AmazonSelection]);
  url.searchParams.set('tag', AMAZON_TAG);
  url.searchParams.set('linkCode', 'll2');
  return url.toString();
}
/** Explicit owner-authorized exception for real-data preview; fixtures remain ad-free. */
export function amazonEnabled(env: Record<string, string | undefined>): boolean {
  return (
    env.APP_PROFILE === 'real' &&
    ['preview', 'production'].includes(env.BUILD_MODE ?? '') &&
    !['true', '1'].includes(env.USE_FIXTURES ?? '')
  );
}
