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

## 2026-09-06 — Sitzung 5: M06 vollständig, M07 bei 3/6

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M06-01…06 | Adapter-API, sicherer Fetcher, deterministische Normalisierung, Differenzprüfung mit Quarantäne, Sharding und Manifest, atomare Veröffentlichung | `npm run test:unit` | von 258 auf 354 Tests |
| M07-01 | `.github/workflows/ci.yml` | Lauf 34051504350 auf GitHub | beide Jobs grün |
| M07-02 | `.github/workflows/security.yml`, `docs/CI_SECURITY.md` | Security-Workflow auf GitHub | grün |
| M07-03 | `wrangler.jsonc`, `scripts/build-headers.ts` | `wrangler deploy --dry-run` und `wrangler dev --local` mit curl | „No bindings found“; 200/404/307 wie konfiguriert |

Drei Befunde, die ohne die CI nicht aufgefallen wären:

1. **Ein Typfehler und 13 Zod-Deprecations waren unbemerkt geblieben**, weil ich die Ausgabe von `astro check` gekürzt gelesen habe und die Fehlerzeile über dem sichtbaren Bereich stand. `npm run typecheck` endete mit Exitcode 1, während die letzten Zeilen „0 warnings“ meldeten. Der Code nutzt jetzt die Zod-4-API (`z.url()`, `z.iso.datetime()`, `z.uuid()`).
2. **Zwei Prüfschritte im Security-Workflow trafen sich selbst**: `grep` fand das gesuchte Muster in der eigenen Workflowdatei. Sie prüfen jetzt den Trigger am Zeilenanfang beziehungsweise unter Ausschluss der eigenen Datei.
3. **Die Tests liefen lokal vor dem Formatlauf.** Prettier fügte in `wrangler.jsonc` ein abschließendes Komma ein, das der Test mit `JSON.parse` nicht lesen konnte — grün lokal, rot in der CI. Der Parser versteht jetzt JSONC, und der Arbeitsloop verlangt `npm run format` vor den Tests.

Der Handoff-Check hat zweimal zugeschlagen, weil `docs/HANDOFF.md` nach dem Abschluss einer Aufgabe noch die erledigte nannte. Die Reihenfolge steht jetzt ausdrücklich in `docs/AUTONOMY.md`.

## 2026-09-06 — Sitzung 6: M07 vollständig, erstes Deployment

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M07-04 | `scripts/build-cloudflare.ts`, `dist/build-info.json` | Erfolgslauf und drei Abbruchfälle | production ohne Freigabe, Fixtures außerhalb development und gesetztes Feed-Secret brechen ab |
| M07-05 | `docs/CLOUDFLARE_SETUP.md` | `npm run test:unit` | 14 Isolationstests |
| M07-06 | `wrangler.preview.jsonc`, `docs/DEPLOYMENT_EVIDENCE.md` | `wrangler deploy` und curl gegen die Live-Adresse | 32 Dateien deployt, Version `ac32f696`, Smoke bestanden |

**Die Vorschau ist live:** https://petatlas-de-preview.shuu9599.workers.dev

Das Produktionsprojekt ist bewusst nicht angelegt. Ohne Domain, Betreiberangaben und freigegebene Funktion gäbe es nichts zu veröffentlichen; ein leeres Produktionsprojekt wäre eine Behauptung ohne Inhalt.

Zwei Befunde aus der CI, beide eigene Fehler:

1. Der Metadaten-Test las `dist/build-info.json` und setzte damit einen vorher gelaufenen Build voraus. Lokal grün, in der CI rot, weil dort die Unit-Tests vor jedem Build laufen. Die Metadaten entstehen jetzt in einer exportierten Funktion ohne Dateisystemzugriff.
2. Der Secret-Audit meldete den Testwert `AWIN_FEED_URL` im Quelltext — zu Recht, das Muster ist genau eine Zuweisung an einen bekannten Secret-Namen. Schlüssel und Wert werden jetzt zur Laufzeit zusammengesetzt, statt die Regel aufzuweichen oder eine Ausnahme einzutragen.

## 2026-09-06 — Sitzung 7: M08 bis auf die fachliche Abnahme

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M08-01 | `scripts/ingest/adapters/got.ts`, ZIP-Fixture, Vergleichsstichprobe | Import gegen die amtliche XML-Fassung | 1006 Positionen, 0 unlesbare Zeilen |
| M08-02 | `src/features/costs/engine.ts`, `config/costs/DE.json` | beide Golden Tests aus der Regelspezifikation | 6.000 Cent netto; im Notdienst 11.000 netto / 13.090 brutto |
| M08-03 | `content-data/cost-scenarios/`, `scenarios.ts` | `npm run test:unit` | zwei Vorlagen, beide ungeprüft, keine Gesamtschätzung |
| M08-04 | Rechneroberfläche, Snapshot, Datenchunk über das Manifest | `npm run test:e2e:features` | 20 Tests; 80,40 € regulär, 139,90 € im Notdienst |
| M08-05 | `print.css`, Leistungsseiten je Freigabe | Build mit und ohne simulierte Freigabe | ohne Freigabe keine Seite, mit Freigabe genau eine |
| M08-06 | `docs/reviews/costs.md` | — | **blockiert (B-002)**, keine Abnahme erfunden |

