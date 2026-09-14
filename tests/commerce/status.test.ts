import { describe, expect, it } from 'vitest';

import { commerceStatus } from '../../src/features/commerce/status.ts';

describe('Getrennter Partner- und Feedstatus', () => {
  it('dokumentiert die beauftragten Textlinks unabhängig vom Feed', () => {
    const status = commerceStatus();
    expect(status.affiliateLinkStatus.status).toBe('owner_authorized');
    expect(status.affiliateLinkStatus.siteTag).toBe('wauandmiau-21');
    expect(status.affiliateLinkStatus.approvedBy).toBe('Schayan Yousefian');
    expect(status.offerFeedStatus.status).toBe('disabled');
  });

  it('behauptet für den ausgeschalteten Feed keine Programmfreigabe', () => {
    const feed = commerceStatus().offerFeedStatus;
    expect(feed.program).toBeNull();
    expect(feed.approvedBy).toBeNull();
    expect(feed.scope).toContain('Keine Preise');
  });
});
