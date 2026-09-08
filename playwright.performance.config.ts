/**
 * M18-03 — Messung, kein Test im üblichen Sinn.
 *
 * Eigene Konfiguration, weil hier **alle** Funktionen eingeschaltet sind und
 * die Messung nur in Chromium sinnvoll ist: `PerformanceObserver` mit
 * `largest-contentful-paint` gibt es in WebKit nicht.
 *
 * Gemessen wird gegen den gebauten Output über einen lokalen Server. Das ist
 * ausdrücklich **keine** Felddatenmessung: keine echten Geräte, keine echten
 * Netze, kein Lighthouse-Score. Was das bedeutet, steht in
 * `docs/PERFORMANCE.md`.
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = 4323;

export default defineConfig({
  testDir: 'tests/performance',
  // Nacheinander: parallele Läufe verfälschen jede Zeitmessung.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  outputDir: 'reports/playwright-performance',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'off',
    screenshot: 'off',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
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
