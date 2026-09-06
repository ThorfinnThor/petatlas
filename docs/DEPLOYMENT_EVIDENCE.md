# Deployment-Nachweise

Stand 2026-09-06 (M07-06). Hier stehen nur Dinge, die tatsächlich passiert sind.

## Was existiert

| | |
|---|---|
| Cloudflare-Projekt | `petatlas-de-preview` |
| Typ | Workers Static Assets, assets-only |
| Adresse | https://petatlas-de-preview.shuu9599.workers.dev |
| Version-ID des ersten Deployments | `ac32f696-4e03-4edb-815b-d1445cce9f11` |
| Deployter Commit | `fbbb7c17c6a29eb5d6601ee93ee46d8e2e289b46` |
| Build-Modus | `development` — Fixtures, sichtbarer Testdatenhinweis, `noindex` |
| Hochgeladene Dateien | 32 |
| Deployt am | 2026-09-06 |

## Was ausdrücklich **nicht** existiert

- **Das Produktionsprojekt `petatlas-de` ist nicht angelegt.** Es gibt nichts Produktionsreifes: keine Domain, keine Betreiberangaben, keine fachlich freigegebene Funktion, und alle Gates in `config/launch.json` stehen auf `false`. Ein leeres Produktionsprojekt anzulegen wäre eine Behauptung ohne Inhalt.
- **Keine Git-Integration.** Cloudflare Builds ist nicht mit dem Repository verbunden; dieses Deployment lief über `wrangler deploy` von der Entwicklungsmaschine. Die Anbindung folgt, wenn es etwas zu veröffentlichen gibt.
- **Keine Domain, kein DNS-Eintrag, keine Secrets** im Cloudflare-Projekt.
- **Kein Produktionsdeployment.** `npm run build:production` bricht weiterhin ab.

## Smoke-Test gegen das laufende Deployment

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
