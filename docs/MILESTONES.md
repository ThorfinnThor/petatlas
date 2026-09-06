# Arbeitspakete M00–M19

120 einzelne Aufgaben. Jede ID bleibt stabil. Der tatsächliche Status liegt ausschließlich in `project/tasks.json`. Alle Aufgaben beginnen als `todo`.

Externe Konto-, Fach- und Launchfreigaben sind separat markiert. Sie dürfen nicht das Implementieren unabhängiger Module verhindern. Maßgeblich sind die einzelnen Dependencies, nicht pauschal die Fertigstellung eines gesamten vorangehenden Meilensteins.

## M00 — Projektvertrag und sichere Ausgangslage

**Ziel:** Projektgrenzen festhalten, bevor ein Agent Repository- oder Infrastrukturentscheidungen trifft.

**Technische Voraussetzungen:** keine

### M00-01 — Arbeitsverzeichnis prüfen

**Umsetzung:** Bestehende Dateien, git status, vorhandene Remotes und fremde Änderungen inventarisieren. Bei bestehendem Produkt nur additiv arbeiten; kein neues Scaffold darüberkopieren.

**Liefergegenstände:** `docs/BASELINE.md`

**Abnahme:** Ein dokumentierter Ausgangszustand existiert; keine fremden Änderungen wurden gelöscht.

**Abhängigkeiten:** keine

### M00-02 — Festgelegten Umfang übernehmen

**Umsetzung:** ADR-001 bis ADR-016 lesen und Startumfang, aktive Märkte und ausdrücklich ausgeschlossene Funktionen festhalten.

**Liefergegenstände:** `docs/DECISIONS.md`; `config/launch.json`

**Abnahme:** Deutschland ist der einzige aktive Markt; kein ungeplantes Backend und keine Zusatzprodukte sind in der Roadmap.

**Abhängigkeiten:** M00-01

### M00-03 — Benennung zentralisieren

**Umsetzung:** Arbeitstitel PetAtlas ausschließlich als austauschbaren internen Namen verwenden; Branding, Basisdomain und Betreiberangaben zentral konfigurieren. Keine Markenverfügbarkeit behaupten.

**Liefergegenstände:** `config/site.ts`; `docs/EXTERNAL_SETUP.md`

**Abnahme:** Namenswechsel ist ohne Suchen/Ersetzen in Fachlogik möglich; fehlende echte Domain sperrt production, nicht development.

**Abhängigkeiten:** M00-02, M00-01

### M00-04 — Autonomierechte festlegen

**Umsetzung:** Lesen, Codeänderungen, lokale Tests und kleine lokale Commits erlauben. Öffentliche Repo-Erstellung nur im eindeutig zugeordneten Account; kein bestehendes privates Repo ungeprüft umstellen.

**Liefergegenstände:** `CLAUDE.md`; `docs/SECURITY_SCOPE.md`

**Abnahme:** Erlaubte Aktionen, externe Schreibgrenzen und verbotene destruktive Befehle sind konkret dokumentiert.

**Abhängigkeiten:** M00-03, M00-01

### M00-05 — Kosten- und Lizenzgrenzen festlegen

**Umsetzung:** Kein kostenpflichtiger Tarif, keine Domainbestellung und keine blanket Open-Source-Lizenz ohne Entscheidung. Rechtehinweise für eigene und fremde Inhalte trennen.

**Liefergegenstände:** `licenses/README.md`; `docs/DECISIONS.md`

**Abnahme:** Repo-Publicity wird nicht mit MIT oder pauschaler Weiterverwendungserlaubnis gleichgesetzt.

**Abhängigkeiten:** M00-04, M00-01

### M00-06 — Externe Voraussetzungen erfassen

**Umsetzung:** GitHub-Inhaber, Cloudflare-Projekt, Domain, Betreiberangaben, Partneraccounts und Fachreviews in einer Liste mit Status und zuständigem Entscheider erfassen. Nur Secret-Namen, niemals Werte.

**Liefergegenstände:** `docs/EXTERNAL_SETUP.md`; `docs/BLOCKERS.md`

**Abnahme:** Fehlende Angaben sind sichtbar, aber lokale Entwicklung ist nicht blockiert.

**Abhängigkeiten:** M00-05, M00-01

## M01 — Repository und technische Grundausstattung

**Ziel:** Ein schlankes, lokal reproduzierbares Astro-Projekt erstellen und den öffentlichen Git-Pfad sicher vorbereiten.

**Technische Voraussetzungen:** M00-01, M00-02

### M01-01 — Astro-Scaffold anlegen

**Umsetzung:** Astro static, TypeScript strict, npm-Lockfile und Node-24-LTS-Linie einrichten. Bestehende kompatible Struktur erhalten.

**Liefergegenstände:** `package.json`; `package-lock.json`; `astro.config.mjs`; `.nvmrc`

**Abnahme:** Ein sauberer Clone lässt sich reproduzierbar installieren; Startseite wird rein statisch gebaut.

**Abhängigkeiten:** M00-01, M00-02

### M01-02 — Öffentliches Repo einrichten **[Externer Freigabepunkt]**

**Umsetzung:** Nach Secret-/Historienprüfung ein neues public Repo im autorisierten GitHub-Account erstellen oder das explizit zugewiesene Repo verwenden. Origin und Default-Branch dokumentieren.

**Liefergegenstände:** `docs/REPOSITORY.md`; `GitHub repository`

**Abnahme:** Echte Remote-URL und Public-Status geprüft; wenn Zugriff fehlt, Integration blocked statt behauptetem Erfolg.

**Abhängigkeiten:** M00-01, M00-02, M01-01

### M01-03 — Basisqualität installieren

**Umsetzung:** Linting, Typecheck, Vitest, Playwright und Formatierung konfigurieren. Abhängigkeiten pinnen und Versionsbegründung festhalten.

**Liefergegenstände:** `eslint config`; `tsconfig`; `vitest config`; `playwright config`

**Abnahme:** Ein absichtlich eingeführter Typ-/Lintfehler würde die Pipeline scheitern lassen; Testsample läuft.

**Abhängigkeiten:** M00-01, M00-02, M01-01

### M01-04 — Geheimnisse und Buildreste ausschließen

**Umsetzung:** .gitignore für .work, .generated, dist, echte .env-Dateien und Reports; .env.example ausschließlich mit leeren oder sicheren Beispielwerten anlegen.

**Liefergegenstände:** `.gitignore`; `.env.example`; `scripts/checks/secrets.ts`

**Abnahme:** Canary-Secret wird im Repo-/dist-Audit erkannt; Fixtures bleiben eindeutig bezeichnet.

**Abhängigkeiten:** M00-01, M00-02, M01-03, M01-01

### M01-05 — Test- und Produktionsmodus trennen

**Umsetzung:** development, preview und production als explizite Build-Modi implementieren. Fixture-Daten dürfen nicht durch eine fehlende Umgebungsvariable versehentlich live werden.

**Liefergegenstände:** `config/build.ts`; `fixtures/`; `tests/build-mode.test.ts`

**Abnahme:** Fixture-Build funktioniert ohne Netz; production verweigert ungeklärte Pflichtkonfiguration.

**Abhängigkeiten:** M00-01, M00-02, M01-04, M01-01

### M01-06 — Grundlegenden Browser-Smoke ausführen

**Umsetzung:** Startseite, 404 und ein Formular unter lokalem statischem Preview im Browser öffnen, Konsolenfehler und Mobilansicht prüfen.

**Liefergegenstände:** `tests/e2e/smoke.spec.ts`; `docs/TOOLCHAIN.md`

**Abnahme:** Tatsächliche Browserprüfung mit Screenshot und Testlog; keine nur angenommene Funktionsfähigkeit.

**Abhängigkeiten:** M00-01, M00-02, M01-05, M01-01

## M02 — Statussteuerung und Fortsetzungsprotokoll

**Ziel:** Den Arbeitsstand unabhängig vom Chatfenster nachvollziehbar und nach Unterbrechungen fortsetzbar machen.

**Technische Voraussetzungen:** M00-02

### M02-01 — Aufgabenmanifest übernehmen

**Umsetzung:** project/tasks.json aus dem Paket als alleinige maschinenlesbare Statusquelle übernehmen. IDs erhalten; neue Aufgaben bekommen neue IDs.

**Liefergegenstände:** `project/tasks.json`

**Abnahme:** Alle 120 Aufgaben sind eindeutig; vorhandene Nachweise werden beim Aktualisieren nicht überschrieben.

**Abhängigkeiten:** M00-02

### M02-02 — Statuswerkzeug integrieren

**Umsetzung:** Mitgelieferten Python-Statushelfer behalten; optional npm-Alias status ergänzen. Filter pro Meilenstein und JSON-Ausgabe unterstützen.

**Liefergegenstände:** `scripts/project_status.py`; `package.json`

**Abnahme:** Statusgesamtübersicht und Status M08 funktionieren ohne laufende Website.

**Abhängigkeiten:** M00-02, M02-01

