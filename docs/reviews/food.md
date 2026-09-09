# Abnahme der Futterdarstellung

Durchgeführt am 2026-09-08 (M15-06). Geprüft wurde, ob die Futterseiten das zeigen, was sie zeigen dürfen — und ob erkennbar bleibt, was Etikettangabe, was Rechnung und was Werbung ist.

Dies ist eine **Darstellungsabnahme**, keine fachliche Freigabe von Fütterungsaussagen. Solche Aussagen gibt es hier nicht, und das ist der Kern der Sache.

## Prüfumfang

| | |
|---|---|
| Geprüfte Seiten | Futtersuche `/de-de/futter/` und vier Produktseiten |
| Automatisierte Prüfung | `npm run test:e2e:features` — 200 Tests, davon 24 aus dem Futterbereich |
| Inhaltsregeln | `tests/care-safety.test.ts` prüft die Futterseiten und -module mit denselben neun Mustergruppen wie Pflege und Spielzeug |
| Datenbestand | vier synthetische Produkte, `dataKind: "synthetic"` |

## Ergebnisse

### Kein Testsieger, kein Score

Auf keiner Futterseite steht ein Rang, eine Note oder eine Punktzahl. Ein E2E-Test liest den **behauptenden** Teil der Seite — ohne Ausschlussliste und Hinweisboxen, die die Wörter nennen dürfen, weil sie sie verneinen — und sucht nach „Testsieger“, „Score“, „Bestnote“, „Punktzahl“ und „Bewertung:“. Er findet nichts. Umgekehrt prüft derselbe Test, dass die Verneinung tatsächlich dasteht.

Der Grund steht in der Taxonomie: *„Aus lückenhaften Labeldaten entsteht keine Qualitätsaussage. Ein Score wäre eine Methodik, die niemand geprüft hat.“*

### Rohdaten sind vom Preisvergleich getrennt

Die Produktseite hat getrennte Abschnitte: **Deklarierte Nährwerte** als Tabelle mit Fundstelle, **Angebote** als eigener Abschnitt. Die Nährwerttabelle steht nicht im Angebotsteil, und der Angebotsteil rechnet nicht mit Nährwerten. Ein Test prüft beide Überschriften und die Zahl der Tabellen.

### Labelwerte tragen Einheit, Bezug und Quelle

Jede Zeile der Nährwerttabelle nennt Wert, Einheit, Bezug (Frisch- oder Trockenmasse) und die verlinkte Quelle mit Prüfdatum. Geprüft am Beispiel Protein: „22 g“, „je 100 g Frischmasse“, „Etikett“, „geprüft am 2026-09-07“.

### Unbekannt heißt unbekannt

Fehlende Angaben stehen als „nicht deklariert“ da — bei Lebensphase, Futterart und je Nährstoff. Darunter steht der Satz, auf den es ankommt: **eine fehlende Angabe ist keine Null.** Ein Test liest ihn.

### Menge und Preisstand

Die Menge steht verständlich: „1 kg“, „12 kg“ oder „6 × 400 g = 2,4 kg“. Der Grundpreis wird nur bei vollständiger Mengenangabe gerechnet (M15-02).

Ein **Preisstand** ist derzeit nirgends zu sehen, weil es kein Angebot mit Anzeigeerlaubnis gibt. Die Angebotskarte trägt ihn (`OfferCard.astro`, geprüft in M13-04); auf den Futterseiten erscheint stattdessen die Begründung, warum kein Angebot dasteht — einschließlich des Satzes, dass dies keine Aussage über den Markt ist.

## Offene Punkte

1. **Preisvergleich ungetestet im Echtbetrieb.** Ohne freigegebenes Warenprogramm (B-005) gibt es keine echten Angebote; der Grundpreisvergleich ist nur gegen synthetische Daten geprüft.
2. **Echte Etikettdaten fehlen.** Die vier Produkte sind erfunden. Sobald echte Produkte kommen, gilt derselbe Ablauf wie bei Pflege und Spielzeug: Angabe für Angabe mit Fundstelle (`docs/reviews/care-toys.md`).
3. **Anreicherung bleibt aus.** Open Pet Food Facts liefert die Nährwerte nicht, die es liefern müsste (`docs/OPFF_SPIKE.md`); der Adapter ist doppelt gesperrt.

---

# Entscheidung über die Futterquelle (M22-04, 2026-09-09)

Die Frage dieser Aufgabe: **welche offene Quelle trägt Futterdaten tatsächlich?** Nicht: welche klingt plausibel. Deshalb steht hier zu jeder geprüften Quelle, was gemessen wurde.

## Open Pet Food Facts — erneut gemessen

Der Machbarkeitslauf aus M15-04 stammt vom 08.09.2026. Eine Entscheidung auf einer ein Tag alten Zahl zu treffen ist in Ordnung; eine Entscheidung **auf einer Zahl zu belassen, die niemand mehr nachgesehen hat**, nicht. Deshalb wurde am 09.09.2026 der frische Export erneut heruntergeladen (`en.openpetfoodfacts.org.products.csv.gz`, 3.294.294 Byte, `last-modified: Wed, 09 Sep 2026 00:16:57 GMT`) und vollständig ausgezählt.

