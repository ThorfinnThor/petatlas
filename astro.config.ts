// @ts-check
import { defineConfig } from 'astro/config';

import { resolveBuildConfig } from './config/build.ts';

/**
 * M01-01/M01-05 — Statischer Build ohne Laufzeitlogik.
 *
 * `output: 'static'` ist verbindlich (ADR-002): kein SSR-Adapter, kein
 * Server-Endpunkt, keine Datenbankbindung. Die Basis-URL kommt aus der
 * Build-Konfiguration; ein unvollständig konfiguriertes `production` bricht
 * hier ab, statt mit Platzhalterwerten zu bauen.
 */
const build = resolveBuildConfig();

export default defineConfig({
  output: 'static',
  site: build.baseUrl,
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
});
