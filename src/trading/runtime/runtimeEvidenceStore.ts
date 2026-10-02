import {
  recordRuntimeEvidenceReconciliationAttempt,
} from "./runtimeEvidenceReconciliationHistoryStore";

import {
  RUNTIME_EVIDENCE_HISTORY_LIMIT,
} from "./runtimeEvidenceConstants";


import {
  reconcileRuntimeEvidenceHistories,
} from "./runtimeEvidenceReconciliation";
import {
  createRuntimeAuditRecord,
} from "./audit";

import type {
  RuntimeAuditRecord,
} from "./auditTypes";

import type {
  BotRuntimeSessionResult,
} from "./session";

import type {
  PaperLedgerEntry,
} from "../paper";

import {
  createRuntimeEvidenceSnapshot,
} from "./runtimeEvidencePersistence";

import {
  createLocalRuntimeEvidenceCoordinator,
} from "./runtimeEvidenceCoordination";

import type {
  RuntimeEvidenceCoordinator,
} from "./runtimeEvidenceCoordination";

import type {
  RuntimeEvidencePersistence,
} from "./runtimeEvidencePersistence";


export type RuntimeLedgerEvidenceEntry = {
  readonly sessionId:
    string;

  readonly botId:
    string;

  readonly strategyId:
    string;

  readonly entry:
    PaperLedgerEntry;

  readonly authoritative:
    false;
};


export type RuntimeEvidenceBundle = {
  readonly sessionId:
    string;

  readonly botId:
    string;

  readonly strategyId:
    string;

  readonly audit:
    RuntimeAuditRecord;

  readonly ledger:
    readonly RuntimeLedgerEvidenceEntry[];

  readonly authoritative:
    false;
};


export type RuntimeEvidenceHistory = {
  readonly entries:
    readonly RuntimeEvidenceBundle[];

  readonly authoritative:
    false;
};


export type RuntimeEvidenceLifecycleStatus =
  | "idle"
  | "hydrating"
  | "ready"
  | "stale"
  | "reconciling"
  | "error";


export type RuntimeEvidenceLifecycle = {
  readonly status:
    RuntimeEvidenceLifecycleStatus;

  readonly error:
    string | null;

  readonly authoritative:
    false;
};


export type RuntimeEvidenceCoordinationHealth = {
  readonly crossContextSafe:
    boolean;

  readonly authoritative:
    false;
};

export type RuntimeEvidenceControlledReconciliationResult =
  | {
      readonly status:
        "merged";

      readonly duplicateSessionIds:
        readonly string[];

      readonly authoritative:
        false;
    }
  | {
      readonly status:
        "conflict";

      readonly sessionId:
        string;

      readonly authoritative:
        false;
    }
  | {
      readonly status:
        "not-stale";

      readonly authoritative:
        false;
    }
  | {
      readonly status:
        "unavailable";

      readonly authoritative:
        false;
    }
  | {
      readonly status:
        "error";

      readonly error:
        string;

      readonly authoritative:
        false;
    };



type RuntimeEvidenceListener =
  () => void;


let history:
  RuntimeEvidenceHistory = {
    entries:
      [],

    authoritative:
      false,
  };


let lifecycle:
  RuntimeEvidenceLifecycle = {
    status:
      "idle",

    error:
      null,

    authoritative:
      false,
  };


let persistence:
  RuntimeEvidencePersistence | null =
    null;


let coordinator:
  RuntimeEvidenceCoordinator =
    createLocalRuntimeEvidenceCoordinator();


/*
 * Persistence is intentionally serialized so rapid runtime sessions
 * cannot complete storage writes out of order.
 *
 * This queue is observational infrastructure only.
 */
let persistenceQueue:
  Promise<void> =
    Promise.resolve();

/*
 * Monotonic in-memory mutation generation.
 *
 * Controlled reconciliation uses this to detect runtime evidence
 * recorded while an asynchronous persistence write is in flight.
 */
let historyGeneration =
  0;

/*
 * Storage events received while startup hydration is in flight
 * cannot immediately replace the hydrating lifecycle.
 *
 * The flag is observational only. It prevents hydration from
 * publishing an obsolete catch-up save and causes the completed
 * hydration to surface as stale instead of ready.
 */
let pendingExternalChangeDuringHydration =
  false;




const listeners =
  new Set<
    RuntimeEvidenceListener
  >();


function emitRuntimeEvidenceChange():
  void {
  for (
    const listener of
    listeners
  ) {
    listener();
  }
}


function setLifecycle(
  next:
    RuntimeEvidenceLifecycle
):
  void {
  lifecycle =
    next;

  emitRuntimeEvidenceChange();
}


function errorMessage(
  error:
    unknown,

  fallback:
    string
):
  string {
  return (
    error instanceof Error
      ? error.message
      : fallback
  );
}


