# Deployment-Nachweise

Stand 2026-09-21. Hier stehen nur Dinge, die tatsächlich passiert sind.

## Produktionsdeployment vom 21.09.2026

| | |
|---|---|
| Hauptadresse | https://wauandmiau.de |
| Typ | Cloudflare Workers Static Assets, statischer Produktionsbuild |
| Deployter Commit | `f1e272df3dc26ccb90205ee86a737dd9723ba2f7` |
| Build-Modus | `production`, indexierbar, Datenquelle `published` |
| Build-Zeit | `2026-09-21T21:48:15.662Z` |
| Build-Nachweis | https://wauandmiau.de/build-info.json |
| Gesundheitsdaten | https://wauandmiau.de/data/v1/health.json |
| GitHub-PR | https://github.com/ThorfinnThor/petatlas/pull/53 |
| GitHub-CI auf dem Merge-Commit | CI und Security erfolgreich |

Der ausgelieferte Build nennt in `/build-info.json` denselben Commit für Code und
versionierte Daten. Vor dem Merge liefen die vollständige PR-CI und ein
unabhängiger Review der neun Kaufhilfen. Nach dem Merge bestanden `npm run verify`
mit 1.522 Unit-Tests sowie der indexierbare Cloudflare-Produktionsbuild mit allen
15 Prüf- und Veröffentlichungsschritten.

Die anschließende Rauchprobe erfolgte gegen die öffentliche Domain, nicht gegen
einen lokalen Server:

| Prüfung | Ergebnis |
|---|---|
| Neun Kaufhilfen unter `/de-de/produkte/` | je **200**, eigener Canonical, genau eine H1 |
| 28 Amazon-Suchlinks | Partner-ID, `sponsored nofollow noopener` und Kennzeichnung geprüft |
| Startseite | alle neun Kaufhilfen verlinkt |
| Tierarztkarte, Kostenrechner, Reisecheck, Spielzeug, Ergänzungsfuttermittel und Tierversicherung | je **200**, eigener Canonical |
| Impressum und Datenschutz | je **200**, eigener Canonical |
| unbekannte Adresse | **404** mit eigener Fehlerseite |
| Sicherheitsheader | CSP, `X-Frame-Options: DENY`, `nosniff`, COOP, Referrer- und Permissions-Policy ausgeliefert |
| initiale Kaufhilfe | keine Amazon-Unterressource; Amazon wird erst über den gekennzeichneten Link kontaktiert |

Eine Cloudflare-Version-ID wurde bei dieser Prüfung nicht über die öffentliche
Website ausgegeben und wird deshalb nicht geraten. Commit, Modus, Buildzeit und
Datenhashes sind über den veröffentlichten Build-Nachweis reproduzierbar.

## Historische Preview-Deployments bis 09.09.2026

Die folgende Tabelle dokumentiert die damalige, nicht indexierbare Vorschau. Sie
ist nicht der aktuelle Produktionsstand.

| | |
|---|---|
| Cloudflare-Projekt | `petatlas-de-preview` |
| Typ | Workers Static Assets, assets-only |
| Adresse | https://petatlas-de-preview.shuu9599.workers.dev |
| Version-ID des ersten Deployments | `ac32f696-4e03-4edb-815b-d1445cce9f11` |
| Version-ID des Deployments mit Rechner | `bea46aa2-e80d-4780-9fbf-8972cafa40b5` (2026-09-06) |
| Version-ID des Deployments mit allen Funktionen | `c0931e47-34fc-4e4b-926b-8a3bdc04c8cd` (2026-09-08) |
| Version-ID des Deployments nach dem Designvertrag | `51e7122c-06ad-441f-9ba8-4707641045a4` (2026-09-08) |
| **Version-ID des aktuellen Deployments** | **`76524399-de38-4e91-b06a-c53cf864de50` (2026-09-09, nach M20 bis M22)** |
| Deployter Commit | `b251812` |
| Build-Modus | `development` — Fixtures, sichtbarer Testdatenhinweis, `noindex` |
| Eingeschaltete Funktionen | alle acht DE-Feature-Flags, ausschließlich für die Vorschau |
| Hochgeladene Dateien | 2.836 (2.533 neu, 303 unverändert) |
| Deployt am | 2026-09-09 |

