/**
 * M18-04 — Regelprüfung mit axe.
 *
 * axe findet einen Teil der Barrieren, nicht alle. Was es findet, ist
 * belastbar; was es nicht findet, ist deshalb nicht in Ordnung. Die
 * Tastatur- und Zoomprüfungen liegen in `bedienung.spec.ts`, die
 * Beobachtungen von Hand in `docs/ACCESSIBILITY.md`.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const SEITEN = [
  '/de-de/',
  '/de-de/tierarztkosten/',
  '/de-de/tierarzt-karte/',
  '/de-de/reisecheck/',
  '/de-de/futter/',
  '/de-de/pflege/',
  '/de-de/spielzeug/',
  '/de-de/mein-tier/',
  '/de-de/merkliste/',
  '/de-de/quellen/',
  '/de-de/datenstand/',
  '/de-de/methodik/',
  '/de-de/barrierefreiheit/',
  '/de-de/impressum/',
  '/de-de/datenschutz/',
];

for (const pfad of SEITEN) {
  test(`${pfad} hat keine axe-Verstöße`, async ({ page }, testInfo) => {
    await page.goto(pfad);
    const ergebnis = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (ergebnis.violations.length > 0) {
      testInfo.annotations.push({
        type: 'axe',
        description: ergebnis.violations
          .map(
            (verstoss) =>
              `${verstoss.id} (${verstoss.impact}): ${verstoss.help} — ${verstoss.nodes.length} Stelle(n)`,
          )
          .join('\n'),
      });
    }
    expect(
      ergebnis.violations.map((verstoss) => `${verstoss.id}: ${verstoss.help}`),
      pfad,
    ).toEqual([]);
  });
}
