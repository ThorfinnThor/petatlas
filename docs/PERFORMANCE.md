# Leistungsmessung

Gemessen am **2026-09-08** und erneut am **2026-09-09** nach M22-02, lokal: Apple Silicon, Node 24.19.0, Chromium aus Playwright, gegen den gebauten Output über `astro preview` auf `localhost`. Alle Funktionen waren eingeschaltet (`ENABLE_FEATURES=costs,map,travel,commerce,care,toys,food,profile`), damit die Seiten mit der meisten Logik überhaupt existieren.

Wiederholen: `npm run test:performance`

## Was diese Zahlen sind — und was nicht

**Sie sind Bytes, Knoten und Zeiten eines lokalen Aufrufs.** Kein Netz, kein echtes Gerät, keine echten Nutzer.

Ausdrücklich **nicht** enthalten:

- **Kein Lighthouse-Score.** Lighthouse ist keine Abhängigkeit dieses Projekts, und eine Zahl aus einem Lauf ohne dokumentierte Bedingungen sagt wenig. Wer einen Score braucht, misst ihn gegen die ausgelieferte Website — die es noch nicht gibt.
- **Keine Felddaten.** LCP und INP, wie sie zählen, kommen von echten Besuchern auf echten Geräten. Es gibt keine Besucher. Die unten genannten LCP-Werte stammen vom Browser selbst auf einem lokalen Server und sind damit eine **untere Schranke**, gegen die kein Budget geprüft wird. Sie stehen hier, weil eine gemessene untere Schranke ehrlicher ist als eine geschätzte Zahl.
- **Keine Kompression.** Der Vorschau-Server komprimiert nicht. Die Auslieferung tut es; die gemessenen Bytes sind also die ungünstigste Zahl.

## Gemessen je Seite

Identische Werte für Desktop- und Mobilprofil, weil dieselben Dateien ausgeliefert werden; der Unterschied läge im Netz und im Gerät, und beides wird hier nicht nachgebildet.

Zwei Läufe, weil sich dazwischen etwas Wesentliches geändert hat: M22-02 hat die Schemabibliothek aus dem Browser genommen.

| Seite | JavaScript vorher | JavaScript nachher | Gesamt vorher | Gesamt nachher | DOM-Knoten | LCP (untere Schranke) |
|---|---|---|---|---|---|---|
| Start | 3,4 KiB | **3,4 KiB** | 66,2 KiB | 66,2 KiB | 169 | 28 ms |
| Kostenrechner | 98,0 KiB | **13,4 KiB** | 162,1 KiB | 77,5 KiB | 185 | 28 ms |
| Karte | 14,7 KiB | **14,7 KiB** | 91,0 KiB | 91,0 KiB | 406 | 32 ms |
| Reisecheck | 113,8 KiB | **23,2 KiB** | 183,9 KiB | 93,4 KiB | 264 | 32 ms |
| Futter | 95,6 KiB | **7,6 KiB** | 155,2 KiB | 67,2 KiB | 129 | 28 ms |

Budgets: JavaScript Warnung ab 60 KiB, Stopp ab 150 KiB. Seitengröße Warnung ab 400 KiB, Stopp ab 900 KiB. DOM-Knoten Warnung ab 1.500, Stopp ab 3.000. **Seit M22-02 liegt keine Seite mehr über der JavaScript-Warnschwelle**; vorher waren es drei.

## Woher das JavaScript kommt

Stand nach M22-02, gemessen an den ausgelieferten Dateien:

| Datei | Roh | Komprimiert | Wann |
|---|---|---|---|
| `leaflet-src.*.js` (Karte) | 145,3 KiB | 42,0 KiB | erst auf Klick |
| `Travel.*.js` (Reisecheck) | 22,2 KiB | 8,3 KiB | beim Laden |
| `Map.*.js` (Trefferliste) | 13,2 KiB | 5,7 KiB | beim Laden |
| `Toys.*.js` (Finder) | 11,3 KiB | 4,1 KiB | beim Laden |
| `Profile.*.js` | 10,0 KiB | 3,8 KiB | beim Laden |
| `Costs.*.js` (Rechner) | 9,9 KiB | 3,9 KiB | beim Laden |
| `runtime-guards.*.js` | 2,9 KiB | — | beim Laden, wo geprüft wird |
| Alle Stile zusammen | 45,5 KiB | 10,3 KiB | beim Laden |

