// @ts-check
import { defineConfig } from 'astro/config';

/**
 * M01-01 — Statischer Build ohne Laufzeitlogik.
 *
 * `output: 'static'` ist verbindlich (ADR-002). Es wird bewusst kein
 * SSR-Adapter, kein Server-Endpunkt und keine Datenbankbindung ergänzt.
 * Markt-, Sprach- und Build-Modus-Konfiguration folgen in M01-05 und M03.
 */
export default defineConfig({
  output: 'static',
  // Platzhalterdomain; die echte Basis-URL kommt in M01-05 aus config/site.ts.
  site: 'https://example.invalid',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
