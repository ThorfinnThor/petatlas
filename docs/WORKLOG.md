# Arbeitsprotokoll

## 2026-09-06 — Planungspaket
Implementierungsplan, 120 Aufgaben, Betriebs-/Qualitätsvorgaben und Startprompt erstellt.
Keine Implementierungsaufgabe ist damit abgeschlossen.

## Format für zukünftige Einträge
Datum / Aufgaben-ID / Commit / Änderung / tatsächlich ausgeführte Prüfung / Ergebnis / nächste Aufgabe.

## 2026-09-06 — Sitzung 1: M00 vollständig, M01-01, M02-01

| Aufgabe | Commit | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|---|
| M00-01 | 6dc3a14 | `docs/BASELINE.md`, lokales `git init -b main` | `python3 scripts/test_project_status.py` | 10 Tests OK |
| M00-02 | 6e1e67d | `config/launch.json`, Scope-Abschnitt in DECISIONS | JSON-Parse von `config/launch.json` | exit 0 |
| M00-03 | 8f88dcc | `config/site.ts`, `scripts/checks/site-config.check.mjs` | `node scripts/checks/site-config.check.mjs` | 9 Zusicherungen erfüllt |
| M00-04 | 6651a30 | `docs/SECURITY_SCOPE.md`, Verweis in CLAUDE.md | `gh auth status` | Konto ThorfinnThor, keine Repo-Zuweisung |
| M00-05 | 7c1820f | `licenses/README.md`, ADR-017 | Prüfung: keine `LICENSE`-Datei angelegt | bestätigt |
| M00-06 | f2dadae | Statusregister in EXTERNAL_SETUP, `docs/BLOCKERS.md` | — | 12 offene Voraussetzungen, 0 Blocker |
| M01-01 | 3aed781 | Astro 7.3.1 static, TS 6.0.3 strict, Lockfile, Startseite | `git clone && npm ci && npm run build && npx astro check` | Build reproduzierbar, 0 Fehler |
| M02-01 | (Statuscommit) | `scripts/task_update.py` | `python3 scripts/project_status.py --validate` | 120 Aufgaben, keine Fehler |

Umgebungshinweis: Node auf dieser Maschine verifiziert die Kette von `registry.npmjs.org` nicht mit seinem eingebauten CA-Bundle. Umgehung ohne Abschwächung der TLS-Prüfung: `NODE_EXTRA_CA_CERTS` auf ein Bündel der System-Roots setzen. Erzeugen mit `security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > .work/ca/system-roots.pem`. `.work/` ist ignoriert; `strict-ssl` bleibt aktiv.

| M01-02 | 44d77ec…, Folgecommit | `docs/REPOSITORY.md`, `origin` gesetzt, `main` gepusht | `gh repo view ThorfinnThor/petatlas --json visibility,defaultBranchRef` | public, `main` |

Hinweis zur Nachvollziehbarkeit: Der Commit „M02-03: Statusartefakte…“ pflegt die Statusdateien, schließt die Aufgabe M02-03 aber **nicht** ab. M02-03 bleibt `todo`, da M02-02 noch offen ist.
Projektpfad seit 2026-09-06 `~/Projects/pet-platform` (vorher `~/Downloads/pet-platform-implementation`).

## 2026-09-06 — Sitzung 2: M01 vollständig

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M01-03 | ESLint 10 Flat Config, Prettier, Vitest 5, Playwright 1.63, `docs/TOOLCHAIN.md` | Canary-Datei mit Typ- und Lintfehlern | typecheck exit 1 (ts2322), lint exit 1 (4 Fehler); nach Entfernen beide exit 0 |
| M01-04 | Vollständige `.gitignore`, `.env.example`, `scripts/checks/secrets.ts` | Canary-Token in `src/`, Canary-Hook-URL in `dist/` | beide gemeldet, exit 1, Fund maskiert; danach exit 0 |
| M01-05 | `config/build.ts`, `fixtures/`, `tests/build-mode.test.ts`, `astro.config.ts` | `build:fixture` hinter totem Proxy; `build:production` | Fixture-Build exit 0 ohne Netz; production exit 1 wegen fehlender Launch-Freigabe |
| M01-06 | `BaseLayout`, `404.astro`, Formularprobe, `tests/e2e/smoke.spec.ts` | `npx playwright test` über 3 Projekte | 18/18 bestanden; Screenshots unter `reports/screenshots/` |

Zwei echte Hindernisse und ihre Lösung:
- `@astrojs/check` akzeptiert TypeScript nur bis `<7`. Deshalb ist TypeScript auf 6.0.3 gepinnt, nicht auf die aktuelle 7er-Linie.
- Astro 7 startet `astro preview` in erkannten Agent-Umgebungen im Hintergrund, weshalb Playwright den Server für beendet hielt. Gelöst über `ASTRO_PREVIEW_BACKGROUND=false` im `webServer`-Block.

| M02-02 | npm-Aliase `status`, `status:json`, `status:validate`, Meilensteinfilter | `npm run status -- --milestone M08`, `npm run status:json`, `python3 scripts/test_project_status.py` | alle exit 0; 10 Tests OK |

