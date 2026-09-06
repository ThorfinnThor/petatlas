# Arbeits- und Fehlerloop

Festgelegt in M02-05. Ergänzt den Kurzloop in `CLAUDE.md` um das Verhalten im Fehlerfall.

## Loop je Aufgabe

1. **Lesen.** `git status`, `docs/HANDOFF.md`, `npm run status`. Fremde Änderungen bleiben erhalten.
2. **Wählen.** Nächste ausführbare Aufgabe nach Abhängigkeiten, bei Gleichstand die kleinste ID. Nur diese eine Aufgabe wird `in_progress`, und `current_task` zeigt auf sie.
3. **Spezifikation lesen.** Der betroffene Abschnitt von `docs/MILESTONES.md` und die dort genannten Fachdokumente. Nicht bei jeder Kleinigkeit alle Dokumente neu laden.
4. **Abnahme festlegen.** Vor der Implementierung notieren, welcher Befehl welches Ergebnis liefern muss. Ein Kriterium, das man erst nach dem Ergebnis formuliert, ist kein Kriterium.
5. **Implementieren.**
6. **Prüfen.** Die Prüfkette tatsächlich ausführen: `npm run lint && npm run typecheck && npm run format:check && npm run test:unit && npm run check:security`, bei UI-Änderungen zusätzlich `npx playwright test`.
7. **Nachweisen.** `scripts/task_update.py` mit Beschreibung, Referenz, Datum und dem tatsächlich gelaufenen Befehl. Kein `done` ohne Nachweis.
8. **Committen.** Kleiner Commit mit Aufgaben-ID. Keine Secrets, keine Rohfeeds, keine Buildreste.
9. **Weiter.** Nächste unabhängige ausführbare Aufgabe, ohne Rückfrage zu bereits in ADRs entschiedenen Punkten.

## Fehlerfall: die Dreierregel

Ein Versuch ist ein *ernsthafter* Korrekturversuch, wenn er eine benannte Hypothese prüft. Dieselbe Änderung erneut auszuführen zählt nicht.

- **Versuch 1–3:** Ursache eingrenzen, Hypothese notieren, korrigieren, erneut prüfen.
- **Nach dem dritten erfolglosen Versuch:** anhalten. Ursache, die drei Hypothesen und die tatsächlichen Messwerte in `docs/BLOCKERS.md` eintragen, die Aufgabe neu bewerten und an einer unabhängigen Aufgabe weiterarbeiten.

Keine Endlosschleife. Kein viertes Mal dasselbe.

## Was nie als Fortschritt zählt

- Einen Test löschen, `skip` setzen, eine Erwartung an das falsche Ergebnis anpassen oder eine Regel abschwächen, damit die Kette grün wird.
- Eine Abhängigkeit im Manifest entfernen, um eine Aufgabe früher ausführbar zu machen.
- `done` setzen, weil Code geschrieben wurde, aber die Prüfung nicht gelaufen ist.
- Einen Erwartungswert mit derselben Implementierung erzeugen, die geprüft werden soll.
- Ein Gate in `config/launch.json` selbst auf `true` setzen.
- Eine externe Freigabe, einen Vertrag, ein Testergebnis oder eine Fachprüfung behaupten, die es nicht gibt.

Ist ein Test rot, weil die Erwartung falsch war, wird die Erwartung mit Begründung im Commit korrigiert — das ist etwas anderes als Grünmachen und muss als solches benannt werden.

## Grenze zwischen Blocker und Fehler

| Lage | Verhalten |
|---|---|
| Code funktioniert nicht | Dreierregel, dann Blocker mit Messwerten |
| Externe Freigabe fehlt (Account, Secret, Vertrag, Fachreview) | nur die betroffene Aufgabe blockieren, Entscheider benennen, unabhängig weiterarbeiten |
| Entscheidung steht bereits in einer ADR | nicht nachfragen, umsetzen |
| Entscheidung ist neu und fachlich/rechtlich folgenreich | Betreiber fragen, bis dahin an unabhängigen Aufgaben arbeiten |

Eine offene externe Voraussetzung ist erst dann ein Blocker, wenn die betroffene Aufgabe tatsächlich ansteht. Bis dahin steht sie im Register in `docs/EXTERNAL_SETUP.md`.
