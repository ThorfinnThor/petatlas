# Fach- und Rechtsvorprüfung PetAtlas

Historischer Vorprüfstand: Die nachfolgende technische Umsetzung ist in `docs/IMPLEMENTATION_REVIEW_2026-09-09.md` dokumentiert. Dieser frühere Bericht erteilt weiterhin keine persönliche Freigabe.

Stand: 09.09.2026. Prüfbasis: Anwendung auf Commit `9f2cb42`, ergänzt um die Klarstellungen im Branch `codex/fach-rechts-vorpruefung`. Methode: Quellcode- und Dokumentenprüfung durch Codex sowie Abgleich mit den unten verlinkten Originalquellen. **Keine persönliche Fach- oder Rechtsfreigabe erteilt.**

Die fachlichen Freigaben sind eine Anforderung dieses Projekts. Dieser Bericht behauptet keine allgemeine gesetzliche Pflicht, jede Informationswebsite vor Veröffentlichung durch einen Anwalt oder Tierarzt freigeben zu lassen. Die tatsächliche Anwendbarkeit der einzelnen Gesetze ist gesondert zu bestimmen.

## Ergebnis und umgesetzte Korrekturen

- Die Anwendung erklärt jetzt vor der Kostenberechnung die nicht abgebildeten Sonderfälle, mögliche Doppelbewertungen und die Bedeutung der Mengeneinheit.
- Der Reisecheck erklärt Abschluss der Erstimpfung, Gültigkeit am Reisetag, lückenlose Auffrischung und die gemeinsame Tierzahl im Fahrzeug.
- Die Unterlagen unterscheiden Endgerätezugriffe von personenbezogenen Datenübermittlungen. Ein Karten-Klick allein beweist keine wirksame Einwilligung.
- Die Rechtsprüfliste nennt die Voraussetzungen und Ausnahmen des § 36 VSBG. Sie behandelt BFSG-Anwendbarkeit als offene Prüfung.
- Die Launch-Anleitung verlangt nur die zum aktivierten Funktionsumfang gehörenden Gates. Werbung, Versicherung und Affiliatehandel dürfen ausgeschaltet bleiben.

Die Freigabedateien wurden nicht auf „approved“ gesetzt. Die nachfolgenden offenen Punkte haben weder eine benannte prüfende Person noch eine dokumentierte Entscheidung.

## Gebührenrechner: konkreter Abnahmeauftrag

| Entscheidung | Quellenbefund / Umsetzung | Noch zu entscheiden |
|---|---|---|
| Faktor und Notdienst | Regulär 1–3; Notdienst 2–4 und grundsätzlich 50 € je Angelegenheit. Reguläre Sprechstunden sind gesondert abzugrenzen. | Ist die manuelle Kontextwahl samt Hinweisen ausreichend? Ausnahmen und Vereinbarungen bleiben unberechnet. |
| Steuer und Katalogumfang | 19 % ist eine Rechenannahme. § 12 Abs. 2 Nr. 4 UStG sieht Ausnahmen für bestimmte Tierzucht-/Aufzuchtleistungen vor. Der Katalog enthält auch Nutztiere. | Vor Abnahme verbindlich entscheiden: Katalog auf unterstützte Leistungen begrenzen oder abweichende Behandlung implementieren. Ein Hinweis allein ist noch keine Abnahme des gesamten Katalogs. |
| Enthaltene Leistungen | Der Rechner verhindert identische Positionen, hat aber keine fachliche Tabelle zu enthaltenen Teilleistungen. | Genügt freie Zusammenstellung mit deutlich benannter Grenze, oder ist eine Kombinationstabelle erforderlich? |
| Rundung | Implementiert: Basis × Faktor auf Cent runden, danach Menge. | Rundungsreihenfolge fachlich bestätigen; nicht als ausdrücklich gesetzlich vorgeschrieben darstellen. |
| Vorlagen | Beratung Nr. 1 und Untersuchung Hund Nr. 16 sind ungeprüft. | Jede Vorlage einzeln mit Leistungsumfang und Ausschlüssen abnehmen. |

