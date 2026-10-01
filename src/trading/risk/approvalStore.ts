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
  ApprovalPersistenceRevision,
  ApprovalRepositoryPersistence,
  ApprovalStoreLifecycle,
} from "./approvalPersistence";

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

let lifecycle:
  ApprovalStoreLifecycle =
    createApprovalStoreLifecycle();

let persistence:
  ApprovalRepositoryPersistence | null =
    null;

let persistenceRevision:
  ApprovalPersistenceRevision | null =
    null;

let persistenceOperationQueue:
  Promise<void> =
    Promise.resolve();

let persistenceWriteSequence =
  0;

let persistedWriteSequence =
  0;

const listeners =
  new Set<
    ApprovalStoreListener
  >();

function enqueueApprovalPersistenceOperation(
  operation:
    () => Promise<void>
): Promise<void> {
  const run =
    persistenceOperationQueue.then(
      operation,
      operation
    );

  persistenceOperationQueue =
    run.catch(
      () => undefined
    );

  return run;
}

export async function waitForApprovalPersistenceQueue():
  Promise<void> {
  await persistenceOperationQueue;
}

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

  persistenceRevision =
    null;
}


export function markApprovalStoreStale():
  void {
  if (
    lifecycle.status ===
    "hydrating"
  ) {
    return;
  }

  setLifecycle({
    status:
      "stale",

    error:
      "Approval state changed in another browser context. Rehydration is required.",

    authoritative:
      false,
  });
}

export async function hydrateApprovalStore():
  Promise<ApprovalRepositoryState> {
  await waitForApprovalPersistenceQueue();

  if (
    !persistence
  ) {
    persistenceRevision =
      null;

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

    persistenceRevision =
      result.revision;

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
    persistenceRevision =
      null;

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
  const adapter =
    persistence;

  if (
    !adapter
  ) {
    return;
  }

  const snapshot =
    state;

  const sequence =
    ++persistenceWriteSequence;

  try {
    await enqueueApprovalPersistenceOperation(
      async () => {
        const expectedRevision =
          persistenceRevision;

        const result =
          await adapter.save(
            snapshot,
            expectedRevision
          );

        persistenceRevision =
          result.revision;

        persistedWriteSequence =
          sequence;
      }
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

export function getApprovalPersistenceWriteState() {
  return {
    queued:
      persistenceWriteSequence,

    persisted:
      persistedWriteSequence,

    pending:
      persistenceWriteSequence -
      persistedWriteSequence,

    revision:
      persistenceRevision,

    authoritative:
      false as const,
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

  void persistApprovalStore();

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

  void persistApprovalStore();
}

export async function clearApprovalStorePersistence():
  Promise<void> {
  if (
    persistence
  ) {
    try {
      const adapter =
        persistence;

      await enqueueApprovalPersistenceOperation(
        async () => {
          await adapter.clear(
            persistenceRevision
          );
        }
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
            : "Approval persistence clear failed.",

        authoritative:
          false,
      });

      return;
    }
  }

  state =
    createEmptyApprovalRepositoryState();

  persistenceRevision =
    null;

  persistenceWriteSequence =
    0;

  persistedWriteSequence =
    0;

  lifecycle =
    createApprovalStoreLifecycle();

  emit();
}

export async function recoverApprovalStorePersistence():
  Promise<boolean> {
  await clearApprovalStorePersistence();

  if (
    lifecycle.status ===
    "error"
  ) {
    return false;
  }

  await hydrateApprovalStore();

  return (
    lifecycle.status ===
    "ready"
  );
}

export function getApprovalStoreActiveReview():
  RiskReview | null {
  return getActiveRiskReview(
    state
  );
}
