import {
  classifyApprovalRecoveryFailure,
} from "./approvalRecoveryDiagnostics";

import type {
  ApprovalRecoveryDiagnostic,
} from "./approvalRecoveryDiagnostics";

import {
  createLocalApprovalPersistenceCoordinator,
  type ApprovalPersistenceCoordinator,
} from "./approvalCoordination";

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
  ApprovalPersistenceMutationContext,
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

let approvalPersistenceMutationSequence =
  0;


const approvalPersistenceMutationSessionId =
  (
    typeof globalThis.crypto !==
      "undefined" &&
    typeof globalThis.crypto.randomUUID ===
      "function"
  )
    ? globalThis.crypto.randomUUID()
    : [
        Date.now().toString(
          36
        ),
        Math.random()
          .toString(
            36
          )
          .slice(
            2
          ),
      ].join(
        "-"
      );


function createApprovalPersistenceMutationContext(
  operation:
    "write" | "clear"
):
  ApprovalPersistenceMutationContext {
  approvalPersistenceMutationSequence +=
    1;

  return {
    mutationId:
      [
        approvalPersistenceMutationSessionId,
        operation,
        approvalPersistenceMutationSequence,
      ].join(
        ":"
      ),

    authoritative:
      false,
  };
}


export type ApprovalPersistenceWriteDiagnostics = {
  readonly queued:
    number;

  readonly persisted:
    number;

  readonly pending:
    number;

  readonly revision:
    ApprovalPersistenceRevision | null;

  readonly authoritative:
    false;
};

type ApprovalStoreListener =
  () => void;

let state:
  ApprovalRepositoryState =
    createEmptyApprovalRepositoryState();

let lifecycle:
  ApprovalStoreLifecycle =
    createApprovalStoreLifecycle();

let approvalRecoveryDiagnostic:
  ApprovalRecoveryDiagnostic | null =
    null;


let persistence:
  ApprovalRepositoryPersistence | null =
    null;

let persistenceCoordinator:
  ApprovalPersistenceCoordinator =
    createLocalApprovalPersistenceCoordinator();

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

let persistenceWriteDiagnostics:
  ApprovalPersistenceWriteDiagnostics = {
    queued:
      0,

    persisted:
      0,

    pending:
      0,

    revision:
      null,

    authoritative:
      false,
  };

const listeners =
  new Set<
    ApprovalStoreListener
  >();

function enqueueApprovalPersistenceOperation(
  operation:
    () => Promise<void>
): Promise<void> {
  const coordinatedOperation =
    () =>
      persistenceCoordinator.runExclusive(
        operation
      );

  const run =
    persistenceOperationQueue.then(
      coordinatedOperation,
      coordinatedOperation
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

function refreshPersistenceWriteDiagnostics():
  void {
  persistenceWriteDiagnostics = {
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
      false,
  };
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

export function getApprovalRecoveryDiagnostic():
  ApprovalRecoveryDiagnostic | null {
  return approvalRecoveryDiagnostic;
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

export function configureApprovalStoreCoordinator(
  coordinator:
    ApprovalPersistenceCoordinator | null
):
  void {
  persistenceCoordinator =
    coordinator ??
    createLocalApprovalPersistenceCoordinator();
}

export function configureApprovalStorePersistence(
  adapter:
    ApprovalRepositoryPersistence | null
): void {
  persistence =
    adapter;

  persistenceRevision =
    null;

  refreshPersistenceWriteDiagnostics();

  emit();
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
  approvalRecoveryDiagnostic =
    null;

  await waitForApprovalPersistenceQueue();

  if (
    !persistence
  ) {
    persistenceRevision =
      null;

    refreshPersistenceWriteDiagnostics();

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

    refreshPersistenceWriteDiagnostics();

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
    approvalRecoveryDiagnostic =
      classifyApprovalRecoveryFailure(
        error
      );

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

  const mutationContext =
    createApprovalPersistenceMutationContext(
      "write"
    );

  refreshPersistenceWriteDiagnostics();
  emit();

  try {
    await enqueueApprovalPersistenceOperation(
      async () => {
        const expectedRevision =
          persistenceRevision;

        const result =
          await adapter.save(
            snapshot,
            expectedRevision,
            mutationContext
          );

        persistenceRevision =
          result.revision;

        persistedWriteSequence =
          sequence;

        refreshPersistenceWriteDiagnostics();
        emit();
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

export function getApprovalPersistenceWriteState():
  ApprovalPersistenceWriteDiagnostics {
  return persistenceWriteDiagnostics;
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

      const mutationContext =
        createApprovalPersistenceMutationContext(
          "clear"
        );

      await enqueueApprovalPersistenceOperation(
        async () => {
          await adapter.clear(
            persistenceRevision,
            mutationContext
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

  refreshPersistenceWriteDiagnostics();

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
