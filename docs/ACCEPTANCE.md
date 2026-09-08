# Abnahmebericht

Stand **2026-09-08**. Dieser Bericht sagt, **was da ist**, was blockiert ist und was ausgeliefert würde. Er erklärt nichts für fertig.

## Aufgabenstand

| Zustand | Anzahl |
|---|---|
| erledigt, mit Nachweis | 113 |
| blockiert durch eine externe Voraussetzung | 6 |
| offen | 2 (dieser Abgleich und die Veröffentlichung selbst) |
| **gesamt** | **121** |

Jede erledigte Aufgabe trägt einen Nachweis mit Beschreibung, Fundstelle und Prüfdatum; jede blockierte nennt Ursache, benötigte Handlung und zuständige Person. `tests/status-consistency.test.ts` prüft beides — und dass diese Zahlen mit `project/tasks.json` übereinstimmen.

**Keine Hundert-Prozent-Aussage.** 113 von 121 Aufgaben sind erledigt; sechs sind blockiert, und die Blockade liegt jedes Mal außerhalb dieses Repositories.

## Was ein Besucher heute sähe

Der Standardbuild erzeugt **13 HTML-Dateien**: sieben Inhaltsseiten (Start, Quellen, Datenstand, Methodik, Impressum, Datenschutz, Barrierefreiheit), die Weiterleitung von `/`, eine Fehlerseite und vier technische Probeseiten unter `/entwicklung/`, die in `production` nicht ausgeliefert werden. Insgesamt 346 Dateien, davon der größte Teil Datenchunks.

Alle Seiten tragen `noindex`, und `robots.txt` verbietet die Indexierung — die Launch-Gates sind offen.

**Kein einziges Fachwerkzeug ist eingeschaltet.** Rechner, Karte, Reisecheck, Katalog, Pflege, Spielzeug, Futter und Profil liegen hinter Feature Flags, die in `config/markets/DE.json` auf `false` stehen.

## Was gebaut, geprüft und abgeschaltet ist

| Funktion | Zustand | Warum aus |
|---|---|---|
| Gebührenrechner | fertig, 1006 Positionen, im Browser rechenbar | fachliche Abnahme fehlt (B-002) |
| Tierarztkarte und Ortsliste | fertig, 9.381 Orte, 25 Stadtseiten | Freigabe der Datenrechte offen |
| Reisecheck | fertig, 40 Regeln aus der Delegierten Verordnung (EU) 2026/131 | fachliche Abnahme fehlt (B-004); läuft in der Vorschau ohne positives Gesamtergebnis |
| Versicherungshinweis | fertig | kein Vertrag, keine § 34d-Prüfung (B-003) |
| Angebotskatalog | fertig | kein Partnerprogramm (B-005) |
| Pflege und Spielzeug | fertig, mit synthetischen Produkten | echte Produktattribute brauchen Angebotsrechte (B-006) |
| Futter | fertig, Suche und Detailseiten | ohne Angebote kein Grundpreis |
| Profil, Merkliste, Packliste | fertig, ausschließlich lokal im Browser | an das Profil-Flag gebunden |

Mit allen Feature Flags entstehen **60 HTML-Dateien** und 443 Dateien insgesamt. Beide Zahlen sind gemessen, nicht geschätzt.

## Womit das belegt ist

| Nachweis | Umfang |
|---|---|
| `npm run verify` | 1302 Tests |
| End-to-End (Grundzustand) | 228 |
| End-to-End (alle Funktionen) | 294 |
| Zugänglichkeit (axe und Bedienung) | 107 bestanden, 7 übersprungen |
| Leistung | 12 Messungen |
| Prüfungen in der CI | Lint, Typecheck, Format, Secrets, Workflow-Härtung, Lizenzen, Handoff, SEO (zweimal), Output-Audit, Budgets, Rollback-Zulässigkeit, Freigabestand |

Berichte: `docs/RELEASE_TESTS.md`, `docs/ACCESSIBILITY.md`, `docs/PERFORMANCE.md`, `docs/BUDGET_REPORT.md`, `docs/DEVELOPER_SETUP.md`, `docs/EXPANSION.md`.

## Was fehlt

Sechs blockierte Aufgaben, alle aus demselben Grund: eine Freigabe, die ein Mensch erteilen muss.

| Aufgabe | Fehlt | Wer |
|---|---|---|
| M08-06 | fachliche Abnahme des Gebührenrechners | Betreiber mit prüfender Person |
| M09-06 | Versicherungsvertrag und § 34d-Prüfung | Betreiber mit Rechtsprüfung |
| M12-06 | fachliche Abnahme der Reiseregeln | Betreiber mit prüfender Person |
| M13-06 | Programmfreigabe eines Netzwerks | Betreiber |
| M14-06 | echte Produktattribute nach der Programmfreigabe | Betreiber |
| M18-06 | acht Launch-Gates und vier Rechtspflichten | Betreiber |

Dazu die Grenzen, die keine Freigabe auflöst: `docs/KNOWN_LIMITATIONS.md`.

## Was als Nächstes passieren müsste

1. Betreiberangaben und Domain — ohne sie bricht der Produktionsbuild ab.
2. Datenschutzerklärung auf dieser Grundlage.
3. Freigabe der Datenrechte, dann die fachlichen Abnahmen.
4. Erst danach Partnerverträge und die Veröffentlichung (M19-06).

Die Reihenfolge und die jeweiligen Nachweise stehen in `docs/reviews/launch.md`. Eingetragen werden sie von der zuständigen Person, nicht von einem Agenten.
