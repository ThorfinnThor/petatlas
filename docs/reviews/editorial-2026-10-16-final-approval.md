# Endabnahme und Betreiberfreigabe der Redaktionsrunde vom 16.10.2026

## Entscheidung

Die technische Endabnahme ist bestanden. Der Betreiber hat am 16.10.2026 ausdrücklich
entschieden, dass die kuratierten Projektdaten, amtlichen Primärquellen und klar benannten Grenzen
für die Veröffentlichung der drei Artikel ausreichen. Eine zusätzliche externe Fachprüfung wird
für diese begrenzten, nicht individuell beratenden Inhalte nicht verlangt.

Freigegeben sind:

1. „GOT-Faktor 1 bis 3: So verändert er eine Gebührenposition“
2. „Allgemeine Untersuchung beim Hund: Was kann auf der Rechnung stehen?“
3. „Alleinfuttermittel oder Ergänzungsfuttermittel: Etikett richtig lesen“

Die Artikel werden unter `/de-de/blog/` veröffentlicht, tragen `status: "published"` und
`indexable: true` und dürfen in Sitemap und Seitensuche aufgenommen werden. Sie bleiben als
redaktionelle Einordnung gekennzeichnet und behaupten keine individuelle medizinische,
abrechnungsbezogene oder ernährungsfachliche Beratung.

## Technisch abgenommen

- Produktions-Build und alle 15 Build-Stufen bestanden.
- Vor der Veröffentlichung 453 indexierbare Seiten und 1.255 erzeugte Seiten bestätigt.
- Abhängigkeiten, Workflow-Härtung, Secret- und Fixture-Audit, Lint, Typecheck, Unit-Tests,
  Browser-Smoke sowie Visual-QA in sechs Viewports bestanden.
- Quellen, Canonicals, strukturierte Daten, Sitemap-Aufnahme und responsive Darstellung werden
  im finalen Veröffentlichungsstand erneut geprüft.
- Mit Blogübersicht und drei Artikeln bleibt das Indexbudget im festgelegten Bereich von 400 bis
  500 Seiten.

## Inhaltliche Grenzen

- GOT-Beträge werden als belegte Sätze einzelner Gebührenpositionen dargestellt, nicht als
  garantierter Endpreis eines Praxisbesuchs.
- Das Untersuchungsszenario ist ein enger Rechenweg mit offengelegten Ausschlüssen und keine
  Behandlungsempfehlung oder vollständige Musterrechnung.
- Die Futterbegriffe werden anhand der EU-Definition und dokumentierter Packungsangaben erklärt;
  der Artikel gibt keine individuelle Fütterungs- oder Therapieempfehlung.

Eine spätere inhaltliche Erweiterung über diese Grenzen hinaus benötigt eine neue redaktionelle
Prüfung. Die Freigabe gilt für den in diesem Commit geprüften Wortlaut.
