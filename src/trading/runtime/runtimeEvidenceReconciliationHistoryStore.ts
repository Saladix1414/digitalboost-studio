import {
  createRuntimeEvidenceReconciliationHistorySnapshot,
} from "./runtimeEvidenceReconciliationHistoryPersistence";

import type {
  RuntimeEvidenceReconciliationHistoryPersistence,
} from "./runtimeEvidenceReconciliationHistoryPersistence";

import {
  appendRuntimeEvidenceReconciliationAttempt,
  createRuntimeEvidenceReconciliationAttemptHistory,
} from "./runtimeEvidenceReconciliationHistory";

import type {
  RuntimeEvidenceReconciliationAttemptHistory,
  RuntimeEvidenceReconciliationAttemptInput,
} from "./runtimeEvidenceReconciliationHistory";


type RuntimeEvidenceReconciliationHistoryListener =
  () => void;


let history =
  createRuntimeEvidenceReconciliationAttemptHistory();


let persistence:
  RuntimeEvidenceReconciliationHistoryPersistence | null =
    null;


let persistenceQueue:
  Promise<void> =
    Promise.resolve();


const listeners =
  new Set<
    RuntimeEvidenceReconciliationHistoryListener
  >();


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


function emit():
  void {
  for (
    const listener of
    listeners
  ) {
    listener();
  }
}


export function subscribeRuntimeEvidenceReconciliationHistory(
  listener:
    RuntimeEvidenceReconciliationHistoryListener
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


export function getRuntimeEvidenceReconciliationHistory():
  RuntimeEvidenceReconciliationAttemptHistory {
  return history;
}


export function configureRuntimeEvidenceReconciliationHistoryPersistence(
  adapter:
    RuntimeEvidenceReconciliationHistoryPersistence | null
):
  void {
  persistence =
    adapter;
}


export async function waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue():
  Promise<void> {
  await persistenceQueue;
}


export async function hydrateRuntimeEvidenceReconciliationHistory():
  Promise<RuntimeEvidenceReconciliationAttemptHistory> {
  await waitForRuntimeEvidenceReconciliationHistoryPersistenceQueue();

  const adapter =
    persistence;

  if (
    !adapter
  ) {
    return history;
  }

  try {
    const result =
      await adapter.load();

    if (
      result.snapshot
    ) {
      history =
        result.snapshot.history;

      emit();
    }
  } catch {
    /*
     * Operational evidence durability is best-effort.
     * Existing in-memory history remains readable.
     */
  }

  return history;
}


export async function persistRuntimeEvidenceReconciliationHistory():
  Promise<void> {
  const adapter =
    persistence;

  if (
    !adapter
  ) {
    return;
  }

  const snapshot =
    createRuntimeEvidenceReconciliationHistorySnapshot(
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
  } catch {
    /*
     * Persistence failure cannot block reconciliation
     * or trading runtime.
     */
  }
}


export function recordRuntimeEvidenceReconciliationAttempt(
  input:
    RuntimeEvidenceReconciliationAttemptInput
):
  RuntimeEvidenceReconciliationAttemptHistory {
  history =
    appendRuntimeEvidenceReconciliationAttempt(
      history,
      input
    );

  emit();

  void persistRuntimeEvidenceReconciliationHistory();

  return history;
}


export function resetRuntimeEvidenceReconciliationHistoryForTests():
  void {
  history =
    createRuntimeEvidenceReconciliationAttemptHistory();

  emit();

  persistence =
    null;

  persistenceQueue =
    Promise.resolve();

}
