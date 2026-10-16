import type { ArticleData } from './schema.ts';

type ArticleLocation = Pick<ArticleData, 'section' | 'slug'>;

export function articlePath(article: ArticleLocation): string {
  const section = article.section === 'blog' ? 'blog' : 'ratgeber';
  return `/de-de/${section}/${article.slug}/`;
}
