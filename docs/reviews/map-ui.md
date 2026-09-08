# Abnahme der Kartenoberfläche

Durchgeführt am 2026-09-07 (M11-06). Geprüft wurden Kartenseite, Stadtseiten und die ausgelieferten Ortsdaten im echten Browser — Chromium als Desktop (1280 px) und als Pixel 7 (412 px), beide Läufe über `npm run test:e2e:features`.

Dies ist eine **Bedien- und Auslieferungsabnahme**. Sie sagt nichts über die Vollständigkeit der Daten; dafür gibt es `docs/reviews/places.md`.

## Prüfumfang

| | |
|---|---|
| Geprüfte Seiten | Kartenseite, 25 Stadtseiten (stichprobenartig die erste), Quellenseite, Startseite |
| Automatisierte Prüfung | `npm run test:e2e:features` — 108 Tests über zwei Geräteprofile, davon 22 aus dieser Abnahme (`tests/e2e-features/map-abnahme.spec.ts`) |
| Berichte | `reports/playwright-features/` (nur bei Fehlschlag befüllt: Screenshot und Trace) |
| Zusätzlich geprüft | die live erreichbare Vorschau unter `petatlas-de-preview.shuu9599.workers.dev` |

## Ergebnisse

### Mobil — kein horizontaler Bedienbruch

Auf Karten-, Stadt-, Quellen- und Startseite ist `scrollWidth − clientWidth ≤ 1 px`, im Desktop- wie im Mobilprofil. Auch die **geöffnete** Karte bleibt in der Breite: der Kartenbehälter ist nie breiter als das Fenster. Damit gibt es keinen Zustand, in dem die Seite seitlich wegläuft.

### Tastatur — die Karte ist keine Mausfunktion

Die Karte lässt sich mit Fokus und `Enter` öffnen; danach ist die Zoombedienung von Leaflet als Link erreichbar. Ortssuche und Trefferauswahl sind bereits in M11-01 ohne Maus geprüft und laufen unverändert.

### Providerausfall — die Liste trägt die Seite

Bei geblocktem Kacheldienst meldet die Karte den Ausfall im Status, die Trefferliste bleibt vollständig, und **die Attribution bleibt vollständig**: „© OpenStreetMap contributors“ und der Hinweis auf die Open Database License stehen weiter auf der Seite. Der Ausfall betrifft die Kacheln, nicht die Pflichthinweise zu den Daten.

### Nachbarzellen — nachladen, aber nur einmal

Ein Ausschnitt von 50 km um Bremen reicht über eine 0,5°-Zelle hinaus. Geprüft: es werden mehrere Zellen geladen, jede genau einmal, und ein anschließend kleinerer Radius lädt gar nichts nach. Kein Vorabdownload des Gesamtbestands, keine Doppelanfrage.

### Ortswechsel — kein Rest der vorherigen Stadt

Nach dem Wechsel von Bremen nach Hannover ist **kein** Eintrag der vorherigen Liste mehr enthalten (verglichen wurden ganze Einträge, nicht nur Namen: Ketten heißen in beiden Städten gleich, sind aber andere Filialen).

### Interne Links und Statuscodes

Alle internen Links von Startseite, Kartenseite, einer Stadtseite und der Quellenseite antworten mit 200. Umgekehrt antworten eine nicht gelistete Stadt, ein erfundener Pfad und eine erfundene Datendatei mit **404** — keine 200-Attrappe. Auf der ausgelieferten Vorschau bei Cloudflare gilt dasselbe: `/de-de/gibt-es-nicht/` liefert HTTP 404 mit der eigenen Fehlerseite, nicht 200 mit Ersatzinhalt.

### Attribution in den Daten

Eine ausgelieferte Zellendatei führt `licenseId: ODbL-1.0`, den Attributionstext mit „OpenStreetMap“ und die Attributionsadresse. `/data/v1/places/de/LICENSE.txt` ist abrufbar und enthält den ODbL-Hinweis. Damit trägt auch der reine Datenpfad seine Lizenz mit sich, nicht nur die HTML-Seite.

### Titel, H1 und canonical

Karten- und Stadtseite haben je genau eine H1; das canonical zeigt auf die Seite selbst — bei den Stadtseiten war das vorher nicht so und ist in M11-04 behoben worden. Der Seitentitel der Kartenseite kommt aus der Navigationsbeschriftung („Tierärzte in der Nähe“) und weicht damit leicht von der H1 („Tierärzte und Orte in der Nähe“) ab; das ist beabsichtigt und kein Befund.

Der geprüfte Build ist ein Entwicklungsbuild und trägt auf allen Seiten `noindex, nofollow`. Indexierbar wird eine Seite erst durch einen Produktionsbuild mit erfüllten Launch-Gates — nicht durch ihren Inhalt.

## Offene Punkte

Diese Punkte sind **keine** Mängel dieser Abnahme, sondern Arbeit, die ausdrücklich in einem späteren Meilenstein liegt (`docs/MILESTONES.md`, SEO-Abnahme: Titel/H1, canonical, hreflang, Sitemap, robots, Pagefind-Ausschlüsse, Statuscodes):

1. **Keine Sitemap.** Es gibt keinen Sitemap-Generator; die 25 Stadtseiten sind bisher nur über die Kartenseite verlinkt.
2. **Keine Meta-Description.** `BaseLayout` setzt keine; für lokale Seiten ist das ein Nachteil, der dort mitbehandelt werden sollte.
3. **Kein hreflang.** Nur der deutsche Markt ist aktiv; die Paare entstehen erst mit einem zweiten.

Ebenfalls offen, aber inhaltlich: die kommunalen Flächen aus M11-05 sind noch nicht Teil der Karte (`docs/MUNICIPAL_SOURCES.md`).