### M02-03 — Statusartefakte pflegen

**Umsetzung:** STATUS, WORKLOG, BLOCKERS und HANDOFF als knappe menschliche Ansichten festlegen; task manifest bleibt autoritativ.

**Liefergegenstände:** `docs/STATUS.md`; `docs/WORKLOG.md`; `docs/HANDOFF.md`

**Abnahme:** Ein Beispielübergang todo -> in_progress -> done aktualisiert die Ansichten konsistent.

**Abhängigkeiten:** M00-02, M02-02, M02-01

### M02-04 — Done-Nachweise validieren

**Umsetzung:** Automatische Prüfung auf Abhängigkeiten, Nachweise bei done, begründete Blocker und höchstens eine koordinierende Hauptaufgabe in Arbeit anlegen.

**Liefergegenstände:** `scripts/checks/task-state.ts oder Statushelfer-Erweiterung`; `Tests`

**Abnahme:** Eine done-Aufgabe ohne Nachweis oder ein unbekannter Dependency-Key führt zu Fehler.

**Abhängigkeiten:** M00-02, M02-03, M02-01

### M02-05 — Arbeits- und Fehlerloop definieren

**Umsetzung:** Je Aufgabe lesen, prüfen, implementieren, testen, dokumentieren, committen. Bei drei erfolglosen Korrekturansätzen Ursache/Blocker erfassen und unabhängige Aufgabe wählen.

**Liefergegenstände:** `CLAUDE.md`; `docs/AUTONOMY.md`

**Abnahme:** Protokoll verhindert Endlosschleifen und das künstliche Grünmachen von Tests.

**Abhängigkeiten:** M00-02, M02-04, M02-01

### M02-06 — Wiederaufnahme proben

**Umsetzung:** Kontextwechsel simulieren: neue Sitzung liest nur CLAUDE.md, Status, Handoff und betroffene Spezifikation, identifiziert korrekten nächsten Schritt.

**Liefergegenstände:** `docs/HANDOFF.md`; `docs/WORKLOG.md`

**Abnahme:** Der Arbeitsstand ist ohne frühere Chatnachrichten rekonstruierbar.

**Abhängigkeiten:** M00-02, M02-05, M02-01

## M03 — Domänenmodelle und Internationalisierung

**Ziel:** Fachlogik von Markt, Darstellung und Datenlieferanten entkoppeln.

**Technische Voraussetzungen:** M01-01, M02-01

### M03-01 — Markt- und Locale-Schemas bauen

**Umsetzung:** DE aktiv, US und ein EU-Testmarkt inaktiv; Markt, Sprache, Währung, Zeitzone und Reiseziel als getrennte Konzepte.

**Liefergegenstände:** `src/domain/market.ts`; `config/markets/`; `tests/markets.test.ts`

**Abnahme:** Ein DE-Nutzer mit Reiseziel IT bleibt im Markt DE; keine US-Seite wird generiert.

**Abhängigkeiten:** M01-01, M02-01

### M03-02 — Geld, Einheiten und Datum implementieren

**Umsetzung:** Integer-Geld, kontrollierte Dezimalfaktoren, Gramm/Meter und locale-spezifische Ausgabe; Kalenderdaten von UTC-Zeitstempeln trennen.

**Liefergegenstände:** `src/domain/money.ts`; `units.ts`; `dates.ts`

**Abnahme:** Rundungs-, Währungs-, Einheiten- und Zeitzonengrenzfälle sind getestet.

**Abhängigkeiten:** M01-01, M02-01, M03-01

### M03-03 — Provenienz und Rechte typisieren

**Umsetzung:** Schemas aus ARCHITECTURE umsetzen; null ist unbekannt. Source-ID, Inhaltshash, Lizenz, Geltung und Review separat.

**Liefergegenstände:** `src/domain/source.ts`; `rights.ts`; `schemas/`

**Abnahme:** Unbekannte Rechte oder fehlende Pflichtprovenienz verhindern öffentliche Ausgabe.

**Abhängigkeiten:** M01-01, M02-01, M03-02, M03-01

### M03-04 — Fachschemas implementieren

**Umsetzung:** Product, Offer, Place, FeeItem, CostScenario, TravelRule, PetProfile und OutputManifest mit Zod validieren.

**Liefergegenstände:** `src/domain/schemas/`; `tests/contracts/`

**Abnahme:** Ungültige GTIN, negative Geldwerte, fehlerhafte Koordinaten und ungültige Perioden werden erkannt.

**Abhängigkeiten:** M01-01, M02-01, M03-03, M03-01

### M03-05 — Provider-Schnittstellen definieren

**Umsetzung:** Kosten-, Orts-, Reise- und Commerce-Provider erhalten marktbezogene IDs; unsupported ist ein definierter Rückgabewert.

**Liefergegenstände:** `src/domain/providers.ts`; `config/markets/DE.json`

**Abnahme:** Kein deutsches Gebührenfallback für unbekannten Markt; keine Providerwahl über verstreute if country-Blöcke.

**Abhängigkeiten:** M01-01, M02-01, M03-04, M03-01

### M03-06 — Internationale Isolation testen

**Umsetzung:** Synthetischen US-Anbieter mit USD und Imperial-Anzeige durch dieselben Fachschnittstellen führen; keine echten US-Inhalte abrufen.

**Liefergegenstände:** `tests/international-contracts.test.ts`

**Abnahme:** US-Angebote erscheinen nicht in DE und eine englische Testansicht überschreibt keine deutschen Texte.

**Abhängigkeiten:** M01-01, M02-01, M03-05, M03-01

## M04 — Informationsarchitektur und Bedienoberfläche

**Ziel:** Das gemeinsame Layout für Rechner, Karte, Reise und Produkte erstellen, bevor viele Seiten entstehen.

**Technische Voraussetzungen:** M03-01, M01-01

### M04-01 — Route Registry anlegen

**Umsetzung:** Einheitliche Pfade /de-de/ mit zentralen Slugs, canonical-Regeln und market-aware Link-Helfern definieren.

**Liefergegenstände:** `src/lib/routes.ts`; `config/locales/de-DE.json`

**Abnahme:** Keine hart codierten Domains; Slugänderungen lassen sich mit gezielten Redirects abbilden.

**Abhängigkeiten:** M03-01, M01-01

### M04-02 — Designsystem implementieren

**Umsetzung:** Mobile-first Layout, lesbare Formulare, Ergebnisboxen, Warnungen, Datenstand, Quellen und Werbekennzeichnung als wiederverwendbare Komponenten.

**Liefergegenstände:** `src/components/`; `src/styles/tokens.css`; `layouts/`

**Abnahme:** Desktop/mobile ohne Layoutbruch; Informations- und Werbebereiche sind erkennbar verschieden.

**Abhängigkeiten:** M03-01, M01-01, M04-01

### M04-03 — Navigation und Kernseiten bauen

**Umsetzung:** Home, Rechner, Karte, Reisecheck, Pflege, Spielzeug, Futter, Quellen und Datenstand als echte Templates anlegen. Nicht verfügbare Features aus Navigation entfernen.

**Liefergegenstände:** `src/pages/`; `src/layouts/`

**Abnahme:** Kein Navigationseintrag führt auf leere Coming-soon- oder Fixture-Produktionsseiten.

**Abhängigkeiten:** M03-01, M01-01, M04-02, M04-01

### M04-04 — Statische Suche integrieren

**Umsetzung:** Pagefind nach HTML-Build ausführen; Sprache, Kategorien und Ausschluss privater-/Filterseiten konfigurieren.

**Liefergegenstände:** `scripts/build-search.ts`; `src/components/Search.astro`

**Abnahme:** Suche arbeitet ohne Backend und findet nur freigegebenen statischen Inhalt.

**Abhängigkeiten:** M03-01, M01-01, M04-03, M04-01

### M04-05 — Zugängliche Formulare erstellen

**Umsetzung:** Labels, Tastaturbedienung, Validierungszusammenfassung, Fokusführung und Screenreader-Ankündigung für Ergebnisse implementieren.

**Liefergegenstände:** `src/components/forms/`; `tests/e2e/forms.spec.ts`

**Abnahme:** Rechner- und Filterformulare sind ohne Maus bedienbar; Errors haben programmatische Zuordnung.

**Abhängigkeiten:** M03-01, M01-01, M04-04, M04-01

### M04-06 — Visuellen Baseline-Review durchführen

**Umsetzung:** Reale Browser-Screenshots von Home, Tool und Produktliste auf mehreren Breiten erstellen und offensichtliche Bedienmängel korrigieren.

**Liefergegenstände:** `docs/UI_BASELINE.md`; `E2E-Nachweise`

**Abnahme:** Kein abgeschnittener Text, sichtbarer Fokus und keine ungeklärten Konsolenfehler.

**Abhängigkeiten:** M03-01, M01-01, M04-05, M04-01

## M05 — Quellenregister und Publikationsrechte

**Ziel:** Vor echten Importen maschinenlesbar festlegen, was gelesen, gespeichert und veröffentlicht werden darf.

