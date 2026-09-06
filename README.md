# Haustierplattform: Implementierungspaket für Claude Code

**Deutschland-first · Static-first · internationales Datenmodell**

Stand: 6. September 2026. Arbeitstitel: PetAtlas, kein geprüfter Markenname.

## Was dieses Paket enthält

Ein umfangreicher Ausführungsplan mit **20 Meilensteinen und 120 einzeln prüfbaren Aufgaben**, eine kurze CLAUDE.md, Start-/Fortsetzungsprompts, konkrete Architektur-/Daten-/Betriebs-/Testvorgaben und ein funktionsfähiges Statuswerkzeug.

Es ist **keine bereits implementierte Website**. Es wurden mit diesem Paket weder ein GitHub-Repository angelegt noch Cloudflare verbunden, Partnerverträge akzeptiert oder Produktionsdaten freigegeben. Alle Implementierungsaufgaben stehen zunächst auf todo.

## Anwendung

Paket in das vorgesehene Projektverzeichnis entpacken. Bestehende Dateien/CLAUDE.md nicht blind überschreiben. Claude Code in diesem Verzeichnis öffnen und den Startprompt aus STARTPROMPT.md übergeben.

Der Agent beginnt mit Arbeitsverzeichnis-/Git-Prüfung, arbeitet nach den Dependencies, dokumentiert Nachweise und setzt bei externen Blockern an unabhängigen Aufgaben fort. Konto-, Kosten-, Rechte- und fachliche Freigaben bleiben echte Gates; ein langer autonomer Codinglauf ersetzt sie nicht.

## Die wichtigsten Dateien

| Datei | Zweck |
|---|---|
| IMPLEMENTIERUNGSPLAN.md | Vollständiger zusammenhängender Plan einschließlich aller Arbeitspakete und Quellen. |
| CLAUDE.md | Kurze dauerhaft relevante Ausführungs- und Sicherheitsregeln. |
| STARTPROMPT.md | Direkt verwendbarer Start-, Fortsetzungs- und Statusprompt. |
| project/tasks.json | Maßgeblicher maschinenlesbarer Aufgabenstatus mit Dependencies und Nachweisen. |
| docs/MILESTONES.md | Modulare Beschreibung der 120 Aufgaben. |
| docs/ARCHITECTURE.md | Stack, Datenverträge, Dateistruktur und Internationalisierung. |
| docs/DATA_SOURCES.md | Quellen, Publikationsrechte, Frische und Qualitätsgrenzen. |
| docs/OPERATIONS.md | Cloudflare-Build, Actions, Datenbranches, Secrets, Fehler- und Rollbackpfade. |
| docs/QUALITY_GATES.md | Konkrete Tests und Freigabestufen. |
| docs/GOT_RULE_SPEC.md | Ausgangsregeln und synthetische Rechentests für den Gebührenrechner. |
| docs/EXTERNAL_SETUP.md | Einmalige externe Konten-/Rechte-/Betreiberentscheidungen. |
| docs/STATUS.md, BLOCKERS.md, HANDOFF.md | Kurze Fortschritts- und Übergabedokumente. |
| docs/SOURCES.md | 36 geprüfte Primärquellen. |

## Status abfragen

```bash
python3 scripts/project_status.py
python3 scripts/project_status.py --milestone M12
python3 scripts/project_status.py --json
python3 scripts/project_status.py --validate
python3 scripts/test_project_status.py
```

Der Statushelfer benötigt Python 3.10 oder neuer und keine zusätzlichen Pakete. Er ist lauffähig und lesend. Er verändert den Aufgabenstatus nicht. Zehn Tests prüfen den Statushelfer; diese Tests sind ausdrücklich **keine Tests der noch zu implementierenden Website**.

Die Unit-Tests arbeiten mit isolierten synthetischen Aufgaben. Sie bleiben dadurch verwendbar, wenn sich der echte Projektfortschritt ändert.

Eine abgeschlossene Aufgabe braucht in `evidence` mindestens einen Eintrag mit `description`, `reference` und `verified_at`; optional `command` und `exit_code`. Eine blockierte Aufgabe braucht `blocker.reason`, `blocker.required_action` und `blocker.owner`. Kein done ohne echte Nachweise und erfüllte Abhängigkeiten.

`current_task` referenziert die eine koordinierende Hauptaufgabe mit Status in_progress. Subagenten können separat untersuchen, ohne denselben Status oder dieselben Dateien konkurrierend zu überschreiben. Optional nötige Zusatzaufgaben erhalten neue stabile IDs.

## Technische Leitentscheidung

Astro erzeugt statisches HTML; kleine JSON-Dateien treiben Rechner und Filter im Browser an. GitHub Actions importiert zulässige offene Daten. Cloudflare Builds baut die Website und holt dort bei Bedarf freigegebene Affiliate-Feeds mit Secrets ab. Cloudflare Static Assets liefert das Ergebnis aus. Kein Supabase, kein D1/KV, kein SSR oder Besucher-API-Backend im Startumfang.

Ein öffentliches Repository ist weder ein Geheimnisspeicher noch automatisch eine einheitlich Open-Source-lizenzierte Datenbank. Öffentliche JSON-Dateien dürfen nur enthalten, was auch öffentlich ausgegeben werden darf.

## Dokumentpflege

Die modularen docs-Dateien sind für die tägliche Ausführung gedacht; IMPLEMENTIERUNGSPLAN.md ist ihre zusammengefasste Referenz. Architekturänderungen über ADRs dokumentieren und betroffene Spezifikation/Tests konsistent halten. Den Aufgabenstatus niemals aus einer alten Kopie des Plans zurücksetzen.
