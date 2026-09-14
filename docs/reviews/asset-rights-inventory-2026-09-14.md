# Rechteinventar der ausgelieferten Ressourcen

Stand: 14. September 2026. Dieses Inventar ordnet die im Wau-&-Miau-Build tatsächlich
verwendeten Ressourcen zu. Es ersetzt keine rechtliche Prüfung ungeklärter Sonderfälle.

## Daten und redaktionelle Inhalte

| Bereich | Herkunft und Fassung | Nutzung im Build | Rechteentscheidung und Nachweis |
|---|---|---|---|
| GOT-Gebühren | Amtliche GOT-Anlage, Snapshot `data-snapshots/got/got-2022.json` | HTML, Rechnerdaten, öffentliche JSON-Datei, Druckansicht | Quellen- und Rechteentscheidung in `config/sources/got.json`; Build-Sperre in `scripts/checks/licenses.ts` und `scripts/publish/fees.ts` |
| OpenStreetMap-Orte | Geofabrik-Deutschlandextrakte, Snapshot vom 07.09.2026 | HTML-Listen, Stadtseiten, Suchindex, räumliche JSON-Chunks | ODbL 1.0, Attribution an Karte und Daten; `config/sources/osm-geofabrik-de.json`, `docs/ODBL_DATAFLOW.md`, `licenses/ODbL-notice.md` |
| OpenStreetMap-Kacheln | `tile.openstreetmap.org` | Nur nach Klick geladene Kartendarstellung | Kacheln sind kein Bestandteil des Builds; Nutzungsbedingung und Attribution getrennt in `config/editorial-sources.json` und `src/features/map/tiles.ts` |
| Kommunale Hundeflächen | Berlin und Hamburg, jeweilige Snapshots | Stadtseiten und Quellenhinweise | Einzelentscheidungen in `config/sources/berlin-hundefreilauf.json`, `config/sources/hamburg-hundeauslaufzonen.json` und `config/sources/hamburg-hundeauslaufzonen-anzahl.json` |
| Reiseregeln | EU- und nationale Behördenquellen | Begrenzte Vorschauauswertung und Packliste | Quellen in `config/editorial-sources.json`; Fachfreigabe bleibt getrennt und ausstehend in `content-data/travel/approvals.json` |
| Produkt- und Futterangaben | Verlinkte Herstellerseiten, Stand je Eintrag | Redaktionelle Fakten und Vergleichsmerkmale, keine kopierten Produktbilder oder Bewertungen | Je Produkt Quelle und Prüfdatum in `content-data/products/editorial.json` und `content-data/food/real-products.json`; nur als Herstellerangabe bezeichnet |
| Ergänzungsfuttermittel | Hersteller-, Verbands- und Behördenquellen | Redaktionelle Einordnung, keine Dosierungsempfehlung | Getrennte Quellen in `config/editorial-sources.json`; eigene Fachfreigabe in `config/reviews/nutrition.json` bleibt `pending` |
| Amazon | Vom Betreiber autorisierte Suchlinks mit Partner-ID | Gekennzeichneter Textlink; keine Preise, Bilder, Widgets, Rezensionen oder Produktdaten | Status getrennt in `config/commerce/status.json`; Vertrags-/Feedrechte werden nicht aus der Textlink-Autorisierung abgeleitet |
| Eigene Seitentexte und UI | Repository Wau & Miau | HTML, Suchindex und Druckansichten | Eigene redaktionelle und technische Arbeit; das Repository ist als `UNLICENSED` gekennzeichnet |

Die vollständige maschinenlesbare Quellenliste entsteht aus `config/sources/*.json`,
`config/editorial-sources.json` und den Herstellerquellen über
`src/domain/editorial-sources.ts`. `npm run check:licenses` stoppt eine
Inhaltsübernahme, sobald die dafür erforderliche Ausgabeform nicht freigegeben ist. Eine
bloße externe Quellenverlinkung bleibt davon getrennt.

## Bilder, Grafiken und Icons

