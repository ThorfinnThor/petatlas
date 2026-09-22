/** Tracking ID created in the verified PartnerNet account on 23.09.2026. Static text links only. */
export const AMAZON_TAG = 'deinhaustierportal-21';
export const AMAZON_DISCLOSURE = 'Als Amazon-Partner verdiene ich an qualifizierten Verkäufen.';
export const AMAZON_SEARCHES = {
  'trixie-capri-1-39811': 'TRIXIE Capri 1 39811 Transportbox',
  'trixie-capri-3-open-top-39861': 'TRIXIE Capri 3 Open Top 39861',
  'catit-cabrio-41372': 'Catit Cabrio 41372 Transportbox',
  'trixie-petwalk-3942': 'TRIXIE Petwalk 3942 Rampe',
  'trixie-petwalk-teleskop-3940': 'TRIXIE Petwalk 3940 Teleskop Rampe',
  'petsafe-happy-ride-ptv17-16898': 'PetSafe Happy Ride PTV17-16898 Teleskop Hunderampe',
  'kong-classic': 'KONG Classic Hundespielzeug',
  'kong-extreme': 'KONG Extreme Hundespielzeug',
  'west-paw-toppl-large': 'West Paw Toppl Large Eggplant Hundespielzeug',
  'catit-senses-play-circuit': 'Catit Senses Play Circuit 43154',
  'catit-senses-wave-circuit-43155': 'Catit Senses Wave Circuit 43155',
  'catit-senses-super-circuit-43156': 'Catit Senses Super Circuit 43156',
  'kong-cat-tennis-balls': 'KONG Cat Active Tennis Balls with Bells Katze',
  'kong-wobbler': 'KONG Wobbler Hundespielzeug',
  'west-paw-hurley': 'West Paw Hurley Hundespielzeug',
  'west-paw-zisc': 'West Paw Zisc Hundespielzeug',
  'west-paw-qwizl': 'West Paw Qwizl Hundespielzeug',
  'catit-senses-digger': 'Catit Senses Digger Katzenspielzeug',
  'catit-senses-food-tree': 'Catit Senses Food Tree Katzenspielzeug',
  'catit-senses-treat-puzzle': 'Catit Senses Treat Puzzle · 43010 Katzenspielzeug',
  'catit-senses-treat-spinner': 'Catit Senses Treat Spinner · 43750 Katzenspielzeug',
  'catit-pixi-fountain-43715': 'Catit PIXI Trinkbrunnen 43715',
  'catit-pixi-smart-fountain-43751': 'Catit PIXI Smart Trinkbrunnen 43751',
  'catit-pixi-uvc-stainless-fountain-43761': 'Catit PIXI UV-C Edelstahl Trinkbrunnen 43761',
  'catit-pixi-smart-feeder-43752': 'Catit PIXI Smart Futterautomat 43752',
  'catit-pixi-smart-feeder-6-43754': 'Catit PIXI Smart Futterautomat 6 Mahlzeiten 43754',
  'catit-pixi-smart-feeder-vision-43753': 'Catit PIXI Smart Futterautomat Vision 43753',
  'catit-airsift-litter-box-50702': 'Catit Airsift Katzentoilette Standard 50702',
  'catit-pixi-litter-box-44081': 'Catit PIXI Katzentoilette 44081',
  'catit-smartsift-litter-box-50685': 'Catit Smartsift Katzentoilette 50685',
  'flexi-classic-l-5m': 'flexi Classic L Gurt 5 m Hundeleine',
  'flexi-comfort-plus-l-5m': 'flexi Comfort Plus L Gurt 5 m Hundeleine',
  'flexi-xtreme-l-5m': 'flexi Xtreme L Gurt 5 m Hundeleine',
  'flexi-giant-l-8m': 'flexi Giant L Gurt 8 m Hundeleine',
  'trixie-journey-39413': 'TRIXIE Journey 39413 Transportbox Hund',
  'trixie-vario-39722': 'TRIXIE Vario 39722 Hundebox',
  'trixie-aluminium-39342': 'TRIXIE Aluminium Transportbox 39342 Hund',
  'canina-caniflora-vital-hund': 'Canina Caniflora Vital Hund 120 g',
  'canina-barfers-best-hund': "Canina Barfer's Best Hund 180 g",
  'canina-petvital-darm-gel': 'Canina PETVITAL Darm-Gel 30 ml',
  'canina-cat-vitamin-tabs': 'Canina Cat-Vitamin Tabs 125 g',
  'canina-cat-mineral-tabs': 'Canina Cat-Mineral Tabs 75 g',
  'canina-barfers-best-katze': "Canina Barfer's Best for Cats 180 g",
} as const;
export type AmazonSelection = keyof typeof AMAZON_SEARCHES;
/** Build a tagged Amazon search without visitor inputs or intermediary redirects. */
export function amazonSearchQueryUrl(query: string): string {
  const url = new URL('https://www.amazon.de/s');
  url.searchParams.set('k', query);
  url.searchParams.set('tag', AMAZON_TAG);
  url.searchParams.set('linkCode', 'll2');
  return url.toString();
}
/** No visitor inputs, session IDs, profiles, prices or intermediary redirects. */
export function amazonSearchUrl(selection: string): string | null {
  if (!Object.hasOwn(AMAZON_SEARCHES, selection)) return null;
  return amazonSearchQueryUrl(AMAZON_SEARCHES[selection as AmazonSelection]);
}
/** Explicit owner-authorized exception for real-data preview; fixtures remain ad-free. */
export function amazonEnabled(env: Record<string, string | undefined>): boolean {
  return (
    env.APP_PROFILE === 'real' &&
    ['preview', 'production'].includes(env.BUILD_MODE ?? '') &&
    !['true', '1'].includes(env.USE_FIXTURES ?? '')
  );
}
