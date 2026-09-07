# Partnerprogramme Versicherung

Eine Datei je Fachgebiet, ein Eintrag je **tatsächlichem Vertrag**. Ein Anbieter, bei dem eine Bewerbung läuft, ist kein Eintrag mit `status: "approved"`, sondern einer mit `status: "applied"` — oder er fehlt.

`programs` ist derzeit **leer**: es gibt keinen Partnervertrag. Das ist kein Platzhalter, der später „noch gefüllt wird“, sondern der aktuelle Zustand. Solange er leer ist, entsteht keine Versicherungs-CTA; das prüft `tests/commerce/partner.test.ts`.

## Regeln

1. **Kein Eintrag ohne Vertrag.** `approved` verlangt Vertragsreferenz, Freigabedatum und einen dokumentierten Prüfnachweis (`docs/reviews/insurance.md`, M09-06). Ein Disclaimer ersetzt die Prüfung nicht.
2. **Keine Provisionen in dieser Datei.** Das Schema ist `.strict()`; ein Feld wie `commissionRate` lässt die Konfiguration scheitern. Alles, was hier steht, ist im Browser lesbar.
3. **Alles ist eine Allowlist.** Zielhosts, Kampagnenkennungen, Platzierungsarten und Märkte werden aufgezählt. Was nicht aufgezählt ist, ist verboten.
4. **Keine Platzierung im Ergebnis.** Erlaubt sind Informationsseite, abgesetzter Fußabschnitt und neutrale Übersicht. Ein Hinweis neben einem Kostenergebnis oder auf einer Notfallseite wäre eine Empfehlung, keine Werbung.
5. **Ein abgelaufener Vertrag ist kein Vertrag.** `expiresAt` in der Vergangenheit wirkt wie `ended`.
