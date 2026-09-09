# Projektstatus

Stand: 2026-09-09. Maßgeblich ist `project/tasks.json`.

**Erledigt:** 131 von 138 Aufgaben. **In Arbeit:** keine. **Blockiert:** sieben externe Freigabe-/Veröffentlichungsaufgaben, teilweise nur für optionale Angebote.

## Tatsächlicher Stand

Neu umgesetzt und lokal geprüft: bestätigte GOT-Sonderabrechnung, erweiterte Reiseangaben, nationale Länderhinweise und Nahrungsergänzung. 1.448 Tests in 95 Dateien; 15 Build-Prüfschritte. Browserintegration auf finaler Revision über PR 8, vor Merge vollständig grün erforderlich. Details: `IMPLEMENTATION_REVIEW_2026-09-09.md`; Partnerplan: `AFFILIATE_PLAN.md`. Die folgenden früheren CI-Zahlen belegen den vorherigen Basisstand.

Die V2-App und die nach Nutzerrückmeldung gefundenen Funktionsfehler sind implementiert und geprüft. Umfang: Gebührenrechner, Karte, Reisecheck, Pflege, Spielzeug, Futtervergleich, Ratgeber, lokale Profile und Sicherungsdateien. `npm run build:app` baut die echte, nicht indexierbare Vorschau.

Reale Daten: 9.381 Orte, 46.113 Ortsnamen, 42 Stadtseiten, 1.006 GOT-Positionen, 30 Berliner und 140 Hamburger kommunale Flächen, vier Futtervarianten und drei Zubehörprodukte mit Herstellerquellen.

Der Code prüft Betreiberkonfiguration, funktionsabhängige Freigaben, Rechte, Daten und fertigen Output vor der Veröffentlichung. Code und Snapshots kommen aus derselben Revision; Build-Metadaten halten Daten-Hashes fest. `main` verlangt jetzt Pull Requests und alle fünf CI-/Security-Checks.

## Prüfung und Veröffentlichung

`npm run verify`: 1.432 Tests in 94 Dateien sowie alle weiteren Prüfschritte bestanden. `npm run build:app`: 15 Prüfschritte bestanden. CI auf `f67dddf`: 228 Basis-, 107 Zugänglichkeits-, 298 Feature-, 26 App- und 12 Leistungsprüfungen bestanden. Elf bestehende Fälle sind begründet übersprungen. Details und konkrete manuelle Browsernachweise: `PUBLIC_RELEASE_ACCEPTANCE.md`.

Die existierende Cloudflare-Vorschau zeigt noch den älteren Stand. Der Hosting-Login ist nach erneuter Prüfung weiterhin abgelaufen. Domain, Betreiberangaben und die für aktivierte Funktionen erforderlichen Fach-/Rechts-/Datenrechtefreigaben fehlen. Die öffentliche Freigabe und Veröffentlichung sind deshalb offen; technische Tests erteilen keine solchen Freigaben.
