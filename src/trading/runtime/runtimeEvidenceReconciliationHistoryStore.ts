import {
  appendRuntimeEvidenceReconciliationAttempt,
  createRuntimeEvidenceReconciliationAttemptHistory,
} from "./runtimeEvidenceReconciliationHistory";

import {
  createRuntimeEvidenceReconciliationHistorySnapshot,
} from "./runtimeEvidenceReconciliationHistoryPersistence";

import {
  createLocalRuntimeEvidenceReconciliationHistoryCoordinator,
} from "./runtimeEvidenceReconciliationHistoryCoordination";

import {
  mergeRuntimeEvidenceReconciliationHistories,
} from "./runtimeEvidenceReconciliationHistoryMerge";

import type {
  RuntimeEvidenceReconciliationAttemptHistory,
  RuntimeEvidenceReconciliationAttemptInput,
} from "./runtimeEvidenceReconciliationHistory";

import type {
  RuntimeEvidenceReconciliationHistoryPersistence,
} from "./runtimeEvidenceReconciliationHistoryPersistence";

import type {
  RuntimeEvidenceReconciliationHistoryCoordinator,
} from "./runtimeEvidenceReconciliationHistoryCoordination";


type RuntimeEvidenceReconciliationHistoryListener =
  () => void;


let history =
  createRuntimeEvidenceReconciliationAttemptHistory();


let persistenceBase =
  createRuntimeEvidenceReconciliationAttemptHistory();


let persistence:
  RuntimeEvidenceReconciliationHistoryPersistence | null =
    null;


let coordinator:
  RuntimeEvidenceReconciliationHistoryCoordinator =
    createLocalRuntimeEvidenceReconciliationHistoryCoordinator();


let persistenceQueue:
  Promise<void> =
    Promise.resolve();


let externalChangeDetected =
  false;


const listeners =
  new Set<
    RuntimeEvidenceReconciliationHistoryListener
  >();


function emit():
  void {
  for (
    const listener of
    listeners
  ) {
    listener();
  }
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


function historiesEqual(
  left:
    RuntimeEvidenceReconciliationAttemptHistory,

  right:
    RuntimeEvidenceReconciliationAttemptHistory
):
  boolean {
  return (
    JSON.stringify(
      left
    ) ===
    JSON.stringify(
      right
    )
  );
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


export function hasRuntimeEvidenceReconciliationHistoryExternalChange():
  boolean {
  return externalChangeDetected;
}


export type RuntimeEvidenceReconciliationHistoryCoordinationHealth = {
  readonly crossContextSafe:
    boolean;

  readonly externalChangeDetected:
    boolean;

  readonly authoritative:
    false;
};


let coordinationHealthSnapshot:
  RuntimeEvidenceReconciliationHistoryCoordinationHealth = {
    crossContextSafe:
      coordinator.crossContextSafe,

    externalChangeDetected:
      false,

    authoritative:
      false,
  };


function refreshCoordinationHealthSnapshot():
  void {
  const nextCrossContextSafe =
    coordinator.crossContextSafe;

  if (
    coordinationHealthSnapshot.crossContextSafe ===
      nextCrossContextSafe &&
    coordinationHealthSnapshot.externalChangeDetected ===
      externalChangeDetected
  ) {
    return;
  }

  coordinationHealthSnapshot = {
    crossContextSafe:
      nextCrossContextSafe,

    externalChangeDetected,

    authoritative:
      false,
  };
}


export function getRuntimeEvidenceReconciliationHistoryCoordinationHealth():
  RuntimeEvidenceReconciliationHistoryCoordinationHealth {
  return coordinationHealthSnapshot;
}


export function markRuntimeEvidenceReconciliationHistoryExternalChange():
  void {
  if (
    externalChangeDetected
  ) {
    return;
  }

  externalChangeDetected =
    true;

  refreshCoordinationHealthSnapshot();

  emit();
}


export function configureRuntimeEvidenceReconciliationHistoryPersistence(
  adapter:
    RuntimeEvidenceReconciliationHistoryPersistence | null
):
  void {
  persistence =
    adapter;
}


export function configureRuntimeEvidenceReconciliationHistoryCoordinator(
  nextCoordinator:
    RuntimeEvidenceReconciliationHistoryCoordinator
):
  void {
  coordinator =
    nextCoordinator;

  refreshCoordinationHealthSnapshot();

  emit();
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

    const loaded =
      result.snapshot?.history ??
      createRuntimeEvidenceReconciliationAttemptHistory();

    history =
      loaded;

    persistenceBase =
      loaded;

    externalChangeDetected =
      false;

    refreshCoordinationHealthSnapshot();

    emit();
  } catch {
    /*
     * Operational history durability is best-effort.
     * Existing in-memory evidence remains readable.
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

  try {
    await enqueuePersistence(
      async () => {
        await coordinator.runExclusive(
          async () => {
            const localAtStart =
              history;

            const baseAtStart =
              persistenceBase;

            const result =
              await adapter.load();

            const remote =
              result.snapshot?.history ??
              createRuntimeEvidenceReconciliationAttemptHistory();

            const reconciliation =
              mergeRuntimeEvidenceReconciliationHistories(
                baseAtStart,
                localAtStart,
                remote
              );

            if (
              reconciliation.status ===
              "conflict"
            ) {
              externalChangeDetected =
                true;

              emit();

              return;
            }

            await adapter.save(
              createRuntimeEvidenceReconciliationHistorySnapshot(
                reconciliation.history
              )
            );

            persistenceBase =
              reconciliation.history;

            /*
             * Nothing else changed in memory while the
             * coordinated I/O was running.
             */
            if (
              historiesEqual(
                history,
                localAtStart
              )
            ) {
              history =
                reconciliation.history;

              externalChangeDetected =
                false;

              refreshCoordinationHealthSnapshot();

              emit();

              return;
            }

            /*
             * New local attempts were appended while persistence
             * was in flight. Preserve them instead of replacing
             * memory with the older coordinated snapshot.
             *
             * Their queued persistence pass will merge them
             * against the new persistenceBase.
             */
            externalChangeDetected =
              false;

            refreshCoordinationHealthSnapshot();

            emit();
          }
        );
      }
    );
  } catch {
    /*
     * Coordination or persistence failure cannot block
     * reconciliation or trading runtime.
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

  persistenceBase =
    createRuntimeEvidenceReconciliationAttemptHistory();

  persistence =
    null;

  coordinator =
    createLocalRuntimeEvidenceReconciliationHistoryCoordinator();

  persistenceQueue =
    Promise.resolve();

  externalChangeDetected =
    false;

  refreshCoordinationHealthSnapshot();

  emit();
}
