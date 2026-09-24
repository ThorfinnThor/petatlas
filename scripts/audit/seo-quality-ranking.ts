/**
 * Reproduzierbare Rangliste aller gebauten HTML-Seiten.
 *
 * Die Rangfolge ist eine redaktionelle Priorisierung, keine Prognose für
 * Rankings oder Suchvolumen. Zuerst stehen die bewusst indexierbaren Seiten;
 * innerhalb dieser Gruppe folgen Seitentyp, Zielgruppenbezug und Datenstärke.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import {
  gotGruppenQualitaet,
  gotPositionsQualitaet,
  istIndexierbareGotGruppe,
  istIndexierbareGotPosition,
  SEO_INDEX_BUDGET,
} from '../../src/features/seo/index-quality.ts';
import { gruppen, positionen } from '../../src/features/costs/detail.ts';
import { stadtAllowlist } from '../../src/features/map/city-allowlist.ts';
import { leseKopf } from '../../src/lib/html-head.ts';
import { sammleSeiten } from '../publish/sitemap.ts';

const BASIS = 'https://deinhaustierportal.de';
const CSV_ZIEL = 'docs/reviews/seo-quality-ranking-2026-09-24.csv';
const MD_ZIEL = 'docs/reviews/seo-index-selection-2026-09-24.md';

interface Bewertung {
  readonly typ: string;
  readonly score: number;
  readonly begruendung: string;
}

const positionNachSlug = new Map(positionen().map((position) => [position.slug, position]));
const gruppeNachSlug = new Map(gruppen().map((gruppe) => [gruppe.slug, gruppe]));
const stadtNachSlug = new Map(stadtAllowlist().cities.map((stadt) => [stadt.slug, stadt]));

function bewerte(pfad: string): Bewertung {
  const gotPosition = /^\/de-de\/tierarztkosten\/([^/]+)\/$/.exec(pfad)?.[1];
  if (gotPosition && /^\d+-/.test(gotPosition)) {
    const position = positionNachSlug.get(gotPosition);
    if (position) {
      const wert = gotPositionsQualitaet(position);
      const score =
        (istIndexierbareGotPosition(position) ? 600 : 300) + Math.round(wert.score / 10);
      return { typ: 'GOT-Einzelseite', score, begruendung: wert.begruendung };
    }
  }

  const gotGruppe = /^\/de-de\/tierarztkosten\/gruppe\/([^/]+)\/$/.exec(pfad)?.[1];
  if (gotGruppe) {
    const gruppe = gruppeNachSlug.get(gotGruppe);
    if (gruppe) {
      const wert = gotGruppenQualitaet(gruppe);
      const score = (istIndexierbareGotGruppe(gruppe) ? 520 : 250) + gruppe.positionen.length;
      return { typ: 'GOT-Gruppe', score, begruendung: wert.begruendung };
    }
  }

  const stadtSlug = /^\/de-de\/tierarzt-karte\/([^/]+)\/$/.exec(pfad)?.[1];
  if (stadtSlug) {
    const stadt = stadtNachSlug.get(stadtSlug);
    const gesamt = stadt?.measured.total ?? 0;
    const kontakt = stadt?.measured.withContact ?? 0;
    return {
      typ: 'Ortsseite',
      score: 850 + Math.min(gesamt, 150) + Math.round((kontakt / Math.max(gesamt, 1)) * 20),
      begruendung: `${gesamt} lokale Orte, davon ${kontakt} mit Kontaktangabe; Karte und Filter`,
    };
  }

  if (/^\/de-de\/reisecheck\/[^/]+\/$/.test(pfad)) {
    return {
      typ: 'Reiseland',
      score: 920,
      begruendung: 'geprüfter Länderumfang mit Primärquellen',
    };
  }
  if (/^\/de-de\/ratgeber\/(katzen-beschaeftigen|katze-transportbox)\/$/.test(pfad)) {
    return { typ: 'Ratgeber', score: 910, begruendung: 'eigenständiger ausführlicher Ratgeber' };
  }
  if (/^\/de-de\/produkte\/[^/]+\/$/.test(pfad)) {
    return {
      typ: 'Kaufberatung',
      score: 840,
      begruendung: 'kuratierte Auswahlhilfe mit Produktdaten',
    };
  }
  if (/^\/de-de\/pflege\/[^/]+\/$/.test(pfad)) {
    return {
      typ: 'Pflegekategorie',
      score: 820,
      begruendung: 'eigenständige Kategorie und Auswahlhilfe',
    };
  }
  if (/^\/de-de\/futter\/[^/]+\/$/.test(pfad)) {
    return {
      typ: 'Futterprodukt',
      score: 800,
      begruendung: 'konkrete Packungs- und Grundpreisberechnung',
    };
  }

  const kernseiten = new Map<string, Bewertung>([
    [
      '/de-de/',
      { typ: 'Startseite', score: 1000, begruendung: 'zentraler redaktioneller Einstieg' },
    ],
    [
      '/de-de/tierarztkosten/',
      { typ: 'Tool', score: 990, begruendung: 'interaktiver GOT-Rechner' },
    ],
    [
      '/de-de/tierarzt-karte/',
      { typ: 'Tool', score: 985, begruendung: 'interaktive Karte mit lokalen Filtern' },
    ],
    [
      '/de-de/reisecheck/',
      { typ: 'Tool', score: 980, begruendung: 'interaktiver Reisecheck mit Quellen' },
    ],
    ['/de-de/spielzeug/', { typ: 'Tool', score: 970, begruendung: 'interaktiver Spielzeugfinder' }],
    [
      '/de-de/tierarztkosten/katalog/',
      { typ: 'Katalog', score: 960, begruendung: 'vollständiger Katalogeinstieg' },
    ],
    ['/de-de/pflege/', { typ: 'Kategorie', score: 950, begruendung: 'kuratierter Pflegeeinstieg' }],
    ['/de-de/futter/', { typ: 'Kategorie', score: 945, begruendung: 'Futtervergleich und Suche' }],
    [
      '/de-de/ergaenzungsfuttermittel/',
      { typ: 'Kategorie', score: 940, begruendung: 'Einordnung und Kostenvergleich' },
    ],
    [
      '/de-de/tierversicherung/',
      {
        typ: 'Informationsseite',
        score: 930,
        begruendung: 'neutrale Einordnung mit Anbieterhinweis',
      },
    ],
    [
      '/de-de/quellen/',
      { typ: 'Vertrauensseite', score: 905, begruendung: 'Quellen- und Datenherkunft' },
    ],
    [
      '/de-de/methodik/',
      { typ: 'Vertrauensseite', score: 900, begruendung: 'Methodik und Grenzen' },
    ],
  ]);
  const kernseite = kernseiten.get(pfad);
  if (kernseite) return kernseite;

  if (/^\/entwicklung\//.test(pfad)) {
    return {
      typ: 'Technische Probe',
      score: 0,
      begruendung: 'nicht für Nutzer oder Suchmaschinen',
    };
  }
  if (pfad === '/' || pfad === '/404.html') {
    return { typ: 'Technisch', score: 0, begruendung: 'Weiterleitung oder Fehlerseite' };
  }
  return {
    typ: 'Erreichbare Serviceseite',
    score: 150,
    begruendung: 'kein eigenständiges Suchziel',
  };
}

function csvWert(wert: string | number): string {
  const text = String(wert);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function sichtbareWoerter(html: string): number {
  const text = html
    .replaceAll(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replaceAll(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replaceAll(/<[^>]+>/g, ' ')
    .replaceAll(/&[a-z0-9#]+;/gi, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
  return text === '' ? 0 : text.split(' ').length;
}

function main(): number {
  const seiten = sammleSeiten('dist');
  if (seiten.length === 0) {
    console.error('Kein Build vorhanden. Erst den Produktionsbuild erzeugen.');
    return 1;
  }
  const sitemap = existsSync('dist/sitemap.xml') ? readFileSync('dist/sitemap.xml', 'utf8') : '';
  const bewertet = seiten.map((seite) => {
    const html = readFileSync(seite.datei, 'utf8');
    const kopf = leseKopf(html);
    return {
      ...seite,
      ...bewerte(seite.pfad),
      titel: kopf.titel ?? '',
      woerter: sichtbareWoerter(html),
      inSitemap: sitemap.includes(`<loc>${new URL(seite.pfad, BASIS).toString()}</loc>`),
    };
  });

  bewertet.sort((a, b) => {
    if (a.indexierbar !== b.indexierbar) return a.indexierbar ? -1 : 1;
    if (a.score !== b.score) return b.score - a.score;
    return a.pfad.localeCompare(b.pfad, 'de');
  });

  const kopf = [
    'Rang',
    'URL',
    'Seitentyp',
    'Qualitätswert',
    'Entscheidung',
    'in Sitemap',
    'sichtbare Wörter',
    'Titel',
    'Begründung',
  ];
  const zeilen = bewertet.map((seite, index) =>
    [
      index + 1,
      new URL(seite.pfad, BASIS).toString(),
      seite.typ,
      seite.score,
      seite.indexierbar ? 'indexieren' : 'noindex',
      seite.inSitemap ? 'ja' : 'nein',
      seite.woerter,
      seite.titel,
      seite.begruendung,
    ]
      .map(csvWert)
      .join(','),
  );
  mkdirSync(dirname(CSV_ZIEL), { recursive: true });
  writeFileSync(CSV_ZIEL, [kopf.map(csvWert).join(','), ...zeilen, ''].join('\n'), 'utf8');

  const indexierbar = bewertet.filter((seite) => seite.indexierbar);
  const nachTyp = new Map<string, number>();
  for (const seite of indexierbar) nachTyp.set(seite.typ, (nachTyp.get(seite.typ) ?? 0) + 1);
  const zusammenfassung = [
    '# SEO-Indexauswahl vom 24.09.2026',
    '',
    `**Freigegeben:** ${indexierbar.length} von ${bewertet.length} gebauten HTML-Seiten.`,
    `Zielkorridor: ${SEO_INDEX_BUDGET.minimum}–${SEO_INDEX_BUDGET.maximum}, Zielwert: ${SEO_INDEX_BUDGET.target}.`,
    '',
    '## Verteilung der indexierbaren Seiten',
    '',
    '| Seitentyp | Anzahl |',
    '| --- | ---: |',
    ...[...nachTyp.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'de'))
      .map(([typ, anzahl]) => `| ${typ} | ${anzahl} |`),
    '',
    '## Auswahlregel',
    '',
    '- Redaktionelle Seiten, Tools, geprüfte Reiseziele, Ortsseiten und kuratierte Produktseiten bleiben indexierbar.',
    `- Von 1.006 GOT-Einzelseiten werden ${SEO_INDEX_BUDGET.gotPositions} mit dem stärksten Bezug zu Hund, Katze und typischen Tierarztleistungen indexiert.`,
    `- GOT-Gruppenseiten brauchen mindestens ${SEO_INDEX_BUDGET.minimumGotGroupSize} Positionen für einen eigenständigen Katalognutzen.`,
    '- Alle übrigen Seiten bleiben erreichbar, tragen aber `noindex, nofollow`, fehlen in der Sitemap und werden von Pagefind ausgeschlossen.',
    '- Die Rangfolge ist eine redaktionelle Qualitätspriorisierung. Sie behauptet kein Suchvolumen und keine medizinische Bewertung.',
    '- 400–500 Seiten sind eine bewusst gewählte redaktionelle Obergrenze, keine von Google vorgegebene Mindest- oder Höchstzahl.',
    '',
    '## Grundlage',
    '',
    '- [Google: Spamrichtlinien – Missbrauch mit skalierten Inhalten](https://developers.google.com/search/docs/essentials/spam-policies#scaled-content)',
    '- [Google: Inhalte mit `noindex` aus Suchergebnissen ausschließen](https://developers.google.com/search/docs/crawling-indexing/block-indexing)',
    '- [Google: Eine Sitemap nennt die als wichtig erachteten Seiten](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)',
    '',
    `Die vollständige Rangliste steht in \`${CSV_ZIEL}\`.`,
    '',
  ].join('\n');
  writeFileSync(MD_ZIEL, zusammenfassung, 'utf8');

  if (
    indexierbar.length < SEO_INDEX_BUDGET.minimum ||
    indexierbar.length > SEO_INDEX_BUDGET.maximum
  ) {
    console.error(`Indexbestand ${indexierbar.length} liegt außerhalb des Zielkorridors.`);
    return 1;
  }
  console.log(
    `SEO-Rangliste geschrieben: ${indexierbar.length} von ${bewertet.length} Seiten indexierbar.`,
  );
  return 0;
}

process.exit(main());
