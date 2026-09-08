/**
 * M15-05 — Anreicherung: abgeschaltet, mit Begründung.
 *
 * Die Anreicherung aus Open Pet Food Facts hängt an zwei Schaltern, und
 * beide stehen auf aus:
 *
 * 1. **Recht.** Der Registryeintrag steht auf `pending`; ohne Freigabe wird
 *    nichts ausgeliefert.
 * 2. **Eignung.** Das Feature Flag `foodEnrichment` ist in jedem Markt aus,
 *    weil die Messung gegen den echten Export ergeben hat, dass die
 *    interessanten Felder fehlen (`docs/OPFF_SPIKE.md`).
 *
 * Ohne Anreicherung fällt der Futterbereich auf Händler- und
 * Herstellerangaben zurück — das ist der Normalfall und kein Notbetrieb.
 */
import { isFeatureEnabled, type MarketConfig } from '../../domain/market.ts';
import type { FoodProduct } from '../../domain/schemas/food.ts';
import { opffAusliefernErlaubt, type OpffEintrag } from '../../../scripts/ingest/adapters/opff.ts';

export interface AnreicherungsStand {
  readonly aktiv: boolean;
  /** Klartext, warum. Auch im aktiven Fall gefüllt. */
  readonly grund: string;
}

export function anreicherungsStand(market: MarketConfig): AnreicherungsStand {
  const recht = opffAusliefernErlaubt();
  if (!recht.erlaubt) {
    return { aktiv: false, grund: `Rechtlich gesperrt: ${recht.grund}` };
  }
  if (!isFeatureEnabled(market, 'foodEnrichment')) {
    return {
      aktiv: false,
      grund:
        'Feature "foodEnrichment" ist aus. Begründung in docs/OPFF_SPIKE.md: die gemessene ' +
        'Abdeckung der Nährwerte trägt den Aufwand und die ODbL-Folgen nicht.',
    };
  }
  return { aktiv: true, grund: 'Recht geprüft und Feature eingeschaltet.' };
}

export type Herkunft = 'label' | 'opff';

export interface AngereichertesFutter {
  readonly produkt: FoodProduct;
  /** Woher Name und Menge stammen. */
  readonly herkunft: Herkunft;
  readonly hinweis: string;
}

/**
 * Reicht ein Futterprodukt an — oder eben nicht.
 *
 * Der Rückfall ist kein Fehlerpfad: die Etikettangaben aus Händler- und
 * Herstellerdaten sind die Hauptquelle, und OPFF wäre nur eine Ergänzung.
 * Ist die Anreicherung aus, bleibt das Produkt unverändert.
 */
export function reichereAn(
  produkt: FoodProduct,
  market: MarketConfig,
  opff: readonly OpffEintrag[] = [],
): AngereichertesFutter {
  const stand = anreicherungsStand(market);
  if (!stand.aktiv) {
    return {
      produkt,
      herkunft: 'label',
      hinweis: `Angaben aus Händler- und Herstellerdaten. ${stand.grund}`,
    };
  }

  const treffer =
    produkt.gtin === null ? undefined : opff.find((eintrag) => eintrag.code === produkt.gtin);
  if (treffer === undefined) {
    return {
      produkt,
      herkunft: 'label',
      hinweis: 'Kein Eintrag mit dieser Nummer im offenen Datensatz; Angaben bleiben unverändert.',
    };
  }

  // Ergänzt wird nur, was fehlt. Eine vorhandene Etikettangabe wird nicht
  // durch eine Fremdangabe ersetzt: sie ist näher an der Packung.
  return {
    produkt: {
      ...produkt,
      productName: produkt.productName !== '' ? produkt.productName : (treffer.productName ?? ''),
      brand: produkt.brand !== '' ? produkt.brand : (treffer.brand ?? ''),
    },
    herkunft: 'opff',
    hinweis:
      'Ergänzt aus Open Pet Food Facts (ODbL). Vorhandene Etikettangaben bleiben unverändert; ' +
      'Nährwerte werden von dort nicht übernommen.',
  };
}
