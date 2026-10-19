/**
 * Suchindex-Auswahl für die in großer Zahl erzeugten GOT-Seiten.
 *
 * Alle Gebührenpositionen und Gruppen bleiben für Nutzer erreichbar. Für
 * Suchmaschinen werden aber nur Seiten freigegeben, die zum Schwerpunkt Hund
 * und Katze passen oder als größere Kataloggruppe eigenständigen Nutzen haben.
 * Der Produktionsbuild prüft zusätzlich das vereinbarte Fenster von 400 bis
 * 500 indexierbaren URLs.
 */
import { gruppen, positionen, type Gebuehrenposition, type Gruppe } from '../costs/detail.ts';
import { stadtAllowlist } from '../map/city-allowlist.ts';

/**
 * Indexkonzentration vom 19.10.2026: Die neue Domain bekam ab dem 10.10.2026
 * keine Impressionen mehr, obwohl die Seiten indexiert blieben (keine manuelle
 * Maßnahme). Fast alle Impressionen kamen von GOT-Einzelseiten, also von
 * Hunderten gleich gebauter Seiten aus einer amtlichen Tabelle. Statt 453
 * werden nur noch rund 115 Seiten zur Indexierung angeboten; alle übrigen
 * bleiben erreichbar, aber `noindex`. Begründung und Rückweg:
 * docs/reviews/seo-index-concentration-2026-10-19.md
 */
export const SEO_INDEX_BUDGET = {
  minimum: 100,
  target: 115,
  maximum: 160,
  /** GOT-Einzelseiten ab diesem Qualitätswert: Haustierbezug und mindestens zwei Alltagsmerkmale. */
  minimumGotScore: 750,
  minimumGotGroupSize: 15,
  /** Stadtseiten nur mit genügend gemessenen lokalen Orten. */
  minimumCityPlaces: 60,
} as const;

/**
 * GOT-Positionen mit messbarer Nachfrage in der Search Console
 * (22.09.–17.10.2026, mindestens 12 Impressionen) und Bezug zu Hund, Katze
 * oder Heimtier. Nutztier- und Pferdepositionen sind bewusst nicht dabei,
 * ebenso Seiten, die seit dem 24.09.2026 ohnehin `noindex` waren: In einer
 * Abwertung kommen keine Seiten zurück in den Index.
 */
export const GOT_NACHFRAGE = [
  '16',
  '143',
  '166',
  '180',
  '208',
  '221',
  '234',
  '235',
  '240',
  '310',
  '345',
  '394',
  '604',
  '627',
  '754',
  '854',
  '951',
  '955',
] as const;

const HAUSTIER_SIGNAL = ['hund', 'katze', 'frettchen', 'heimsäugetier', 'heimtier'] as const;

const ALLTAG_SIGNAL = [
  'allgemeine untersuchung',
  'beratung',
  'folgeuntersuchung',
  'hausbesuch',
  'stationäre unterbringung',
  'impf',
  'chip',
  'kennzeich',
  'blut',
  'harn',
  'urin',
  'röntgen',
  'ultraschall',
  'endoskop',
  'zahn',
  'kastr',
  'narkose',
  'sedation',
  'wunde',
  'verband',
  'auge',
  'ohr',
  'haut',
  'euthanas',
  'infusion',
  'injektion',
] as const;

const NUTZTIER_SIGNAL = [
  'pferd',
  'equid',
  'kamelid',
  'rind',
  'kalb',
  'wiederkäuer',
  'schwein',
  'ferkel',
  'geflügel',
  'fisch',
  'biene',
  'schaf',
  'ziege',
  'nutztier',
  'bestand',
  'herde',
  'teichwirtschaft',
] as const;

function suchtext(wert: string): string {
  return wert
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .replaceAll('ß', 'ss')
    .toLowerCase();
}

function treffer(text: string, signale: readonly string[]): number {
  return signale.filter((signal) => text.includes(suchtext(signal))).length;
}

export interface Qualitaetswert {
  readonly score: number;
  readonly begruendung: string;
}

/**
 * Priorität innerhalb der GOT-Seiten. Der Wert behauptet weder medizinische
 * Qualität noch Suchvolumen; er ordnet nur Zielgruppenbezug und Alltagsnutzen.
 */