Beispielübergang für M02-03, tatsächlich durchlaufen an M02-02: `todo` → `in_progress` (`npm run status` zeigte „Aktuell: M02-02“, `in_progress: 1`) → `done` (`Erledigt: 14/120`, `current_task: null`, Nachweis im Manifest). `implementation_state` wechselte dabei von `not_started` auf `in_progress`, weil er jetzt abgeleitet wird.

## 2026-09-06 — Sitzung 3: M02 vollständig

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M02-02 | npm-Aliase `status`, `status:json`, `status:validate`, Meilensteinfilter; `implementation_state` wird abgeleitet | alle vier Befehle plus Statushelfer-Tests | exit 0; `implementation_state` stand fälschlich auf `not_started` und ist jetzt korrekt |
| M02-03 | Rollen der Statusdateien in `docs/STATUS.md` | Beispielübergang an M02-02 durchlaufen | `todo` → `in_progress` → `done`, Ansichten konsistent |
| M02-04 | Konsistenzprüfung um `current_task`, vollständige Nachweisfelder, `deferred`-Begründung und CLI-Exitcode erweitert | `python3 scripts/test_project_status.py` | 22 Tests statt 10, alle grün |
| M02-05 | `docs/AUTONOMY.md`: Loop, Dreierregel, Liste unzulässiger „Fortschritte“ | — | Dokument, kein Testartefakt |
| M02-06 | `scripts/checks/handoff.py`, npm-Skript `check:handoff` | `npm run check:handoff` | erster Lauf rot: veralteter Handoff nannte erledigte Aufgaben; nach Aktualisierung exit 0 |

Der Handoff-Check hat sich unmittelbar bewährt: nach dem Abschluss von M02-06 meldete er erneut rot, weil `docs/HANDOFF.md` noch M02-06 als nächsten Schritt führte.

## 2026-09-06 — Sitzung 4: M03, M04 und M05 vollständig

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M03-01…06 | Markt/Locale, Geld, Einheiten, Datum, Provenienz, Rechte, acht Fachschemas, Provider, internationale Isolation | `npm run test:unit` | von 33 auf 200 Tests |
| M04-01…06 | Route Registry, Design Tokens, Kernseiten aus der Registry, Pagefind, Formularbausteine, visueller Baseline-Review | `npx playwright test`, 40 Screenshots über 5 Breiten | 141 E2E-Tests; ein Layoutbefund behoben |
| M05-01…06 | Source Registry, Publikationsklassen, Attribution, Primärprüfung der Quellen, ODbL-Datenfluss, Lizenzregression | `npm run check:licenses`, `npm run test:unit` | 257 Unit- und 156 E2E-Tests |

Vier Hindernisse, die echte Arbeit gekostet haben:
- `@astrojs/check` akzeptiert TypeScript nur bis `<7`; TypeScript ist deshalb auf 6.0.3 gepinnt.
- Astro 7 startet `astro preview` in Agent-Umgebungen im Hintergrund; Playwright braucht `ASTRO_PREVIEW_BACKGROUND=false`.
- Das gebündelte Suchskript scheiterte an einem `__VITE_PRELOAD__`-Platzhalter, weil der Bundler den dynamischen Import auf den erst später erzeugten Pagefind-Index auflöste. Die Suchlogik liegt jetzt als eigenes Modul in `public/`.
- Der Testdatenhinweis lief über die volle Fensterbreite, weil er außerhalb von `<main>` steht.

Korrigierte Testerwartungen, jeweils ohne Änderung an der Implementierung: zwei Einheitenrundungen (Ganzzahlspeicherung übersehen), zwei Suchtests (Pagefind arbeitet mit Wortstämmen, „keine Treffer“ war die falsche Prüfung) und drei Erwartungen an Texte, die sich durch spätere Aufgaben geändert haben.

Ergebnis der Quellenprüfung M05-04: OSM-Extrakt freigegeben, Gebührenkatalog bleibt gesperrt (B-001).

## 2026-09-06 — Entscheidung B-001

Der Betreiber hat den Bezugsweg für den Gebührenkatalog festgelegt: ausschließlich der offizielle XML-ZIP-Download von gesetze-im-internet.de, kein Crawler. Festgehalten als ADR-018 mit den Vorgaben zu Snapshots, Fehlerverhalten, Provenienzfeldern, Rechtekennzeichnung und Darstellung im Produkt.

Nachgeprüft: Download antwortet mit HTTP 200 (32.110 Byte, `application/zip`, `ETag` und `Last-Modified` vorhanden), Archiv enthält genau `BJNR140100022.xml`; `robots.txt` schließt keinen Pfad aus.

B-001 ist aufgelöst und bleibt zur Nachvollziehbarkeit im Register stehen. Die verbleibende Betriebsprüfung vor dem zeitgesteuerten Abruf ist als neue Aufgabe **M17-07** angelegt — 121 Aufgaben statt 120.
