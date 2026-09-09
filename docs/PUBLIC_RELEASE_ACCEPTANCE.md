# Öffentliche Freigabe: praktische Funktionsabnahme

Stand: 2026-09-09. Aufgabe M23-02. Die Abnahme läuft; dieser Bericht erteilt keine öffentliche Freigabe.

## Anlass und Korrekturen

Die erste Abnahme hatte wiederholte Interaktionen nicht ausreichend erfasst. Der gemeldete Kartenfehler ließ sich nach einem Orts-/Filterwechsel reproduzieren. PR #6 hält die Leaflet-Instanz am Container und aktualisiert ihre Marker. Diese Korrektur ist in main.

Die anschließende Prüfung fand weitere Fehler, die in dieser Änderung behoben werden:

- Der Gebührenrechner lud beim Übernehmen das Dokument neu und verlor die Auswahl. Menge/Faktor lassen sich nun ausdrücklich auf eine ausgewählte Position anwenden. Ungültige Angaben löschen keine Auswahl; Entfernen bleibt auch nach ungültigem Kontext möglich.
- Kartenfilter griffen im anfänglichen Berlin-Ausschnitt nicht. Sie laden jetzt die zugehörigen Daten auch ohne vorherige Ortswahl.
- Fehler beim Laden von Ortszellen wurden als fehlende/teilweise Daten verschluckt. Die bisherige Anzeige bleibt jetzt mit Fehlerhinweis und Wiederholungsmöglichkeit erhalten.
- Fehlgeschlagene Ortsnamensuche und Kartenkacheln können erneut geladen werden. Verspätete Suchantworten verdrängen keine neuere Eingabe.
- Orte lassen sich jetzt tatsächlich merken. Der Ansehen-Link öffnet den gespeicherten Ort anhand seiner aktuellen Daten statt des allgemeinen Berlin-Ausschnitts.
- Fehlgeschlagene Speicherzugriffe behaupten kein erfolgreiches Merken oder Entfernen.
- Spielzeuggewicht wird validiert; Produktkategorien und Nährstoffe erhalten verständliche Beschriftungen.
- Fehler beim Nachladen von Suchergebnissen erhalten eine sichtbare Meldung.

## Prüfplan und Nachweise

`tests/app/acceptance.spec.ts` prüft vollständige Abläufe auf 390 und 1280 Pixeln sowie Ausfälle von Daten-, Namens-, Karten- und Speicherzugriffen. Die bestehende Matrix prüft weitere sieben Breiten, Browser, Tastatur/Zugänglichkeit, Druck, Profile, Reisecheck und Leistungsbudgets. Ergebnisse werden nach dem tatsächlichen CI-Lauf hier ergänzt.

## Externe Voraussetzungen

Die technische Abnahme ersetzt nicht die bestehenden Freigaben. Domain und echte Betreiberangaben fehlen weiterhin. Kosten-/Reiseregeln benötigen die bereits vorgesehenen fachlichen Abnahmen. Partnerangebote bleiben ohne Vertrag ausgeschaltet. Die bestehende Cloudflare-Anmeldung ist abgelaufen; deshalb ist der neue Stand noch nicht auf der vorhandenen öffentlichen Vorschau veröffentlicht. Keine dieser Voraussetzungen wird durch erfundene Angaben oder abgeschaltete Prüfungen ersetzt.
