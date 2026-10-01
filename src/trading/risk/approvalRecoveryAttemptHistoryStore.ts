import {
  appendApprovalRecoveryAttemptHistory,
  createApprovalRecoveryAttemptHistory,
} from "./approvalRecoveryAttemptHistory";

import type {
  ApprovalRecoveryAttemptHistory,
  ApprovalRecoveryAttemptHistoryEntry,
} from "./approvalRecoveryAttemptHistory";


type ApprovalRecoveryHistoryListener =
  () => void;


let recoveryHistory =
  createApprovalRecoveryAttemptHistory();


const listeners =
  new Set<
    ApprovalRecoveryHistoryListener
  >();


function emitRecoveryHistoryChange():
  void {
  for (
    const listener of
    listeners
  ) {
    listener();
  }
}


export function subscribeApprovalRecoveryAttemptHistory(
  listener:
    ApprovalRecoveryHistoryListener
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


export function getApprovalRecoveryAttemptHistory():
  ApprovalRecoveryAttemptHistory {
  return recoveryHistory;
}


export function recordApprovalRecoveryAttemptHistory(
  entry:
    Omit<
      ApprovalRecoveryAttemptHistoryEntry,
      "sequence"
      | "authoritative"
    >
):
  ApprovalRecoveryAttemptHistory {
  recoveryHistory =
    appendApprovalRecoveryAttemptHistory(
      recoveryHistory,
      entry
    );

  emitRecoveryHistoryChange();

  return recoveryHistory;
}


export function resetApprovalRecoveryAttemptHistoryForTests():
  void {
  recoveryHistory =
    createApprovalRecoveryAttemptHistory();

  emitRecoveryHistoryChange();
}
