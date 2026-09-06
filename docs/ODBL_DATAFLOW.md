# ODbL-Datenfluss

Festgelegt in M05-05. Beschreibt, was mit den OSM-Daten tatsächlich geschieht, und leitet daraus die Lizenzpflichten ab. Technische Risikoeinschätzung, keine Rechtsberatung.

## Warum dieses Dokument existiert

Getrennte Ordner, eigene IDs und ein anderes Dateiformat sind gute Provenienz, aber **kein Schutzschalter**. Ob eine Verarbeitung eine abgeleitete Datenbank erzeugt, hängt davon ab, was inhaltlich passiert, nicht davon, wie die Dateien heißen. Deshalb wird hier der Fluss beschrieben und nicht behauptet, eine Trennung allein löse die Frage.

## Die beiden Begriffe

| | Abgeleitete Datenbank (Derivative Database) | Produced Work |
|---|---|---|
| Was | OSM-Daten verändert, ergänzt, korrigiert, gefiltert oder mit anderem verknüpft | ein fertiges Erzeugnis, das OSM-Daten benutzt: gerenderte Karte, Seite, Bild |
| Pflicht beim öffentlichen Verbreiten | wieder unter ODbL | frei lizenzierbar; Empfänger können die zugrunde liegenden Daten anfordern |
| Attribution | ja | ja |

Quelle der Einordnung: die Lizenz-FAQ und die Attribution Guidelines der OpenStreetMap Foundation, geprüft am 2026-09-06 (`docs/SOURCE_REVIEWS.md`).

## Der geplante Fluss, Schritt für Schritt

| # | Schritt | Ort | Was entsteht | Einordnung |
|---|---|---|---|---|
| 1 | Extrakt herunterladen (`germany-latest.osm.pbf`) | `.work/`, nicht versioniert | unveränderte Kopie | Kopie der Quelldatenbank |
| 2 | Räumlich und nach Tags filtern (nur benötigte POI-Kategorien) | Build | Teilmenge | **abgeleitete Datenbank** — eine Auswahl bleibt eine Datenbank |
| 3 | Normalisieren: Felder umbenennen, Koordinaten prüfen, Öffnungszeiten übernehmen | Build | strukturierte Ortsdatensätze | **abgeleitete Datenbank** |
| 4 | Dubletten über Regionsgrenzen zusammenführen, offensichtlich kaputte Koordinaten verwerfen | Build | korrigierte Ortsliste | **abgeleitete Datenbank** — Korrektur ist ausdrücklich eine Bearbeitung |
| 5 | Räumliche Aufteilung in Shards und Index | `.generated/` | dieselben Daten, anders geschnitten | **abgeleitete Datenbank** |
| 6 | Ausgabe als `/data/v1/places/de/*.json` | `dist/` | öffentlich abrufbare Datendateien | **abgeleitete Datenbank, öffentlich verbreitet** |
| 7 | Rendern einer Ortsseite oder Kartenansicht im HTML | `dist/` | Seite für Menschen | **Produced Work** |
| 8 | Verknüpfung mit eigenen redaktionellen Inhalten oder Produktdaten | Build | gemischter Datensatz | **abgeleitete Datenbank**, sobald das Ergebnis als Datei verbreitet wird |

## Was daraus folgt

1. **Schritt 6 ist der entscheidende.** Sobald die abgeleiteten Ortsdaten als JSON öffentlich abrufbar sind, werden sie öffentlich verbreitet. Sie stehen damit unter ODbL, und das muss in der Ausgabe erkennbar sein — nicht nur in diesem Dokument.
2. **Ein eigenes ID-Feld ändert nichts.** `place.placeId` bleibt bewusst an die Quell-ID gebunden (`osm:node:12345`, M03-04). Eine neu erfundene ID würde die Herkunft verschleiern, nicht die Pflicht beseitigen.
3. **Auch eine Auswahl ist eine Datenbank.** Nur die Tierarztpraxen zu behalten macht das Ergebnis nicht zu etwas anderem als OSM-Daten.
4. **Die HTML-Seite selbst ist ein Produced Work.** Sie braucht Attribution, muss aber nicht unter ODbL stehen. Wer die zugrunde liegenden Daten anfordert, bekommt sie — sie liegen ohnehin öffentlich unter `/data/v1/`.
5. **Eigene redaktionelle Texte werden nicht ODbL, nur weil sie neben OSM-Daten stehen.** Verbunden wird erst dann etwas, wenn beides gemeinsam als ein Datensatz verbreitet wird. Deshalb bleiben redaktionelle Inhalte in `content-data/` und werden nicht in dieselbe Ausgabedatei geschrieben wie die Ortsdaten.

## Umsetzung im Produkt

- Jede ausgelieferte Ortsdatendatei trägt ihren Lizenzhinweis mit: `licenseId`, `attributionText` und `attributionUrl` stehen im Manifest und in der Datei selbst, nicht nur auf einer Seite daneben.
- Die Attribution ist auf jeder Seite sichtbar, die OSM-Daten anzeigt, und in der Karte in einer Ecke, ohne dass man dafür etwas anklicken muss.
- Der Lizenzhinweis für Downloads liegt in `licenses/ODbL-notice.md` und wird zusammen mit den Daten ausgeliefert.
- `scripts/checks/licenses.ts` prüft vor jeder Veröffentlichung, dass keine ODbL-Ausgabe ohne diese Angaben entsteht (M05-06).

## Was hier nicht behauptet wird

- Nicht behauptet wird, dass getrennte Dateien eigene Joins von der Share-Alike-Pflicht befreien.
- Nicht behauptet wird, dass die Nutzung der OSM-Kartenkacheln durch diese Prüfung gedeckt ist. Der Kachel-Dienst hat eine eigene Nutzungspolitik und bekommt einen eigenen Registryeintrag, sobald die Karte gebaut wird.
- Nicht behauptet wird, dass diese Einordnung eine rechtliche Prüfung ersetzt.
