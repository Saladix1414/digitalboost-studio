import {
  acceptRiskReview,
  createApprovalRepositoryState,
  createEmptyApprovalRepositoryState,
  getActiveRiskReview,
} from "./reviewRepository";

import type {
  ApprovalRepositoryState,
} from "./reviewRepository";

import type {
  RiskReviewProvenanceSource,
} from "./reviewProvenance";

import type {
  RiskReview,
} from "./reviewTypes";

type ApprovalStoreListener =
  () => void;

let state:
  ApprovalRepositoryState =
    createEmptyApprovalRepositoryState();

const listeners =
  new Set<
    ApprovalStoreListener
  >();

function emit() {
  listeners.forEach(
    listener =>
      listener()
  );
}

export function getApprovalStoreSnapshot():
  ApprovalRepositoryState {
  return state;
}

export function subscribeApprovalStore(
  listener:
    ApprovalStoreListener
): () => void {
  listeners.add(
    listener
  );

  return () => {
    listeners.delete(
      listener
    );
  };
}

export function bootstrapApprovalStore(
  review:
    RiskReview,

  source:
    RiskReviewProvenanceSource
): boolean {
  if (
    state.active
  ) {
    return false;
  }

  state =
    createApprovalRepositoryState(
      review,
      source
    );

  emit();

  return true;
}

export function acceptApprovalStoreReview(
  review:
    RiskReview,

  source:
    RiskReviewProvenanceSource
): void {
  state =
    acceptRiskReview(
      state,
      {
        review,
        source,
      }
    );

  emit();
}

export function getApprovalStoreActiveReview():
  RiskReview | null {
  return getActiveRiskReview(
    state
  );
}
