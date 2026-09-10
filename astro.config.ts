// @ts-check
import { defineConfig } from 'astro/config';

import { resolveBuildConfig, devFeatureOverrides } from './config/build.ts';

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
    // Auch Stile werden als Datei ausgeliefert, nicht ins HTML gehoben.
    inlineStylesheets: 'never',
  },
  vite: {
    build: {
      // Kein Inlining kleiner Assets. Ein eingebettetes Skript verstößt
      // gegen `script-src 'self'` und liefe im Browser gar nicht — es fiele
      // nur niemandem auf, weil ein fehlender Effekt still ist (M18-02).
      assetsInlineLimit: 0,
    },
  },
  redirects: {
    // Es gibt genau einen aktiven Markt. Diese Weiterleitung ist deshalb
    // deterministisch und rät weder Sprache noch Herkunft (ADR-010).
    '/': '/de-de/',
    ...(devFeatureOverrides().includes('food')
      ? { '/de-de/nahrungsergaenzung/': '/de-de/ergaenzungsfuttermittel/' }
      : {}),
  },
});