**Technische Voraussetzungen:** M03-03

### M05-01 — Source Registry anlegen

**Umsetzung:** Konkrete Sources samt Ressource, Publisher, Format, Geltung, Quelle und Lizenzstatus konfigurieren. Kandidaten standardmäßig pending.

**Liefergegenstände:** `config/sources/`; `schemas/source.schema.json`

**Abnahme:** Ein Registryeintrag ist eine konkrete Distribution, kein pauschaler Name wie GovData.

**Abhängigkeiten:** M03-03

### M05-02 — Publikationsklassen umsetzen

**Umsetzung:** public_open, public_display, restricted_raw und local_user trennen; Rechteprüfung je Ziel wie Repo, HTML, JSON, Bild oder Historie.

**Liefergegenstände:** `src/domain/publication-policy.ts`; `tests/rights.test.ts`

**Abnahme:** Ein kommerziell nutzbarer, aber nicht weiterverteilbarer Feed wird für Repo/JSON zuverlässig gesperrt.

**Abhängigkeiten:** M03-03, M05-01

### M05-03 — Attribution und Lizenzseiten bauen

**Umsetzung:** Quellen-/Lizenzhinweise aus derselben Registry erzeugen; OSM-Hinweis direkt in Karte und Datenexporten.

**Liefergegenstände:** `src/pages/de-de/quellen/`; `licenses/`; `components/Attribution.astro`

**Abnahme:** Veröffentlichte Datensätze besitzen korrekte Zuordnung zu Quell- und Lizenzhinweisen.

**Abhängigkeiten:** M03-03, M05-02, M05-01

### M05-04 — Erste offene Quellen verifizieren

**Umsetzung:** GOT und konkrete OSM-Distribution anhand aktueller Primärbedingungen prüfen; Nachweis, Hash und erlaubte Ausgabeformen erfassen.

**Liefergegenstände:** `config/sources/got.json`; `osm.json`; `docs/SOURCE_REVIEWS.md`

**Abnahme:** Echte Fundstellen dokumentiert; keine rückwirkend erfundene pauschale Freigabe.

**Abhängigkeiten:** M03-03, M05-03, M05-01

### M05-05 — ODbL-Datenfluss dokumentieren

**Umsetzung:** Normalisierung, räumliche Filterung und spätere Joins beschreiben; abgeleitete offene Ausgaben und Lizenztexte gezielt bereitstellen.

**Liefergegenstände:** `docs/ODBL_DATAFLOW.md`; `licenses/ODbL-notice.md`

**Abnahme:** Keine Behauptung, getrennte Dateien allein befreiten eigene Joins von ODbL-Pflichten.

**Abhängigkeiten:** M03-03, M05-04, M05-01

### M05-06 — Lizenzänderung und Sperren testen

**Umsetzung:** termsHash-Wechsel, abgelaufene Vertragsrechte und verweigerte Bilderlaubnis simulieren. Betroffene Ausgabe stoppen, übrige Module erhalten.

**Liefergegenstände:** `tests/license-regression.test.ts`; `scripts/checks/licenses.ts`

**Abnahme:** Rechteverlust wird nicht durch alten Cache oder letzten Datenstand umgangen.

**Abhängigkeiten:** M03-03, M05-05, M05-01

## M06 — Generisches Import- und Snapshot-System

**Ziel:** Datenabruf, Normalisierung und atomare Veröffentlichung robust machen.

**Technische Voraussetzungen:** M03-04, M05-01, M05-02

### M06-01 — Adapter-API implementieren

**Umsetzung:** fetch, parse, normalize, validate, diff und publish trennen. Adapter mit kleinen Fixtures testen.

**Liefergegenstände:** `scripts/ingest/types.ts`; `adapters/`; `tests/ingest/`

**Abnahme:** Neuer Source erfordert keine Änderung an allen Feature-Modulen.

**Abhängigkeiten:** M03-04, M05-01, M05-02

### M06-02 — Sicheren Fetcher implementieren

**Umsetzung:** HTTPS/Domain-Allowlist, Timeouts, Redirect-Validierung, Retry-After, Größenlimits und bereinigte Logs. Keine User-URL als Source.

**Liefergegenstände:** `scripts/ingest/fetch.ts`; `tests/fetch.test.ts`

**Abnahme:** Tests erkennen schädliche URL-Schemes, zu große/kaputte Dateien und unerlaubte Weiterleitung.

**Abhängigkeiten:** M03-04, M05-01, M05-02, M06-01

### M06-03 — Deterministische Normalisierung bauen

**Umsetzung:** Stable IDs, sortierte Arrays, einheitliche Einheiten und Inhalts-Hashes; null-Werte und Provenienz erhalten.

**Liefergegenstände:** `scripts/normalize/`; `tests/determinism.test.ts`

**Abnahme:** Gleicher Eingang erzeugt gleiche Fachdaten/Hashes, abgesehen von ausdrücklich getrennten Laufmetadaten.

**Abhängigkeiten:** M03-04, M05-01, M05-02, M06-02, M06-01

### M06-04 — Differenzprüfung und Quarantäne einbauen

**Umsetzung:** Leere Feeds, unerwartete Zählerrückgänge, neue Gebührenfassungen und schema-breaking Änderungen getrennt behandeln.

**Liefergegenstände:** `scripts/ingest/diff.ts`; `quarantine.ts`

**Abnahme:** Ein absichtlich leerer Source überschreibt den letzten gültigen Snapshot nicht.

**Abhängigkeiten:** M03-04, M05-01, M05-02, M06-03, M06-01

### M06-05 — Manifest und JSON-Sharding erstellen

**Umsetzung:** Hashes, BBox/Index, Größen, Source-Versionen und Dateiverweise erzeugen; Filecount-/Shard-Budgets prüfen.

**Liefergegenstände:** `scripts/publish/manifest.ts`; `shards.ts`

**Abnahme:** Keine all-data.json; Manifest referenziert nur vorhandene schema-valide Dateien.

**Abhängigkeiten:** M03-04, M05-01, M05-02, M06-04, M06-01

### M06-06 — Atomaren Offline-Pipeline-Test ausführen

**Umsetzung:** Zwei erfolgreiche Sources und einen fehlerhaften Source zusammenführen; neuer Snapshot wird erst vollständig freigegeben.

**Liefergegenstände:** `tests/snapshot-integration.test.ts`

**Abnahme:** Teilfehler erzeugt weder halbe Datensätze noch inkonsistente HTML/JSON-Abhängigkeiten.

**Abhängigkeiten:** M03-04, M05-01, M05-02, M06-05, M06-01

## M07 — GitHub CI und Cloudflare-Deployment

**Ziel:** Früh einen überprüfbaren Static-Hosting-Pfad aufbauen, ohne sofort kommerzielle Daten live zu schalten.

**Technische Voraussetzungen:** M01-03, M01-05, M06-05

### M07-01 — PR- und Main-CI konfigurieren

**Umsetzung:** Installation mit Lockfile, lint, typecheck, Unit-/Vertragstests, Fixture-Build und dist-Audit. Forks ohne Secrets.

**Liefergegenstände:** `.github/workflows/ci.yml`

**Abnahme:** Fehlerhafte Inputs stoppen CI; Workflow benötigt keine Partneraccounts.

**Abhängigkeiten:** M01-03, M01-05, M06-05

### M07-02 — Supply-Chain-Schutz konfigurieren

**Umsetzung:** Actions auf volle überprüfte SHAs, minimale Berechtigungen, Dependencyupdates über PR; keine gefährliche privilege escalation.

**Liefergegenstände:** `.github/workflows/security.yml`; `docs/CI_SECURITY.md`

**Abnahme:** Workflow-Sicherheitsreview dokumentiert; untrusted PR-Code kann keine Produktions-Secrets lesen.

**Abhängigkeiten:** M01-03, M01-05, M06-05, M07-01

### M07-03 — Assets-only Wrangler-Konfiguration erstellen

**Umsetzung:** dist-Verzeichnis, HTML-Routing und 404; kein Worker main/SSR/DB-Binding. Statische Header generieren.

**Liefergegenstände:** `wrangler.jsonc`; `scripts/build-headers.ts`

**Abnahme:** Lokale Wrangler-Konfigprüfung und dist-Routingtest erfolgreich.

**Abhängigkeiten:** M01-03, M01-05, M06-05, M07-02, M07-01

### M07-04 — Cloudflare-Buildskript umsetzen

**Umsetzung:** Fixierter Open-Data-Commit, Rechteprüfung, optionaler vertrauenswürdiger Feedabruf, statischer Build, Pagefind und Output-Audit.

**Liefergegenstände:** `scripts/build-cloudflare.ts`; `package.json`

**Abnahme:** Deployment kann nicht vor erforderlichen lokalen Checks laufen; Build-Metadaten referenzieren exakte Inputs.

**Abhängigkeiten:** M01-03, M01-05, M06-05, M07-03, M07-01

