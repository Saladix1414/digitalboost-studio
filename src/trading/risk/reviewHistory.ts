import type {
  VersionedRiskReview,
} from "./reviewVersion";

import type {
  RiskReviewProvenance,
} from "./reviewProvenance";

export type RiskReviewHistoryEntry = {
  readonly versionedReview:
    VersionedRiskReview;

  readonly provenance:
    RiskReviewProvenance;
};

export type RiskReviewHistory = {
  readonly entries:
    readonly RiskReviewHistoryEntry[];

  readonly authoritative:
    false;
};

export function createRiskReviewHistory(
  initial:
    RiskReviewHistoryEntry
): RiskReviewHistory {
  return {
    entries: [
      initial,
    ],

    authoritative:
      false,
  };
}

export function appendRiskReviewHistory(
  history:
    RiskReviewHistory,

  next:
    RiskReviewHistoryEntry
): RiskReviewHistory {
  return {
    entries: [
      ...history.entries,
      next,
    ],

    authoritative:
      false,
  };
}

export function getLatestRiskReviewHistoryEntry(
  history:
    RiskReviewHistory
): RiskReviewHistoryEntry | null {
  return (
    history.entries[
      history.entries.length -
      1
    ] ??
    null
  );
}
