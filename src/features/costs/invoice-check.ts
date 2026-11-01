/**
 * Plausibilitätsprüfung einer Tierarztrechnung nach GOT.
 *
 * Anders als der Rechner (`engine.ts`) lehnt diese Prüfung ungewöhnliche
 * Eingaben nicht ab, sondern beschreibt sie: Ein Faktor über dem Dreifachen
 * ist auf einer echten Rechnung möglich, wenn er vorher in Textform vereinbart
 * wurde (§ 5 Abs. 1 GOT). Die Prüfung sagt deshalb nie „falsch“, sondern
 * „prüfen“ und nennt die Regel. Sie ist keine Rechtsberatung.
 */
import type { FeeItem } from '../../domain/schemas/index.ts';
import { money, multiplyByFactor, multiplyByQuantity, type Money } from '../../domain/money.ts';
import { COST_CONFIG, factorRange, type CostConfig, type TreatmentContext } from './engine.ts';

export interface RechnungsZeile {
  readonly nummer: string;
  readonly faktor: number;
  readonly menge: number;
  /** Nettobetrag dieser Zeile laut Rechnung in Cent, wenn angegeben. */
  readonly betragLautRechnungMinor?: number | null;
}

export interface Pruefanfrage {
  readonly kontext: TreatmentContext;
  readonly tierart: 'dog' | 'cat' | null;
  readonly zeilen: readonly RechnungsZeile[];
  /** Wie oft die Notdienstgebühr auf der Rechnung steht. */
  readonly notdienstgebuehren: number;
}

export type Stufe = 'ok' | 'hinweis' | 'pruefen';

export interface Befund {
  readonly stufe: Stufe;
  readonly text: string;
}

export interface GepruefteZeile {
  readonly nummer: string;
  readonly bezeichnung: string | null;
  readonly faktor: number;
  readonly menge: number;
  readonly grundbetrag: Money | null;
  readonly sollNetto: Money | null;
  readonly befunde: readonly Befund[];
}

export interface Pruefergebnis {
  readonly zeilen: readonly GepruefteZeile[];
  readonly befunde: readonly Befund[];
}

/** Tierarten, die in einer Leistungsbezeichnung auf eine andere Tierart als Hund oder Katze deuten. */
const ANDERE_TIERART =
  /\b(Pferd|Hausequiden|Kameliden|Rind|Kuh|Kalb|Bulle|Schwein|Sau|Ferkel|Läufer|Eber|Hauswiederkäuer|Lamm|Nutzgeflügel|Geflügel|Großpsittaciden|Fische|Reptilien|Amphibien|Stute|Hengst)\b/;
const HUND_ODER_KATZE = /\b(Hund|Katze|Kater|Kätzin|Hündin|Rüde|Klein- und Heimtiere)\b/;

function zahlText(wert: number): string {
  return wert.toLocaleString('de-DE', { maximumFractionDigits: 2 });
}