### Warum das Deployment vom 2026-09-09 (M20 bis M22)

Die Vorschau zeigte den Stand vom 8. September: ohne die 1.006 Gebührenseiten, ohne die 42 Stadtseiten, ohne die kommunalen Flächen, ohne Komponentenbibliothek, zweispaltigen Rechner, Schrittanzeige und Auswahlkarten. 12 Seiten wurden zu 1.234.

**Vor dem Ausliefern geprüft** (jeder Schritt exit 0): Output-Audit über 2.837 Dateien, SEO-Prüfung über 1.234 Seiten, Secret-Audit über 3.344 Dateien, Rechteprüfung über 22 Quellen, Rauchprobe am gebauten Verzeichnis. Danach gegen die echte Adresse: Rauchprobe bestanden mit der bekannten Warnung zu den Reiseregeln, sechs Seiten je 200, unbekannte Adresse 404.

**Dabei behoben:** `npm run build:cloudflare` erzeugte die Datendateien nicht — weder `/data/v1/manifest.json` noch `health.json`, `robots.txt` oder die Gebühren- und Ortsdaten. Ein Build allein aus diesem Befehl hätte Rechner, Karte und Futtersuche ohne Daten ausgeliefert. Die Rauchprobe über das gebaute Verzeichnis hat es gemeldet, bevor irgendetwas hochgeladen wurde; die fehlenden vier Schritte stehen jetzt im Skript.

### Warum das Deployment vom 2026-09-08 (Designvertrag)

`docs/DESIGN_SPECIFICATIONS.md` ist als verbindlicher Designvertrag ins Repository gekommen und umgesetzt worden: Tokens, Typografie, Container, Karten, Buttons, Formulare, Kopfbereich, Fuß und Startseite. Was umgesetzt ist, was bewusst abweicht und was offen bleibt, steht in `docs/DESIGN_REVIEW.md`.

Vor dem Ausliefern geprüft (jeder Schritt exit 0): Output-Audit über 444 Dateien, Secret-Audit über 910 Dateien, SEO-Gates über 60 Seiten, Rauchprobe am gebauten Verzeichnis. Danach gegen die echte Adresse: fünf Seiten je 200, unbekannte Adresse 404, Rauchprobe bestanden mit einer bekannten Warnung.

### Warum das Deployment davor

Die Vorschau zeigte drei Tage lang den Stand vom 6. September: ohne Karte, Reisecheck, Futter, Profil, ohne die beiden Rechtsseiten und ohne den Designdurchgang. Wer sie ansah, sah einen Rohbau und hielt ihn für den aktuellen Stand.

**Vor dem Ausliefern geprüft** (jeder Schritt exit 0): Output-Audit über 443 Dateien, Secret-Audit über 902 Dateien, Rechteprüfung, SEO-Gates, Rauchprobe am gebauten Verzeichnis. Erst danach `wrangler deploy -c wrangler.preview.jsonc`.

## Historischer Stand vor der Produktionsfreigabe

Die folgenden Aussagen galten ausschließlich für die Preview-Deployments bis
09.09.2026: Das Produktionsprojekt, die Domain, die Betreiberangaben und die
Launch-Freigaben waren damals noch nicht eingerichtet. Seit der späteren
Freigabe sind `wauandmiau.de`, der Produktionsbuild und die in
`config/launch.json` dokumentierten Gates aktiv. Die alten Messwerte darunter
bleiben als historische Nachweise erhalten.

## Smoke-Test gegen das laufende Deployment (2026-09-08)

`node scripts/monitor/smoke.ts --base https://petatlas-de-preview.shuu9599.workers.dev` — **bestanden**, eine Warnung: zwei Datensätze ohne bekanntes Alter (Ortsdaten und Reiseregeln, beides dokumentiert).

