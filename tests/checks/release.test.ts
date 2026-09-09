// M18-06 — Die Prüfung kann nur widersprechen. Genau das wird hier geprüft.
import { describe, expect, it } from 'vitest';

import {
  GATES,
  NACHWEISE,
  freigabestand,
  pruefeGates,
  type Gate,
} from '../../scripts/checks/release.ts';

const ALLES_DA = (): boolean => true;

function gates(ueberschreibung: Record<string, Gate> = {}): Record<string, Gate> {
  return {
    operatorImprint: { approved: false },
    domain: { approved: false },
    dataRights: { approved: false },
    costsRules: { approved: false },
    travelRules: { approved: false },
    insuranceAffiliate: { approved: false },
    commerceAffiliate: { approved: false },
    adsTracking: { approved: false },
    ...ueberschreibung,
  };
}

describe('Freigaben brauchen Person und Datum', () => {
  it('beanstandet ein Häkchen ohne Namen', () => {
    const befund = pruefeGates(
      gates({ costsRules: { approved: true, approvedAt: '2026-09-08' } }),
      ALLES_DA,
    );
    expect(befund.some((eintrag) => eintrag.problem.includes('ohne Person'))).toBe(true);
  });

  it('beanstandet eine Freigabe ohne Datum', () => {
    const befund = pruefeGates(
      gates({ costsRules: { approved: true, approvedBy: 'Prüfende Person' } }),
      ALLES_DA,
    );
    expect(befund.some((eintrag) => eintrag.problem.includes('ohne Datum'))).toBe(true);
  });

  it('lässt eine vollständige Freigabe durch', () => {
    const vollstaendig = gates({
      costsRules: { approved: true, approvedBy: 'Prüfende Person', approvedAt: '2026-09-08' },
    });
    expect(pruefeGates(vollstaendig, ALLES_DA)).toEqual([]);
  });

  it('beanstandet ein Gate ohne hinterlegten Nachweispfad', () => {
    const befund = pruefeGates({ ...gates(), erfundenesGate: { approved: false } }, ALLES_DA);
    expect(befund.some((eintrag) => eintrag.gate === 'erfundenesGate')).toBe(true);
  });

  it('beanstandet einen Nachweis, den es nicht gibt', () => {
    const befund = pruefeGates(gates(), () => false);
    expect(befund.length).toBeGreaterThan(0);
    expect(befund[0]?.problem).toContain('fehlt');
  });
});

describe('Die echten Gates', () => {
  it('haben alle einen benannten Nachweis, den es gibt', () => {
    expect(pruefeGates()).toEqual([]);
  });

  it('sind heute sämtlich offen', () => {
    const stand = freigabestand();
    expect(stand.oeffentlichFreigegeben).toBe(false);
    expect(stand.offeneGates.length).toBe(5);
    expect(stand.begruendung).toContain('Nicht freigabefähig');
  });

  it('nennen zu jedem Gate einen Nachweispfad', () => {
    for (const name of Object.keys(GATES)) {
      expect(NACHWEISE[name], name).toBeDefined();
    }
  });
});

describe('Widersprüche', () => {
  it('erkennt eine öffentliche Freigabe bei offenen Gates', () => {
    const stand = freigabestand(gates(), ALLES_DA);
    // Der Stand selbst ist nicht öffentlich freigegeben; geprüft wird die
    // Logik, die den Widerspruch meldet.
    expect(stand.offeneGates.length).toBeGreaterThan(0);
    expect(stand.oeffentlichFreigegeben).toBe(false);
  });

  it('führt offene Rechtspflichten mit', () => {
    expect(freigabestand().offenePflichten).toContain('impressum');
  });
});
