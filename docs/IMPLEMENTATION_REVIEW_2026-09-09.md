# Umsetzung: Gebühren, Reise und Nahrungsergänzung

Auftrag: Rechner und Reisecheck behalten, belegbare Sonderfälle einbauen, Nahrungsergänzungsseite ergänzen und Amazon/Awin priorisieren. Betreiberangaben sind ausdrücklich zurückgestellt.

## Gebühren

Die Quellenprüfung umfasst GOT §§ 2–6 und § 12 UStG. Neu: ausdrückliche Bestätigung eines mit der Praxis geklärten Sonderfalls, abweichende Faktoren, Erlass der Notdienstgebühr, bestätigte Steuerbehandlung (19/7/keine Umsatzsteuer). Ohne Sonderfall gelten unverändert die Standardgrenzen. Die Ausgabe nennt angewandte Abweichungen. Bei Beratung zusätzlich zu einer Leistung „mit Beratung“ wird auf mögliche Doppelbewertung hingewiesen.

Die Anwendung entscheidet nicht automatisch, ob ein Betrieb, Tier, Vertrag oder Eingriff eine gesetzliche Ausnahme erfüllt. § 3 unterscheidet öffentlich angeordnete/geförderte Leistungen und Zuschläge; § 5 enthält Textformvereinbarungen sowie besondere Ausnahmen. Diese werden erklärt und lassen sich mit den bestätigten Praxiswerten berechnen. 7 % ist ausdrücklich kein allgemeiner Nutztiersteuersatz. Gemischte Steuersätze, vollständige medizinische Kombinationsregeln und die individuelle Rechnung einer Praxis bleiben außerhalb der automatischen Berechnung. Rundung bleibt unverändert je Einzelgebühr vor Menge; die Implementierung behauptet dafür keine ausdrücklich gesetzlich vorgeschriebene Reihenfolge.

Quellen: [GOT § 3](https://www.gesetze-im-internet.de/got_2022/__3.html), [§ 4](https://www.gesetze-im-internet.de/got_2022/__4.html), [§ 5](https://www.gesetze-im-internet.de/got_2022/__5.html), [§ 6](https://www.gesetze-im-internet.de/got_2022/__6.html), [UStG § 12](https://www.gesetze-im-internet.de/ustg_1980/__12.html). §§ 3 und 6 sind gegenüber der ersten Vorprüfung inzwischen lesbar belegt.

## Reise

Neu ausgewertet werden Chipkonformität oder geeignetes mitgeführtes Lesegerät, Vollständigkeit/Gültigkeit des Passes, Beginn und Abschluss der Impfserie, Ablaufdatum und rechtzeitige Auffrischung. Das Mindestalter wird gegen den ersten Impftermin gerechnet. Ein abgelaufener Impfstatus oder unvollständiger Pass wird nicht als erfüllt dargestellt. Die Chipdatum-Eingabe umfasst dokumentiertes Ablesen vor der Impfung. Ältere Passmodelle und Kennzeichnungsübergänge werden nicht pauschal für ungültig erklärt. Artikel 6 der Verordnung 2026/705 wurde im amtlichen PDF gelesen: das EU-Passmodell nach 577/2013 bleibt bei Ausstellung vor 01.01.2028 im dort bezeichneten innergemeinschaftlichen Umfang anerkannt. Die Oberfläche nennt diesen Übergang ausdrücklich.

Frankreich: bestätigte Kategorie 1 erzeugt ein negatives Ergebnis auch bei erfüllten Gesundheitsangaben; Kategorie 2 und unklare Einstufung bleiben klärungsbedürftig. Österreich: Länder-/Gemeindezuständigkeit mit amtlicher Quelle. Niederlande: NVWA-Einreisehilfe plus klar als kommunales Beispiel gekennzeichnete Amsterdamer Leinenregel. Italien: die gefundene Verlängerung galt zwölf Monate ab 04.09.2025; eine Fortgeltung nach diesem Zeitraum ist nicht belegt und wird nicht erfunden. Die vier Länderinformationen sind auf den jeweiligen Zielseiten eingebunden. Ihre Inhalte fließen in die Änderungssignatur ein.

[EU 2026/131](https://eur-lex.europa.eu/eli/reg_del/2026/131/oj/eng), [Kommissionsübersicht](https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets/travelling-pet-within-eu_en), [Frankreich](https://www.service-public.gouv.fr/particuliers/vosdroits/F35788), [Österreich](https://www.oesterreich.gv.at/de/themen/reisen_und_freizeit/haustiere/1/Seite.741010), [NVWA](https://www.nvwa.nl/onderwerpen/dier/op-reis-met-mijn-huisdier), [Italien: amtlicher Verlängerungstext](https://www.gazzettaufficiale.it/atto/vediMenuHTML?atto.codiceRedazionale=25A04616&atto.dataPubblicazioneGazzetta=2025-08-20&tipoSerie=serie_generale&tipoVigenza=originario).

## Nahrungsergänzung und Partner

Neue Seite `/de-de/nahrungsergaenzung/`, erreichbar über Produktnavigation, Footer und Futterseite. Inhalt: vier Produktgruppen, Deklarations-Checkliste, Quellen, Grenzen von Ergänzungen und Hinweise zu Humanpräparaten. Vergleichsrechner mit Dezimalkomma, Fehlerbehandlung und Preis/Reichweite für zwei bereits festgelegte Tagesmengen. Keine Dosierungsempfehlung, kein erfundener Testsieger und keine unzugelassenen Affiliate-Links.

Partnerstrategie und Bewerbungsreihenfolge: `docs/AFFILIATE_PLAN.md`. Amazon zuerst, Zooplus DE und Medpets DE über Awin als Ergänzung. Keine Anmeldung oder Nachricht an Händler versandt.

## Status

Die Änderungen sind eine quellenbasierte technische Umsetzung. Persönliche Fachfreigaben und Betreiberangaben wurden nicht erfunden. Offene örtliche oder individuelle Einordnungen bleiben sichtbar; insbesondere ist Italien nicht als vollständig aktuell geprüft markiert. Der Reisecheck erteilt keine pauschale Reisegenehmigung.

## Technische Nachweise

Lokal: `npm run verify` mit 1.448 bestandenen Tests in 95 Dateien sowie allen weiteren Prüfschritten; `npm run build:app` mit 15 bestandenen Schritten. Browser manuell: Dezimalkomma 19,95/100/2 ergibt 50 Tage und 0,40 Euro/Tag; Nullmenge wird abgewiesen; unbestätigte Sonderabrechnung liefert keine Tabelle; bestätigter Faktor 4,5 bei 23,62 Euro ergibt 126,49 Euro brutto; abgelaufene Impfung und Frankreich-Kategorie-1-Ausschluss werden sichtbar. Sechs neue CI-Browserfälle decken die Abläufe bei 390 und 1280 Pixeln ab. Vollständigen CI-Status der finalen Revision vor Integration in [PR 8](https://github.com/ThorfinnThor/petatlas/pull/8) prüfen.
