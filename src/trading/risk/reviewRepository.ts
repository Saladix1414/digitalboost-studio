import type {
  RiskReview,
} from "./reviewTypes";

import {
  createInitialVersionedReview,
  createNextVersionedReview,
} from "./reviewVersion";

import {
  appendRiskReviewHistory,
  createRiskReviewHistory,
} from "./reviewHistory";

import {
  createRiskReviewProvenance,
} from "./reviewProvenance";

import type {
  RiskReviewHistory,
} from "./reviewHistory";

import type {
  RiskReviewProvenanceSource,
} from "./reviewProvenance";

import type {
  VersionedRiskReview,
} from "./reviewVersion";

export type ApprovalRepositoryState = {
  readonly active:
    VersionedRiskReview | null;

  readonly history:
    RiskReviewHistory | null;

  readonly authoritative:
    false;
};

export type AcceptRiskReviewInput = {
  readonly review:
    RiskReview;

  readonly source:
    RiskReviewProvenanceSource;
};

export function createEmptyApprovalRepositoryState():
  ApprovalRepositoryState {
  return {
    active:
      null,

    history:
      null,

    authoritative:
      false,
  };
}

export function createApprovalRepositoryState(
  review:
    RiskReview,

  source:
    RiskReviewProvenanceSource
): ApprovalRepositoryState {
  const active =
    createInitialVersionedReview(
      review
    );

  const history =
    createRiskReviewHistory({
      versionedReview:
        active,

      provenance:
        createRiskReviewProvenance(
          active,
          source,
          "initial-review"
        ),
    });

  return {
    active,

    history,

    authoritative:
      false,
  };
}

export function acceptRiskReview(
  state:
    ApprovalRepositoryState,

  input:
    AcceptRiskReviewInput
): ApprovalRepositoryState {
  const next =
    state.active
      ? createNextVersionedReview(
          state.active,
          input.review
        )
      : createInitialVersionedReview(
          input.review
        );

  const entry = {
    versionedReview:
      next,

    provenance:
      createRiskReviewProvenance(
        next,
        input.source,
        state.active
          ? "explicit-rereview"
          : "initial-review"
      ),
  };

  const history =
    state.history
      ? appendRiskReviewHistory(
          state.history,
          entry
        )
      : createRiskReviewHistory(
          entry
        );

  return {
    active:
      next,

    history,

    authoritative:
      false,
  };
}

export function getActiveRiskReview(
  state:
    ApprovalRepositoryState
): RiskReview | null {
  return (
    state.active?.review ??
    null
  );
}
