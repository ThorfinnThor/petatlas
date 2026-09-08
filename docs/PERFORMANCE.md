# Leistungsmessung

Gemessen am **2026-09-08** auf Commit `55d1be6`, lokal: Apple Silicon, Node 24.19.0, Chromium aus Playwright, gegen den gebauten Output über `astro preview` auf `localhost`. Alle Funktionen waren eingeschaltet (`ENABLE_FEATURES=costs,map,travel,commerce,care,toys,food,profile`), damit die Seiten mit der meisten Logik überhaupt existieren.

Wiederholen: `npm run test:performance`

## Was diese Zahlen sind — und was nicht

**Sie sind Bytes, Knoten und Zeiten eines lokalen Aufrufs.** Kein Netz, kein echtes Gerät, keine echten Nutzer.

Ausdrücklich **nicht** enthalten:

- **Kein Lighthouse-Score.** Lighthouse ist keine Abhängigkeit dieses Projekts, und eine Zahl aus einem Lauf ohne dokumentierte Bedingungen sagt wenig. Wer einen Score braucht, misst ihn gegen die ausgelieferte Website — die es noch nicht gibt.
- **Keine Felddaten.** LCP und INP, wie sie zählen, kommen von echten Besuchern auf echten Geräten. Es gibt keine Besucher. Die unten genannten LCP-Werte stammen vom Browser selbst auf einem lokalen Server und sind damit eine **untere Schranke**, gegen die kein Budget geprüft wird. Sie stehen hier, weil eine gemessene untere Schranke ehrlicher ist als eine geschätzte Zahl.
- **Keine Kompression.** Der Vorschau-Server komprimiert nicht. Die Auslieferung tut es; die gemessenen Bytes sind also die ungünstigste Zahl.

## Gemessen je Seite

Identische Werte für Desktop- und Mobilprofil, weil dieselben Dateien ausgeliefert werden; der Unterschied läge im Netz und im Gerät, und beides wird hier nicht nachgebildet.

| Seite | JavaScript | Übertragen gesamt | DOM-Knoten | Anfragen | LCP (untere Schranke) |
|---|---|---|---|---|---|
| Start | 2,8 KiB | 39,6 KiB | 84 | 8 | 16–20 ms |
| Kostenrechner | 97,3 KiB | 139,1 KiB | 125 | 10 | 20 ms |
| Karte | 14,0 KiB | 67,2 KiB | 319 | 9 | 24 ms |
| Reisecheck | 112,3 KiB | 159,0 KiB | 187 | 10 | 28 ms |
| Futter | 95,0 KiB | 134,1 KiB | 93 | 11 | 20 ms |

Budgets: JavaScript Warnung ab 60 KiB, Stopp ab 150 KiB. Seitengröße Warnung ab 400 KiB, Stopp ab 900 KiB. DOM-Knoten Warnung ab 1.500, Stopp ab 3.000. **Kein Stopp erreicht.** Drei Seiten liegen über der JavaScript-Warnschwelle; warum, steht im nächsten Abschnitt.

## Woher das JavaScript kommt

| Datei | Roh | Komprimiert |
|---|---|---|
| `iso.*.js` (Schemabibliothek) | 85,3 KiB | 23,3 KiB |
| `leaflet-src.*.js` (Karte) | 145,3 KiB | 41,8 KiB |
| `Reisecheck.*.js` | 25,8 KiB | 9,1 KiB |
| `Kostenrechner.*.js` | 10,8 KiB | 4,2 KiB |
| Alle Stile zusammen | 35,4 KiB | 8,3 KiB |

**Die 85 KiB der Schemabibliothek sind der Grund für die drei Warnungen.** Sie stecken in jeder Seite, die Daten nachlädt: Gebühren, Reiseregeln, Futter. Das ist ein bewusster Preis. Der Browser prüft die Daten, die er lädt, gegen dasselbe Schema wie der Build — statt ihnen zu glauben. Fiele die Prüfung weg, wäre ein beschädigter oder halb ausgelieferter Datenchunk im Browser nicht mehr von einem gültigen zu unterscheiden. Komprimiert sind es 23 KiB; das ist die Zahl, die beim Besucher ankommt.

Wer sie senken will, hat zwei ehrliche Wege: entweder eine kleinere Laufzeitprüfung nur für die im Browser wirklich gelesenen Felder, oder die Prüfung im Browser aufgeben. Der zweite Weg widerspricht der Grundregel dieses Projekts und wird hier nicht empfohlen. Der erste ist eine eigene Aufgabe mit eigenem Nachweis, kein Nebeneffekt.

## Die Karte lädt erst, wenn sie gebraucht wird

Die Kartenseite überträgt beim Aufruf **14 KiB** JavaScript — nicht die 145 KiB der Kartenbibliothek. Die kommt erst, wenn die Karte tatsächlich angefordert wird.

Im selben Lauf ist geprüft, dass **keine einzige Kachel** vor der Zustimmung geholt wird. Das ist zugleich eine Datenschutzaussage: `tile.openstreetmap.org` sieht die IP-Adresse eines Besuchers erst, wenn er die Karte anfordert, und nicht schon beim Aufruf der Seite.

## Dateien und Größen der Auslieferung

Datei- und Verzeichniszahlen stehen in `docs/BUDGET_REPORT.md` und werden bei jedem CI-Lauf mit `npm run check:budgets` geprüft: 425 Dateien von 12.000, größte Datei 0,46 MiB von 25 MiB.

## Offen

- **Messung gegen die ausgelieferte Website.** Sobald es ein Deployment gibt, gehört derselbe Lauf gegen die echte Adresse wiederholt — mit Netz, mit Kompression, mit echten Laufzeiten.
- **Gedrosselte Messung.** Ein Lauf mit gedrosselter CPU und gedrosseltem Netz gäbe eine realistischere untere Schranke. Er ist vorbereitet, aber nicht Teil dieser Messung; ohne dokumentierte Drosselwerte wäre die Zahl nicht vergleichbar.
- **Felddaten.** Erst mit Besuchern. Vorher gibt es keine ehrliche LCP- oder INP-Aussage.
