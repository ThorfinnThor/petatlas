# Blockerregister

Stand 2026-09-08. **Sieben blockierte Aufgaben: M08-06, M09-06, M12-06, M13-06, M14-06, M18-06 und M19-06.** Alle blockieren ausschließlich die öffentliche Aktivierung und die Veröffentlichung — kein Blocker hält Entwicklung oder Prüfung auf. Es gibt keine weitere ausführbare Aufgabe: was bleibt, wartet auf eine Entscheidung oder Prüfung durch einen Menschen.

| Blocker-ID | Aufgabe | Ursache | Benötigte Handlung | Zuständig | Unabhängige Folgearbeit |
|---|---|---|---|---|---|
| B-008 | M19-06 | Eine Veröffentlichung setzt voraus, was es nicht gibt: echte Betreiberangaben, eine Domain, freigegebene Datenrechte, fachliche Abnahmen und eine dokumentierte Veröffentlichungsautorisierung. Acht Launch-Gates stehen offen, vier Rechtspflichten sind unerfüllt, und der Produktionsbuild bricht ohne Betreiberangaben ab — technisch erzwungen, nicht nur vereinbart. | Die Reihenfolge in `docs/reviews/launch.md` abarbeiten und jede Freigabe mit Person, Datum und Nachweis in `config/launch.json` eintragen. Danach deployen und URL, Build-ID, Code- und Daten-Commit sowie die Rauchprobe in `docs/DEPLOYMENT_EVIDENCE.md` festhalten. | Betreiber | Keine. Dies ist die letzte Aufgabe des Plans; alles andere ist erledigt oder wartet auf dieselben Freigaben. |
| B-007 | M18-06 | Die acht Launch-Gates verlangen fachliche und rechtliche Freigaben, die außerhalb dieses Repositories entstehen: echte Betreiberangaben, eine Domain, die Bestätigung der Publikationsrechte, eine fachliche Abnahme von Gebührenrechner und Reiseregeln, eine Prüfung nach § 34d GewO und mindestens eine Programmfreigabe. Keine dieser Prüfungen wird erfunden, und ein grüner Prüflauf ersetzt keine. | Je Gate die Prüfpunkte im benannten Nachweis beantworten lassen, das Ergebnis dort mit Datum und Namen eintragen und danach das Gate in `config/launch.json` auf `approved` mit `approvedBy` und `approvedAt` setzen. Reihenfolge und Zuständigkeiten stehen in `docs/reviews/launch.md`, die vier offenen Rechtspflichten in `docs/LEGAL_CHECKLIST.md`. | Betreiber, für die fachlichen Gates mit jeweils qualifizierter prüfender Person | M19 ist unberührt: Endabnahme, Betriebshandbuch und Ausbauprobe setzen keine erteilte Freigabe voraus. `npm run check:release` prüft weiterhin die Form jeder Behauptung. |
| B-006 | M14-06 | Echte Produkte lassen sich attributseitig nicht abnehmen, solange keine Angebotsrechte bestehen (B-005). Fehlende Herstellerangaben werden nicht ergänzt — weder aus der Produktbeschreibung noch aus einem Sprachmodell. | Nach der Programmfreigabe je Produkt die Herstellerangaben mit Fundstelle und Prüfdatum eintragen, dem Ablauf in `docs/reviews/care-toys.md` folgen und `dataKind` auf `real` setzen. | Betreiber | M15 und alle folgenden Meilensteine sind unberührt. Finder und Pflegeseiten laufen mit ausdrücklich synthetischen Daten und zeigen keine echten Produkte. |
| B-005 | M13-06 | Der Angebotslayer ist gebaut und getestet, aber es gibt keine Programmfreigabe eines Netzwerks und damit weder geprüfte Anzeige- noch Bild- noch JSON-Rechte. Ein Provisionswert aus einer Netzwerkoberfläche ist kein Vertragsbeleg. | Eine tatsächliche Programmfreigabe einholen und die acht Prüfpunkte in `docs/reviews/commerce-partner.md` beantworten; danach Programm eintragen, Feed-Secret hinterlegen und das Gate `commerceAffiliate` freischalten. | Betreiber | M14 und alle folgenden Meilensteine sind unberührt. Ohne Vertrag bleibt der Slot aus: kein Feedabruf, keine öffentliche Angebotsdatei, leerer Katalog mit Begründung. |
| B-004 | M12-06 | Der Reisecheck ist gebaut und die Regeln sind mit Fundstelle erfasst, aber niemand mit einschlägiger Qualifikation hat sie geprüft. Eine solche Prüfung wird nicht erfunden, und ein Hinweistext ersetzt sie nicht. | Die acht Prüfpunkte in `docs/reviews/travel.md` beantworten lassen und die sechs Freigabeschritte ausführen — einschließlich Eintrag der geprüften Inhaltssignatur in `content-data/travel/approvals.json`. | Betreiber mit fachlich prüfender Person | M13 und alle folgenden Meilensteine sind unberührt. Der Check bleibt in der Vorschau: einzelne Punkte werden ausgewertet, ein positives Gesamtergebnis entsteht nicht. |
| B-003 | M09-06 | Das Versicherungsmodul ist technisch fertig, aber es gibt keinen Partnervertrag und keine Prüfung der konkreten Ausgestaltung nach § 34d GewO. Weder eine Zulassung noch eine solche Prüfung wird erfunden. | Eine tatsächliche Programmzulassung einholen und die acht Prüfpunkte in `docs/reviews/insurance.md` beantworten lassen; danach die sechs dort beschriebenen Freigabeschritte ausführen. | Betreiber | M12 und alle folgenden Meilensteine sind unberührt. Ohne Vertrag bleibt die Partnerkonfiguration leer, und die Seite bleibt mit ihren fünf Hinweistexten informativ. |
| B-002 | M08-06 | Der Kostenrechner ist fertig und getestet, aber niemand mit fachlicher Eignung hat Quellenstand und Rechenannahmen abgenommen. Eine solche Autorität wird nicht erfunden. | Eine geeignete prüfende Person beauftragen und die acht Prüfpunkte in `docs/reviews/costs.md` beantworten lassen; danach die dort beschriebenen fünf Freigabeschritte ausführen. | Betreiber | M09, M10, M12 und alle übrigen Meilensteine sind unberührt. Der Rechner ist mit `ENABLE_FEATURES=costs` lokal vollständig bedienbar. |

