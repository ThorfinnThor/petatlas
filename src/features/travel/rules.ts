/**
 * M12-03 — Aus dem Regelsatz werden Einzelregeln.
 *
 * Die EU-Anforderungen gelten für alle Mitgliedstaaten gleich. Sie stehen
 * deshalb einmal in `content-data/travel/rules/` und werden hier
 * deterministisch auf Ziel und Tierart ausgerollt — statt sie 24-mal
 * abzuschreiben.
 *
 * Die erzeugten Regeln sind **nicht freigegeben**: `reviewedAt` und
 * `reviewedBy` bleiben `null`, bis eine fachliche Prüfung sie einträgt
 * (M12-06). Bis dahin wertet die Regelmaschine sie ausdrücklich nicht aus —
 * sie sind vorbereitet, nicht in Kraft.
 */
import euIntra from '../../../content-data/travel/rules/eu-intra-2026.json' with { type: 'json' };
import {
  TravelRuleSchema,
  TravelRuleSetSchema,
  type TravelRule,
  type TravelRuleSet,
} from '../../domain/schemas/travel.ts';

function ladeSatz(roh: unknown): TravelRuleSet {
  const ergebnis = TravelRuleSetSchema.safeParse(roh);
  if (!ergebnis.success) {
    throw new Error(`Regelsatz ist ungültig: ${ergebnis.error.message}`);
  }
  return ergebnis.data;
}

const SAETZE: readonly TravelRuleSet[] = [euIntra].map(ladeSatz);

export function regelSaetze(): readonly TravelRuleSet[] {
  return SAETZE;
}

/**
 * Rollt einen Regelsatz zu Einzelregeln aus: je Herkunft, Ziel, Tierart,
 * Kontext und Anforderung eine. Die Regel-ID ist aus diesen Teilen gebildet
 * und damit stabil und nachvollziehbar.
 */
export function entfalte(satz: TravelRuleSet): readonly TravelRule[] {
  const regeln: TravelRule[] = [];
  for (const origin of satz.origins) {
    for (const destination of satz.destinations) {
      if (destination === origin) continue;
      for (const species of satz.species) {
        for (const context of satz.contexts) {
          for (const anforderung of satz.requirements) {
            regeln.push(
              TravelRuleSchema.parse({
                ruleId:
                  `${satz.ruleSetId}-${anforderung.requirementId}-` +
                  `${origin}-${destination}-${species}`.toLowerCase(),
                requirementId: anforderung.requirementId,
                priority: anforderung.priority,
                originCountry: origin,
                destinationCountry: destination,
                transitCountries: [],
                species,
                context,
                validity: { from: satz.appliesFrom, until: satz.appliesUntil },
                officialSourceUrl: anforderung.officialSourceUrl,
                condition: anforderung.condition,
                guidance: anforderung.guidance,
                // Vorbereitet, nicht freigegeben. Das ist der ganze Punkt.
                reviewedAt: null,
                reviewedBy: null,
              }),
            );
          }
        }
      }
    }
  }
  return regeln.sort((a, b) => (a.ruleId < b.ruleId ? -1 : 1));
}

const REGELN: readonly TravelRule[] = SAETZE.flatMap(entfalte);

/** Alle vorbereiteten Regeln. Freigegeben ist keine davon. */
export function alleRegeln(): readonly TravelRule[] {
  return REGELN;
}

/** Regeln mit fachlicher Freigabe. Derzeit leer — und das ist kein Fehler. */
export function freigegebeneRegeln(): readonly TravelRule[] {
  return REGELN.filter((regel) => regel.reviewedAt !== null && regel.reviewedBy !== null);
}
