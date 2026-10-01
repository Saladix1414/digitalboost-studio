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
  }
):
  Promise<Result> {
  let attempt =
    1;

  while (
    true
  ) {
    try {
      return await input.execute(
        attempt
      );
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
        throw error;
      }

      attempt +=
        1;
    }
  }
}
