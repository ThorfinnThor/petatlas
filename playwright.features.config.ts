/**
 * M08-04 — End-to-End für Funktionen, die noch hinter ihrem Feature Flag
 * liegen.
 *
 * Eigene Konfiguration, weil der reguläre Lauf ausdrücklich prüft, dass eine
 * abgeschaltete Funktion **keine** Seite hat. Beide Aussagen sind wichtig
 * und schließen sich in einem einzigen Build aus.
 *
 * `ENABLE_FEATURES` wirkt nur in `development` (siehe config/build.ts).
 */
import { defineConfig, devices } from '@playwright/test';

const PORT = 4322;

export default defineConfig({
  testDir: 'tests/e2e-features',
  fullyParallel: true,
  retries: 0,
  reporter: [['list']],
  outputDir: 'reports/playwright-features',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run build:site && npx astro preview --port ${PORT} --ignore-lock`,
    env: {
      ASTRO_PREVIEW_BACKGROUND: 'false',
      ENABLE_FEATURES: 'costs,map,travel,commerce,care,toys',
    },
    port: PORT,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