function enqueuePersistence(
  operation:
    () => Promise<void>
):
  Promise<void> {
  const run =
    persistenceQueue.then(
      operation,
      operation
    );

  persistenceQueue =
    run.catch(
      () => undefined
    );

  return run;
}


export function subscribeRuntimeEvidenceHistory(
  listener:
    RuntimeEvidenceListener
):
  () => void {
  listeners.add(
    listener
  );

  return () => {
    listeners.delete(
      listener
    );
  };
}


export function getRuntimeEvidenceHistory():
  RuntimeEvidenceHistory {
  return history;
}


export function getRuntimeEvidenceLifecycle():
  RuntimeEvidenceLifecycle {
  return lifecycle;
}


export function markRuntimeEvidenceStale():
  void {
  /*
   * Stale means another browser context changed persisted evidence.
   *
   * Existing in-memory evidence remains readable.
   * This state is observational only and must never gate runtime.
   */
  if (
    lifecycle.status ===
      "hydrating"
  ) {
    pendingExternalChangeDuringHydration =
      true;

    return;
  }

  setLifecycle({
    status:
      "stale",

    error:
      "Runtime evidence changed in another browser context.",

    authoritative:
      false,
  });
}


export function getRuntimeEvidenceCoordinationHealth():
  RuntimeEvidenceCoordinationHealth {
  return {
    crossContextSafe:
      coordinator.crossContextSafe,

    authoritative:
      false,
  };
}


export function configureRuntimeEvidenceCoordinator(
  nextCoordinator:
    RuntimeEvidenceCoordinator
):
  void {
  coordinator =
    nextCoordinator;

  emitRuntimeEvidenceChange();
}


export function configureRuntimeEvidencePersistence(
  adapter:
    RuntimeEvidencePersistence | null
):
  void {
  persistence =
    adapter;

  pendingExternalChangeDuringHydration =
    false;

  lifecycle = {
    status:
      "idle",

    error:
      null,

    authoritative:
      false,
  };

  emitRuntimeEvidenceChange();
}


export async function waitForRuntimeEvidencePersistenceQueue():
  Promise<void> {
  await persistenceQueue;
}


export async function hydrateRuntimeEvidence():
  Promise<RuntimeEvidenceHistory> {
  await waitForRuntimeEvidencePersistenceQueue();

  const adapter =
    persistence;

  if (
    !adapter
  ) {
    setLifecycle({
      status:
        "ready",

      error:
        null,

      authoritative:
        false,
    });

    return history;
  }

  setLifecycle({
    status:
      "hydrating",

    error:
      null,

    authoritative:
      false,
  });

  /*
   * Capture the generation before crossing the storage boundary.
   *
   * Runtime recording remains memory-first while hydration is pending,
   * so this generation may legitimately advance before load completes.
   */
  const generationBeforeLoad =
    historyGeneration;

  try {
    const result =
      await adapter.load();

    const persistedHistory =
      result.snapshot?.history ?? {
        entries:
          [],

        authoritative:
          false as const,
      };

    /*
     * Always read current memory after load.
     *
     * If historyGeneration advanced while storage was in flight,
     * currentMemory contains runtime evidence that must participate
     * in startup reconciliation rather than being overwritten.
     */
    const currentMemory =
      history;

    const memoryChangedDuringLoad =
      historyGeneration !==
      generationBeforeLoad;

    const reconciliation =
      reconcileRuntimeEvidenceHistories(
        currentMemory,
        persistedHistory
      );

    if (
      reconciliation.status ===
      "conflict"
    ) {
      /*
       * Startup hydration is not allowed to replace current memory
       * when persisted evidence conflicts with it.
       */
      setLifecycle({
        status:
          "error",

        error:
          `Runtime evidence hydration conflict for session ${reconciliation.conflict.sessionId}. Local memory was preserved.`,

        authoritative:
          false,
      });

      return history;
    }

    /*
     * Commit only the reconciled history.
     *
     * This works both for ordinary startup hydration and for the
     * concurrent-recording case detected by memoryChangedDuringLoad.
     */
    history =
      reconciliation.history;

    historyGeneration +=
      1;

    emitRuntimeEvidenceChange();

    /*
     * A storage event during hydration means persisted evidence changed
     * after this hydration cycle began.
     *
     * Do not publish a catch-up save from a potentially obsolete view.
     * Keep reconciled in-memory evidence readable and require the
     * explicit stale reconciliation path to resolve persistence.
     */
    if (
      pendingExternalChangeDuringHydration
    ) {
      pendingExternalChangeDuringHydration =
        false;

      setLifecycle({
        status:
          "stale",

        error:
          "Runtime evidence changed in another browser context during hydration.",

        authoritative:
          false,
      });

      return history;
    }

    /*
     * Persist the reconciled startup view until storage catches the
     * newest observed in-memory generation.
     *
     * This also repairs the case where a runtime record queued its own
     * persistence while adapter.load() was still pending.
     */
    while (
      true
    ) {
      const generation =
        historyGeneration;

      const snapshot =
        createRuntimeEvidenceSnapshot(
          history
        );

      await enqueuePersistence(
        async () => {
          await adapter.save(
            snapshot
          );
        }
      );

      if (
        generation ===
        historyGeneration
      ) {
        break;
      }
    }

    /*
     * Keep the explicit detection value in the implementation so
     * startup race behavior remains auditable and testable.
     */
    void memoryChangedDuringLoad;

    setLifecycle({
      status:
        "ready",

      error:
        null,

      authoritative:
        false,
    });

    return history;
  } catch (
    error
  ) {
    setLifecycle({
      status:
        "error",

      error:
        errorMessage(
          error,
          "Runtime evidence hydration failed."
        ),

      authoritative:
        false,
    });

    return history;
  }
}