**Die Schemabibliothek ist weg.** Sie belegte 85 KiB roh (23 KiB komprimiert) in jeder Seite, die Daten nachlädt. An ihrer Stelle stehen 2,9 KiB handgeschriebene Prüfungen (`src/domain/runtime-guards.ts`).

### Wie das ging, ohne die Prüfung aufzugeben

Die alte Fassung prüfte im Browser zweierlei, und nur eines davon musste dort geprüft werden:

1. **Daten, die zur Bauzeit feststehen** — Taxonomien, Reiseregeln, Freigaben, Packliste, Futterdatensatz, Produkteigenschaften. Sie sind in den Build eingebaut und können sich zwischen Build und Seitenaufruf nicht ändern. Sie werden jetzt **zur Bauzeit** geprüft: `npm run check:content` hält 17 Dateien gegen dieselben Schemas und läuft in `npm run verify` und in der CI. Eine kaputte Datei bricht damit den Lauf ab, statt in einer fremden Browsersitzung aufzufallen. Das ist nicht weniger Prüfung, sondern eine frühere.
2. **Daten, die zur Laufzeit ankommen** — nachgeladene Gebührenchunks, der lokale Speicher, eine vom Nutzer gewählte Importdatei. Die werden weiterhin im Browser geprüft, jetzt mit handgeschriebenen Prüfungen ohne Abhängigkeit.

Dass die kleine Fassung dasselbe sagt wie das Schema, ist keine Behauptung: `tests/runtime-guards.test.ts` legt beiden dieselben Werte vor — alle 1.006 echten Gebührenpositionen und rund 250 gezielt kaputt gemachte Fassungen von Profil, Merkliste, Packstand und Exportdatei — und verlangt dasselbe Urteil. Weichen sie ab, ist der Test rot.

Nebenbefund aus genau diesem Vergleich: die handgeschriebene Prüfung war beim Datum **strenger** als das Schema. `2022-13-01` passierte die alte Schemaprüfung, weil sie nur die Form prüfte. Jetzt prüfen beide den Tag.

Damit die Bibliothek nicht unbemerkt zurückkehrt, sucht `npm run check:dist` in jeder ausgelieferten `.js`-Datei nach ihren Spuren. Ein Import in Browsercode fällt damit sofort auf und nicht erst bei der nächsten Messung.

## Die Karte lädt erst, wenn sie gebraucht wird

Die Kartenseite überträgt beim Aufruf **14 KiB** JavaScript — nicht die 145 KiB der Kartenbibliothek. Die kommt erst, wenn die Karte tatsächlich angefordert wird.

Im selben Lauf ist geprüft, dass **keine einzige Kachel** vor der Zustimmung geholt wird. Das ist zugleich eine Datenschutzaussage: `tile.openstreetmap.org` sieht die IP-Adresse eines Besuchers erst, wenn er die Karte anfordert, und nicht schon beim Aufruf der Seite.

## Dateien und Größen der Auslieferung

Datei- und Verzeichniszahlen stehen in `docs/BUDGET_REPORT.md` und werden bei jedem CI-Lauf mit `npm run check:budgets` geprüft. Im Lauf vom 09.09.2026: 2.836 Dateien von 12.000 (die 1.006 Gebührenseiten aus M20-01 sind darin enthalten), größte Datei weit unter der Grenze, alle Budgets eingehalten.

## Offen

- **Messung gegen die ausgelieferte Website.** Sobald es ein Deployment gibt, gehört derselbe Lauf gegen die echte Adresse wiederholt — mit Netz, mit Kompression, mit echten Laufzeiten.
- **Gedrosselte Messung.** Ein Lauf mit gedrosselter CPU und gedrosseltem Netz gäbe eine realistischere untere Schranke. Er ist vorbereitet, aber nicht Teil dieser Messung; ohne dokumentierte Drosselwerte wäre die Zahl nicht vergleichbar.
- **Felddaten.** Erst mit Besuchern. Vorher gibt es keine ehrliche LCP- oder INP-Aussage.
