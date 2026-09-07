/**
 * M11-02 — Kachelkonfiguration.
 *
 * Kacheln sind ein **Darstellungsdienst**, keine Datenquelle: sie werden
 * angezeigt und nicht übernommen. Die Konfiguration steht deshalb getrennt
 * und ist austauschbar.
 *
 * Aus der Nutzungspolitik folgen drei Dinge, die dieser Code einhält:
 * sichtbare Attribution, kein Vorabladen und kein Offlinearchiv.
 */
import konfiguration from '../../../config/tiles.json' with { type: 'json' };

export interface TileKonfiguration {
  readonly provider: string;
  readonly urlTemplate: string;
  readonly attributionHtml: string;
  readonly maxZoom: number;
  readonly minZoom: number;
  readonly policyUrl: string;
  readonly noticeText: string;
  readonly hosts: readonly string[];
}

export const TILES: TileKonfiguration = {
  provider: konfiguration.provider,
  urlTemplate: konfiguration.urlTemplate,
  attributionHtml: konfiguration.attributionHtml,
  maxZoom: konfiguration.maxZoom,
  minZoom: konfiguration.minZoom,
  policyUrl: konfiguration.policyUrl,
  noticeText: konfiguration.noticeText,
  hosts: konfiguration.hosts,
};
