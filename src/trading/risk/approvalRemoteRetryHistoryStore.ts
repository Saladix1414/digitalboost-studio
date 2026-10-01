import {
  appendApprovalRemoteRetryHistory,
  createApprovalRemoteRetryHistory,
} from "./approvalRemoteRetryHistory";

import type {
  ApprovalRemoteRetryHistory,
  ApprovalRemoteRetryOperation,
} from "./approvalRemoteRetryHistory";

import type {
  ApprovalRemoteRetryAttemptEvent,
} from "./approvalRemoteRetryHistory";


type ApprovalRemoteRetryHistoryListener =
  () => void;


let history =
  createApprovalRemoteRetryHistory();


const listeners =
  new Set<
    ApprovalRemoteRetryHistoryListener
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


export function subscribeApprovalRemoteRetryHistory(
  listener:
    ApprovalRemoteRetryHistoryListener
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


export function getApprovalRemoteRetryHistory():
  ApprovalRemoteRetryHistory {
  return history;
}


export function recordApprovalRemoteRetryAttempt(
  operation:
    ApprovalRemoteRetryOperation,

  idempotencyProtected:
    boolean,

  event:
    ApprovalRemoteRetryAttemptEvent
):
  void {
  history =
    appendApprovalRemoteRetryHistory(
      history,
      {
        operation,

        attempt:
          event.attempt,

        status:
          event.status,

        reason:
          event.reason,

        idempotencyProtected,
      }
    );

  emit();
}


export function resetApprovalRemoteRetryHistoryForTests():
  void {
  history =
    createApprovalRemoteRetryHistory();

  emit();
}
