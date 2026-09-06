# Fachliche Abnahme des Kostenrechners

Stand 2026-09-06 (M08-06). **Ergebnis: nicht abgenommen.** Dieses Dokument bereitet die Prüfung vor; es ist selbst keine Prüfung und keine Freigabe.

## Was hier ausdrücklich nicht behauptet wird

Es gibt keine fachliche Freigabe, keine prüfende Person und keine tierärztliche Autorität hinter diesem Rechner. Solange dieser Abschnitt so dasteht, bleibt das Feature Flag `costs` aus und der Rechner ist nicht öffentlich erreichbar.

Der Code ist fertig und getestet. Offen ist ausschließlich die fachliche Abnahme.

## Stand der Prüfung

**2026-09-06:** Der Betreiber hat entschieden, den Rechner zum Ausprobieren freizuschalten und die Prüfung zunächst mit einem Sprachmodell (ChatGPT) vorzunehmen. Bis ein Ergebnis eingetragen ist, gilt der Rechner als **nicht abgenommen**; die Seite trägt einen sichtbaren Warnhinweis, und das Feature Flag in der versionierten Konfiguration bleibt aus — freigeschaltet ist die Vorschau, nicht die Produktion.

Eine Prüfung durch ein Sprachmodell ist eine Vorabkontrolle. Sie ersetzt keine qualifizierte fachliche Abnahme und darf hier nicht als solche eingetragen werden. Wird die Freigabe darauf gestützt, gehört genau das in die Zeile „prüfende Person“ — etwa „Vorabprüfung durch ein Sprachmodell, keine qualifizierte fachliche Abnahme“.

## Wer prüfen kann

Eine Person mit belastbarer Kenntnis der tierärztlichen Gebührenabrechnung — etwa eine Tierärztin oder ein Tierarzt mit Abrechnungserfahrung, eine tierärztliche Verrechnungsstelle oder eine entsprechend spezialisierte Rechtsberatung. Der Betreiber wählt sie aus; sie wird hier mit Namen oder Funktion und Datum eingetragen.

## Was geprüft werden muss

### 1. Quellenstand

- Ist `GOT 2022` in der Fassung vom 2022-08-15 mit dem Änderungsstand „Geändert durch Art. 2 V v. 15.3.2023 I Nr. 70“ noch die geltende Fassung?
- Der Snapshot stammt aus der amtlichen XML-Datei, sha256 `c7bdcfa9b699…`, abgerufen am 2026-09-06. Der Import liest 1006 Positionen.

### 2. Faktoren

- Regulär 1,00 bis 3,00, Notdienst 2,00 bis 4,00: entspricht das der geltenden Fassung?
- Der Rechner lässt genau einen Faktor je Position zu. Ist ein einheitlicher Faktor über mehrere Positionen als Nutzerannahme vertretbar, solange er als solche erklärt wird?

### 3. Notdienstgebühr

- 50,00 € (5000 Cent), einmal je Angelegenheit, nicht je Tier und nicht je Position — trifft das zu?
- Wie ist die Abgrenzung zwischen „einschlägigem Notdienst“ und regulärer Sprechstunde in der Praxis zu formulieren, damit ein Nutzer den richtigen Kontext wählt? Der Rechner leitet den Kontext bewusst nicht aus der Uhrzeit ab.

### 4. Umsatzsteuer

- 19 Prozent auf die Gesamtsumme einschließlich Notdienstgebühr: ist das die richtige Behandlung, oder gibt es Zeilentypen mit abweichender Steuerbehandlung?
- Auslagen sind derzeit nicht Teil der Rechnung. Genügt das?

### 5. Rundung

- Gerundet wird je Position: Basissatz × Faktor kaufmännisch auf den Cent, danach × Menge. Ist diese Reihenfolge die übliche?

### 6. Doppelbewertungen (§ 6 GOT)

- Der Rechner verhindert, dass dieselbe Position zweimal in einer Rechnung steht. Er kennt aber **keine** Regeln darüber, welche Position welche andere bereits enthält. Ist das als Einschränkung ausreichend benannt, oder braucht es eine belegte Zuordnungstabelle, bevor der Rechner öffentlich wird?

### 7. Darstellung

- Reicht der Hinweis „kein amtlicher Rechner, kein Kostenvoranschlag“ in der jetzigen Form?
- Ist die Liste der nicht enthaltenen Posten (Arzneimittel und Verbrauchsmaterial, Fremdlabor, Wegegeld, Umsatzsteuer auf gesondert berechnete Auslagen, nicht ausgewählte Leistungen) vollständig genug?

### 8. Szenarien

Zwei Vorlagen liegen vor, beide ungeprüft:

| Szenario | Positionen | Status |
|---|---|---|
| `beratung-ohne-untersuchung` | lfd. Nr. 1, Menge 1, Faktor 1 | ungeprüft |
| `allgemeine-untersuchung-hund` | lfd. Nr. 16, Menge 1, Faktor 1 | ungeprüft |

Jede Vorlage wird einzeln abgenommen. Ohne Abnahme zeigt der Rechner keine Gesamtschätzung für sie, und es entsteht keine Leistungsseite.

## Wie eine Freigabe eingetragen wird

1. Prüfende Person, Datum und Ergebnis in diesem Dokument festhalten — mit den konkreten Antworten auf die Punkte 1 bis 8, nicht als pauschales „geprüft“.
2. Je freigegebenem Szenario in `content-data/cost-scenarios/<id>.json`: `clinicalReview` auf `approved`, `reviewedAt` und `reviewedBy` setzen. Das Schema lehnt eine halbe Freigabe ab.
3. `clinicalReview` in `config/costs/DE.json` auf `approved` setzen.
4. Feature Flag `costs` in `config/markets/DE.json` auf `true`.
5. `costsRules` in `config/launch.json` auf `approved` mit Datum und Verweis auf dieses Dokument.

Erst Schritt 4 macht den Rechner öffentlich. Die Schritte davor sind Voraussetzung, nicht Formsache.
