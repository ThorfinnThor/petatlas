# Quellen und Prüfstand

Prüfstand: 6. September 2026. Nur Primärquellen. Links sind Einstiegs- und Nachweisquellen, keine automatisch erteilten Projektrechte. Bei Integration die genaue Ressource und maßgebliche Fassung prüfen. Fachliche und rechtliche Freigaben werden dadurch nicht ersetzt.

## S01 — Astro: statische Ausgabe

`https://docs.astro.build/en/reference/configuration-reference/`

Statisches Rendering als Framework-Grundlage.

## S02 — Cloudflare: Astro auf Workers

`https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/`

Astro kann ohne Cloudflare-Adapter als rein statische Website veröffentlicht werden.

## S03 — Cloudflare: Static Assets, Abrechnung und Grenzen

`https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/`

Reine Asset-Anfragen sind kostenlos und unbegrenzt; Worker-Ausführung ist davon getrennt.

## S04 — Cloudflare: Workers Builds

`https://developers.cloudflare.com/workers/ci-cd/builds/`

Git-Anbindung, Build- und Deploy-Konfiguration.

## S05 — Cloudflare: Deploy Hooks

`https://developers.cloudflare.com/workers/ci-cd/builds/deploy-hooks/`

POST-Hook löst einen Build für den konfigurierten Branch aus; Hook-URL ist ein Zugangsschlüssel.

## S06 — Cloudflare: Build-Limits und Preise

`https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/`

Am Prüftag: Free 3.000 Build-Minuten/Monat, 20 Minuten Build-Timeout, eine gleichzeitige Ausführung.

## S07 — Cloudflare: Workers-Limits

`https://developers.cloudflare.com/workers/platform/limits/`

Am Prüftag: 20.000 Static Assets im Free-Tarif und 25 MiB je Datei; vor Einrichtung erneut prüfen.

## S08 — Cloudflare: Wrangler-Konfiguration

`https://developers.cloudflare.com/workers/wrangler/configuration/`

assets.directory, HTML-Routing und 404-Verhalten.

## S09 — Cloudflare: Asset-Headers

`https://developers.cloudflare.com/workers/static-assets/headers/`

_headers, Cache-Control und Sicherheitsheader für statische Antworten.

## S10 — GitHub: Actions-Abrechnung

`https://docs.github.com/en/billing/concepts/product-billing/github-actions`

Standard-GitHub-Runner für öffentliche Repositories werden kostenlos angeboten; andere Grenzen separat prüfen.

## S11 — GitHub: Workflow-Ereignisse und Zeitpläne

`https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows`

Zeitpläne können sich verzögern oder ausfallen; öffentliches Repo ohne Aktivität kann nach 60 Tagen deaktivierte Zeitpläne haben.

## S12 — GitHub: sichere Actions-Nutzung

`https://docs.github.com/en/actions/reference/security/secure-use`

Minimale Berechtigungen, Schutz vor nicht vertrauenswürdigem Code und Pinning von Actions.

## S13 — GitHub: Secrets

`https://docs.github.com/actions/security-guides/using-secrets-in-github-actions`

Konfiguration und Umgang mit Workflow-Secrets.

## S14 — Claude Code: Best Practices

`https://code.claude.com/docs/en/best-practices`

Verifizierbare Aufgaben, knappe CLAUDE.md, Kontextmanagement und überprüfbare Arbeitsübergaben.

## S15 — Node.js: Release-Status

`https://nodejs.org/en/about/previous-releases`

Node 24 wird am Prüftag als LTS geführt; Patchversion beim Projektstart festlegen.

## S16 — Pagefind: statische Suche

`https://pagefind.app/docs/`

Suchindex wird nach dem HTML-Build erstellt; keine Suchserver-Infrastruktur nötig.

## S17 — Pagefind: mehrsprachige Suche

`https://pagefind.app/docs/multilingual/`

Sprachzuordnung aus dem lang-Attribut des HTML-Dokuments.

## S18 — GOT: konsolidierter Verordnungstext

`https://www.gesetze-im-internet.de/got_2022/BJNR140100022.html`

Datenbasis für Gebührenpositionen und Regeln; amtliche Verkündung und Änderungsstand zusätzlich dokumentieren.

