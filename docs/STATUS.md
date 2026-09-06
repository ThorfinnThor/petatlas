# Projektstatus

Stand: 2026-09-06, Ende Sitzung 7.

**Erledigt:** 53 von 121 Aufgaben. **In Arbeit:** keine. **Blockiert:** eine (M08-06, fachliche Abnahme des Rechners).
**Meilensteine vollständig:** M00 bis M07 (je 6/6). M08 bei 5/6, die sechste blockiert.

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

**Nicht vorhanden:** Produktionsprojekt, Git-Integration bei Cloudflare, echte Fachdaten, Rechner, Karte, Reisecheck, Katalog, Domain, Betreiberangaben, Partnerverträge.

## Zahlen der letzten Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run test:unit` | 456 Tests in 26 Dateien |
| `npx playwright test` | 153 Tests, dazu 30 hinter dem Feature Flag |
| `npm run lint` / `typecheck` / `format:check` | sauber |
| `npm run check:security` | 167 Dateien, kein Fund |
| `npm run check:licenses` | 2 Quellen, 1 freigegeben, 1 gesperrt, keine Beanstandung |
| `python3 scripts/test_project_status.py` | 22 Tests |
| `npm run build:production` | exit 1 — beabsichtigt, Launch-Gates offen |

## Offene Entscheidung des Betreibers

**B-002 — fachliche Abnahme des Kostenrechners.** Es fehlt eine Person mit fachlicher Eignung, die Quellenstand und Rechenannahmen prüft. Die acht Prüfpunkte und die fünf Freigabeschritte stehen in `docs/reviews/costs.md`. Blockiert ausschließlich die öffentliche Aktivierung; alle übrigen Meilensteine sind unberührt.

**Nächster Schritt:** M09-01, M10-01, M12-01 oder M13-01 — alle unabhängig ausführbar.

Maßgeblich ist `project/tasks.json`.
