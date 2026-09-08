// M18-05 — Rechtliche Pflichten werden aufgezählt, nicht behauptet.
import { describe, expect, it } from 'vitest';

import { PFLICHTANGABEN, offenePflichten, werbeStand } from '../config/legal.ts';
import launch from '../config/launch.json' with { type: 'json' };

describe('Pflichtangaben', () => {
  it('nennt zu jeder Pflicht Grundlage, Ort, Zuständigkeit und Bemerkung', () => {
    expect(PFLICHTANGABEN.length).toBeGreaterThan(0);
    for (const eintrag of PFLICHTANGABEN) {
      expect(eintrag.grundlage.length, eintrag.id).toBeGreaterThan(5);
      expect(eintrag.ort.length, eintrag.id).toBeGreaterThan(0);
      expect(eintrag.zustaendig.length, eintrag.id).toBeGreaterThan(0);
      expect(eintrag.bemerkung.length, eintrag.id).toBeGreaterThan(30);
    }
  });

  it('hat eindeutige Kennungen', () => {
    const ids = PFLICHTANGABEN.map((eintrag) => eintrag.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('führt Impressum und Datenschutzerklärung als offen', () => {
    const offen = offenePflichten().map((eintrag) => eintrag.id);
    expect(offen).toContain('impressum');
    expect(offen).toContain('datenschutzerklaerung');
  });

  it('erklärt die Barrierefreiheitserklärung ausdrücklich als offen', () => {
    const eintrag = PFLICHTANGABEN.find((p) => p.id === 'barrierefreiheitserklaerung');
    expect(eintrag?.status).toBe('offen');
    // Bestandene Messungen sind keine Erklärung.
    expect(eintrag?.bemerkung).toContain('Bewertung');
  });
});

describe('Werbung und Tracking', () => {
  it('leitet den Stand aus den Launch-Gates ab, statt ihn zu behaupten', () => {
    const stand = werbeStand();
    const gates = launch.gates as Record<string, { approved: boolean }>;
    expect(stand.anzeigenAktiv).toBe(
      (gates.commerceAffiliate?.approved ?? false) || (gates.insuranceAffiliate?.approved ?? false),
    );
    expect(stand.trackingAktiv).toBe(gates.adsTracking?.approved ?? false);
  });

  it('meldet für den heutigen Stand: nichts an', () => {
    const stand = werbeStand();
    expect(stand.anzeigenAktiv).toBe(false);
    expect(stand.trackingAktiv).toBe(false);
    expect(stand.cookiesGesetzt).toBe(false);
    expect(stand.begruendung).toContain('Kein Partnerprogramm freigegeben');
  });
});
