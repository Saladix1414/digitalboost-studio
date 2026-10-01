import type {
  ApprovalPersistenceRevision,
} from "./approvalPersistence";


export type ApprovalBackendOperation =
  | "read"
  | "write"
  | "clear";


export type ApprovalBackendConflictCode =
  | "revision-conflict"
  | "idempotency-conflict";


export type ApprovalBackendFailureCode =
  | ApprovalBackendConflictCode
  | "not-found"
  | "invalid-state"
  | "unavailable"
  | "timeout"
  | "internal";


export type ApprovalBackendIdempotencyKey =
  string;


export type ApprovalBackendTransactionMetadata = {
  readonly operation:
    ApprovalBackendOperation;

  readonly idempotencyKey:
    ApprovalBackendIdempotencyKey | null;

  readonly expectedRevision:
    ApprovalPersistenceRevision | null;

  readonly actualRevision:
    ApprovalPersistenceRevision | null;

  readonly authoritative:
    false;
};


export class ApprovalBackendError
  extends Error {
  readonly code:
    ApprovalBackendFailureCode;

  readonly operation:
    ApprovalBackendOperation;

  readonly retryable:
    boolean;

  readonly expectedRevision:
    ApprovalPersistenceRevision | null;

  readonly actualRevision:
    ApprovalPersistenceRevision | null;

  readonly authoritative =
    false as const;

  constructor(
    input: {
      readonly message:
        string;

      readonly code:
        ApprovalBackendFailureCode;

      readonly operation:
        ApprovalBackendOperation;

      readonly retryable:
        boolean;

      readonly expectedRevision?:
        ApprovalPersistenceRevision | null;

      readonly actualRevision?:
        ApprovalPersistenceRevision | null;
    }
  ) {
    super(
      input.message
    );

    this.name =
      "ApprovalBackendError";

    this.code =
      input.code;

    this.operation =
      input.operation;

    this.retryable =
      input.retryable;

    this.expectedRevision =
      input.expectedRevision ??
      null;

    this.actualRevision =
      input.actualRevision ??
      null;
  }
}


export class ApprovalBackendRevisionConflictError
  extends ApprovalBackendError {
  constructor(
    input: {
      readonly operation:
        "write" | "clear";

      readonly expectedRevision:
        ApprovalPersistenceRevision | null;

      readonly actualRevision:
        ApprovalPersistenceRevision | null;
    }
  ) {
    super({
      message:
        `Approval backend revision conflict: expected ${input.expectedRevision ?? "null"}, actual ${input.actualRevision ?? "null"}.`,

      code:
        "revision-conflict",

      operation:
        input.operation,

      retryable:
        false,

      expectedRevision:
        input.expectedRevision,

      actualRevision:
        input.actualRevision,
    });

    this.name =
      "ApprovalBackendRevisionConflictError";
  }
}


export class ApprovalBackendIdempotencyConflictError
  extends ApprovalBackendError {
  readonly idempotencyKey:
    ApprovalBackendIdempotencyKey;

  constructor(
    input: {
      readonly operation:
        "write" | "clear";

      readonly idempotencyKey:
        ApprovalBackendIdempotencyKey;
    }
  ) {
    super({
      message:
        `Approval backend idempotency conflict for key ${input.idempotencyKey}.`,

      code:
        "idempotency-conflict",

      operation:
        input.operation,

      retryable:
        false,
    });

    this.name =
      "ApprovalBackendIdempotencyConflictError";

    this.idempotencyKey =
      input.idempotencyKey;
  }
}


export function createApprovalBackendIdempotencyKey(
  input: {
    readonly operation:
      "write" | "clear";

    readonly expectedRevision:
      ApprovalPersistenceRevision | null;

    readonly mutationId:
      string;
  }
):
  ApprovalBackendIdempotencyKey {
  const mutationId =
    input.mutationId.trim();

  if (
    mutationId.length ===
    0
  ) {
    throw new Error(
      "Approval backend mutationId is required."
    );
  }

  return [
    "approval",
    input.operation,
    input.expectedRevision ??
      "null",
    mutationId,
  ].join(
    ":"
  );
}


export function isApprovalBackendConflict(
  error:
    unknown
):
  error is ApprovalBackendError {
  return (
    error instanceof
      ApprovalBackendError &&
    (
      error.code ===
        "revision-conflict" ||
      error.code ===
        "idempotency-conflict"
    )
  );
}


export function isRetryableApprovalBackendError(
  error:
    unknown
):
  error is ApprovalBackendError {
  return (
    error instanceof
      ApprovalBackendError &&
    error.retryable
  );
}