| Prüfung | Ergebnis |
|---|---|
| `/`, `/de-de/`, `/de-de/tierarztkosten/`, `/de-de/tierarzt-karte/`, `/de-de/reisecheck/`, `/de-de/futter/`, `/de-de/methodik/`, `/de-de/barrierefreiheit/` | je **200** |
| `/gibt-es-nicht/` | **404** mit eigener Fehlerseite |
| `/de-de/quellen` ohne Schrägstrich | **307** auf die Fassung mit Schrägstrich |
| `Content-Security-Policy` | vollständig ausgeliefert, `default-src 'self'`, Kachelhost nur unter `img-src` |
| `X-Frame-Options` | `DENY` |
| `Cache-Control` für HTML | `max-age=0, must-revalidate` |
| `robots.txt` | `Disallow: /` — die Vorschau ist nicht zur Indexierung bestimmt |

## Smoke-Test des ersten Deployments (2026-09-06)

Ausgeführt gegen die echte Adresse, nicht lokal:

| Prüfung | Ergebnis |
|---|---|
| `/` | 200 (Weiterleitungsseite auf den aktiven Markt) |
| `/de-de/` | 200 |
| `/de-de/quellen/` | 200 |
| `/de-de/impressum/` | 200 |
| `/gibt-es-nicht/` | **404** mit eigener Fehlerseite |
| `/de-de/tierarztkosten/` | **404** — abgeschaltete Funktion hat keine Seite |
| `/de-de/quellen` ohne Schrägstrich | **307** auf die Fassung mit Schrägstrich |
| `Content-Security-Policy` | ausgeliefert, `default-src 'self'` |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `<meta name="robots">` | `noindex, nofollow` |
| Testdatenhinweis | sichtbar auf jeder Seite |
| Konsolenfehler im Browser | keine |
| `/build-info.json` | `development`, Commit `fbbb7c17c6a2`, Node v24.19.0 |

Screenshots des laufenden Deployments: `reports/screenshots/live-start-desktop.png` und `live-start-mobil.png`. `reports/` ist nicht versioniert.

## Rechner in der Vorschau (2026-09-06)

Auf Wunsch des Betreibers ist der Tierarztkosten-Rechner in der Vorschau freigeschaltet, damit er ausprobiert werden kann: `ENABLE_FEATURES=costs npm run build:site`.

**Die versionierte Marktkonfiguration bleibt unverändert** — `costs` steht in `config/markets/DE.json` weiterhin auf `false`. Freigeschaltet ist die Vorschau, nicht die Produktion. Ein Produktionsbuild würde den Rechner nicht enthalten, und er ist ohnehin durch die Launch-Gates gesperrt.

Die Seite trägt einen sichtbaren Warnhinweis „Fachlich noch nicht geprüft“, solange `clinicalReview` nicht auf `approved` steht.

Gegen die Live-Adresse geprüft: 1006 Positionen geladen, Position 1 mit Faktor 2 und Menge 3 ergibt 80,40 € brutto, Warnhinweis sichtbar, keine Konsolenfehler.

## Einordnung

Dies ist eine **technische Vorschau** im Sinne der Freigabestufe A aus `docs/QUALITY_GATES.md`: Kerncode und Tests, klar gekennzeichnete Fixtures, kein behaupteter Live-Datenbetrieb, kein Monetarisierungsversprechen.

Die Adresse ist öffentlich erreichbar, wer sie kennt. `noindex` hält Suchmaschinen fern, ist aber keine Zugriffssperre — deshalb enthält der Build keine vertraulichen Daten (`docs/CLOUDFLARE_SETUP.md`).

## Wiederholen

```
export NODE_EXTRA_CA_CERTS="$PWD/.work/ca/system-roots.pem"
npm run build:cloudflare
npx wrangler deploy --config wrangler.preview.jsonc
```

Ohne `NODE_EXTRA_CA_CERTS` scheitert wrangler auf dieser Maschine mit „fetch failed“.
