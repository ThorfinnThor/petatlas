// M18-01 — Geprüft wird gegen eine **indexierbare** Umgebung, denn nur dort
// greifen die Regeln. Der heutige Build ist durchweg noindex; ohne diese
// synthetischen Fälle prüfte der Gate nichts.
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  NIE_INDEXIEREN,
  VERBOTENE_SCHEMA_TYPEN,
  pruefeSeite,
  pruefeSitemap,
  pruefeTitelEindeutig,
  type Umgebung,
} from '../../scripts/checks/seo.ts';
import { leseKopf, nichtIndexierbar } from '../../src/lib/html-head.ts';
import {
  baueRobots,
  baueSitemap,
  pfadAusDatei,
  sammleSeiten,
} from '../../scripts/publish/sitemap.ts';

const UMGEBUNG: Umgebung = {
  baseUrl: 'https://petatlas.example/',
  indexierbar: true,
  aktivePrefixe: ['/de-de'],
  sprachen: ['de-DE'],
};

function seite(
  teile: {
    titel?: string;
    h1?: string;
    robots?: string | null;
    canonical?: string | null;
    kopfExtra?: string;
    koerperExtra?: string;
    bodyAttribute?: string;
  } = {},
): string {
  const {
    titel = 'Quellen — PetAtlas',
    h1 = 'Quellen',
    robots = 'index, follow',
    canonical = 'https://petatlas.example/de-de/quellen/',
    kopfExtra = '',
    koerperExtra = '',
    bodyAttribute = '',
  } = teile;
  return [
    '<!doctype html><html lang="de-DE"><head>',
    `<title>${titel}</title>`,
    robots === null ? '' : `<meta name="robots" content="${robots}">`,
    canonical === null ? '' : `<link rel="canonical" href="${canonical}">`,
    kopfExtra,
    `</head><body${bodyAttribute}>`,
    h1 === '' ? '' : `<h1>${h1}</h1>`,
    koerperExtra,
    '</body></html>',
  ].join('');
}

const PFAD = '/de-de/quellen/';

describe('Eine saubere Seite', () => {
  it('wird nicht beanstandet', () => {
    expect(pruefeSeite(PFAD, seite(), UMGEBUNG)).toEqual([]);
  });
});

describe('Grundangaben', () => {
  it('verlangt einen Titel', () => {
    expect(pruefeSeite(PFAD, seite({ titel: '' }), UMGEBUNG)[0]?.problem).toContain('Kein Titel');
  });

  it('verlangt genau eine H1', () => {
    expect(pruefeSeite(PFAD, seite({ h1: '' }), UMGEBUNG)[0]?.problem).toContain('Keine H1');
    const zwei = seite({ koerperExtra: '<h1>Noch eine</h1>' });
    expect(pruefeSeite(PFAD, zwei, UMGEBUNG)[0]?.problem).toContain('2 H1');
  });

  it('verlangt eine ausdrückliche robots-Angabe', () => {
    const befund = pruefeSeite(PFAD, seite({ robots: null }), UMGEBUNG);
    expect(befund.some((eintrag) => eintrag.problem.includes('keine Auslassung'))).toBe(true);
  });
});

describe('canonical', () => {
  it('verlangt eines für indexierbare Seiten', () => {
    const befund = pruefeSeite(PFAD, seite({ canonical: null }), UMGEBUNG);
    expect(befund.some((eintrag) => eintrag.problem.includes('ohne canonical'))).toBe(true);
  });

  it('erkennt ein canonical, das auf eine andere Seite zeigt', () => {
    const falsch = seite({ canonical: 'https://petatlas.example/de-de/' });
    expect(pruefeSeite(PFAD, falsch, UMGEBUNG)[0]?.problem).toContain('zeigt auf');
  });

  it('verlangt keines von einer noindex-Seite', () => {
    const ohne = seite({ robots: 'noindex, nofollow', canonical: null });
    expect(pruefeSeite('/de-de/x/', ohne, UMGEBUNG)).toEqual([]);
  });
});

describe('Seiten, die nie in einen Index gehören', () => {
  it('beanstandet eine Probeseite ohne noindex', () => {
    const befund = pruefeSeite('/entwicklung/designprobe/', seite(), UMGEBUNG);
    expect(befund.some((eintrag) => eintrag.problem.includes('ohne noindex'))).toBe(true);
  });

  it('beanstandet eine noindex-Probeseite, die die eigene Suche noch aufnähme', () => {
    const ohneIgnore = seite({ robots: 'noindex, nofollow', canonical: null });
    const befund = pruefeSeite('/entwicklung/designprobe/', ohneIgnore, UMGEBUNG);
    expect(befund.some((eintrag) => eintrag.problem.includes('data-pagefind-ignore'))).toBe(true);
  });

  it('lässt eine korrekt ausgenommene Probeseite durch', () => {
    const richtig = seite({
      robots: 'noindex, nofollow',
      canonical: null,
      bodyAttribute: ' data-pagefind-ignore="all"',
    });
    expect(pruefeSeite('/entwicklung/designprobe/', richtig, UMGEBUNG)).toEqual([]);
  });

  it('nennt die Fehlerseite unter den nie zu indexierenden Pfaden', () => {
    expect(NIE_INDEXIEREN).toContain('/404');
  });
});