### M07-05 — Preview-/Produktionsisolation testen

**Umsetzung:** Produktionsprojekt mit Secrets baut nur main; getrenntes Preview-Projekt ohne Partner-Secrets. Repository-interne Branch-Abfragen sind keine Secret-Grenze. production fail-closed; noindex kein Ersatz für Vertraulichkeit.

**Liefergegenstände:** `tests/build-security.test.ts`; `docs/CLOUDFLARE_SETUP.md`

**Abnahme:** Ein Fork-/Preview-Build kann keine echten Feed-Secrets beziehen oder vertrauliche Rohdaten ausgeben.

**Abhängigkeiten:** M01-03, M01-05, M06-05, M07-04, M07-01

### M07-06 — Cloudflare wirklich verbinden und Smoke testen **[Externer Freigabepunkt]**

**Umsetzung:** Autorisiertes GitHub-Repo mit Cloudflare Builds verbinden, Preview deployen, echte URL/Build-ID und Konfiguration prüfen.

**Liefergegenstände:** `Cloudflare project`; `docs/DEPLOYMENT_EVIDENCE.md`

**Abnahme:** Öffentliches oder geschütztes Preview tatsächlich erreichbar; ohne Accountzugang ausdrücklich blocked.

**Abhängigkeiten:** M01-03, M01-05, M06-05, M07-05, M07-01

## M08 — Tierarztkosten-Rechner

**Ziel:** Den ersten fachlich belastbaren Nutzenpfad bauen: transparente Gebührenrechnung statt erfundener Pauschalpreise.

**Technische Voraussetzungen:** M03-02, M04-05, M05-04, M06-03

### M08-01 — GOT-Importer erstellen

**Umsetzung:** Vollständigen Katalog aus verifizierter XML-/HTML-Quelle importieren; Positions-IDs, Originaltext, Mengenbezug und Version erhalten.

**Liefergegenstände:** `scripts/ingest/adapters/got.ts`; `tests/fixtures/got/`

**Abnahme:** Repräsentative Stichprobe inklusive Tierart-/Mengeneinheiten entspricht der Quelle; Parserfehler sind sichtbar.

**Abhängigkeiten:** M03-02, M04-05, M05-04, M06-03

### M08-02 — Kostenengine implementieren

**Umsetzung:** Reguläre und Notdienstkontexte, Mengen, Faktoren, separate Zuschläge, Steuern und Rundung deterministisch rechnen.

**Liefergegenstände:** `src/features/costs/engine.ts`; `tests/costs/`

**Abnahme:** Unit- und unabhängige Golden Tests einschließlich Notdienstpauschale und Ausschlüssen bestanden.

**Abhängigkeiten:** M03-02, M04-05, M05-04, M06-03, M08-01

### M08-03 — Szenariomodell und Reviewpfad bauen

**Umsetzung:** Nur klar definierte einfache Vorlagen vorbereiten; Behandlungsbestandteile, nicht enthaltene Kosten und Clinical-Reviewstatus speichern.

**Liefergegenstände:** `content-data/cost-scenarios/`; `schemas/cost-scenario.ts`

**Abnahme:** Ungeprüfte komplexe OP-Vorlage kann nicht als vollständige Kostenschätzung veröffentlicht werden.

**Abhängigkeiten:** M03-02, M04-05, M05-04, M06-03, M08-02, M08-01

### M08-04 — Rechneroberfläche integrieren

**Umsetzung:** Tierart, Positionssuche, Mengen, Kontext und Faktor; Ergebnistabelle mit Netto/Brutto, Quelle, Stand und Einschränkungen.

**Liefergegenstände:** `src/pages/de-de/tierarztkosten/`; `costs UI`

**Abnahme:** Rechnung ist aus Einzelpositionen nachvollziehbar; leer/ungültig/unsupported sauber behandelt.

**Abhängigkeiten:** M03-02, M04-05, M05-04, M06-03, M08-03, M08-01

### M08-05 — Druck- und Informationsseiten erstellen

**Umsetzung:** Browserdruck mit Quellen/Version; wenige freigegebene Leistungsseiten mit Rechner-Einstieg. Keine automatische Massenerzeugung jeder Kombination.

**Liefergegenstände:** `src/pages/de-de/tierarztkosten/[slug].astro`; `print.css`

**Abnahme:** Druckansicht vollständig; nur überprüfte Inhalte indexierbar.

**Abhängigkeiten:** M03-02, M04-05, M05-04, M06-03, M08-04, M08-01

### M08-06 — Fachliche Rechenabnahme dokumentieren **[Externer Freigabepunkt]**

**Umsetzung:** Quellenstand und relevante Rechenannahmen fachlich prüfen lassen oder nachvollziehbar vorhandene qualifizierte Freigabe erfassen. Keine Autorität erfinden.

**Liefergegenstände:** `docs/reviews/costs.md`; `config/launch.json`

**Abnahme:** Live-Szenarien haben echte Freigabe; fehlendes Review blockiert nur deren öffentliche Aktivierung.

**Abhängigkeiten:** M03-02, M04-05, M05-04, M06-03, M08-05, M08-01

## M09 — Versicherungs-Affiliate ohne Scheinberatung

**Ziel:** Versicherungswerbung technisch integrierbar machen, ohne unzulässige individuelle Beratung zu automatisieren.

**Technische Voraussetzungen:** M03-04, M04-02, M05-02

### M09-01 — Partnervertragsschema bauen

**Umsetzung:** Programmanbieter, Netzwerk, Geltung, erlaubte Website-/Platzierungsarten und Nachweise erfassen. Provisionen nicht clientseitig ausliefern.

**Liefergegenstände:** `config/publishers/insurance/`; `schemas/partner.ts`

**Abnahme:** Fehlende Vertragsfreigabe lässt keine aktive Versicherungs-CTA entstehen.

**Abhängigkeiten:** M03-04, M04-02, M05-02

### M09-02 — Neutralen CTA-Baustein implementieren

**Umsetzung:** Explizit gekennzeichnete Information/Weiterleitung zum Anbieter, vom Kostenresultat getrennt. Keine ranglistenbasierte Auswahl nach Tierprofil.

**Liefergegenstände:** `src/components/InsuranceDisclosure.astro`; `PartnerCta.astro`

**Abnahme:** Aufruf überträgt keine Diagnose, Profilwerte oder eingegebenen Kosten.

**Abhängigkeiten:** M03-04, M04-02, M05-02, M09-01

### M09-03 — Zulässige Links validieren

**Umsetzung:** Nur genehmigte Host-/Programmzuordnung und erlaubte statische Kampagnenkennungen; rel sponsored, keine verdeckten Redirects.

**Liefergegenstände:** `src/features/commerce/links.ts`; `tests/affiliate-links.test.ts`

**Abnahme:** Ungültiger oder inaktiver Link wird ausgeblendet; keine Tracking-Requests in automatischen Live-Linktests.

**Abhängigkeiten:** M03-04, M04-02, M05-02, M09-02, M09-01

### M09-04 — Redaktion und Erlöslogik trennen

**Umsetzung:** Keine Aussagen zu garantierter Kostenerstattung oder Versicherbarkeit bestehender Beschwerden. Keine Akutnotfallseite mit aggressiver CTA.

**Liefergegenstände:** `content-data/insurance-disclosures/`; `tests/content-policy.test.ts`

**Abnahme:** Kein personalisiertes bestes Versicherungsprodukt und keine erfundenen Tarifdaten im UI.

**Abhängigkeiten:** M03-04, M04-02, M05-02, M09-03, M09-01

### M09-05 — Leere/gesperrte Partnerzustände testen

**Umsetzung:** Noch keine Zulassung, Programm beendet, falscher Markt, fehlende Werbekennzeichnung und erlaubte neutrale Shopalternative abdecken.

**Liefergegenstände:** `tests/insurance-integration.test.ts`

**Abnahme:** Seite bleibt informativ ohne aktiven Versicherungspartner; keine fake Provision/Angebote.

**Abhängigkeiten:** M03-04, M04-02, M05-02, M09-04, M09-01

### M09-06 — Vertragliche und rechtliche Freigabe einholen **[Externer Freigabepunkt]**

**Umsetzung:** Tatsächliche Partnerzulassung plus Prüfung der konkreten Ausgestaltung unter §34d dokumentieren. Ein Disclaimer ersetzt diese Prüfung nicht.

**Liefergegenstände:** `docs/reviews/insurance.md`; `partner approval reference`

**Abnahme:** Versicherungs-Modul erst nach echter Freigabe live; sonst blocked und Feature aus.

**Abhängigkeiten:** M03-04, M04-02, M05-02, M09-05, M09-01

## M10 — Deutschlandweite Ortsdaten

**Ziel:** Bundesweite relevante POIs effizient importieren und die Abdeckung ehrlich ausweisen.

**Technische Voraussetzungen:** M05-04, M05-05, M06-06

### M10-01 — OSM-Pilot regional importieren