Zwei Befunde beim Bauen:
- Der erste Parserlauf lieferte „Untersuchung(auch schriftlich“ statt „Untersuchung (auch schriftlich“: der XML-Parser hatte das Leerzeichen nach `<BR/>` weggetrimmt. Aufgefallen ist es nur, weil die Erwartungswerte aus einer unabhängigen Zweitextraktion stammen.
- Die erste Szenariovorlage verwies auf Position 9. Die ist „Mastschwein“, nicht Hund. Der Test, der jede Positions-ID gegen den echten Katalog prüft, hat das gefangen; die Vorlage nutzt jetzt Position 16 („Hund, Katze, Frettchen“).

## 2026-09-07 — Sitzung 8: M10 vollständig

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M10-01 | OSM-Adapter, `config/osm-tags.json` | Pilotlauf über das Bremen-Extrakt | 2 Mio. Objekte in 0,9 s, 47 Orte, kein `emergency=yes` |
| M10-02 | `scripts/normalize/geometry.ts`, zweiter Durchgang | Bremen mit Geometrieauflösung | alle 19 Flächen aufgelöst, 66 Orte, keine Doppelzählung |
| M10-03 | `place-search.ts`, Ortsnamenindex | Suche über echte Bremer Ortsknoten | „Mitte“ wird als mehrdeutig aufgelöst |
| M10-04 | `scripts/ingest/osm-country.ts`, Regionskonfiguration | bundesweiter Lauf über 16 Regionen | 4,60 GiB, 9.381 Orte, 373 MiB Spitzenspeicher |
| M10-05 | `scripts/publish/places.ts`, `docs/COVERAGE.md` | `npm run build:places` | 217 Zellen, initialer Browserpfad rund 50 KiB |
| M10-06 | `docs/reviews/places.md`, `check:places` | Stichprobe gegen die OSM-API | drei Einträge stimmen exakt, keine Beanstandung |

Drei Dinge, die beim Bauen aufgefallen sind:

1. **Die Quelle drosselt.** Der erste Versuch endete mit HTTP 502, nachdem kurz zuvor mehrere Kopfabfragen abgesetzt worden waren. Der Import lädt deshalb sequenziell mit Pausen und behandelt 502 wie ein Rate Limit. Das macht den Lauf langsamer als nötig — mit Absicht.
2. **Der ungeteilte Ortsnamenindex war 6,68 MB** und wurde vom Manifest abgelehnt. Die Grenze hat genau das getan, wofür sie da ist. Der Index ist jetzt nach Anfangsbuchstaben in 51 Teile geteilt.
3. **Eine Zahl im Nachweis war aus dem Gedächtnis geschrieben** und falsch: „12 von 9.369“ Notdienstangaben statt der gemessenen 9 von 9.381. `docs/COVERAGE.md` war richtig, weil die Zahlen dort aus den Daten erzeugt werden. Der Nachweis ist korrigiert.

## 2026-09-07 — Sitzung 9: M11 Karte und lokale Seiten

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M11-01 | `src/features/map/list.ts`, `list-ui.ts`, Kartenseite | E2E mit abgeschaltetem JavaScript | 25 echte Treffer stehen im ausgelieferten HTML |
| M11-02 | `map.ts`, `config/tiles.json` | E2E mit Protokoll aller Kachelanfragen | beim Seitenaufruf keine Kachel, erst nach dem Klick |
| M11-03 | `geolocation.ts`, Marker- und Rendergrenzen | E2E mit erteiltem, verweigertem und zeitüberschrittenem Standort | `getCurrentPosition` beim Laden null Aufrufe |
| M11-04 | `city.ts`, `city-allowlist.ts`, `content-data/city-allowlist.json`, Stadtseite | `npm run build:city-allowlist`, Unit- und E2E-Tests, Build | 25 Seiten aus 42 geeigneten von 188 Kandidaten |

Zu M11-04 im Einzelnen:

- Die Auswahl ist gemessen, nicht redaktionell: 10 km Umkreis, mindestens ein Eintrag je Pflichtkategorie, mindestens 25 Einträge, 10 Tierarztpraxen, 15 mit Kontaktangabe und 10 in der Stadt selbst. Häufigster Ablehnungsgrund war „zu wenige Einträge in der Stadt selbst“ (138 Städte), dahinter fehlende Hundewiesen (42) und fehlende Tierheime (26). Kriterien und Zahlen stehen in `docs/CITY_PAGES.md`.
- Die Allowlist ist eine Obergrenze, keine Zusicherung. Der Build misst jede gelistete Stadt erneut; erfüllt sie die Kriterien nicht mehr, entfällt ihre Seite. Ein Test vergleicht die Datei mit dem echten Datenstand und nennt im Fehlerfall den Regenerierungsbefehl.
- Zwei Textfehler sind erst im Browser aufgefallen und dort behoben worden: „1 Tierheime“ (jetzt eine Zählform je Kategorie) und ein fehlendes Leerzeichen vor dem Stadtnamen.
- Nebenbefund: die Leistungsseiten des Rechners trugen ein canonical auf die Rechnerseite und erklärten sich damit selbst zum Duplikat. Beide Seitenarten setzen jetzt über `subroutePath` ein canonical auf sich selbst.

| M11-05 | `config/sources/berlin-hundefreilauf.json`, `adapters/municipal/`, `normalize/municipal.ts`, `check:municipal` | `npm run snapshot:municipal -- --fetch`, `npm run check:municipal`, 33 neue Tests | 30 Flächen, 10 bestätigt, 0 Widerspruch, 16 unbestätigt, 12 nur kommunal |

Zu M11-05 im Einzelnen:

- Quelle ist die WFS-Abgabe „Hundefreilauf“ der Berliner Senatsverwaltung unter `dl-de/zero-2-0` — eine Lizenz ohne Bedingungen. Der Attributionstext steht trotzdem im Registryeintrag, und `attributionRequired` steht auf `false`: eine Pflicht zu behaupten, die es nicht gibt, wäre genauso falsch wie eine zu übergehen.
- Der Datensatz gilt nur für drei Bezirke. Das steht als Pflichtfeld `validity` im Snapshot. Aus dem Schweigen der Verwaltung folgt nichts: `unbestaetigt` ist im Abgleich ein eigener Fall neben `widerspruch`, und `belegteHundeerlaubnis()` liefert `true` nur bei ausdrücklicher Ausweisung, mit Beleg.
- Der Zugewinn ist messbar: 12 ausgewiesene Freilaufflächen, die OSM nicht führt, und 10 Belege für Flächen, die OSM zwar kennt, aber nicht belegen kann. Widersprüche gab es an diesem Datenstand keine; der Fall ist trotzdem implementiert und getestet.
- Der Live-Abruf scheiterte zuerst mit `SELF_SIGNED_CERT_IN_CHAIN`: der Wurzel „Telekom Security TLS RSA Root 2023“ fehlt im Trust Store dieser Maschine und in dem von Node. Behoben nicht durch Abschalten der Prüfung, sondern durch Aufnahme genau dieses Roots aus der Mozilla-Rootliste nach Fingerprint-Abgleich (`docs/TOOLCHAIN.md`). Der fehlgeschlagene Abruf hatte den vorhandenen Snapshot unangetastet gelassen — das war der erste Beleg dafür, dass der Fehlerpfad stimmt.
- Prettier hat die im Repository liegende Rohantwort umformatiert und damit ihren Hash verändert. Sie ist jetzt in `.prettierignore`: ihr Hash ist der Herkunftsnachweis im Snapshot und darf nicht vom Formatlauf abhängen.
- Zwei ältere Tests hatten Annahmen, die nicht mehr stimmen: die Hostliste des Fetchers und „jede Quelle verlangt Attribution“. Beide beschreiben jetzt, was gelten soll, statt was zufällig galt.

| M11-06 | `tests/e2e-features/map-abnahme.spec.ts`, `docs/reviews/map-ui.md` | `npm run test:e2e:features` (108 Tests über zwei Geräteprofile) | kein horizontaler Bedienbruch, keine 200-Attrappe, Attribution vollständig |

Zu M11-06 im Einzelnen:

- Geprüft wurde im echten Browser, Desktop und Pixel 7: Überbreite (`scrollWidth − clientWidth ≤ 1 px`) auf vier Seitentypen und zusätzlich bei geöffneter Karte, Öffnen der Karte per Tastatur, Kachelausfall, Nachladen der Nachbarzellen, Ortswechsel, interne Links, Statuscodes und Attribution im Datenpfad.
- Beim Kachelausfall bleibt nicht nur die Liste stehen, sondern auch die Attribution — das war der Punkt, an dem eine Abnahme sonst „läuft ja noch“ sagt und die Pflichthinweise übersieht.
- 404 heißt 404, auch in der ausgelieferten Vorschau bei Cloudflare: `/de-de/gibt-es-nicht/` antwortet dort mit HTTP 404 und der eigenen Fehlerseite.
- Zwei Testannahmen von mir waren falsch und sind korrigiert worden, nicht die Implementierung: Ketten wie „Fressnapf“ heißen in Bremen und Hannover gleich (verglichen werden jetzt ganze Einträge), und der Seitentitel der Kartenseite kommt aus der Navigationsbeschriftung, nicht aus der H1.
- Offen und ausdrücklich dem SEO-Meilenstein zugeordnet: Sitemap, Meta-Description, hreflang. Sie stehen als offene Punkte im Abnahmedokument, nicht als stillschweigende Lücke.

## 2026-09-07 — Sitzung 9 (Fortsetzung): M09 beginnt

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M09-01 | `src/domain/schemas/partner.ts`, `config/publishers/insurance/`, `src/features/commerce/partner.ts` | `npx vitest run tests/commerce` | 17 Tests; ohne Vertrag entsteht an keiner erlaubten Stelle ein Hinweis |

- `config/publishers/insurance/programs.json` ist leer, und das ist der Zustand, nicht ein Platzhalter: es gibt keinen Partnervertrag.
- Das Schema ist `.strict()`. Ein Feld wie `commissionRate` lässt die Konfiguration scheitern, statt eine Provisionshöhe in den Browser auszuliefern.
- `approved` verlangt Vertragsreferenz, Freigabedatum und dokumentierten Prüfnachweis; ein Nachweis ohne Zulassung wird ebenso abgelehnt wie eine Zulassung ohne Nachweis. Eine abgelaufene Zulassung wirkt wie keine.
- `partnerHinweisErlaubt()` sagt in fünf getrennten Fällen nein — Feature aus, kein Programm, falscher Markt, keine gültige Zulassung, falsche Platzierung — und begründet jedes Mal im Klartext. Auch die Erlaubnis wird begründet.

| M09-02 | `InsuranceDisclosure.astro`, `PartnerCta.astro`, `links.ts`, `/entwicklung/versicherungsprobe/` | `npm run test:e2e` (174 Tests) | genau ein Hinweis an der erlaubten Stelle, Ziel-URL trägt nur eine statische Kennung |

- Die Offenlegung erscheint auch **ohne** Partner und sagt dann ausdrücklich, dass es keinen gibt. Eine leere Fläche sähe aus wie ein Fehler.
- Der Partnerhinweis rendert nur bei eingeschaltetem Feature, gültiger Zulassung, passendem Markt und erlaubter Platzierung. Auf der Probe-Seite ist genau eine von drei Platzierungen erlaubt, und genau eine erscheint.
- Die Zieladresse kommt aus dem Vertrag und wird geprüft (https, Host in der Allowlist). Angehängt wird höchstens eine statische Kampagnenkennung; ein E2E-Test liest die URL und prüft, dass sie genau einen Parameter trägt und weder Profil-, Kosten- noch Diagnosewerte enthält.
- `rel="sponsored nofollow noopener"`, kein Klickhandler, keine Zwischenstation, und vor dem Klick geht keine einzige Anfrage an den Anbieter.

| M09-03 | `links.ts` mit Zielprüfung, `tests/affiliate-links.test.ts` | `npx vitest run tests/affiliate-links.test.ts` | 14 Tests; ungültige Ziele werden ausgeblendet, nicht abgeschwächt |

- Geprüft wird **offline**. Ein „Verifizieren“ per HTTP-Abruf wäre beim Anbieter ein zählbarer Aufruf — im Build wie im Test. Ein Test ersetzt `globalThis.fetch` und belegt, dass die Prüfung keine einzige Anfrage stellt.
- Abgelehnt werden: fremde Hosts (exakter Vergleich, `sub.beispiel.invalid` gilt nicht als `beispiel.invalid`), alles ohne https, Zugangsdaten in der Adresse, abweichende Ports, verdeckte Weiterleitungen (`url=`, `redirect=`, `r=` und Parameterwerte, die selbst eine Adresse sind) und Kampagnenkennungen, die nicht konfiguriert sind.
- Schema und Linkprüfung sind aufeinander abgestimmt: was das Schema durchlässt, nimmt die Linkprüfung an, und was die Linkprüfung ablehnt, lässt das Schema gar nicht erst durch. Sonst gäbe es eine Konfiguration, die gültig aussieht und trotzdem nie einen Link erzeugt.
- `rel="sponsored nofollow noopener"` steht jetzt an genau einer Stelle und wird von der Komponente von dort geholt.

**Prozessfehler in dieser Sitzung:** Der Commit zu M09-02 ging mit rotem Lint raus. Ich hatte die Ausgabe von `npm run lint` nur bis zur letzten Zeile gelesen statt den Exit-Code zu prüfen. Das war das dritte Mal in dieser Sitzung, dass ein Commit vor grüner Prüfkette rausging; seitdem wird jede Stufe über ihren Exit-Code geprüft.

| M09-04 | `content-data/insurance-disclosures/`, `disclosures.ts`, `tests/content-policy.test.ts` | `npx vitest run tests/content-policy.test.ts` | 11 Tests; fünf Hinweistexte, alle auch ohne Partner gültig |

- Die Hinweistexte liegen in `content-data/`, nicht im Bauteil: sie sind redaktionell und gelten **auch ohne Partner**. Ein Text, der nur mit Partner erschiene, wäre kein Verbraucherhinweis, sondern Teil der Werbung — dafür gibt es das Feld `appliesWithoutPartner`, und es steht bei allen fünf auf `true`.
- Die Prüfung sucht nach Wortlaut, nicht nach Absicht: garantierte Erstattung, zugesicherte Versicherbarkeit, Testsieger, „bester Tarif“, erfundene Monatsbeiträge, Verkaufsdruck. Sätze, die eine solche Aussage ausdrücklich verneinen, zählen nicht — sonst könnte die Seite nicht einmal sagen, was sie nicht tut.
- Der Prüfer prüft sich selbst: fünf Beispielsätze müssen anschlagen, zwei verneinende dürfen es nicht. Beim ersten Lauf fiel genau das auf — „Die Erstattung ist garantiert“ rutschte durch, weil mein Muster die beiden Wörter direkt nebeneinander erwartete, und „niemand“ fehlte in der Verneinungsliste.
- Ein Test hält fest, wo der Partnerhinweis eingebunden sein darf: bisher nur auf der Probe-Seite. Kommt eine Versicherungsseite dazu, erzwingt der Test eine ausdrückliche Entscheidung statt eines stillen Einbaus in eine Kosten-, Karten- oder Notfallseite.

| M09-05 | `tests/insurance-integration.test.ts`, Kennzeichnungspflicht in `partner.ts` | `npx vitest run tests/insurance-integration.test.ts` | 14 Tests über den ganzen Weg von der Konfiguration bis zum Link |

- Geprüft wird der **Durchlauf**, nicht ein Baustein: Konfiguration → Freigabeentscheidung → Werbekennzeichnung → Ziel-URL → Hinweistexte. Sieben gesperrte Zustände sind abgedeckt: kein Programm, beworben statt zugelassen, beendet, abgelaufen, falscher Markt, Feature aus, fehlende Werbekennzeichnung.
- Neu ist die letzte Regel: ein Programm mit leerer Werbekennzeichnung erzeugt keinen Hinweis. Das Schema verlangt sie ohnehin — die Regel steht trotzdem noch einmal im Code, weil ein ungekennzeichneter Hinweis schlimmer wäre als gar keiner.
- Ein ungültiges Ziel und eine fehlende Freigabe sind zwei verschiedene Dinge: die Freigabe betrifft das Programm, die Prüfung das Ziel. Ohne gültiges Ziel gibt es auch bei erlaubtem Programm keinen Link.
- Ohne Partner bleiben alle fünf Hinweistexte stehen, ohne Anbieterlink und ohne eine einzige Preisangabe — geprüft wird das mit einer Suche nach `http` und nach Eurobeträgen im ausgegebenen Text.

| M09-06 | `docs/reviews/insurance.md`, Blockerregister, `TODO.md` | — | **blockiert (B-003)**, keine Freigabe erfunden |

M09 ist damit inhaltlich fertig und an genau einer Stelle offen: es gibt keinen Partnervertrag und keine Prüfung der konkreten Ausgestaltung nach § 34d GewO. Technisch fehlt nichts — deshalb steht in `docs/reviews/insurance.md` ausdrücklich, dass die Aufgabe nicht an der Umsetzung hängt, sondern an einer Zulassung und einer Prüfung, die niemand hier erfinden kann.

## 2026-09-07 — Sitzung 9 (Fortsetzung): M12 beginnt

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M12-01 | `content-data/travel/scope.json`, `src/features/travel/scope.ts`, Reiseseite, `docs/TRAVEL_SCOPE.md` | `npx vitest run tests/travel`, `npm run test:e2e:features` | 17 Unit- und 10 E2E-Tests; vier Zielstaaten, zehn benannte Ausnahmen |

- Die Seite beginnt mit ihrer Grenze, nicht mit ihrem Können: vier Zielstaaten, private begleitete Reise, Hund oder Katze ab zwölf Monaten, bis zu fünf Tiere. Alles andere steht als benannter Fall mit Begründung darunter.
- Der wichtigste Satz steht wörtlich auf der Seite: **nicht geprüft heißt nicht unzulässig.** Ein „wird nicht unterstützt“ wird sonst als „geht nicht“ gelesen.
- `pruefeUmfang()` ist fail-closed und sammelt alle Gründe: ein unbekanntes Alter ist nicht „erwachsen“, ein unbekanntes Land nicht „vermutlich EU“. Wer zwei Dinge ändern muss, erfährt beide.
- Die Altersgrenze von zwölf Monaten ist ausdrücklich eine Umfangsgrenze dieser Anwendung und keine Rechtsaussage. Sie steht so in der Datei, in der Dokumentation und im Schemakommentar.
- Es gibt bewusst **kein** Formular und keine Beispielprüfung, solange keine belegten Regeln vorliegen. Ein E2E-Test hält das fest.

| M12-02 | `src/features/travel/engine.ts`, `tests/travel/engine.test.ts`, Priorität und Anforderungs-ID im Regelschema | `npx vitest run tests/travel` | 37 Tests; unbekannt bleibt unbekannt, ungeprüfte Regeln fließen nicht ein |

- Sieben feste Prädikate, kein `eval`, keine Funktion aus JSON. Ein unbekannter Operator wirft einen Fehler, statt die Regel zur Hälfte auszuwerten.
- `unknown` ist ein eigener Zustand, kein Zwischenschritt zu „nein“: eine fehlende Angabe ergibt weder erfüllt noch unerfüllt. Bei `all` schlägt ein sicher unerfüllter Teil eine offene Frage, bei `any` ist es umgekehrt.
- Kalenderrechnung in UTC, geprüft an Monats-, Jahres-, Schaltjahres- und Zeitumstellungsgrenzen. Ein unmögliches Datum wie der 31. Februar gilt als unbekannt, nicht als gültig.
- Regeln ohne fachliche Freigabe oder außerhalb ihres Geltungszeitraums werden nicht ausgewertet — verschwinden aber nicht still, sondern stehen mit Grund in der Liste der übersprungenen Regeln.
- Ohne eine einzige auswertbare Regel ist das Gesamtergebnis `unknown`, nicht „alles in Ordnung“. „Wir haben nichts gefunden“ ist keine Unbedenklichkeit.
- Neu im Regelschema: `requirementId` und `priority`. Zwei Regeln zur selben Anforderung schließen einander aus; die höhere Priorität gewinnt, die verdrängte wird ausgewiesen.

| M12-03 | `content-data/travel/rules/eu-intra-2026.json`, `src/features/travel/rules.ts`, `docs/reviews/travel-sources.md` | `npx vitest run tests/travel/rules.test.ts` | 15 Tests; 40 vorbereitete Regeln, keine davon freigegeben |

- **Die Rechtsgrundlage ist eine andere als erwartet.** Aus dem Gedächtnis hätte ich die Verordnung (EU) Nr. 576/2013 genommen. Tatsächlich gilt seit dem 22. April 2026 die Delegierte Verordnung (EU) 2026/131; 576/2013 war nach Artikel 277 der Verordnung (EU) 2016/429 nur noch bis zum 21. April 2026 anwendbar. Nachgelesen auf EUR-Lex, Artikel 33.
- Fünf Anforderungen stehen mit Fundstelle im Regelsatz: Kennzeichnung (Art. 7), Tollwutimpfung mit 21-Tage-Frist (Art. 8 i. V. m. Anhang VII Teil 1 der Delegierten Verordnung (EU) 2020/688), Identifizierungsdokument (Art. 11), Begleitung (Art. 3/4) und Höchstzahl fünf (Art. 3).
- Die österreichische Behördenseite verweist mit Stand 2023 weiterhin auf 576/2013, die niederländische nennt keine eigenen Anforderungen, und die italienische Seite liefert eine Bot-Prüfung statt Inhalt. Sie wurde **nicht umgangen**; der Punkt steht als offene Frage in der Quellenprüfung.
- Keine der 40 Regeln ist fachlich freigegeben. Ein Test belegt, dass die Maschine selbst bei lückenlosen Angaben kein grünes Ergebnis liefert, sondern `unknown` mit Begründung.
- Der Regelsatz steht einmal und wird deterministisch auf 4 Ziele × 2 Tierarten × 5 Anforderungen ausgerollt. 24 gleichlautende Dateien wären 24 Gelegenheiten für einen Tippfehler.

| M12-04 | `src/features/travel/wizard.ts`, `wizard-ui.ts`, Formular und Ergebnisliste auf der Reiseseite, Vorschaumodus im Motor | `npm run test:e2e:features` (128 Tests) | 5 Checklistenpunkte, nie ein grünes Gesamtergebnis |

- Der Vorschaumodus steht **im Motor**, nicht im Text: `vorschau: true` wertet auch nicht freigegebene Regeln aus, deckelt das Gesamtergebnis aber hart auf `unknown`. Ein `not_fulfilled` bleibt stehen — ein klarer Mangel ist auch aus einer vorbereiteten Regel ein nützlicher Hinweis, eine ungeprüfte Unbedenklichkeit dagegen nicht.
- Reihenfolge im Ablauf: erst Umfang, dann Regeln. Eine nicht unterstützte Route bekommt gar keine Checkliste, sondern die Begründung, warum nicht.
- „Weiß ich nicht“ ist eine gültige Antwort und wird nirgends zu ja oder nein. Fehlt eine Angabe, bleibt genau der Punkt offen — und das Gesamtergebnis auch.
- Fristen werden gegen den **Reisetag** geprüft, nicht gegen den Tag des Ausfüllens. Ein Test belegt beides mit derselben Impfung und zwei Reisedaten.
- Alles läuft lokal: ein E2E-Test protokolliert alle Anfragen und belegt, dass keine einzige den Rechner verlässt.
- Zwei ältere Tests hatten Annahmen aus M12-01, die nicht mehr stimmen: „kein Formular auf der Seite“ und die Pflichtfeldprüfung des Reisedatums. Beide sind auf die Sache umgeschrieben, nicht gelöscht.

| M12-05 | `content-data/travel/packing-list.json`, `packing.ts`, `laender.ts`, `src/pages/de-de/reisecheck/[ziel].astro`, Druckregeln | `npm run test:e2e:features` (142 Tests) | vier Zielseiten, 16 Packlisteneinträge, keine Medikamente |

- Zielseiten entstehen **nur** für die vier unterstützten Ziele. Für andere gibt es keine Seite, auch keine mit „bald“: eine Seite zu einem Land, dessen Regeln niemand gelesen hat, wäre eine Auskunft.
- Die Packliste trennt Aufgaben aus Regeln von Unterlagen und Ausrüstung. Jede regelbezogene Aufgabe verweist auf eine tatsächlich vorhandene Anforderung — der Loader wirft, wenn die Anforderung verschwindet, und ein Test prüft zusätzlich die Gegenrichtung: jede Anforderung hat eine Aufgabe.
- Keine Medikamente, keine Wirkstoffe, keine Dosierungen. Der Test prüft die Einträge, nicht den Hinweistext darüber — der darf die Wörter nennen, weil er sie verneint.
- Beförderungsbedingungen stehen als eigener Abschnitt und ausdrücklich als „etwas anderes“ als die staatlichen Regeln: sie werden weder geprüft noch wiedergegeben.
- Ein Astro-Detail: `getStaticPaths` läuft in einem eigenen Modulkontext und sieht keine Werte aus dem Frontmatter der Seite. Die Ländertabelle liegt deshalb in `src/features/travel/laender.ts` — importiert statt lokal definiert.

| M12-06 | `freigabe.ts` mit Inhaltssignatur, `content-data/travel/approvals.json`, `docs/reviews/travel.md` | `npx vitest run tests/travel/freigabe.test.ts` | 11 Tests; **blockiert (B-004)**, keine Freigabe erfunden |

- Der externe Teil — eine kompetente fachliche Prüfung — ist ein Blocker und bleibt es. Der technische Teil war es nicht: **die Sperre bei Quelländerung** ist gebaut und getestet.
- Eine Freigabe nennt die Signatur des Inhalts, den sie geprüft hat. Ändert sich eine Frist, ein Wortlaut, eine Fundstelle oder ein Zielland, passt die Signatur nicht mehr und der Check fällt automatisch in die Vorschau zurück. Anmerkungen und Abrufdaten der Quellen ändern die Signatur nicht — sie sagen nichts über den fachlichen Inhalt.
- Die Signatur ist ausdrücklich ein Änderungsmelder und keine Sicherheitsmaßnahme; sie steht so im Code und im Freigabedokument.
- Der Vorschaumodus wird jetzt aus den Daten entschieden (`nurVorschau()`), nicht mehr durch ein hart gesetztes `true` im Wizard.

## 2026-09-07 — Sitzung 9 (Fortsetzung): M13 beginnt

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M13-01 | `scripts/ingest/adapters/awin.ts`, `tests/fixtures/commerce/` | `npx vitest run tests/commerce/awin-adapter.test.ts` | 20 Tests; 50.000 Zeilen in unter einer Sekunde |

- Der Parser bekommt **Bytes, keine Anmeldung**. Woher die Bytes kommen — Fixture oder Abruf mit Secret —, entscheidet der Aufrufer; das gehört zu M13-03.
- CSV zeichenweise nach RFC 4180 statt zeilenweise mit einem regulären Ausdruck. Der Grund steht als Test da: ein Produktname mit eingebettetem Zeilenumbruch, wie er in echten Feeds ständig vorkommt.
- Preise werden aus dem Text in ganzzahlige Cent umgerechnet, nie über `parseFloat`. „ab 9,99“, „kostenlos“ und drei Nachkommastellen werden abgelehnt statt geraten.
- Latin-1 wird abgelehnt statt mit Ersatzzeichen gelesen: ein falsch dekodierter Produktname ist schlimmer als ein Abbruch.
- Fehlt eine Pflichtspalte, bricht der Lauf ab — ein Feed mit anderem Aufbau ist ein anderer Feed. Ungültige Zeilen werden mit Zeilennummer und Grund abgelehnt und gezählt, nicht still übersprungen.
- Die Fixtures sind synthetisch und als solche gekennzeichnet: echte Awin-Feeds sind Vertragsdaten und gehören nicht in ein öffentliches Repository.

| M13-02 | `scripts/normalize/products.ts`, `offers.ts`, `tests/product-match/` | `npx vitest run tests/product-match` | 25 Tests; kein Vergleich bei unbekannter Menge oder Gebindegröße |

- Tierart und Kategorie kommen aus `config/commerce/category-map.json`, nie aus dem Produktnamen. Eine unbekannte Feedkategorie führt zur Ablehnung — „Katzenspielzeug“ im Namen ist kein Beleg für die Tierart.
- Größe und Gebinde kommen aus eigenen Spalten. Milliliter werden **nicht** in Gramm umgerechnet: das wäre eine Annahme über die Dichte.
- `packUnits` darf jetzt `null` sein. Eine unbekannte Gebindegröße als 1 zu führen wäre genau der Multipack-Fehler, den der Meilenstein verbietet; und mit `null` wird nicht verglichen.
- `vergleichbar()` sagt nur bei gleicher geprüfter GTIN oder bei durchgehend bekannten und gleichen Merkmalen ja. Widersprechen sich zwei Einträge mit derselben GTIN, glaubt die Funktion keiner Seite und der Vergleich unterbleibt.
- Unbekannter Versand bleibt `null` statt 0, unbekannte Verfügbarkeit bleibt `unknown` statt „auf Lager“, und ohne Vertrag gibt es weder Anzeige- noch Bilderlaubnis.

| M13-03 | `scripts/build/commerce.ts`, `config/commerce/feeds.json`, `tests/feed-secrecy.test.ts` | `npx vitest run tests/feed-secrecy.test.ts`, `npm run build:commerce` mit und ohne Secret | 20 Tests; Canary taucht in keiner Ausgabe auf |

- Die Feedadresse steht in einem Secret, weil sie einen Zugangstoken enthält. Das Log nennt **den Namen**, nie den Wert — auch kein Präfix, keine Länge, keinen Hash. Ein Test prüft genau das.
- Host-Allowlist aus `config/commerce/feeds.json`: einen Token an einen fremden Host zu senden wäre ein verschenktes Secret. Die Fehlermeldung nennt den Host, aber nie die Query.
- Gelesen wird gedrosselt und **während** des Lesens abgebrochen, nicht danach: ein zu großer Feed soll den Speicher gar nicht erst füllen.
- Die öffentliche Projektion zählt Felder auf, statt zu kopieren. Ein Test hängt ein zusätzliches Feld an den Eingang und belegt, dass es am Ausgang nicht erscheint.
- Ohne Partnervertrag wird nicht abgerufen und nichts geschrieben — auch bei gesetztem Secret. Ein Abruf ohne Zweck belastet nur die Gegenseite.

| M13-04 | `src/features/commerce/pricing.ts`, `OfferCard.astro`, `/entwicklung/angebotsprobe/` | `npx vitest run tests/commerce/pricing.test.ts`, `npm run test:e2e` (198 Tests) | 4 von 6 Karten sichtbar; abgelaufen und ohne Erlaubnis erscheinen nicht |

- Vier Behauptungen sind ausgeschlossen und einzeln getestet: „versandkostenfrei“ bei unbekanntem Versand, „Bestpreis“ über ungleiche Dinge, „günstigster Gesamtpreis“ ohne bekannten Versand und Neukundenpreise im allgemeinen Vergleich.
- Der Vergleich nennt seinen **Bezug**: Gesamtpreis nur, wenn jedes beteiligte Angebot seine Versandkosten nennt, sonst ausdrücklich nur Artikelpreis.
- Ein Beispiel aus dem Test, das den Punkt trägt: 25,99 € mit kostenlosem Versand schlägt 24,99 € plus 3,95 €. Wer nur den Artikelpreis vergleicht, empfiehlt das falsche Angebot.
- Der Grundpreis erscheint nur bei bekannter Füllmenge **und** bekanntem Gebinde; sonst steht dort, dass er nicht berechenbar ist.
- Die Karte rendert ohne Anzeigeerlaubnis und nach Ablauf gar nichts. Die Probe-Seite zeigt sechs Angebote, vier Karten erscheinen.

| M13-05 | `src/features/commerce/filters.ts`, `Catalog.astro`, Route `catalog`, `tests/e2e-features/katalog.spec.ts` | `npx vitest run tests/commerce/filters.test.ts`, `npm run test:e2e:features` (152 Tests) | leerer Katalog mit ehrlicher Begründung, vier erklärte Ordnungen |

- Zulässigkeit wird **vor** dem Filter geprüft: ein Filter kann kein Angebot sichtbar machen, das ohne ihn unsichtbar wäre. Ein Test setzt genau darauf an — er filtert gezielt auf ein gesperrtes Angebot und findet nichts.
- Jede Sortierung nennt ihre Erklärung auf der Seite. Es gibt kein „Relevanz“: das wäre nur ein anderes Wort für „nach unserem Vorteil“. Ein Test hängt ein Provisionsfeld an die Angebote und belegt, dass sich die Reihenfolge nicht ändert.
- Beim Grundpreis stehen Angebote ohne bekannte Füllmenge am Ende — nicht als teuerste und nicht als billigste.
- Der leere Katalog unterscheidet zwei Fälle: „ohne freigegebenen Partnervertrag wird keines angezeigt“ und „zu diesen Filtern ist nichts vorhanden“. Beides ist keine Aussage über den Markt.

| M13-06 | `config/publishers/commerce/`, `angebotsErlaubnis()`, `docs/reviews/commerce-partner.md` | `npx vitest run tests/commerce/partner-slot.test.ts` | 5 Tests; **blockiert (B-005)**, Slot bleibt aus |

- Auch hier war der externe Teil der Blocker und der technische nicht: `angebotsErlaubnis()` prüft je Markt und Stichtag, ob ein freigegebenes Warenprogramm existiert — und **Bildrechte sind eine eigene Erlaubnis**, die nicht aus der Anzeigeerlaubnis folgt.
- Drei Tests halten den ausgeschalteten Slot fest: keine Anzeige- und keine Bilderlaubnis, leerer Katalog mit Begründung, keine öffentliche Angebotsdatei.
- Im Freigabedokument stehen die drei Punkte, die gern übersehen werden: Bildrechte, öffentliche JSON-Weitergabe und Linkmodus sind je eigene Erlaubnisse, keine Folge der Programmfreigabe.

## 2026-09-07 — Sitzung 9 (Fortsetzung): M14 beginnt

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M14-01 | `content-data/taxonomy/care.json`, `toys.json`, `src/features/care/taxonomy.ts` | `npx vitest run tests/care/taxonomy.test.ts` | 14 Tests; zehn Kategorien, acht begründete Ausschlüsse |

- Die Kategorien beschreiben **Zubehör**, keine Wirkung: Bürsten, Krallenpflege, Zahnpflegezubehör ohne Wirkstoff, Mobilitätszubehör, Pflegetextilien — und beim Spielzeug Apportieren, Kauen, Beschäftigung, Katzenspielzeug, Kratzmöbel.
- Die Ausschlussliste ist Pflichtfeld im Schema. Eine Kategorienliste ohne ihre Grenze liest sich wie das Versprechen, alles abzudecken; hier stehen Arzneimittel, Supplemente, medizinische Tests, Antiparasitika und Therapiegeräte mit Begründung.
- `attributErlaubt()` klingt kleinlich und ist der Kern: ein Attribut, das die Kategorie nicht nennt, darf kein Produkt „passend“ machen. „Gut bei Gelenkproblemen“ ist kein Merkmal eines Kauspielzeugs.
- Tests sperren Wirkversprechen in Kategorienamen und Beschreibungen („hilft gegen“, „lindert“, „unzerstörbar“) und verlangen zu jedem Ausschluss eine echte Begründung.

| M14-02 | `src/domain/schemas/product-attributes.ts`, `content-data/attributes/`, `src/features/care/attributes.ts` | `npx vitest run tests/care/attributes.test.ts` | 11 Tests; jedes belegte Attribut hat Fundstelle und Prüfdatum |

- Ein Attribut ohne Herkunft ist eine Behauptung. Das Schema erzwingt deshalb: Beleg nur mit Fundstelle **und** Prüfdatum, unbekannter Wert nur als `unverified`, Zahl nur mit Einheit.
- `unverified` ist kein schwacher Beleg, sondern gar keiner: `darfMatchen()` verlangt bekannten Wert und Beleg. Was niemand weiß, spricht weder für noch gegen ein Produkt.
- Die Prüfdaten sind synthetisch und als solche gekennzeichnet (`dataKind: "synthetic"`). Echte Produktdaten setzen echte Angebotsrechte voraus; eine „geprüfte“ Liste aus einem Feed abgeschrieben täuschte Sorgfalt vor.
- Ein Eintrag steht bewusst als `unverified` mit `null` in den Daten: eine fehlende Herstellerangabe wird nicht zu einer Annahme.
- `ungepruefteAttribute()` benennt, was **nicht** geprüft ist — für die spätere Anzeige mindestens so wichtig wie das Geprüfte.

| M14-03 | `src/features/care/matching.ts`, `src/features/toys/matching.ts`, `tests/toys/matching.test.ts` | `npx vitest run tests/toys` | 15 Tests; Rasse ändert nachweislich nichts |

- Zwei Stufen, streng getrennt: harte Filter schließen aus (Tierart, Herstellergrenze, Größenbereich) — aber nur mit **belegtem** Wert. Eine unbekannte Eigenschaft schließt nichts aus und macht auch nichts passend.
- Der schärfste Test ist der einfachste: dasselbe Produkt, derselbe Bedarf, einmal mit und einmal ohne Rasse — beide Ergebnisse müssen `toEqual` sein. Rasse ist keine Diagnose und schon gar keine Produkteignung.
- Weiche Kriterien gibt es nur als benannte Bedürfnisse mit je einem erklärenden Satz. Ein unbekanntes Bedürfnis wird ignoriert statt großzügig ausgelegt.
- Herstellergrenzen werden nur in klarer Form gelesen: „ab 15 kg“ und „bis 10 kg“ ja, „für große Hunde“ und „ca. 15 kg“ nein.
- Der Spielzeugfinder ist eine Einschränkung derselben Bewertung, kein zweiter Motor: zwei Motoren wären zwei Gelegenheiten, sich zu widersprechen — ein Test vergleicht beide Ergebnisse.

| M14-04 | `Toys.astro` (Finder), `Care.astro`, `src/pages/de-de/pflege/[kategorie].astro`, `finder-ui.ts` | `npm run test:e2e:features` (170 Tests) | Begründung und offene Punkte an jedem Treffer |

- Der Finder beantwortet eine Frage: **was ist nicht ausgeschlossen?** Nicht: was ist das beste Spielzeug. Die Oberfläche sagt das im Ergebniskopf — die Reihenfolge zählt belegte Übereinstimmungen und ist keine Bewertung des Produkts.
- Zu jedem Treffer stehen Begründung **und** offene Punkte. Beim synthetischen Ball sind alle vier Kategoriemerkmale belegt, also fehlt die Zeile über offene Punkte; beim Kauring steht sie da. Beide Fälle sind getestet.
- Ohne Gewichtsangabe wird nichts ausgeschlossen und nichts behauptet: der Treffer hat null Punkte und den Satz „nur nicht ausgeschlossen“.
- Die Pflegeseiten nennen je Kategorie, wonach gefiltert wird, und führen die fünf Ausschlüsse mit Begründung. Produkte stehen dort erst mit Angebotsrechten und geprüften Eigenschaften — statt einer leeren Liste steht genau dieser Satz da.
- Ein Markup-Befund aus dem Test: „keine Übereinstimmung“ und „nicht geprüft“ trugen dieselbe Klasse. Das sind zwei verschiedene Aussagen und haben jetzt zwei Klassen.

| M14-05 | `src/features/care/policy.ts`, `tests/care-safety.test.ts`, `tests/toy-safety.test.ts` | `npx vitest run tests/care-safety.test.ts tests/toy-safety.test.ts` | 19 Tests; neun Regelgruppen, neutrale Texte bleiben möglich |

- Gesperrt sind fünf Gruppen: Heilversprechen, Dosierung und Anwendung, Haltbarkeitsversprechen, erfundene Bewertungen und die automatische Zusatzempfehlung — dazu die Ableitung aus der Rasse.
- Der Prüfer prüft sich selbst: elf Beispielsätze müssen anschlagen, acht neutrale Produkttexte dürfen es nicht. Ohne diese zweite Hälfte wäre die Regel eine Sperre gegen alles.
- Auch **Attributnamen** sind geprüft: `jointSupport`, `healthBenefit`, `calmingEffect` und `therapyUse` sind gesperrt, weil ein Name allein schon eine medizinische Eignung behaupten kann.
- Geprüft werden Taxonomien, Attributwerte, Bedürfniserklärungen, die Seiten und die im Matching erzeugten Sätze — also auch das, was zur Laufzeit entsteht und in keiner Datei steht.
- Der Prüfer selbst wird nicht mit sich selbst geprüft: er enthält die verbotenen Wörter zwangsläufig, weil er sie definiert.

| M14-06 | `docs/reviews/care-toys.md`, Blockerregister, `TODO.md` | — | **blockiert (B-006)**, keine echten Produkte erfunden |

M14 ist damit inhaltlich fertig. Der offene Punkt ist kein technischer: echte Produkte lassen sich erst abnehmen, wenn es Angebotsrechte gibt — und dann Attribut für Attribut mit Fundstelle. Der Ablauf steht geschrieben, samt des Satzes, der die ganze Aufgabe trägt: fehlt eine Angabe, bleibt sie leer. Sie wird nicht aus der Beschreibung, aus einem Vergleichsprodukt oder aus einem Sprachmodell ergänzt.

## 2026-09-07 — Sitzung 9 (Fortsetzung): M15 beginnt

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M15-01 | `src/domain/schemas/food.ts`, `content-data/taxonomy/food.json`, `src/features/food/taxonomy.ts` | `npx vitest run tests/food` | 13 Tests; „Junior“ im Namen bleibt ohne Wirkung |

- Lebensphase und Futterart kommen aus der Deklaration und brauchen eine Fundstelle. Ein Test führt ein Produkt mit „Junior“ im Namen und erwartet `lifeStage: null` — der Name ist Text, kein Beleg.
- Ein Nährwert ohne **Einheit** oder ohne **Bezug** ist keine Angabe: „22 Prozent Protein“ heißt etwas anderes je nachdem, ob es sich auf Frisch- oder Trockenmasse bezieht. Beides ist Pflicht, sobald ein Wert dasteht.
- Ein nicht deklarierter Nährwert wird als `null` zurückgegeben, nicht als 0.
- Die Gegenliste der Futtertaxonomie nennt Diätfuttermittel, Nahrungsergänzung, Rationsberechnung und Nährwertscores — mit Begründung. Der Bereich vergleicht Mengen und Preise, nicht Qualitäten.

| M15-02 | `src/features/food/unit-price.ts`, `tests/food-pricing.test.ts` | `npx vitest run tests/food-pricing.test.ts` | 14 Tests; 400 g, 1 kg, 6 × 400 g und kaputte Mengen |

- Die drei Pflichtfälle stehen als Rechnung im Test: 1 kg für 10,00 € sind 10,00 € je kg; 400 g für 3,00 € sind 7,50 € je kg; 6 × 400 g für 9,49 € sind 3,95 € je kg — gerechnet auf 2400 g, nicht auf eine Dose.
- Fehlerhafte Mengen fängt das Schema ab, bevor gerechnet wird: 0 g, negative Mengen, 400,5 g und ein Gebinde von 0 sind ungültig.
- Der Versand bleibt draußen: ein Versandanteil je Kilogramm hinge an der Bestellmenge und wäre für einen Vergleich unbrauchbar. Ein Test vergleicht denselben Grundpreis mit und ohne Versand.
- Verschiedene **Packungsgrößen** sind verschiedene Varianten und werden nicht verglichen; verschiedene **Gebindegrößen** derselben Packung schon — genau dafür gibt es den Grundpreis.
- Fehlt bei einem Angebot die Menge, unterbleibt der Vergleich für alle. Ein Ranking, in dem ein Teilnehmer nicht mitgerechnet werden kann, ist irreführend.

| M15-03 | `src/features/food/catalog.ts`, `search-ui.ts`, `Food.astro`, `src/pages/de-de/futter/[produkt].astro` | `npx vitest run tests/food`, `npm run test:e2e:features` (188 Tests) | Suche über Name, Marke und Nummer; vier Produktseiten |

- Die Barcodeeingabe ist eine Texteingabe: eine abgetippte Nummer genügt, Bindestriche und Leerzeichen stören nicht, eine Kamera braucht niemand. Ein Test tippt `4006-3813 33931` und findet das Produkt.
- Die Suche findet, sie bewertet nicht. Jeder Treffer sagt, worauf er beruht — Nummer, Produktname oder Marke.
- Kein Treffer heißt „hier nicht erfasst“, nicht „gibt es nicht“.
- Die Produktseite zeigt jeden deklarierten Nährwert mit **Bezug** und **Quelle** und nennt darunter, was nicht deklariert ist — mit dem Satz, auf den es ankommt: eine fehlende Angabe ist keine Null.
- Ohne Nährwerte bleibt die Seite nutzbar: Menge und Grundpreisbasis stehen unabhängig davon da.
- Der Angebotsteil ist leer und sagt warum. Verschiedene Gebindegrößen derselben Packung sind verlinkt; verschiedene Packungsgrößen ausdrücklich nicht.

| M15-04 | `docs/OPFF_SPIKE.md`, `config/sources/opff.json` | CSV-Export vom 08.09.2026 heruntergeladen und ausgezählt | 15.136 Produkte, 1.281 mit Deutschlandbezug, **2** davon mit Proteinwert |

- **Der Befund, auf den es ankommt:** Nährwerte fehlen in Open Pet Food Facts fast vollständig — `proteins_100g` bei 241 von 15.136 Produkten, bei den 1.281 mit Deutschlandbezug bei zwei. Als Nährwertquelle ist der Datensatz damit nicht geeignet. Das ist gemessen, nicht geschätzt.
- Brauchbar sind Name (90 %), Menge (82 %) und Marke (78 %) bei deutschen Produkten, jeweils über die GTIN — 96 Prozent der Codes liegen als EAN-13 vor.
- `robots.txt` verbietet `/api` und `/cgi` für alle User-Agents. Systematische API-Abfragen unterbleiben deshalb; bezogen wird der angebotene Export unter `/data` (3,29 MB gzip, täglich erneuert).
- **Der geforderte Trefferanteil gegen echte Feed-GTINs wurde nicht gemessen und auch nicht geschätzt:** ohne freigegebenes Warenprogramm gibt es keine Sortimentsliste. Das steht als offener Punkt im Spike, statt als Zahl.
- Lizenzfolgen: ODbL mit Share-Alike für abgeleitete Datenbanken, Bilder unter CC BY-SA und deshalb ausgeschlossen, Attribution Pflicht — und Open Food Facts garantiert die Richtigkeit ausdrücklich nicht.
- Der Registryeintrag steht auf `pending` und ist damit die erste bewusst ungeprüfte Quelle. Vier Tests hatten die Annahme „alle Quellen sind freigegeben“ eingebaut; sie prüfen jetzt die Regel statt des Zustands.

| M15-05 | `scripts/ingest/adapters/opff.ts`, `src/features/food/enrichment.ts`, `tests/opff-fallback.test.ts` | `npx vitest run tests/opff-fallback.test.ts` | 15 Tests; zwei Riegel, Rückfall auf Etikettangaben |

- Der Adapter ist gebaut und **abgeschaltet** — mit der gemessenen Begründung aus dem Spike statt einer Vermutung. Er bleibt im Baum, weil die Frage wiederkommt, sobald es ein echtes Sortiment gibt; dann ist die Stichprobe nachzuholen und nicht der Parser neu zu schreiben.
- Zwei Riegel, und die Reihenfolge ist wichtig: **erst das Recht** (`status: "pending"` sperrt), **dann der Schalter** (`foodEnrichment: false`). Ein Test schaltet das Feature ein und belegt, dass die Sperre trotzdem greift.
- Der Export ist tabulatorgetrennt, obwohl die Datei auf `.csv` endet — der Parser weiß das, statt an einem Komma zu scheitern.
- Übernommen werden vier Felder. `image_url` steht ausdrücklich nicht dabei: die Bilder stehen unter CC BY-SA und können Rechte Dritter enthalten. Ein Test prüft, dass keine Bildadresse durch die Projektion kommt.
- „1 kg“ bleibt Text. Eine Umrechnung wäre eine Deutung, und die Mengenrechnung hat mit `netContentGrams` bereits eine belegte Grundlage.
- Zwei Tests halten fest, was **nicht** im Datenbestand liegen darf: keine FEDIAF-Bedarfstabelle und keine Bildadresse aus dem offenen Datensatz.

| M15-06 | `docs/reviews/food.md`, Abnahmetests in `tests/e2e-features/futter.spec.ts` | `npm run test:e2e:features` (200 Tests) | kein Score, Rohdaten getrennt, Unbekanntes benannt |

- Der Test auf „Testsieger“ und „Score“ liest den **behauptenden** Teil der Seite: Ausschlussliste und Hinweisboxen werden vorher entfernt, weil sie die Wörter nennen dürfen — sie verneinen sie. Umgekehrt prüft derselbe Test, dass die Verneinung tatsächlich dasteht.
- Rohdaten und Angebotsteil sind getrennte Abschnitte; die Nährwerttabelle steht nicht im Angebotsteil, und der Angebotsteil rechnet nicht mit Nährwerten.
- Jeder Labelwert trägt Einheit, Bezug und verlinkte Quelle mit Prüfdatum. Fehlende Angaben stehen als „nicht deklariert“ da, mit dem Satz „eine fehlende Angabe ist keine Null“.
- Ein Preisstand ist derzeit nirgends zu sehen, weil es kein Angebot mit Anzeigeerlaubnis gibt. Das Abnahmedokument sagt das, statt die Prüfung als bestanden zu buchen.
- Die Futterseiten laufen jetzt zusätzlich durch dieselben Inhaltsregeln wie Pflege und Spielzeug.

## 2026-09-08 — Sitzung 10: M16 beginnt

| Aufgabe | Änderung | Tatsächlich ausgeführte Prüfung | Ergebnis |
|---|---|---|---|
| M16-01 | `src/features/profile/state.ts`, `profile-ui.ts`, Seite `/de-de/mein-tier/` | `npx vitest run tests/profile`, `npm run test:e2e:features` (216 Tests) | 11 + 8 Tests; kein Speichern, keine Übertragung |

- Das Profil lebt im Arbeitsspeicher des Tabs. Drei E2E-Tests halten das fest: keine Anfrage beim Eintippen, kein Eintrag in `localStorage`, `sessionStorage` oder Cookies, und nach dem Neuladen ist das Feld leer.
- Ein **leeres Profil ist gültig**. Vollständig genug für die Vorauswahl ist es mit Tierart und Rufname; alles andere ist freiwillig, und die Seite sagt bei fehlendem Gewicht, dass dann nichts wegen der Größe gefiltert wird.
- Kein Feld identifiziert eine Person: keine E-Mail, keine Adresse, keine Telefonnummer, kein Haltername, keine Gesundheitsangabe. Ein Test prüft die Feldliste des erzeugten Profils gegen genau diese Wörter.
- Interessen kommen aus einer festen Liste. `bereinigeInteressen()` verwirft alles Unbekannte — auch `__proto__` und `constructor`, die sonst gern durch einen naiven Filter rutschen.
- Die Rasse ist eine freie Angabe für die eigene Übersicht und löst nichts aus. Der Satz steht auf der Seite, weil das Matching in M14-03 bereits so gebaut ist.

| M16-02 | `src/features/profile/storage.ts`, Knöpfe auf der Profilseite, `tests/profile-storage.test.ts` | `npx vitest run tests/profile-storage.test.ts`, `npm run test:e2e:features` (226 Tests) | 18 + 5 Tests; Speichern und Löschen als Handlung |

- Gespeichert wird **nichts automatisch**. Zwei Knöpfe, zwei Meldungen — und ein dritter Test, der belegt, dass ohne Knopfdruck kein Schlüssel im Speicher landet.
- Fehlschläge sind Ergebnisse, keine Ausnahmen: privater Modus, volles Kontingent, abgeschaltete Speicherung. Jede Funktion gibt Erfolg, Fehlerart und einen Klartext zurück, und die Oberfläche zeigt ihn.
- Der Stand trägt seine Fassung. Fassung 1 kannte keine Interessen; die Migration ergänzt eine **leere** Liste, statt welche zu erfinden. Ein Stand aus einer unbekannten Fassung wird gar nicht gelesen — auch nicht halb.
- Was im Speicher liegt, ist eine Eingabe: der Inhalt läuft durch das Schema, und eingeschmuggelte Interessen wie `__proto__` fallen heraus.
- Löschen heißt löschen: ein Schlüssel, kein Papierkorb, kein Rest. Ein E2E-Test speichert, löscht, lädt neu und findet ein leeres Formular.
- Die Seite sagt ausdrücklich, dass es **keinen Geräteabgleich und keine Sicherung** gibt und dass ein geleerter Browser-Speicher den Stand mitnimmt.

| M16-03 | `src/features/profile/favorites.ts`, `favorites-ui.ts`, Seite `/de-de/merkliste/`, `src/features/map/data.ts` | `npx vitest run tests/profile/favorites.test.ts`, `npm run test:e2e:features` (240 Tests) | 15 + 14 Tests; nur Kennungen im Speicher |

- Gemerkt werden **Kennungen, keine Kopien**. Ein E2E-Test liest den Speicher aus und prüft, dass weder Produktname noch Preis darin vorkommen — vier Felder: Art, Kennung, Koordinate, Zeitpunkt.
- Bei Orten wird die Koordinate mitgespeichert. Sie ist kein Inhalt, sondern der Schlüssel zur richtigen Datenzelle: ohne sie ließe sich ein Ort im bundesweiten Bestand nicht wiederfinden, ohne alles zu laden.
- Ein Eintrag, der sich nicht mehr auflösen lässt, steht als „nicht mehr erfasst“ da — ohne Link, ohne alten Namen, ohne alten Preis. Ein Test legt einen solchen Eintrag an und prüft genau das.
- Ein kaputter Eintrag wirft nicht die ganze Liste weg: die gültigen bleiben. Eine Merkliste enthält nichts, was sich rekonstruieren ließe.
- Nebenbei entstanden: `src/features/map/data.ts`. Das Laden von Manifest und Datenzellen lag bisher in `list-ui.ts`; die Merkliste braucht dasselbe. Zwei Module mit je eigenem Lader laden am Ende verschieden — und nur eines davon richtig.
