/**
 * M09-04 — Zugang zu den redaktionellen Hinweistexten.
 *
 * Die Texte liegen in `content-data/insurance-disclosures/` und werden hier
 * einmal validiert. Ein ungültiger Text bricht den Build ab, statt still zu
 * fehlen: ein fehlender Verbraucherhinweis ist schlimmer als eine rote
 * Fehlermeldung.
 */
import keineBeratung from '../../../content-data/insurance-disclosures/keine-beratung.json' with { type: 'json' };
import keinVergleich from '../../../content-data/insurance-disclosures/kein-vergleich.json' with { type: 'json' };
import keineTarifdaten from '../../../content-data/insurance-disclosures/keine-tarifdaten.json' with { type: 'json' };
import keineErstattung from '../../../content-data/insurance-disclosures/keine-erstattungszusage.json' with { type: 'json' };
import keinNotfallverkauf from '../../../content-data/insurance-disclosures/kein-notfallverkauf.json' with { type: 'json' };
import {
  InsuranceDisclosureSchema,
  type InsuranceDisclosure,
} from '../../domain/schemas/disclosure.ts';
import type { PartnerPlacement } from '../../domain/schemas/partner.ts';

function lade(roh: unknown): InsuranceDisclosure {
  const ergebnis = InsuranceDisclosureSchema.safeParse(roh);
  if (!ergebnis.success) {
    const id =
      typeof roh === 'object' && roh !== null && 'disclosureId' in roh
        ? String(roh.disclosureId)
        : '?';
    throw new Error(`Hinweistext ${id} ist ungültig: ${ergebnis.error.message}`);
  }
  return ergebnis.data;
}

const TEXTE: readonly InsuranceDisclosure[] = [
  keineBeratung,
  keinVergleich,
  keineTarifdaten,
  keineErstattung,
  keinNotfallverkauf,
]
  .map(lade)
  .sort((a, b) => a.order - b.order || (a.disclosureId < b.disclosureId ? -1 : 1));

export function insuranceDisclosures(): readonly InsuranceDisclosure[] {
  return TEXTE;
}

/**
 * Die Hinweise, die an dieser Stelle erscheinen müssen.
 *
 * Ohne Partner bleiben genau die Texte übrig, die auch ohne Partner gelten —
 * und das sind die eigentlichen Verbraucherhinweise.
 */
export function disclosuresFor(
  placement: PartnerPlacement,
  mitPartner: boolean,
): readonly InsuranceDisclosure[] {
  return TEXTE.filter((text) => mitPartner || text.appliesWithoutPartner).filter(
    (text) => text.placements.length === 0 || text.placements.includes(placement),
  );
}
