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

---

## osm-geofabrik-bremen-pbf

**Geprüft am:** 2026-09-06 · **Ergebnis:** `verified`

Eigener Registryeintrag, weil eine Region eine andere Distribution ist als das Deutschland-Extrakt: eigene Adresse, eigene Abdeckung, eigener Stand.

Die Geofabrik-Seite für Bremen weist dieselbe Lizenz aus wie die Deutschlandseite: „License: ODbL 1.0“, Daten von OpenStreetMap-Mitwirkenden, aufbereitet von der Geofabrik GmbH. Attribution, Share-Alike für abgeleitete Datenbanken und der Ausschluss von Bildern und Kartenkacheln gelten unverändert; die Feststellungen aus dem Deutschland-Extrakt oben gelten hier gleichermaßen.

Der Pilotlauf über diese Distribution ist in `docs/OSM_PILOT.md` dokumentiert.

---

## berlin-hundefreilauf-wfs

**Geprüft am:** 2026-09-07 · **Ergebnis:** `verified`

### Was geprüft wurde

| Primärquelle | Fundstelle | sha256 des Abrufs |
|---|---|---|
| Metadaten des Datensatzes | `https://datenregister.berlin.de/api/3/action/package_show?id=hundefreilauf-wfs-63c580c9` | — (CKAN-Antwort mit Zeitstempel) |
| Lizenztext | `https://www.govdata.de/dl-de/zero-2-0` | `872b1a3e…07f1` |
| Abgabe des Dienstes | `https://gdi.berlin.de/services/wfs/hundefreilauf` (GetFeature, GeoJSON, EPSG:4326) | `f386fe1b…a997` |

Der `termsHash` im Registryeintrag ist der Hash der abgerufenen Lizenzseite. Ändert er sich, gilt die Freigabe als offen und wird erneut geprüft (M05-06).

### Feststellungen

1. **Lizenz.** Die Portalmetadaten weisen den Datensatz als „Datenlizenz Deutschland – Zero – Version 2.0“ aus (`license_id: dl-de-zero-2.0`), mit der Lizenzadresse bei GovData. Der Lizenztext lautet: „Jede Nutzung ist ohne Einschränkungen oder Bedingungen zulässig.“ Genannt sind ausdrücklich Vervielfältigung, Bearbeitung, Weitergabe an Dritte, Zusammenführung mit anderen Daten und Einbindung in Produkte — kommerziell wie nicht kommerziell.
2. **Attribution.** Nicht verlangt. Der Registryeintrag führt trotzdem einen Attributionstext, weil die Herkunft einer Aussage über eine Fläche zur Aussage gehört. `attributionRequired` steht auf `false`, damit die Lizenzprüfung nicht eine Pflicht behauptet, die es nicht gibt.
3. **Share-Alike.** Keines. Die Zero-Variante stellt keine Bedingungen, also auch keine Weitergabe unter gleichen Bedingungen.
4. **Geltungsbereich.** Der Datensatz deckt drei Bezirke ab (Charlottenburg-Wilmersdorf, Friedrichshain-Kreuzberg, Reinickendorf) plus eine Fläche in Steglitz-Zehlendorf. Er ist **keine** berlinweite Auskunft. Das steht als Pflichtfeld `validity` im Snapshot, nicht nur in dieser Prüfung.
5. **Inhalt.** Zwei Arten von Flächen: ausgewiesene Hundefreilaufflächen und Hundemitnahmeverbote. Beide werden getrennt geführt; aus einem fehlenden Verbot wird keine Erlaubnis abgeleitet.
6. **Bilder.** Der Datensatz enthält keine. Das Vorschaubild des Portals wird nicht übernommen; `imagesAllowed` steht auf `false`.
7. **Bezugsweg.** Die WFS-Abgabe ist das offiziell angebotene Format. Abgerufen wird eine Anfrage je Lauf; der Kartendienst (WMS) des Layers wird nicht verwendet.

### Freigegebene Ausgabeformen

| Ausgabeform | Ergebnis |
|---|---|
| Anzeige im HTML | erlaubt |
| Öffentliche JSON-Auslieferung | erlaubt |
| Öffentliches Repository | erlaubt |
| Bilder | nicht erlaubt (nicht anwendbar) |

### Offen

Die Daten sind freigegeben, aber noch nicht ausgeliefert (siehe `docs/MUNICIPAL_PILOT.md`). Vor einer Auslieferung ist zu klären, wie Verbotsgebiete dargestellt werden, ohne dass eine Karte sie wie ein Angebot aussehen lässt.
