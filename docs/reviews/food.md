# Abnahme der Futterdarstellung

Durchgeführt am 2026-09-08 (M15-06). Geprüft wurde, ob die Futterseiten das zeigen, was sie zeigen dürfen — und ob erkennbar bleibt, was Etikettangabe, was Rechnung und was Werbung ist.

Dies ist eine **Darstellungsabnahme**, keine fachliche Freigabe von Fütterungsaussagen. Solche Aussagen gibt es hier nicht, und das ist der Kern der Sache.

## Prüfumfang

| | |
|---|---|
| Geprüfte Seiten | Futtersuche `/de-de/futter/` und vier Produktseiten |
| Automatisierte Prüfung | `npm run test:e2e:features` — 200 Tests, davon 24 aus dem Futterbereich |
| Inhaltsregeln | `tests/care-safety.test.ts` prüft die Futterseiten und -module mit denselben neun Mustergruppen wie Pflege und Spielzeug |
| Datenbestand | vier synthetische Produkte, `dataKind: "synthetic"` |

## Ergebnisse

### Kein Testsieger, kein Score

Auf keiner Futterseite steht ein Rang, eine Note oder eine Punktzahl. Ein E2E-Test liest den **behauptenden** Teil der Seite — ohne Ausschlussliste und Hinweisboxen, die die Wörter nennen dürfen, weil sie sie verneinen — und sucht nach „Testsieger“, „Score“, „Bestnote“, „Punktzahl“ und „Bewertung:“. Er findet nichts. Umgekehrt prüft derselbe Test, dass die Verneinung tatsächlich dasteht.

Der Grund steht in der Taxonomie: *„Aus lückenhaften Labeldaten entsteht keine Qualitätsaussage. Ein Score wäre eine Methodik, die niemand geprüft hat.“*

### Rohdaten sind vom Preisvergleich getrennt

Die Produktseite hat getrennte Abschnitte: **Deklarierte Nährwerte** als Tabelle mit Fundstelle, **Angebote** als eigener Abschnitt. Die Nährwerttabelle steht nicht im Angebotsteil, und der Angebotsteil rechnet nicht mit Nährwerten. Ein Test prüft beide Überschriften und die Zahl der Tabellen.

### Labelwerte tragen Einheit, Bezug und Quelle

Jede Zeile der Nährwerttabelle nennt Wert, Einheit, Bezug (Frisch- oder Trockenmasse) und die verlinkte Quelle mit Prüfdatum. Geprüft am Beispiel Protein: „22 g“, „je 100 g Frischmasse“, „Etikett“, „geprüft am 2026-09-07“.

### Unbekannt heißt unbekannt

Fehlende Angaben stehen als „nicht deklariert“ da — bei Lebensphase, Futterart und je Nährstoff. Darunter steht der Satz, auf den es ankommt: **eine fehlende Angabe ist keine Null.** Ein Test liest ihn.

### Menge und Preisstand

Die Menge steht verständlich: „1 kg“, „12 kg“ oder „6 × 400 g = 2,4 kg“. Der Grundpreis wird nur bei vollständiger Mengenangabe gerechnet (M15-02).

Ein **Preisstand** ist derzeit nirgends zu sehen, weil es kein Angebot mit Anzeigeerlaubnis gibt. Die Angebotskarte trägt ihn (`OfferCard.astro`, geprüft in M13-04); auf den Futterseiten erscheint stattdessen die Begründung, warum kein Angebot dasteht — einschließlich des Satzes, dass dies keine Aussage über den Markt ist.

## Offene Punkte

1. **Preisvergleich ungetestet im Echtbetrieb.** Ohne freigegebenes Warenprogramm (B-005) gibt es keine echten Angebote; der Grundpreisvergleich ist nur gegen synthetische Daten geprüft.
2. **Echte Etikettdaten fehlen.** Die vier Produkte sind erfunden. Sobald echte Produkte kommen, gilt derselbe Ablauf wie bei Pflege und Spielzeug: Angabe für Angabe mit Fundstelle (`docs/reviews/care-toys.md`).
3. **Anreicherung bleibt aus.** Open Pet Food Facts liefert die Nährwerte nicht, die es liefern müsste (`docs/OPFF_SPIKE.md`); der Adapter ist doppelt gesperrt.