**Umsetzung:** Mit kleinem Deutschland-Extrakt beginnen; tierärztliche Einrichtungen, Hundewiesen, Tierheime und weitere ausgewählte Tags extrahieren.

**Liefergegenstände:** `scripts/ingest/adapters/osm/`; `config/osm-tags.json`

**Abnahme:** Kleiner realer Pilot und reproduzierbarer Fixture-Test vorhanden; keine Browser-Overpass-Abfrage nötig.

**Abhängigkeiten:** M05-04, M05-05, M06-06

### M10-02 — Geometrie und Kontakte normalisieren

**Umsetzung:** Nodes, Ways und Relations angemessen behandeln; stabile IDs, berechnete repräsentative Punkte und dokumentierte Koordinatenqualität.

**Liefergegenstände:** `scripts/normalize/places.ts`; `geometry tests`

**Abnahme:** Grenzen/Überlappungen erzeugen keine Doppelzählungen; defekte Geometrien werden nicht still nach Berlin verschoben.

**Abhängigkeiten:** M05-04, M05-05, M06-06, M10-01

### M10-03 — Ortsindex und räumliche Suche vorbereiten

**Umsetzung:** Suchbare Ortsnamen und Koordinaten aus freigegebener Quelle erzeugen; keine proprietäre PLZ-Datenbank voraussetzen. Distanz vs Gemeindegrenze kennzeichnen.

**Liefergegenstände:** `data place index generator`; `src/features/map/place-search.ts`

**Abnahme:** Autocomplete läuft lokal auf kleinen Daten; mehrdeutige Ortsnamen wird aufgelöst.

**Abhängigkeiten:** M05-04, M05-05, M06-06, M10-02, M10-01

### M10-04 — Bundesweiten Import skalieren

**Umsetzung:** Alle nötigen Deutschland-Regionen streamend/sequenziell oder kontrolliert parallel verarbeiten; Rohdaten vor dem Build entsorgen.

**Liefergegenstände:** `scripts/ingest/osm-country.ts`; `docs/OSM_BENCHMARK.md`

**Abnahme:** Alle vorgesehenen Regionen haben überprüften Snapshotstatus; Speicher-/Laufzeitbudget gemessen.

**Abhängigkeiten:** M05-04, M05-05, M06-06, M10-03, M10-01

### M10-05 — POIs sharden und Coverage ausgeben

**Umsetzung:** Räumliche Chunks, Kategorienzähler, Source-Alter, fehlende Regionen und sichere Exportprojektion erstellen.

**Liefergegenstände:** `public data generator`; `docs/COVERAGE.md`

**Abnahme:** Kartenindex klein; keine deutschlandweite Megadatei im initialen Browserpfad.

**Abhängigkeiten:** M05-04, M05-05, M06-06, M10-04, M10-01

### M10-06 — Echte Datenqualität abnehmen

**Umsetzung:** Stichproben verschiedener Kategorien/Regionen, Aktualitätsanzeige, Lizenzdownload und keine falsche Notdienst-Zusicherung prüfen.

**Liefergegenstände:** `docs/reviews/places.md`; `real-data test report`

**Abnahme:** Bundesweite erfasste Daten belegt, ohne Vollständigkeit aller realen Einrichtungen zu behaupten.

**Abhängigkeiten:** M05-04, M05-05, M06-06, M10-05, M10-01

## M11 — Hunde-Karte und lokale Landingpages

**Ziel:** Die Ortsdaten für Nutzer und Suchmaschinen sinnvoll erschließen, ohne dünne Ortsseiten zu produzieren.

**Technische Voraussetzungen:** M04-03, M10-05

### M11-01 — Zugängliche Listenansicht bauen

**Umsetzung:** Ort, Kategorie und Radius als Filter; Trefferliste mit Quelle und sinnvollen Kontakthinweisen. Serverlos und mit statischen Standardergebnissen.

**Liefergegenstände:** `src/features/map/list/`; `map page`

**Abnahme:** Liste bleibt ohne Karte nutzbar; keine Treffer bedeutet nur keine erfassten Treffer.

**Abhängigkeiten:** M04-03, M10-05

### M11-02 — Karte lazy integrieren

**Umsetzung:** Leaflet nach Klick, konfigurierte Tile-Quelle und Attribution; nur sichtbare/nähere Daten nachladen.

**Liefergegenstände:** `src/features/map/map.ts`; `tile config`

**Abnahme:** Initial kein Tile-Request; Providerfehler beeinträchtigt Liste nicht; kein Prefetch/Bulk-Download.

**Abhängigkeiten:** M04-03, M10-05, M11-01

### M11-03 — Marker und Geolocation behandeln

**Umsetzung:** Cluster/Rendergrenzen, Standortabfrage nur durch Nutzeraktion, Ablehnungs-/Timeoutpfade und klare Standortdatenhaltung.

**Liefergegenstände:** `tests/e2e/map.spec.ts`; `map controls`

**Abnahme:** Dichter Ausschnitt bleibt bedienbar; Standort wird nicht gespeichert/versendet ohne passende Aktion.

**Abhängigkeiten:** M04-03, M10-05, M11-02, M11-01

### M11-04 — Lokale Seite aus Qualitäts-Allowlist generieren

**Umsetzung:** Bis zu 25 geeignete Städte als Startziel, ausschließlich bei genügend echten Daten. Kein garantierter Mindestbestand erfinden.

**Liefergegenstände:** `content-data/city-allowlist.json`; `local page template`

**Abnahme:** Indexierte Stadtseite besitzt echten lokalen Mehrwert und keine leeren Kategorien.

**Abhängigkeiten:** M04-03, M10-05, M11-03, M11-01

### M11-05 — Kommunalen Pilot anbinden

**Umsetzung:** Eine konkret lizenzierte kommunale Zusatzquelle integrieren; Priorität/Konflikt zu OSM sichtbar behandeln. Nicht alle Kommunalregeln voraussetzen.

**Liefergegenstände:** `scripts/ingest/adapters/municipal/`; `local-source tests`

**Abnahme:** Quelle, Lizenz, Geltung und Konflikte nachvollziehbar; keine abgeleitete Hundeerlaubnis ohne Beleg.

**Abhängigkeiten:** M04-03, M10-05, M11-04, M11-01

### M11-06 — Mobil-/SEO-/Ausfallabnahme durchführen

**Umsetzung:** Mobilkarte, Tastatur-Alternative, Provider-Ausfall, Nachbar-Shards, Ortswechsel und interne Links im echten Browser testen.

**Liefergegenstände:** `docs/reviews/map-ui.md`; `E2E reports`

**Abnahme:** Kein horizontaler Bedienbruch, keine fehlerhaften 200-Fallbacks und vollständige Attribution.

**Abhängigkeiten:** M04-03, M10-05, M11-05, M11-01

## M12 — Haustier-Reisecheck für deutsche Nutzer

**Ziel:** Einen bewusst begrenzten, versionierten Reisecheck statt einer unzuverlässigen weltweiten Regelsammlung bauen.

**Technische Voraussetzungen:** M03-04, M04-05, M05-02

### M12-01 — Unterstützten Reisekontext definieren

**Umsetzung:** V1: privater Standardfall für erwachsene Hunde/Katzen, begleitete Reise ab Deutschland in zunächst AT, NL, FR, IT; Transit und Rückreise erfassen. Andere Fälle explizit unsupported.

**Liefergegenstände:** `content-data/travel/scope.json`; `docs/TRAVEL_SCOPE.md`

**Abnahme:** UI sagt klar, welche Fälle geprüft werden; keine scheinbar globale Abdeckung.

**Abhängigkeiten:** M03-04, M04-05, M05-02

### M12-02 — Deklarative Rules Engine implementieren

**Umsetzung:** Feste Prädikate, gültige Zeiträume, Prioritäten und vier Ergebniszustände; keine ausführbaren Regeln aus Fremdtexten.

**Liefergegenstände:** `src/features/travel/engine.ts`; `tests/travel/`

**Abnahme:** Einheiten-, Kalender-, unbekannt-/nicht-anwendbar- und Versionsgrenztests bestanden.

**Abhängigkeiten:** M03-04, M04-05, M05-02, M12-01

### M12-03 — Offizielle Regelquellen modellieren

**Umsetzung:** Aktuelle EU-Regeln und Ziel-/Transitstaatquellen lesen, fachliche Felder und Fundstellen erfassen. Keine alten Chat-Angaben blind übernehmen.

**Liefergegenstände:** `content-data/travel/rules/`; `docs/reviews/travel-sources.md`

**Abnahme:** Jede vorbereitete Regel hat Quelle, Anwendungsbereich, Inkrafttreten und Reviewstatus.

**Abhängigkeiten:** M03-04, M04-05, M05-02, M12-02, M12-01

### M12-04 — Wizard und Ergebnisse integrieren

**Umsetzung:** Auswahl von Tier, Zeitraum, Dokumentstatus, Herkunft/Ziel/Transit; Checkliste mit unbekannten Punkten und offiziellen Links, keine Garantie.

