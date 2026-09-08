/**
 * M18-03 — Was ein Browser beim ersten Aufruf wirklich lädt.
 *
 * Gemessen wird am gebauten Output über einen lokalen Server. Die Zahlen
 * sind damit **Bytes und Knoten**, keine Nutzererfahrung: kein Netz, keine
 * echten Geräte, kein Lighthouse-Score. Was daraus folgt und was nicht,
 * steht in `docs/PERFORMANCE.md`.
 *
 * Die Schwellen stehen in `config/budgets.json` mit Begründung.
 */
import { mkdirSync, writeFileSync } from 'node:fs';

import { expect, test, type Page, type Response } from '@playwright/test';

import budgets from '../../config/budgets.json' with { type: 'json' };

interface Budget {
  readonly id: string;
  readonly warnAb: number;
  readonly stoppAb: number;
}

function budget(id: string): Budget {
  const eintrag = (budgets.budgets as Budget[]).find((kandidat) => kandidat.id === id);
  if (eintrag === undefined) throw new Error(`Unbekanntes Budget: ${id}`);
  return eintrag;
}

const SEITEN = [
  { pfad: '/de-de/', name: 'Start' },
  { pfad: '/de-de/tierarztkosten/', name: 'Kostenrechner' },
  { pfad: '/de-de/tierarzt-karte/', name: 'Karte' },
  { pfad: '/de-de/reisecheck/', name: 'Reisecheck' },
  { pfad: '/de-de/futter/', name: 'Futter' },
];

interface Messung {
  readonly seite: string;
  readonly pfad: string;
  readonly geraet: string;
  readonly jsKiB: number;
  readonly gesamtKiB: number;
  readonly domKnoten: number;
  readonly lcpMs: number | null;
  readonly anfragen: number;
}

const ergebnisse: Messung[] = [];

/** Bytes einer Antwort. `content-length` fehlt manchmal; dann zählt der Körper. */
async function bytes(antwort: Response): Promise<number> {
  const kopf = antwort.headers()['content-length'];
  if (kopf !== undefined && kopf !== '') return Number(kopf);
  try {
    return (await antwort.body()).byteLength;
  } catch {
    return 0;
  }
}

/**
 * Largest Contentful Paint, wie ihn der Browser selbst meldet.
 *
 * Auf einem lokalen Server ohne Netzverzögerung ist das eine **untere
 * Schranke**, kein Feldwert. Er wird deshalb berichtet, aber gegen kein
 * Budget geprüft: eine Grenze auf einer nicht vergleichbaren Messung wäre
 * eine erfundene Zusage.
 */
async function lcp(page: Page): Promise<number | null> {
  return page.evaluate<number | null>(() => {
    return new Promise<number | null>((fertig) => {
      const beobachter = new PerformanceObserver((liste) => {
        const eintraege = liste.getEntries();
        const letzter = eintraege.at(-1);
        if (letzter !== undefined) fertig(letzter.startTime);
      });
      try {
        beobachter.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        fertig(null);
        return;
      }
      setTimeout(() => fertig(null), 3000);
    });
  });
}

for (const seite of SEITEN) {
  test(`${seite.name}: Seitenbudget`, async ({ page }, testInfo) => {
    let jsBytes = 0;
    let gesamtBytes = 0;
    let anfragen = 0;

    page.on('response', (antwort) => {
      void (async () => {
        const typ = antwort.headers()['content-type'] ?? '';
        // Datenchunks kommen erst auf Anforderung und gehören nicht zum
        // ersten Laden; sie werden getrennt betrachtet.
        if (new URL(antwort.url()).pathname.startsWith('/data/')) return;
        const groesse = await bytes(antwort);
        anfragen += 1;
        gesamtBytes += groesse;
        if (typ.includes('javascript')) jsBytes += groesse;
      })();
    });

    await page.goto(seite.pfad, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle');

    const domKnoten = await page.evaluate(() => document.getElementsByTagName('*').length);
    const gemessenerLcp = await lcp(page);

    const messung: Messung = {
      seite: seite.name,
      pfad: seite.pfad,
      geraet: testInfo.project.name,
      jsKiB: Number((jsBytes / 1024).toFixed(1)),
      gesamtKiB: Number((gesamtBytes / 1024).toFixed(1)),
      domKnoten,
      lcpMs: gemessenerLcp === null ? null : Math.round(gemessenerLcp),
      anfragen,
    };
    ergebnisse.push(messung);
    // Die Zahl steht im Protokoll, nicht nur in einer Zusicherung. Eine
    // Messung, die man nur als „bestanden“ sieht, ist keine Messung.
    testInfo.annotations.push({ type: 'messung', description: JSON.stringify(messung) });
    process.stdout.write(`${JSON.stringify(messung)}\n`);

    expect(messung.jsKiB, `${seite.name}: JavaScript`).toBeLessThan(budget('js-initial').stoppAb);
    expect(messung.gesamtKiB, `${seite.name}: Gesamtgröße`).toBeLessThan(
      budget('seite-gesamt').stoppAb,
    );
    expect(messung.domKnoten, `${seite.name}: DOM-Knoten`).toBeLessThan(
      budget('dom-knoten').stoppAb,
    );
  });
}

test('Die Karte lädt ihre Kacheln erst, wenn sie gebraucht werden', async ({ page }) => {
  const kachelanfragen: string[] = [];
  page.on('request', (anfrage) => {
    if (anfrage.url().includes('tile.openstreetmap.org')) kachelanfragen.push(anfrage.url());
  });

  await page.goto('/de-de/tierarzt-karte/', { waitUntil: 'load' });
  await page.waitForLoadState('networkidle');

  // Ohne Zustimmung wird keine einzige Kachel geholt. Das ist zugleich eine
  // Datenschutzaussage: der Kacheldienst sieht die IP-Adresse erst danach.
  expect(kachelanfragen).toEqual([]);
});

test.afterAll(async () => {
  if (ergebnisse.length === 0) return;
  mkdirSync('reports', { recursive: true });
  writeFileSync(
    `reports/performance-${ergebnisse[0]?.geraet ?? 'unbekannt'}.json`,
    `${JSON.stringify(ergebnisse, null, 2)}\n`,
    'utf8',
  );
});
