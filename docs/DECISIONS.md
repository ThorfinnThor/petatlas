# Verbindliche Architekturentscheidungen

Stand: 2026-09-06. Diese Entscheidungen sind Vorgaben des Plans, keine behaupteten bereits ausgeführten Arbeiten.

| ID | Entscheidung | Begründung / Konsequenz |
|---|---|---|
| ADR-001 | Deutschland-first, internationalisierbar | Nur Markt DE ist öffentlich aktiv. Zielstaaten im Reisecheck sind keine gestarteten Absatzmärkte. |
| ADR-002 | Astro, statische Ausgabe | HTML wird beim Build erzeugt; Interaktion im Browser. Kein SSR, keine Server Actions. |
| ADR-003 | Cloudflare Workers Static Assets, assets-only | Neues Cloudflare-Projekt, keine Worker-Request-Logik. Name „Workers“ bedeutet hier nicht, dass für jeden Seitenaufruf Rechenlogik läuft. [S02–S04] |
| ADR-004 | Build und Deploy bei Cloudflare | GitHub Actions übernehmen Tests, Import und Überwachung; sie sind nicht der zweite Produktions-Deploymentpfad. |
| ADR-005 | Öffentliches GitHub-Repo | Nur veröffentlichungsfähige Inhalte. Keine Bestandsrepos ungeprüft auf public umstellen. |
| ADR-006 | Keine Laufzeit-Datenbank | Kein Supabase, Postgres, D1, KV, Firebase oder eigener API-Server im Startumfang. Temporäre Build-Dateien und ein flüchtiger Osmium-Index sind keine gehostete Produktdatenbank. |
| ADR-007 | Datenklassen statt „alles ist JSON“ | Öffentliche Open-Data-Snapshots, vertragliche Affiliate-Feeds, eigene Redaktion und lokale Nutzerdaten getrennt behandeln. |
| ADR-008 | Affiliate-Feeds standardmäßig nur im vertrauenswürdigen Cloudflare-Build | Keine Rohfeeds in Git, Actions-Artefakten oder öffentlichen Build-Logs. Nur vertraglich freigegebene Anzeigefelder gelangen in HTML/JSON. |
| ADR-009 | Versionierte offene Daten im separaten data-live-Branch | main enthält Code, Rechtekonfiguration, redaktionell freigegebene Regeln und kleine Testdaten. Automatik schreibt nicht in main. |
| ADR-010 | Kein Markt-/Sprachraten | /de-de/ ist die erste Route; Markt, Sprache, Währung und geografisches Ziel sind unterschiedliche Felder. Keine IP-Weiterleitung. |
| ADR-011 | Fachliche Fail-closed-Regeln | Unbekannte Einreisevoraussetzung, ungeprüfte Behandlung oder unbekannte Produkteignung darf nicht zu einem positiven Ergebnis werden. |
| ADR-012 | Kontextbezogene Werbung statt Diagnose-Funnel | Medizinische Inhalte, Risikohinweise und Erlöslogik organisatorisch trennen. Keine Angst- oder Akutnotfall-Vermarktung. |
| ADR-013 | Feature Flags je Markt und Freigabestatus | Fehlende echte Daten deaktivieren eine Funktion; sie rechtfertigen keine veröffentlichten Testdaten. |
| ADR-014 | Repo-öffentlich ist nicht automatisch Open Source | Keine pauschale MIT-Lizenz über Code, fremde Daten, Bilder und Texte legen. Code-Lizenzentscheidung separat dokumentieren. |
| ADR-015 | Keine erfundenen Qualitätsbeweise | Keine Fake-Tests, Bewertungen, Tierärzte als Autoren, Partnerverträge, Statistiken oder Sicherheitsgarantien. |
| ADR-016 | Autonomie ist überprüfbarer Fortschritt | Kleine Aufgaben, automatisierte Tests, Git-Checkpoints, Blocker und Handoff. Keine Endlosschleifen oder ausgeschalteten Schutzmechanismen. |

## Nicht ohne neue Entscheidung hinzufügen

Bezahlte Infrastruktur, Login, Newsletter-Versand, Uploads, zentrale Nutzerbewertungen, Cloud-Profil, KI-Ratgeber im Besucherpfad, proprietäre Geocoding-API, serverseitiges Affiliate-Klicktracking, internationale Live-Märkte und automatisch übernommene Behandlungs-/Reiseregeln.

Wenn eine Entscheidung technisch nicht tragfähig ist, dokumentiere Messung, Alternativen und Kosten in einer neuen ADR. Bis zur Entscheidung arbeite an unabhängigen Aufgaben weiter. „Bequemer“ ist kein ausreichender Grund, das Static-first-Prinzip aufzugeben.

## Übernommener Startumfang (M00-02)

Die ADRs ADR-001 bis ADR-016 sind gelesen und als verbindlich übernommen. Der daraus abgeleitete Startumfang ist maschinenlesbar in `config/launch.json` festgehalten:

- **Aktiver Markt:** ausschließlich `DE`. `US` und `NL` existieren als deaktivierte Konfiguration zur Prüfung der Internationalisierung, nicht als Absatzmärkte.
- **Freigaben:** alle Gates in `config/launch.json` stehen auf `approved: false`. Kein Gate darf durch Implementierungsfortschritt automatisch auf `true` wechseln; nur die dort benannte zuständige Person trägt eine Freigabe mit Nachweis in `docs/reviews/` ein.
- **Ausdrücklich ausgeschlossen:** die Liste `excludedFromStartScope` in `config/launch.json`. Sie entspricht ADR-006, ADR-012 und dem Abschnitt „Nicht ohne neue Entscheidung hinzufügen“ oben. Ergänzungen nur über eine neue ADR.
- **Roadmap:** kein ungeplantes Backend und keine Zusatzprodukte. Spätere Ideen gehören nach `docs/FUTURE_SCOPE.md`, nicht in den Startumfang.

