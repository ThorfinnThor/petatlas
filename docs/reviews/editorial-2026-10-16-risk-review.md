# Fachliche Risikoprüfung der Redaktionsentwürfe vom 16.10.2026

> **Abschließende Betreiberentscheidung:** Die nachfolgende Prüfung dokumentiert den ursprünglichen
> vorsichtigen Entwurfsstand. Der Betreiber hat die drei eng begrenzten, quellenbasierten Artikel
> anschließend ausdrücklich ohne zusätzliche externe Fachprüfung zur Veröffentlichung freigegeben.
> Maßgeblich ist `docs/reviews/editorial-2026-10-16-final-approval.md`.

Diese Prüfung kontrolliert Quellenbindung, Reichweite der Aussagen und den vorhandenen Freigabestatus. Sie ist eine interne redaktionelle Risikoprüfung und **keine externe fachliche oder rechtliche Freigabe**. Alle drei Artikel bleiben deshalb im Status `review`, tragen `indexable: false` und dürfen nicht in die Sitemap oder Suchmaschinenindexierung gelangen.

## Geprüfte Grundlagen

- Amtliche Gebührenordnung für Tierärztinnen und Tierärzte (GOT), einschließlich §§ 1, 2, 4 und 5 sowie Gebührenverzeichnis, Onlinefassung geprüft am 16.10.2026.
- Hinweise der Bundestierärztekammer zur GOT, geprüft am 16.10.2026.
- Verordnung (EG) Nr. 767/2009, insbesondere die Begriffsbestimmungen für Allein- und Ergänzungsfuttermittel und die Kennzeichnungsanforderungen, geprüft am 16.10.2026.
- WSAVA Global Nutrition Guidelines und UK Pet Food zur ergänzenden fachlichen Einordnung, geprüft am 16.10.2026.
- Projektinterne Freigaben in `docs/reviews/costs.md`, `docs/reviews/food.md` und `config/reviews/nutrition.json`.

## GOT-Faktor 1 bis 3

**Ergebnis der internen Prüfung:** inhaltlich auf den belegten regulären Gebührenrahmen begrenzt; externe Fachfreigabe weiterhin erforderlich.

Bestätigt wurden der reguläre Rahmen vom einfachen bis zum dreifachen Satz, die in § 2 genannten Einzelfallkriterien, der einfache Nettosatz der Position 16 und die abweichenden Regeln des Notdienstes. Der Artikel trennt Gebührenposition, Faktor und mögliche weitere Rechnungsbestandteile. Rechenwerte sind als arithmetische Beispiele gekennzeichnet und keine Prognose für einen Praxisbesuch.

**Veröffentlichungssperre:** Der Artikel darf erst nach einer dokumentierten Prüfung durch eine Person mit belastbarer Kenntnis der tierärztlichen Gebührenabrechnung auf `human-specialist`, `published` und `indexable: true` gesetzt werden.

## Allgemeine Untersuchung beim Hund

**Ergebnis der internen Prüfung:** blockiert, bis das konkrete Szenario einzeln fachlich freigegeben ist.

`content-data/cost-scenarios/allgemeine-untersuchung-hund.json` trägt weiterhin `clinicalReview: "unreviewed"`. Die allgemeine Abnahme des Kostenrechners umfasst dieses Szenario laut `docs/reviews/costs.md` ausdrücklich nicht. Der Entwurf nennt diesen Zustand sichtbar.

Der zuvor berechnete Bruttobetrag wurde entfernt. Übrig bleibt ausschließlich der amtlich belegte einfache Nettosatz der Position 16 mit Menge 1 und Faktor 1. Umsatzsteuer und weitere Rechnungsbestandteile werden als nicht enthalten benannt. Damit erzeugt der Entwurf keinen scheinbaren Gesamtpreis.

**Veröffentlichungssperre:** Vor einer Veröffentlichung müssen mindestens `clinicalReview: "approved"`, `reviewedAt` und `reviewedBy` für das Szenario vorliegen. Danach ist der Artikel gegen genau diesen freigegebenen Datenstand extern fachlich zu prüfen.

## Alleinfuttermittel oder Ergänzungsfuttermittel

**Ergebnis der internen Prüfung:** amtliche Begriffsgrundlage ergänzt; externe Fachfreigabe weiterhin erforderlich.

Die Definitionen stammen jetzt aus der Verordnung (EG) Nr. 767/2009. Branchen- und Fachquellen dienen nur noch der praktischen Einordnung. Der Artikel enthält keine Dosierung, Diagnose, Therapie oder individuelle Produktempfehlung. Er trennt die rechtliche Produktart von Eignung, Qualität und medizinischem Nutzen.

Die bestehende Freigabe in `config/reviews/nutrition.json` gilt für die veröffentlichte allgemeine Ergänzungsfuttermittelseite und nicht automatisch für diesen neuen Artikel. Deshalb bleibt der Entwurf ungeprüft und nicht indexierbar.

**Veröffentlichungssperre:** Vor Veröffentlichung ist eine dokumentierte externe Prüfung der neuen Aussagen zur Fütterung und Etiketteneinordnung erforderlich. Die prüfende Person muss außerdem bestätigen, dass die Grenzen zu individueller Fütterungsberatung und Therapie klar genug bleiben.

## Technische Veröffentlichungsgates

Vor einer späteren Freigabe müssen zusätzlich alle folgenden Bedingungen erfüllt sein:

1. Der jeweilige Artikel trägt `status: "published"` erst nach dokumentierter externer Prüfung.
2. `reviewLevel: "human-specialist"` wird nur mit benannter Prüffunktion und Datum gesetzt.
3. Quellenstand und Datenstand werden am Freigabetag erneut geprüft.
4. Content-, SEO-, Accessibility- und Browserprüfungen bestehen für den finalen Text.
5. Erst danach darf `indexable: true` gesetzt und die URL in die Sitemap aufgenommen werden.
