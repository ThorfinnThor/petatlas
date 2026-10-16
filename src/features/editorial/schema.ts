import { z } from 'astro/zod';

export const ARTICLE_STATUSES = ['draft', 'review', 'published', 'archived'] as const;
export const ARTICLE_ANIMALS = ['dog', 'cat', 'both'] as const;
export const ARTICLE_REVIEW_LEVELS = ['editorial', 'human-specialist'] as const;
export const ARTICLE_AFFILIATE_CONTEXTS = [
  'none',
  'product-selection',
  'merchant-category',
  'insurance',
] as const;

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const internalPathSchema = z.string().regex(/^\/de-de\/(?:[^?#]*\/)?$/);

export const ArticleSchema = z
  .object({
    title: z.string().min(20).max(90),
    cardTitle: z.string().min(12).max(80).optional(),
    description: z.string().min(80).max(180),
    intro: z.string().min(120).max(700),
    slug: slugSchema,
    publishedAt: isoDateSchema,
    updatedAt: isoDateSchema,
    status: z.enum(ARTICLE_STATUSES),
    primaryIntent: z.string().min(20).max(180),
    animal: z.enum(ARTICLE_ANIMALS),
    topicCluster: z.string().min(3).max(60),
    section: z.enum(['guide', 'blog']).default('guide'),
    sourceIds: z.array(slugSchema).min(1),
    dataFiles: z.array(z.string().min(3)).min(1),
    reviewLevel: z.enum(ARTICLE_REVIEW_LEVELS),
    indexable: z.boolean(),
    relatedTools: z
      .array(z.enum(['costs', 'map', 'travel', 'care', 'toys', 'food', 'supplements', 'insurance']))
      .max(4),
    relatedArticles: z.array(slugSchema).max(6),
    affiliateContext: z.enum(ARTICLE_AFFILIATE_CONTEXTS),
    image: slugSchema.optional(),
    legacyRenderer: z.enum(['cat-enrichment', 'cat-carrier']).optional(),
    editorialLinks: z.array(internalPathSchema).min(2),
  })
  .strict()
  .superRefine((article, context) => {
    if (article.updatedAt < article.publishedAt) {
      context.addIssue({
        code: 'custom',
        path: ['updatedAt'],
        message: 'updatedAt darf nicht vor publishedAt liegen.',
      });
    }
    if (article.status !== 'published' && article.indexable) {
      context.addIssue({
        code: 'custom',
        path: ['indexable'],
        message: 'Nur veröffentlichte Artikel dürfen indexierbar sein.',
      });
    }
    if (article.relatedArticles.includes(article.slug)) {
      context.addIssue({
        code: 'custom',
        path: ['relatedArticles'],
        message: 'Ein Artikel darf sich nicht selbst verlinken.',
      });
    }
  });

export type ArticleData = z.infer<typeof ArticleSchema>;

export const EditorialRunSchema = z
  .object({
    schemaVersion: z.literal(1),
    runId: z.string().regex(/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/),
    createdAt: z.iso.datetime(),
    stage: z.enum(['inventory', 'candidates', 'briefing', 'review', 'published']),
    candidates: z.array(
      z
        .object({
          slug: slugSchema,
          question: z.string().min(20),
          topicCluster: z.string().min(3),
          sourceIds: z.array(slugSchema).min(1),
          dataFiles: z.array(z.string().min(3)).min(1),
          risk: z.enum(['low', 'medium', 'high']),
          decision: z.enum(['draft', 'selected', 'blocked', 'published']),
          reason: z.string().min(20),
        })
        .strict(),
    ),
    checks: z
      .object({
        sources: z.enum(['pending', 'passed', 'failed']),
        editorial: z.enum(['pending', 'passed', 'failed']),
        technical: z.enum(['pending', 'passed', 'failed']),
        indexBudget: z.enum(['pending', 'passed', 'failed']),
      })
      .strict(),
    publishedSlugs: z.array(slugSchema),
    notes: z.array(z.string().min(10)),
  })
  .strict();

export type EditorialRun = z.infer<typeof EditorialRunSchema>;
