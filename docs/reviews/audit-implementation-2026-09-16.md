# Audit-Review und Implementierungsbericht vom 16.09.2026

Prüfbasis: `AUDIT.md`, Repository-Commit
`3307cac504d6f9cd71e1ebb6cc9e4f5634f13d5d` und die dazugehörige Anwendung.
Das Audit wurde als Hypothesenliste behandelt. Jede Aussage wurde vor einer
Änderung gegen Quellcode, gespeicherte Datenverträge, Tests, Build-Prozess und
Deployment-Konfiguration geprüft.

## Zusammenfassung

- **11 Punkte geprüft:** 9 konkrete QA-Findings und 2 offene Vertragsfragen.
- **7 × ✅ YES**, **2 × ⚠️ YES, BUT MODIFY**, **1 × ❌ NO** und
  **1 × 🛑 DANGEROUS / menschliche Produktentscheidung**.
- **9 Findings implementiert.**
- **Keine** neue Abhängigkeit, Route, Datenbank, Server-API oder Änderung an den
  bestehenden Speicherformaten eingeführt.
- Die gefährliche Frankreich-Entscheidung wurde nicht geraten. Der bestehende
  Schutz bleibt bestehen.
- Die behauptete Unvereinbarkeit der erlaubten Kostensumme mit dem aktuellen
  Freigabestand trifft für den geprüften Stand nicht zu; dieser Punkt führte zu
  keiner Funktionsänderung.

## Vorab-Checkliste

Diese Checkliste wurde vor den Implementierungsänderungen erstellt.

### QA-01 — Deployment-Policies blockieren Suche und Standort

**Verdict:** ✅ YES — Makes Sense  
**Risk:** LOW

**Why:** Der Generator erlaubte Pagefind die dokumentierte WebAssembly-Ausführung
nicht und setzte für Geolocation eine leere Allowlist. Beides widersprach den
verwendeten Browser-APIs. Die Änderung betrifft jeden ausgelieferten Pfad, wird
aber vom bestehenden Dist-Audit und Header-Vertrag kontrolliert.

**Audit recommendation:** Nur die benötigte Wasm-Fähigkeit freigeben,
Geolocation auf dieselbe Herkunft begrenzen und keine breiten CSP-Ausnahmen
einführen.

**Implementation decision:** `script-src 'wasm-unsafe-eval'` und
`Permissions-Policy: geolocation=(self)` ergänzen. Allgemeines `unsafe-eval`,
ausführbare Inline-Skripte, Kamera, Mikrofon, Payment und USB bleiben gesperrt.

**Potential impact:** Pagefind und die explizit geklickte Standortabfrage können
funktionieren; andere Browserrechte werden nicht erweitert.

### QA-02 — Backup-Import kann alten und neuen Stand mischen

**Verdict:** ⚠️ YES, BUT MODIFY  
**Risk:** MEDIUM

**Why:** `localStorage` bietet keine Mehrschlüssel-Transaktion. Eine komplette
Migration auf einen neuen Speicherschlüssel hätte vorhandene Profile,
Merkliste und Packlisten unnötig gefährdet.

**Safer approach:** Die drei bestehenden Schlüssel beibehalten, vor jeder
Übernahme ein versioniertes Journal mit dem exakten Vorzustand schreiben,
Zielwerte vollständig ersetzen, jeden Wert zurücklesen und das Journal erst
danach entfernen. Bei Fehler oder unterbrochenem Seitenlauf wird der alte Stand
wiederhergestellt. `null` löscht den jeweiligen Bereich ausdrücklich.

**Potential impact:** Das bestehende Exportformat und alle Leser bleiben
kompatibel. Während der Übernahme gibt es einen zusätzlichen internen
Journal-Schlüssel. Die Oberfläche zeigt vor dem Commit Profil und Anzahl der
enthaltenen Merk-/Packlisten-Einträge und verlangt eine ausdrückliche
Bestätigung.

### QA-03 — Reiseergebnis bleibt nach Eingabeänderung sichtbar

**Verdict:** ✅ YES — Makes Sense  
**Risk:** LOW

