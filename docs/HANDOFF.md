# Handoff

Stand: 2026-09-06, Ende Sitzung 1.

## Tatsächlicher Zustand

Lokales Git-Repository auf Branch `main`, **kein Remote**. 9 Commits. 8 von 120 Aufgaben erledigt: M00 vollständig, M01-01, M02-01.

Vorhanden: Projektvertrag (`config/launch.json`), zentrale Benennung (`config/site.ts`), Autonomierahmen (`docs/SECURITY_SCOPE.md`), Lizenzgrenzen (`licenses/README.md`), Astro-7-Scaffold mit statischem Build und eine minimale `noindex`-Startseite, Statuswerkzeug plus Schreibwerkzeug `scripts/task_update.py`.

Nicht vorhanden: GitHub-Repo, Cloudflare, Domain, Lint/Test-Toolchain, Datenmodelle, Inhalte, Partnerverträge, Fachfreigaben.

## Umgebung

Node v24.19.0, npm 11.17.0, Python 3.13.15. Für jeden npm-Befehl:

```
export NODE_EXTRA_CA_CERTS="$PWD/.work/ca/system-roots.pem"
```

Fehlt die Datei, mit `security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > .work/ca/system-roots.pem` neu erzeugen. Ohne sie scheitert npm an `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`. `strict-ssl` bleibt aktiv; die TLS-Prüfung wird nicht abgeschaltet.

## Nächster ausführbarer Schritt

**M01-03 — Basisqualität installieren:** ESLint, Prettier, Vitest, Playwright konfigurieren, Versionen pinnen und in `docs/TOOLCHAIN.md` begründen. Abnahme verlangt den Nachweis, dass ein absichtlich eingeführter Typ- oder Lintfehler die Pipeline scheitern lässt.

Danach unabhängig möglich: M02-02, M03-01.

## Offene Entscheidung des Betreibers

**M01-02 — öffentliches Repository.** Vorgefunden ist eine authentifizierte GitHub-CLI-Sitzung für `ThorfinnThor`. Das ist keine Zuweisung. Benötigt: Inhaber (Konto oder Organisation) und Repo-Name. Bis dahin bleibt die Aufgabe `todo`, nicht `blocked` — es wird lokal weitergearbeitet, und M01-03 hängt nicht davon ab.

## Nicht voraussetzen

Echte Domain, Betreiberangaben, GitHub-Inhaber, Cloudflare-Verbindung, Affiliate-Secrets, veröffentlichungsfähige Partnerfeeds oder erfolgte medizinisch/rechtliche Freigaben. Alle Gates in `config/launch.json` stehen auf `false`.
