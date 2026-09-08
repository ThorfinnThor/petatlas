# Entwicklungsumgebung einrichten

Diese Anleitung ist **nachgestellt worden**, nicht aufgeschrieben: am 2026-09-08 wurde ein frischer Clone angelegt und alles darin ausgeführt. Die Ergebnisse stehen unten mit Zahlen.

## Voraussetzungen

| Werkzeug | Version im Nachweis | Woher |
|---|---|---|
| Node | 24.19.0 | `.nvmrc` nennt die verbindliche Version |
| npm | 11.17.0 | kommt mit Node |
| Python | 3.13 | für `scripts/project_status.py` und die Handoff-Prüfung |
| Git | beliebig aktuell | |

**Kein Account, kein Secret, kein Token.** Weder für die Installation noch für Tests noch für den Build. Wer etwas anderes behauptet bekommt, hat eine falsche Anleitung.

## Einrichten

```bash
git clone <repository> petatlas
cd petatlas
npm ci
```

`npm ci` installiert genau die Versionen aus `package-lock.json`. **Nicht** `npm install` benutzen: das dürfte das Lockfile ändern, und die CI prüft, dass es unverändert bleibt.

npm meldet dabei, dass vier Pakete Installationsskripte mitbringen (`esbuild`, `fsevents`, `workerd`), die **nicht** ausgeführt wurden. Das ist so gewollt und richtig: der Build läuft ohne sie.

Für die End-to-End-Tests werden Browser gebraucht. Sie liegen außerhalb des Projekts in einem gemeinsamen Zwischenspeicher; auf einem Rechner, der noch keine hat:

```bash
npx playwright install --with-deps chromium webkit
```

## Prüfen, dass alles läuft

```bash
npm run verify        # Lint, Typecheck, Format, Unit-Tests, Secret-, Workflow-, Lizenz- und Handoff-Prüfung
npm run build:site    # statische Website samt Daten, Suchindex, Sitemap und Headern
npx playwright test   # End-to-End gegen den gebauten Stand
```

Im Nachweislauf vom 2026-09-08 ergab das in einem frischen Clone:

| Schritt | Ergebnis |
|---|---|
| `npm ci` | erfolgreich, Lockfile unverändert |
| `npm run verify` | **1273 Tests**, exit 0 |
| `npm run build:site` | **346 Dateien**, `robots.txt` verbietet die Indexierung (Entwicklungsbuild) |
| `npm run build:fixture` | erfolgreich |
| `npx playwright test` | **228 bestanden** |

## Funktionen ansehen, die noch hinter einem Flag liegen

Die meisten Werkzeuge sind im Standardbuild **aus**, weil ihre Daten oder Freigaben fehlen. Lokal lassen sie sich einschalten:

```bash
ENABLE_FEATURES=costs,map,travel,commerce,care,toys,food,profile npm run build:fixture
npx astro preview
```

`ENABLE_FEATURES` wirkt **nur** in `development`. In `preview` und `production` wird der Wert ignoriert — eine Funktion lässt sich damit ansehen, aber nicht veröffentlichen.

## Was in dieser Umgebung nicht geht — und warum das richtig ist

- **`npm run build:production` bricht ab.** Ohne echte Domain und echte Betreiberangaben gibt es keinen Produktionsbuild (ADR-015). Das ist keine Fehlkonfiguration, sondern die Sperre.
- **Der bundesweite OSM-Import läuft nicht nebenbei.** Er lädt rund 4,6 GiB und braucht etwa eine Stunde; die Snapshots liegen fertig im Repository. Einzelheiten in `docs/OSM_BENCHMARK.md`.
- **Der Gebührenabruf gelingt aus der CI heraus nicht.** Lokal schon. Warum, steht in `docs/SOURCE_REVIEWS.md`.

## Eine Eigenheit dieses Arbeitsrechners

Auf dem Rechner, auf dem dieses Projekt entstanden ist, fehlt im Node-Truststore ein Wurzelzertifikat. Gemessen am 2026-09-08 in einem frischen Clone:

| Aufruf | ohne `NODE_EXTRA_CA_CERTS` | mit |
|---|---|---|
| `npm ci`, `npm run verify`, `npm run build:site`, `npx playwright test` | funktioniert | funktioniert |
| `fetch` auf `gdi.berlin.de` (kommunale Quelle) | `SELF_SIGNED_CERT_IN_CHAIN` | HTTP 200 |
| `npx wrangler whoami` | meldet „auth token has expired“ | angemeldet |

**Das ist keine Projektvoraussetzung für Entwicklung, Build und Tests.** Nur zwei Dinge brauchen die Variable: der Abruf jener Datenquelle und `wrangler`.

Die Wrangler-Meldung ist dabei irreführend: das Token ist **nicht** abgelaufen. Der Refresh scheitert an derselben fehlenden Wurzel, und wrangler deutet das als abgelaufenes Token. Wer der Meldung glaubt, meldet sich unnötig neu an.

Auf einem betroffenen Rechner:

```bash
mkdir -p .work/ca
security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain > .work/ca/system-roots.pem
export NODE_EXTRA_CA_CERTS="$PWD/.work/ca/system-roots.pem"
```

`.work/` ist nicht versioniert. `strict-ssl` bleibt aktiv; es wird nichts abgeschaltet, sondern ein fehlender Wurzelanker ergänzt. Der Hintergrund steht in `docs/TOOLCHAIN.md`.

## Wo weitergearbeitet wird

`docs/HANDOFF.md` nennt den nächsten ausführbaren Schritt, `npm run status` den Aufgabenstand, `docs/BLOCKERS.md` die offenen externen Voraussetzungen.
