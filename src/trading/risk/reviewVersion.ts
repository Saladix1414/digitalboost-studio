import type {
  RiskReview,
} from "./reviewTypes";

export type VersionedRiskReview = {
  readonly review:
    RiskReview;

  readonly version:
    number;

  readonly previousReviewId:
    string | null;
};

export function createInitialVersionedReview(
  review:
    RiskReview
): VersionedRiskReview {
  return {
    review,

    version:
      1,

    previousReviewId:
      null,
  };
}

export function createNextVersionedReview(
  previous:
    VersionedRiskReview,

  review:
    RiskReview
): VersionedRiskReview {
  return {
    review,

    version:
      previous.version +
      1,

    previousReviewId:
      previous.review.id,
  };
}
