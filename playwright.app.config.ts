import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/app',
  fullyParallel: true,
  workers: 2,
  reporter: [['list']],
  outputDir: 'reports/app',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:4332',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run build:app && npx astro preview --port 4332 --ignore-lock',
    env: { ASTRO_PREVIEW_BACKGROUND: 'false' },
    port: 4332,
    reuseExistingServer: false,
    timeout: 180000,
  },
});