**Why:** Die Anzeige hatte keinen Bezug mehr zu den sichtbaren Eingaben. Das ist
bei Reisevoraussetzungen irreführend.

**Audit recommendation:** Ergebnisrevision verfolgen und direkte sowie
programmatische Änderungen erfassen.

**Implementation decision:** Nach jedem bestehenden Ergebnis ersetzen `input`
oder `change` die Checkliste durch den Status „Angaben geändert. Bitte prüfen
Sie die Reise erneut.“ Die Profilübernahme sendet bereits ein bubbled `change`
und ist damit eingeschlossen.

**Potential impact:** Nutzer müssen nach Änderungen erneut prüfen; die
Reiseregeln selbst ändern sich nicht.

### QA-04 — Ungültiges Profilgewicht wird wie „leer“ behandelt

**Verdict:** ✅ YES — Makes Sense  
**Risk:** LOW

**Why:** Leere Eingaben sind bewusst optional. Nichtleere Werte wie `abc`, `0`
oder `201` sind dagegen Eingabefehler und dürfen nicht still verschwinden.

**Audit recommendation:** Leer/gültig/ungültig unterscheiden, Fehler zuordnen
und Speichern blockieren.

**Implementation decision:** Ein typisierter Parser liefert drei Zustände,
akzeptiert Komma oder Punkt, höchstens drei Nachkommastellen und Werte über 0
bis 200 kg. Ungültige Werte erhalten `aria-invalid`, einen verbundenen
Fehlertext und verhindern den Commit.

**Potential impact:** Alte gültige Profile und leere optionale Gewichte bleiben
kompatibel.

### QA-05 — Gespeichert-Meldung bleibt nach Entwurfsänderungen stehen

**Verdict:** ✅ YES — Makes Sense  
**Risk:** LOW

**Why:** Die alte Meldung behauptete nach einer Änderung weiterhin einen
Speicherstand, den es nicht gab.

**Audit recommendation:** Entwurfs- und Commit-Zustand getrennt anzeigen.

**Implementation decision:** Nach `input` oder `change` zeigt das Profil
„Änderungen noch nicht gespeichert.“ Ein erfolgreicher Commit setzt den
Dirty-Zustand zurück. Es gibt weiterhin kein Autosave.

**Potential impact:** Nur die Rückmeldung ändert sich; Datenschutz- und
Speicherverhalten bleiben unverändert.

### QA-06 — Drei Suchen verschweigen abgeschnittene Treffer

**Verdict:** ⚠️ YES, BUT MODIFY  
**Risk:** LOW

**Why:** Unbegrenztes DOM- und Karten-Rendering wäre keine gute Korrektur. Die
Nutzer müssen aber Gesamtumfang und einen erreichbaren nächsten Schritt sehen.

**Safer approach:** Seitensuche in Zehnerblöcken und Gebühren in
25er-Blöcken nachladen. Kartenlisten bleiben bei 100 dynamischen bzw. 25
statischen Treffern begrenzt, nennen aber „erste N von M“ und führen zur
Eingrenzung über Radius oder Kategorie. Sortierung und bestehende Filterlogik
bleiben erhalten.

**Potential impact:** Große Trefferlisten sind vollständig auffindbar, ohne
alle Suchdaten auf einmal zu rendern. Karten bleiben performant.

### QA-07 — Gebührenkatalog hat keinen Retry und verliert HTTP-Kontext

**Verdict:** ✅ YES — Makes Sense  
**Risk:** LOW

**Why:** Ein vorübergehender Fehler machte die Suche bis zum kompletten Reload
unbrauchbar. JSON wurde auch bei HTTP-Fehlern ungeprüft gelesen.

**Audit recommendation:** Status und Payload prüfen, genau einen laufenden Load
erlauben und Retry anbieten.

**Implementation decision:** Manifest und Chunk werden auf `response.ok`, Form,
internen Pfad und Datensätze geprüft. Ein sichtbarer Retry erscheint nur im
Fehlerfall. Ein In-flight-Guard verhindert parallele Ladevorgänge. Während des
Ladens bleibt die Suche deaktiviert.