describe('Kein erfundenes Bewertungs-Markup', () => {
  // Zwei realistische Blöcke statt einer Schleife über Wortlisten: so steht
  // im Test, wie das Markup tatsächlich aussähe, das hier nicht entstehen darf.
  const beispiele = [
    '{"@type":"Product","name":"Futter","aggregateRating":{"@type":"AggregateRating","ratingValue":"4.8","reviewCount":"312"}}',
    '{"@type":"Review","reviewRating":{"@type":"Rating","ratingValue":5},"author":"erfunden"}',
  ];

  for (const [index, block] of beispiele.entries()) {
    it(`beanstandet Bewertungs-Markup (Beispiel ${index + 1})`, () => {
      const mitMarkup = seite({
        koerperExtra: `<script type="application/ld+json">${block}</script>`,
      });
      const befund = pruefeSeite(PFAD, mitMarkup, UMGEBUNG);
      expect(befund.some((eintrag) => eintrag.problem.includes('keine Bewertungen'))).toBe(true);
    });
  }

  it('erkennt jeden aufgeführten Begriff in mindestens einem Beispiel', () => {
    for (const verboten of VERBOTENE_SCHEMA_TYPEN) {
      expect(beispiele.some((block) => block.includes(verboten))).toBe(true);
    }
  });

  it('lässt strukturierte Daten ohne Bewertungen durch', () => {
    const sauber = seite({
      koerperExtra:
        '<script type="application/ld+json">{"@type":"WebSite","name":"PetAtlas"}</script>',
    });
    expect(pruefeSeite(PFAD, sauber, UMGEBUNG)).toEqual([]);
  });
});

describe('hreflang', () => {
  it('beanstandet Angaben, solange nur eine Sprache aktiv ist', () => {
    const mitHreflang = seite({
      kopfExtra: '<link rel="alternate" hreflang="en-US" href="https://petatlas.example/en-us/">',
    });
    const befund = pruefeSeite(PFAD, mitHreflang, UMGEBUNG);
    expect(befund.some((eintrag) => eintrag.problem.includes('Paar mit sich selbst'))).toBe(true);
  });

  it('lässt sie zu, sobald es eine zweite Sprache gibt', () => {
    const zwei: Umgebung = { ...UMGEBUNG, sprachen: ['de-DE', 'en-US'] };
    const mitHreflang = seite({
      kopfExtra: '<link rel="alternate" hreflang="en-US" href="https://petatlas.example/en-us/">',
    });
    expect(pruefeSeite(PFAD, mitHreflang, zwei)).toEqual([]);
  });
});

describe('Inaktive Märkte', () => {
  it('beanstandet eine indexierbare Seite außerhalb der aktiven Präfixe', () => {
    const befund = pruefeSeite(
      '/en-us/sources/',
      seite({ canonical: 'https://petatlas.example/en-us/sources/' }),
      UMGEBUNG,
    );
    expect(befund.some((eintrag) => eintrag.problem.includes('außerhalb der aktiven Märkte'))).toBe(
      true,
    );
  });
});

describe('Weiterleitungsseiten', () => {
  const weiterleitung =
    '<!doctype html><title>Redirecting</title><meta http-equiv="refresh" content="0;url=/de-de/">' +
    '<meta name="robots" content="noindex"><body><a href="/de-de/">weiter</a></body>';

  it('werden nicht an einer H1 gemessen', () => {
    expect(pruefeSeite('/', weiterleitung, UMGEBUNG)).toEqual([]);
    expect(leseKopf(weiterleitung).weiterleitungZu).toBe('/de-de/');
  });

  it('müssen trotzdem ausdrücklich noindex sein', () => {
    // Ohne robots-Angabe ist die Zwischenseite indexierbar; ein fehlendes
    // Tag ist deshalb kein stilles „nein“.
    const ohne = weiterleitung.replace('<meta name="robots" content="noindex">', '');
    const befund = pruefeSeite('/', ohne, UMGEBUNG);
    expect(befund.some((eintrag) => eintrag.problem.includes('noindex'))).toBe(true);
  });

  it('werden beanstandet, wenn sie ausdrücklich indexierbar sind', () => {
    const indexierbar = weiterleitung.replace('content="noindex"', 'content="index, follow"');
    const befund = pruefeSeite('/', indexierbar, UMGEBUNG);
    expect(befund.some((eintrag) => eintrag.problem.includes('noindex'))).toBe(true);
  });
});

