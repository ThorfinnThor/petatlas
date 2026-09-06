# Handoff

Stand: 2026-09-06, Sitzung 3.

Eine frische Sitzung beginnt hier, nicht beim erneuten Erfinden der Architektur. Reihenfolge: `CLAUDE.md`, dieses Dokument, `npm run status`, dann der betroffene Abschnitt von `docs/MILESTONES.md`.

## Tatsächlicher Zustand

Projektpfad `~/Projects/pet-platform`. Branch `main`, `origin` = https://github.com/ThorfinnThor/petatlas (public), Stand gepusht.

**M00 und M01 vollständig, M02 bei 5/6 (aktuell M02-06).** Der genaue Stand steht in `project/tasks.json`; `npm run status` gibt ihn aus.

Vorhanden: Projektvertrag und Autonomierahmen; Astro 7 static mit TypeScript 6 strict; ESLint, Prettier, Vitest, Playwright mit gepinnten Versionen; Secret-Audit über Repo und `dist/`; explizite Build-Modi mit gesperrtem `production`; BaseLayout, Startseite, 404 und technische Formularprobe mit grünem Browser-Smoke; Statuswerkzeug mit Schreibwerkzeug und Konsistenzprüfung.

Nicht vorhanden: Cloudflare, GitHub-Actions-Workflows, Domain, Betreiberangaben, Domänenmodelle, echte Daten, Inhalte, Partnerverträge, Fachfreigaben.

## Umgebung

Node v24.19.0, npm 11.17.0, Python 3.13.15. Für jeden npm-Befehl:

```
export NODE_EXTRA_CA_CERTS="$PWD/.work/ca/system-roots.pem"
```

Fehlt die Datei: `security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > .work/ca/system-roots.pem`. Ohne sie scheitert npm an `UNABLE_TO_GET_ISSUER_CERT_LOCALLY`. `strict-ssl` bleibt aktiv.

Prüfkette vor jedem Commit:

```
npm run lint && npm run typecheck && npm run format:check && npm run test:unit && npm run check:security && npm run check:handoff
```

Bei UI-Änderungen zusätzlich `npx playwright test`. Ein hängengebliebener Preview-Server wird mit `npx astro preview stop` beendet.

## Nächster ausführbarer Schritt

**M02-06 — Wiederaufnahme proben** ist die aktuelle Aufgabe. Danach:

**M03-01 — Markt- und Locale-Schemas bauen.** `src/domain/market.ts`, `config/markets/`, `tests/markets.test.ts`. Markt, Sprache, Währung, Zeitzone und Reiseziel sind getrennte Konzepte (ADR-010). Abnahme: ein DE-Nutzer mit Reiseziel IT bleibt im Markt DE, und es wird keine US-Seite erzeugt. Vorlage: `templates/markets.example.json`.

## Nächste externe Freigabe

Cloudflare-Account und Repo-Anbindung, erstmals nötig für **M07-03**. Bis dahin ist nichts blockiert; alle offenen Voraussetzungen stehen im Register in `docs/EXTERNAL_SETUP.md`.

## Nicht voraussetzen

Echte Domain, Betreiberangaben, Cloudflare-Verbindung, Affiliate-Secrets, veröffentlichungsfähige Partnerfeeds oder erfolgte medizinisch/rechtliche Freigaben. Alle Gates in `config/launch.json` stehen auf `false`, und `npm run build:production` bricht deshalb absichtlich ab.
