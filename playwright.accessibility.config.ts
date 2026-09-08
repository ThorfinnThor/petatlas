/**
 * M18-04 — Zugänglichkeit und Browsermatrix.
 *
 * Eigene Konfiguration mit **allen** Funktionen: eine Seite, die es hinter
 * ihrem Feature Flag noch nicht gibt, lässt sich auch nicht auf Bedienbarkeit
 * prüfen. Zwei Engines (Chromium und WebKit) und ein mobiles Format, wie
 * QUALITY_GATES Abschnitt 10 es verlangt.
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = 4324;

export default defineConfig({
  testDir: 'tests/accessibility',
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'reports/accessibility.json' }]],
  outputDir: 'reports/playwright-accessibility',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'off',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run build:site && npx astro preview --port ${PORT} --ignore-lock`,
    env: {
      ASTRO_PREVIEW_BACKGROUND: 'false',
      ENABLE_FEATURES: 'costs,map,travel,commerce,care,toys,food,profile',
    },
    port: PORT,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
