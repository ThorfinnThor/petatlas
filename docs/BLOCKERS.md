# Blockerregister

Stand 2026-09-06. **Eine blockierte Aufgabe: M08-06.** Sie blockiert ausschließlich die öffentliche Aktivierung des Rechners, keine weitere Entwicklung.

| Blocker-ID | Aufgabe | Ursache | Benötigte Handlung | Zuständig | Unabhängige Folgearbeit |
|---|---|---|---|---|---|
| B-002 | M08-06 | Der Kostenrechner ist fertig und getestet, aber niemand mit fachlicher Eignung hat Quellenstand und Rechenannahmen abgenommen. Eine solche Autorität wird nicht erfunden. | Eine geeignete prüfende Person beauftragen und die acht Prüfpunkte in `docs/reviews/costs.md` beantworten lassen; danach die dort beschriebenen fünf Freigabeschritte ausführen. | Betreiber | M09, M10, M12 und alle übrigen Meilensteine sind unberührt. Der Rechner ist mit `ENABLE_FEATURES=costs` lokal vollständig bedienbar. |

## Erledigte Punkte

### B-001 — Bezugsweg für den Gebührenkatalog · **entschieden am 2026-09-06**

**Ursprünglicher Befund (M05-04):** Der Verordnungstext ist nach § 5 Abs. 1 UrhG nicht urheberrechtlich geschützt, aber gesetze-im-internet.de nannte im Impressum keine Bedingungen für den systematischen Abruf seiner HTML-Fassung. Der Bezugsweg war damit ungeklärt, nicht der Inhalt.

**Entscheidung des Betreibers:** Bezug ausschließlich über den offiziell angebotenen XML-Download `https://www.gesetze-im-internet.de/got_2022/xml.zip`. Kein Crawler, keine Spiegelung. Der Punkt ist damit kein externer Freigabe-Blocker mehr.

**Nachgeprüft am 2026-09-06:** Der Download antwortet mit HTTP 200, liefert `ETag` und `Last-Modified` und enthält genau eine XML-Datei. `robots.txt` schließt keinen Pfad aus.

**Vollständige Vorgaben:** `docs/DECISIONS.md`, ADR-018. **Quellenprüfung:** `docs/SOURCE_REVIEWS.md`.

**Verbleibend, aber kein Blocker:** Aufgabe **M17-07** dokumentiert die Abrufbedingungen, bevor ein zeitgesteuerter Job aktiviert wird. Die Implementierung des Rechners wartet nicht darauf.

Der Eintrag bleibt hier stehen, damit die Entscheidung nachvollziehbar bleibt. Ein Blocker wird nicht gelöscht, sondern aufgelöst.

---

Weitere noch offene externe Voraussetzungen stehen mit Status, Entscheider und zuerst betroffener Aufgabe im Register in `docs/EXTERNAL_SETUP.md`. Eine offene Voraussetzung ist noch kein Blocker.

Keine Secret-Werte, Vertragsinterna oder personenbezogenen Angaben in dieses öffentliche Dokument schreiben.
