# Autonomie- und Sicherheitsrahmen

Festgelegt in M00-04. Ergänzt die Kurzregeln in `CLAUDE.md` um konkrete Grenzen. Gilt für jede Sitzung, auch nach Kontextwechsel.

## Ohne Rückfrage erlaubt

- Lesen aller Dateien im Projektverzeichnis.
- Anlegen und Ändern von Quellcode, Konfiguration, Tests, Fixtures und Dokumentation im Projektverzeichnis.
- Lokale Installation von Projektabhängigkeiten aus der öffentlichen npm-Registry mit gepinnten Versionen und Lockfile.
- Lokale Tests, Linting, Typecheck, statische Builds und lokale Preview-Server.
- Browserprüfung gegen `localhost` und gegen die im Plan genannten öffentlichen Primärquellen.
- Kleine lokale Commits auf einem lokalen Branch mit Aufgaben-ID in der Nachricht.
- Aktualisieren von `project/tasks.json`, `docs/STATUS.md`, `docs/WORKLOG.md`, `docs/BLOCKERS.md`, `docs/HANDOFF.md`.

## Nur nach ausdrücklicher Freigabe des Betreibers

- Anlegen eines GitHub-Repositories, Setzen eines Remotes und jeder `git push`.
- Verbinden von Cloudflare, Anlegen eines Cloudflare-Projekts, Auslösen eines Deployments.
- Setzen oder Ändern von Secrets in GitHub oder Cloudflare.
- Bewerbung um oder Annahme von Partner-/Affiliateverträgen, jede rechtsverbindliche Zustimmung.
- Domainkauf, kostenpflichtige Tarife, Zusatzabonnements.
- Versand von E-Mail oder Nachrichten im Namen des Betreibers.
- Veröffentlichen von Inhalten, deren fachliche oder rechtliche Prüfung offen ist.
- Aktivieren eines Gates in `config/launch.json`.

## Verboten

- `git push --force`, `git reset --hard` auf fremde Arbeit, Löschen oder Umschreiben bestehender Historie.
- Ein bestehendes privates Repository ohne dokumentierte Secret- und Historienprüfung auf public umstellen.
- `rm -rf` auf Pfade außerhalb von `.work/`, `.generated/`, `dist/`, `node_modules/`, `reports/`.
- Secrets, Tokens, Hook-URLs oder geschützte Affiliate-Rohfeeds in Repo, `dist/`, Browser-JSON, Logs oder Testausgaben schreiben.
- Umgehen von Rate Limits, Captchas, Lizenz-, Login- oder Freigabesystemen; Scraping entgegen `robots.txt` oder Nutzungsbedingungen.
- `--dangerously-skip-permissions` als Standardbetrieb.
- Erfundene Testergebnisse, Bewertungen, Preise, Autoren, Zulassungen oder Freigaben; Abschwächen von Tests, um einen grünen Status zu erzeugen.
- Aufgaben in `project/tasks.json` auf `done` setzen, ohne den dokumentierten Nachweis tatsächlich ausgeführt zu haben.

## Zugeordnete externe Identität

Vorgefunden ist eine authentifizierte GitHub-CLI-Sitzung für das Konto **ThorfinnThor** (Scopes `gist`, `read:org`, `repo`, `workflow`). Diese Authentifizierung ist noch **keine** Zuweisung eines Ziel-Repositories: sie erlaubt keinen Push und keine Repo-Erstellung, solange der Betreiber Inhaber und Repo-Namen nicht in `docs/EXTERNAL_SETUP.md` bestätigt hat (M01-02).

Cloudflare: keine Anmeldung, kein Projekt, keine Tokens im Projektkontext vorhanden.

## Verhalten bei Fehlern und Blockern

Nach drei ernsthaften erfolglosen Korrekturversuchen an derselben Ursache: Ursache, Versuche und Messwerte in `docs/BLOCKERS.md` erfassen, betroffene Aufgabe auf `blocked` setzen und an einer unabhängigen ausführbaren Aufgabe weiterarbeiten. Keine Endlosschleife, kein Deaktivieren von Schutzmechanismen, kein Umschreiben eines Tests auf ein bequemeres Ergebnis.

Fehlt eine externe Voraussetzung, wird nur die betroffene Integration blockiert. Entwicklung läuft mit eindeutig als synthetisch bezeichneten Fixtures weiter; diese dürfen nicht in `production` oder in indexierbare Seiten gelangen.