export async function persistRuntimeEvidenceHistory():
  Promise<void> {
  const adapter =
    persistence;

  if (
    !adapter
  ) {
    return;
  }

  /*
   * Runtime evidence remains memory-first.
   *
   * During hydration, stale reconciliation, or controlled
   * reconciliation, ordinary persistence is suspended.
   */
  if (
    lifecycle.status ===
      "hydrating" ||
    lifecycle.status ===
      "stale" ||
    lifecycle.status ===
      "reconciling"
  ) {
    return;
  }

  try {
    await enqueuePersistence(
      async () => {
        await coordinator.runExclusive(
          async () => {
            /*
             * Read current memory only after entering the coordinated
             * critical section so records created while this write
             * waited for another tab are included.
             */
            const local =
              history;

            const loaded =
              await adapter.load();

            const persisted =
              loaded.snapshot?.history ?? {
                entries:
                  [],

                authoritative:
                  false as const,
              };

            const reconciliation =
              reconcileRuntimeEvidenceHistories(
                local,
                persisted
              );

            if (
              reconciliation.status ===
              "conflict"
            ) {
              /*
               * Never overwrite conflicting persisted evidence.
               * Existing memory stays intact and the store becomes stale
               * so resolution remains explicit.
               */
              setLifecycle({
                status:
                  "stale",

                error:
                  `Runtime evidence persistence conflict for session ${reconciliation.conflict.sessionId}.`,

                authoritative:
                  false,
              });

              /*
               * Persist the diagnostic conflict in the existing
               * reconciliation-attempt ledger.
               *
               * This is observability only:
               * it does not reconcile automatically,
               * mutate approval,
               * or grant runtime authority.
               */
              recordRuntimeEvidenceReconciliationAttempt({
                status:
                  "conflict",

                conflictSessionId:
                  reconciliation.conflict.sessionId,
              });

              return;
            }

            const generationBeforeSave =
              historyGeneration;

            const merged =
              reconciliation.history;

            await adapter.save(
              createRuntimeEvidenceSnapshot(
                merged
              )
            );

            /*
             * If memory did not change while the coordinated I/O was
             * running, promote the merged view into memory.
             *
             * If it did change, preserve newer memory. The record that
             * changed it already queued another persistence pass.
             */
            if (
              generationBeforeSave ===
                historyGeneration
            ) {
              history =
                merged;

              historyGeneration +=
                1;

              emitRuntimeEvidenceChange();
            }
          }
        );
      }
    );

    /*
     * Conflict handling above may intentionally move the lifecycle
     * to stale. Do not overwrite that state with ready.
     */
    if (
      lifecycle.status !==
        "hydrating" &&
      lifecycle.status !==
        "stale" &&
      lifecycle.status !==
        "reconciling"
    ) {
      setLifecycle({
        status:
          "ready",

        error:
          null,

        authoritative:
          false,
      });
    }
  } catch (
    error
  ) {
    const message =
      errorMessage(
        error,
        "Runtime evidence persistence failed."
      );

    setLifecycle({
      status:
        "error",

      error:
        message,

      authoritative:
        false,
    });

    /*
     * Persistence failures belong to the existing reconciliation
     * diagnostics family.
     *
     * Attempt-history recording is deliberately isolated:
     * observability failure must never mask or replace the original
     * runtime evidence persistence failure.
     */
    try {
      recordRuntimeEvidenceReconciliationAttempt({
        status:
          "error",

        error:
          message,
      });
    } catch {
      /*
       * Diagnostic recording is best-effort only.
       * Runtime evidence remains in memory and authority is unchanged.
       */
    }
  }
}

