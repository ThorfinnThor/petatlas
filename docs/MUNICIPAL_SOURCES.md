# Kommunale Quellen: ausgewiesene Hundeflächen (M11-05, M20-03)

OpenStreetMap sagt, dass an einer Stelle eine Hundewiese *eingetragen* ist. Eine Kommune sagt, dass dort Hunde frei laufen *dürfen* — oder eben nicht. Das sind zwei verschiedene Aussagen, und diese Quellen halten sie auseinander.

Begonnen hat das als Pilot mit einer Stadt (M11-05, Berlin). Mit der zweiten Stadt (M20-03, Hamburg) wurde daraus ein Verzeichnis: `scripts/ingest/municipal-sources.ts` beschreibt jede Quelle einmal, Snapshot-Lauf und Konfliktprüfung bedienen sich daraus. Eine dritte Stadt ist damit ein Eintrag und ein Adapter, kein neuer Satz Skripte.

| Stadt | Quelle | Lizenz | Flächen | Stand |
|---|---|---|---|---|
| Berlin | Hundefreilauf (Senatsverwaltung) | `dl-de/zero-2-0` | 30 | 07.09.2026 |
| Hamburg | Hundeauslaufzonen § 8 HundeG (Bezirksämter) | `dl-de/by-2-0` | 140 | 08.09.2026 |

## Die Berliner Quelle

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

## Die Hamburger Quelle (M20-03)

| | |
|---|---|
| Distribution | Hundeauslaufzonen für Hunde nach § 8 Hamburger HundeG, WFS-Abgabe als GeoJSON |
| Anbieter | Freie und Hansestadt Hamburg, Bezirksämter (über das Transparenzportal) |
| Registryeintrag | `config/sources/hamburg-hundeauslaufzonen.json`, `sourceId` `hamburg-hundeauslaufzonen-wfs` |
| Lizenz | Datenlizenz Deutschland – Namensnennung – Version 2.0 (`dl-de/by-2-0`) |
| Bedingungen | **Namensnennung ist Pflicht** und steht an jeder Anzeige, nicht nur in einer Quellenliste |
| Rechteprüfung | `docs/SOURCE_REVIEWS.md#hamburg-hundeauslaufzonen-wfs` |
| Bezugsweg | zwei Abrufe je Lauf über die offiziell angebotene WFS-Adresse, kein Crawler |

Drei Eigenheiten, die alle in den Daten liegen und deshalb im Adapter stehen:

1. **Kein Typfeld.** Der Dienst führt ausschließlich Auslaufzonen nach § 8. Die Art steht also im Datensatz, nicht in einem Datensatz*feld* — und wird deshalb als kommentierte Konstante gesetzt, nicht aus einem Freitext erraten. Der Datensatz nach § 9 (Freilauf nur für geprüfte Hunde) ist eine andere Aussage und bewusst nicht aufgenommen.
2. **Bezugssystem je Fläche.** Die Antwort trägt keinen `crs`-Block, sondern an jeder Fläche ein `srsName`. Ohne ausdrückliches `srsName=EPSG:4326` in der Adresse liefert der Dienst EPSG:25832 — also Meter statt Grad. Meldet auch nur eine Fläche etwas anderes als WGS84, bricht der Import ab.
3. **Keine Trefferzahl in der Antwort.** Der GeoJSON-Ausgabepfad nennt weder `numberMatched` noch `numberReturned`. Die erwartete Zahl kommt deshalb aus einer zweiten, winzigen Anfrage (`resulttype=hits`, Antwort: `numberMatched="140"`), die als eigener Registryeintrag `hamburg-hundeauslaufzonen-anzahl` geführt wird — mit allen Ausgaberechten auf `false`, weil aus ihr nichts veröffentlicht wird. Fehlt sie, wird nicht übernommen.

