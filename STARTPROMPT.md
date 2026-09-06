# Startprompt für Claude Code

Kopiere den folgenden Text in Claude Code, nachdem dieses Paket in das vorgesehene Projektverzeichnis entpackt wurde. Ein vorhandenes CLAUDE.md nicht unbesehen überschreiben; Regeln zusammenführen.

```text
Du setzt jetzt die Haustierplattform aus diesem Repository um.

Lies CLAUDE.md, README.md, docs/DECISIONS.md und die Statusdateien.
Die vollständige Spezifikation steht in IMPLEMENTIERUNGSPLAN.md;
für die Ausführung verwende die modularen docs-Dateien und project/tasks.json.

Arbeite den Plan M00–M19 mit seinen 120 Einzelaufgaben ab.
Baue das Produkt tatsächlich, nicht nur Architektur, Mockups oder TODO-Dateien.
Wähle ausführbare Aufgaben nach ihren Abhängigkeiten. Deutschland ist der einzige
Startmarkt. Europa und USA werden nur durch Markt-/Locale-/Providerverträge vorbereitet.

Verwende Astro static, TypeScript, öffentliche zulässige JSON-Snapshots,
GitHub Actions für CI/Import und Cloudflare Builds + Static Assets für Build/Deployment.
Kein Supabase, keine Laufzeitdatenbank, kein SSR und kein ungeplantes API-Backend.

Führe nach jedem sinnvollen Abschnitt die passenden Tests aus.
Prüfe UI-Änderungen zusätzlich im Browser. Pflege task status, Nachweise,
STATUS.md, BLOCKERS.md und HANDOFF.md. Erstelle kleine überprüfbare Commits.

Halte nicht nach dem ersten Scaffold an. Arbeite an der nächsten ausführbaren
Aufgabe weiter. Fehlt ein Account, ein Secret, ein Partnervertrag oder ein Fachreview,
blockiere nur die betroffene Integration, verwende eindeutig synthetische Fixtures
für lokale Tests und arbeite an unabhängigen Aufgaben weiter.

Du darfst keine Datenrechte, echten Testergebnisse, Partnerschaften oder
medizinischen/rechtlichen Freigaben erfinden. Kein veröffentlichter Produktionsinhalt
mit Fake-Daten. Geschützte Affiliate-Rohfeeds und Tokens gehören weder ins öffentliche
Repository noch in Browser-JSON, Logs oder öffentliche Artefakte.

Verwende nur eindeutig autorisierte Konten/Projekt-Remotes. Keine kostenpflichtigen
Ressourcen, keine Vertragszustimmungen und kein Veröffentlichen ungeprüfter Inhalte.
Erste Produktion nur nach den echten Launch-Gates des Plans.

Antworte auf Statusfragen mit Meilenstein-ID, Aufgaben-ID, erledigten Aufgaben,
letztem tatsächlich ausgeführten Test, Blockern und nächstem Schritt.

Beginne jetzt mit der Prüfung des Arbeitsverzeichnisses und M00-01.
Ist bereits Arbeit vorhanden, setze am dokumentierten Checkpoint fort.
```

## Fortsetzung nach einer Unterbrechung

```text
Setze die Umsetzung fort. Lies CLAUDE.md, project/tasks.json und docs/HANDOFF.md.
Prüfe den tatsächlichen Git-Zustand und die letzten Testnachweise. Erfinde keinen
neuen Gesamtplan, sondern fahre mit der nächsten ausführbaren Aufgabe fort.
Blockierte externe Freigaben bleiben blockiert; arbeite an unabhängigen Aufgaben weiter.
```

## Präzise Statusabfrage

```text
Status M12: Welche Teilaufgaben sind erledigt, woran arbeitest du gerade,
welcher Test wurde zuletzt wirklich ausgeführt, was ist blockiert und was folgt?
Trenne implementierten Code von fachlich freigegebenem Live-Betrieb.
```

## Erwartete Statusform, nur ein Formatbeispiel

```text
Meilenstein: M12 — Reisecheck
Aktuell: M12-04 — Wizard und Ergebnisse
Erledigt: [echte Anzahl]/6 Teilaufgaben
Letzter Test: [tatsächlicher Befehl, Ergebnis, Commit]
Blocker: [echter Blocker oder keiner]
Nächster Schritt: [konkrete Aufgabe]
Live-Freigabe: [ja/nein mit Nachweis]
```

Der Prompt ersetzt keine vorhandenen Sicherheitsfreigaben, laufende Claude-Code-Sitzung oder Kontozugänge. Er ermöglicht strukturiertes Weiterarbeiten; unbegrenzt ununterbrochene Ausführung wird nicht garantiert.
