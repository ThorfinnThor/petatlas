// M17-06 — Grenzen sind erklärte Entscheidungen. Der Test prüft, dass sie
// greifen und dass „nicht gemessen“ nicht als „eingehalten“ durchgeht.
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  BUDGETS,
  alsText,
  bewerteBudget,
  dateien,
  groessteDatei,
  miss,
  verzeichnisMiB,
  type Budget,
} from '../../scripts/checks/budgets.ts';

const BUDGET: Budget = {
  id: 'test',
  titel: 'Testbudget',
  einheit: 'Stück',
  warnAb: 10,
  stoppAb: 20,
  begruendung: 'Weil dieser Test es so festlegt.',
};

describe('Bewertung eines Budgets', () => {
  it('meldet unter der Warnschwelle ok', () => {
    expect(bewerteBudget(BUDGET, 9).befund).toBe('ok');
  });

  it('warnt ab der Warnschwelle', () => {
    expect(bewerteBudget(BUDGET, 10).befund).toBe('warnung');
    expect(bewerteBudget(BUDGET, 19).befund).toBe('warnung');
  });

  it('stoppt ab der Stoppschwelle', () => {
    expect(bewerteBudget(BUDGET, 20).befund).toBe('stopp');
  });

  it('hält „nicht gemessen“ nicht für eingehalten', () => {
    const messung = bewerteBudget(BUDGET, null, 'Kein Build vorhanden.');
    expect(messung.befund).toBe('ungemessen');
    expect(messung.meldung).toContain('Nicht gemessen');
  });
});

describe('Die echten Budgets', () => {
  it('sind vollständig und plausibel geordnet', () => {
    expect(BUDGETS.length).toBeGreaterThan(0);
    for (const budget of BUDGETS) {
      expect(budget.stoppAb).toBeGreaterThan(budget.warnAb);
      expect(budget.begruendung.length).toBeGreaterThan(20);
    }
  });

  it('nennt die Plattformgrenzen als Begründung, nicht als Zusage', () => {
    const dateiBudget = BUDGETS.find((budget) => budget.id === 'dateien-ausgeliefert');
    expect(dateiBudget?.stoppAb).toBeLessThan(20000);
  });
});

describe('Messen', () => {
  const wurzel = mkdtempSync(join(tmpdir(), 'budget-'));

  it('zählt Dateien rekursiv', () => {
    mkdirSync(join(wurzel, 'dist', 'tief'), { recursive: true });
    writeFileSync(join(wurzel, 'dist', 'a.txt'), 'a');
    writeFileSync(join(wurzel, 'dist', 'tief', 'b.txt'), 'bb');
    expect(dateien(join(wurzel, 'dist')).length).toBe(2);
    expect(groessteDatei(dateien(join(wurzel, 'dist')))?.bytes).toBe(2);
  });

  it('meldet ein fehlendes Verzeichnis als nicht gemessen', () => {
    expect(verzeichnisMiB(join(wurzel, 'gibt-es-nicht'))).toBeNull();
    expect(dateien(join(wurzel, 'gibt-es-nicht'))).toEqual([]);
  });

  it('sagt bei fehlendem Build, was zu tun ist, statt ok zu melden', () => {
    const leer = mkdtempSync(join(tmpdir(), 'budget-leer-'));
    const messungen = miss(leer);
    const dateiMessung = messungen.find((messung) => messung.id === 'dateien-ausgeliefert');
    expect(dateiMessung?.befund).toBe('ungemessen');
    expect(alsText(messungen)).toContain('build:site');
  });
});
