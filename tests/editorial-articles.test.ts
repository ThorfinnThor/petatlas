import run from '../content-data/editorial-runs/2026-10-15-pilot.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';

import {
  validateEditorialArticles,
  type EditorialArticleCandidate,
} from '../src/features/editorial/quality.ts';
import {
  ArticleSchema,
  EditorialRunSchema,
  type ArticleData,
} from '../src/features/editorial/schema.ts';

const longBody = [
  '## Erster Abschnitt',
  'Ein eigenständiger redaktioneller Absatz mit nachvollziehbaren Angaben. '.repeat(20),
  '## Zweiter Abschnitt',
  'Weitere Informationen werden eingeordnet und nicht als pauschale Zusage formuliert. '.repeat(20),
  '## Dritter Abschnitt',
  'Die Grenzen der Daten und der konkrete Suchzweck bleiben sichtbar. '.repeat(20),
  '## Vierter Abschnitt',
  'Interne Wege führen zum [Werkzeug](/de-de/werkzeug/) und zur [Übersicht](/de-de/uebersicht/). '.repeat(
    20,
  ),
].join('\n\n');

function article(overrides: Partial<ArticleData> = {}): ArticleData {
  return {
    title: 'Ein eindeutiger und ausreichend langer Ratgebertitel',
    description:
      'Eine eigenständige Beschreibung erklärt den konkreten Nutzen dieses ausführlichen Ratgebers.',
    intro:
      'Diese eigenständige Einleitung erläutert eine konkrete Nutzerfrage mit einem klaren Ziel und benennt zugleich, welche Daten für die Antwort verwendet werden.',
    slug: 'beispiel-ratgeber',
    publishedAt: '2026-10-15',
    updatedAt: '2026-10-15',
    status: 'published',
    primaryIntent: 'Eine konkrete und nachvollziehbare Frage vollständig beantworten',
    animal: 'both',
    topicCluster: 'Beispiel',
    sourceIds: ['quelle-eins', 'quelle-zwei'],
    dataFiles: ['content-data/example.json'],
    reviewLevel: 'editorial',
    indexable: true,
    relatedTools: [],
    relatedArticles: [],
    affiliateContext: 'none',
    editorialLinks: ['/de-de/werkzeug/', '/de-de/uebersicht/'],
    ...overrides,
  };
}

const sources = [
  { id: 'quelle-eins', checkedAt: '2026-10-01' },
  { id: 'quelle-zwei', checkedAt: '2026-10-02' },
];

const options = {
  now: '2026-10-15',
  validInternalPaths: new Set(['/de-de/werkzeug/', '/de-de/uebersicht/']),
  dataFileExists: () => true,
};

describe('Ratgeber-Schema', () => {
  it('verhindert indexierbare Entwürfe', () => {
    const result = ArticleSchema.safeParse(article({ status: 'draft', indexable: true }));
    expect(result.success).toBe(false);
  });

  it('verhindert ein Aktualisierungsdatum vor der Veröffentlichung', () => {
    const result = ArticleSchema.safeParse(
      article({ publishedAt: '2026-10-15', updatedAt: '2026-10-14' }),
    );
    expect(result.success).toBe(false);
  });

  it('prüft das versionierte Redaktionsprotokoll', () => {
    expect(EditorialRunSchema.safeParse(run).success).toBe(true);
  });
});

describe('Redaktionelle Qualitätsprüfung', () => {
  it('akzeptiert einen vollständigen eigenständigen Artikel', () => {
    const candidate: EditorialArticleCandidate = {
      id: 'beispiel-ratgeber',
      data: article(),
      body: longBody,
    };
    expect(validateEditorialArticles([candidate], sources, options)).toEqual([]);
  });

  it('findet fehlende und veraltete Quellen sowie kaputte interne Ziele', () => {
    const candidate: EditorialArticleCandidate = {
      id: 'beispiel-ratgeber',
      data: article({ sourceIds: ['quelle-alt', 'quelle-fehlt'] }),
      body: `${longBody}\n[Kaputt](/de-de/fehlt/)`,
    };
    const issues = validateEditorialArticles(
      [candidate],
      [{ id: 'quelle-alt', checkedAt: '2024-01-01' }],
      options,
    );
    expect(issues.some((issue) => issue.problem.includes('älter als'))).toBe(true);
    expect(issues.some((issue) => issue.problem.includes('Unbekannte Quellen-ID'))).toBe(true);
    expect(issues.some((issue) => issue.problem.includes('unbekannten Pfad'))).toBe(true);
  });

  it('findet doppelte Titel und nahezu gleiche Einleitungen', () => {
    const first: EditorialArticleCandidate = {
      id: 'beispiel-ratgeber',
      data: article(),
      body: longBody,
    };
    const second: EditorialArticleCandidate = {
      id: 'zweiter-ratgeber',
      data: article({ slug: 'zweiter-ratgeber' }),
      body: longBody,
    };
    const issues = validateEditorialArticles([first, second], sources, options);
    expect(issues.some((issue) => issue.field === 'title')).toBe(true);
    expect(issues.some((issue) => issue.field === 'intro')).toBe(true);
  });

  it('verhindert Affiliate-Bezüge ohne freigegebenen Kontext', () => {
    const candidate: EditorialArticleCandidate = {
      id: 'beispiel-ratgeber',
      data: article(),
      body: `${longBody}\nProdukte bei Amazon ansehen.`,
    };
    const issues = validateEditorialArticles([candidate], sources, options);
    expect(issues.some((issue) => issue.field === 'affiliateContext')).toBe(true);
  });
});