describe('Eindeutige Titel', () => {
  it('beanstandet zwei Seiten mit demselben Titel', () => {
    const befund = pruefeTitelEindeutig([
      { pfad: '/a/', titel: 'Gleich' },
      { pfad: '/b/', titel: 'Gleich' },
      { pfad: '/c/', titel: 'Anders' },
    ]);
    expect(befund.length).toBe(1);
    expect(befund[0]?.pfad).toBe('/a/, /b/');
  });
});

describe('Sitemap', () => {
  const seiten = [
    { pfad: '/de-de/', datei: 'x', indexierbar: true },
    { pfad: '/entwicklung/probe/', datei: 'y', indexierbar: false },
  ];

  it('nimmt nur indexierbare Seiten auf', () => {
    const xml = baueSitemap(seiten, UMGEBUNG.baseUrl);
    expect(xml).toContain('https://petatlas.example/de-de/');
    expect(xml).not.toContain('entwicklung');
    expect(pruefeSitemap(xml, seiten, UMGEBUNG)).toEqual([]);
  });

  it('beanstandet eine fehlende indexierbare Seite', () => {
    const xml = baueSitemap([], UMGEBUNG.baseUrl);
    const befund = pruefeSitemap(xml, seiten, UMGEBUNG);
    expect(befund[0]?.problem).toContain('steht aber nicht in der Sitemap');
  });

  it('beanstandet eine Sitemap, die eine noindex-Seite nennt', () => {
    const xml = baueSitemap([{ ...seiten[1]!, indexierbar: true }, seiten[0]!], UMGEBUNG.baseUrl);
    const befund = pruefeSitemap(xml, seiten, UMGEBUNG);
    expect(befund.some((eintrag) => eintrag.problem.includes('nicht indexierbar'))).toBe(true);
  });

  it('verlangt in einem nicht indexierbaren Build gar keine Sitemap', () => {
    const nichtIndexierbarUmgebung: Umgebung = { ...UMGEBUNG, indexierbar: false };
    expect(pruefeSitemap(null, seiten, nichtIndexierbarUmgebung)).toEqual([]);
    const befund = pruefeSitemap(
      baueSitemap(seiten, UMGEBUNG.baseUrl),
      seiten,
      nichtIndexierbarUmgebung,
    );
    expect(befund[0]?.problem).toContain('nicht indexiert werden soll');
  });
});

describe('robots.txt', () => {
  it('verbietet in einem nicht indexierbaren Build alles', () => {
    const text = baueRobots(false, UMGEBUNG.baseUrl);
    expect(text).toMatch(/^Disallow:\s*\/$/m);
    expect(text).not.toContain('Sitemap:');
  });

  it('nennt Sitemap und schließt Probeseiten aus, sobald indexiert werden darf', () => {
    const text = baueRobots(true, UMGEBUNG.baseUrl);
    expect(text).toContain('Sitemap: https://petatlas.example/sitemap.xml');
    expect(text).toContain('Disallow: /entwicklung/');
  });
});

describe('Seiten einsammeln', () => {
  it('macht aus Dateipfaden Browserpfade', () => {
    expect(pfadAusDatei('dist', join('dist', 'index.html'))).toBe('/');
    expect(pfadAusDatei('dist', join('dist', 'de-de', 'quellen', 'index.html'))).toBe(
      '/de-de/quellen/',
    );
    expect(pfadAusDatei('dist', join('dist', '404.html'))).toBe('/404.html');
  });

  it('liest die Indexierbarkeit aus der Seite selbst', () => {
    const wurzel = mkdtempSync(join(tmpdir(), 'seo-'));
    mkdirSync(join(wurzel, 'de-de'), { recursive: true });
    writeFileSync(join(wurzel, 'de-de', 'index.html'), seite(), 'utf8');
    writeFileSync(
      join(wurzel, '404.html'),
      seite({ robots: 'noindex, nofollow', canonical: null }),
      'utf8',
    );
    const gefunden = sammleSeiten(wurzel);
    expect(gefunden.map((eintrag) => eintrag.pfad).sort()).toEqual(['/404.html', '/de-de/']);
    expect(gefunden.find((eintrag) => eintrag.pfad === '/404.html')?.indexierbar).toBe(false);
    expect(nichtIndexierbar(leseKopf(seite()))).toBe(false);
  });
});
