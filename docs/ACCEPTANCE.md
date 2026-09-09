# Abnahmebericht V2

Aktuelle technische Nachprüfung: `PUBLIC_RELEASE_ACCEPTANCE.md` (CI auf `f67dddf`, 1.432 Unit-Tests, 671 Browser-/Leistungsprüfungen bestanden). Die folgenden V2-Nachweise dokumentieren den früheren Übergabestand.

Stand: 2026-09-09. Dieser Bericht ersetzt den früheren V1-Zustand; dessen Nachweise bleiben in der Git-Historie.

## Gebaut und geprüft

Die echte Vorschau aktiviert Gebührenrechner, Ortskarte, Reisecheck, Pflege, Spielzeug, Futter, Tierprofile und Ratgeber. Sie verwendet reale Snapshots und belegte Herstellerdaten. Alle Seiten bleiben vor der öffentlichen Freigabe nicht indexierbar. Kommerzielle Angebote sind ohne Vertrag nicht verfügbar.

Auf `eb38edb` bestanden lokal:

- `npm run verify`: 1.431 Tests in 94 Dateien; Lint, Typecheck, Formatierung, Secret-, Workflow-, Lizenz-, Inhalts- und Handoff-Prüfung.
- `npm run build:app`: 15 Prüfschritte einschließlich Quellenrechte, Inhaltsdaten, Release-Konsistenz, Output, interner Links, SEO und Größenbudgets.
- 2.877 ausgelieferte Dateien; größte Datei 0,46 MiB; kein Größenbudget überschritten.

Der abschließende CI-Lauf ist [34369711865](https://github.com/ThorfinnThor/petatlas/actions/runs/34369711865). CI und Security sind erfolgreich. Die Browserläufe bestanden mit 228 Basis-, 107 Zugänglichkeits-, 298 Feature-, 11 App- und 12 Leistungsprüfungen. Sieben Zugänglichkeitsfälle und vier Featurefälle wurden von den bestehenden Konfigurationen übersprungen.

Die Homepage lädt initial 304,9 KiB auf Desktop bzw. 317,2 KiB im mobilen Profil, davon 3,7 KiB JavaScript. Die fünf gemessenen Seiten bleiben jeweils unter 32 KiB JavaScript und unter allen gesetzten Stopp-Budgets. Das sind Messwerte vom gebauten Output im CI-Browser, keine Felddaten.

## Konkrete Nutzerabläufe

- Hamburger Ortsuche lädt echte Treffer mit Quelle und Erfassungsstand.
- Eine allgemeine Untersuchung für Hund/Katze/Frettchen liefert bei einfachem Satz 23,62 Euro netto und 28,11 Euro einschließlich 19 Prozent Umsatzsteuer. Entfernen und Drucksteuerung sind implementiert.
- Der Reisecheck zeigt unvollständige Angaben ausdrücklich als unbekannt; ohne Fachfreigabe entsteht kein positives Gesamtergebnis.
- Zwei echte Futterlinien lassen sich anhand deklarierter Nährwerte vergleichen; fehlende Preise erscheinen mit Erklärung.
- Profile überleben Navigation und Neuladen. Übernahme in passende Formulare geschieht erst auf Aktion; sensible Reiseantworten bleiben unbeantwortet.
- Mobile Kartenansicht und Liste lassen sich umschalten; Kacheln laden erst nach separater Aktion.

## Noch keine öffentliche Veröffentlichung

Der bisherige Cloudflare-Link zeigt noch den alten Stand. Der lokale Cloudflare-Login ist abgelaufen; im Repository gibt es keine alternative Deployment-Anmeldung. Eine aktualisierte Veröffentlichung samt Prüfung am öffentlichen Link steht deshalb aus.

Domain, Betreiberangaben, Vertragsdaten und qualifizierte Freigaben sind nach ausdrücklicher Nutzerentscheidung zurückgestellt. Vier Quellenbeobachtungs-Meldungen bleiben zur manuellen Prüfung offen. Einzelheiten: `LAUNCH_V2.md`.

## Nachprüfung nach Nutzerrückmeldung: Karte

Am 09.09.2026 wurde nach der V2-Übergabe ein Funktionsfehler im tatsächlichen Browser reproduziert: Nach dem Öffnen der Karte führten Orts- und Kategoriewechsel zum Ausfall der Kartenansicht, während die Trefferliste weiterlief. Die zuvor bestandenen Tests deckten diese Abfolge nicht ab; aus ihnen darf keine vollständige Funktionsabnahme abgeleitet werden.

Die Korrektur erhält die Leaflet-Instanz, aktualisiert deren Marker und Mittelpunkt und verarbeitet Kartenaktualisierungen nacheinander. Überholte Suchantworten werden verworfen. Lokal erneut geprüft: Hamburg/Tierarzt/5 km mit 21 Treffern und Markern; danach 10 km mit 49 Treffern und Markern, jeweils geladene Kacheln und nur eine Karteninstanz. `npm run verify` und `npm run build:app` bestanden. Ein eigener Regressionstest ergänzt diese Abfolge in `tests/app/design-v2.spec.ts`; die Remote-Abnahme der Korrektur bestand, und PR #6 ist in main.

Die anschließende praktische Funktionsabnahme ist abgeschlossen und in `PUBLIC_RELEASE_ACCEPTANCE.md` dokumentiert. Sie fand und behob weitere konkrete Fehler. Die öffentliche Veröffentlichung bleibt wegen der dort benannten externen Voraussetzungen offen.
