# Projektstatus

Stand: 2026-09-15. Maßgeblich ist `project/tasks.json`.

**Erledigt:** 138 von 138 Aufgaben. **In Arbeit:** keine. **Blockiert:** keine.

## Tatsächlicher Stand

Neu umgesetzt und lokal geprüft: Anforderungen aus `IMPLEMENTIERUNG_WAUANDMIAU.md`, darunter Quellen-/Partnerstatus, Verzeichnisdatenschutz mit dauerhaften Sperren/Korrekturen, GOT-Texte und Sollwerte, eigene Ernährungsfreigabe sowie Rechte- und Verarbeitungsinventare. `npm run verify` bestand mit 1.484 Tests in 102 Dateien; `npm run build:app` bestand alle 15 Prüfschritte und erzeugte 1.241 Seiten. Details: `docs/reviews/wm-implementation-2026-09-14.md`.

Die V2-App und die nach Nutzerrückmeldung gefundenen Funktionsfehler sind implementiert und geprüft. Umfang: Gebührenrechner, Karte, Reisecheck, Pflege, Spielzeug, Futtervergleich, Ratgeber, lokale Profile und Sicherungsdateien. `npm run build:app` baut die echte, nicht indexierbare Vorschau.

Reale Daten: 9.381 Orte, 46.113 Ortsnamen, 42 Stadtseiten, 1.006 GOT-Positionen, 30 Berliner und 140 Hamburger kommunale Flächen, vier Futtervarianten und drei Zubehörprodukte mit Herstellerquellen.

Der Code prüft Betreiberkonfiguration, funktionsabhängige Freigaben, Rechte, Daten und fertigen Output vor der Veröffentlichung. Code und Snapshots kommen aus derselben Revision; Build-Metadaten halten Daten-Hashes fest. `main` verlangt jetzt Pull Requests und alle fünf CI-/Security-Checks.

## Prüfung und Veröffentlichung

`npm run verify`: 1.496 Tests in 102 Dateien sowie alle weiteren Prüfschritte bestanden. Der Produktionsbuild bestand alle 15 Gates; die vollständige Playwright-Matrix in CI ist erfolgreich.

Die Domain `wauandmiau.de` liefert den freigegebenen Produktionsbuild. Betreiberangaben sowie die für den aktuellen Funktionsumfang erforderlichen Fach-, Rechts- und Datenrechtefreigaben sind dokumentiert. Der freigegebene Fressnapf-Feedimport für eindeutig zugeordnete Bilder und Deep Links ist vorbereitet; bis zur Hinterlegung des Repository-Secrets bleiben die Karten bei den vorhandenen Symbolbildern. Preise, Verfügbarkeiten und weitere Händlerfeeds bleiben außerhalb des aktuellen Umfangs.