Quellen: [GOT § 2](https://www.gesetze-im-internet.de/got_2022/__2.html), [GOT § 4](https://www.gesetze-im-internet.de/got_2022/__4.html), [GOT einschließlich Anlage](https://www.gesetze-im-internet.de/got_2022/BJNR140100022.html), [UStG § 12](https://www.gesetze-im-internet.de/ustg_1980/__12.html). Die Einzelabrufe von GOT §§ 3 und 6 scheiterten; deren vertiefte Auslegung ist mit dem Volltext/Snapshot durch die prüfende Person nachzuholen.

Prüffälle mit unabhängig herzuleitendem Sollwert:

| Eingabe | Erwartung nach der derzeitigen Rechenannahme |
|---|---|
| Basis 23,62 €, Faktor 1, Menge 1, regulär | Netto 23,62 €, Steuer 4,49 €, Brutto 28,11 € |
| Basis 23,62 €, Faktor 2, Menge 1, Notdienst | Netto inklusive 50 € Gebühr 97,24 €, Steuer 18,48 €, Brutto 115,72 € |
| Basis 23,62 €, Faktor 1,01, Menge 2 | Positionsnetto 47,72 €; Rundung erst nach Mengenausweitung ergäbe 47,71 €. Diese Differenz ausdrücklich entscheiden. |
| Zwei Tiere, eine Angelegenheit, Notdienst | Notdienstgebühr einmal; keine automatische Verdopplung je Tier |
| Enthaltene Teilleistung plus Hauptleistung | Derzeit kein automatischer fachlicher Ausschluss; als Grenze abnehmen oder vor Freigabe korrigieren |

## Reisecheck: konkreter Abnahmeauftrag

Der gelesene Text von [Verordnung (EU) 2026/131](https://eur-lex.europa.eu/eli/reg_del/2026/131/oj/eng) bestätigt Art. 7/8/11 als zentrale Stellen. Art. 7 verweist sowohl auf Art. 70 als auch auf technische Anforderungen in Art. 70a der Verordnung 2019/2035. Die derzeitige Anleitung nennt nur Art. 70. Außerdem enthält Art. 11 Anforderungen an Unterschrift, Ausstellung und gewöhnlichen Aufenthalt des Halters. Die einfache Frage nach dem Vorliegen eines Passes prüft diese nicht vollständig. **Vor Freigabe müssen Prüftiefe und Eingaben hierzu entschieden werden.**

Die [Kommissionsübersicht](https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets/travelling-pet-within-eu_en) erläutert die Wartezeit nach vollständiger Erstimpfung, fortbestehende Gültigkeit bei rechtzeitiger Auffrischung sowie Kennzeichnung oder dokumentiertes Chipablesen vor der Impfung. Der Rechner verlangt bisher das Kennzeichnungsdatum; der alternative Ablesefall ist nicht gesondert modelliert. Bei mehrteiligen Erstimpfungen muss auch das Mindestalter beim maßgeblichen Impftermin fachlich überprüft werden.

[2026/636](https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=OJ%3AL_202600636) betrifft Drittstaatenlisten. Daraus wird für die ausschließlich innergemeinschaftliche Reise DE → AT/FR/IT/NL keine zusätzliche Regel abgeleitet; das ist eine Umfangseinordnung, keine Prüfung aller Drittstaatenlisten. Die am Portal genannte konsolidierte Fassung vom 19.06.2026 wurde nicht vollständig gelesen. Passmodelle nach 2026/705 und Übergangsfälle sind weiterhin gesondert abzunehmen.

Offene Entscheidungen: technische Chipanforderungen, Passgültigkeit einschließlich Übergangsregeln, Kennzeichnung/Ablesen, Impfserie und Auffrischung, nationale Rasse-/Leinen-/Maulkorbregeln aller vier Ziele. Die alten nationalen Quellenbefunde in `travel-sources.md` sind nicht durch diese EU-Prüfung erledigt. Bestehende Monitoring-Issues bleiben offen.

Abnahmematrix: für jedes Ziel Hund und Katze; unbekannte, fehlende und erfüllte Eingaben; Wartezeit 20/21 Tage; Alter bei Impfung 83/84 Tage; rechtzeitige Auffrischung gegenüber Impflücke; Kennzeichnung vor/am/nach Impfung; gültiger gegenüber unvollständigem oder nicht unterschriebenem Pass; fünf gegenüber sechs Tieren im gemeinsamen Fahrzeug; Drittstaatentransit; nationale Sonderfälle. Sollentscheidung jeweils vor Vergleich mit dem Programm notieren. Nach Änderung des geprüften Inhalts ist eine neue Inhaltssignatur erforderlich.

## Recht: konkrete Entscheidungen und Unterlagen

| Thema | Vorbefund | Für Abschluss benötigter Nachweis |
|---|---|---|
| Anbieter | Angaben fehlen weiterhin; es werden keine erfundenen eingesetzt. | Betreibername, ladungsfähige Anschrift, E-Mail, gegebenenfalls Vertretung/Register/Steuer-ID; Einordnung redaktioneller Verantwortlichkeit. [§ 5 DDG](https://www.gesetze-im-internet.de/ddg/__5.html) |
| Datenschutz | Statische Auslieferung, lokale Merkliste/Profile, Kartenabruf nach Nutzeraktion. Hosting verarbeitet dennoch Verbindungsdaten. | Tatsächlicher Verantwortlicher, Hostingvertrag/DPA, Empfänger, Aufbewahrung und Transfers, Rechtsgrundlage je Verarbeitung, Betroffenenrechte. [DSGVO Art. 6, 13, 28, 44 ff.](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng); öffentliches [Cloudflare-DPA](https://www.cloudflare.com/cloudflare-customer-dpa/) belegt keinen abgeschlossenen Vertrag dieses Kontos. |
| Endgerät | Für ausdrücklich verlangte, unbedingt erforderliche Funktionen kann die Ausnahme greifen. | Speicherung und Auslesen je Schlüssel/Funktion beurteilen; separat die IP-Übermittlung an Kachelanbieter prüfen. [§ 25 TDDDG](https://www.gesetze-im-internet.de/ttdsg/__25.html) |
| Barrierefreiheit | Nicht jede Website fällt unter das BFSG. | Dienstleistung nach § 1 einordnen; bei elektronischem Geschäftsverkehr Definition § 2 prüfen. Beschäftigtenzahl sowie Umsatz/Bilanz für Kleinstunternehmen bestätigen; gegebenenfalls Informationen nach BFSG bereitstellen. [§ 1](https://www.gesetze-im-internet.de/bfsg/__1.html), [§ 2](https://www.gesetze-im-internet.de/bfsg/__2.html), [§ 3](https://www.gesetze-im-internet.de/bfsg/__3.html) |
| Streitbeilegung | Eine pauschale Kopplung nur an einen Online-Vertragsschluss war zu eng. | Unternehmerstatus, Website/AGB, Beschäftigte zum Vorjahresende sowie Teilnahmezusage/-pflicht prüfen. Die Kleinbetriebs-Ausnahme betrifft Abs. 1 Nr. 1. [§ 36 VSBG](https://www.gesetze-im-internet.de/vsbg/__36.html) |
| Datenrechte | Einzelquellen sind technisch dokumentiert; eine Gesamtfreigabe fehlt. | `SOURCE_REVIEWS.md` und `ODBL_DATAFLOW.md` je tatsächlich veröffentlichtem Datensatz abzeichnen. OSM-Datenlizenz und Kacheldienst getrennt behandeln. [OSM Copyright](https://www.openstreetmap.org/copyright), [Kachelnutzungsregeln](https://operations.osmfoundation.org/policies/tiles/) |

## Formular für die tatsächliche Abnahme

Für **jede** Entscheidung separat ausfüllen:

- Modul / konkrete Frage:
- Geprüfter Commit, Build und Datenstand; bei Reise Inhaltssignatur:
- Prüfende Person, Funktion und einschlägige Qualifikation:
- Prüfdatum und verwendete Originalquellen/Fassungen:
- Ergebnis: freigegeben / Änderungen erforderlich / nicht anwendbar:
- Begründung, zulässiger Umfang und ausdrücklich ausgeschlossene Fälle:
- Prüffälle samt unabhängigem Sollwert und beobachtetem Ergebnis:
- Auflagen, Nachprüfung bei Änderungen, Nachweis/Signatur:

Diese Vorlage ist **nicht unterschrieben und nicht versandt**. Erst dokumentierte Entscheidungen rechtfertigen Änderungen in `config/legal-review.json`, `config/launch.json`, der Kosten-Konfiguration oder den Reise-Approvals. Die bisherigen technischen Tests ersetzen diese Entscheidungen nicht.
