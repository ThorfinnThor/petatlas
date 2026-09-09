# Projektstatus

Stand: 2026-09-09. Maßgeblich ist `project/tasks.json`.

**Erledigt:** 129 von 136 Aufgaben. **In Arbeit:** keine. **Blockiert:** sieben bestehende externe Freigaben.

## Tatsächlicher Stand

Die V2-App ist auf `codex/launch-readiness-design-v2` implementiert (PR #5). Sie enthält Gebührenrechner, Karte, Reisecheck, Pflege, Spielzeug, Futtervergleich, Ratgeber, lokale Profile und Sicherungsdateien. `npm run build:app` baut die echte, nicht indexierbare Vorschau mit diesen Funktionen.

Reale Daten: 9.381 Orte, 46.113 Ortsnamen, 42 Stadtseiten, 1.006 GOT-Positionen, 30 Berliner und 140 Hamburger kommunale Flächen, vier Futtervarianten und drei Zubehörprodukte mit Herstellerquellen.

Der Code prüft Betreiberkonfiguration, funktionsabhängige Freigaben, Rechte, Daten und fertigen Output vor der Veröffentlichung. Code und Snapshots kommen aus derselben Revision; Build-Metadaten halten Daten-Hashes fest.

## Prüfung und Veröffentlichung

`npm run verify` besteht mit 1.431 Tests in 94 Dateien. `npm run build:app` besteht mit 15 Prüfschritten. Die abschließende Browsermatrix ist grün: 228 Basis-, 107 Zugänglichkeits-, 298 Feature-, 11 App- und 12 Leistungsprüfungen. Elf bestehende Fälle werden begründet übersprungen; Einzelheiten in `ACCEPTANCE.md`.

Die existierende Cloudflare-Vorschau zeigt noch den älteren Stand. Eine Aktualisierung ist durch den abgelaufenen Cloudflare-Login blockiert. Der Nutzer liefert Domain, Betreiberangaben, Produktverträge und fachliche Freigaben später; danach folgen die öffentliche Freigabe und Produktionsveröffentlichung.

M23-01 ist abgeschlossen. Nächster Schritt nach erneuter Cloudflare-Anmeldung: Vorschau veröffentlichen und am ausgelieferten Link prüfen. Umfang, behobene Befunde und verbleibende externe Voraussetzungen stehen in `LAUNCH_V2.md`.
