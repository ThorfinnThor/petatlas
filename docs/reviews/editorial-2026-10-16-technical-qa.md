# Technische und sprachliche QA der Redaktionsentwürfe vom 16.10.2026

Diese Prüfung ist der mechanische QA-Schritt nach der fachlichen Risikoprüfung. Sie kontrolliert
keine medizinische, rechtliche oder ernährungsfachliche Freigabe und ändert keinen `reviewLevel`.
Alle drei Artikel bleiben daher `status: review` und `indexable: false`.

## Geprüft

- Rechtschreibung, Interpunktion und konsistente Begriffe in den drei Artikeln.
- Überschriftenhierarchie und verständliche Abschnittstitel.
- Interne Links auf Kostenrechner, Futterübersicht und bestehende Ratgeber.
- Quellen-IDs, Datendateien, Metadaten und Canonical-Grundlage.
- Affiliate-Bezug: keiner der drei Entwürfe enthält Händler- oder Werbeverweise.
- Mobile Darstellung ohne horizontale Überläufe im bestehenden Browser- und Viewport-Test.
- `noindex`, aus der Sitemap ausgeschlossen und aus der Seitensuche ausgeschlossen, solange der
  Status nicht `published` und die Fachprüfung nicht abgeschlossen ist.

## Korrekturen in diesem QA-Schritt

1. Briefingstatus auf `review` gesetzt, damit Quellenprüfung und Entwurfsstatus übereinstimmen.
2. Datenstand des GOT-Szenarios auf den tatsächlichen Prüfstand 16.10.2026 aktualisiert.
3. Faktorpassage enger formuliert; sie behauptet nicht mehr ausdrücklich eine „stufenlose“ Wahl,
   sondern beschreibt den regulären Rahmen und die Einzelfallbestimmung.

## Ergebnis

Die drei Entwürfe bestehen die technische und sprachliche QA. Sie sind nicht veröffentlicht. Die
noch offene Voraussetzung ist ausschließlich die jeweils dokumentierte externe Fachfreigabe aus
`docs/reviews/editorial-2026-10-16-risk-review.md`.
