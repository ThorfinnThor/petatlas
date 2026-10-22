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
| Reiseregeln | EU- und nationale Behördenquellen | Begrenzte Auswertung und Packliste | Quellen in `config/editorial-sources.json`; die Fachfreigabe ist getrennt und inhaltsgebunden in `content-data/travel/approvals.json` dokumentiert |
| Produkt- und Futterangaben | Verlinkte Herstellerseiten, Stand je Eintrag | Redaktionelle Fakten und Vergleichsmerkmale, keine kopierten Produktbilder oder Bewertungen | Je Produkt Quelle und Prüfdatum in `content-data/products/editorial.json` und `content-data/food/real-products.json`; nur als Herstellerangabe bezeichnet |
| Ergänzungsfuttermittel | Hersteller-, Verbands- und Behördenquellen | Redaktionelle Einordnung, keine Dosierungsempfehlung | Getrennte Quellen in `config/editorial-sources.json`; eigene inhaltsgebundene Fachfreigabe in `config/reviews/nutrition.json` |
| Amazon | Vom Betreiber autorisierte Suchlinks mit Partner-ID | Gekennzeichneter Textlink; keine Preise, Bilder, Widgets, Rezensionen oder Produktdaten | Status getrennt in `config/commerce/status.json`; Vertrags-/Feedrechte werden nicht aus der Textlink-Autorisierung abgeleitet |
| Fressnapf über Awin | Freigegebener Produktfeed, Advertiser 14757 | Produktbild und Deep Link nur für eindeutig zugeordnete redaktionelle Produkte; keine Preise, Verfügbarkeiten, Bewertungen oder Händlertexte | Betreiberbestätigung vom 15.09.2026; Importregeln in `scripts/awin/`, Status in `config/commerce/status.json` |
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
| `symbol-cat.avif` | mit OpenAI Image Generation für dieses Projekt erzeugt | SHA-256 `044a9401ece187d6896558da9683f3a2c653958432dfdee01a5c343e390306d9` | gekennzeichnetes Symbolbild für Katzenspielzeug |
| `symbol-chew.avif` | mit OpenAI Image Generation für dieses Projekt erzeugt | SHA-256 `f0380a7c5c257ff2c32659eebffa6080500351cf1c19107df2d9685122ed6e8c` | gekennzeichnetes Symbolbild für Kauspielzeug |
| `symbol-fetch.avif` | mit OpenAI Image Generation für dieses Projekt erzeugt | SHA-256 `74df4ccc95182df0e0ce7d7df7d9a2baea3f378cc95ef39db9f759db2504aa20` | gekennzeichnetes Symbolbild für Apportierspielzeug |
| `symbol-puzzle.avif` | mit OpenAI Image Generation für dieses Projekt erzeugt | SHA-256 `f2832bdd8b1ad44f312bfd71febd25f3e5abb19879f997d1f5acdcecd8799fff` | gekennzeichnetes Symbolbild für Beschäftigungsspielzeug |
| `symbol-supplements-cat.avif` | mit OpenAI Image Generation für dieses Projekt erzeugt | SHA-256 `9141dc9e81e0f40f0d995d732955af4d7402935789ac89b258ecaf60ef1e3706` | gekennzeichnetes Symbolbild für Ergänzungsfuttermittel für Katzen |
| `symbol-supplements-dog.avif` | mit OpenAI Image Generation für dieses Projekt erzeugt | SHA-256 `9cd39c54ac398e7a1a3aad057db6e370cf3c2ca81ee1e837929922e9776f1007` | gekennzeichnetes Symbolbild für Ergänzungsfuttermittel für Hunde |
| `dog-golden-living.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `76cd6958c5a4633656c11ceb13d80824516f1cf94f2f5462e0f5710361075c55` | dekoratives redaktionelles Bild |
| `travel-hike-sunrise.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `f410290b6c24b8eabab7c8e12e7ab4726741881e827de185e718aac6a1fb23f3` | dekoratives redaktionelles Bild |
| `dog-lake-splash.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `f00aa74f8e0190b41f0aff0082354be906465b2ba879e54439d42d54bf28ded7` | dekoratives redaktionelles Bild |
| `cat-tabby-sofa.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `d8efe91642c927f0bb9013e3564cafc907b48c76b5c3b3dc28ae9045a5aa9e97` | dekoratives redaktionelles Bild |
| `dog-small-meadow.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `e737e92e011e686999a59699d8f39510a8c6d4e40736f3fb8afcf3cfd680e0eb` | dekoratives redaktionelles Bild |
| `cat-window.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `cfd4c82c36765c29189341000b29576f2dffc7d2ec09a216b14db11d4c1ddff3` | dekoratives redaktionelles Bild |
| `travel-hiker-panorama.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `a369501e5d5a67c685fc31ac4c93f3b206524c360ad2e202b40687ede73df859` | dekoratives redaktionelles Bild |
| `dog-alpine-meadow.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `35b33acb25219081897d4b7d18ccb9e1ec67cf2bc526677601c7eadcbeb8b554` | dekoratives redaktionelles Bild |
| `cat-scratching-post.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `385fb71f3ead3d11a20f8464d6bdee6a8216798973c37b1ea653a881cd0057c1` | dekoratives redaktionelles Bild |
| `dog-swimming.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `12ec044c739d702a2b8def78ff758d4f774c5bba901d651a96070639f59ced7d` | dekoratives redaktionelles Bild |
| `dog-cat-cuddle.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `d97c9f4f6650141eddff3499a696e80b46c90e7cd9c42634723c1117838cbd17` | dekoratives redaktionelles Bild |
| `dog-woman-beach.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `4cedf75b3e478afe1999a614d84d2ddfc13ff42a517c1070a014a6af5d16e12d` | dekoratives redaktionelles Bild |
| `cat-tabby-couch.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `11aa7485a2b8ffcde1d6ce951985338afdb2c13b9f45d142fd124f646e1c9fa8` | dekoratives redaktionelles Bild |
| `dog-person-dock.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `0991b08d75c0d38c2692c67cc941ae32c3612623c47a9669c8aaf687855e03bc` | dekoratives redaktionelles Bild |
| `dog-collie-meadow.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `781a91e0423fd7e98c114674cfad6fd289f1020507935b6e22e5df37a20dc50d` | dekoratives redaktionelles Bild |
| `cat-longhair-tree.jpg` | vom Betreiber am 22.10.2026 bereitgestellt; Herkunft und Nutzungsrechte liegen beim Betreiber | SHA-256 `a16185334ee4f019a78d99f3e30367e37e62ab2a3f24e567dce60bbd82e92edc` | dekoratives redaktionelles Bild |
| Inline-Icons | im Repository definierte einfache SVG-Pfade | `src/components/ui/Icon.astro` | rein dekorative/navigationale Symbole |

Die PNG-Originale liegen in `design-assets/`; `scripts/design/images.ts` erzeugt die
ausgelieferten AVIF- und WebP-Varianten. `design-assets/README.md` protokolliert Zweck und
Erstellungsweg. Die Produktsymbole werden in `docs/GENERATED_PRODUCT_SYMBOLS.md` dokumentiert.
Die Bilder stellen weder konkrete Produkte noch gelistete Praxen oder
unabhängige Produkttests dar. Es werden keine separat kopierten Herstellerfotos, Logos oder
Amazon-Bilder ausgeliefert. Fressnapf-Produktbilder werden von der im Awin-Feed angegebenen
Bildadresse geladen und nicht in das Repository kopiert.

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

## Freigabeentscheidung

Der Betreiber hat am 14.09.2026 den Abschluss der menschlichen Rechteprüfung für die in
diesem Inventar aufgeführten Ressourcen und Ausgabeformen bestätigt. Die globale
Datenrechtefreigabe verweist auf dieses Inventar. Die Fressnapf-Feedbilder wurden am 15.09.2026
ergänzt. Nicht aufgeführte Partnerfeeds, Händler- oder Herstellerbilder, Preise und Logos bleiben
technisch deaktiviert und sind von dieser Freigabe nicht erfasst. Die oben dokumentierten, eigenen
Symbolbilder sind freigegeben.
