import type {
  VersionedRiskReview,
} from "./reviewVersion";

export type RiskReviewHistory = {
  readonly entries:
    readonly VersionedRiskReview[];

  readonly authoritative:
    false;
};

export function createRiskReviewHistory(
  initial:
    VersionedRiskReview
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
    VersionedRiskReview
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
): VersionedRiskReview | null {
  return (
    history.entries[
      history.entries.length -
      1
    ] ??
    null
  );
}
