# Projektstatus

Stand: 2026-09-07, Ende Sitzung 9.

**Erledigt:** 63 von 121 Aufgaben. **In Arbeit:** keine. **Blockiert:** eine (M08-06, fachliche Abnahme des Rechners).
**Meilensteine vollständig:** M00 bis M07 und M10 (je 6/6). M08 bei 5/6, die sechste blockiert. M11 bei 4/6.

**Repository:** https://github.com/ThorfinnThor/petatlas (public, Branch `main`), Projektpfad `~/Projects/pet-platform`.

## Was tatsächlich läuft

- Astro 7 static, TypeScript 6 strict, gepinnte Abhängigkeiten, reproduzierbarer Build aus einem frischen Klon.
- Prüfkette: ESLint, `astro check`, Prettier, Vitest, Playwright, Secret-Audit, Lizenzprüfung, Handoff-Prüfung.
- Domänenmodelle: Markt und Locale, Geld als ganzzahlige Untereinheiten, Einheiten, Kalenderdatum gegen Zeitpunkt, Provenienz, Rechte, acht Fachschemas, Provider-Auflösung.
- Oberfläche: Route Registry, Design Tokens, Kopf- und Fußbereich, fünf Kernseiten, statische Suche ohne Backend, zugängliche Formularbausteine.
- Quellenregister mit Publikationsklassen, Attribution aus derselben Registry, ODbL-Datenfluss, Lizenzregression.

- Import- und Snapshot-System: Adapter-API, sicherer Fetcher, deterministische Normalisierung, Differenzprüfung mit Quarantäne, Sharding, Manifest, atomare Veröffentlichung.
- CI auf GitHub: zwei Workflows ohne Secrets, Actions auf Commit-SHAs gepinnt, beide grün.
- Cloudflare: **Vorschau ist live** unter https://petatlas-de-preview.shuu9599.workers.dev — Fixtures, `noindex`, sichtbarer Testdatenhinweis, Freigabestufe A.
- `npm run build:cloudflare` bricht ab bei production ohne Freigabe, bei Fixtures außerhalb von development und bei gesetztem Feed-Secret ohne Vertrag.
- **Tierarztkosten-Rechner:** GOT-Import mit 1006 Positionen aus der amtlichen XML-Fassung, Rechenengine mit beiden Golden Tests, Szenariomodell mit Reviewpfad, Oberfläche und Druckansicht. Läuft hinter dem Feature Flag `costs`; öffentlich erst nach der fachlichen Abnahme.
- **Bundesweite Ortsdaten:** 9.381 Orte aus allen 16 deutschen OSM-Regionalextrakten, in 217 räumliche Zellen geteilt, 46.116 Ortsnamen für die Suche. Messung in `docs/OSM_BENCHMARK.md`, Abdeckung in `docs/COVERAGE.md`, Abnahme in `docs/reviews/places.md`. Die Karte selbst folgt in M11.
- **Karte und lokale Seiten:** zugängliche Trefferliste ohne JavaScript, Leaflet erst auf Klick, Standortabfrage nur auf Nutzeraktion, dazu 25 Stadtseiten aus einer gemessenen Qualitäts-Allowlist (`docs/CITY_PAGES.md`). Läuft hinter dem Feature Flag `map`.

**Nicht vorhanden:** Produktionsprojekt, Git-Integration bei Cloudflare, echte Fachdaten, Rechner, Karte, Reisecheck, Katalog, Domain, Betreiberangaben, Partnerverträge.

## Zahlen der letzten Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run test:unit` | 537 Tests in 31 Dateien |
| `npx playwright test` | 153 Tests, dazu 30 hinter dem Feature Flag |
| `npm run lint` / `typecheck` / `format:check` | sauber |
| `npm run check:security` | 167 Dateien, kein Fund |
| `npm run check:licenses` | 2 Quellen, 1 freigegeben, 1 gesperrt, keine Beanstandung |
| `python3 scripts/test_project_status.py` | 22 Tests |
| `npm run build:production` | exit 1 — beabsichtigt, Launch-Gates offen |

## Offene Entscheidung des Betreibers

**B-002 — fachliche Abnahme des Kostenrechners.** Es fehlt eine Person mit fachlicher Eignung, die Quellenstand und Rechenannahmen prüft. Die acht Prüfpunkte und die fünf Freigabeschritte stehen in `docs/reviews/costs.md`. Blockiert ausschließlich die öffentliche Aktivierung; alle übrigen Meilensteine sind unberührt.

**Nächster Schritt:** M11-01 (Karte und lokale Landingpages). Unabhängig daneben: M09-01, M12-01, M13-01.

Maßgeblich ist `project/tasks.json`.
