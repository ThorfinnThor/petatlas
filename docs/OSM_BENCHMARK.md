# Messung: bundesweiter Ortsdatenimport

Gemessen am 2026-09-07 (M10-04). Ein echter Lauf über alle 16 deutschen Regionalextrakte, nicht eine Hochrechnung.

Maschine: Apple Silicon, Node v24.19.0, Heimanschluss. Die Zahlen sind eine Messung unter diesen Bedingungen, keine Zusicherung.

## Gesamtergebnis

| | |
|---|---|
| Regionen | 16 von 16, keine fehlend |
| Geladen | 4,60 GiB |
| Ladezeit gesamt | 917 s |
| Verarbeitungszeit gesamt | 546 s |
| Gesamtdauer inklusive Pausen | rund 29 Minuten |
| **Spitzenspeicher (Heap)** | **373 MiB** |
| Spitzenbedarf Plattenplatz | 870 MiB — die größte einzelne Region |
| Übernommene Orte | 9.381 |
| Ortsnamen für die Suche | 46.116 |

Der Spitzenbedarf an Plattenplatz ist **nicht** die Summe der Extrakte. Jede Region wird geladen, verarbeitet und ihre Rohdatei sofort gelöscht; nach dem Lauf ist `.work/osm/` leer. Rohdaten gehen weder ins Repository noch in ein Deployment.

## Je Region

| Region | Größe | Laden | Rechnen | Heap | Orte |
|---|---|---|---|---|---|
| Baden-Württemberg | 617 MiB | 252,4 s | 71,0 s | 131 MiB | 985 |
| Bayern | 812 MiB | 172,1 s | 95,3 s | 139 MiB | 1.472 |
| Berlin | 95 MiB | 80,7 s | 10,6 s | 109 MiB | 331 |
| Brandenburg | 286 MiB | 25,6 s | 33,0 s | 173 MiB | 645 |
| Bremen | 20 MiB | 2,3 s | 2,2 s | 197 MiB | 66 |
| Hamburg | 51 MiB | 5,0 s | 5,4 s | 69 MiB | 165 |
| Hessen | 329 MiB | 62,0 s | 37,4 s | 203 MiB | 747 |
| Mecklenburg-Vorpommern | 122 MiB | 12,0 s | 14,2 s | 46 MiB | 206 |
| Niedersachsen | 481 MiB | 58,6 s | 55,2 s | 64 MiB | 1.174 |
| Nordrhein-Westfalen | 870 MiB | 117,9 s | 102,5 s | 373 MiB | 1.901 |
| Rheinland-Pfalz | 256 MiB | 33,2 s | 29,8 s | 178 MiB | 427 |
| Saarland | 52 MiB | 6,7 s | 5,8 s | 93 MiB | 112 |
| Sachsen | 256 MiB | 27,5 s | 28,8 s | 94 MiB | 520 |
| Sachsen-Anhalt | 166 MiB | 20,6 s | 19,9 s | 137 MiB | 284 |
| Schleswig-Holstein | 150 MiB | 14,6 s | 17,3 s | 66 MiB | 516 |
| Thüringen | 152 MiB | 25,5 s | 17,9 s | 85 MiB | 285 |

Die Ladezeiten schwanken stark und hängen an der Quelle, nicht an diesem Code: Baden-Württemberg brauchte 252 s für 617 MiB, Brandenburg 26 s für 286 MiB.

## Warum sequenziell

Die Quelle antwortet bei zu schnellen Abrufen mit **HTTP 502**. Genau das ist beim ersten Versuch passiert, nachdem kurz zuvor mehrere Kopfabfragen abgesetzt worden waren.

Daraus folgt für den Import:

- Eine Region nach der anderen, mit 20 Sekunden Pause dazwischen.
- 502 wird wie ein Rate Limit behandelt: warten, mit gedeckeltem Rückzug erneut versuchen, nach vier Versuchen aufgeben.
- Kein paralleles Laden, keine engen Wiederholschleifen, kein Umgehen der Drosselung.

Der Lauf ist dadurch langsamer, als er technisch sein müsste. Das ist beabsichtigt: die Extrakte sind ein Geschenk der Geofabrik an die Allgemeinheit, und die Verarbeitung ist ohnehin CPU-gebunden.

## Verhalten im Fehlerfall

Eine gescheiterte Region beendet den Lauf nicht. Sie wird benannt, im Bericht als `missingRegions` geführt und in der Abdeckung ausgewiesen. Scheitert **jede** Region, wird nichts geschrieben und der vorhandene Snapshot bleibt gültig.

Im gemessenen Lauf ist keine Region gescheitert.

## Wiederholen

```bash
export NODE_EXTRA_CA_CERTS="$PWD/.work/ca/system-roots.pem"
npm run ingest:osm-de                          # alle 16 Regionen
npm run ingest:osm-de -- --regions bremen      # eine einzelne
npm run ingest:osm-de -- --keep                # Rohdateien behalten
```

Der Rohbericht je Region liegt danach in `.work/osm-benchmark.json`.

---

## Zweiter vollständiger Lauf (2026-09-08, M22-01)

Der erste Lauf entstand, bevor der Import sein Abrufdatum mitschrieb; der Datenstand galt deshalb als „unbekannt“. Dieser Lauf holt das nach und dient zugleich als zweite Messung derselben Strecke.

| | erster Lauf (07.09.) | zweiter Lauf (08.09.) |
|---|---|---|
| Regionen | 16 von 16 | 16 von 16 |
| Geladen | 4,60 GiB | 4,60 GiB |
| Ladezeit gesamt | 917 s | 474 s |
| Verarbeitungszeit gesamt | 546 s | 564 s |
| Spitzenspeicher (Heap) | 373 MiB | 204 MiB |
| Übernommene Orte | 9.381 | 9.381 |
| Ortsnamen für die Suche | 46.116 | 46.113 |
| Abrufdatum im Snapshot | fehlt | `2026-09-07` |

Die Ladezeit hat sich fast halbiert, die Rechenzeit blieb gleich — die Ladezeit hängt am Anschluss und an der Auslastung der Spiegel, nicht am Code. Der niedrigere Spitzenspeicher stammt aus einem anderen Zeitpunkt der Speicherbereinigung, nicht aus einer Optimierung; 373 MiB bleiben die belastbare Obergrenze für die Planung.

**Was sich fachlich geändert hat.** Beide Läufe übernehmen 9.381 Orte. Im Einzelvergleich: 2 Orte sind weggefallen, 2 neu hinzugekommen, 5 haben sich geändert (dreimal Öffnungszeiten, zweimal Koordinaten, einmal der Name). Das ist die normale Bewegung in OpenStreetMap innerhalb eines Tages, kein Importfehler.

Folgearbeit im selben Zug: `content-data/city-allowlist.json` wurde neu gemessen. Eine Stadt hat sich verändert (Halle (Saale): 31 → 30 erfasste Orte, eine Tierarztpraxis weniger). Alle 42 Städte erfüllen die Kriterien weiterhin; die Allowlist bleibt bei 42 Einträgen.