Zusätzlich prüft der Snapshot-Lauf jede Fläche gegen eine grobe Hülle der eigenen Gemeinde (`huelle` im Quellenverzeichnis). Das ist kein Auswahlkriterium, sondern ein Netz gegen vertauschte Achsen: 9,9° Ost und 53,6° Nord sind beide gültige Zahlen, aber Hamburg liegt nicht bei 53° Ost. Liegt eine Fläche außerhalb, wird nichts geschrieben.

140 Flächen, alle `dog_off_leash`, keine abgelehnt. Die Quelle nennt kein Datum je Fläche — `statedAt` bleibt deshalb leer statt geraten. Die Ortsteilnummer ist eine Nummer, kein Bezirksname, also bleibt `district` leer. Die Flächenangabe (`flaeche_in_qm`) bleibt Text der Quelle.

Abgleich am 08.09.2026: 14 bestätigt, 0 Widerspruch, 6 unbestätigt, **126 nur kommunal**. Der Zugewinn ist hier deutlich größer als in Berlin — OSM kennt einen kleinen Teil der ausgewiesenen Hamburger Auslaufzonen.

## Was ausgeliefert wird

Seit M20-03 stehen die Flächen auf der jeweiligen Stadtseite (`/de-de/tierarzt-karte/berlin/`, `…/hamburg/`), in einem eigenen Abschnitt unter den OSM-Einträgen. Dabei gilt:

- **Getrennt von OSM.** Der Abschnitt sagt ausdrücklich, dass diese Flächen aus dem Datensatz der Verwaltung stammen und damit die verbindlichere Angabe sind.
- **Der Geltungsbereich steht dabei**, nicht im Kleingedruckten. Sonst läse sich das Schweigen der Quelle wie ein Verbot.
- **Verbotsgebiete als Text, nicht als Fläche.** Ein Mitnahmeverbot erscheint als benannter Listeneintrag mit dem Satz „Hunde dürfen nicht mitgenommen werden“, farblich abgesetzt. Eine eingefärbte Kartenfläche hätte wie ein Angebot ausgesehen; das war die offene Frage aus M11-05 und ist damit beantwortet.
- **Namensnennung an der Anzeige.** Für Hamburg ist sie Lizenzpflicht, für Berlin nicht — gezeigt wird sie in beiden Fällen.
- **Zuordnung über eine ausdrückliche Liste** (Stadtslug → Snapshot), nicht über einen Namensvergleich. „Neustadt“ gibt es oft; eine Verwechslung wäre eine falsche Rechtsauskunft.

Nicht ausgeliefert werden die Umrisse: in den Ortsdaten und auf der Karte tauchen die Flächen weiterhin nicht auf. Die Karte zeigt Punkte, und eine Fläche als Punkt zu zeigen wäre eine Genauigkeit, die es nicht gibt.

## Erneuern

```
npm run snapshot:municipal                                  # aus den im Repository liegenden Antworten
npm run snapshot:municipal -- --fetch                        # einmal neu abrufen, alle Quellen
npm run snapshot:municipal -- --nur hamburg-hundeauslaufzonen-wfs   # nur eine Quelle
npm run check:municipal                                     # Abgleich mit den OSM-Ortsdaten
```

Scheitert eine Stadt, bleiben die übrigen unberührt; der Lauf endet trotzdem mit Exit 1, damit nichts still liegen bleibt.

Der Abruf läuft über den gemeinsamen Fetcher: nur `https`, nur Hosts aus der Source Registry, jede Weiterleitung erneut geprüft, Rate Limits beachtet. Schlägt er fehl, bleibt der vorhandene Snapshot unverändert — das ist überprüft worden, bevor der Abruf zum ersten Mal gelang.

Der Antwortkörper des Dienstes enthält einen Zeitstempel; der Hash der Rohantwort ändert sich deshalb bei jedem Abruf, auch ohne inhaltliche Änderung. Verglichen wird der normalisierte Datensatz. Ein Abruf am 07.09.2026 lieferte fachlich exakt dieselben 30 Flächen wie die im Repository liegende Antwort.
