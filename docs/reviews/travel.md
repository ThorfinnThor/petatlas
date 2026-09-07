# Freigabe der Reiseregeln

**Status: nicht freigegeben.** `content-data/travel/approvals.json` ist leer, `config/launch.json` führt das Gate `travelRules` auf `approved: false`, und der Reisecheck läuft in der Vorschau: einzelne Punkte werden ausgewertet, ein positives Gesamtergebnis entsteht nicht.

Dieses Dokument ist die Checkliste für den Tag, an dem sich das ändern soll. Es ist **keine Rechtsberatung** und keine fachliche Prüfung, sondern die Aufstellung dessen, was geprüft und belegt sein muss.

## Was technisch bereits steht (M12-01 bis M12-05)

| | |
|---|---|
| Umfang | `content-data/travel/scope.json` — vier Ziele, zehn ausdrücklich nicht geprüfte Fälle |
| Regelmaschine | `src/features/travel/engine.ts` — sieben feste Prädikate, vier Ergebniszustände, kein Code aus Daten |
| Regeln | `content-data/travel/rules/eu-intra-2026.json` — fünf Anforderungen mit Fundstelle, daraus 40 Einzelregeln |
| Oberfläche | `/de-de/reisecheck/` mit Formular und Checkliste, vier Zielseiten mit Packliste |
| Freigabemechanik | `src/features/travel/freigabe.ts` — Freigabe plus Signatur des geprüften Inhalts |

## Die Sperre bei Quelländerung

Eine Freigabe nennt die **Signatur des Inhalts, den sie geprüft hat**. Ändert sich der Regelsatz — eine Frist, ein Wortlaut, eine Fundstelle, ein Zielland —, passt die Signatur nicht mehr, und der Check fällt automatisch in die Vorschau zurück. Niemand muss daran denken.

Die Signatur deckt Rechtsgrundlage, Geltungsbeginn, Anwendungsbereich und je Anforderung Fundstelle, Hinweistext und Bedingung ab. Bloße Anmerkungen und Abrufdaten der Quellen ändern sie nicht: sie sagen nichts über den fachlichen Inhalt.

Sie ist ein **Änderungsmelder, keine Sicherheitsmaßnahme**. Gegen ein versehentliches „ach, das ist doch dasselbe“ hilft sie; gegen absichtliche Manipulation im eigenen Repository nicht, und das soll sie auch nicht.

## Prüfpunkte

1. **Rechtsgrundlage.** Ist die Delegierte Verordnung (EU) 2026/131 zum Zeitpunkt der Prüfung noch die geltende Grundlage, und stimmt der Anwendungsbeginn 22.04.2026?
2. **Die fünf Anforderungen.** Sind Kennzeichnung (Art. 7), Tollwutimpfung (Art. 8 i. V. m. Anhang VII Teil 1 der Delegierten Verordnung (EU) 2020/688), Identifizierungsdokument (Art. 11), Begleitung (Art. 3/4) und Höchstzahl (Art. 3) vollständig und richtig wiedergegeben?
3. **Die Umrechnung.** „Mindestens zwölf Wochen alt“ ist als 84 Tage gerechnet, die Wartezeit als 21 Tage zwischen Impfung und Reisetag. Ist beides so zutreffend?
4. **Fehlende Anforderungen.** Fehlt für die vier Ziele etwas — Bandwurmbehandlung (nach Art. 10 hier nicht einschlägig), Übergangsregeln für ältere Ausweise, Sonderfälle?
5. **Nationale Sonderregeln.** Welche Vorschriften der vier Zielstaaten kommen hinzu, insbesondere Rasse-, Leinen- oder Maulkorbvorschriften? Die gelesenen Quellen reichten dafür nicht (siehe `docs/reviews/travel-sources.md`).
6. **Umfang.** Ist der Zuschnitt vertretbar — vier Ziele, private begleitete Reise, Tiere ab zwölf Monaten, bis zu fünf Tiere —, und sind die zehn ausgeschlossenen Fälle richtig ausgeschlossen?
7. **Darstellung.** Genügen die Hinweise, dass nicht geprüft nicht unzulässig heißt und dass die verbindliche Auskunft von der Behörde kommt?
8. **Testmatrix.** Deckt sie ab: je Ziel und Tierart alle fünf Anforderungen, je Anforderung erfüllt / nicht erfüllt / unbekannt, Fristen am Grenztag, Geltung vor Beginn und nach Ende, nicht unterstützte Fälle?

## Freigabeschritte

1. Die acht Prüfpunkte hier beantworten, mit Datum, Namen der prüfenden Person und der ausdrücklichen Angabe, worauf sich die Prüfung stützt.
2. Signatur des geprüften Regelsatzes bestimmen: `node --input-type=module -e "const f = await import('./src/features/travel/freigabe.ts'); console.log(f.freigabeStand());"`
3. Eintrag in `content-data/travel/approvals.json` anlegen: `ruleSetId`, `approvedAt`, `approvedBy`, `sourceDigest` (genau diese Signatur) und `evidence` (Verweis auf dieses Dokument).
4. `npx vitest run tests/travel` ausführen. Die Tests dürfen dafür nicht geändert werden.
5. `config/launch.json`, Gate `travelRules`, auf `approved: true` setzen — durch die zuständige Person, mit Nachweis hier.
6. Erst danach ein Produktionsdeployment mit eingeschaltetem Feature `travel`.

## Anmerkung

Solange Schritt 1 nicht durch eine Person mit einschlägiger Qualifikation erfolgt ist, bleibt der Check in der Vorschau. Das ist kein Zwischenzustand, den man „vorläufig“ überspringen kann: die Vorschau ist im Motor verankert, und ein positives Gesamtergebnis entsteht dort nicht.
