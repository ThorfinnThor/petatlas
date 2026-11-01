import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { artikelOrt, INDEXNOW_SCHLUESSEL, urlsZuMelden } from '../scripts/publish/indexnow.ts';

const SEITE = 'https://deinhaustierportal.de';

describe('IndexNow', () => {
  it('liegt der Schlüssel öffentlich unter /<schlüssel>.txt', () => {
    const datei = `public/${INDEXNOW_SCHLUESSEL}.txt`;
    expect(existsSync(datei)).toBe(true);
    expect(readFileSync(datei, 'utf8')).toBe(INDEXNOW_SCHLUESSEL);
  });

  it('liest Bereich und Slug aus dem Frontmatter', () => {
    expect(artikelOrt('slug: "zahn-ziehen"\nsection: "blog"')).toEqual({
      section: 'blog',
      slug: 'zahn-ziehen',
    });
    expect(artikelOrt('slug: "reise"')).toEqual({ section: 'guide', slug: 'reise' });
  });

  it('meldet geänderte Artikel und Übersichten, aber nur, was in der Sitemap steht', () => {
    const sitemap = new Set([
      `${SEITE}/de-de/`,
      `${SEITE}/de-de/blog/`,
      `${SEITE}/de-de/blog/zahn-ziehen/`,
      `${SEITE}/de-de/tierarztkosten/`,
    ]);
    const orte: Record<string, { section: 'blog'; slug: string }> = {
      'src/content/ratgeber/zahn-ziehen.md': { section: 'blog', slug: 'zahn-ziehen' },
      'src/content/ratgeber/entwurf.md': { section: 'blog', slug: 'entwurf' },
    };
    const urls = urlsZuMelden(
      ['src/content/ratgeber/zahn-ziehen.md', 'src/content/ratgeber/entwurf.md', 'README.md'],
      (datei) => orte[datei] ?? null,
      sitemap,
      SEITE,
    );
    expect(urls.sort()).toEqual([...sitemap].sort());
  });

  it('meldet nichts, wenn kein Artikel geändert wurde', () => {
    expect(
      urlsZuMelden(['src/styles/base.css'], () => null, new Set([`${SEITE}/de-de/`]), SEITE),
    ).toEqual([]);
  });
});
