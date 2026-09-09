/**
 * Was in einer Vorschau tatsächlich echt ist — und was nicht.
 *
 * Bis zum 09.09.2026 stand über jeder Vorschauseite derselbe Satz: „Dieser
 * Build zeigt synthetische Beispieldaten. Keine echten Praxen, Preise oder
 * Regeln." Er stand auch über der Hamburger Stadtseite mit 49 echten
 * Tierarztpraxen aus OpenStreetMap und über dem Rechner mit 1.006 echten
 * Positionen der amtlichen Gebührenordnung.
 *
 * Das war **falsch**, und zwar in der schlimmsten Richtung: der Hinweis hat
 * echte Arbeit als Attrappe ausgegeben. Wer die Vorschau ansah, sah einen
 * Prototyp, obwohl der Bestand echt ist.
 *
 * Der Hinweis wird deshalb nicht mehr geschrieben, sondern **abgeleitet**:
 * aus den Datenständen selbst und aus den freigeschalteten Funktionen. Damit
 * kann er nicht wieder danebenliegen, wenn sich der Bestand ändert.
 *
 * Drei Zustände, die auseinandergehalten werden:
 *
 * - **echt** — aus einer benannten Quelle mit geprüften Rechten,
 * - **echt, aber nicht fachlich geprüft** — die Zahlen stimmen mit der
 *   Quelle überein, die Rechen- oder Auslegungsregeln hat niemand
 *   abgenommen,
 * - **synthetisch** — erfunden, ausdrücklich als solches gekennzeichnet.
 */
import { isFeatureEnabled, type MarketConfig } from '../../domain/market.ts';
import { COST_CONFIG } from '../costs/engine.ts';
import { futterDatenArt } from '../food/catalog.ts';
import { attributPruefung } from '../care/attributes.ts';
import { staedteMitKommunalerQuelle, kommunaleFlaechen } from '../map/municipal.ts';
import gebuehren from '../../../data-snapshots/got/got-2022.json' with { type: 'json' };
import orte from '../../../data-snapshots/places/places-de.json' with { type: 'json' };

export interface VorschauBestand {
  /** Echte Bestände mit Zahl und Quelle. */
  readonly echt: readonly string[];
  /** Echt, aber ohne fachliche Abnahme. */
  readonly ungeprueft: readonly string[];
  /** Erfundene Bestände. */
  readonly synthetisch: readonly string[];
}

function zahl(wert: number): string {
  return wert.toLocaleString('de-DE');
}

export function vorschauBestand(market: MarketConfig): VorschauBestand {
  const echt: string[] = [];
  const ungeprueft: string[] = [];
  const synthetisch: string[] = [];

  if (isFeatureEnabled(market, 'costs')) {
    const anzahl = (gebuehren as { itemCount: number }).itemCount;
    const satz = `${zahl(anzahl)} Positionen der amtlichen Gebührenordnung (GOT 2022)`;
    if (COST_CONFIG.clinicalReview === 'approved') echt.push(satz);
    else ungeprueft.push(`${satz} — die Rechenannahmen sind fachlich nicht abgenommen`);
  }

  if (isFeatureEnabled(market, 'map')) {
    const anzahl = (orte as { places: unknown[] }).places.length;
    echt.push(`${zahl(anzahl)} Orte aus OpenStreetMap`);
    const flaechen = staedteMitKommunalerQuelle().reduce(
      (summe, stadt) => summe + (kommunaleFlaechen(stadt)?.flaechen.length ?? 0),
      0,
    );
    if (flaechen > 0) {
      echt.push(`${zahl(flaechen)} kommunal ausgewiesene Hundeflächen aus amtlichen Diensten`);
    }
  }

  if (isFeatureEnabled(market, 'travel')) {
    ungeprueft.push(
      'Reiseregeln mit Fundstelle aus der Delegierten Verordnung (EU) 2026/131 — fachlich nicht freigegeben',
    );
  }

  if (isFeatureEnabled(market, 'food') && futterDatenArt() === 'synthetic') {
    synthetisch.push('Futterprodukte');
  }
  const attribute = attributPruefung().dataKind;
  const produktseiten = isFeatureEnabled(market, 'care') || isFeatureEnabled(market, 'toys');
  if (produktseiten && attribute === 'synthetic') {
    synthetisch.push('Produkteigenschaften für Pflege und Spielzeug');
  }
  if (isFeatureEnabled(market, 'commerce')) {
    synthetisch.push('Angebote mit Preisen');
  }

  return { echt, ungeprueft, synthetisch };
}

/** Aufzählung mit „und" vor dem letzten Glied. */
export function aufzaehlung(teile: readonly string[]): string {
  if (teile.length === 0) return '';
  if (teile.length === 1) return teile[0] ?? '';
  return `${teile.slice(0, -1).join(', ')} und ${teile[teile.length - 1]}`;
}