**Liefergegenstände:** `src/pages/de-de/reisecheck/`; `travel UI`

**Abnahme:** Unvollständige oder nicht unterstützte Route erhält kein grünes Gesamtergebnis.

**Abhängigkeiten:** M03-04, M04-05, M05-02, M12-03, M12-01

### M12-05 — Packliste und Zielseiten erstellen

**Umsetzung:** Druckbare regelbezogene Aufgaben und nichtmedizinische Reiseausrüstung; nur unterstützte Ziele erhalten indexierbare Seiten. Airline-/Fährbedingungen getrennt ausweisen.

**Liefergegenstände:** `travel destination template`; `print rules`; `packing list`

**Abnahme:** Packliste ohne Backend, keine automatische Empfehlung von Medikamenten.

**Abhängigkeiten:** M03-04, M04-05, M05-02, M12-04, M12-01

### M12-06 — Reiseregeln fachlich freigeben und Regression testen **[Externer Freigabepunkt]**

**Umsetzung:** Alle Live-Regeln mit kompetenter Prüfung und vollständiger Testmatrix bestätigen. Quelländerung sperrt positive automatische Gesamtentscheidung.

**Liefergegenstände:** `docs/reviews/travel.md`; `config/launch.json`

**Abnahme:** Freigabe echt dokumentiert; ohne Review funktionsfähiger Preview, aber keine unüberprüfte Live-Reiseberatung.

**Abhängigkeiten:** M03-04, M04-05, M05-02, M12-05, M12-01

## M13 — Affiliate-Produktfeeds und Angebotskatalog

**Ziel:** Einen belastbaren Produkt-/Angebotslayer aufbauen, der auch bei fehlenden Partnerzugängen technisch testbar bleibt.

**Technische Voraussetzungen:** M03-04, M05-02, M06-02, M07-04

### M13-01 — Netzwerkadapter mit Fixtures erstellen

**Umsetzung:** Generische Schnittstelle plus Awin-CSV-Adapter; weitere Netzwerke nur nach realem Bedarf. Fixtures synthetisch statt veröffentlichter echter Rohfeeds.

**Liefergegenstände:** `scripts/ingest/adapters/awin.ts`; `fixtures/commerce/`

**Abnahme:** Parser arbeitet ohne Zugangsdaten; quoted CSV, Encoding, fehlende Felder und große Feeds getestet.

**Abhängigkeiten:** M03-04, M05-02, M06-02, M07-04

### M13-02 — Produkte und Varianten normalisieren

**Umsetzung:** Product und Offer trennen, GTIN/Packung/Größe/Mengenbasis prüfen, potenzielle Dubletten quarantänisieren.

**Liefergegenstände:** `scripts/normalize/products.ts`; `offers.ts`; `tests/product-match/`

**Abnahme:** Falsche Multipack-/Größenmatches werden nicht als Preisvergleich veröffentlicht.

**Abhängigkeiten:** M03-04, M05-02, M06-02, M07-04, M13-01

### M13-03 — Vertrauenswürdigen Cloudflare-Abruf implementieren

**Umsetzung:** Secrets ausschließlich Build-Time, Domain-Allowlist, Streaming, TTL und erlaubte öffentliche Felder. Nichts Vertrauliches ins Repo, Artifact oder Browserbundle.

**Liefergegenstände:** `scripts/build/commerce.ts`; `tests/feed-secrecy.test.ts`

**Abnahme:** Canary und private Felder fehlen in sämtlichen öffentlichen Outputs; fehlende Secret-Namen werden ohne Wert protokolliert.

**Abhängigkeiten:** M03-04, M05-02, M06-02, M07-04, M13-02, M13-01

### M13-04 — Angebotsausgabe und Preislogik erstellen

**Umsetzung:** Klare Preise, Versand unbekannt/null, Grundpreis falls sinnvoll, Stand, Verfügbarkeit und abgelaufene Angebote. Kundenabhängige Rabatte separat.

**Liefergegenstände:** `src/features/commerce/pricing.ts`; `OfferCard.astro`

**Abnahme:** Keine falsche Kostenlos-/Bestpreisbehauptung; gleiche Variante und Markt für Vergleich Pflicht.

**Abhängigkeiten:** M03-04, M05-02, M06-02, M07-04, M13-03, M13-01

### M13-05 — Katalogansichten und Filter bauen

**Umsetzung:** Kategorien, Eigenschaften, erklärbare Sortierung und Affiliatekennzeichnung; nur erlaubte öffentliche Projektion in JSON.

**Liefergegenstände:** `catalog pages`; `filters.ts`; `tests/e2e/catalog.spec.ts`

**Abnahme:** Sortierung ist provisionunabhängig; aktive Filter finden nur zulässige Angebote.

**Abhängigkeiten:** M03-04, M05-02, M06-02, M07-04, M13-04, M13-01

### M13-06 — Mindestens einen echten Partner integrieren **[Externer Freigabepunkt]**

**Umsetzung:** Tatsächliche Programmfreigabe, Bilder-/Anzeige-/JSON-Rechte, echte Feedfelder und erlaubter Linkmodus verifizieren. Ohne Freigabe Slot deaktiviert lassen.

**Liefergegenstände:** `docs/reviews/commerce-partner.md`; `config/publishers/`

**Abnahme:** Echte zugelassene Integration nachgewiesen; keine alten Chat-Provisionswerte als Vertragsbeleg.

**Abhängigkeiten:** M03-04, M05-02, M06-02, M07-04, M13-05, M13-01

## M14 — Health-/Pflegeprodukte und Spielzeug-Finder

**Ziel:** Die gewünschten kommerziellen Kategorien durch belegte Eigenschaften statt unbelegte Gesundheitsversprechen differenzieren.

**Technische Voraussetzungen:** M04-05, M13-02, M13-04

### M14-01 — Startkategorien und Grenzen festlegen

**Umsetzung:** Pflege-/Zahnpflege-/Mobilitätszubehör und Spielzeug auswählen. Medikamente, medizinische Tests und Supplements nur als spätere gesondert freizugebende Erweiterung.

**Liefergegenstände:** `content-data/taxonomy/care.json`; `toys.json`

**Abnahme:** Gesundheitsbereich erfüllt den Produktwunsch, ohne automatische Behandlungsvorschläge zu veröffentlichen.

**Abhängigkeiten:** M04-05, M13-02, M13-04

### M14-02 — Attributschema und Herkunft erfassen

**Umsetzung:** Tierart, Abmessung, Herstellergrößenbereich, Material, Spieltyp, Waschbarkeit und belastbare Einschränkungen speichern; unbekannt explizit.

**Liefergegenstände:** `schemas/product-attributes.ts`; `attribute review data`

**Abnahme:** Jedes für Matching verwendete Attribut besitzt Quelle und Verifikationsstatus.

**Abhängigkeiten:** M04-05, M13-02, M13-04, M14-01

### M14-03 — Deterministisches Matching umsetzen

**Umsetzung:** Hard-Filter auf Tierart/Größe/Herstellergrenzen; weiche Sortierung nur nach erklärbaren Bedürfnissen wie Indoor oder Apportieren.

**Liefergegenstände:** `src/features/toys/matching.ts`; `care/matching.ts`

**Abnahme:** Rasse allein löst keine medizinische Empfehlung aus; unbekannte Eigenschaften werden nicht als passend behauptet.

**Abhängigkeiten:** M04-05, M13-02, M13-04, M14-02, M14-01

### M14-04 — Finder-Oberfläche und Erklärungen bauen

**Umsetzung:** Kurzer Fragebogen, Ergebnisbegründung und verlinkte Herstellerangaben. Kein erfundener Sicherheits- oder Haltbarkeitsscore.

**Liefergegenstände:** `toys finder`; `care category pages`

**Abnahme:** Nutzer erkennt, warum ein Produkt erscheint und welche Eigenschaften nicht geprüft sind.

**Abhängigkeiten:** M04-05, M13-02, M13-04, M14-03, M14-01

### M14-05 — Sicherheits- und Inhaltsregeln testen

**Umsetzung:** Heilversprechen, Dosierung, unzerstörbar, Fake-Sterne und automatische Supplementpflicht als negative Content-/Datenfälle prüfen.

**Liefergegenstände:** `tests/care-safety.test.ts`; `tests/toy-safety.test.ts`

**Abnahme:** Policy-Tests sperren unerlaubte Claims; passende neutrale Produkttexte bleiben möglich.

**Abhängigkeiten:** M04-05, M13-02, M13-04, M14-04, M14-01

### M14-06 — Reale Produkte attributseitig abnehmen

**Umsetzung:** Kleine sorgfältig geprüfte Auswahl veröffentlichen, sobald echte Angebotsrechte bestehen. Fehlende Daten nicht durch KI erfinden.

**Liefergegenstände:** `docs/reviews/care-toys.md`; `attribute approvals`

**Abnahme:** Jedes Live-Matching erklärt belegte Eigenschaften; nicht geprüfte Produkte erscheinen nur mit entsprechend begrenzter Aussage oder gar nicht.