## S19 — UrhG § 5: amtliche Werke

`https://www.gesetze-im-internet.de/urhg/__5.html`

Urheberrechtliche Einordnung von Gesetzen und Verordnungen, nicht von fremden Kommentaren oder Website-Designs.

## S20 — GewO § 34d

`https://www.gesetze-im-internet.de/gewo/__34d.html`

Versicherungsvermittlung einschließlich bestimmter internetbasierter Auswahl- und Vergleichsangebote.

## S21 — Geofabrik: Deutschland-Extrakte

`https://download.geofabrik.de/europe/germany.html`

PBF-Extrakte und regionale Unterteilungen; kein vollständiger Deutschland-Download im Besucherbrowser.

## S22 — Open Database License 1.0

`https://opendatacommons.org/licenses/odbl/1-0/`

Datenbankrechte, abgeleitete Datenbanken und zusammengefasste Datenbanken; getrennte Dateien allein lösen keine Lizenzfrage.

## S23 — OSMF: Lizenz-FAQ

`https://osmfoundation.org/wiki/Licence/Licence_and_Legal_FAQ`

Kommerzielle OSM-Datennutzung und Attribution.

## S24 — OSMF: Tile Usage Policy

`https://operations.osmfoundation.org/policies/tiles/`

Nutzungsgrenzen der öffentlichen Raster-Kartenserver, keine Offline-/Massen-Downloads.

## S25 — EU-Kommission: Reisen mit Haustier innerhalb der EU

`https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets/travelling-pet-within-eu_en`

Aktuelle Einstiegsquelle für die rechtlich gepflegte Reise-Regelbasis.

## S26 — EU-Kommission: Hunde, Katzen, Frettchen

`https://food.ec.europa.eu/animals/live-animal-movements/dogs-cats-and-ferrets_en`

Verknüpfte Rechtsakte und Abgrenzung nichtkommerzieller Tierbewegungen.

## S27 — Awin: Publisher-Produktfeed-Leitfaden

`https://help.awin.com/developers/docs/product-feed-publisher-guide-intro`

Produktfeeds und Deeplinks; daraus folgt keine pauschale Erlaubnis zur öffentlichen Weitergabe aller Feed-Daten.

## S28 — Awin: Publisher-Vertragsbedingungen

`https://www.awin.com/gb/publisher-terms`

Anwendbare Netzwerk- und ergänzende Verträge müssen je Account/Programm geprüft werden.

## S29 — Open Food Facts: API und Lizenzhinweise

`https://openfoodfacts.github.io/openfoodfacts-server/api/`

Datenbank-/Inhalts-/Bildrechte getrennt; konkrete OPFF-Distribution zusätzlich verifizieren.

## S30 — Open Pet Food Facts: Projektseite

`https://wiki.openfoodfacts.org/Open_Pet_Food_Facts`

Einstieg in Tierfutterdaten; Abdeckung und Felder vor Produktentscheidung messen.

## S31 — DWD: Open-Data-FAQ

`https://www.dwd.de/DE/leistungen/opendata/faqs_opendata.html`

Open-Data-Nutzung mit CC BY 4.0 und Quellenvermerk; konkretes Produkt prüfen.

## S32 — DDG § 5

`https://www.gesetze-im-internet.de/ddg/__5.html`

Anbieterinformationen/Impressum als Freigabepunkt.

## S33 — TDDDG § 25

`https://www.gesetze-im-internet.de/ttdsg/__25.html`

Endgerätezugriffe und Einwilligung einschließlich gesetzlicher Ausnahmen.

## S34 — UWG § 5a

`https://www.gesetze-im-internet.de/uwg_2004/__5a.html`

Kennzeichnung kommerzieller Zwecke und Vermeidung irreführender Auslassungen.

## S35 — PAngV § 4

`https://www.gesetze-im-internet.de/pangv_2022/__4.html`

Grundpreisangaben; konkrete Anwendung auf das Geschäftsmodell prüfen.

## S36 — UStG § 12

`https://www.gesetze-im-internet.de/ustg_1980/__12.html`

Allgemeiner Umsatzsteuersatz; konkrete Zeilen-/Sonderfallbehandlung separat prüfen.
