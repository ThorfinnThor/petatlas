# Reisecheck: Fristenplan je Zielland — 20.10.2026

Schritt 5 der Inhaltsoffensive (`docs/CONTENT_STANDARD.md`, Seitentyp
Reisecheck: „Was brauche ich, bis wann?“, Schritt-für-Schritt-Plan mit
Fristen und amtlicher Quelle). Die vier Zielseiten (Österreich, Frankreich,
Italien, Niederlande) waren bisher gleich gebaut: Anforderungen, Landeshinweis,
Packliste – aber ohne zeitliche Reihenfolge.

## Was neu ist

- **Fristenplan** oben auf jeder Zielseite (`src/features/travel/fristen.ts`,
  `src/components/travel/TravelPlan.astro`), in zeitlicher Reihenfolge:
  1. etwa sechs Wochen vorher Ausweis prüfen und Termin machen (als
     **Empfehlung** gekennzeichnet, keine Rechtsfrist),
  2. länderspezifische Schritte (Frankreich: Hundekategorie vor der Buchung;
     Italien: Leine und Maulkorb, Route durch die Schweiz nicht abgedeckt;
     Österreich: Regeln von Bundesland und Gemeinde; Niederlande: örtliche
     Auslaufregeln),
  3. spätestens 21 Tage vor Abreise Erstimpfung abgeschlossen,
  4. Reisetag (Ausweis, Begleitung, höchstens fünf Tiere),
  5. Rückreise (Impfschutz muss noch gelten).
- **Datumsrechner:** Mit Abreise- und Rückreisedatum rechnet die Seite die
  Kalendertage aus. Ohne JavaScript stehen die relativen Fristen da. Eingaben
  verlassen den Browser nicht und werden nicht gespeichert.
- **Kurzantwort** im ersten Bildschirm, **häufige Fragen** mit FAQ-JSON-LD
  (Wartezeit, Bandwurmbehandlung, alter Ausweis; Frankreich: Listenhunde).

## Herkunft der Aussagen

- Die Fristen (21 Tage Wartezeit, 12 Wochen Mindestalter beim ersten
  Impftermin) werden aus dem freigegebenen Regelsatz
  `content-data/travel/rules/eu-intra-2026.json` **gelesen**, nicht
  abgeschrieben. Ändert sich der Regelsatz, ändert sich der Plan; ein Test
  prüft das.
- Die Landesschritte fassen nur zusammen, was in `national.ts` mit amtlicher
  Quelle steht (Quellenprüfung 09.09.2026). Neu formuliert, keine neue
  Rechtsaussage. Der Hinweis zur Schweiz folgt aus dem Umfang
  (`scope.json`: Durchreise durch Nicht-EU-Staaten nicht geprüft).
- Die Bandwurm-Antwort stammt aus den Notizen des Regelsatzes (Artikel 10),
  die Antwort zum alten Ausweis aus der Anforderung `identification-document`.

Die fachliche Freigabe vom 14.09.2026 gilt für den Regelsatz. Die neuen
Formulierungen im Plan sind redaktionell; eine Durchsicht durch die
prüfende Person ist sinnvoll, ändert aber keine Regel.

## Prüfungen

`tests/travel/fristen.test.ts` (Fristen aus dem Regelsatz, Reaktion auf eine
geänderte Frist, Reihenfolge, Quellen, Kennzeichnung der Empfehlung,
Datumsrechnung über Monats- und Jahresgrenzen), neue Browserfälle in
`tests/e2e-features/reisecheck.spec.ts` (Rechner, FAQ-JSON-LD, axe),
`npm run verify` (1570 Tests), Produktionsbuild mit `check:seo` (118
indexierbar) und `check:dist`, `design:audit` ohne Auffälligkeiten,
Feature-Suite (320) und App-Suite (82).
