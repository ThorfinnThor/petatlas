/// <reference types="vitest/config" />
// M01-03 / M21-01 — Unit- und Integrationstests. Kein Netzzugriff, keine
// echten Credentials: lokale Tests müssen offline reproduzierbar bleiben.
//
// `getViteConfig` bindet die Astro-Vite-Kette ein. Ohne sie lassen sich
// `.astro`-Dateien nicht importieren, und die Komponentenbibliothek wäre nur
// über den fertigen Build prüfbar — also erst, nachdem ein Fehler schon in
// jeder Seite steckt.
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    // End-to-End-Tests laufen unter Playwright, nicht unter Vitest.
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    passWithNoTests: false,
  },
});
