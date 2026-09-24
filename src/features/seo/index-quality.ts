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

export const SEO_INDEX_BUDGET = {
  minimum: 400,
  target: 450,
  maximum: 500,
  gotPositions: 298,
  minimumGotGroupSize: 5,
} as const;

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

const INDEXIERBARE_POSITIONEN = new Set(
  POSITIONEN_NACH_QUALITAET.slice(0, SEO_INDEX_BUDGET.gotPositions).map(({ slug }) => slug),
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
