# Abdeckung der Ortsdaten

Stand 2026-09-07 (M10-05). Erhoben aus allen 16 deutschen OSM-Regionalextrakten; die Messung des Laufs steht in `docs/OSM_BENCHMARK.md`.

## Was erfasst ist

**9.381 Orte** aus 16 von 16 Regionen. Keine Region fehlt.

| Kategorie | Erfasst |
|---|---|
| veterinary | 4.929 |
| pet_shop | 2.852 |
| dog_park | 979 |
| animal_shelter | 621 |

| Region | Erfasst |
|---|---|
| Nordrhein-Westfalen | 1.901 |
| Bayern | 1.472 |
| Niedersachsen | 1.174 |
| Baden-Württemberg | 985 |
| Hessen | 747 |
| Brandenburg | 645 |
| Sachsen | 520 |
| Schleswig-Holstein | 516 |
| Rheinland-Pfalz | 427 |
| Berlin | 331 |
| Thüringen | 285 |
| Sachsen-Anhalt | 284 |
| Mecklenburg-Vorpommern | 206 |
| Hamburg | 165 |
| Saarland | 112 |
| Bremen | 66 |

## Was das **nicht** heißt

**Es heißt nicht, dass es so viele gibt.** OpenStreetMap ist eine Freiwilligendatenbank. 4.929 erfasste Tierarztpraxen sind die, die jemand eingetragen hat — nicht die, die es gibt. Wo nichts steht, ist nichts erfasst; daraus folgt nicht, dass es dort keine gibt.

**Es heißt nicht, dass die Angaben aktuell sind.** Der Stand ist der des Extrakts. Öffnungszeiten und Telefonnummern können veraltet sein.

## Vollständigkeit der einzelnen Angaben

| Angabe | Vorhanden | Anteil |
|---|---|---|
| Gemeinde | 5.662 | 60 % |
| Telefonnummer | 4.347 | 46 % |
| Öffnungszeiten | 4.695 | 50 % |

Eine fehlende Angabe wird als **unbekannt** ausgegeben, nicht als „nein“ und nicht als leerer String.

## Notdienst

**9 Orte** tragen eine ausdrückliche Notdienstangabe. Bei **9.364** ist sie unbekannt.

Daraus folgt: Diese Daten taugen **nicht** für eine Notdienstauskunft. Ein Ort ohne Angabe ist kein Ort ohne Notdienst, und ein Ort mit Angabe ist keine Zusicherung, dass gerade jemand da ist. Wer einen Notdienst sucht, ruft an oder nutzt den amtlichen Notdienstplan.

## Koordinatenqualität

| Herkunft | Orte |
|---|---|
| Erfasste Koordinate (`node`) | 6.695 |
| Berechneter Punkt einer Fläche | 2.686 |

Ein berechneter Punkt ist der Schwerpunkt der Stützpunkte. Bei einer konkaven Fläche kann er außerhalb liegen. Die Anzeige muss den Unterschied benennen.

## Ortszuordnung

Ein Treffer im Umkreis liegt **nicht** in der Gemeinde. Wo die Gemeinde des Ortes nicht mit der gesuchten übereinstimmt oder unbekannt ist, heißt es „im Umkreis von“ — eine Entfernung ist keine Verwaltungszugehörigkeit.

## Ausgabeform

Die Daten werden räumlich geteilt: 9.381 Orte in 217 Zellen von je 0,5 Grad Kantenlänge. Der Kartenindex nennt nur Zellen mit Bounding Box und Zählern und ist 45 KiB groß; der Namensindex 5,6 KiB. Der Browser lädt zu Beginn rund **50 KiB**, nicht den ganzen Bestand.

Die 46.116 Ortsnamen für die Suche sind nach Anfangsbuchstaben in 51 Teile geteilt. Ein Autocomplete lädt den Teil, der zum getippten Anfang passt.

## Lizenz

© OpenStreetMap contributors. ODbL 1.0. Die abgeleiteten Ortsdaten sind eine abgeleitete Datenbank und werden unter derselben Lizenz weitergegeben; der Datenfluss steht in `docs/ODBL_DATAFLOW.md`.