export async function reconcileStaleRuntimeEvidence():
  Promise<RuntimeEvidenceControlledReconciliationResult> {
  if (
    lifecycle.status !==
    "stale"
  ) {
    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "not-stale",
    });

    return {
      status:
        "not-stale",

      authoritative:
        false,
    };
  }

  const adapter =
    persistence;

  if (
    !adapter
  ) {
    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "unavailable",
    });

    return {
      status:
        "unavailable",

      authoritative:
        false,
    };
  }

  setLifecycle({
    status:
      "reconciling",

    error:
      null,

    authoritative:
      false,
  });

  await waitForRuntimeEvidencePersistenceQueue();

  try {
    const loaded =
      await adapter.load();

    const persistedHistory =
      loaded.snapshot?.history ?? {
        entries:
          [],

        authoritative:
          false as const,
      };

    /*
     * Read current memory after load so sessions recorded while load
     * was pending participate in reconciliation.
     */
    const reconciliation =
      reconcileRuntimeEvidenceHistories(
        history,
        persistedHistory
      );

    if (
      reconciliation.status ===
      "conflict"
    ) {
      setLifecycle({
        status:
          "stale",

        error:
          `Runtime evidence conflict for session ${reconciliation.conflict.sessionId}.`,

        authoritative:
          false,
      });

      recordRuntimeEvidenceReconciliationAttempt({
        status:
          "conflict",

        conflictSessionId:
          reconciliation.conflict.sessionId,
      });

      return {
        status:
          "conflict",

        sessionId:
          reconciliation.conflict.sessionId,

        authoritative:
          false,
      };
    }

    history =
      reconciliation.history;

    historyGeneration +=
      1;

    emitRuntimeEvidenceChange();

    /*
     * Runtime recording is not blocked while persistence is in flight.
     * Repeat until storage contains the newest observed generation.
     */
    while (
      true
    ) {
      const generation =
        historyGeneration;

      const snapshot =
        createRuntimeEvidenceSnapshot(
          history
        );

      await enqueuePersistence(
        async () => {
          await adapter.save(
            snapshot
          );
        }
      );

      if (
        generation ===
        historyGeneration
      ) {
        break;
      }
    }

    setLifecycle({
      status:
        "ready",

      error:
        null,

      authoritative:
        false,
    });

    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "merged",

      duplicateSessionIds:
        reconciliation.duplicateSessionIds,
    });

    return {
      status:
        "merged",

      duplicateSessionIds:
        reconciliation.duplicateSessionIds,

      authoritative:
        false,
    };
  } catch (
    error
  ) {
    const message =
      errorMessage(
        error,
        "Runtime evidence reconciliation failed."
      );

    setLifecycle({
      status:
        "error",

      error:
        message,

      authoritative:
        false,
    });

    recordRuntimeEvidenceReconciliationAttempt({
      status:
        "error",

      error:
        message,
    });

    return {
      status:
        "error",

      error:
        message,

      authoritative:
        false,
    };
  }
}


export function createRuntimeEvidenceBundle(
  result:
    BotRuntimeSessionResult
):
  RuntimeEvidenceBundle {
  const audit =
    createRuntimeAuditRecord(
      result
    );

  const ledger =
    result.runtime.account.ledger.map(
      entry => ({
        sessionId:
          result.session.id,

        botId:
          result.session.botId,

        strategyId:
          result.session.strategyId,

        entry,

        authoritative:
          false as const,
      })
    );

  return {
    sessionId:
      result.session.id,

    botId:
      result.session.botId,

    strategyId:
      result.session.strategyId,

    audit,

    ledger,

    authoritative:
      false,
  };
}


export function recordRuntimeSessionEvidence(
  result:
    BotRuntimeSessionResult
):
  RuntimeEvidenceHistory {
  const bundle =
    createRuntimeEvidenceBundle(
      result
    );

  history = {
    entries: [
      ...history.entries,
      bundle,
    ].slice(
      -RUNTIME_EVIDENCE_HISTORY_LIMIT
    ),

    authoritative:
      false,
  };

  historyGeneration +=
    1;

  /*
   * Memory is updated first.
   *
   * Persistence is deliberately best-effort and asynchronous:
   * evidence durability can degrade, but runtime recording itself
   * must not become storage-gated.
   */
  emitRuntimeEvidenceChange();

  void persistRuntimeEvidenceHistory();

  return history;
}


export function resetRuntimeEvidenceHistoryForTests():
  void {
  history = {
    entries:
      [],

    authoritative:
      false,
  };

  lifecycle = {
    status:
      "idle",

    error:
      null,

    authoritative:
      false,
  };

  persistence =
    null;

  coordinator =
    createLocalRuntimeEvidenceCoordinator();

  persistenceQueue =
    Promise.resolve();

  historyGeneration =
    0;

  pendingExternalChangeDuringHydration =
    false;

  emitRuntimeEvidenceChange();
}
