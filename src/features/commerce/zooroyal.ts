import { commerceProgramme, partnerHinweisErlaubt } from './partner.ts';
import { partnerZiel } from './links.ts';
import type { MarketConfig } from '../../domain/market.ts';

export type ZooRoyalPage = 'spielzeug' | 'ergaenzungsfuttermittel' | 'futter';
export type ZooRoyalSpecies = 'dog' | 'cat';

const ZOOROYAL_CATEGORIES: Record<ZooRoyalPage, Record<ZooRoyalSpecies, string>> = {
  spielzeug: {
    dog: 'https://www.zooroyal.de/c/hund/hundespielzeug/',
    cat: 'https://www.zooroyal.de/c/katze/katzenspielzeug/',
  },
  ergaenzungsfuttermittel: {
    dog: 'https://www.zooroyal.de/c/hund/hundefutter/ergaenzungsfuttermittel/',
    cat: 'https://www.zooroyal.de/c/katze/katzenfutter/ergaenzungsfuttermittel/',
  },
  futter: {
    dog: 'https://www.zooroyal.de/c/hund/hundefutter/',
    cat: 'https://www.zooroyal.de/c/katze/katzenfutter/',
  },
};

export function zooroyalKategorie(page: ZooRoyalPage, species: ZooRoyalSpecies): string {
  return ZOOROYAL_CATEGORIES[page][species];
}

export function zooroyalProgramm() {
  return commerceProgramme().find((entry) => entry.programId === 'zooroyal-de') ?? null;
}

function approvedZooRoyalLink(
  market: MarketConfig,
  destinationUrl: string,
  contentRef: string,
  pageSlug: string,
  verticalRef: string,
): string | null {
  const program = zooroyalProgramm();
  const decision = partnerHinweisErlaubt({
    market,
    placement: 'neutral_list',
    stichtag: new Date().toISOString().slice(0, 10),
    programme: program === null ? [] : [program],
  });
  if (!decision.erlaubt || decision.programm === null) return null;
  return partnerZiel(decision.programm, {
    verticalRef,
    placementRef: 'neutral-list',
    contentRef,
    pageSlug,
    destinationUrl,
  });
}

export function zooroyalLink(
  market: MarketConfig,
  page: ZooRoyalPage,
  species: ZooRoyalSpecies,
  contentRef: string,
): string | null {
  return approvedZooRoyalLink(
    market,
    zooroyalKategorie(page, species),
    contentRef,
    page,
    'commerce',
  );
}

const ZOOROYAL_CARE_CATEGORIES: Record<string, Record<ZooRoyalSpecies, string>> = {
  'grooming-brush': {
    dog: 'https://www.zooroyal.de/c/hund/pflege-hygiene/fellpflege/',
    cat: 'https://www.zooroyal.de/c/katze/hygiene-pflege/fell-koerperpflege/',
  },
  'grooming-claw': {
    dog: 'https://www.zooroyal.de/c/hund/pflege-hygiene/pfotenpflege/',
    cat: 'https://www.zooroyal.de/c/katze/hygiene-pflege/',
  },
  'dental-care': {
    dog: 'https://www.zooroyal.de/c/hund/pflege-hygiene/zahnpflege/',
    cat: 'https://www.zooroyal.de/c/katze/hygiene-pflege/zahnpflege/',
  },
  'mobility-aid': {
    dog: 'https://www.zooroyal.de/c/hund/transport-sicherheit/autozubehoer/',
    cat: 'https://www.zooroyal.de/c/katze/transport-sicherheit/',
  },
  'coat-care-textile': {
    dog: 'https://www.zooroyal.de/c/hund/hundebekleidung/hundebademaentel/',
    cat: 'https://www.zooroyal.de/c/katze/hygiene-pflege/fell-koerperpflege/',
  },
};

export function zooroyalCareLink(
  market: MarketConfig,
  categoryId: string,
  species: ZooRoyalSpecies,
  contentRef: string,
): string | null {
  const destination = ZOOROYAL_CARE_CATEGORIES[categoryId]?.[species];
  if (destination === undefined) return null;
  return approvedZooRoyalLink(market, destination, contentRef, categoryId, 'care');
}
