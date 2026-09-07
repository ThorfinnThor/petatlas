# Abnahme der Ortsdaten

Durchgeführt am 2026-09-07 (M10-06). Geprüft wurde der bundesweite Snapshot aus allen 16 deutschen OSM-Regionalextrakten und die daraus erzeugte Ausgabe.

Dies ist eine **Datenqualitätsprüfung**, keine fachliche Freigabe einer Auskunft. Sie stellt fest, dass die Daten das sind, was sie zu sein vorgeben — nicht, dass sie vollständig oder aktuell wären.

## Prüfumfang

| | |
|---|---|
| Orte im Snapshot | 9.381 |
| Regionen | 16 von 16, keine fehlend |
| Ausgelieferte Datendateien | 271 |
| Automatische Prüfung | `npm run check:places` |

## Stichprobe gegen die Originalquelle

Aus jeder Kategorie wurden Einträge gezogen und drei davon **unabhängig gegen die OpenStreetMap-API** geprüft — also gegen einen anderen Endpunkt als das verarbeitete Geofabrik-Extrakt:

| Orts-ID | Name | Koordinaten stimmen | Tag stimmt | Gemeinde stimmt |
|---|---|---|---|---|
| `osm:node:3700687279` | Tierarztpraxis Schweer | ja (52,0218 / 10,5721) | `amenity=veterinary` | Schladen-Werla |
| `osm:node:3284696061` | Das Futterhaus | ja (52,3057 / 13,2524) | `shop=pet` | Ludwigsfelde |
| `osm:node:14014851861` | AniCura | ja (47,7269 / 10,3041) | `amenity=veterinary` | Kempten (Allgäu) |

Alle drei stimmen in Koordinate, Name, Kategorie-Tag und Gemeinde mit der Quelle überein.

Weitere Stichproben über alle vier Kategorien und mehrere Bundesländer zeigen plausible Einträge: echte Einrichtungsnamen, deutsche Gemeinden, Koordinaten innerhalb Deutschlands, ein erwarteter Mix aus erfassten Punkten und berechneten Flächenschwerpunkten.

## Automatische Prüfung

`npm run check:places` prüft und meldete **keine Beanstandung**:

- kein Ort außerhalb der Hülle um Deutschland,
- keine doppelte Orts-ID,
- kein leerer String, wo `null` stehen muss — unbekannt bleibt unbekannt,
- kein Ort ohne Namen,
- jede der 271 ausgelieferten Dateien enthält den Pflichthinweis „© OpenStreetMap contributors“,
- keine Datei enthält Bearbeiter-Metadaten, Betreiberangaben oder E-Mail-Adressen.

## Aktualität

Jede ausgelieferte Datei führt ihre Herkunft mit: Quelle, Lizenz, Attribution und den Stand der verarbeiteten Extrakte. Der Kartenindex trägt zusätzlich die Abdeckung je Region.

Die Anzeige des Datenstands in der Oberfläche gehört zu M11 und ist hier nicht abgenommen.

## Lizenzdownload

`/data/v1/places/de/LICENSE.txt` wird **mit** den Daten ausgeliefert. Wer die Dateien herunterlädt, hat den Pflichthinweis, die Lizenz und die Einordnung als abgeleitete Datenbank dabei — nicht nur auf einer Seite daneben.

## Notdienst: ausdrücklich keine Zusicherung

**9 von 9.381 Orten** (0,1 Prozent) tragen eine ausdrückliche Notdienstangabe. Bei 9.364 ist sie unbekannt, bei 8 ausdrücklich verneint.

Daraus folgt für das Produkt:

- Es darf **keine** Notdienstsuche und **keine** Notdienstliste aus diesen Daten entstehen.
- Ein Ort ohne Angabe ist kein Ort ohne Notdienst.
- Ein Ort mit Angabe ist keine Zusicherung, dass gerade jemand erreichbar ist.

Die automatische Prüfung gibt diesen Anteil bei jedem Lauf aus, damit er nicht unbemerkt anders interpretiert wird.

## Was diese Abnahme **nicht** feststellt

- **Keine Vollständigkeit.** 4.929 erfasste Tierarztpraxen sind die eingetragenen, nicht die vorhandenen. OpenStreetMap ist eine Freiwilligendatenbank.
- **Keine Aktualität der Einzelangaben.** Öffnungszeiten und Telefonnummern stammen aus der Quelle und können veraltet sein. Sie werden angezeigt, wie sie dort stehen.
- **Keine Aussage über Qualität der Einrichtungen.** Die Daten sagen, dass etwas erfasst ist, sonst nichts.

Diese drei Punkte gehören sichtbar in die Oberfläche, nicht nur in dieses Dokument. Umgesetzt wird das in M11.

## Ergebnis

Die bundesweit erfassten Ortsdaten sind belegt: 9.381 Orte aus 16 Regionen, stichprobenartig gegen die Originalquelle bestätigt, ohne Befund in der automatischen Prüfung.

Eine Vollständigkeit aller real existierenden Einrichtungen wird ausdrücklich **nicht** behauptet.
