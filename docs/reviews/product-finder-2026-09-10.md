# Produktfinder: Auswahl und Karten · 10.09.2026

Die Meldung von zwei Treffern beruhte auf dem bisherigen Bestand von zwei Hunde- und zwei Katzenspielzeugen. Der Finder führt einen redaktionellen Katalog, keine Amazon-Sortimentsabfrage. Er enthält nun je sechs Spielzeuge für Hund/Katze; Packungs- und Farbvarianten werden nicht zur künstlichen Vergrößerung gezählt. Keine Händlerverfügbarkeit oder aktuellen Preise behauptet.

Checkbox-Titel/Erklärung getrennt, Abstand zum Eingabefeld, gesamte Karte anklickbar. Pflegebedarf „langes Fell“ aus dem Spielzeugformular entfernt. Ergebnisraster: 3 Spalten ab 1100 px, 2 ab 700 px, darunter 1. Futterübersicht und Suchtreffer verwenden dasselbe responsive Raster. Wasserwunsch vergibt keine Kategoriepunkte mehr: Ohne bestätigtes floats=true keine Wasser-Übereinstimmung.

## Neue Herstellerquellen

Am 10.09.2026 eingesehen; wenige sachliche Eigenschaften paraphrasiert. Aussagen zu Gesundheit, Sicherheit, Haltbarkeit und Rezensionen nicht übernommen.

- KONG Wobbler: https://www.kongcompany.com/wobbler/ — befüllbar, aufschraubbar, spülmaschinengeeignet; ausdrücklich kein Kauspielzeug.
- West Paw Hurley: https://www.westpaw.com/products/hurley-dog-bone — Knochenform, Zogoflex.
- West Paw Zisc: https://www.westpaw.com/products/zisc-flying-disc — Wurfscheibe, Zogoflex, schwimmfähig.
- West Paw Qwizl: https://www.westpaw.com/products/qwizl-treat-toy — befüllbar, Zogoflex, oberes Spülmaschinenfach.
- Catit Senses Digger: https://www.catit.com/products/toys/senses-digger/ — Becher und Basis, Futter herausangeln.
- Catit Senses Food Tree: https://www.catit.com/products/toys/senses-food-tree/ — vier Ebenen und Öffnungen.
- Catit Senses Treat Puzzle: https://www.catit.com/products/toys/senses-treat-puzzle/ — Artikel 43010, sechs Bereiche, Kunststoff, zerlegbar.
- Catit Senses Treat Spinner: https://www.catit.com/products/toys/senses-treat-spinner/ — Artikel 43750, Melamin und Silikon; Spülmaschinenangabe betrifft nur die Abdeckung und wird deshalb nicht als Eigenschaft des Gesamtprodukts modelliert.

## Produktbilder: offen, nicht als erledigt gemeldet

Keine Bildrechte/API-Zugang vom Betreiber vorhanden. Asynchrone Frage nach Amazon Creators API bzw. freigegebenen Hersteller-/Awin-Bildern gestellt. Keine Antwort zum Zeitpunkt der Implementierung. Amazon-Partner-ID allein liefert keine Bilder. Keine fremden Fotos kopiert, keine nachgebauten Produktfotos als echt dargestellt.

- Amazon Creators API: https://partnernet.amazon.de/creatorsapi/docs/en-us/introduction
- Amazon Inhaltsbedingungen: https://partnernet.amazon.de/help/operating/policies
- KONG Nutzungsbedingungen: https://www.kongcompany.com/terms-of-use/ — keine pauschale Bildfreigabe.
- West Paw Media Center: https://www.westpaw.com/pages/media — Photography Library führt zu https://www.westpaw.com/pages/retailer-photos-and-downloads mit „Retailer Login Required“. Kein Umgehen.

Nächster Bildschritt nach Zugang/Freigabe: Originalfoto zur exakten Produktvariante zuordnen, Quelle/Nutzungsumfang dokumentieren, Größenvarianten und reserviertes Seitenverhältnis integrieren, fehlgeschlagene Bilder und mobile Darstellung prüfen. Betrifft alle Spielzeug-, Pflege- und Futterprodukte, nicht nur die acht neuen Einträge.

## Lokale Validierung

1453 Unit-Tests bestanden; ESLint und Astro-Typecheck ohne Fehler; Real-App-Build mit allen 15 Prüfungen bestanden. CUA: 1440 px zeigt 3 Karten pro Reihe, 390 px 1 Karte ohne horizontalen Überlauf; Katzenfilter liefert ausschließlich die sechs Katzenprodukte. Zusätzliche CI-Browserfälle für 390/900/1440 px prüfen anklickbare Checkboxkarte, Abstand, Rasterpositionen, Tierarttrennung und Axe-Barrierefreiheit. Ausführung in CI steht bei Erstellung dieses Nachweises noch aus.