export function gotPositionsQualitaet(position: Gebuehrenposition): Qualitaetswert {
  const text = suchtext(`${position.item.originalLabel} ${position.item.species ?? ''}`);
  const haustierTreffer = treffer(text, HAUSTIER_SIGNAL);
  const alltagTreffer = treffer(text, ALLTAG_SIGNAL);
  const nutztierTreffer = treffer(text, NUTZTIER_SIGNAL);

  let score = 500;
  score += Math.min(haustierTreffer, 2) * 180;
  score += Math.min(alltagTreffer, 3) * 35;
  score -= Math.min(nutztierTreffer, 2) * 210;
  if (text.includes('kompliziert')) score -= 8;
  if (position.item.originalLabel.length > 120) score -= 12;

  const gruende: string[] = [];
  if (haustierTreffer > 0) gruende.push('expliziter Bezug zu Hund, Katze oder Heimtier');
  if (alltagTreffer > 0) gruende.push('nachvollziehbarer Untersuchungs- oder Behandlungstyp');
  if (nutztierTreffer > 0) gruende.push('Schwerpunkt außerhalb des Portals');
  if (gruende.length === 0) gruende.push('allgemeine GOT-Leistung ohne eindeutigen Tierartbezug');
  return { score, begruendung: gruende.join('; ') };
}

function positionsNummer(position: Gebuehrenposition): number {
  const wert = Number.parseInt(position.item.officialItemId, 10);
  return Number.isFinite(wert) ? wert : Number.MAX_SAFE_INTEGER;
}

const POSITIONEN_NACH_QUALITAET = [...positionen()].sort((a, b) => {
  const differenz = gotPositionsQualitaet(b).score - gotPositionsQualitaet(a).score;
  if (differenz !== 0) return differenz;
  const nummernDifferenz = positionsNummer(a) - positionsNummer(b);
  if (nummernDifferenz !== 0) return nummernDifferenz;
  return a.slug.localeCompare(b.slug, 'de');
});

const NACHFRAGE = new Set<string>(GOT_NACHFRAGE);

const INDEXIERBARE_POSITIONEN = new Set(
  POSITIONEN_NACH_QUALITAET.filter(
    (position) =>
      gotPositionsQualitaet(position).score >= SEO_INDEX_BUDGET.minimumGotScore ||
      NACHFRAGE.has(position.item.officialItemId),
  ).map(({ slug }) => slug),
);

export function indexierbareGotPositionen(): readonly Gebuehrenposition[] {
  return POSITIONEN_NACH_QUALITAET.filter(({ slug }) => INDEXIERBARE_POSITIONEN.has(slug));
}

export function istIndexierbareGotPosition(position: Gebuehrenposition): boolean {
  return INDEXIERBARE_POSITIONEN.has(position.slug);
}

export function gotGruppenQualitaet(gruppe: Gruppe): Qualitaetswert {
  const anzahl = gruppe.positionen.length;
  return {
    score: 400 + Math.min(anzahl, 100),
    begruendung:
      anzahl >= SEO_INDEX_BUDGET.minimumGotGroupSize
        ? `${anzahl} amtliche Positionen bieten einen eigenständigen Katalogeinstieg`
        : `nur ${anzahl} Position(en); als Suchergebnis zu dünn`,
  };
}

export function istIndexierbareGotGruppe(gruppe: Gruppe): boolean {
  return gruppe.positionen.length >= SEO_INDEX_BUDGET.minimumGotGroupSize;
}

export function indexierbareGotGruppen(): readonly Gruppe[] {
  return gruppen().filter(istIndexierbareGotGruppe);
}

/** Stadtseiten: gebaut werden alle geeigneten, indexiert nur die mit dichtem Bestand. */
const INDEXIERBARE_STAEDTE = new Set(
  stadtAllowlist()
    .cities.filter((stadt) => (stadt.measured?.total ?? 0) >= SEO_INDEX_BUDGET.minimumCityPlaces)
    .map((stadt) => stadt.slug),
);

export function istIndexierbareStadtseite(slug: string): boolean {
  return INDEXIERBARE_STAEDTE.has(slug);
}

/**
 * Einzelne Futterpackungen (rund 270 Wörter, je Sorte mehrere fast gleiche
 * Packungsgrößen) werden nicht mehr indexiert; die Futterübersicht bleibt.
 */
export const FUTTERPRODUKTE_INDEXIERBAR = false;
