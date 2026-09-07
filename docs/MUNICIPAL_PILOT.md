# Kommunaler Pilot: Hundefreilauf Berlin (M11-05)

OpenStreetMap sagt, dass an einer Stelle eine Hundewiese *eingetragen* ist. Eine Kommune sagt, dass dort Hunde frei laufen *dürfen* — oder eben nicht. Das sind zwei verschiedene Aussagen, und dieser Pilot hält sie auseinander.

## Die Quelle

| | |
|---|---|
| Distribution | Hundefreilauf Berlin, WFS-Abgabe als GeoJSON (`hundefreilauf:hundefreilauf`) |
| Anbieter | Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen Berlin |
| Registryeintrag | `config/sources/berlin-hundefreilauf.json`, `sourceId` `berlin-hundefreilauf-wfs` |
| Lizenz | Datenlizenz Deutschland – Zero – Version 2.0 (`dl-de/zero-2-0`) |
| Bedingungen | keine; Nutzung, Bearbeitung und Weitergabe sind ohne Auflagen zulässig |
| Rechteprüfung | `docs/SOURCE_REVIEWS.md#berlin-hundefreilauf-wfs` |
| Bezugsweg | ein Abruf je Lauf über die offiziell angebotene WFS-Adresse, kein Crawler |

Die Lizenz verlangt **keine** Namensnennung. Der Registryeintrag führt trotzdem einen Attributionstext: woher eine Aussage über eine Fläche stammt, gehört zur Aussage — unabhängig davon, ob eine Lizenz es erzwingt.

## Geltung — der wichtigste Teil

Der Datensatz gilt **nicht berlinweit**. Erfasst sind Charlottenburg-Wilmersdorf, Friedrichshain-Kreuzberg und Reinickendorf sowie eine einzelne Fläche in Steglitz-Zehlendorf. Daraus folgen zwei Sätze, die im Code als Regeln stehen und nicht nur hier als Absicht:

1. Eine Fläche, die im Datensatz fehlt, ist **weder erlaubt noch verboten, sondern nicht erfasst**.
2. Ein fehlendes Verbot ist **keine Erlaubnis**. `belegteHundeerlaubnis()` liefert `true` ausschließlich bei einer ausdrücklich ausgewiesenen Freilauffläche und gibt dazu immer den Beleg mit aus.

Nebenbefund: die Beschreibung im Datenportal sagt, in Steglitz-Zehlendorf gebe es keine Hundefreilaufflächen in Grünanlagen; die Daten enthalten dort eine (Stand 2024-03-11). Beschreibung und Daten sind unterschiedlich alt. Übernommen wird, was in den Daten steht, nicht was der Begleittext behauptet.

## Was im Datensatz steht

30 Flächen: 22 ausgewiesene Hundefreilaufflächen und 8 Hundemitnahmeverbote. Sachstände zwischen 2023-01-06 und 2024-07-17.

Beide Arten werden getrennt geführt (`kind: dog_off_leash | dog_prohibited`). Ein dritter Wert im Feld `typ` würde den Datensatz ablehnen, nicht in eine der beiden Schubladen wandern.

Das Freitextfeld `info` der Quelle enthält mal eine Flächenangabe („9186 m²“), mal eine Näherung („ca. 2900 qm“), mal einen Hinweis („aktuell nicht nutzbar“) und einmal eine fremde Internetadresse. Es bleibt Freitext. Eine Zahl daraus zu machen wäre erfundene Genauigkeit, deshalb hat das Schema kein Feld für eine Fläche.

## Abgleich mit OpenStreetMap

`npm run check:municipal` vergleicht die kommunalen Flächen mit den Hundewiesen aus OSM. Verglichen wird ausschließlich die Kategorie Hundewiese: eine Tierarztpraxis in einem Mitnahmeverbotsgebiet ist kein Widerspruch, sondern eine Praxis an einer Straße.

Ergebnis am Datenstand vom 07.09.2026:

| Fall | Anzahl | Bedeutung |
|---|---|---|
| `bestaetigt` | 10 | OSM führt die Fläche, die Verwaltung weist sie als Freilauf aus |
| `widerspruch` | 0 | OSM führt eine Hundewiese in einem Mitnahmeverbotsgebiet |
| `unbestaetigt` | 16 | OSM führt eine Hundewiese, die Verwaltung sagt dazu nichts |
| `nur_kommunal` | 12 | die Verwaltung weist eine Fläche aus, die OSM nicht führt |

Der Zugewinn des Piloten sind die 12 Flächen, die OSM nicht kennt, und die 10 Belege für Flächen, die OSM zwar kennt, aber nicht belegen kann.

**Priorität bei Widerspruch.** Tritt ein Widerspruch auf, gilt die kommunale Angabe als die verbindlichere — aufgelöst wird er trotzdem nicht: beide Angaben bleiben sichtbar, und `belegteHundeerlaubnis()` liefert für einen Punkt, der zugleich in einer Freilauffläche und einem Verbotsgebiet liegt, `null` mit dem Hinweis auf beide Flächen. Zwei einander widersprechende Belege sind kein Beleg.

**`unbestaetigt` ist kein Widerspruch.** Bei 16 Hundewiesen schweigt die Verwaltung, meist weil sie außerhalb der drei erfassten Bezirke liegen. Aus dem Schweigen folgt nichts. Nebenbei zeigt die Liste ein OSM-Datenqualitätsthema: unter den unbestätigten Einträgen stehen „Hundeschule“, „Hundetoilette“ und „Kleiner Feigling“ — in OSM als `dog_park` getaggt, dem Namen nach vermutlich etwas anderes. Das ist eine Beobachtung, keine Korrektur: umgetaggt wird hier nichts.

## Was der Pilot (noch) nicht tut

Die kommunalen Flächen werden **nicht ausgeliefert**. Sie stehen im Snapshot und im Abgleich, aber weder in den veröffentlichten Ortsdaten noch auf der Karte oder den Stadtseiten. Das ist Absicht: die Auslieferung wäre eine eigene Aufgabe mit eigenen Fragen (Darstellung von Verbotsgebieten, Umgang mit Flächen statt Punkten, Auswirkung auf die gemessene Qualitäts-Allowlist der Stadtseiten). Der Pilot beantwortet zuerst, ob die Quelle trägt.

## Erneuern

```
npm run snapshot:municipal            # aus der im Repository liegenden Antwort
npm run snapshot:municipal -- --fetch  # einmal neu abrufen
npm run check:municipal               # Abgleich mit den OSM-Ortsdaten
```

Der Abruf läuft über den gemeinsamen Fetcher: nur `https`, nur Hosts aus der Source Registry, jede Weiterleitung erneut geprüft, Rate Limits beachtet. Schlägt er fehl, bleibt der vorhandene Snapshot unverändert — das ist überprüft worden, bevor der Abruf zum ersten Mal gelang.

Der Antwortkörper des Dienstes enthält einen Zeitstempel; der Hash der Rohantwort ändert sich deshalb bei jedem Abruf, auch ohne inhaltliche Änderung. Verglichen wird der normalisierte Datensatz. Ein Abruf am 07.09.2026 lieferte fachlich exakt dieselben 30 Flächen wie die im Repository liegende Antwort.
