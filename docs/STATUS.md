# Projektstatus

Stand: 2026-09-09, Ende Sitzung 11.

**Erledigt:** 128 von 135 Aufgaben. **In Arbeit:** keine. **Blockiert:** sieben (M08-06, fachliche Abnahme des Rechners; M09-06, Partnervertrag und § 34d-Prüfung; M12-06, fachliche Prüfung der Reiseregeln; M13-06, Programmfreigabe für Warenangebote; M14-06, Attributabnahme echter Produkte; M18-06 und M19-06, Freigaben für Launch und Veröffentlichung).
**Meilensteine vollständig:** M00 bis M07, M10, M11, M15 und M16 (je 6/6). M08 bei 5/6, die sechste blockiert. M09 bei 5/6, die sechste blockiert. M12 bei 5/6, die sechste blockiert. M13 bei 5/6, die sechste blockiert. M14 bei 5/6, die sechste blockiert. M15 vollständig. M16 vollständig. M17 vollständig (7/7). M18 bei 5/6, die sechste blockiert. M19 bei 5/6, die sechste blockiert. Block M20 bis M22 **vollständig**: M20 3/3, M21 6/6, M22 5/5. Es gibt keine ausführbare Aufgabe mehr; die sieben verbleibenden warten auf Freigaben.

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
- **Bundesweite Ortsdaten:** 9.381 Orte aus allen 16 deutschen OSM-Regionalextrakten, in 217 räumliche Zellen geteilt, 46.113 Ortsnamen für die Suche, Stand 07.09.2026 (seit M22-01 mit Abrufdatum im Snapshot). Messung in `docs/OSM_BENCHMARK.md`, Abdeckung in `docs/COVERAGE.md`, Abnahme in `docs/reviews/places.md`. Die Karte selbst folgt in M11.
- **Karte und lokale Seiten:** zugängliche Trefferliste ohne JavaScript, Leaflet erst auf Klick, Standortabfrage nur auf Nutzeraktion, dazu 42 Stadtseiten aus einer gemessenen Qualitäts-Allowlist (`docs/CITY_PAGES.md`). Läuft hinter dem Feature Flag `map`.
- **Kommunale Quellen:** zwei Städte. Berlin: 30 Flächen der Senatsverwaltung (22 Hundefreilauf, 8 Hundemitnahmeverbot) unter `dl-de/zero-2-0`, Abgleich mit OSM 10/0/16/12. Hamburg: 140 Auslaufzonen nach § 8 HundeG unter `dl-de/by-2-0`, Abgleich 14 bestätigt, 0 Widerspruch, 6 unbestätigt, **126 nur kommunal**. Beide sind seit M20-03 auf den Stadtseiten ausgeliefert; Einzelheiten in `docs/MUNICIPAL_SOURCES.md`.

**Nicht vorhanden:** Produktionsprojekt, Git-Integration bei Cloudflare, echte Fachdaten, Rechner, Karte, Reisecheck, Katalog, Domain, Betreiberangaben, Partnerverträge.

## Zahlen der letzten Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run test:unit` | 1419 Tests in 93 Dateien |
| `npx playwright test` | 153 Tests, dazu 30 hinter dem Feature Flag |
| `npm run lint` / `typecheck` / `format:check` | sauber |
| `npm run check:security` | 167 Dateien, kein Fund |
| `npm run check:licenses` | 22 Quellen, 21 freigegeben, 1 gesperrt, keine Beanstandung |
| `python3 scripts/test_project_status.py` | 22 Tests |
| `npm run build:production` | exit 1 — beabsichtigt, Launch-Gates offen |

## Offene Entscheidung des Betreibers

**B-002 — fachliche Abnahme des Kostenrechners.** Es fehlt eine Person mit fachlicher Eignung, die Quellenstand und Rechenannahmen prüft. Die acht Prüfpunkte und die fünf Freigabeschritte stehen in `docs/reviews/costs.md`. Blockiert ausschließlich die öffentliche Aktivierung; alle übrigen Meilensteine sind unberührt.

**Nächster Schritt:** M11-01 (Karte und lokale Landingpages). Unabhängig daneben: M09-01, M12-01, M13-01.

Maßgeblich ist `project/tasks.json`.
