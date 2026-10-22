import sharp from 'sharp';
import { existsSync, mkdirSync } from 'node:fs';

/** Originale in design-assets/; Herkunft und Zweck stehen in design-assets/README.md. */
const quellen: readonly { readonly name: string; readonly datei: string }[] = [
  ...[
    'hero-dog-alpine-lake',
    'travel-human-dog-sunset',
    'play-dog-alpine-lake',
    'health-dog-home',
    'hero-dog-cat-home',
    'play-cat-home',
  ].map((name) => ({ name, datei: `${name}.png` })),
  // Vom Betreiber am 22.10.2026 bereitgestellt (1600 × 900 JPEG).
  ...[
    'dog-golden-living',
    'travel-hike-sunrise',
    'dog-lake-splash',
    'cat-tabby-sofa',
    'dog-small-meadow',
    'cat-window',
    'travel-hiker-panorama',
    'dog-alpine-meadow',
    'cat-scratching-post',
    'dog-swimming',
    'dog-cat-cuddle',
    'dog-woman-beach',
    'cat-tabby-couch',
    'dog-person-dock',
    'dog-collie-meadow',
    'cat-longhair-tree',
  ].map((name) => ({ name, datei: `${name}.jpg` })),
];

mkdirSync('public/images/brand', { recursive: true });
let erzeugt = 0;
for (const { name, datei } of quellen) {
  for (const width of [480, 800, 1200, 1536]) {
    for (const format of ['avif', 'webp'] as const) {
      const ziel = `public/images/brand/${name}-${width}.${format}`;
      // Vorhandene Varianten bleiben unangetastet; neu erzeugen heißt: Datei löschen.
      if (existsSync(ziel)) continue;
      // Alle Markenbilder sind 3:2 (BrandImage und PageIntro reservieren dieses
      // Format). Die 16:9-Fotos werden beim Erzeugen zugeschnitten; der
      // Ausschnitt folgt dem Bildinhalt, damit die Tiere im Bild bleiben.
      await sharp(`design-assets/${datei}`)
        .resize({ width, height: Math.round((width * 2) / 3), fit: 'cover', position: 'attention' })
        .toFormat(format, { quality: format === 'avif' ? 52 : 76 })
        .toFile(ziel);
      erzeugt += 1;
    }
  }
}
console.log(`${quellen.length} Markenbilder, ${erzeugt} AVIF/WebP-Varianten neu erzeugt.`);
