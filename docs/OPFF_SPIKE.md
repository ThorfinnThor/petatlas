# Machbarkeit: Open Pet Food Facts

Durchgeführt am 2026-09-08 (M15-04). Frage: Taugt Open Pet Food Facts (OPFF) als Zusatzquelle für Futterdaten — und wenn ja, wofür?

**Ergebnis in einem Satz:** Als Quelle für **Name, Marke und Menge zu einer GTIN** ist der Datensatz brauchbar; als **Nährwertquelle ist er es nicht** — bei den Produkten mit Deutschlandbezug tragen zwei von 1.281 einen Proteinwert.

## Bezugsweg

`robots.txt` von `world.openpetfoodfacts.org` verbietet `/api` und `/cgi` **für alle User-Agents**:

```
User-agent: *
Disallow: /api
Disallow: /cgi
Disallow: /facets
```

Systematische API-Abfragen unterbleiben deshalb. Bezogen wird ausschließlich der angebotene Export unter `/data`, der genau für diesen Zweck bereitsteht:

| Distribution | Größe (gzip) | Stand |
|---|---|---|
| `en.openpetfoodfacts.org.products.csv.gz` | 3,29 MB | 08.09.2026, 00:17 UTC |
| `openpetfoodfacts-products.jsonl.gz` | 20,22 MB | 08.09.2026, 00:15 UTC |
| `openpetfoodfacts-mongodbdump.gz` | 23,76 MB | 08.09.2026, 00:16 UTC |

Der CSV-Export ist klein genug für einen Build und wird täglich erneuert. Registriert ist er als `opff-products-csv-export` in `config/sources/opff.json` — mit `status: "pending"`, also ohne Veröffentlichungserlaubnis.

## Gemessene Abdeckung

Grundlage: der vollständige CSV-Export vom 08.09.2026, 15.136 Produkte, 210 Spalten. Gezählt wurde, wie oft ein Feld überhaupt gefüllt ist.

> **Nachgemessen am 09.09.2026 (M22-04).** Der frische Export ergibt dieselbe Lage: 15.136 Produkte, 1.516 mit Deutschlandbezug (über `countries_tags` gezählt, deshalb etwas mehr als unten), `proteins_100g` bei 2 davon. Die Tabelle in `docs/reviews/food.md` führt die neuen Zahlen; die Entscheidung ist dort begründet.

| Feld | alle Produkte | mit Deutschlandbezug (1.281) |
|---|---|---|
| `code` (Barcode) | 15.136 (100 %) | 1.281 (100 %) |
| `product_name` | 12.153 (80 %) | 1.165 (90 %) |
| `brands` | 6.822 (45 %) | 1.009 (78 %) |
| `quantity` | 7.124 (47 %) | 1.053 (82 %) |
| `categories_tags` | 4.684 (30 %) | 281 (21 %) |
| `proteins_100g` | **241 (1 %)** | **2 (0 %)** |
| `fat_100g` | **240 (1 %)** | **2 (0 %)** |
| `image_url` | 13.323 (88 %) | 839 (65 %) |

96 Prozent der Barcodes liegen im EAN-13-Format vor. Häufigste Marken mit Deutschlandbezug: Purina (38), ZooRoyal (36), Whiskas (35), Animonda (35), Sheba (32).

**Kein Trefferanteil gegen einen echten Feed.** Die Aufgabenbeschreibung verlangt eine Stichprobe gegen GTINs echter zulässiger Feedprodukte. Solche Produkte gibt es hier nicht: es besteht kein freigegebenes Warenprogramm (B-005), und ohne Feed gibt es keine GTIN-Liste, gegen die sich messen ließe. Diese Zahl wird deshalb **nicht geschätzt** und bleibt offen, bis ein Feed vorliegt. Die obigen Zahlen messen die Vollständigkeit **innerhalb** von OPFF und nicht die Überschneidung mit einem Sortiment.

## Lizenzfolgen

- Die Datenbank steht unter der **Open Database License**, einzelne Inhalte unter der Database Contents License. Das ist dieselbe Lage wie bei OpenStreetMap: Share-Alike für eine **abgeleitete Datenbank**, nicht für ein Produced Work. `docs/ODBL_DATAFLOW.md` beschreibt die Grenze bereits.
- **Produktbilder stehen unter CC BY-SA** und können zusätzlich Rechte Dritter enthalten (Verpackungsgestaltung, Marken). Sie werden nicht übernommen; `imagesAllowed` steht auf `false`.
- Attribution ist Pflicht: „Daten von Open Pet Food Facts, Mitwirkende, unter der Open Database License“.
- Open Food Facts sagt in den Nutzungsbedingungen ausdrücklich, dass es die **Richtigkeit der Daten nicht garantiert**: die Angaben stammen von Mitwirkenden und können Fehler enthalten. Für Nährwerte, die jemand auf ein Etikett schaut und abtippt, ist das eine ernste Einschränkung.

## Folgerung für M15-05

Der Adapter wird gebaut, aber **hinter einem abgeschalteten Feature Flag** — mit dieser Begründung:

1. **Nährwerte sind nicht da.** Zwei von 1.281 deutschen Produkten reichen für nichts. Der Futterbereich bleibt deshalb bei Händler- und Herstellerangaben.
2. **Name, Marke und Menge sind bereits im Händlerfeed.** OPFF würde dort wenig ergänzen und eine zweite Quelle mit eigener Fehlerlage hinzufügen.
3. **Share-Alike ist nicht kostenlos.** Eine Anreicherung machte den ausgelieferten Datensatz zu einer abgeleiteten Datenbank mit ODbL-Pflichten — für einen geringen Zugewinn.

Der sinnvolle Rest: OPFF als **Nachschlagemöglichkeit über die GTIN**, wenn ein Produkt sonst gar nicht auffindbar ist. Das ist ein Fallback, keine Pflichtdatenbank — und genau so wird es in M15-05 umgesetzt.

## Was zu tun wäre, um den Flag einzuschalten

1. Ein freigegebenes Warenprogramm (B-005), damit es echte GTINs gibt.
2. Die Stichprobe nachholen: wie viele Sortiments-GTINs finden sich in OPFF, und mit welchen Feldern?
3. Rechteprüfung abschließen (`status: "verified"`), einschließlich der Frage, ob die öffentliche JSON-Auslieferung angereicherter Daten gewollt ist — sie zieht ODbL-Pflichten nach sich.
