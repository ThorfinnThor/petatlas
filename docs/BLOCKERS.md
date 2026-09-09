# Blockerregister

Stand 2026-09-09. **Sieben blockierte Aufgaben: M08-06, M09-06, M12-06, M13-06, M14-06, M18-06 und M19-06.** Die praktische Funktionsabnahme M23-02 ist mit konkreten Nachweisen abgeschlossen. Diese Aufgaben enthalten externe Abnahmen und optionale kommerzielle Erweiterungen; ihre Zahl ist nicht die Zahl technischer Fehler.

Für den aktuellen werbe- und angebotsfreien Umfang sind die Gates `operatorImprint`, `domain`, `dataRights`, `costsRules` und `travelRules` sowie die dokumentierten Rechtsprüfungen und die finale Release-Freigabe relevant. Versicherung, Commerce und Tracking sind ausgeschaltet; fehlende Partnerverträge blockieren diesen kleineren Umfang nicht (`config/release-policy.ts`).

| Blocker | Aufgabe | Tatsächlich offen | Zuständig |
|---|---|---|---|
| B-008 | M19-06 | Freigabevoraussetzungen aus M18-06; zusätzlich abgelaufene Cloudflare-Anmeldung. Der neue Stand ist noch nicht auf der vorhandenen Vorschau veröffentlicht. | Betreiber/Hosting-Account |
| B-007 | M18-06 | Echte Betreiberangaben und Domain, einschlägige Rechts-/Datenrechteprüfung sowie Fachfreigaben für aktivierte Kosten-/Reisewerkzeuge. Keine Abnahmen werden aus grünen Tests abgeleitet. | Betreiber und benannte prüfende Personen |
| B-006 | M14-06 | Öffentliche Datenrechte-/Angebotsfreigabe. Drei reale Produkte mit sieben Herstellerattributen sind bereits redaktionell erfasst und in der Vorschau nutzbar; es fehlen keine technischen Attributfelder. Eine unabhängige Produktprüfung wird nicht behauptet. | Betreiber |
| B-005 | M13-06 | Programmvertrag und zulässige Feedfelder für tatsächliche Händlerangebote. Betrifft eine optionale Erweiterung, nicht den aktuellen Start ohne Angebote. | Betreiber/Partner |
| B-004 | M12-06 | Fachprüfung der erfassten Reisegrundlagen einschließlich nationaler Besonderheiten; Quellenmeldungen benötigen die dokumentierte manuelle Nachprüfung. | Fachlich prüfende Person |
| B-003 | M09-06 | Vertragliche und rechtliche Freigabe des ausgeschalteten Versicherungsmoduls. | Betreiber/Partner mit Rechtsprüfung |
| B-002 | M08-06 | Fachliche Rechenabnahme von Quellenstand, Faktoren, Notdienst, Steuerbehandlung und Rundung. | Fachlich prüfende Person |

Die Abläufe und Nachweisvorlagen stehen in `docs/reviews/`. Der Nutzer liefert die zurückgestellten Angaben nach technischer Fertigstellung. Platzhalter sind Vorschauhinweise und keine Produktionsangaben. Die aktuelle technische Abnahme steht in `PUBLIC_RELEASE_ACCEPTANCE.md`.

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
