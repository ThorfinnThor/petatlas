# Handoff

Stand: 2026-09-06, Ende Sitzung 1.

## Tatsächlicher Zustand

Projektpfad `~/Projects/pet-platform`. Git-Repository auf Branch `main` mit `origin` = https://github.com/ThorfinnThor/petatlas (public), Stand gepusht. 9 von 120 Aufgaben erledigt: M00 vollständig, M01-01, M01-02, M02-01.

Vorhanden: Projektvertrag (`config/launch.json`), zentrale Benennung (`config/site.ts`), Autonomierahmen (`docs/SECURITY_SCOPE.md`), Lizenzgrenzen (`licenses/README.md`), Astro-7-Scaffold mit statischem Build und eine minimale `noindex`-Startseite, Statuswerkzeug plus Schreibwerkzeug `scripts/task_update.py`.

Nicht vorhanden: Cloudflare, Domain, Lint/Test-Toolchain, Datenmodelle, Inhalte, Partnerverträge, Fachfreigaben.

## Umgebung

Node v24.19.0, npm 11.17.0, Python 3.13.15. Für jeden npm-Befehl:

```
export NODE_EXTRA_CA_CERTS="$PWD/.work/ca/system-roots.pem"
```

Fehlt die Datei, mit `security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > .work/ca/system-roots.pem` neu erzeugen. Ohne sie scheitert npm an `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`. `strict-ssl` bleibt aktiv; die TLS-Prüfung wird nicht abgeschaltet.

## Nächster ausführbarer Schritt

**M01-03 — Basisqualität installieren:** ESLint, Prettier, Vitest, Playwright konfigurieren, Versionen pinnen und in `docs/TOOLCHAIN.md` begründen. Abnahme verlangt den Nachweis, dass ein absichtlich eingeführter Typ- oder Lintfehler die Pipeline scheitern lässt.

Danach unabhängig möglich: M02-02, M03-01.

## Erledigte Entscheidung

M01-02 ist erledigt: Der Betreiber hat `ThorfinnThor/petatlas` zugewiesen; das Repo wurde neu angelegt, nicht umgestellt. Details in `docs/REPOSITORY.md`.

## Nicht voraussetzen

Echte Domain, Betreiberangaben, GitHub-Inhaber, Cloudflare-Verbindung, Affiliate-Secrets, veröffentlichungsfähige Partnerfeeds oder erfolgte medizinisch/rechtliche Freigaben. Alle Gates in `config/launch.json` stehen auf `false`.
