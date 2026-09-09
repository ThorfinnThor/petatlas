import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const names = [
  'hero-dog-alpine-lake',
  'travel-human-dog-sunset',
  'play-dog-alpine-lake',
  'health-dog-home',
];
mkdirSync('public/images/brand', { recursive: true });
for (const name of names) {
  for (const width of [480, 800, 1200, 1536]) {
    for (const format of ['avif', 'webp'] as const) {
      await sharp(`design-assets/${name}.png`)
        .resize({ width, withoutEnlargement: true })
        .toFormat(format, { quality: format === 'avif' ? 52 : 76 })
        .toFile(`public/images/brand/${name}-${width}.${format}`);
    }
  }
}
console.log('Four brand images, responsive AVIF/WebP variants generated.');
