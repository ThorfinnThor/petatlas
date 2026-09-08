# Deployment-Nachweise

Stand 2026-09-08. Hier stehen nur Dinge, die tatsächlich passiert sind.

## Was existiert

| | |
|---|---|
| Cloudflare-Projekt | `petatlas-de-preview` |
| Typ | Workers Static Assets, assets-only |
| Adresse | https://petatlas-de-preview.shuu9599.workers.dev |
| Version-ID des ersten Deployments | `ac32f696-4e03-4edb-815b-d1445cce9f11` |
| Version-ID des Deployments mit Rechner | `bea46aa2-e80d-4780-9fbf-8972cafa40b5` (2026-09-06) |
| Version-ID des Deployments mit allen Funktionen | `c0931e47-34fc-4e4b-926b-8a3bdc04c8cd` (2026-09-08) |
| **Version-ID des aktuellen Deployments** | **`51e7122c-06ad-441f-9ba8-4707641045a4` (2026-09-08, nach dem Designvertrag)** |
| Deployter Commit | `03a6e70` |
| Build-Modus | `development` — Fixtures, sichtbarer Testdatenhinweis, `noindex` |
| Eingeschaltete Funktionen | alle acht DE-Feature-Flags, ausschließlich für die Vorschau |
| Hochgeladene Dateien | 443 (427 neu, 15 unverändert) |
| Deployt am | 2026-09-08, auf ausdrückliche Freigabe des Betreibers |

### Warum das Deployment vom 2026-09-08 (Designvertrag)

`docs/DESIGN_SPECIFICATIONS.md` ist als verbindlicher Designvertrag ins Repository gekommen und umgesetzt worden: Tokens, Typografie, Container, Karten, Buttons, Formulare, Kopfbereich, Fuß und Startseite. Was umgesetzt ist, was bewusst abweicht und was offen bleibt, steht in `docs/DESIGN_REVIEW.md`.

Vor dem Ausliefern geprüft (jeder Schritt exit 0): Output-Audit über 444 Dateien, Secret-Audit über 910 Dateien, SEO-Gates über 60 Seiten, Rauchprobe am gebauten Verzeichnis. Danach gegen die echte Adresse: fünf Seiten je 200, unbekannte Adresse 404, Rauchprobe bestanden mit einer bekannten Warnung.

### Warum das Deployment davor

Die Vorschau zeigte drei Tage lang den Stand vom 6. September: ohne Karte, Reisecheck, Futter, Profil, ohne die beiden Rechtsseiten und ohne den Designdurchgang. Wer sie ansah, sah einen Rohbau und hielt ihn für den aktuellen Stand.

**Vor dem Ausliefern geprüft** (jeder Schritt exit 0): Output-Audit über 443 Dateien, Secret-Audit über 902 Dateien, Rechteprüfung, SEO-Gates, Rauchprobe am gebauten Verzeichnis. Erst danach `wrangler deploy -c wrangler.preview.jsonc`.

## Was ausdrücklich **nicht** existiert

- **Das Produktionsprojekt `petatlas-de` ist nicht angelegt.** Es gibt nichts Produktionsreifes: keine Domain, keine Betreiberangaben, keine fachlich freigegebene Funktion, und alle Gates in `config/launch.json` stehen auf `false`. Ein leeres Produktionsprojekt anzulegen wäre eine Behauptung ohne Inhalt.
- **Keine Git-Integration.** Cloudflare Builds ist nicht mit dem Repository verbunden; dieses Deployment lief über `wrangler deploy` von der Entwicklungsmaschine. Die Anbindung folgt, wenn es etwas zu veröffentlichen gibt.
- **Keine Domain, kein DNS-Eintrag, keine Secrets** im Cloudflare-Projekt.
- **Kein Produktionsdeployment.** `npm run build:production` bricht weiterhin ab.

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
