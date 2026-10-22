# Design V2 assets

Four original AI-generated decorative photographs created with OpenAI image generation on 2026-09-09 for this implementation. They are illustrative scenes, not photographs of listed practices, destinations or product reviews. No manufacturer product photographs, logos or stock images were copied.

- hero-dog-alpine-lake: golden retriever beside a calm alpine lake, mountains, natural daylight.
- travel-human-dog-sunset: adult hiker and dog overlooking mountains at sunset.
- play-dog-alpine-lake: dog playing outdoors near a lake.
- health-dog-home: relaxed dog in a warm home interior.

Original PNG sources are stored here; `npm run design:images` creates responsive AVIF and WebP files in public/images/brand. BrandImage loads decorative images with empty alt text; the adjacent text supplies the meaning. Generated scenes must never be represented as a real listed business or independent product test.

Fonts: Manrope Variable and Kalam Regular, vendored from the @fontsource-variable/manrope and @fontsource/kalam npm packages version 5.3.0. Both are self-hosted WOFF2; OFL licenses are in licenses/fonts. No requests to Google Fonts occur.

## Wau & Miau · 2026-09-10

Two additional original images were generated with the built-in OpenAI imagegen tool (no external stock or product imagery).

- `hero-dog-cat-home.png`: golden retriever and tabby cat resting on a cream sofa, equal prominence, soft daylight, beige/sage palette, no text or branding. Used in the homepage hero and shared/cat editorial content.
- `play-cat-home.png`: tabby cat reaching toward a plain felt ball beside a scratching post, warm living room, correct natural anatomy, no text or branding. Used in the cat entry card and cat play guide.

The generated originals were visually inspected. Responsive AVIF/WebP variants are generated with the existing image pipeline. These illustrative scenes do not depict the catalog products.

## Weitere Fotos · 2026-10-22

Sechzehn dekorative Fotos, vom Betreiber am 22.10.2026 bereitgestellt (`Haustierfotos_16_Bilder_NEU.zip`, je 1600 × 900 JPEG). Herkunft und Nutzungsrechte liegen beim Betreiber; Prüfsummen stehen in `docs/reviews/asset-rights-inventory-2026-09-14.md`. Die Bilder zeigen keine gelisteten Praxen, keine Katalogprodukte und keine Produkttests.

`npm run design:images` schneidet sie für die Auslieferung auf 3:2 zu (Ausschnitt nach Bildinhalt), damit alle Markenbilder dasselbe Format haben.

| Datei | Motiv | Verwendung |
|---|---|---|
| `dog-golden-living.jpg` | Golden Retriever im Wohnzimmer | Tierversicherung |
| `travel-hike-sunrise.jpg` | Wanderer mit Hund über Bergsee bei Sonnenaufgang | Ratgeber EU-Heimtierausweis |
| `dog-lake-splash.jpg` | Golden Retriever im flachen Bergsee | Tierarzt-Karte, Ratgeber Hundeorte |
| `cat-tabby-sofa.jpg` | getigerte Katze auf hellem Sofa | Merkliste, Behandlungsseiten Katze, Ratgeber Rechnungszusammensetzung |
| `dog-small-meadow.jpg` | kleiner Hund auf Wiese | Spielzeug |
| `cat-window.jpg` | Katze am Fenster | Ratgeber Wohnungskatzen |
| `travel-hiker-panorama.jpg` | Wanderin mit Hund vor Bergpanorama | Ratgeber Reise vorbereiten |
| `dog-alpine-meadow.jpg` | Golden Retriever auf Alpenwiese | Ratgeber-Übersicht, Reisecheck Italien, Blog Allgemeine Untersuchung |
| `cat-scratching-post.jpg` | Katze am Kratzbaum | Produktvergleiche |
| `dog-swimming.jpg` | schwimmender Golden Retriever | Reisecheck Niederlande |
| `dog-cat-cuddle.jpg` | Hund und Katze aneinandergekuschelt | Mein Tier, Blog Alleinfutter |
| `dog-woman-beach.jpg` | Frau mit Hund am Strand bei Sonnenuntergang | Reisecheck Frankreich |
| `cat-tabby-couch.jpg` | getigerte Katze auf grüner Couch | Ratgeber Transportbox |
| `dog-person-dock.jpg` | Mensch und Hund auf einem Steg am See | Blog GOT-Faktor |
| `dog-collie-meadow.jpg` | Border Collie auf Blumenwiese | Ratgeber Hundespielzeug |
| `cat-longhair-tree.jpg` | Langhaarkatze am Kratzbaum | Ergänzungsfuttermittel |