| Ressource | Ursprung | Dateinachweis | Verwendung |
|---|---|---|---|
| `health-dog-home.png` | mit OpenAI Image Generation für dieses Projekt erzeugt | SHA-256 `91e48f760416a3dad0cb7521937fcb90b91b29057a622c2c630c0da43ea4c23f` | dekoratives redaktionelles Bild |
| `hero-dog-alpine-lake.png` | mit OpenAI Image Generation für dieses Projekt erzeugt | SHA-256 `d9312d488b79fb63c20217c206af9bb1e9f368442dc69ea37368cfad562a2530` | dekoratives redaktionelles Bild |
| `hero-dog-cat-home.png` | mit OpenAI Image Generation für dieses Projekt erzeugt | SHA-256 `1812d03476c143a2c9bf4fa56d6c31199ba41e14291efba1b9c1782a4607ac12` | Startseite und Katzeninhalte |
| `play-cat-home.png` | mit OpenAI Image Generation für dieses Projekt erzeugt | SHA-256 `a9e75467e8a334c2cb8374065ff5fcb966df7eecfe8a1875e6deef99df3514f7` | Katzeninhalte |
| `play-dog-alpine-lake.png` | mit OpenAI Image Generation für dieses Projekt erzeugt | SHA-256 `b43801de0af9f57b569cdf4bd4246219477495b0800f0807ccec6f697794e9b7` | Hunde- und Spielinhalte |
| `travel-human-dog-sunset.png` | mit OpenAI Image Generation für dieses Projekt erzeugt | SHA-256 `8c8b79d76b1be070e65a598826dc414a94e6aa5e8f24ac37b6bc29bb94a0724b` | Reiseinhalte |
| Inline-Icons | im Repository definierte einfache SVG-Pfade | `src/components/ui/Icon.astro` | rein dekorative/navigationale Symbole |

Die PNG-Originale liegen in `design-assets/`; `scripts/design/images.ts` erzeugt die
ausgelieferten AVIF- und WebP-Varianten. `design-assets/README.md` protokolliert Zweck und
Erstellungsweg. Die Bilder stellen weder konkrete Produkte noch gelistete Praxen oder
unabhängige Produkttests dar. Es werden keine Herstellerfotos, Logos oder Amazon-Bilder
ausgeliefert.

## Schriften und Laufzeitbibliotheken

| Ressource | Version/Lizenz | Nachweis und Ausgabeform |
|---|---|---|
| Manrope Variable | 5.3.0, SIL OFL 1.1 | lokal ausgelieferte WOFF2-Datei; `licenses/fonts/manrope-OFL.txt` |
| Kalam Regular | 5.3.0, SIL OFL 1.1 | lokal ausgelieferte WOFF2-Datei; `licenses/fonts/kalam-OFL.txt` |
| Astro | 7.3.1, MIT | Buildsystem; `node_modules/astro/LICENSE` |
| Leaflet | 1.9.4, BSD-2-Clause | im Browser für die optionale Karte; `node_modules/leaflet/LICENSE` |
| fflate | 0.8.3, MIT | Browser-/Buildcode; `node_modules/fflate/LICENSE` |
| fast-xml-parser | 5.11.1, MIT | Importwerkzeug; `node_modules/fast-xml-parser/LICENSE` |
| osm-pbf-parser-node | 1.1.4, MIT | Importwerkzeug; `node_modules/osm-pbf-parser-node/LICENSE` |
| Zod | 4.5.4, MIT | Validierung; `node_modules/zod/LICENSE` |

Entwicklungswerkzeuge sind in `package-lock.json` versionsgebunden. Ihre Lizenzdateien
werden nicht als Website-Inhalt kopiert. Der Output-Audit prüft, dass keine internen
Nachweise, Quell-Snapshots oder Originalbilder versehentlich in `dist/` gelangen.

## Noch erforderliche menschliche Entscheidung

Die technische Zuordnung und die bestehenden Einzelentscheidungen sind dokumentiert. Die
globale Datenrechtefreigabe in `config/launch.json` bleibt bewusst gesperrt, bis die dafür
zuständige Person dieses Inventar und die ODbL-Ausgabeformen geprüft, datiert und als
Nachweis in `docs/reviews/` bestätigt hat. Ungeklärte Partnerfeeds und Produktbilder bleiben
bis dahin technisch deaktiviert.
