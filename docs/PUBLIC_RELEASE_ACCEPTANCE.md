# Öffentliche Freigabe: praktische Funktionsabnahme

Stand: 2026-09-09. Aufgabe M23-02. Die technische Abnahme ist abgeschlossen; dieser Bericht erteilt keine öffentliche Freigabe.

## Anlass und Korrekturen

Die erste Abnahme hatte wiederholte Interaktionen nicht ausreichend erfasst. Der gemeldete Kartenfehler ließ sich nach einem Orts-/Filterwechsel reproduzieren. PR #6 hält die Leaflet-Instanz am Container und aktualisiert ihre Marker. Diese Korrektur ist in main.

Die anschließende Prüfung fand weitere Fehler, die in dieser Änderung behoben werden:

- Der Gebührenrechner lud beim Übernehmen das Dokument neu und verlor die Auswahl. Menge/Faktor lassen sich nun ausdrücklich auf eine ausgewählte Position anwenden. Ungültige Angaben löschen keine Auswahl; Entfernen bleibt auch nach ungültigem Kontext möglich.
- Kartenfilter griffen im anfänglichen Berlin-Ausschnitt nicht. Sie laden jetzt die zugehörigen Daten auch ohne vorherige Ortswahl.
- Fehler beim Laden von Ortszellen wurden als fehlende/teilweise Daten verschluckt. Die bisherige Anzeige bleibt jetzt mit Fehlerhinweis und Wiederholungsmöglichkeit erhalten.
- Fehlgeschlagene Ortsnamensuche und Kartenkacheln können erneut geladen werden. Verspätete Suchantworten verdrängen keine neuere Eingabe.
- Orte lassen sich jetzt tatsächlich merken. Der Ansehen-Link öffnet den gespeicherten Ort anhand seiner aktuellen Daten statt des allgemeinen Berlin-Ausschnitts.
- Fehlgeschlagene Speicherzugriffe behaupten kein erfolgreiches Merken oder Entfernen.
- Neue Formularfehler erscheinen beim Absenden statt während des Klicks beim Feldwechsel; der Button verschiebt sich dadurch nicht mehr vor dem Klick.
- Die belegte Tierart eines Produkts begrenzt auch gemischte Kategorien. [West Paw](https://www.westpaw.com/products/toppl-eggplant) und [KONG](https://www.kongcompany.com/kong-classic/) nennen die beiden erfassten Spielzeuge für Hunde.
- Spielzeuggewicht wird validiert; Produktkategorien und Nährstoffe erhalten verständliche Beschriftungen.
- Fehler beim Nachladen von Suchergebnissen erhalten eine sichtbare Meldung.

## Prüfergebnisse

Code-Revision `f67dddf`. [Vollständige CI](https://github.com/ThorfinnThor/petatlas/actions/runs/34379784980) und [Security](https://github.com/ThorfinnThor/petatlas/actions/runs/34379784995) bestanden.

| Prüfung | Ergebnis |
|---|---|
| Unit-/Vertragstests | 1.432 in 94 Dateien bestanden |
| Basis-Browsermatrix | 228 bestanden |
| Zugänglichkeit | 107 bestanden, sieben bestehende Skips |
| Feature-Abläufe | 298 bestanden, vier bestehende Skips |
| Echte App inklusive Wiederholungs-/Fehlerfällen | 26 bestanden |
| Leistungsbudgets | 12 bestanden |
| Echter App-Build | 15 Prüfschritte bestanden |

Die Browser-/Leistungsläufe umfassen zusammen 671 bestandene Prüfungen. Viewports: 360, 390, 430, 768, 1024, 1280 und 1440 Pixel. Homepage initial: 305,1 KiB Desktop bzw. 317,5 KiB mobil, jeweils 4 KiB JavaScript. Die gemessenen fünf Seiten bleiben unter den bestehenden Stopp-Budgets; größtes initiales JavaScript: 32,2 KiB auf der Karte. Das sind kontrollierte CI-Messungen, keine Felddaten oder Verfügbarkeitszusagen.

`tests/app/acceptance.spec.ts` prüft vollständige Abläufe auf 390 und 1280 Pixeln sowie Daten-, Namens-, Kachel-, Suchfragment- und Speicherfehler. Die bestehende Matrix prüft weitere Breiten, Browser, Tastatur/Zugänglichkeit, Druck, Profile und Reisecheck. Die elf bereits vorhandenen Skips bleiben nachvollziehbar im CI-Protokoll; es wurden keine neuen Tests übersprungen.

## Konkrete manuelle Browsernachweise

- Gebührenposition: 28,11 € brutto; Menge 2 und Faktor 1,5: 84,32 €. Nach Kontextwechsel mit ungültigem Faktor bleibt die Auswahl bearbeitbar; Faktor 2 im Notdienst: 171,93 €. Entfernen setzt die Rechnung zurück.
- Eine ungültige Menge wird beim ersten Klick behandelt, die Fehlerzusammenfassung erhält Fokus und der Druckbutton wird gesperrt. Eine anschließende Korrektur liefert wieder ein Ergebnis.
- Berlin: Kategorie Tierarztpraxis ohne vorherige Ortswahl lädt 41 Treffer im 5-km-Ausschnitt.
- Hamburg: 21 Tierarztpraxen im 5-km-Ausschnitt. Gemerktes VetZentrum HafenCity öffnet den zugehörigen Ausschnitt mit 27 Orten, 27 Markern, sechs geladenen echten Kacheln und einer Karteninstanz.
- Fehlgeschlagene Orts-, Ortsnamen-, Kachel- und Speicherzugriffe werden in den zusätzlichen automatisierten Browserfällen geprüft. Suchfragmente haben ebenfalls einen Ausfall-/Wiederanlauffall.
- Spielzeug: ungültiges Gewicht wird benannt; das Dezimalkomma funktioniert. Hund liefert die zwei erfassten Spielzeuge, Katze eine ehrliche leere Auswahl.
- Reise: erneute Eingaben ändern das Ergebnis; fehlende Chipangabe und nicht unterstütztes Ziel führen nicht zu einer positiven Freigabe.
- Volltextsuche: echte Indexergebnisse und Navigation. Futterdetails zeigen deutsche Nährstoffbezeichnungen mit Herstellerquelle.


## Repository-Schutz

Am 09.09.2026 per GitHub API eingerichtet und zurückgelesen: Pull Requests, aktueller Branch, die fünf erfolgreichen CI-/Security-Checks und aufgelöste Review-Gespräche sind für `main` vorgeschrieben, auch für Administratoren. Force-Push und Branch-Löschung sind gesperrt. Für das Einzelbetreiber-Repository gibt es keinen zusätzlichen menschlichen Review-Zwang.

## Externe Voraussetzungen

Die technische Abnahme ersetzt nicht die bestehenden Freigaben. Domain und echte Betreiberangaben fehlen weiterhin. Kosten-/Reiseregeln benötigen die bereits vorgesehenen fachlichen Abnahmen. Partnerangebote bleiben ohne Vertrag ausgeschaltet. Die bestehende Cloudflare-Anmeldung ist abgelaufen; deshalb ist der neue Stand noch nicht auf der vorhandenen öffentlichen Vorschau veröffentlicht. Keine dieser Voraussetzungen wird durch erfundene Angaben oder abgeschaltete Prüfungen ersetzt.