| Feld | alle 15.136 Produkte | mit Deutschlandbezug (1.516) |
|---|---|---|
| `code` (Barcode) | 15.136 (100 %) | 1.516 (100 %) |
| `product_name` | 12.153 (80 %) | 1.379 (90 %) |
| `brands` | 6.822 (45 %) | 1.154 (76 %) |
| `quantity` | 7.124 (47 %) | 1.237 (81 %) |
| `categories_tags` | 4.684 (30 %) | 320 (21 %) |
| `ingredients_text` | 2.825 (18 %) | **166 (10 %)** |
| `proteins_100g` | 241 (1 %) | **2 (0 %)** |
| `fat_100g` | 240 (1 %) | **2 (0 %)** |

Der Deutschlandbezug ist hier über `countries_tags` gezählt (`en:germany` oder `de:deutschland`) und fällt deshalb mit 1.516 etwas höher aus als die 1.281 aus M15-04. **An der Aussage ändert das nichts:** zwei Produkte mit Proteinwert bleiben zwei, ob man sie auf 1.281 oder auf 1.516 bezieht.

Neu mitgemessen wurde der Zutatentext, weil er ohne Nährwerte immerhin eine Angabe wäre: 10 Prozent der deutschen Produkte tragen ihn. Für eine Anzeige „Zusammensetzung laut Etikett“ auf jeder zehnten Produktseite lohnt sich keine zweite Quelle mit eigener Fehlerlage und Share-Alike-Pflicht.

## Weitere geprüfte Quellen

| Quelle | Abgerufen | Befund |
|---|---|---|
| **Feed Materials Register** (`feedmaterialsregister.eu`) | 09.09.2026, HTTP 200 | Register der **Einzelfuttermittel** nach Artikel 24 Absatz 6 der Verordnung (EG) Nr. 767/2009 — also der Rohstoffe, nicht der Fertigprodukte. Es enthält keine Produkte, keine Barcodes und keine Nährwerte je Handelsware. Für einen Produktkatalog ungeeignet; für die Prüfung einer Zutatenbezeichnung wäre es später einmal interessant. |
| **lebensmittelwarnung.de** (BVL und Länder) | 09.09.2026, HTTP 200 | Amtliche Rückrufe, maschinenlesbar als RSS (271 Meldungen im Bundesfeed). Die veröffentlichten **Produkttypen** sind Lebensmittel, Bedarfsgegenstände, kosmetische Mittel, Baby- und Kinderprodukte sowie Mittel zum Tätowieren — **Futtermittel ist keiner davon**. Von 271 Meldungen trug keine einen Futterbezug; der einzige Treffer einer Textsuche war ein Speisefisch. Als Quelle für Produktdaten ohnehin ungeeignet, und als Rückrufquelle für Heimtierfutter offenkundig nicht bestückt. `robots.txt` verlangt `Crawl-delay: 30`. |
| **BVL, Arbeitsbereich Futtermittel** | 09.09.2026, HTTP 200 | Behördenseiten zu Aufgaben und Kontrollprogrammen. Keine Produktdatenbank, kein Export. |

## Entscheidung

**Es bleibt bei synthetischen Futterdaten, und sie bleiben als solche gekennzeichnet.**

Der Grund ist nicht Bequemlichkeit, sondern die gemessene Lage: die einzige offene Quelle mit Produktbezug liefert genau das nicht, worauf es auf einer Futterseite ankommt — die deklarierten Nährwerte. Zwei von 1.516 ist keine Abdeckung, mit der man eine Seite baut; es ist eine Zahl, mit der man eine Seite baut, die in 99,9 Prozent der Fälle „nicht deklariert“ sagt und dafür eine Share-Alike-Pflicht auf den ganzen ausgelieferten Datensatz legt.

Was daraus folgt und im Code bereits so steht:

1. `content-data/food/synthetic-products.json` trägt `dataKind: "synthetic"`; `futterDatenArt()` gibt das aus, und die Futterseiten zeigen den Testdatenhinweis. Zwei Tests halten das fest (`tests/food/catalog.test.ts`, `tests/e2e-features/futter.spec.ts`).
2. Die Quelle `opff-products-csv-export` bleibt auf `status: "pending"` — erfasst, nicht freigegeben. Ohne Freigabe liefert der Build nichts aus.
3. Der Adapter bleibt hinter dem abgeschalteten Feature Flag `foodEnrichment`.

## Wann diese Entscheidung neu zu treffen ist

Nicht „irgendwann“, sondern an einer Zahl: **wenn `proteins_100g` bei den Produkten mit Deutschlandbezug 30 Prozent erreicht.** Dann trägt die Quelle für eine Nährwertanzeige mit ehrlicher Lückenkennzeichnung. Die Messung ist wiederholbar; der Befehl steht in `docs/OPFF_SPIKE.md`, die aktuellen Zahlen in `config/sources/opff.json`.

Unabhängig davon zu prüfen, sobald ein Warenprogramm freigegeben ist (B-005): der Trefferanteil zwischen den GTINs des Feeds und den 15.136 OPFF-Barcodes. Diese Zahl ist bis heute nicht messbar, weil es keinen Feed gibt — und sie wird nicht geschätzt.

