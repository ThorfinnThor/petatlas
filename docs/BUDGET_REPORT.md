# Budgetbericht

Gemessen am **2026-09-08**, zuletzt nachgemessen nach M19-05, lokal auf dem Arbeitsrechner (Apple Silicon, Node 24.19.0). Alle Zahlen sind **gemessen**, nicht geschätzt; die Messung wiederholt `npm run check:budgets`.

Die Grenzen stehen in `config/budgets.json` mit Begründung und stammen aus `docs/OPERATIONS.md` Abschnitt 12. Sie sind **Designgrenzen** — keine Kostenschätzung, keine Kapazitätszusage und keine Aussage über die Konditionen des Anbieters zum Zeitpunkt der Einrichtung.

## Ausgelieferte Dateien

| Build | Seiten | Dateien | Größe | Dauer |
|---|---|---|---|---|
| Vorgabe (`npm run build:site`, alle Featureflags aus) | 13 | 346 | 12 MiB | 1,6 s |
| Mit allen Featureflags (`ENABLE_FEATURES=costs,map,travel,commerce,care,toys,food,profile`) | 60 | 443 | 13 MiB | 1,9 s |

| Budget | Gemessen | Warnung ab | Stopp ab |
|---|---|---|---|
| Veröffentlichte Dateien | 443 | 12.000 | 18.000 |
| Größte ausgelieferte Datei | 0,46 MiB | 10 MiB | 25 MiB |
| Snapshots im Repository | 10,2 MiB | 35 MiB | 50 MiB |
| Git-Historie (`.git`) | 4,2 MiB nach Verdichtung | 250 MiB | 1.000 MiB |

Die fünf größten Dateien sind sämtlich Datenchunks; die größte ist `data/v1/places/de/names/w.*.json` mit 0,46 MiB. Kein Chunk kommt der Plattformgrenze von 25 MiB nahe, und keiner überschreitet die eigene Chunkgrenze aus `src/domain/schemas/manifest.ts`.

Dateiverteilung des Featurebuilds: überwiegend JSON-Datenchunks, dazu Skripte, Stile, HTML und der Suchindex. Der Datenanteil überwiegt deutlich — das ist die beabsichtigte Form: statische Seiten, die ihre Daten nachladen.

## Was diese Zahlen bedeuten

**Reichlich Abstand.** Bei 443 von 12.000 Dateien liegt der Verbrauch bei 3,7 Prozent der Warnschwelle. Der Ortsdatensatz mit 9.381 Orten ist bereits vollständig enthalten; die Zahl wächst also nicht mehr um eine Größenordnung, wenn die Karte vollständig ausgeliefert wird.

**Der Engpass wäre die Datenmenge, nicht die Dateizahl.** Käme ein zweiter bundesweiter Datensatz dazu, wüchse vor allem die Größe der Chunks. Die Chunkgrenzen im Manifest (512 KiB, für Geodaten 1 MiB) zwingen dann zum Teilen — und Teilen erhöht die Dateizahl. Der Weg zur 12.000er-Warnschwelle führt also über weitere Datensätze, nicht über weitere Seiten.

**Buildzeit ist heute kein Thema.** Unter zwei Sekunden für den gesamten Ablauf einschließlich Datenveröffentlichung und Suchindex. Cloudflare nennt 20 Minuten je Build; davon werden knapp 0,2 Prozent gebraucht. Der bundesweite OSM-Import ist darin **nicht** enthalten — er läuft nicht in der CI, sondern manuell (rund eine Stunde, `docs/OSM_BENCHMARK.md`).

**Die Git-Historie ist klein.** 4,2 MiB nach Verdichtung. Der Grund steht in den Regeln: keine PBF-Rohdateien in Git, Snapshots normalisiert und deterministisch sortiert, damit ein unveränderter Datenstand keinen Diff erzeugt.

## Was nicht gemessen wurde

- **Cloudflare-Buildminuten und Assetzahlen im Betrieb.** Es gibt kein Projekt und kein Deployment; jede Zahl dazu wäre erfunden. Sie kommen dazu, sobald `docs/CLOUDFLARE_SETUP.md` abgearbeitet ist.
- **Laufzeitmetriken im Browser** (LCP, INP). Sie gehören zu M18 und werden dort gemessen, nicht hier geschätzt.
- **Kosten.** Domain, Kartendienst, fachliche Prüfungen und Partnerdienstleistungen können Kosten verursachen; dieser Bericht misst Verbrauch, nicht Geld.

## Wiederholen

```bash
npm run build:site && npm run check:budgets
```

Der Befehl endet mit Rückgabewert 1, sobald ein Budget seine Stoppgrenze erreicht. Eine Grenze anzuheben ist eine Entscheidung: sie steht in `config/budgets.json` und gehört im Commit begründet.
