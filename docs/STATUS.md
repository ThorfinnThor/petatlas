# Projektstatus

Stand: 2026-09-14. Maßgeblich ist `project/tasks.json`.

**Erledigt:** 131 von 138 Aufgaben. **In Arbeit:** keine. **Blockiert:** sieben externe Freigabe-/Veröffentlichungsaufgaben, teilweise nur für optionale Angebote.

## Tatsächlicher Stand

Neu umgesetzt und lokal geprüft: Anforderungen aus `IMPLEMENTIERUNG_WAUANDMIAU.md`, darunter Quellen-/Partnerstatus, Verzeichnisdatenschutz mit dauerhaften Sperren/Korrekturen, GOT-Texte und Sollwerte, eigene Ernährungsfreigabe sowie Rechte- und Verarbeitungsinventare. `npm run verify` bestand mit 1.484 Tests in 102 Dateien; `npm run build:app` bestand alle 15 Prüfschritte und erzeugte 1.241 Seiten. Details: `docs/reviews/wm-implementation-2026-09-14.md`.

Die V2-App und die nach Nutzerrückmeldung gefundenen Funktionsfehler sind implementiert und geprüft. Umfang: Gebührenrechner, Karte, Reisecheck, Pflege, Spielzeug, Futtervergleich, Ratgeber, lokale Profile und Sicherungsdateien. `npm run build:app` baut die echte, nicht indexierbare Vorschau.

Reale Daten: 9.381 Orte, 46.113 Ortsnamen, 42 Stadtseiten, 1.006 GOT-Positionen, 30 Berliner und 140 Hamburger kommunale Flächen, vier Futtervarianten und drei Zubehörprodukte mit Herstellerquellen.

Der Code prüft Betreiberkonfiguration, funktionsabhängige Freigaben, Rechte, Daten und fertigen Output vor der Veröffentlichung. Code und Snapshots kommen aus derselben Revision; Build-Metadaten halten Daten-Hashes fest. `main` verlangt jetzt Pull Requests und alle fünf CI-/Security-Checks.

## Prüfung und Veröffentlichung

`npm run verify`: 1.484 Tests in 102 Dateien sowie alle weiteren Prüfschritte bestanden. `npm run build:app`: 15 Prüfschritte bestanden. Die vollständige Playwright-Matrix des vorherigen Basisstands ist in `PUBLIC_RELEASE_ACCEPTANCE.md` belegt. Auf dem aktuellen Host scheiterte Chromium vor Teststart an der macOS-MachPort-Sandbox; die betroffenen Kernabläufe wurden deshalb zusätzlich im sichtbaren In-App-Browser geprüft.

Eine Cloudflare-Vorschau und die Domain `wauandmiau.de` existieren; der aktuelle Arbeitsstand ist noch nicht als freigegebener Produktionsbuild veröffentlicht. Betreiberangaben sind eingebaut. Bedingte Betreiberfragen sowie die für aktivierte Funktionen erforderlichen Fach-, Rechts- und Datenrechtefreigaben fehlen weiterhin. Technische Tests erteilen keine solchen Freigaben.
