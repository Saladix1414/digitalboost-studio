import type {
  RiskReviewHistoryEntry,
} from "./reviewHistory";

export type RiskReviewProvenanceIntegrityIssue =
  | "review-id-mismatch"
  | "version-mismatch"
  | "bot-id-mismatch"
  | "strategy-id-mismatch"
  | "fingerprint-mismatch"
  | "scope-mismatch"
  | "supersedes-mismatch"
  | "unexpected-authority";

export type RiskReviewProvenanceIntegrity = {
  readonly valid:
    boolean;

  readonly issues:
    readonly RiskReviewProvenanceIntegrityIssue[];

  readonly authoritative:
    false;
};

export function validateRiskReviewProvenance(
  entry:
    RiskReviewHistoryEntry
): RiskReviewProvenanceIntegrity {
  const review =
    entry.versionedReview.review;

  const provenance =
    entry.provenance;

  const issues:
    RiskReviewProvenanceIntegrityIssue[] =
      [];

  if (
    provenance.reviewId !==
    review.id
  ) {
    issues.push(
      "review-id-mismatch"
    );
  }

  if (
    provenance.version !==
    entry.versionedReview.version
  ) {
    issues.push(
      "version-mismatch"
    );
  }

  if (
    provenance.botId !==
    review.botId
  ) {
    issues.push(
      "bot-id-mismatch"
    );
  }

  if (
    provenance.strategyId !==
    review.strategyId
  ) {
    issues.push(
      "strategy-id-mismatch"
    );
  }

  if (
    provenance.bindingFingerprint !==
    review.bindingFingerprint
  ) {
    issues.push(
      "fingerprint-mismatch"
    );
  }

  if (
    provenance.approvalScope !==
    review.approvedFor
  ) {
    issues.push(
      "scope-mismatch"
    );
  }

  if (
    provenance.supersedes !==
    entry.versionedReview.previousReviewId
  ) {
    issues.push(
      "supersedes-mismatch"
    );
  }

  if (
    provenance.authoritative !==
    false
  ) {
    issues.push(
      "unexpected-authority"
    );
  }

  return {
    valid:
      issues.length ===
      0,

    issues,

    authoritative:
      false,
  };
}