**Potential impact:** Kein Rechenweg läuft mit geratenen oder teilweise
geladenen Daten.

### QA-08 — Tastaturtest überspringt sich selbst

**Verdict:** ✅ YES — Makes Sense  
**Risk:** LOW

**Why:** Der Test suchte einen nicht mehr vorhandenen Selektor und wandelte das
in einen Skip um. Damit war eine zentrale Barrierefreiheitszusage nicht
abgedeckt.

**Audit recommendation:** Den tatsächlichen Rechner per Tastatur vollständig
durchlaufen.

**Implementation decision:** Suche fokussieren, Position hinzufügen, eine
ungültige Menge mit fokussierter Fehlermeldung erzeugen, korrigieren und die
Position entfernen. Kein bedingter Skip bleibt in diesem Test.

**Potential impact:** Produktverhalten ändert sich nicht; die CI erkennt mehr
Regressionsfälle.

### QA-09 — Profil zeigt `dog` und `cat`

**Verdict:** ✅ YES — Makes Sense  
**Risk:** LOW

**Why:** Interne Domainwerte gehören nicht in eine deutsche Nutzeroberfläche.

**Audit recommendation:** Anzeigelabel lokalisieren.

**Implementation decision:** Nur die Darstellung verwendet „Hund“ und „Katze“;
die persistierten Werte bleiben `dog` und `cat`.

**Potential impact:** Keine Schema- oder Kompatibilitätsänderung.

### Q-01 — Ungeklärte französische Kategorie als positives Ergebnis

**Verdict:** 🛑 DANGEROUS — Could Break the Project  
**Risk:** HIGH  
**Category:** REQUIRES HUMAN DECISION

**Why:** Ob eine ungeklärte nationale Bedingung ein positives Gesamtergebnis
blockiert oder nur einen Hinweis erzeugt, ist eine fachliche Produktentscheidung
mit möglicher Auswirkung auf Reiseentscheidungen. Der Code allein beweist die
gewünschte Aussage nicht.

**Do not implement automatically.** Der bestehende Schutz und die Hinweise
bleiben bestehen. Für eine Änderung braucht es einen bestätigten Sollsatz und
einen freigegebenen Testfall: alle EU-Gesundheitsbedingungen erfüllt,
französische Kategorie bzw. Voraussetzungen aber ungeklärt.

### Q-02 — Vorschau-Summe gegenüber freigegebener Gesamtschätzung

**Verdict:** ❌ NO — Do Not Implement  
**Risk:** NONE

**Why:** Im geprüften Repository ist `config/costs/DE.json` fachlich als
`approved` markiert. Die Oberfläche summiert ausschließlich die vom Nutzer
selbst gewählten GOT-Positionen und kennzeichnet das Ergebnis als unverbindliche
Berechnungsübersicht. Sie behauptet weder vollständige Behandlungskosten noch
eine Praxisrechnung. Die vorhandenen Akzeptanztests sichern genau diesen
Vertrag. Ein Entfernen der Summe würde bestätigte Funktionalität verschlechtern.

## Implementiert

### QA-01 — Minimale Browser-Policies

- Headergenerator und Dist-Audit auf `wasm-unsafe-eval` und same-origin
  Geolocation abgestimmt.
- Tests verhindern weiterhin allgemeines `'unsafe-eval'` und `'unsafe-inline'`
  in `script-src`.
- Der generierte Kandidat enthält die erwarteten Header.

**Dateien:** `scripts/build-headers.ts`, `scripts/checks/dist.ts`,
`tests/deployment-config.test.ts`, `tests/checks/dist-audit.test.ts`.

### QA-02 — Exakte, fehlertolerante Sicherungsübernahme

- Versioniertes Write-ahead-Journal, Snapshot, Read-back und Rollback.
- `null` leert Profil, Merkliste oder Packlisten ausdrücklich.
- Offene Transaktionen werden vor Zugriff aus Profil, Merkliste und Packlisten
  zurückgesetzt.
- Validierte Vorschau, explizite Bestätigung/Abbruch, Lesefehlerbehandlung und
  Schutz gegen überlappende Datei-Lesevorgänge.
