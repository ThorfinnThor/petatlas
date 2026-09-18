import { existsSync, readFileSync, statSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

interface IconContract {
  readonly path: string;
  readonly width: number;
  readonly height: number;
}

const ICONS: readonly IconContract[] = [
  { path: 'public/favicon.png', width: 192, height: 192 },
  { path: 'public/favicon-48x48.png', width: 48, height: 48 },
  { path: 'public/apple-touch-icon.png', width: 180, height: 180 },
];

function pngDimensions(path: string): { width: number; height: number } {
  const data = readFileSync(path);
  expect(data.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

describe('Markenicon', () => {
  it.each(ICONS)('$path ist ein quadratisches PNG in der vorgesehenen Größe', (icon) => {
    expect(existsSync(icon.path)).toBe(true);
    expect(statSync(icon.path).size).toBeGreaterThan(500);
    expect(pngDimensions(icon.path)).toEqual({ width: icon.width, height: icon.height });
  });

  it('bindet Favicon und Apple-Touch-Icon zentral in jede Seite ein', () => {
    const layout = readFileSync('src/layouts/BaseLayout.astro', 'utf8');
    expect(layout).toContain('rel="icon" type="image/png" sizes="192x192" href="/favicon.png"');
    expect(layout).toContain('rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png"');
    expect(layout).toContain('rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"');
  });
});
