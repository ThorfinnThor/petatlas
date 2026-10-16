# Endabnahme der Redaktionsrunde vom 16.10.2026

## Entscheidung

Die technische Endabnahme ist bestanden. Die Veröffentlichung der drei neuen Artikel ist noch
gesperrt, weil die dokumentierten externen Fachfreigaben für ihren konkreten Inhalt fehlen. Der
Pull Request darf deshalb nicht als Inhaltsveröffentlichung zusammengeführt oder ausgerollt
werden.

Die Artikel bleiben unverändert in folgendem sicheren Zustand:

- `status: "review"`
- `reviewLevel: "editorial"`
- `indexable: false`
- nicht in der XML-Sitemap
- nicht in der internen Seitensuche
- mit `noindex` und sichtbarem Hinweis auf die ausstehende Prüfung

## Technisch abgenommen

- Produktions-Build mit 15 Stufen bestanden.
- 453 indexierbare Seiten und 1.255 erzeugte Seiten bestätigt.
- Alle sechs CI-Prüfungen für Commit `2a6640a92fe3a8524658f27f842d7d8a851e3dc6`
  bestanden: Abhängigkeiten, Workflow-Härtung, Secret- und Fixture-Audit, Lint/Typecheck/Tests,
  Browser-Smoke sowie Visual-QA in sechs Viewports.
- Canonicals, `noindex`, Sitemap-Ausschluss und ausstehender Prüfstatus aller drei Artikel
  automatisiert geprüft.
- Würden alle drei Artikel nach Fachfreigabe indexierbar, läge das Indexbudget bei 456 URLs und
  damit weiterhin im festgelegten Bereich von 400 bis 500 Seiten.

## Offene Fachfreigaben

1. **GOT-Faktor 1 bis 3:** Prüfung des vollständigen Artikels durch eine Person mit belastbarer
   Kenntnis der tierärztlichen Gebührenabrechnung.
2. **Allgemeine Untersuchung beim Hund:** Zuerst Freigabe des konkreten Szenarios
   `content-data/cost-scenarios/allgemeine-untersuchung-hund.json` mit `clinicalReview`,
   `reviewedAt` und `reviewedBy`; anschließend externe Prüfung des darauf beruhenden Artikels.
3. **Alleinfuttermittel oder Ergänzungsfuttermittel:** Externe Prüfung der neuen Aussagen zur
   Fütterung und Etiketteneinordnung sowie der Abgrenzung zu individueller Beratung und Therapie.

Die allgemeine öffentliche Freigabe vom 14.09.2026 und die vorhandenen Freigaben einzelner
Bestandsseiten decken diese später erstellten Artikel nicht automatisch ab. Grundlage dieser
Entscheidung ist die fachliche Risikoprüfung in
`docs/reviews/editorial-2026-10-16-risk-review.md`.

## Erforderlicher Nachweis für die Fortsetzung

Für jeden Artikel werden Prüffunktion oder Name, Prüfdatum, geprüfte Fassung und Ergebnis
dokumentiert. Erst danach dürfen Metadaten, Status, Sitemap und Indexierung geändert werden. Nach
diesen Änderungen müssen die technischen Prüfungen erneut vollständig bestehen, bevor ein
Produktions-Rollout erfolgt.
