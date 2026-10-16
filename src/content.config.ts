import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

import { ArticleSchema } from './features/editorial/schema.ts';

const ratgeber = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/content/ratgeber',
    generateId: ({ data }) => String(data.slug),
  }),
  schema: ArticleSchema,
});

export const collections = { ratgeber };
