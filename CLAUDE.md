# PetAtlas — Ausführungsregeln

## Auftrag
Baue die im Planungspaket spezifizierte Haustierplattform tatsächlich, nicht nur einen weiteren Plan.
Startmarkt Deutschland; Europa und USA nur architektonisch vorbereiten.
Arbeite selbstständig an ausführbaren Aufgaben weiter, bis ein sauberer Checkpoint erreicht ist.
Dieses Paket ist die Spezifikation; die Website ist zu Beginn noch nicht implementiert.

## Zuerst lesen
1. README.md und docs/DECISIONS.md.
2. project/tasks.json, docs/STATUS.md, docs/BLOCKERS.md, docs/HANDOFF.md.
3. Den aktuell betroffenen Abschnitt von docs/MILESTONES.md.
4. Passende Abschnitte von ARCHITECTURE, DATA_SOURCES, OPERATIONS und QUALITY_GATES in docs/.
Die vollständige IMPLEMENTIERUNGSPLAN.md ist eine zusammengefasste Referenz.
Lade nicht bei jeder kleinen Aufgabe alle Dokumente erneut in den Kontext.

## Unverhandelbare technische Vorgaben
- Astro static + TypeScript strict; Cloudflare Workers Static Assets ohne Worker-Request-Logik.
- Build und Deployment bei Cloudflare; GitHub Actions für CI, offene Ingestion und Überwachung.
- Keine Laufzeitdatenbank, kein Supabase, kein D1/KV, kein SSR und kein API-Backend im Startumfang.
- Öffentlicher Code und freigegebene offene Daten; keine Secrets oder geschützten Rohfeeds im Repo.
- Affiliate-Rohfeeds nur in vertrauenswürdigen Build-Kontexten; erlaubte Ausgabeformen einzeln prüfen.
- HTML/JSON im Browser ist öffentlich. `.gitignore`, CORS oder `noindex` schaffen keine Vertraulichkeit.
- Markt, Sprache, Währung, Reiseziel und Datenquelle getrennt modellieren.
- Nur DE aktiv. Synthetische US-/EU-Fixtures dürfen nicht live oder indexierbar werden.

## Arbeitsloop
1. git status und den letzten Handoff prüfen; fremde Änderungen erhalten.
2. Nächste ausführbare Aufgabe anhand Dependencies wählen; nach Möglichkeit kleinste ID zuerst.
3. Nur diese Hauptaufgabe auf in_progress setzen und current_task aktualisieren.
4. Betroffene Spezifikation und bestehenden Code lesen.
5. Tests/Abnahmekriterien festlegen, dann implementieren.
6. Relevante Tests wirklich ausführen; UI im Browser prüfen.
7. Bei Erfolg Nachweise eintragen, Aufgabe done setzen und Status/Handoff aktualisieren.
8. Kleinen sinnvollen Commit mit Aufgaben-ID erstellen; keine Secrets oder Rohfeeds committen.
9. Ohne unnötige Rückfrage mit der nächsten unabhängigen ausführbaren Aufgabe fortfahren.

Nicht nach einem bloßen Scaffold, einem TODO-Kommentar oder ungetesteten Code aufhören.
Keine Abhängigkeiten/Testregeln abschwächen, um einen grünen Status zu erzeugen.
Keine Aufgaben als done markieren, nur weil Code geschrieben wurde.

## Blocker
Bei fehlendem Account, Secret, Vertrag oder Fachreview nur die betroffene Aufgabe blockieren.
Dokumentiere: Ursache, benötigte Aktion, zuständiger Entscheider, unabhängige Folgeaufgabe.
Nutze klar synthetische Fixtures für Entwicklung; produktive Features bleiben bei Bedarf aus.
Nach drei erfolglosen ernsthaften Korrekturversuchen Ursache dokumentieren, dann neu bewerten.
Der ausführliche Arbeits- und Fehlerloop mit der Dreierregel steht in docs/AUTONOMY.md.
Keine Endlosschleife, kein Umgehen von Limits, Captchas, Lizenz- oder Freigabesystemen.
Stelle keine Rückfragen zu Entscheidungen, die bereits in den ADRs festgelegt sind.
Eine echte nicht lösbare externe Voraussetzung darf als Blocker gemeldet werden.

## Sicherheit und Außenwirkung
Lokale Änderungen/Tests/Commits sind erlaubt. Eindeutig autorisierte Projekt-Remotes verwenden.
Kein fremdes privates Repo auf public umstellen und keine bestehende Historie zerstören.
Keine kostenpflichtigen Ressourcen, Domainkäufe oder Zusatzabonnements ohne Freigabe.
Keine Mail, Bewerbung für Partnerprogramme oder rechtsverbindliche Zustimmung im Namen des Betreibers.
Keine echte öffentliche Produktionsfreigabe ohne erfüllte und dokumentierte Launch-Gates.
Kein pauschales --dangerously-skip-permissions als Standard; arbeite mit minimal nötigen Rechten.
Untrusted PRs/Forks dürfen keine Produktions-/Affiliate-Secrets erhalten.
Die konkrete Liste erlaubter, freigabepflichtiger und verbotener Aktionen steht in docs/SECURITY_SCOPE.md.

## Inhalt und Recht
Keine erfundenen Tierarztpreise, Bewertungen, Tests, Partnerverträge, Zulassungen oder Autoren.
Keine Diagnose-/Dosierungs-/Behandlungsengine und keine profilbasierte Versicherungsrangliste.
Pflege-/Spielzeugmatching verwendet belegte Produktattribute, nicht erfundene medizinische Eignung.
Reise- und Gebührenregeln benötigen nachvollziehbare Quellen, Geltung und tatsächliche Fachfreigaben.
Unbekannt ist nicht erfüllt, kostenlos, ungefährlich oder geeignet.
Datenrechte einschließlich öffentlicher JSON-Weitergabe und ODbL-Pflichten prüfen.
Keine pauschale MIT-Lizenz auf fremde Daten/Bilder legen.

## Statusantwort
Auf „Status?“ oder „Status M12?“ antworte aus project/tasks.json und echten Testnachweisen:
Meilenstein; aktuelle Aufgabe; erledigt/gesamt; letzter Test; Blocker; nächster Schritt.
Keine prozentuale Zeitschätzung. Erledigte Aufgabenanteile als Aufgabenanteile benennen.
Nach jedem Meilenstein kurze sachliche Zusammenfassung; bei wichtigem Blocker sofort informieren.

## Kontextende / Sitzungsunterbrechung
STATUS, BLOCKERS, WORKLOG, HANDOFF und current_task aktualisieren.
Exakt benennen: geänderte Dateien, letzte Tests, verbleibender Fehler, nächster ausführbarer Schritt.
Keine Behauptung, Arbeit laufe weiter, wenn der Prozess/Sitzung beendet ist.
Frische Sitzung beginnt beim Handoff, nicht beim erneuten Erfinden der Architektur.

## Befehle
Bereits im Planungspaket vorhanden:
`python3 scripts/project_status.py`
`python3 scripts/project_status.py --milestone M08`
`python3 scripts/project_status.py --validate`
`python3 scripts/test_project_status.py`
Die npm-Produktbefehle werden gemäß QUALITY_GATES.md erst implementiert.
