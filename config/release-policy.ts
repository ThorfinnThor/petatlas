import legalReviews from './legal-review.json' with { type: 'json' };

export interface Approval {
  approved: boolean;
  approvedBy?: string | null;
  approvedAt?: string | null;
  evidence?: string | null;
}
export interface ReleaseConfig {
  publicRelease: Approval;
  gates: Record<string, Approval>;
}
export interface LegalReview {
  status: string;
  reviewedBy?: string;
  reviewedAt?: string;
  evidence?: string;
}
export const EVIDENCE: Readonly<Record<string, string>> = {
  operatorImprint: 'docs/LEGAL_CHECKLIST.md',
  domain: 'docs/CLOUDFLARE_SETUP.md',
  dataRights: 'docs/SOURCE_REVIEWS.md',
  costsRules: 'docs/reviews/costs.md',
  travelRules: 'docs/reviews/travel.md',
  insuranceAffiliate: 'docs/reviews/insurance.md',
  commerceAffiliate: 'docs/reviews/commerce-partner.md',
  adsTracking: 'docs/LEGAL_CHECKLIST.md',
};
export function requiredGates(features: readonly string[]): string[] {
  const result = ['operatorImprint', 'domain', 'dataRights'];
  const featureGates: Record<string, string> = {
    costs: 'costsRules',
    travel: 'travelRules',
    insurance: 'insuranceAffiliate',
    commerce: 'commerceAffiliate',
    ads: 'adsTracking',
  };
  for (const feature of features) {
    const gate = featureGates[feature];
    if (gate && !result.includes(gate)) result.push(gate);
  }
  return result;
}
export function validReviewDate(value: string | null | undefined): boolean {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value &&
    value <= new Date().toISOString().slice(0, 10)
  );
}
export function approvalProblems(name: string, approval: Approval | undefined): string[] {
  if (!approval?.approved) return [`${name}: nicht freigegeben`];
  const problems: string[] = [];
  if (!approval.approvedBy?.trim()) problems.push(`${name}: ohne Person`);
  if (!validReviewDate(approval.approvedAt))
    problems.push(`${name}: ohne Datum oder ungültiges Datum`);
  return problems;
}
export function releaseProblems(
  release: ReleaseConfig,
  features: readonly string[],
  reviews: Record<string, LegalReview> = legalReviews,
): string[] {
  const problems = approvalProblems('publicRelease', release.publicRelease);
  for (const name of requiredGates(features))
    problems.push(...approvalProblems(name, release.gates[name]));
  for (const name of Object.keys(legalReviews)) {
    const review = reviews[name];
    if (
      !review ||
      !['erfuellt', 'entfaellt'].includes(review.status) ||
      !review.reviewedBy?.trim() ||
      !validReviewDate(review.reviewedAt) ||
      !review.evidence?.trim()
    ) {
      problems.push(`${name}: rechtliche Prüfung oder begründete Nichtanwendbarkeit fehlt`);
    }
  }
  return problems;
}
export function assertRelease(release: ReleaseConfig, features: readonly string[]): void {
  const problems = releaseProblems(release, features);
  if (problems.length) throw new Error(`Produktionsfreigabe unvollständig: ${problems.join('; ')}`);
}
