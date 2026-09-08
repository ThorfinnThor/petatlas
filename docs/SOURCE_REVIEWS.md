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
| Lizenztext | `https://www.govdata.de/dl-de/zero-2-0` | `26c8758c…0ecc` (bis 2026-09-08: `872b1a3e…07f1`) |
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

### Nachtrag 2026-09-08 (M20-03)

1. **Der `termsHash` hat sich geändert, der Lizenztext nicht.** Die GovData-Seite wurde umgebaut (Navigation, Fußzeile); der Wortlaut der Datenlizenz Deutschland – Zero – Version 2.0 ist unverändert. Beide Abrufe an diesem Tag ergaben denselben neuen Hash. Der Registryeintrag führt jetzt `26c8758c…0ecc`; die Freigabe bleibt bestehen, weil sich die Bedingungen nicht geändert haben.
2. **Die offene Frage zur Darstellung ist beantwortet.** Verbotsgebiete werden nicht als Kartenfläche gezeigt, sondern als benannter Listeneintrag mit dem Satz „Hunde dürfen nicht mitgenommen werden“ und farblich vom Freilauf abgesetzt. Auf der Stadtseite steht darüber der Geltungsbereich des Datensatzes, damit sein Schweigen nicht als Erlaubnis gelesen wird. Die Daten sind seit M20-03 ausgeliefert (`src/features/map/municipal.ts`).

---

## hamburg-hundeauslaufzonen-wfs

**Geprüft am:** 2026-09-08 · **Ergebnis:** `verified`

### Was geprüft wurde

| Primärquelle | Fundstelle | sha256 des Abrufs |
|---|---|---|
| Datensatzseite | `https://suche.transparenz.hamburg.de/dataset/hundeauslaufzonen-fur-hunde-nach-8-hamburger-hundeg` | — (Portalseite mit Zeitstempel) |
| Lizenztext | `https://www.govdata.de/dl-de/by-2-0` | `e1877184…f27e` |
| Abgabe des Dienstes | `https://geodienste.hamburg.de/HH_WFS_Hundeauslaufzonen_Paragraf_8` (GetFeature, GeoJSON, EPSG:4326) | `b7a6545b…` |
| Trefferzahl desselben Dienstes | derselbe Dienst mit `resulttype=hits` | `numberMatched="140"` |

### Feststellungen

1. **Lizenz.** Datenlizenz Deutschland – Namensnennung – Version 2.0. Nutzung, Weitergabe, Bearbeitung und kommerzielle Verwendung sind zulässig; die Lizenz verlangt dafür die Nennung des Bereitstellers.
2. **Attribution.** **Pflicht** — anders als bei der Berliner Quelle. `attributionRequired` steht deshalb auf `true`, und die Nennung steht an jeder Anzeige der Flächen, nicht nur in einer Quellenliste.
3. **Share-Alike.** Keines. Die by-Variante verlangt die Nennung, nicht die Weitergabe unter gleichen Bedingungen.
4. **Geltungsbereich.** Ausgewiesene Hundeauslaufzonen nach § 8 Hamburgisches Hundegesetz, ganzes Stadtgebiet, 140 Flächen. Der Datensatz sagt nichts über Flächen nach § 9 (Freilauf nur für geprüfte Hunde) und nichts über Verbote. Das steht als Pflichtfeld `validity` im Snapshot.
5. **Kein Typfeld.** Der Datensatz führt kein Feld für die Art der Fläche, weil er nur eine Art enthält. Die Zuordnung `dog_off_leash` steht deshalb als Konstante im Adapter, ausdrücklich kommentiert — nicht als Vermutung aus einem Freitext.
6. **Bezugssystem.** Der Dienst liefert ohne ausdrückliches `srsName` EPSG:25832. Die Adresse in der Registry verlangt `EPSG:4326`; der Parser bricht ab, wenn auch nur eine Fläche etwas anderes meldet. Umgerechnet wird nichts.
7. **Vollständigkeit.** Der GeoJSON-Ausgabepfad nennt weder `numberMatched` noch `numberReturned`. Die erwartete Zahl wird deshalb über eine zweite, winzige Anfrage (`resulttype=hits`) erfragt und als eigener Registryeintrag `hamburg-hundeauslaufzonen-anzahl` geführt — mit allen Ausgaberechten auf `false`, weil aus ihr nichts veröffentlicht wird.
8. **Bilder.** Der Datensatz enthält keine; `imagesAllowed` steht auf `false`.
9. **Bezugsweg.** Zwei Anfragen je Lauf an den offiziell angebotenen WFS. Kein Crawler, keine Spiegelung des Portals, kein WMS.

### Freigegebene Ausgabeformen

| Ausgabeform | Ergebnis |
|---|---|
| Anzeige im HTML | erlaubt, mit Namensnennung |
| Öffentliche JSON-Auslieferung | erlaubt, mit Namensnennung |
| Öffentliches Repository | erlaubt |
| Bilder | nicht erlaubt (nicht anwendbar) |

### Offen

Nichts. Die Flächen sind seit M20-03 auf der Stadtseite Hamburg ausgeliefert.

---

## got-2022-gesetze-im-internet — Abrufbedingungen (M17-07)

