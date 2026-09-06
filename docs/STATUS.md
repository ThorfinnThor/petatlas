# Projektstatus

Stand: 2026-09-06, Ende Sitzung 5.

**Erledigt:** 45 von 121 Aufgaben. **In Arbeit:** keine. **Blockiert:** keine.
**Meilensteine vollständig:** M00 bis M06 (je 6/6). M07 bei 3/6.

**Repository:** https://github.com/ThorfinnThor/petatlas (public, Branch `main`), Projektpfad `~/Projects/pet-platform`.

## Was tatsächlich läuft

- Astro 7 static, TypeScript 6 strict, gepinnte Abhängigkeiten, reproduzierbarer Build aus einem frischen Klon.
- Prüfkette: ESLint, `astro check`, Prettier, Vitest, Playwright, Secret-Audit, Lizenzprüfung, Handoff-Prüfung.
- Domänenmodelle: Markt und Locale, Geld als ganzzahlige Untereinheiten, Einheiten, Kalenderdatum gegen Zeitpunkt, Provenienz, Rechte, acht Fachschemas, Provider-Auflösung.
- Oberfläche: Route Registry, Design Tokens, Kopf- und Fußbereich, fünf Kernseiten, statische Suche ohne Backend, zugängliche Formularbausteine.
- Quellenregister mit Publikationsklassen, Attribution aus derselben Registry, ODbL-Datenfluss, Lizenzregression.

- Import- und Snapshot-System: Adapter-API, sicherer Fetcher, deterministische Normalisierung, Differenzprüfung mit Quarantäne, Sharding, Manifest, atomare Veröffentlichung.
- CI auf GitHub: zwei Workflows ohne Secrets, Actions auf Commit-SHAs gepinnt, beide grün.
- Cloudflare: Zugang vorhanden, Assets-only-Konfiguration gegen die echte Laufzeit geprüft.

**Nicht vorhanden:** verbundenes Cloudflare-Projekt, echte Fachdaten, Rechner, Karte, Reisecheck, Katalog, Domain, Betreiberangaben, Partnerverträge.

## Zahlen der letzten Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run test:unit` | 371 Tests in 22 Dateien |
| `npx playwright test` | 153 Tests über Chromium, WebKit und mobiles Profil |
| `npm run lint` / `typecheck` / `format:check` | sauber |
| `npm run check:security` | 167 Dateien, kein Fund |
| `npm run check:licenses` | 2 Quellen, 1 freigegeben, 1 gesperrt, keine Beanstandung |
| `python3 scripts/test_project_status.py` | 22 Tests |
| `npm run build:production` | exit 1 — beabsichtigt, Launch-Gates offen |

## Offene Entscheidungen des Betreibers

Keine. Cloudflare-Zugang liegt seit 2026-09-06 vor; B-001 ist entschieden.

**Nächster Schritt:** M07-04 (Cloudflare-Buildskript), dann M07-05 und M07-06.

Maßgeblich ist `project/tasks.json`.
