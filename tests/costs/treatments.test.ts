import { describe, expect, it } from 'vitest';

import { mayShowTotalEstimate } from '../../src/domain/schemas/costs.ts';
import { positionen } from '../../src/features/costs/detail.ts';
import { getScenario } from '../../src/features/costs/scenarios.ts';
import { BEHANDLUNGEN } from '../../src/features/costs/treatments.ts';

describe('Behandlungsseiten', () => {
  it('beruhen auf vorhandenen Szenarien mit Positionen aus dem Katalog', () => {
    const ids = new Set(positionen().map((p) => p.item.officialItemId));
    for (const seite of BEHANDLUNGEN) {
      const szenario = getScenario(seite.scenarioId);
      expect(szenario, seite.slug).toBeDefined();
      for (const linie of szenario!.lines)
        expect(ids.has(linie.officialItemId), linie.officialItemId).toBe(true);
    }
  });

  it('zeigen ohne fachliche Freigabe keine Gesamtsumme', () => {
    // Die Freigabe trägt eine prüfende Person ein; bis dahin bleibt jede
    // Behandlungsseite ein Entwurf (noindex, nur Einzelpositionen).
    for (const seite of BEHANDLUNGEN) {
      const szenario = getScenario(seite.scenarioId)!;
      if (szenario.clinicalReview !== 'approved')
        expect(mayShowTotalEstimate(szenario)).toBe(false);
    }
  });

  it('haben eindeutige Slugs', () => {
    const slugs = BEHANDLUNGEN.map((b) => b.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
