# Quellenprüfungen

Jede Prüfung nennt Datum, tatsächlich aufgerufene Primärquelle, Fundstelle und das Ergebnis je Ausgabeform. Eine Prüfung darf mit „weiterhin ungeprüft“ enden; das ist ein Ergebnis, keine Lücke.

Diese Prüfungen sind technische Risikoeinschätzungen anhand der veröffentlichten Bedingungen, keine Rechtsberatung.

---

## osm-geofabrik-germany-pbf

**Geprüft am:** 2026-09-06 · **Ergebnis:** `verified`

### Was geprüft wurde

| Primärquelle | Fundstelle | sha256 des Abrufs |
|---|---|---|
| Geofabrik, Deutschland-Extrakte | `https://download.geofabrik.de/europe/germany.html` | — (Verzeichnisseite, ändert sich täglich) |
| Open Database License 1.0 | `https://opendatacommons.org/licenses/odbl/1-0/` | `b8d8aebb…02b47` |
| OpenStreetMap, Copyright-Seite | `https://www.openstreetmap.org/copyright` | `584faddd…248cf` |
| OSMF, Attribution Guidelines | `https://osmfoundation.org/wiki/Licence/Attribution_Guidelines` | `d6df1275…2bbc56` |

Der `termsHash` im Registryeintrag ist der Hash des ODbL-Lizenztextes. Ändert er sich, gilt die Freigabe als offen und wird erneut geprüft (M05-06).

### Feststellungen

1. **Lizenz.** Die Geofabrik-Seite weist die Extrakte als „License: ODbL 1.0“ aus, erstellt von OpenStreetMap-Mitwirkenden, aufbereitet von der Geofabrik GmbH. Die Copyright-Seite von OpenStreetMap benennt dieselbe Lizenz für die Daten.
2. **Kommerzielle Nutzung.** Nach der Lizenz-FAQ der OSM Foundation ist die kommerzielle Nutzung der Daten erlaubt.
3. **Attribution.** Verpflichtend. Die Attribution Guidelines verlangen eine Nennung von „OpenStreetMap“ und einen deutlichen Hinweis auf die Open Database License; „© OpenStreetMap contributors“ ist ausdrücklich als Form genannt, und der Hinweis soll auf `openstreetmap.org/copyright` verlinken. Bei einer Karte gehört er sichtbar in eine Ecke der Karte, ohne dass man dafür etwas anklicken muss.
4. **Share-Alike.** Eine **abgeleitete Datenbank** — also veränderte, ergänzte oder korrigierte OSM-Daten — muss beim öffentlichen Verbreiten wieder unter ODbL stehen. Ein **Produced Work**, etwa eine gerenderte Karte oder eine Seite, ist davon nicht betroffen; Empfänger können aber die zugrunde liegenden Daten anfordern. Welche unserer Verarbeitungsschritte auf welcher Seite dieser Grenze liegen, beschreibt `docs/ODBL_DATAFLOW.md` (M05-05).
5. **Bilder.** Das Extrakt enthält keine Bilder. `imagesAllowed` steht deshalb auf `false`; ODbL deckt ohnehin keine Bildrechte Dritter.
6. **Kartenkacheln sind nicht Teil dieser Freigabe.** Der Kachel-Dienst der OSM Foundation hat eine eigene Nutzungspolitik und bekommt einen eigenen Registryeintrag, sobald die Karte gebaut wird.

### Freigegebene Ausgabeformen

| Ausgabeform | Ergebnis |
|---|---|
| Anzeige im HTML | erlaubt, mit Attribution |
| Öffentliche JSON-Auslieferung | erlaubt, mit Attribution und ODbL-Hinweis; abgeleitete Datenbanken zusätzlich unter ODbL |
| Öffentliches Repository | erlaubt, mit Attribution |
| Bilder | nicht erlaubt (nicht anwendbar) |

---

## got-2022-gesetze-im-internet

**Geprüft am:** 2026-09-06 · **Ergebnis:** `verified` nach Entscheidung des Betreibers (ADR-018)

### Was geprüft wurde

| Primärquelle | Fundstelle | Befund |
|---|---|---|
| § 5 UrhG, Amtliche Werke | `https://www.gesetze-im-internet.de/urhg/__5.html` | sha256 `0d1230eb…5524` |
| Impressum gesetze-im-internet.de | `https://www.gesetze-im-internet.de/impressum.html` | keine Aussage zu Nutzungsbedingungen |
| XML-Download | `https://www.gesetze-im-internet.de/got_2022/xml.zip` | HTTP 200, 32.110 Byte, `content-type: application/zip`, `etag` und `last-modified` vorhanden, enthält `BJNR140100022.xml` (301.818 Byte) |
| robots.txt | `https://www.gesetze-im-internet.de/robots.txt` | `User-agent: *` / `Disallow:` — kein Pfad ausgeschlossen |

### Feststellungen

1. **Der Inhalt ist frei.** § 5 Abs. 1 UrhG nennt ausdrücklich „Gesetze, Verordnungen, amtliche Erlasse und Bekanntmachungen“ als Werke ohne urheberrechtlichen Schutz. Die Gebührenordnung für Tierärzte ist eine Rechtsverordnung.
2. **Der Bezugsweg ist der offiziell angebotene XML-Download**, nicht die HTML-Ansicht und kein Crawler. Der Anbieter stellt diese Datei zum Abruf bereit; `robots.txt` schließt keinen Pfad aus.
3. **Der Download liefert brauchbare Abrufmetadaten.** `ETag` und `Last-Modified` erlauben einen bedingten Abruf, sodass ein Aktualisierungsjob nicht bei jedem Lauf die volle Datei ziehen muss.
4. **Rechtsgrundlage ist keine Lizenz.** § 5 Abs. 1 UrhG ist der Grund, warum der Text übernommen werden darf. Die Daten werden deshalb nicht als CC0, MIT oder unter einer erfundenen Lizenz gekennzeichnet.
5. **Die redaktionelle Aufbereitung der Website wird nicht übernommen**, ebenso wenig fremde Kommentierungen.

### Freigegebene Ausgabeformen

| Ausgabeform | Ergebnis |
|---|---|
| Anzeige im HTML | erlaubt, mit Quellenangabe und Fassungsstand |
| Öffentliche JSON-Auslieferung | erlaubt, mit vollständiger Provenienz |
| Öffentliches Repository | erlaubt (Snapshot mit Provenienz) |
| Bilder | nicht anwendbar |

### Was damit **nicht** freigegeben ist

- Die **fachliche Prüfung der Rechenregeln** (M08-06) ist ein eigenes Gate. Ein geklärter Bezugsweg macht ungeprüfte Rechenregeln nicht veröffentlichungsfähig.
- Der **zeitgesteuerte automatische Abruf** wird erst nach der Betriebsprüfung M17-07 aktiviert.
- Der Rechner wird **nicht als amtlicher Rechner** dargestellt (ADR-018).
