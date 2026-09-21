# Affiliate-Kaufhilfen · Quellen- und Umsetzungsnotiz · 19.09.2026

## Umfang

Neun kaufnahe, indexierbare Seiten unter `/de-de/produkte/`:

- `katzentransportboxen-vergleich`
- `hunderampe-auto-vergleich`
- `kong-hundespielzeug-vergleich`
- `catit-senses-2-vergleich`
- `katzentrinkbrunnen-vergleich`
- `katzen-futterautomat-vergleich`
- `katzentoilette-vergleich`
- `flexi-rollleine-vergleich`
- `hundetransportbox-auto-vergleich`

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

### Catit Trinkbrunnen
- PIXI Trinkbrunnen, 43715: https://www.catit.com/de/produkte/trinkbrunnen/pixi-trinkbrunnen/
- PIXI Smart-Trinkbrunnen, 43751: https://www.catit.com/de/produkte/trinkbrunnen/pixi-smart-trinkbrunnen/
- PIXI UV-C Edelstahl-Trinkbrunnen, 43761: https://www.catit.com/de/produkte/catit-pixi-uv-c-edelstahl-trinkbrunnen/

### Catit Futterautomaten
- PIXI Smart Futterautomat, 43752: https://www.catit.com/de/produkte/catit-pixi-smart-futterautomat/
- PIXI Smart-Futterautomat mit 6 Mahlzeiten, 43754: https://www.catit.com/de/produkte/catit-pixi-smart-futterautomat-mit-6-mahlzeiten/
- PIXI Smart-Futterautomat Vision, 43753: https://www.catit.com/de/produkte/catit-pixi-smart-futterautomat-vision/

### Catit Katzentoiletten
- Airsift Standard, 50702: https://www.catit.com/de/produkte/katzentoiletten-zubehoer/katzentoiletten-mit-airsift-filtersystem/
- PIXI Katzentoilette, 44081: https://www.catit.com/de/produkte/katzentoiletten-zubehoer/pixi-katzentoilette/
- Smartsift Katzentoilette, 50685: https://www.catit.com/de/produkte/katzentoiletten-zubehoer/smartsift-katzentoilette/

### flexi Rollleinen
- Classic L Gurt 5 m: https://flexi.de/de/produkte/classic-l-gurt-5-m/
- Comfort Plus L Gurt 5 m: https://flexi.de/de/produkte/comfort-plus-l-5m-gurt-hundeleine/
- Xtreme L Gurt 5 m: https://flexi.de/de/produkte/xtreme-l-gurt-5-m/
- Giant L Gurt 8 m: https://flexi.de/de/produkte/giant-l-8m-gurt-hundeleine/

### TRIXIE Hundetransportboxen
- Journey M, 39413: https://www.trixie.de/en/dog/transport-travel/transport-boxes/transport-box-journey-1001435619-1001442920
- Vario S–M, 39722: https://www.trixie.de/en/dog/transport-travel/transport-boxes/dog-crate-vario-1001435619-1001442885
- Aluminium M–L, 39342: https://www.trixie.de/en/dog/transport-travel/transport-boxes/transport-box-aluminium-1001435619-1001442897

## Technische Leitplanken

- Astro static, kein neuer Runtime-Dienst.
- Gemeinsame `PurchaseGuide.astro`-Komponente statt neun kopierter Templates.
- Strukturierte Daten in `src/features/commerce/purchase-guides.ts`.
- Canonicals zeigen auf die jeweilige `/de-de/produkte/<slug>/`-URL.
- Sitemap und Pagefind übernehmen die statischen Seiten aus dem Build.
- Interne Links führen auf bestehende Ratgeber-, Spielzeug- und Pflege-Seiten.
- Neue Tests prüfen URL-Sicherheit, Amazon-Whitelist, Affiliate-Tag, fehlende Amazon-Netzwerkanfragen beim Seitenaufruf, Accessibility und mobiles Overflow.
- Die erweiterte Datendatei wurde mit der im Repository gepinnten Prettier-Version formatiert; der temporäre Formatier-Workflow ist nicht Bestandteil des finalen Diffs.

## Unabhängiger Review am 21.09.2026

Der vollständige externe Link- und Faktenaudit bestätigte alle 26 eindeutigen
Herstellerziele für die 28 verglichenen Produkte beziehungsweise Varianten. Alle
Ziele antworteten mit HTTP 200, die Produktidentitäten und verwendeten Fakten
stimmten mit den Herstellerseiten überein. Alle 28 Amazon-Suchen wurden im
Amazon-DE-Suchergebnis geöffnet. Sie führen in die richtige Produktfamilie; beim
Catit PIXI Smart-Futterautomat Vision 43753 war am Prüftag kein exakter
Amazon-Treffer vorhanden. Die Seite verspricht weder Bestand noch einen exakten
Händlerartikel.

Vor der Korrektur wurden drei begrenzte Punkte festgehalten:

- **P2 · Regressionstest:** Die Vertragstests durchliefen alle vorhandenen
  Datensätze, sicherten aber die zugesagten Gesamtzahlen von neun Kaufhilfen und
  28 Produkten nicht ausdrücklich ab. Diese Summen werden nun fest geprüft.
- **P3 · Maßangaben:** Mehrere Hersteller veröffentlichen Maße ohne einheitliche
  Achsenreihenfolge. Tabellen, die die Quellreihenfolge unverändert übernehmen,
  kennzeichnen das nun ausdrücklich. Bei Rampen bleibt die sicher normalisierte
  Spalte `Länge × Breite` bestehen.
- **P3 · Screenreader-Linkname:** Die Kaufhilfen kennzeichneten Amazon-Links
  sichtbar mit `(Werbung)`, während die gemeinsame Linkkomponente den Zusatz
  zusätzlich für Screenreader ausgab. Die Komponente ergänzt den versteckten
  Hinweis nun nur noch, wenn das übergebene Label ihn nicht bereits enthält.

Die kleine Korrektur am bestehenden `AmazonLink.astro` ist der einzige Grund,
warum der finale PR-Diff gegenüber den acht ursprünglich erwarteten Dateien eine
neunte Datei enthält. Sie erweitert weder Amazon-Scope noch Trackingverhalten.

Eine exakte Pagefind-Abfrage bestätigte außerdem, dass die technischen
Amazon-Parameter `linkCode` und `ll2` nicht im Suchindex stehen. Unscharfe Suchen
nach diesen Zeichenfolgen liefern zwar Treffer auf Wörter wie „Links“ oder Werte
wie „2 l“; als exakte Suchbegriffe ergeben beide null Treffer. Die offen
dokumentierte Partner-ID bleibt erwartungsgemäß auf der Methodikseite auffindbar.
