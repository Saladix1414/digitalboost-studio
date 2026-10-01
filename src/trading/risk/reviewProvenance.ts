import type {
  RiskReview,
} from "./reviewTypes";

import type {
  VersionedRiskReview,
} from "./reviewVersion";

export type RiskReviewProvenanceSource =
  | "risk-review-workspace"
  | "bot-forge";

export type RiskReviewCreationReason =
  | "initial-review"
  | "explicit-rereview";

export type RiskReviewProvenance = {
  readonly reviewId:
    string;

  readonly version:
    number;

  readonly source:
    RiskReviewProvenanceSource;

  readonly createdFrom:
    RiskReviewCreationReason;

  readonly supersedes:
    string | null;

  readonly botId:
    string;

  readonly strategyId:
    string;

  readonly bindingFingerprint:
    string;

  readonly approvalScope:
    "paper-only";

  readonly authoritative:
    false;
};

export function createRiskReviewProvenance(
  versionedReview:
    VersionedRiskReview,

  source:
    RiskReviewProvenanceSource,

  createdFrom:
    RiskReviewCreationReason
): RiskReviewProvenance {
  const review:
    RiskReview =
      versionedReview.review;

  return {
    reviewId:
      review.id,

    version:
      versionedReview.version,

    source,

    createdFrom,

    supersedes:
      versionedReview.previousReviewId,

    botId:
      review.botId,

    strategyId:
      review.strategyId,

    bindingFingerprint:
      review.bindingFingerprint,

    approvalScope:
      review.approvedFor,

    authoritative:
      false,
  };
}