**Geprüft am:** 2026-09-08 · **Ergebnis:** wöchentlicher, bedingter Abruf vertretbar

Diese Prüfung betrifft **nicht** die Rechte an den Daten — die stehen weiter oben und beruhen auf § 5 Abs. 1 UrhG. Hier geht es allein um die Frage, ob ein zeitgesteuerter Abruf zumutbar und erlaubt ist.

### Was tatsächlich abgerufen wurde

| Prüfung | Ergebnis |
|---|---|
| `https://www.gesetze-im-internet.de/robots.txt` | `User-agent: *` mit leerem `Disallow:` — **kein Pfad ausgeschlossen** |
| `HEAD https://www.gesetze-im-internet.de/got_2022/xml.zip` | HTTP 200, `content-type: application/zip`, 32.110 Byte |
| `ETag` | `"7d6e-5f8c40dbcfb78"` |
| `Last-Modified` | `Fri, 07 Apr 2023 19:30:11 GMT` |
| `If-None-Match` mit diesem ETag | **HTTP 304** |
| `If-Modified-Since` mit diesem Datum | **HTTP 304** |
| Impressum der Quelle | Haftungsausschluss und Hinweis, dass keine Rechtsberatung erfolgt; **kein Hinweis gegen automatisierten Abruf**, kein Wort zu Crawlern, Skripten oder Weiterverarbeitung |

### Folgerung

1. **Kein Verbot gefunden.** Weder `robots.txt` noch das Impressum sprechen gegen einen automatisierten Abruf. Fände sich später ein solcher Hinweis, wird nur der Zeitplan gestoppt — der vorhandene Snapshot bleibt gültig und die Auslieferung läuft weiter.
2. **Bedingter Abruf ist möglich und wird genutzt.** Die Quelle beantwortet `If-None-Match` und `If-Modified-Since` korrekt mit 304. `scripts/ingest/snapshot-got.ts` führt `sourceEtag` und `sourceLastModified` im Snapshot mit und schickt sie beim nächsten Lauf; bei 304 endet der Lauf erfolgreich und lässt den Snapshot unverändert.
3. **Höchstens wöchentlich.** Der Zeitplan in `.github/workflows/ingest-open.yml` läuft montags um 04:17 UTC. Die Datei ist seit dem 7. April 2023 unverändert; häufiger abzurufen brächte nichts und belastete nur den Server.
4. **Kein Crawler.** Abgerufen wird genau eine Datei über ihre feste Adresse. Es gibt keine Verzeichnisdurchsuchung, keine Parallelität und keine Wiederholungsschleife ohne Pause — drei Versuche mit wachsendem Abstand, dann Ende.
5. **Ein Fehlschlag ändert nichts.** Ohne gültige Antwort bleibt der letzte gültige Snapshot stehen; die Website liefert weiter aus.

### Nachgeprüft am 2026-09-08

Zwei aufeinanderfolgende Läufe von `npm run snapshot:got -- --fetch`: der erste holte die Datei und trug ETag und `Last-Modified` in den Snapshot ein, der zweite bekam **HTTP 304** und ließ den Snapshot unangetastet. Der Inhalts-Hash blieb in beiden Fällen `c7bdcfa9b699…`; die Fassung ist unverändert die vom 7. April 2023.

### Aus der CI heraus nicht erreichbar (gemessen am 2026-09-08)

Der Abruf gelingt vom Arbeitsrechner, **nicht** von einem GitHub-Runner. Gemessen in zwei unabhängigen Workflows:

| Lauf | Versuche | Ergebnis |
|---|---|---|
| `ingest-open.yml`, Zuruf mit `quelle=got` | 3 (mit 30 s und 60 s Pause) | jedes Mal `fetch failed` nach rund 10 s |
| `source-check.yml`, zwei Läufe | 2 | `Connect Timeout Error (www.gesetze-im-internet.de:443, 10000ms)`, `UND_ERR_CONNECT_TIMEOUT` |

Es ist ein **Verbindungszeitlimit**, kein 403, kein Zertifikatsfehler und keine Antwort mit Hinweis. Der Server nimmt die Verbindung aus diesem Netz nicht an. Nachbarbefund aus demselben Lauf: `agriculture.gouv.fr` scheiterte einmal genauso und antwortete beim anderen Lauf sofort — Behördenhosts sind von einem Runner aus unzuverlässig erreichbar. Die Beobachtung versucht es deshalb zweimal mit einer Pause von 15 Sekunden; mehr wäre Drängeln.

**Folge für den Betrieb:** Der wöchentliche Lauf versucht den Abruf weiter — der Versuch kostet nichts, und sollte die Erreichbarkeit zurückkehren, greift er von selbst. Verlassen kann man sich darauf aber nicht. **Die Aktualisierung des Gebührenkatalogs ist bis auf Weiteres ein manueller Lauf** (`npm run snapshot:got -- --fetch` vom Arbeitsrechner), so wie der bundesweite OSM-Import. Ein Fehlschlag ersetzt keine Daten: der vorhandene Snapshot bleibt gültig, und die Fassung ist ohnehin seit dem 7. April 2023 unverändert.

Dass ein dauerhaft scheiternder Abruf auffällt und nicht nur in einer Zeile der Laufzusammenfassung steht, gehört zu M17-05.
