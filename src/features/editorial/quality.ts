import type { ArticleData } from './schema.ts';

export interface EditorialArticleCandidate {
  readonly id: string;
  readonly data: ArticleData;
  readonly body: string;
}

export interface EditorialSourceReference {
  readonly id: string;
  readonly checkedAt: string;
}

export interface EditorialQualityIssue {
  readonly slug: string;
  readonly field: string;
  readonly problem: string;
}

export interface EditorialQualityOptions {
  readonly now: string;
  readonly validInternalPaths: ReadonlySet<string>;
  readonly dataFileExists: (path: string) => boolean;
  readonly maxSourceAgeDays?: number;
}

function normalise(value: string): string {
  return value
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9äöüß]+/g, ' ')
    .trim();
}

function tokens(value: string): Set<string> {
  return new Set(
    normalise(value)
      .split(/\s+/)
      .filter((word) => word.length > 3),
  );
}

export function textSimilarity(left: string, right: string): number {
  const a = tokens(left);
  const b = tokens(right);
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return (2 * shared) / (a.size + b.size);
}

function markdownInternalLinks(body: string): readonly string[] {
  return [...body.matchAll(/\[[^\]]+\]\((\/de-de\/[^)#?]*(?:\/)?)(?:[?#][^)]*)?\)/g)].map(
    (match) => match[1] ?? '',
  );
}

function daysBetween(earlier: string, later: string): number {
  const start = Date.parse(`${earlier}T00:00:00Z`);
  const end = Date.parse(`${later}T00:00:00Z`);
  return Math.floor((end - start) / 86_400_000);
}

export function validateEditorialArticles(
  articles: readonly EditorialArticleCandidate[],
  sources: readonly EditorialSourceReference[],
  options: EditorialQualityOptions,
): readonly EditorialQualityIssue[] {
  const issues: EditorialQualityIssue[] = [];
  const sourceById = new Map(sources.map((source) => [source.id, source]));
  const articleBySlug = new Map(articles.map((article) => [article.data.slug, article]));
  const maxSourceAgeDays = options.maxSourceAgeDays ?? 400;
  const report = (slug: string, field: string, problem: string): void => {
    issues.push({ slug, field, problem });
  };

  const titleOwners = new Map<string, string[]>();
  for (const article of articles) {
    const normalisedTitle = normalise(article.data.title);
    titleOwners.set(normalisedTitle, [
      ...(titleOwners.get(normalisedTitle) ?? []),
      article.data.slug,
    ]);
  }
  for (const [title, slugs] of titleOwners) {
    if (slugs.length < 2) continue;
    for (const slug of slugs) report(slug, 'title', `Doppelter Artikeltitel: ${title}`);
  }

  for (let left = 0; left < articles.length; left += 1) {
    for (let right = left + 1; right < articles.length; right += 1) {
      const first = articles[left];
      const second = articles[right];
      if (first === undefined || second === undefined) continue;
      const similarity = textSimilarity(first.data.intro, second.data.intro);
      if (similarity < 0.72) continue;
      report(
        second.data.slug,
        'intro',
        `Einleitung ähnelt ${first.data.slug} zu stark (${Math.round(similarity * 100)} %).`,
      );
    }
  }

  for (const article of articles) {
    const { data, body } = article;
    if (article.id !== data.slug) {
      report(data.slug, 'slug', `Collection-ID ${article.id} stimmt nicht mit dem Slug überein.`);
    }

    for (const sourceId of data.sourceIds) {
      const source = sourceById.get(sourceId);
      if (source === undefined) {
        report(data.slug, 'sourceIds', `Unbekannte Quellen-ID ${sourceId}.`);
        continue;
      }
      if (daysBetween(source.checkedAt, options.now) > maxSourceAgeDays) {
        report(
          data.slug,
          'sourceIds',
          `Quelle ${sourceId} ist älter als ${maxSourceAgeDays} Tage und muss neu geprüft werden.`,
        );
      }
    }
    if (data.indexable && data.sourceIds.length < 2) {
      report(data.slug, 'sourceIds', 'Indexierbare Ratgeber brauchen mindestens zwei Quellen.');
    }

    for (const path of data.dataFiles) {
      if (!options.dataFileExists(path)) {
        report(data.slug, 'dataFiles', `Datengrundlage fehlt: ${path}`);
      }
    }

    for (const slug of data.relatedArticles) {
      const related = articleBySlug.get(slug);
      if (related === undefined) {
        report(data.slug, 'relatedArticles', `Verwandter Artikel fehlt: ${slug}`);
      } else if (related.data.status !== 'published') {
        report(
          data.slug,
          'relatedArticles',
          `Verwandter Artikel ist nicht veröffentlicht: ${slug}`,
        );
      }
    }

    for (const path of data.editorialLinks) {
      if (!options.validInternalPaths.has(path)) {
        report(data.slug, 'editorialLinks', `Interner Zielpfad ist nicht freigegeben: ${path}`);
      }
    }
    for (const path of markdownInternalLinks(body)) {
      if (!options.validInternalPaths.has(path)) {
        report(data.slug, 'body', `Markdown-Link zeigt auf unbekannten Pfad: ${path}`);
      }
    }

    if (data.indexable && data.legacyRenderer === undefined) {
      const visibleLength = body
        .replaceAll(/\[[^\]]+\]\([^)]+\)/g, ' ')
        .replaceAll(/[#*_>`|~-]+/g, ' ')
        .replaceAll(/\s+/g, ' ')
        .trim().length;
      if (visibleLength < 3_500) {
        report(
          data.slug,
          'body',
          `Indexierbarer Ratgeber ist mit ${visibleLength} Zeichen zu knapp (mindestens 3.500).`,
        );
      }
      const sections = [...body.matchAll(/^##\s+/gm)].length;
      if (sections < 4) {
        report(
          data.slug,
          'body',
          'Indexierbarer Ratgeber braucht mindestens vier Hauptabschnitte.',
        );
      }
    }

    const affiliateMentions = body.match(/\b(?:Amazon|Awin|Fressnapf|Werbung|Provision)\b/gi) ?? [];
    if (data.affiliateContext === 'none' && affiliateMentions.length > 0) {
      report(data.slug, 'affiliateContext', 'Affiliate-Bezug ohne freigegebenen Kontext.');
    }
    if (data.affiliateContext !== 'none') {
      const disclosures = body.match(/Werbung:\s/gi) ?? [];
      if (disclosures.length !== 1) {
        report(
          data.slug,
          'affiliateContext',
          'Affiliate-Inhalt braucht genau einen kleinen Werbehinweis pro Seite.',
        );
      }
    }
  }

  return issues;
}
