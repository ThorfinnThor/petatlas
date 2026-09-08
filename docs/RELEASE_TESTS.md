# Abnahmeläufe

Ausgeführt am **2026-09-08** auf Commit `3b5f22f`, lokal: Apple Silicon, Node 24.19.0, Playwright-Browser Chromium und WebKit.

Diese Datei sagt, **was tatsächlich gelaufen ist**. Sie erklärt nichts für fertig, was nicht gelaufen ist.

## Die sechs Kernpfade

`tests/e2e-features/golden-path.spec.ts` geht jeden Pfad als Mensch durch und prüft, **was zu sehen ist** — nicht, welche Funktion gelaufen ist.

| Pfad | Ergebnis | Was geprüft wird |
|---|---|---|
| Kosten → Auskunft | bestanden | Betrag mit Währung, Fundstelle in der Verordnung („lfd. Nr.“), sichtbarer Hinweis „fachlich noch nicht geprüft“ |
| Ort → Treffer | bestanden | Trefferliste mit Namen, Statuszeile „erfasste Orte“, Quelle und Lizenz auf derselben Seite |
| Reise → Checkliste | bestanden | Ergebnis erscheint, **kein** grünes Gesamtergebnis (keine Freigabe), Länderseite mit Anforderungen und Packliste |
| Finder → Angebot | bestanden | leere Angebotsliste **mit Begründung**, keine Werbung |
| Futter → Menge und Grundpreis | bestanden | Menge „12 kg“ vorhanden, Grundpreis fehlt **mit Begründung** (kein Angebot), fehlende Nährwerte als „nicht deklariert“ statt Null |
| Profil → Löschen | bestanden | Speichern, Wiederfinden nach Neuladen, Löschen entfernt **jeden** Schlüssel |

Dazu ein siebter Fall: abgeschaltete Funktionen sind abgeschaltet — keine Angebotskarte, obwohl der Lauf alle Feature Flags an hat.

## Gesamtlauf

| Lauf | Befehl | Ergebnis |
|---|---|---|
| Prüfkette | `npm run verify` | **1273 Tests**, exit 0 |
| End-to-End (Grundzustand) | `npx playwright test` | **228 bestanden** |
| End-to-End (alle Funktionen) | `npx playwright test --config playwright.features.config.ts` | **294 bestanden** |
| Zugänglichkeit | `npm run test:accessibility` | **107 bestanden, 7 übersprungen** (Safari-Tabstopps, siehe `docs/ACCESSIBILITY.md`) |
| Leistung | `npm run test:performance` | **12 Messungen**, kein Stopp-Budget erreicht |

Die Prüfkette enthält Lint, Typecheck, Formatierung, Unit- und Vertragstests sowie die Prüfungen zu Secrets, Workflow-Härtung, Lizenzen und Handoff. In der CI kommen `check:seo` (zweimal, einmal als Probelauf mit allen Funktionen), `check:dist`, `check:budgets`, `rollback:pruefen` und `check:release` dazu.

## Was in diesen Läufen bewusst **nicht** grün ist

Diese Punkte sind keine Fehler, sondern der dokumentierte Zustand:

- **Der Reisecheck gibt kein positives Gesamtergebnis.** Es gibt keine fachliche Freigabe (B-004). Der Test prüft ausdrücklich, dass „Alle geprüften Punkte sind erfüllt“ **nicht** erscheint.
- **Der Katalog ist leer.** Es gibt keinen Partnervertrag (B-005). Der Test prüft, dass die Begründung dasteht.
- **Der Kostenrechner trägt einen Hinweis**, dass er fachlich nicht geprüft ist (B-002).
- **Kein Grundpreis beim Futter**, weil es kein Angebot gibt — mit Begründung auf der Seite.
- **Der Ortsdatensatz nennt seinen Stand nicht**; der Datenstand weist ihn als unbekannt aus (M17-04).

## Wiederholen

```bash
npm run verify
npx playwright test
npx playwright test --config playwright.features.config.ts
npm run test:accessibility
npm run test:performance
```

Die vier Playwright-Läufe bauen die Website jeweils selbst und starten einen eigenen Server auf einem eigenen Port. Sie brauchen kein Secret, keinen Account und keine Netzverbindung zu einer fremden Quelle.
