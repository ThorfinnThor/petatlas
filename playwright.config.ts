// M01-03 — End-to-End gegen den statisch gebauten Output, nicht gegen den
// Dev-Server: geprüft wird, was ausgeliefert würde. Ausführung in M01-06.
import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  // Ein grüner Lauf durch Wiederholung ist kein grüner Lauf.
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'reports/playwright', open: 'never' }]],
  outputDir: 'reports/playwright-artifacts',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    // Zweiter Engine-Pfad und mobiles Format laut QUALITY_GATES Abschnitt 10.
    { name: 'webkit-desktop', use: { ...devices['Desktop Safari'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: `npm run build && npx astro preview --port ${PORT}`,
    port: PORT,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
