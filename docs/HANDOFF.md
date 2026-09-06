# Handoff

Stand: 2026-09-06, Ende Sitzung 1.

## Tatsächlicher Zustand

Projektpfad `~/Projects/pet-platform`. Branch `main`, `origin` = https://github.com/ThorfinnThor/petatlas (public), Stand gepusht. **13 von 120 Aufgaben erledigt: M00 und M01 vollständig, M02-01.**

Vorhanden: Projektvertrag und Autonomierahmen; Astro 7 static mit TypeScript 6 strict; ESLint, Prettier, Vitest, Playwright mit gepinnten Versionen und Begründung in `docs/TOOLCHAIN.md`; Secret-Audit über Repo und `dist/`; explizite Build-Modi; BaseLayout, Startseite, 404 und technische Formularprobe mit grünem Browser-Smoke.

Nicht vorhanden: Cloudflare, GitHub-Actions-Workflows, Domain, Betreiberangaben, Domänenmodelle, echte Daten, Inhalte, Partnerverträge, Fachfreigaben.

## Umgebung

Node v24.19.0, npm 11.17.0, Python 3.13.15. Für jeden npm-Befehl:

```
export NODE_EXTRA_CA_CERTS="$PWD/.work/ca/system-roots.pem"
```

Fehlt die Datei, mit `security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > .work/ca/system-roots.pem` neu erzeugen. Ohne sie scheitert npm an `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`. `strict-ssl` bleibt aktiv; die TLS-Prüfung wird nicht abgeschaltet.

## Nächster ausführbarer Schritt

Zwei unabhängig ausführbare Aufgaben:

- **M02-02 — Statuswerkzeug integrieren:** npm-Alias für den Statushelfer, Meilensteinfilter und JSON-Ausgabe prüfen. `npm run status` und `npm run status:validate` existieren bereits; die Abnahme verlangt einen belegten Lauf inklusive Meilensteinfilter.
- **M03-01 — Markt- und Locale-Schemas bauen:** Beginn der Domänenmodelle. `templates/markets.example.json` ist die Vorlage; ADR-010 trennt Markt, Sprache, Währung und geografisches Ziel.

Wiederkehrende Prüfkette vor jedem Commit: `npm run lint && npm run typecheck && npm run format:check && npm run test:unit && npm run check:security`, bei UI-Änderungen zusätzlich `npx playwright test`.

## Nächste externe Freigabe

Cloudflare-Account und Repo-Anbindung, erstmals nötig für **M07-03**. Bis dahin ist nichts blockiert.

## Erledigte Entscheidung

M01-02 ist erledigt: Der Betreiber hat `ThorfinnThor/petatlas` zugewiesen; das Repo wurde neu angelegt, nicht umgestellt. Details in `docs/REPOSITORY.md`.

## Nicht voraussetzen

Echte Domain, Betreiberangaben, GitHub-Inhaber, Cloudflare-Verbindung, Affiliate-Secrets, veröffentlichungsfähige Partnerfeeds oder erfolgte medizinisch/rechtliche Freigaben. Alle Gates in `config/launch.json` stehen auf `false`.
