import {
  acceptRiskReview,
  createApprovalRepositoryState,
  createEmptyApprovalRepositoryState,
  getActiveRiskReview,
} from "./reviewRepository";

import {
  createApprovalStoreLifecycle,
} from "./approvalPersistence";

import type {
  ApprovalRepositoryState,
} from "./reviewRepository";

import type {
  ApprovalRepositoryPersistence,
  ApprovalStoreLifecycle,
} from "./approvalPersistence";

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

let lifecycle:
  ApprovalStoreLifecycle =
    createApprovalStoreLifecycle();

let persistence:
  ApprovalRepositoryPersistence | null =
    null;

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

function setLifecycle(
  next:
    ApprovalStoreLifecycle
) {
  lifecycle =
    next;

  emit();
}

export function getApprovalStoreSnapshot():
  ApprovalRepositoryState {
  return state;
}

export function getApprovalStoreLifecycle():
  ApprovalStoreLifecycle {
  return lifecycle;
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

export function configureApprovalStorePersistence(
  adapter:
    ApprovalRepositoryPersistence | null
): void {
  persistence =
    adapter;
}

export async function hydrateApprovalStore():
  Promise<ApprovalRepositoryState> {
  if (
    !persistence
  ) {
    setLifecycle({
      status:
        "ready",

      error:
        null,

      authoritative:
        false,
    });

    return state;
  }

  setLifecycle({
    status:
      "hydrating",

    error:
      null,

    authoritative:
      false,
  });

  try {
    const result =
      await persistence.load();

    if (
      result.state
    ) {
      state =
        result.state;

      emit();
    }

    setLifecycle({
      status:
        "ready",

      error:
        null,

      authoritative:
        false,
    });

    return state;
  } catch (
    error
  ) {
    setLifecycle({
      status:
        "error",

      error:
        error instanceof Error
          ? error.message
          : "Approval persistence hydration failed.",

      authoritative:
        false,
    });

    return state;
  }
}

export async function persistApprovalStore():
  Promise<void> {
  if (
    !persistence
  ) {
    return;
  }

  try {
    await persistence.save(
      state
    );
  } catch (
    error
  ) {
    setLifecycle({
      status:
        "error",

      error:
        error instanceof Error
          ? error.message
          : "Approval persistence save failed.",

      authoritative:
        false,
    });
  }
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

export async function clearApprovalStorePersistence():
  Promise<void> {
  if (
    persistence
  ) {
    try {
      await persistence.clear();
    } catch (
      error
    ) {
      setLifecycle({
        status:
          "error",

        error:
          error instanceof Error
            ? error.message
            : "Approval persistence clear failed.",

        authoritative:
          false,
      });

      return;
    }
  }

  state =
    createEmptyApprovalRepositoryState();

  lifecycle =
    createApprovalStoreLifecycle();

  emit();
}

export function getApprovalStoreActiveReview():
  RiskReview | null {
  return getActiveRiskReview(
    state
  );
}
