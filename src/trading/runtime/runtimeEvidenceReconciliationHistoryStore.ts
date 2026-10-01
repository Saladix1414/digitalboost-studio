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

  return history;
}


export function resetRuntimeEvidenceReconciliationHistoryForTests():
  void {
  history =
    createRuntimeEvidenceReconciliationAttemptHistory();

  emit();
}
