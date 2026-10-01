import {
  isRetryableApprovalBackendError,
} from "./approvalBackendTransactions";

import {
  ApprovalHttpClientError,
} from "./approvalHttpClient";


export const APPROVAL_REMOTE_MUTATION_MAX_ATTEMPTS =
  2;


export type ApprovalRemoteRetryDecision = {
  readonly retry:
    boolean;

  readonly reason:
    | "retryable-backend"
    | "retryable-http"
    | "non-retryable"
    | "attempt-limit"
    | "missing-idempotency";

  readonly authoritative:
    false;
};


export type ApprovalRemoteRetryObserverEvent = {
  readonly attempt:
    number;

  readonly status:
    | "attempt"
    | "retry"
    | "succeeded"
    | "failed";

  readonly reason:
    ApprovalRemoteRetryDecision["reason"] | null;

  readonly authoritative:
    false;
};


export type ApprovalRemoteRetryObserver =
  (
    event:
      ApprovalRemoteRetryObserverEvent
  ) => void;


export function resolveApprovalRemoteRetryDecision(
  input: {
    readonly error:
      unknown;

    readonly attempt:
      number;

    readonly hasIdempotencyKey:
      boolean;
  }
):
  ApprovalRemoteRetryDecision {
  if (
    !input.hasIdempotencyKey
  ) {
    return {
      retry:
        false,

      reason:
        "missing-idempotency",

      authoritative:
        false,
    };
  }

  if (
    input.attempt >=
    APPROVAL_REMOTE_MUTATION_MAX_ATTEMPTS
  ) {
    return {
      retry:
        false,

      reason:
        "attempt-limit",

      authoritative:
        false,
    };
  }

  if (
    isRetryableApprovalBackendError(
      input.error
    )
  ) {
    return {
      retry:
        true,

      reason:
        "retryable-backend",

      authoritative:
        false,
    };
  }

  if (
    input.error instanceof
      ApprovalHttpClientError &&
    input.error.retryable
  ) {
    return {
      retry:
        true,

      reason:
        "retryable-http",

      authoritative:
        false,
    };
  }

  return {
    retry:
      false,

    reason:
      "non-retryable",

    authoritative:
      false,
  };
}


export async function runApprovalRemoteMutationWithRetry<
  Result
>(
  input: {
    readonly idempotencyKey:
      string | null;

    readonly execute:
      (
        attempt:
          number
      ) => Promise<Result>;

    readonly onEvent?:
      ApprovalRemoteRetryObserver;
  }
):
  Promise<Result> {
  let attempt =
    1;

  while (
    true
  ) {
    input.onEvent?.({
      attempt,

      status:
        "attempt",

      reason:
        null,

      authoritative:
        false,
    });

    try {
      const result =
        await input.execute(
          attempt
        );

      input.onEvent?.({
        attempt,

        status:
          "succeeded",

        reason:
          null,

        authoritative:
          false,
      });

      return result;
    } catch (
      error
    ) {
      const decision =
        resolveApprovalRemoteRetryDecision({
          error,

          attempt,

          hasIdempotencyKey:
            input.idempotencyKey !==
            null,
        });

      if (
        !decision.retry
      ) {
        input.onEvent?.({
          attempt,

          status:
            "failed",

          reason:
            decision.reason,

          authoritative:
            false,
        });

        throw error;
      }

      input.onEvent?.({
        attempt,

        status:
          "retry",

        reason:
          decision.reason,

        authoritative:
          false,
      });

      attempt +=
        1;
    }
  }
}
