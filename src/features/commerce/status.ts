import status from '../../../config/commerce/status.json' with { type: 'json' };

export type AffiliateLinkStatus = 'disabled' | 'owner_authorized' | 'program_verified';
export type OfferFeedStatus = 'disabled' | 'pending' | 'approved';

export interface CommerceStatus {
  readonly affiliateLinkStatus: {
    readonly status: AffiliateLinkStatus;
    readonly program: string | null;
    readonly siteTag: string;
    readonly approvedBy: string | null;
    readonly approvedAt: string | null;
    readonly evidence: string;
    readonly scope: string;
  };
  readonly offerFeedStatus: {
    readonly status: OfferFeedStatus;
    readonly program: string | null;
    readonly approvedBy: string | null;
    readonly approvedAt: string | null;
    readonly evidence: string;
    readonly scope: string;
  };
}

export function commerceStatus(): CommerceStatus {
  return status as CommerceStatus;
}