- UI wird erst nach erfolgreichem Commit aktualisiert.

**Dateien:** `src/features/profile/backup-transaction.ts`,
`src/features/profile/profile-ui.ts`, `src/features/profile/favorites-ui.ts`,
`src/features/profile/packing-ui.ts`, `src/components/pages/Profile.astro`,
`tests/profile/backup-transaction.test.ts`, `tests/e2e-features/profil.spec.ts`.

### QA-03 — Reiseausgabe an sichtbare Eingaben koppeln

**Dateien:** `src/features/travel/wizard-ui.ts`,
`tests/e2e-features/reisecheck.spec.ts`.

### QA-04 und QA-05 — Profilvalidierung und Commit-Status

**Dateien:** `src/features/profile/state.ts`,
`src/features/profile/profile-ui.ts`, `src/components/pages/Profile.astro`,
`tests/profile/state.test.ts`, `tests/e2e-features/profil.spec.ts`.

### QA-06 — Vollständige und ehrliche Suchergebnisse

**Dateien:** `public/suche.js`, `src/features/costs/ui.ts`,
`src/features/map/list.ts`, `src/features/map/list-ui.ts`,
`src/components/pages/Map.astro`, `tests/app/acceptance.spec.ts`,
`tests/e2e-features/costs.spec.ts`, `tests/places/list.test.ts`.

### QA-07 — Validierter Gebühren-Load mit Recovery

**Dateien:** `src/features/costs/ui.ts`, `src/components/pages/Costs.astro`,
`tests/costs/ui-loader.test.ts`, `tests/e2e-features/costs.spec.ts`.

### QA-08 — Echter Tastaturpfad

**Datei:** `tests/accessibility/bedienung.spec.ts`.

### QA-09 — Deutsche Tierartlabel

**Dateien:** `src/features/profile/profile-ui.ts`,
`tests/e2e-features/profil.spec.ts`.

### Während der Verifikation gefunden

Das globale Button-Styling überstimmte den semantischen HTML-Zustand `hidden`.
Dadurch war der neue Retry auch nach einem erfolgreichen Load sichtbar und
hätte weitere dynamische Buttons betreffen können. Eine zentrale `[hidden]`-
Regel stellt die HTML-Semantik wieder her.

**Datei:** `src/styles/base.css`.

## Regression Check

- **Typecheck:** bestanden, 0 Fehler; zwei bereits vorhandene Astro-Hinweise zu
  ungenutzten `Props`.
- **Lint:** bestanden.
- **Format:** bestanden.
- **Unit/Integration via Vitest:** 105 Dateien, **1.513/1.513 Tests bestanden**.
- **Repository-Verify:** vollständig bestanden, einschließlich Secret-,
  Workflow-, Lizenz-, Inhalts- und Handoff-Prüfung.
- **Produktionsnaher App-Build:** 15/15 Schritte bestanden; 1.242 Seiten,
  1.006 Gebührenpositionen, 9.381 Orte, Pagefind-Index, Header-, Link-, Dist-,
  SEO-, Security- und Budget-Audit ohne Beanstandung.
- **Manuelle Browserprüfung am gebauten Artefakt:** Seitensuche 10→20 von 1.072,
  Gebührensuche 25→50 von 149, versteckter Retry nach erfolgreichem Load,
  Reiseergebnis-Invalidierung, deutsche Tierart, Dirty-Status und zugänglicher
  Gewichtsfehler bestätigt.
- **GitHub Browser-CI:** 228/228 Basis-E2Es, 110 Accessibility-/Browsermatrix-
  Tests mit 4 dokumentierten Skips, 312 Feature-E2Es mit 4 dokumentierten
  Viewport-Skips, 40/40 echte-App-/Viewport-Tests und 12/12 Performance-Tests
  bestanden.
- **Lokale Playwright-CLI:** In der lokalen macOS-Sandbox nicht ausführbar.
  Chromium scheitert bei der Mach-Port-Registrierung, WebKit mit
  `Abort trap: 6`, jeweils vor dem ersten Testschritt. Die GitHub-gehosteten
  Browserläufe decken diese Umgebungslücke ab.