## ADR-017 — Codelizenz bleibt offen, keine pauschale Projektlizenz (M00-05)

**Entscheidung:** Es wird keine projektweite `LICENSE`-Datei mit MIT oder einer vergleichbaren pauschalen Erlaubnis angelegt. Die Lizenz für den eigenen Code ist eine eigene, noch ausstehende Entscheidung des Betreibers; bis dahin gilt „alle Rechte vorbehalten“.

**Begründung:** Das Repository enthält absehbar ODbL-Daten, optionale OPFF-Inhalte, vertragliche Partnerfelder und Herstellerbilder. Eine pauschale Projektlizenz würde Rechte einräumen, über die der Betreiber nicht verfügt. Repo-Publicity ist keine Weiterverwendungserlaubnis (ADR-014).

**Konsequenz:** Rechtehinweise werden pro Datenklasse in `licenses/README.md` geführt. Vor jedem Live-Import sind Lizenz, Publikationsrecht und Attributionspflicht der Quelle geprüft und der tatsächliche Datenfluss dokumentiert. Die spätere Codelizenzentscheidung erhält eine eigene ADR und betrifft ausschließlich eigenen Code.

## ADR-018 — Bezugsweg für den Gebührenkatalog (B-001, entschieden am 2026-09-06)

**Entscheidung des Betreibers:** Der GOT-Gebührenkatalog wird über den offiziell angebotenen XML-Download bezogen: `https://www.gesetze-im-internet.de/got_2022/xml.zip`. B-001 gilt damit als entschieden und ist kein externer Freigabe-Blocker mehr.

**Begründung des Betreibers:** Der Verordnungstext ist nach § 5 Abs. 1 UrhG nicht urheberrechtlich geschützt. „Gesetze im Internet“ stellt die Normen ausdrücklich auch als XML zur automatisierten Weiterverarbeitung bereit. Verwendet wird ausschließlich dieser Download; es entsteht kein allgemeiner Website-Crawler. Eine individuelle Genehmigung des Anbieters ist keine Voraussetzung der Implementierung.

### Verbindliche Vorgaben für die Umsetzung

**Bezug und Verarbeitung.** Der Importer lädt das ZIP, extrahiert die enthaltene XML sicher, parst den Katalog, normalisiert die Positionen und erzeugt deterministisches statisches JSON.

**Provenienz.** Jede erzeugte Ausgabe führt mindestens: Quellname, Quell-URL, Abrufzeitpunkt, SHA-256 der Originaldatei, Parser-Version und den erkannten Fassungsstand, soweit aus der Quelle zuverlässig bestimmbar.

**Snapshots statt Live-Abruf.** Entwicklung, Tests und Website-Builds hängen niemals von einem Live-Abruf ab. Grundlage ist ein versionierter, validierter lokaler Snapshot. Besucher der Website lösen keine Anfragen an gesetze-im-internet.de aus.

**Kein Crawling.** Kein Abruf des Gesamtangebots, keine parallelen Massendownloads, keine aggressiven Retry-Schleifen, keine Umgehung von Limits oder Sperren, keine unnötig häufigen Abrufe.

**Aktualisierung.** Höchstens einmal pro Woche: abrufen, Hash mit dem vorhandenen Snapshot vergleichen, bei Gleichstand nichts tun, sonst neuen Snapshot erzeugen, Schema und Inhalt validieren, Diff erzeugen, Tests laufen lassen und erst danach übernehmen.

**Fehlerverhalten.** Ein fehlgeschlagener Abruf löscht oder überschreibt den letzten validierten Snapshot nicht. Stattdessen: alten Snapshot weiterverwenden, Fehler protokollieren, Datenstand als nicht aktualisiert kennzeichnen, keine falschen oder leeren GOT-Daten veröffentlichen.

**Strukturänderung.** Kann der Parser nach einer Änderung der XML-Struktur nicht mehr sicher arbeiten, wird der Import abgebrochen, der bisherige Snapshot weiterverwendet und ein Blocker mit konkretem Fehler angelegt. Keine stillen Heuristiken, die falsche Gebühren erzeugen könnten.

**Rechtekennzeichnung.** Die GOT-Daten werden nicht als CC0, MIT oder unter einer selbst erfundenen Lizenz gekennzeichnet. Dokumentiert wird die Rechtsgrundlage des übernommenen Normtexts: § 5 Abs. 1 UrhG.

**Darstellung im Produkt.** Der Rechner wird nicht als amtlicher Rechner dargestellt. Die Oberfläche macht deutlich: Grundlage ist die GOT, die Berechnung ist eine eigene Orientierung, tatsächliche Kosten können zusätzliche Positionen enthalten, und der Fassungsstand der verwendeten Daten wird angezeigt.

**Verbleibende technische Prüfung.** Vor Aktivierung eines zeitgesteuerten Abrufs werden robots.txt, offizielle Hinweise zur automatisierten Weiterverarbeitung, HTTP-Verhalten, ETag/Last-Modified und etwaige Limits geprüft und dokumentiert. Das ist eine Betriebsprüfung und kein Blocker für die Implementierung: Aufgabe **M17-07**. Findet sich dabei ein ausdrücklicher Hinweis, der den automatisierten Abruf einschränkt, wird nur das Scheduling gestoppt, der Fund mit Quelle dokumentiert und mit dem vorhandenen Snapshot weitergearbeitet.
