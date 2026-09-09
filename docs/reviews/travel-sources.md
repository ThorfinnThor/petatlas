# Quellenprüfung Reiseregeln

Durchgeführt am 2026-09-07 (M12-03). Geprüft wurde, **welche Rechtsgrundlage aktuell gilt** und was sie für den Umfang von Fassung v1 verlangt.

Dies ist eine Quellen- und Aktualitätsprüfung, **keine fachliche Freigabe**. Keine der vorbereiteten Regeln ist freigegeben; die Regelmaschine wertet sie deshalb nicht aus (M12-06).

## Der wichtigste Befund

Die Verordnung **(EU) Nr. 576/2013** ist nicht mehr die geltende Grundlage. Sie wurde durch Artikel 270 Absatz 2 der Verordnung (EU) 2016/429 mit Wirkung ab dem 21. April 2021 aufgehoben und galt nach Artikel 277 nur noch **bis zum 21. April 2026** weiter. Seit dem **22. April 2026** gilt die **Delegierte Verordnung (EU) 2026/131** der Kommission vom 20. Januar 2026 (ABl. L, 2026/131, 27.3.2026), Artikel 33.

Das ist genau der Fall, vor dem die Aufgabenbeschreibung warnt: aus dem Gedächtnis oder aus älteren Texten hätte man 576/2013 übernommen — und wäre um eine ganze Verordnung danebengelegen.

## Tatsächlich gelesene Quellen

| Quelle | Abgerufen | Befund |
|---|---|---|
| EUR-Lex, Delegierte Verordnung (EU) 2026/131, deutsche Fassung (`CELEX:32026R0131`) | 2026-09-07 | Status „In force“. Artikel 3, 7, 8, 11 tragen die Anforderungen für Verbringungen zwischen Mitgliedstaaten; Artikel 33 nennt den Anwendungsbeginn 22.04.2026. |
| Europäische Kommission, „Travelling with a pet within the EU“ | 2026-09-07 | Zusammenfassung der Kommission zu denselben Anforderungen, einschließlich der Gültigkeitsanforderungen aus Anhang VII Teil 1 der Delegierten Verordnung (EU) 2020/688 und des Passmodells nach Anhang I Teil 1 der Durchführungsverordnung (EU) 2026/705. |
| Europäische Kommission, „EU countries' specific information“ | 2026-09-07 | Liste der nationalen Informationsseiten. Von dort stammen die vier unten genannten Zielstaatsquellen. |
| Österreich, Sozialministerium, „Movement of pet dogs, cats or ferrets …“ | 2026-09-07, erneut 2026-09-09 | **Nicht aktuell:** verweist weiterhin auf die Verordnung (EU) Nr. 576/2013 und auf Regeln „seit 29.12.2014“. Adresse siehe unten. |
| Niederlande, NVWA, „Bringing pets into the Netherlands“ (englisch) | 2026-09-07, erneut 2026-09-09 | Übersichtsseite: verweist auf die harmonisierten EU-Regeln, ohne Fundstellen zu nennen. |
| Niederlande, NVWA, „Op reis met mijn huisdier“ (niederländisch) | 2026-09-09 | **Aktuell:** nennt als Rechtsgrundlage die Verordnungen (EU) 2016/429, **2026/131**, 2026/636 und 2026/705. |
| Frankreich, Ministère de l'Agriculture, „Rage : informations grand public et voyageurs“ | 2026-09-07 | Stand 23. Juni 2026. Nennt Kennzeichnung und gültige Tollwutimpfung, wobei die Impfung nach Abgleich von Kennzeichnung und Papieren erfolgt sein muss. Verlinkt für Reisen innerhalb der EU ein Merkblatt von Juni 2020. |
| Italien, Ministero della Salute | 2026-09-07 | **Nicht gelesen.** Die Seite liefert eine Bot-Prüfung („Site verification“) statt des Inhalts. Sie wurde nicht umgangen; der Inhalt muss von Hand gelesen werden. |

## Was daraus vorbereitet wurde

`content-data/travel/rules/eu-intra-2026.json` — ein Regelsatz mit fünf Anforderungen, aus dem 40 Einzelregeln entstehen (4 Ziele × 2 Tierarten × 5 Anforderungen):

