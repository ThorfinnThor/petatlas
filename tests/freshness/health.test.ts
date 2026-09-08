// M17-04 — Der öffentliche Gesundheitsstand mit eingefrorener Zeit.
import { describe, expect, it } from 'vitest';

import {
  bewerteDatensaetze,
  datensaetze,
  gesamtstand,
  type Datensatz,
} from '../../src/features/freshness/datasets.ts';
import { baueHealthBericht } from '../../src/features/freshness/health.ts';

const HEUTE = '2026-09-08';

function datensatz(ueberschreibung: Partial<Datensatz> = {}): Datensatz {
  return {
    id: 'test-satz',
    titel: 'Testdatensatz',
    quelle: 'Testquelle',
    lizenz: null,
    politik: { warnAbTagen: 30, sperreAbTagen: 90 },
    wirkung: 'sperrt',
    begruendungPolitik: 'Weil dieser Test es so festlegt.',
    stand: '2026-09-01',
    umfang: '1 Eintrag',
    hinweis: null,
    ausgeliefert: true,
    ...ueberschreibung,
  };
}

describe('Bewertung der Datensätze', () => {
  it('sperrt bei einem veralteten Datensatz mit Wirkung „sperrt“', () => {
    const [eintrag] = bewerteDatensaetze(HEUTE, [datensatz({ stand: '2026-01-01' })]);
    expect(eintrag?.bewertung.frische).toBe('veraltet');
    expect(eintrag?.sperrt).toBe(true);
  });

  it('sperrt nicht bei einem veralteten Datensatz mit Wirkung „warnt“', () => {
    const [eintrag] = bewerteDatensaetze(HEUTE, [
      datensatz({ stand: '2026-01-01', wirkung: 'warnt' }),
    ]);
    expect(eintrag?.bewertung.frische).toBe('veraltet');
    expect(eintrag?.sperrt).toBe(false);
  });

  it('sperrt bei unbekanntem Stand, nicht nur bei altem', () => {
    const [eintrag] = bewerteDatensaetze(HEUTE, [datensatz({ stand: null })]);
    expect(eintrag?.sperrt).toBe(true);
  });

  it('lässt einen bewusst nicht ausgelieferten Datensatz nichts sperren', () => {
    const [eintrag] = bewerteDatensaetze(HEUTE, [datensatz({ stand: null, ausgeliefert: false })]);
    expect(eintrag?.sperrt).toBe(false);
  });
});

describe('Gesamtstand', () => {
  it('nimmt den schlechtesten ausgelieferten Datensatz', () => {
    const bewertet = bewerteDatensaetze(HEUTE, [
      datensatz({ id: 'a', stand: '2026-09-07', wirkung: 'warnt' }),
      datensatz({ id: 'b', stand: '2026-07-01', wirkung: 'warnt' }),
    ]);
    expect(gesamtstand(bewertet).frische).toBe('alternd');
  });

  it('zählt einen nicht ausgelieferten Datensatz nicht mit', () => {
    const bewertet = bewerteDatensaetze(HEUTE, [
      datensatz({ id: 'a', stand: '2026-09-07', wirkung: 'warnt' }),
      datensatz({ id: 'b', stand: null, ausgeliefert: false }),
    ]);
    expect(gesamtstand(bewertet).frische).toBe('frisch');
    expect(gesamtstand(bewertet).gesperrt).toEqual([]);
  });

  it('benennt die sperrenden Datensätze', () => {
    const bewertet = bewerteDatensaetze(HEUTE, [
      datensatz({ id: 'regeln', stand: null }),
      datensatz({ id: 'orte', stand: '2026-09-07', wirkung: 'warnt' }),
    ]);
    expect(gesamtstand(bewertet).gesperrt).toEqual(['regeln']);
    expect(gesamtstand(bewertet).begruendung).toContain('regeln');
  });
});

describe('Die echten Datensätze', () => {
  const echte = datensaetze();

  it('sind vollständig beschrieben', () => {
    expect(echte.length).toBeGreaterThan(0);
    for (const eintrag of echte) {
      expect(eintrag.begruendungPolitik.length).toBeGreaterThan(10);
      expect(eintrag.politik.sperreAbTagen).toBeGreaterThanOrEqual(eintrag.politik.warnAbTagen);
      expect(eintrag.umfang.length).toBeGreaterThan(0);
    }
  });

  it('halten die Reiseregeln ohne Freigabe für gesperrt', () => {
    const bewertet = bewerteDatensaetze(HEUTE, echte);
    const regeln = bewertet.find((eintrag) => eintrag.id === 'reiseregeln-eu-intra-2026');
    expect(regeln?.sperrt).toBe(true);
    expect(regeln?.hinweis).toContain('keine fachliche Freigabe');
  });

  it('melden die Angebote als nicht ausgeliefert statt als Ausfall', () => {
    const angebote = echte.find((eintrag) => eintrag.id === 'angebote');
    expect(angebote?.ausgeliefert).toBe(false);
    expect(angebote?.hinweis).toContain('Normalzustand');
  });
});

describe('Öffentlicher Bericht', () => {
  const bericht = baueHealthBericht(HEUTE, '2026-09-08T09:00:00.000Z', [
    datensatz({ id: 'a', stand: '2026-09-07', wirkung: 'warnt' }),
    datensatz({ id: 'b', stand: null }),
  ]);

  it('nennt Bauzeitpunkt und Stichtag', () => {
    expect(bericht.builtAt).toBe('2026-09-08T09:00:00.000Z');
    expect(bericht.stichtag).toBe(HEUTE);
  });

  it('nennt je Datensatz Stand, Alter und Bewertung', () => {
    const a = bericht.datensaetze.find((eintrag) => eintrag.id === 'a');
    expect(a?.alterTage).toBe(1);
    expect(a?.frische).toBe('frisch');
    expect(a?.begruendung).toContain('Warnschwelle');
  });

  it('enthält keine Abrufadressen oder Secretnamen', () => {
    const text = JSON.stringify(baueHealthBericht(HEUTE, '2026-09-08T09:00:00.000Z'));
    expect(text).not.toMatch(/https?:\/\//);
    expect(text).not.toContain('SECRET');
    expect(text).not.toContain('TOKEN');
  });

  it('sagt im Gesamtstand, was gesperrt ist', () => {
    expect(bericht.gesamt.gesperrt).toEqual(['b']);
  });
});