## Geänderte Dateien

| Datei | Zweck |
|---|---|
| `public/suche.js` | Gesamtzahl und Nachladen der Seitensuche |
| `scripts/build-headers.ts` | minimale Wasm- und Geolocation-Policy |
| `scripts/checks/dist.ts` | ausgelieferte CSP prüfen |
| `src/components/pages/Costs.astro` | Retry-Steuerelement |
| `src/components/pages/Map.astro` | ehrlicher statischer Kartenstatus |
| `src/components/pages/Profile.astro` | Gewichtsfehler und Importvorschau |
| `src/features/costs/ui.ts` | validierter Load, Retry, Paging |
| `src/features/map/list-ui.ts` | Gesamtzahl und Eingrenzungshinweis |
| `src/features/map/list.ts` | begrenzte Treffer plus Metadaten |
| `src/features/profile/backup-transaction.ts` | Transaktionsjournal und Rollback |
| `src/features/profile/favorites-ui.ts` | offene Transaktion vor Nutzung erholen |
| `src/features/profile/packing-ui.ts` | offene Transaktion vor Nutzung erholen |
| `src/features/profile/profile-ui.ts` | sichere Übernahme, Validierung, Dirty-Status, Label |
| `src/features/profile/state.ts` | dreistufige Gewichtsprüfung |
| `src/features/travel/wizard-ui.ts` | veraltete Ergebnisse invalidieren |
| `src/styles/base.css` | `hidden`-Semantik absichern |
| `tests/accessibility/bedienung.spec.ts` | echter Tastaturablauf |
| `tests/checks/dist-audit.test.ts` | CSP-Dist-Regression |
| `tests/costs/ui-loader.test.ts` | HTTP-/Payload-Vertrag |
| `tests/deployment-config.test.ts` | Headervertrag |
| `tests/e2e-features/costs.spec.ts` | Retry und Nachladen |
| `tests/e2e-features/golden-path.spec.ts` | Kartenstatus mit offengelegtem Limit |
| `tests/e2e-features/map-list.spec.ts` | Kartenstatus ohne JavaScript |
| `tests/e2e-features/profil.spec.ts` | Import, Gewicht, Dirty-Status, Übersetzung |
| `tests/e2e-features/reisecheck.spec.ts` | direkte und programmatische Invalidierung |
| `tests/app/acceptance.spec.ts` | Gesamtzahl und Nachladen im vollständigen Index |
| `tests/places/list.test.ts` | Kartenlimit-Metadaten |
| `tests/profile/backup-transaction.test.ts` | Clear, Rollback, Recovery |
| `tests/profile/state.test.ts` | Gewichtsgrenzen |
| `docs/reviews/audit-implementation-2026-09-16.md` | Review, Entscheidungen und Nachweis |

## Nicht implementiert

### Q-01 — Frankreich-Aggregation

**Potential breaking impact:** Ein positives Ergebnis trotz ungeklärter
Einreisebedingung könnte Nutzer irreführen; ein pauschales Blockieren könnte
zulässige Fälle fälschlich negativ darstellen.

**Für eine sichere Umsetzung erforderlich:** Eine fachlich bestätigte Regel,
welche unbekannten französischen Bedingungen blockierend sind, plus ein
freigegebener Fixture-Test für den vollständig erfüllten EU-Fall mit
ungeklärter nationaler Kategorie. Bis dahin bleibt das bestehende Verhalten.

### Q-02 — Summe entfernen

**Reason for rejection:** Der aktuelle freigegebene Datenstand und der klar
begrenzte UI-Vertrag rechtfertigen die ausgewählte Positionssumme. Keine
Änderung erforderlich.

## Verbleibende Empfehlung

Nach Veröffentlichung müssen die **tatsächlich ausgelieferten** Cloudflare-
Header und derselbe Build auf `wauandmiau.de` geprüft werden. Quellcode- und
Artefaktprüfung beweisen die Generatorausgabe, aber nicht, ob eine zusätzliche
Cloudflare-Regel sie überschreibt. Die fachliche Entscheidung Q-01 bleibt als
einziger Auditpunkt offen.
