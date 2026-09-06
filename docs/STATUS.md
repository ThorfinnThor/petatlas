# Projektstatus

Stand: 2026-09-06, Ende Sitzung 4.

**Erledigt:** 36 von 121 Aufgaben. **In Arbeit:** keine. **Blockiert:** keine. B-001 ist entschieden (ADR-018); die neue Aufgabe M17-07 hält die verbleibende Betriebsprüfung fest.
**Meilensteine vollständig:** M00, M01, M02, M03, M04, M05 (je 6/6).

**Repository:** https://github.com/ThorfinnThor/petatlas (public, Branch `main`), Projektpfad `~/Projects/pet-platform`.

## Was tatsächlich läuft

- Astro 7 static, TypeScript 6 strict, gepinnte Abhängigkeiten, reproduzierbarer Build aus einem frischen Klon.
- Prüfkette: ESLint, `astro check`, Prettier, Vitest, Playwright, Secret-Audit, Lizenzprüfung, Handoff-Prüfung.
- Domänenmodelle: Markt und Locale, Geld als ganzzahlige Untereinheiten, Einheiten, Kalenderdatum gegen Zeitpunkt, Provenienz, Rechte, acht Fachschemas, Provider-Auflösung.
- Oberfläche: Route Registry, Design Tokens, Kopf- und Fußbereich, fünf Kernseiten, statische Suche ohne Backend, zugängliche Formularbausteine.
- Quellenregister mit Publikationsklassen, Attribution aus derselben Registry, ODbL-Datenfluss, Lizenzregression.

**Nicht vorhanden:** Cloudflare-Projekt, GitHub-Actions-Workflows, Import-System, echte Fachdaten, Rechner, Karte, Reisecheck, Katalog, Domain, Betreiberangaben, Partnerverträge.

## Zahlen der letzten Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `npm run test:unit` | 257 Tests in 15 Dateien |
| `npx playwright test` | 156 Tests über Chromium, WebKit und mobiles Profil |
| `npm run lint` / `typecheck` / `format:check` | sauber |
| `npm run check:security` | 167 Dateien, kein Fund |
| `npm run check:licenses` | 2 Quellen, 1 freigegeben, 1 gesperrt, keine Beanstandung |
| `python3 scripts/test_project_status.py` | 22 Tests |
| `npm run build:production` | exit 1 — beabsichtigt, Launch-Gates offen |

## Offene Entscheidungen des Betreibers

1. **Cloudflare-Zugang.** Erstmals nötig für M07-03. Der Betreiber hat Zugang zugesagt; er ist im Projektkontext noch nicht eingerichtet.

**Nächster Schritt:** M06-01 (Adapter-API). M06 und M07 bis einschließlich M07-02 sind ohne beide Entscheidungen ausführbar.

Maßgeblich ist `project/tasks.json`.