**Abhängigkeiten:** M04-05, M13-02, M13-04, M14-05, M14-01

## M15 — Futtervergleich und optionale offene Anreicherung

**Ziel:** Einen transparenten Mengen-/Preisvergleich bauen, ohne aus lückenhaften Labeldaten medizinische Ernährungsscores abzuleiten.

**Technische Voraussetzungen:** M13-02, M13-04

### M15-01 — Futter-Domänenmodell ergänzen

**Umsetzung:** Tierart, Lebensphase laut Hersteller, Allein-/Ergänzungsfuttermittel falls belegt, Menge, Nährwertfelder und deren Einheiten/Bezug speichern.

**Liefergegenstände:** `schemas/food.ts`; `food taxonomy`

**Abnahme:** Keine Lebensphase/Bedarfsdeckung wird aus dem Namen oder Proteinwert geraten.

**Abhängigkeiten:** M13-02, M13-04

### M15-02 — Grundpreis-/Multipack-Rechnung implementieren

**Umsetzung:** Einheitliche Mengenbasis und exakte Variante vergleichen; Versand separat, unbekannte Mengen nicht schätzen.

**Liefergegenstände:** `src/features/food/unit-price.ts`; `tests/food-pricing.test.ts`

**Abnahme:** Unabhängige Tests für 400g, 1kg, 6x400g und fehlerhafte Mengen bestanden.

**Abhängigkeiten:** M13-02, M13-04, M15-01

### M15-03 — Produktsuche und Futteransichten bauen

**Umsetzung:** Name/Marke/GTIN-Suche, Angebotsvergleich und deklarierte Produktattribute. Barcodeeingabe zunächst Text; Kamera nicht Pflicht.

**Liefergegenstände:** `src/pages/de-de/futter/`; `food product template`

**Abnahme:** Echte Futterprodukte mit gleichen Varianten vergleichbar; ohne Nährwerte bleibt Preisvergleich nutzbar.

**Abhängigkeiten:** M13-02, M13-04, M15-02, M15-01

### M15-04 — OPFF-Machbarkeit prüfen

**Umsetzung:** Konkrete API/Distribution und Rechte verifizieren; definierte Stichprobe gegen GTINs echter zulässiger Feedprodukte messen.

**Liefergegenstände:** `docs/OPFF_SPIKE.md`; `config/sources/opff.json`

**Abnahme:** Abdeckung, fehlende Felder und Lizenzfolgen dokumentiert; kein erfundener Trefferanteil.

**Abhängigkeiten:** M13-02, M13-04, M15-03, M15-01

### M15-05 — OPFF nur bei Eignung anbinden

**Umsetzung:** Adapter und Lizenzprojektion implementieren oder mit begründetem Feature-Flag deaktiviert lassen; nicht als allgemeine Pflichtdatenbank behandeln.

**Liefergegenstände:** `scripts/ingest/adapters/opff.ts`; `tests/opff-fallback.test.ts`

**Abnahme:** Fallback auf Händler-/Herstellerlabeldaten funktioniert; keine ungenehmigten Bilder und keine FEDIAF-Tabellenkopie.

**Abhängigkeiten:** M13-02, M13-04, M15-04, M15-01

### M15-06 — Futterdarstellung abnehmen

**Umsetzung:** Kein Testsieger/Nährwert-Healthscore ohne Methodik und Rechte; Rohdaten klar vom Preisvergleich trennen.

**Liefergegenstände:** `docs/reviews/food.md`; `E2E food tests`

**Abnahme:** Labelwerte, Quellen, Menge, Preisstand und Unbekanntwerte sind verständlich und korrekt.

**Abhängigkeiten:** M13-02, M13-04, M15-05, M15-01

## M16 — Lokales Tierprofil, Merkliste und Packliste

**Ziel:** Wiederkehrenden Nutzwert schaffen, ohne Konten oder zentrale Nutzerdatenbank einzuführen.

**Technische Voraussetzungen:** M03-04, M04-05, M14-03

### M16-01 — Profil-State im Browser implementieren

**Umsetzung:** Tierart, optionale Größen-/Gewichtsangaben und Interessen im Tab halten. Keine Pflicht für Name, Adresse oder E-Mail.

**Liefergegenstände:** `src/features/profile/state.ts`; `profile form`

**Abnahme:** Initial keine Speicherung und keine Netzübertragung; Tools funktionieren ohne Profil.

**Abhängigkeiten:** M03-04, M04-05, M14-03

### M16-02 — Optionale lokale Speicherung bauen

**Umsetzung:** Bewusste Auswahl, versioniertes Schema, Migration, Quota-/Storagefehler und vollständiges Löschen.

**Liefergegenstände:** `profile storage.ts`; `tests/profile-storage.test.ts`

**Abnahme:** Speichern und Löschen im Browser nachweisbar; kein serverseitiges Nutzerprofil entsteht.

**Abhängigkeiten:** M03-04, M04-05, M14-03, M16-01

### M16-03 — Merkliste integrieren

**Umsetzung:** Produkt-/Orts-IDs lokal merken; verschwundene Angebote und veraltete Referenzen sauber behandeln.

**Liefergegenstände:** `src/features/profile/favorites.ts`; `Merkliste page`

**Abnahme:** Merkliste lädt aktuelle zulässige Daten; alte Produkte führen nicht zu toten oder falschen Angeboten.

**Abhängigkeiten:** M03-04, M04-05, M14-03, M16-02, M16-01

### M16-04 — Reise-Packliste und Druck verbinden

**Umsetzung:** Eigene Checklistenzustände im Browser, druckbare Ansicht ohne Trackingdaten oder unnötige persönliche Angaben.

**Liefergegenstände:** `packing state`; `print templates`

**Abnahme:** Abhaken/Drucken benötigt keine Datenbank; gespeicherte Liste ist eindeutig gerätebezogen.

**Abhängigkeiten:** M03-04, M04-05, M14-03, M16-03, M16-01

### M16-05 — Sicheren Import/Export ergänzen

**Umsetzung:** Lokale JSON-Datei, Größenlimit, Schema-Prüfung und klare Datenschutzwarnung. Keine Datei an Server senden.

**Liefergegenstände:** `profile import-export.ts`; `tests/profile-import.test.ts`

**Abnahme:** Manipulierte Importdaten führen nicht zu XSS, unerlaubten Fetches oder Ausführen von Code.

**Abhängigkeiten:** M03-04, M04-05, M14-03, M16-04, M16-01

### M16-06 — Datenschutz- und Netzabnahme durchführen

**Umsetzung:** Mit Browser-Network-Test beweisen, dass Profileingaben nicht in URL, Analytics, Affiliate-Sub-ID oder fremde Requestdaten gelangen.

**Liefergegenstände:** `docs/reviews/local-profile.md`; `privacy E2E tests`

**Abnahme:** Anonymes Standardverhalten und Grenzen ohne Backup/Geräteabgleich korrekt beschrieben.

**Abhängigkeiten:** M03-04, M04-05, M14-03, M16-05, M16-01

## M17 — Geplante Ingestion und Datenbetrieb

**Ziel:** Aktualisierung und Fehlersignale so aufbauen, dass die Website nicht unbemerkt mit kaputten Daten weiterläuft.

**Technische Voraussetzungen:** M06-06, M07-04, M10-05

### M17-01 — data-live-Publisher umsetzen

**Umsetzung:** Nur erlaubte offene normalisierte Dateien und Manifest in separatem Branch; Diff-Whitelist, Atomarität, kein Push in main.

**Liefergegenstände:** `scripts/publish/data-branch.ts`; `data branch workflow`

**Abnahme:** Publish-Test erkennt fremde Code-/Secret-Dateien und verweigert sie.

**Abhängigkeiten:** M06-06, M07-04, M10-05

### M17-02 — Offenen Importplan aktivierbar machen

**Umsetzung:** Wöchentliche/konfigurierte Jobs, dispatch, concurrency, Source-Timeouts, drei Versuche und bereinigte Summaries.

**Liefergegenstände:** `.github/workflows/ingest-open.yml`

**Abnahme:** Manueller vollständiger Lauf erfolgreich oder konkret begrenzt dokumentiert; Fehler ersetzen gültige Daten nicht.

**Abhängigkeiten:** M06-06, M07-04, M10-05, M17-01

### M17-03 — Täglichen Quellen-/Rebuildpfad hinzufügen

**Umsetzung:** Reise-/Regeländerungen erkennen; Commerce-Rebuild nur bei aktiven Partnern. Cloudflare-Hook als Secret und Buildstatus getrennt behandeln.

**Liefergegenstände:** `.github/workflows/source-check.yml`; `rebuild-commerce.yml`

**Abnahme:** Hook-Fehlschlag wird erkannt; keine minütlichen Vollsite-Builds oder Buildloops.

**Abhängigkeiten:** M06-06, M07-04, M10-05, M17-02, M17-01

### M17-04 — Frischeanzeige und Stale-Logik bauen

