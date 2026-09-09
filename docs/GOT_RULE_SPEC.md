# Gebührenengine: deutsche Ausgangsregeln und Testgrenzen

Prüfstand: 2026-09-06. Implementierung muss den aktuellen Quellenstand bei Start noch einmal prüfen. Dieser Abschnitt spezifiziert den Standardfall Hund/Katze, keine vollständige Abbildung sämtlicher Sondertatbestände der GOT.

Der konsolidierte GOT-Text weist die Katalogbeträge als einfache Sätze ohne Umsatzsteuer aus. Regulär sieht er grundsätzlich den einfachen bis dreifachen Satz vor; für den einschlägigen tierärztlichen Notdienst zwei- bis vierfach zuzüglich einer Notdienstgebühr von 50 Euro. Die Pauschale ist in derselben Angelegenheit nicht je Tier erneut zu erheben. Vereinbarte Abweichungen/Sonderfälle und reguläre Sprechstunden müssen berücksichtigt bzw. als nicht unterstützt abgegrenzt werden. §6 verhindert die zusätzliche Berechnung bereits enthaltener Leistungen. [S18]

## Startkonfiguration, vor Aktivierung fachlich prüfen

```json
{
  "market": "DE",
  "currency": "EUR",
  "standardFactorMin": "1.00",
  "standardFactorMax": "3.00",
  "emergencyFactorMin": "2.00",
  "emergencyFactorMax": "4.00",
  "emergencyFeeMinor": 5000,
  "factorPrecision": 2,
  "baseAmountsExcludeVat": true,
  "specialAgreementsSupported": true,
  "clinicalReview": "pending"
}
```

Faktoren in Hundertsteln oder mit einer korrekt eingesetzten Dezimalbibliothek behandeln. Ein pauschaler Standardfaktor für alle ausgewählten Leistungen ist eine ausdrücklich erläuterte Nutzerannahme; unterschiedliche Faktoren je Position können später als erweitertes UI ergänzt werden.

Notdienst nicht allein aus `Date.now()` oder Uhrzeit ableiten. Nutzer wählt den zutreffenden Behandlungskontext. Zeiträume und Sprechstundenausnahmen aus dem aktuellen Verordnungstext prüfen; unklare Fälle verweisen auf die Praxis, statt automatisch Zuschläge festzustellen.

## Rechenpipeline

Position -> passende Tierart/Mengeneinheit prüfen -> Basissatz x Menge x Faktor -> definierte Cent-Rundung -> Einzelpositionssumme -> zulässige gesonderte Zuschläge -> Steuergruppen -> Bruttosumme. Zusatzmaterial, Medikamente, Fremdlabor und Wegegeld sind keine automatisch enthaltenen Posten.

Der allgemeine deutsche Umsatzsteuersatz beträgt nach §12 Abs.1 UStG 19 Prozent. Das ist kein Freibrief, ungeprüft jede Zusatzposition oder jeden späteren Markt gleich zu besteuern. Steuerregeln je Zeilentyp im Review festlegen; im UI die Annahme erläutern. [S36]

## Unabhängige synthetische Tests

Diese Zahlen sind Rechenfixtures, keine echten GOT-Leistungen:

- 1.000 Cent x Menge 3 x Faktor 2,00 -> 6.000 Cent netto.
- Derselbe Fall plus einmal 5.000 Cent synthetisch angesetzte Notdienstpauschale -> 11.000 Cent netto; bei einheitlich angenommenen 19 Prozent -> 13.090 Cent brutto.
- Menge 0, negativer Wert, unzulässiger Faktor, inkompatible Tierart oder fehlende Einheit -> Validierungsfehler, keine stille Korrektur.
- In einer Sammelangelegenheit mit mehreren Tieren Pauschale nicht ungefragt pro Tier wiederholen.
- Eine bereits im gewählten Leistungsansatz enthaltene Teilposition darf nicht automatisch zusätzlich summiert werden. Solche Regeln benötigen belegte Zuordnung; unbekannte Kombinationen offen kennzeichnen.

Centgenaue Rechenarithmetik ist keine Garantie, dass eine echte Praxisrechnung identisch ausfällt. Das Ergebnis ist eine transparente modellbasierte Orientierung, kein Kostenvoranschlag der behandelnden Praxis.

## Erweiterung 09.09.2026

Mit der Praxis geklärte Sonderfälle können mit ausdrücklicher Bestätigung abweichende Faktoren, Steuerbehandlung und einen Erlass der Notdienstgebühr verwenden. Die Standardberechnung bleibt unverändert. Details und Grenzen: `IMPLEMENTATION_REVIEW_2026-09-09.md`.