## Erledigte Punkte

### B-001 — Bezugsweg für den Gebührenkatalog · **entschieden am 2026-09-06**

**Ursprünglicher Befund (M05-04):** Der Verordnungstext ist nach § 5 Abs. 1 UrhG nicht urheberrechtlich geschützt, aber gesetze-im-internet.de nannte im Impressum keine Bedingungen für den systematischen Abruf seiner HTML-Fassung. Der Bezugsweg war damit ungeklärt, nicht der Inhalt.

**Entscheidung des Betreibers:** Bezug ausschließlich über den offiziell angebotenen XML-Download `https://www.gesetze-im-internet.de/got_2022/xml.zip`. Kein Crawler, keine Spiegelung. Der Punkt ist damit kein externer Freigabe-Blocker mehr.

**Nachgeprüft am 2026-09-06:** Der Download antwortet mit HTTP 200, liefert `ETag` und `Last-Modified` und enthält genau eine XML-Datei. `robots.txt` schließt keinen Pfad aus.

**Vollständige Vorgaben:** `docs/DECISIONS.md`, ADR-018. **Quellenprüfung:** `docs/SOURCE_REVIEWS.md`.

**Erledigt:** Aufgabe **M17-07** hat die Abrufbedingungen gemessen und dokumentiert; der Abruf ist bedingt und steht im wöchentlichen Zeitplan.

**Offener Betriebspunkt, kein Blocker:** Der Abruf gelingt von einem GitHub-Runner aus nicht — `www.gesetze-im-internet.de:443` nimmt die Verbindung aus diesem Netz nicht an (gemessen am 2026-09-08, fünf Versuche in zwei Workflows, `UND_ERR_CONNECT_TIMEOUT`). Die Aktualisierung des Gebührenkatalogs bleibt deshalb bis auf Weiteres ein manueller Lauf vom Arbeitsrechner. Nichts hängt daran: die Fassung ist seit dem 7. April 2023 unverändert, ein Fehlschlag ersetzt keine Daten, und die Auslieferung läuft weiter. Dass ein dauerhaft scheiternder Abruf auffällt, gehört zu **M17-05**.

Der Eintrag bleibt hier stehen, damit die Entscheidung nachvollziehbar bleibt. Ein Blocker wird nicht gelöscht, sondern aufgelöst.

---

Weitere noch offene externe Voraussetzungen stehen mit Status, Entscheider und zuerst betroffener Aufgabe im Register in `docs/EXTERNAL_SETUP.md`. Eine offene Voraussetzung ist noch kein Blocker.

Keine Secret-Werte, Vertragsinterna oder personenbezogenen Angaben in dieses öffentliche Dokument schreiben.
