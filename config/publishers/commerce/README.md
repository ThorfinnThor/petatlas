# Partnerprogramme Warenangebote

Eine Datei je Fachgebiet, ein Eintrag je **tatsächlichem Vertrag**. `programs` ist leer, weil kein Programm freigegeben ist — nicht als Platzhalter, sondern als Zustand.

Solange die Liste leer ist, bekommt kein Angebot eine Anzeigeerlaubnis. Der Katalog zeigt dann seinen Leerzustand, der Feedabruf unterbleibt, und es entsteht keine öffentliche Angebotsdatei. Das ist die Umsetzung von „ohne Freigabe Slot deaktiviert lassen“ und wird von Tests festgehalten.

## Was bei einer echten Freigabe zu prüfen ist

Die vollständige Liste steht in `docs/reviews/commerce-partner.md`. Kurz:

1. Programmfreigabe des Netzwerks auf einen benannten Betreiber und eine benannte Domain — eine Anmeldung ist keine Freigabe.
2. **Bildrechte getrennt** von Anzeigerechten: Produktbilder eines Händlers sind nicht automatisch mitlizenziert.
3. **JSON-Weitergabe getrennt** von der Anzeige im HTML: eine öffentlich abrufbare Angebotsdatei ist eine eigene Ausgabeform.
4. Feedfelder: welche Felder gibt es tatsächlich, welche dürfen öffentlich werden?
5. Erlaubter Linkmodus: Deeplink mit statischer Kennung, keine verdeckte Weiterleitung.

Provisionswerte gehören **nicht** in diese Datei. Sie ist im Browser lesbar; das Schema ist `.strict()` und lässt kein solches Feld zu.
