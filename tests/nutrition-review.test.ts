import { describe, expect, it } from 'vitest';

import review from '../config/reviews/nutrition.json' with { type: 'json' };

describe('Eigene Ernährungsfreigabe', () => {
  it('ist unabhängig von GOT und Reise dokumentiert', () => {
    expect(review.scope).toContain('Ergänzungsfuttermitteln');
    expect(review.evidence).toBe('docs/reviews/food.md');
  });

  it('behauptet ohne Person, Datum und Inhaltskennung keine Freigabe', () => {
    if ((review.status as string) === 'approved') {
      expect(review.reviewedBy).toBeTruthy();
      expect(review.reviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(review.reviewedContentHash).toMatch(/^[a-f0-9]{64}$/);
    } else {
      expect(review.status).toBe('pending');
    }
  });
});