| Anforderung | Fundstelle | Bedingung |
|---|---|---|
| `microchip` | Artikel 7 Absatz 1 Buchstabe a | Kennzeichnung durch injizierbaren Transponder nach Artikel 70 der Delegierten Verordnung (EU) 2019/2035 |
| `rabies-vaccination` | Artikel 8 Buchstabe a i. V. m. Anhang VII Teil 1 der Delegierten Verordnung (EU) 2020/688 | mindestens 21 Tage zwischen Erstimpfung und Reisetag; bei der Impfung mindestens zwölf Wochen alt; Impfung nicht vor der Kennzeichnung |
| `identification-document` | Artikel 11 | gültiger EU-Heimtierausweis, ausgestellt von einer ermächtigten Tierärztin oder einem ermächtigten Tierarzt |
| `owner-accompanied` | Artikel 3 i. V. m. Artikel 4 | Verbringung zu nichtkommerziellen Zwecken in Begleitung der Halterin oder des Halters |
| `max-five-animals` | Artikel 3 i. V. m. Artikel 246 Absatz 1 der Verordnung (EU) 2016/429 | höchstens fünf Tiere |

Die zwölf Wochen sind in der Bedingung als 84 Tage gerechnet. Das ist eine Umrechnung, keine eigene Regel — sie gehört in die fachliche Prüfung.

## Was bewusst nicht vorbereitet wurde

- **Bandwurmbehandlung** (Artikel 10): nur für Finnland, Irland, Malta, Nordirland und Norwegen. Keines dieser Gebiete liegt im Umfang von v1, deshalb entsteht dafür keine Regel — und keine Regel, die stillschweigend „nicht nötig“ sagt.
- **Junge Tiere** (Artikel 9): der Umfang schließt Tiere unter zwölf Monaten aus.
- **Ermächtigte Person statt Halter** (Artikel 4): außerhalb des Umfangs von v1.
- **Nationale Sonderregeln** der vier Zielstaaten, etwa Rasse- oder Leinenvorschriften: dafür reichen die gelesenen Seiten nicht. Die österreichische Seite ist veraltet, die niederländische zu knapp, die italienische war nicht lesbar. Das ist ein offener Punkt, kein stillschweigendes „gibt es nicht“.

## Offene Punkte für die fachliche Prüfung (M12-06)

1. Stimmt die Umrechnung „zwölf Wochen = 84 Tage“ mit der Auslegung der Anhänge überein?
2. Sind die Übergangsregeln für ältere Ausweise und Tätowierungen für den geprüften Fall erheblich, oder genügt der jetzige Zuschnitt?
3. Welche nationalen Sonderregeln gelten in AT, FR, IT und NL zusätzlich — insbesondere Rasse- und Leinenvorschriften?
4. Ist die italienische Quelle inhaltlich deckungsgleich mit der EU-Zusammenfassung? Sie konnte nicht automatisiert gelesen werden.
5. Ab wann sind die nationalen Seiten auf die Delegierte Verordnung (EU) 2026/131 umgestellt? Wann der Wechsel kommt, bleibt offen; **dass** er bemerkt wird, ist seit M17-03 geklärt: `config/watchlist/rule-sources.json` und der tägliche Lauf `source-check.yml` vergleichen die Seiten mit dem festgehaltenen Stand und melden jede Änderung.

## Was die Beobachtung am 2026-09-08 ergeben hat

| Seite | Befund |
|---|---|
| EUR-Lex, CELEX:32026R0131 | **Nicht automatisiert prüfbar.** Ein einfacher Abruf bekommt HTTP 202 mit leerem Körper. Nicht umgangen; die Rechtsgrundlage bleibt eine Sache der Sichtung von Hand. |
| Kommission, „Travelling with a pet within the EU“ | Lesbar, Vergleich läuft. |
| Frankreich, `agriculture.gouv.fr` | Lesbar, antwortet sogar mit ETag und Last-Modified. |
| Italien, `salute.gov.it` | **Nicht prüfbar.** Weiterhin die Bot-Prüfung von 2026-09-07; der Marker „Ministero della Salute“ fehlt in der Antwort. |
| Österreich, Niederlande | **Beobachtet seit 2026-09-09 (M22-03).** Adressen und Befunde stehen im Abschnitt darunter. |

---

## Nachtrag 2026-09-09 (M22-03): Adressen für Österreich und die Niederlande

