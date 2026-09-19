# Affiliate-Kaufhilfen · Quellen- und Umsetzungsnotiz · 19.09.2026

## Umfang

Vier neue kaufnahe, indexierbare Seiten unter `/de-de/produkte/`:

- `katzentransportboxen-vergleich`
- `hunderampe-auto-vergleich`
- `kong-hundespielzeug-vergleich`
- `catit-senses-2-vergleich`

Die Seiten sind Vergleiche dokumentierter Produkteigenschaften, keine eigenen Produkttests und keine Ranglisten.

## Amazon

Die bestehende ADR-020 bleibt unverändert: ausschließlich statische, gekennzeichnete Amazon-DE-Suchlinks mit `tag=wauandmiau-21`. Keine Amazon-Produktbilder, Preise, Bewertungen, Bestände, API-Daten oder Shop-Scrapes werden eingebunden oder gespeichert.

Neue Suchbegriffe sind modell- bzw. artikelnummernspezifisch. Produktfamilien mit Größenvarianten (KONG Classic/Extreme) bleiben bewusst Suchlinks, damit keine Größe als allgemeine Empfehlung festgeschrieben wird.

## Herstellerquellen, geprüft am 19.09.2026

### Katzentransportboxen
- TRIXIE Capri 1, 39811: https://www.trixie.de/cat/transport-travel/transport-boxes/transport-box-capri-1-2-1001435865-1001442997
- TRIXIE Capri 3 Open Top, 39861: https://www.trixie.de/katze/transport-reisen/transportboxen/transportbox-capri-3-open-top-1001435865-1001443009
- Catit Cabrio, 41372: https://www.catit.com/de/produkte/transportboxen/cabrio-transportbox/

### Hunderampen
- TRIXIE Petwalk, 3942: https://www.trixie.de/fr/chien/hygiene-sante-et-proprete/rampes-et-escaliers-pour-chiens/rampe-en-plastique-1001435625-1001443444
- TRIXIE Teleskop-Rampe, 3940: https://www.trixie.de/en/productworld/dog/transport-travel/dog-ramps-steps/2-step-telescope-ramp-aluminium-sandpaper-1001435625-1001443424?itemNo=3940
- PetSafe Happy Ride, PTV17-16898: https://www.petsafe.com/de/p/happy-ride-teleskop-hunderampe/PTV17-16898/

### KONG
- KONG Classic: https://www.kongcompany.com/kong-classic/
- KONG Extreme: https://www.kongcompany.com/kong-extreme/
- KONG Wobbler: https://www.kongcompany.com/wobbler/

KONG Gyro wurde bewusst nicht aufgenommen: Für diese Umsetzung lag am 19.09.2026 keine belastbare aktuelle Hersteller-Produktseite vor. Eine Händlerseite wird nicht als Herstellerbeleg ausgegeben.

### Catit Senses
- Play/Wave/Super Circuit, 43154/43155/43156: https://www.catit.com/de/produkte/spielzeuge/senses-spielschienen/

## Technische Leitplanken

- Astro static, kein neuer Runtime-Dienst.
- Gemeinsame `PurchaseGuide.astro`-Komponente statt vier kopierter Templates.
- Strukturierte Daten in `src/features/commerce/purchase-guides.ts`.
- Canonicals zeigen auf die jeweilige `/de-de/produkte/<slug>/`-URL.
- Sitemap und Pagefind übernehmen die statischen Seiten aus dem Build.
- Interne Links führen auf bestehende Ratgeber-, Spielzeug- und Pflege-Seiten.
- Neue Tests prüfen URL-Sicherheit, Amazon-Whitelist, Affiliate-Tag, fehlende Amazon-Netzwerkanfragen beim Seitenaufruf, Accessibility und mobiles Overflow.
