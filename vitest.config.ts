// M01-03 — Unit- und Integrationstests. Kein Netzzugriff, keine echten
// Credentials: lokale Tests müssen offline reproduzierbar bleiben.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    // End-to-End-Tests laufen unter Playwright, nicht unter Vitest.
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    passWithNoTests: false,
  },
});
