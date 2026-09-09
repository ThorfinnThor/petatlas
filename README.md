# PetAtlas

Eine statische deutschsprachige Web-App für Tierarztkosten, Hunde-Orte, Reisevorbereitung und belegte Produktinformationen. Astro 7 und TypeScript; Daten werden im Browser lokal verarbeitet. Kein Konto, keine Analyse-Tracker und keine Laufzeitdatenbank.

## Lokal starten

Node 24 verwenden (`.nvmrc`), dann:

```sh
npm ci
npm run build:app
npm run preview
```

`build:app` baut die echte App als nicht indexierbare Vorschau und führt die Auslieferungsprüfungen aus. Die Seite liegt unter `/de-de/`. `npm run dev:app` startet die Entwicklung; Datenendpunkte und Volltextsuche sind erst im vollständigen statischen Build vorhanden.

## Daten und Oberfläche

V2-Design mit selbst gehosteten Manrope/Kalam-Schriften, responsiven Originalbildern, gruppierter Navigation, Werkzeugen und Ratgebern. Enthalten sind 9.381 OSM-Orte, 46.113 Ortsnamen, 42 Stadtübersichten, 170 kommunale Hundeflächen/-regeln und 1.006 offizielle GOT-Positionen. Die kleine Produktauswahl enthält vier Futtervarianten und drei Zubehörprodukte mit Herstellerquellen; keine erfundenen Preise oder Bewertungen.

Provenienz: `docs/REAL_PRODUCT_DATA.md`, `docs/COVERAGE.md`, `docs/MUNICIPAL_SOURCES.md`, `design-assets/README.md`. Datenstand und Grenzen sind in der App sichtbar. Snapshot-Updates werden als geprüfte Pull Requests übernommen; Code und Daten werden aus demselben Commit gebaut (ADR-019).

## Prüfen

```sh
npm run verify
npm run test:e2e
npm run test:e2e:features
npm run test:accessibility
npm run test:app
npm run test:performance
```

Die Browserprüfungen benötigen die Playwright-Browser (`npx playwright install chromium webkit`). `npm run build:app` prüft zusätzlich Ausgabedateien, interne Verweise, SEO und Größenbudgets.

## Veröffentlichung

Cloudflare Workers Static Assets, Konfiguration in `wrangler.preview.jsonc` und `wrangler.jsonc`. Vorschau und Produktion sind getrennt. Der Produktionsbuild verlangt echte Betreiberangaben, eine Domain und dokumentierte Einzelprüfungen. `.env.example` nennt die öffentlichen Konfigurationsfelder. Partnerangebote, Versicherungsangebote und Werbung bleiben bis zu tatsächlichen Verträgen und Freigaben ausgeschaltet.

Aktueller Arbeits-/Abnahmestand: `docs/HANDOFF.md`. Bekannte Grenzen: `docs/KNOWN_LIMITATIONS.md`. Aufgabenregister: `project/tasks.json`; `npm run status` zeigt den strukturierten Stand. `CLAUDE.md` und die ursprünglichen Planungsdokumente enthalten die Projektregeln und Planungshistorie.