Bis hierher fehlten für zwei der vier Zielstaaten die Adressen. Der Grund war nicht Nachlässigkeit, sondern eine Regel: eine **geratene** Adresse zu beobachten ist schlechter als keine, weil sie jahrelang „unverändert“ meldet, ohne je die richtige Seite gelesen zu haben. Am 2026-09-08 waren zwei plausible Adressen probiert worden — beide 404.

### Wie die Adressen gefunden wurden

Nicht durch Raten, sondern aus dem Verzeichnis der Kommission: **„EU countries' specific information“** listet je Mitgliedstaat die offizielle nationale Seite. Diese Verzeichnisseite wurde am 2026-09-09 abgerufen (HTTP 200) und die beiden Adressen daraus ausgelesen. Sie steht seitdem selbst auf der Beobachtungsliste — ändert sie sich, können sich die Landesadressen geändert haben.

Vier weitere naheliegende Adressen wurden vorher probiert und antworteten alle mit **404**: `sozialministerium.gv.at/…/Reisen-mit-Heimtieren.html`, `oesterreich.gv.at/…/Seite.320900.html`, `nvwa.nl/onderwerpen/honden-katten-en-fretten` und `english.nvwa.nl/topics/dogs-cats-and-ferrets`. Sie sind hier genannt, damit niemand sie noch einmal probiert und für belegt hält.

### Österreich

`https://www.sozialministerium.at/en/Topics/Health/Information-for-travellers/Movement-of-pet-dogs,-cats-or-ferrets-between-Member-states-of-the-EU,-the-EEA-and-Switzerland.html`

Abgerufen am 2026-09-09, HTTP 200, Marker `Movement of pet dogs, cats or ferrets` gefunden. Gelesen: die Seite nennt weiterhin die **Verordnung (EU) Nr. 576/2013** und Regeln „seit 29.12.2014“.

**Was daraus folgt.** Die offizielle österreichische Auskunft steht auf einer Grundlage, die seit dem 22. April 2026 nicht mehr gilt. Das macht die Seite **nicht** zur Grundlage für Regeln — es macht sie zu einem Beobachtungsgegenstand: eine Änderung wäre das Zeichen, dass Österreich nachgezogen hat. Für den Regelsatz gilt weiterhin die Delegierte Verordnung (EU) 2026/131; nationale österreichische Sonderregeln bleiben ungeprüft und sind in `content-data/travel/scope.json` ausdrücklich nicht abgedeckt.

### Niederlande

`https://www.nvwa.nl/onderwerpen/dier/op-reis-met-mijn-huisdier`

Abgerufen am 2026-09-09, HTTP 200, Marker `Op reis met mijn huisdier` gefunden. Gelesen: die Seite nennt unter „Waar staat dit in de wet?“ die Verordnungen **(EU) 2016/429, 2026/131, 2026/636 und 2026/705**.

**Was daraus folgt.** Das ist die erste nationale Quelle, die die Grundlage des Regelsatzes unabhängig bestätigt — und sie nennt zwei Rechtsakte mehr, als bisher erfasst sind: 2026/636 und 2026/705. Die Durchführungsverordnung 2026/705 (Passmodell) ist im Regelsatz bereits als Fundstelle genannt; **2026/636 ist bisher nirgends geprüft** und gehört in die fachliche Prüfung (M12-06) als offener Punkt.

Die englische Fassung (`english.nvwa.nl/topics/travelling-to-the-netherlands-with-your-dog-or-cat`, HTTP 200) ist eine Übersichtsseite ohne diese Fundstellen und wird deshalb nicht gesondert beobachtet.

### Stand der Beobachtungsliste danach

Acht Einträge. Der Lauf vom 2026-09-09 (`node scripts/monitor/source-drift.ts --fetch`, zweimal ausgeführt) meldet für alle drei neuen Einträge zuerst `neu` und danach `unveraendert` — der Marker wurde also tatsächlich gefunden, nicht nur die Adresse erreicht. Unverändert offen bleiben zwei Einträge, die sich einem einfachen Abruf entziehen: EUR-Lex antwortet mit HTTP 202 und leerem Körper, das italienische Gesundheitsministerium mit einer Bot-Prüfung. Beide melden `nicht_pruefbar` statt `unveraendert`; umgangen wird nichts.
