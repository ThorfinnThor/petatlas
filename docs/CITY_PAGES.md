# Lokale Stadtseiten (M11-04)

Lokale Landingpages sind der übliche Weg, aus einem Ortsdatensatz tausende dünne Seiten zu machen: eine Seite je Stadt, gefüllt mit Überschriften und dem Satz „leider noch keine Einträge“. Diese Seiten entstehen hier nur dort, wo tatsächlich etwas erfasst ist.

## Wie eine Stadt auf die Liste kommt

Kandidaten sind alle Orte des Ortsindex mit `kind = city | town` und mindestens 50.000 Einwohnern — das begrenzt nur die Rechenarbeit. Ob eine Stadt eine Seite bekommt, entscheiden allein die erfassten Orte im Umkreis von 10 km um den Stadtpunkt:

| Kriterium | Schwelle |
|---|---|
| Einträge je Pflichtkategorie (Tierarztpraxis, Tierheim, Zoofachhandel, Hundewiese) | ≥ 1 |
| Einträge insgesamt | ≥ 25 |
| Tierarztpraxen | ≥ 10 |
| Einträge mit Telefon, Website oder Öffnungszeiten | ≥ 15 |
| Einträge, die laut Quelle in der Stadt selbst liegen | ≥ 10 |
| Startziele insgesamt | ≤ 25 |

Die Schwellen stehen als Zahlen in `src/features/map/city.ts` (`STADT_KRITERIEN`) und werden in der Allowlist mitgeführt; ein Test vergleicht beide. Unter den geeigneten Städten entscheidet die Zahl der erfassten Orte, bei Gleichstand der Name — die Auswahl ist damit reproduzierbar und nicht redaktionell.

**Gemessen am Datenstand vom 07.09.2026:** von 188 Kandidaten erfüllen 42 die Kriterien; ausgewählt sind die 25 mit dem größten Bestand. Die kleinste ausgewählte Stadt hat 44 erfasste Orte, die kleinste geeignete 25.

Die häufigsten Ablehnungsgründe (Mehrfachnennung je Stadt möglich):

| Grund | Städte |
|---|---|
| zu wenige Einträge in der Stadt selbst | 138 |
| zu wenige Einträge insgesamt | 93 |
| zu wenige Tierarztpraxen | 75 |
| zu wenige Einträge mit Kontaktangabe | 74 |
| keine Hundewiese erfasst | 42 |
| kein Tierheim erfasst | 26 |

## Ausgewählte Städte

Zahlen sind der Bestand im Umkreis von 10 km, wie er in `content-data/city-allowlist.json` gemessen steht.

| Stadt | Gesamt | Tierarztpraxen | Tierheime | Zoofachhandel | Hundewiesen | in der Stadt | mit Kontakt |
|---|---|---|---|---|---|---|---|
| Augsburg | 53 | 33 | 2 | 13 | 5 | 28 | 43 |
| Berlin | 203 | 119 | 2 | 62 | 20 | 126 | 168 |
| Bochum | 92 | 38 | 5 | 38 | 11 | 38 | 75 |
| Bonn | 59 | 31 | 2 | 19 | 7 | 19 | 49 |
| Bremen | 49 | 29 | 1 | 17 | 2 | 24 | 40 |
| Dortmund | 54 | 22 | 2 | 24 | 6 | 27 | 42 |
| Dresden | 61 | 30 | 6 | 21 | 4 | 27 | 55 |
| Duisburg | 47 | 23 | 3 | 20 | 1 | 15 | 35 |
| Düsseldorf | 69 | 35 | 4 | 26 | 4 | 29 | 60 |
| Essen | 70 | 26 | 5 | 32 | 7 | 28 | 53 |
| Euskirchen | 44 | 20 | 2 | 16 | 6 | 39 | 43 |
| Frankfurt am Main | 65 | 36 | 3 | 17 | 9 | 12 | 49 |
| Gelsenkirchen | 77 | 27 | 6 | 33 | 11 | 10 | 56 |
| Hamburg | 101 | 49 | 2 | 37 | 13 | 48 | 84 |
| Hannover | 79 | 47 | 1 | 24 | 7 | 16 | 66 |
| Heidelberg | 45 | 26 | 2 | 12 | 5 | 11 | 38 |
| Köln | 88 | 38 | 4 | 24 | 22 | 30 | 57 |
| Leipzig | 77 | 42 | 2 | 20 | 13 | 45 | 62 |
| Mannheim | 67 | 30 | 4 | 28 | 5 | 15 | 53 |
| Mönchengladbach | 46 | 16 | 2 | 13 | 15 | 12 | 28 |
| Mülheim an der Ruhr | 66 | 28 | 4 | 30 | 4 | 12 | 47 |
| München | 117 | 77 | 1 | 34 | 5 | 65 | 106 |
| Neuss | 61 | 33 | 4 | 20 | 4 | 20 | 55 |
| Nürnberg | 58 | 27 | 2 | 17 | 12 | 25 | 40 |
| Stuttgart | 50 | 24 | 2 | 19 | 5 | 19 | 41 |

Der Umkreis von 10 km bedeutet, dass in Ballungsräumen Nachbarstädte mitzählen. Die Seite sagt das: sie nennt getrennt, wie viele Einträge der Stadt selbst zugeordnet sind, und beschriftet jeden Treffer mit „in Bremen“ oder „im Umkreis von Bremen“.

## Was auf der Seite nicht steht

- Keine Bewertungen, keine Rangfolge, keine bezahlten Platzierungen. Sortiert wird ausschließlich nach Entfernung zum Stadtmittelpunkt.
- Keine leere Rubrik. Fehlt eine Kategorie, entsteht die Seite gar nicht.
- Keine Notdienstauskunft. Die Seite sagt ausdrücklich, dass sie keine ist.
- Kein Vollständigkeitsanspruch: was in OpenStreetMap fehlt, fehlt hier — nicht in der Wirklichkeit.

## Erneuern

```
npm run build:city-allowlist
```

Das Skript misst neu und schreibt die Datei. Der Build prüft anschließend jede gelistete Stadt noch einmal gegen den aktuellen Datenstand: erfüllt sie die Kriterien nicht mehr, entfällt ihre Seite. Die Allowlist ist damit eine Obergrenze, keine Zusicherung.

`tests/places/city-allowlist.test.ts` schlägt fehl, wenn die Datei nicht mehr zum Datenstand passt — der Hinweis auf den Regenerierungslauf steht im Test.
