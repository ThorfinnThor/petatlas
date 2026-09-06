# Handoff

Stand: 2026-09-06, Sitzung 4.

Eine frische Sitzung beginnt hier, nicht beim erneuten Erfinden der Architektur. Reihenfolge: `CLAUDE.md`, dieses Dokument, `npm run status`, dann der betroffene Abschnitt von `docs/MILESTONES.md`.

## Tatsächlicher Zustand

Projektpfad `~/Projects/pet-platform`. Branch `main`, `origin` = https://github.com/ThorfinnThor/petatlas (public), Stand gepusht.

**M00 bis M05 vollständig (36 von 120 Aufgaben).** Der genaue Stand steht in `project/tasks.json`; `npm run status` gibt ihn aus.

Vorhanden: Projektvertrag und Autonomierahmen; Astro 7 static mit TypeScript 6 strict und voller Prüfkette; Domänenmodelle für Markt, Geld, Einheiten, Datum, Provenienz, Rechte, Fachschemas und Provider; Route Registry, Designsystem, fünf Kernseiten, statische Suche und zugängliche Formularbausteine; Quellenregister mit Publikationsklassen, Attribution, ODbL-Datenfluss und Lizenzregression.

Nicht vorhanden: Cloudflare, GitHub-Actions-Workflows, Import-System, echte Fachdaten, Rechner, Karte, Reisecheck, Katalog, Domain, Betreiberangaben, Partnerverträge, Fachfreigaben.

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

**M06-01 — Adapter-API implementieren.** Beginn des generischen Import- und Snapshot-Systems. M06 und M07-01/M07-02 laufen ohne offene Entscheidung.

Prüfkette vor jedem Commit: `npm run lint && npm run typecheck && npm run format:check && npm run test:unit && npm run check:security && npm run check:licenses && npm run check:handoff`, bei UI-Änderungen zusätzlich `npx playwright test`.

## Offene Entscheidungen des Betreibers

- **B-001 — Bezugsweg für den Gebührenkatalog (betrifft M08).** Der Verordnungstext ist nach § 5 Abs. 1 UrhG frei, aber gesetze-im-internet.de nennt keine Bedingungen für den systematischen Abruf. Details und die drei denkbaren Wege stehen in `docs/SOURCE_REVIEWS.md`. Bis dahin bleibt die Quelle `pending`; der Rechner wird gegen synthetische Fixtures gebaut.

## Nächste externe Freigabe

Cloudflare-Account und Repo-Anbindung, erstmals nötig für **M07-03**. Bis dahin ist nichts blockiert; alle offenen Voraussetzungen stehen im Register in `docs/EXTERNAL_SETUP.md`.

## Nicht voraussetzen

Echte Domain, Betreiberangaben, Cloudflare-Verbindung, Affiliate-Secrets, veröffentlichungsfähige Partnerfeeds oder erfolgte medizinisch/rechtliche Freigaben. Alle Gates in `config/launch.json` stehen auf `false`, und `npm run build:production` bricht deshalb absichtlich ab.