export function pruefeRechnung(
  anfrage: Pruefanfrage,
  katalog: readonly FeeItem[],
  config: CostConfig = COST_CONFIG,
): Pruefergebnis {
  const nachNummer = new Map(katalog.map((item) => [item.officialItemId, item]));
  const rahmen = factorRange(anfrage.kontext, config);
  const zeilen: GepruefteZeile[] = [];

  for (const zeile of anfrage.zeilen) {
    const nummer = zeile.nummer.trim();
    const item = nachNummer.get(nummer);
    const befunde: Befund[] = [];
    if (item === undefined) {
      zeilen.push({
        nummer,
        bezeichnung: null,
        faktor: zeile.faktor,
        menge: zeile.menge,
        grundbetrag: null,
        sollNetto: null,
        befunde: [
          {
            stufe: 'pruefen',
            text: `Nr. ${nummer} steht nicht im Gebührenverzeichnis der GOT 2022. Prüf die Nummer auf der Rechnung; Medikamente und Material haben keine GOT-Nummer.`,
          },
        ],
      });
      continue;
    }

    if (zeile.faktor > rahmen.max) {
      befunde.push({
        stufe: 'pruefen',
        text:
          anfrage.kontext === 'emergency'
            ? `Faktor ${zahlText(zeile.faktor)} liegt über dem Vierfachen. Im Notdienst reicht der Rahmen bis zum Vierfachen (§ 4 GOT); mehr ist nur zulässig, wenn es vorher in Textform vereinbart wurde (§ 5 Abs. 1 GOT).`
            : `Faktor ${zahlText(zeile.faktor)} liegt über dem Dreifachen. Das ist nur zulässig, wenn es vor der Behandlung in Textform vereinbart wurde (§ 5 Abs. 1 GOT). Im Notdienst gilt bis zum Vierfachen.`,
      });
    } else if (zeile.faktor < rahmen.min) {
      befunde.push({
        stufe: anfrage.kontext === 'emergency' ? 'hinweis' : 'pruefen',
        text:
          anfrage.kontext === 'emergency'
            ? `Faktor ${zahlText(zeile.faktor)} liegt unter dem Zweifachen. Im Notdienst beginnt der Rahmen beim Zweifachen (§ 4 GOT); vielleicht wurde diese Leistung nicht im Notdienst erbracht.`
            : `Faktor ${zahlText(zeile.faktor)} liegt unter dem einfachen Satz. Eine Unterschreitung muss vorher in Textform vereinbart sein (§ 5 Abs. 1 GOT).`,
      });
    }

    if (
      anfrage.tierart !== null &&
      ANDERE_TIERART.test(item.originalLabel) &&
      !HUND_ODER_KATZE.test(item.originalLabel)
    ) {
      befunde.push({
        stufe: 'pruefen',
        text: `Die Bezeichnung von Nr. ${nummer} nennt eine andere Tierart („${item.originalLabel}“). Für Hund und Katze gibt es oft eine eigene Nummer.`,
      });
    }

    const grundbetrag = money(item.baseAmountMinor, item.currency);
    const sollNetto = multiplyByQuantity(multiplyByFactor(grundbetrag, zeile.faktor), zeile.menge);
    const laut = zeile.betragLautRechnungMinor;
    if (laut !== undefined && laut !== null) {
      const abweichung = laut - sollNetto.amountMinor;
      if (Math.abs(abweichung) > 2) {
        befunde.push({
          stufe: 'hinweis',
          text: `Der Betrag auf der Rechnung weicht um ${(abweichung / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })} vom Grundbetrag × Faktor × Menge ab. Mögliche Gründe: ein anderer Faktor, ein Betrag mit Umsatzsteuer oder Material in derselben Zeile.`,
        });
      }
    }

    if (befunde.length === 0)
      befunde.push({ stufe: 'ok', text: 'Nummer und Faktor passen zum Gebührenverzeichnis.' });
    zeilen.push({
      nummer,
      bezeichnung: item.originalLabel,
      faktor: zeile.faktor,
      menge: zeile.menge,
      grundbetrag,
      sollNetto,
      befunde,
    });
  }

  const befunde: Befund[] = [];
  const nummern = anfrage.zeilen.map((zeile) => zeile.nummer.trim());
  const doppelt = [
    ...new Set(nummern.filter((nummer, index) => nummern.indexOf(nummer) !== index)),
  ];
  for (const nummer of doppelt) {
    befunde.push({
      stufe: 'hinweis',
      text: `Nr. ${nummer} steht mehrmals auf der Rechnung. Das ist richtig, wenn die Leistung mehrmals erbracht wurde, etwa zwei Röntgenaufnahmen. Dieselbe Leistung darf aber nicht doppelt berechnet werden (§ 6 GOT).`,
    });
  }
  if (anfrage.notdienstgebuehren > 1) {
    befunde.push({
      stufe: 'pruefen',
      text: `Die Notdienstgebühr steht ${anfrage.notdienstgebuehren}-mal auf der Rechnung. In der gleichen Angelegenheit darf sie nur einmal erhoben werden, auch bei mehreren Tieren (§ 4 Abs. 2 GOT).`,
    });
  }
  if (anfrage.notdienstgebuehren > 0 && anfrage.kontext !== 'emergency') {
    befunde.push({
      stufe: 'pruefen',
      text: 'Auf der Rechnung steht eine Notdienstgebühr, du hast aber keinen Notdienst angegeben. Sie gilt nur für Leistungen im tierärztlichen Notdienst nachts (18 bis 8 Uhr), am Wochenende (Freitag 18 Uhr bis Montag 8 Uhr) oder an Feiertagen (§ 2 Abs. 2, § 4 GOT).',
    });
  }
  if (anfrage.kontext === 'emergency' && anfrage.notdienstgebuehren === 0) {
    befunde.push({
      stufe: 'hinweis',
      text: 'Im Notdienst darf die Praxis zusätzlich eine Notdienstgebühr von 50 Euro netto berechnen; sie kann im begründeten Einzelfall darauf verzichten (§ 4 Abs. 3 GOT).',
    });
  }

  return { zeilen, befunde };
}
