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

**Geprüft am:** 2026-09-06 · **Ergebnis:** bleibt `pending` — Entscheidung des Betreibers erforderlich

### Was geprüft wurde

| Primärquelle | Fundstelle | sha256 des Abrufs |
|---|---|---|
| § 5 UrhG, Amtliche Werke | `https://www.gesetze-im-internet.de/urhg/__5.html` | `0d1230eb…5524` |
| Impressum gesetze-im-internet.de | `https://www.gesetze-im-internet.de/impressum.html` | — |

### Feststellungen

1. **Der Inhalt ist frei.** § 5 Abs. 1 UrhG nennt ausdrücklich „Gesetze, Verordnungen, amtliche Erlasse und Bekanntmachungen“ als Werke, die keinen urheberrechtlichen Schutz genießen. Die Gebührenordnung für Tierärzte ist eine Rechtsverordnung. Ihre Positionen und Regeln als solche dürfen also wiedergegeben werden.
2. **Der Bezugsweg ist nicht geregelt.** Das Impressum von gesetze-im-internet.de nennt als Anbieter die Bundesrepublik Deutschland, vertreten durch das Bundesministerium der Justiz, und die juris GmbH als technischen Dienstleister. Es enthält **keine** Aussage zu Nutzungsbedingungen, zur Weiterverwendung oder zum systematischen Abruf der HTML- beziehungsweise XML-Fassung.
3. **Daraus folgt eine offene Frage, nicht eine Freigabe.** „Der Text ist gemeinfrei“ und „diese Website darf systematisch abgerufen und gespiegelt werden“ sind zwei verschiedene Aussagen. Die zweite lässt sich aus den veröffentlichten Angaben nicht belegen.

### Was fehlt und wer entscheidet

**Offene Frage:** Auf welchem Weg wird der Verordnungstext bezogen?

Mögliche Wege, ohne Empfehlung aufgeführt:

- Abruf der XML-Fassung von gesetze-im-internet.de nach Klärung der Bedingungen mit dem Anbieter,
- Nutzung einer anderen Distribution derselben Verordnung mit ausdrücklichen Nutzungsbedingungen,
- einmalige manuelle Erfassung der benötigten Positionen aus der amtlichen Verkündung, ohne systematischen Abruf der Website.

**Zuständig:** Betreiber, gegebenenfalls mit rechtlicher Prüfung. Bis zur Entscheidung bleibt der Eintrag `pending`; der Kostenrechner wird gegen eindeutig synthetische Fixtures entwickelt und liefert keine echten Gebührenwerte aus.

**Davon unberührt** bleibt die fachliche Freigabe der Rechenregeln (M08-06). Sie ist ein eigenes Gate: selbst mit geklärtem Bezugsweg dürfen ungeprüfte Rechenregeln nicht live gehen.
