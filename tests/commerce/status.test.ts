import { describe, expect, it } from 'vitest';

import { commerceStatus } from '../../src/features/commerce/status.ts';

describe('Getrennter Partner- und Feedstatus', () => {
  it('dokumentiert die beauftragten Textlinks unabhängig vom Feed', () => {
    const status = commerceStatus();
    expect(status.affiliateLinkStatus.status).toBe('owner_authorized');
    expect(status.affiliateLinkStatus.siteTag).toBe('wauandmiau-21');
    expect(status.affiliateLinkStatus.approvedBy).toBe('Schayan Yousefian');
    expect(status.offerFeedStatus.status).toBe('approved');
  });

  it('begrenzt den freigegebenen Feed auf Bilder und Deep Links', () => {
    const feed = commerceStatus().offerFeedStatus;
    expect(feed.program).toContain('Fressnapf');
    expect(feed.approvedBy).toBe('Schayan Yousefian');
    expect(feed.scope.toLowerCase()).toContain('keine preise');
    expect(feed.scope).toContain('Produkt');
  });
});
