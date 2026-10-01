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

import type {
  RuntimeEvidencePersistence,
} from "./runtimeEvidencePersistence";


export const RUNTIME_EVIDENCE_HISTORY_LIMIT =
  24;


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
  | "error";


export type RuntimeEvidenceLifecycle = {
  readonly status:
    RuntimeEvidenceLifecycleStatus;

  readonly error:
    string | null;

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


/*
 * Persistence is intentionally serialized so rapid runtime sessions
 * cannot complete storage writes out of order.
 *
 * This queue is observational infrastructure only.
 */
let persistenceQueue:
  Promise<void> =
    Promise.resolve();


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


export function configureRuntimeEvidencePersistence(
  adapter:
    RuntimeEvidencePersistence | null
):
  void {
  persistence =
    adapter;

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

  try {
    const result =
      await adapter.load();

    if (
      result.snapshot
    ) {
      history =
        result.snapshot.history;

      emitRuntimeEvidenceChange();
    }

    setLifecycle({
      status:
        "ready",

      error:
        null,

      authoritative:
        false,
    });
  } catch (
    error
  ) {
    /*
     * Evidence hydration is observational only.
     * Existing in-memory history remains usable and runtime execution
     * must never depend on this lifecycle.
     */
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
  }

  return history;
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

  const snapshot =
    createRuntimeEvidenceSnapshot(
      history
    );

  try {
    await enqueuePersistence(
      async () => {
        await adapter.save(
          snapshot
        );
      }
    );

    /*
     * Successful evidence persistence restores observability health.
     * It does not affect approval or runtime authority.
     */
    if (
      lifecycle.status !==
      "hydrating"
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
    setLifecycle({
      status:
        "error",

      error:
        errorMessage(
          error,
          "Runtime evidence persistence failed."
        ),

      authoritative:
        false,
    });
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

  persistenceQueue =
    Promise.resolve();

  emitRuntimeEvidenceChange();
}