**Umsetzung:** Öffentlicher Datenstand und Source-Alter; abgelaufene Preise ausblenden; gesperrte Regeln ohne grünes Gesamtergebnis.

**Liefergegenstände:** `src/features/freshness/`; `public health generator`

**Abnahme:** Gefrorene Zeit im Test provoziert erwartete Warnungen/Sperren.

**Abhängigkeiten:** M06-06, M07-04, M10-05, M17-03, M17-01

### M17-05 — Smoke- und Alarmworkflow erstellen

**Umsetzung:** Seiten-/Datenstandprüfung, bereinigte Issues/Benachrichtigungen, Erklärung der 60-Tage-Scheduler-Grenze und unabhängigen Monitorlücke.

**Liefergegenstände:** `.github/workflows/smoke.yml`; `docs/MONITORING.md`

**Abnahme:** Ausfall und Datenüberalterung erzeugen nachvollziehbaren Alarm; keine falsche SLA.

**Abhängigkeiten:** M06-06, M07-04, M10-05, M17-04, M17-01

### M17-06 — Rollback und Budgetbericht proben

**Umsetzung:** Code-/Datenversion und aktives Feature-Set protokollieren, letzten gültigen zulässigen Stand wiederherstellen; Git-/Build-/Assetverbrauch messen.

**Liefergegenstände:** `docs/ROLLBACK.md`; `docs/BUDGET_REPORT.md`

**Abnahme:** Tatsächliche Probe oder lokal nachvollziehbare Simulation, getrennt vom noch blockierten Provider-Rollback.

**Abhängigkeiten:** M06-06, M07-04, M10-05, M17-05, M17-01

## M18 — SEO, Sicherheit, Zugänglichkeit und Freigaben

**Ziel:** Die Plattform als überprüftes Produkt statt nur als funktionierende Sammlung von Komponenten abnehmen.

**Technische Voraussetzungen:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03

### M18-01 — SEO-Gates implementieren

**Umsetzung:** Titel/H1, canonical, reale hreflang-Paare, Sitemap, robots/noindex, Pagefind-Ausschlüsse und richtige Statuscodes prüfen.

**Liefergegenstände:** `scripts/checks/seo.ts`; `sitemap generator`; `tests/seo/`

**Abnahme:** Keine Fixture-/dünnen Filter-/inaktiven Marktseiten im Index; kein Fake-Rating-Markup.

**Abhängigkeiten:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03

### M18-02 — Sicherheits- und Output-Audit abschließen

**Umsetzung:** XSS, Feed-HTML, URL-Schemes, Secret-Canaries, CSP, private JSON-Felder und ungenehmigte Bilder prüfen.

**Liefergegenstände:** `scripts/checks/dist.ts`; `security tests`

**Abnahme:** dist enthält ausschließlich zulässige Dateien; bekannte Negativfälle schlagen fehl.

**Abhängigkeiten:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03, M18-01

### M18-03 — Performance-/Dateibudgets messen

**Umsetzung:** Build auf repräsentativen Daten, Chunk/Filecounts, initiales JS, Map-Nachladen und Mobile-Lighthouse unter dokumentierten Bedingungen.

**Liefergegenstände:** `docs/PERFORMANCE.md`; `budget tests`

**Abnahme:** Budgets eingehalten oder konkreter Blocker; keine erfundenen LCP-/INP-Messwerte.

**Abhängigkeiten:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03, M18-02, M18-01

### M18-04 — Zugänglichkeits- und Browsermatrix ausführen

**Umsetzung:** Tastatur, Screenreader-Hinweise, Kontraste, Zoom, mobiles Format und mindestens zwei Browserpfade prüfen.

**Liefergegenstände:** `docs/ACCESSIBILITY.md`; `Playwright/axe reports`

**Abnahme:** Kritische Befunde behoben; Tests und manuelle Beobachtungen nachvollziehbar.

**Abhängigkeiten:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03, M18-03, M18-01

### M18-05 — Geschäfts- und Rechtsinformationen vorbereiten

**Umsetzung:** Echte Betreiberangaben, Datenschutz, Affiliatekennzeichnung, Methodik, Quellen und Kontaktwege integrieren. Ads standardmäßig aus; Consent-/BFSG-Prüfbedarf benennen.

**Liefergegenstände:** `legal pages`; `config/legal.ts`; `docs/LEGAL_CHECKLIST.md`

**Abnahme:** Keine erfundenen juristischen Personendaten; offene echte Freigaben als Blocker, nicht Textplatzhalter live.

**Abhängigkeiten:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03, M18-04, M18-01

### M18-06 — Fachliche und rechtliche Launchfreigaben erfassen **[Externer Freigabepunkt]**

**Umsetzung:** Kosten, Reise, Versicherung soweit aktiv, Produktclaims, Datenrechte und konkrete Privacy-/Werbeausgestaltung extern bzw. qualifiziert freigeben lassen.

**Liefergegenstände:** `docs/reviews/launch.md`; `config/launch.json`

**Abnahme:** Launchstatus referenziert reale Nachweise und freigegebene Features; kein Agent erfindet eine Juristen-/Tierarztprüfung.

**Abhängigkeiten:** M04-06, M08-04, M11-06, M12-04, M14-04, M15-03, M18-05, M18-01

## M19 — Endabnahme, Betriebshandbuch und Ausbauprobe

**Ziel:** Einen klaren Zustand mit getesteter Übergabe erreichen, statt das Projekt pauschal für fertig zu erklären.

**Technische Voraussetzungen:** M17-04, M18-01, M18-02

### M19-01 — Gesamte Golden-Path-Suite ausführen

**Umsetzung:** Kosten -> Information, Ort -> Treffer, Reise -> Checkliste, Finder -> echtes oder gesperrtes Angebot, Futter -> Grundpreis, Profil -> Löschen testen.

**Liefergegenstände:** `docs/RELEASE_TESTS.md`; `verify reports`

**Abnahme:** Alle freigegebenen Kernpfade bestanden; nicht aktive Features sind klar deaktiviert.

**Abhängigkeiten:** M17-04, M18-01, M18-02

### M19-02 — Frischen Clone und Offline-Entwicklung prüfen

**Umsetzung:** Neuer Checkout, sichere Installation, Fixture-Build und lokale Tests ohne Secrets/Account durchführen.

**Liefergegenstände:** `docs/DEVELOPER_SETUP.md`

**Abnahme:** Andere Entwickler können die Website reproduzierbar starten; keine lokalen versteckten Dateien erforderlich.

**Abhängigkeiten:** M17-04, M18-01, M18-02, M19-01

### M19-03 — Internationalisierung mit Testmarkt beweisen

**Umsetzung:** Deaktivierten US-/EU-Testmarkt über Konfig und Adaptervertrag testen; USD, Einheiten und fehlende Kostenquelle korrekt behandeln.

**Liefergegenstände:** `tests/expansion-proof.test.ts`; `docs/EXPANSION.md`

**Abnahme:** Kein Umbau am DE-Kern und keine Veröffentlichung ungeprüfter internationaler Seiten nötig.

**Abhängigkeiten:** M17-04, M18-01, M18-02, M19-02, M19-01

### M19-04 — Betriebshandbuch und Restrisiken fertigstellen

**Umsetzung:** Source hinzufügen, Partner sperren, Datenrollback, Secretrotation, Frischeprüfung, Gebühren-/Reisereview und Kostenlimits beschreiben.

**Liefergegenstände:** `docs/RUNBOOK.md`; `docs/KNOWN_LIMITATIONS.md`

**Abnahme:** Betreiber kann die wichtigsten Eingriffe anhand konkreter Dateien/Befehle durchführen.

**Abhängigkeiten:** M17-04, M18-01, M18-02, M19-03, M19-01

### M19-05 — Aufgaben-/Launchstatus abgleichen

**Umsetzung:** Alle 120 Tasks auf Nachweise prüfen; done, blocked und bewusst deferred getrennt zählen. Abnahmebericht nennt exaktes Feature-Set.

**Liefergegenstände:** `project/tasks.json`; `docs/STATUS.md`; `docs/HANDOFF.md`

**Abnahme:** Keine 100-Prozent-Behauptung bei offenen erforderlichen Freigaben; Status ist mit Dateien/Tests konsistent.

**Abhängigkeiten:** M17-04, M18-01, M18-02, M19-04, M19-01

### M19-06 — Freigegebenen Release wirklich veröffentlichen **[Externer Freigabepunkt]**

**Umsetzung:** Nur mit echten Betreiber-/Quellen-/Fachfreigaben und dokumentierter Veröffentlichungsautorisierung über Cloudflare deployen. URL, Build-ID, Code-/Daten-Commit und Smoke notieren.

**Liefergegenstände:** `docs/RELEASE.md`; `production deployment evidence`

**Abnahme:** Live-Abnahme real belegt; andernfalls technisch fertigen Stand und konkrete externe Blocker sauber übergeben.

**Abhängigkeiten:** M17-04, M18-01, M18-02, M19-05, M19-01
