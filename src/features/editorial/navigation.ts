import type { RouteKey } from '../../lib/routes.ts';

export const ARTICLE_TOOL_LABELS: Readonly<Partial<Record<RouteKey, string>>> = {
  costs: 'Tierarztkosten berechnen',
  map: 'Tierarzt und Orte finden',
  travel: 'Reisecheck starten',
  care: 'Pflegeauswahl öffnen',
  toys: 'Spielzeugfinder öffnen',
  food: 'Futter vergleichen',
  supplements: 'Ergänzungsfuttermittel einordnen',
  insurance: 'Tierversicherungen einordnen',
};
