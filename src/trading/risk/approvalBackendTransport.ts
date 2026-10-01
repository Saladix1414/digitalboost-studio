import {
  ApprovalBackendError,
  ApprovalBackendIdempotencyConflictError,
  ApprovalBackendRevisionConflictError,
} from "./approvalBackendTransactions";

import type {
  ApprovalBackendFailureCode,
  ApprovalBackendIdempotencyKey,
  ApprovalBackendOperation,
} from "./approvalBackendTransactions";

import type {
  ApprovalPersistenceRevision,
} from "./approvalPersistence";

import type {
  ApprovalRepositoryState,
} from "./reviewRepository";


import {
  parseApprovalBackendRepositoryState,
  parseApprovalBackendRevision,
} from "./approvalBackendStateValidation";


export type ApprovalBackendStateDto = {
  readonly active:
    ApprovalRepositoryState["active"];

  readonly history:
    ApprovalRepositoryState["history"];

  readonly authoritative:
    false;
};


export type ApprovalBackendReadResponseDto = {
  readonly state:
    ApprovalBackendStateDto | null;

  readonly revision:
    ApprovalPersistenceRevision | null;
};


export type ApprovalBackendWriteRequestDto = {
  readonly state:
    ApprovalBackendStateDto;

  readonly expectedRevision:
    ApprovalPersistenceRevision | null;

  readonly idempotencyKey:
    ApprovalBackendIdempotencyKey | null;
};


export type ApprovalBackendWriteResponseDto = {
  readonly revision:
    ApprovalPersistenceRevision;
};


export type ApprovalBackendClearRequestDto = {
  readonly expectedRevision:
    ApprovalPersistenceRevision | null;

  readonly idempotencyKey:
    ApprovalBackendIdempotencyKey | null;
};


export type ApprovalBackendErrorDto = {
  readonly code:
    ApprovalBackendFailureCode;

  readonly operation:
    ApprovalBackendOperation;

  readonly message:
    string;

  readonly retryable:
    boolean;

  readonly expectedRevision:
    ApprovalPersistenceRevision | null;

  readonly actualRevision:
    ApprovalPersistenceRevision | null;

  readonly idempotencyKey:
    ApprovalBackendIdempotencyKey | null;
};


export function serializeApprovalRepositoryState(
  state:
    ApprovalRepositoryState
):
  ApprovalBackendStateDto {
  return {
    active:
      state.active,

    history:
      state.history,

    authoritative:
      false,
  };
}


export function deserializeApprovalRepositoryState(
  dto:
    unknown
):
  ApprovalRepositoryState {
  return parseApprovalBackendRepositoryState(
    dto
  );
}


export function serializeApprovalBackendWriteRequest(
  input: {
    readonly state:
      ApprovalRepositoryState;

    readonly expectedRevision:
      ApprovalPersistenceRevision | null;

    readonly idempotencyKey:
      ApprovalBackendIdempotencyKey | null;
  }
):
  ApprovalBackendWriteRequestDto {
  return {
    state:
      serializeApprovalRepositoryState(
        input.state
      ),

    expectedRevision:
      input.expectedRevision,

    idempotencyKey:
      input.idempotencyKey,
  };
}


export function serializeApprovalBackendClearRequest(
  input: {
    readonly expectedRevision:
      ApprovalPersistenceRevision | null;

    readonly idempotencyKey:
      ApprovalBackendIdempotencyKey | null;
  }
):
  ApprovalBackendClearRequestDto {
  return {
    expectedRevision:
      input.expectedRevision,

    idempotencyKey:
      input.idempotencyKey,
  };
}


export function deserializeApprovalBackendReadResponse(
  dto:
    unknown
): {
  readonly state:
    ApprovalRepositoryState | null;

  readonly revision:
    ApprovalPersistenceRevision | null;

  readonly authoritative:
    false;
} {
  if (
    typeof dto !==
      "object" ||
    dto ===
      null ||
    Array.isArray(
      dto
    )
  ) {
    throw new Error(
      "Approval backend read response must be an object."
    );
  }

  const record =
    dto as Record<
      string,
      unknown
    >;

  const state =
    record.state ===
      null
      ? null
      : deserializeApprovalRepositoryState(
          record.state
        );

  const revision =
    parseApprovalBackendRevision(
      record.revision,
      {
        nullable:
          true,
      }
    );

  if (
    state ===
      null &&
    revision !==
      null
  ) {
    throw new Error(
      "Empty approval backend state cannot carry a revision."
    );
  }

  return {
    state,

    revision,

    authoritative:
      false,
  };
}

export function mapApprovalBackendErrorDto(
  dto:
    ApprovalBackendErrorDto
):
  ApprovalBackendError {
  if (
    dto.code ===
    "revision-conflict"
  ) {
    return new ApprovalBackendRevisionConflictError({
      operation:
        dto.operation ===
        "clear"
          ? "clear"
          : "write",

      expectedRevision:
        dto.expectedRevision,

      actualRevision:
        dto.actualRevision,
    });
  }

  if (
    dto.code ===
    "idempotency-conflict"
  ) {
    if (
      dto.idempotencyKey ===
      null
    ) {
      return new ApprovalBackendError({
        message:
          dto.message,

        code:
          "invalid-state",

        operation:
          dto.operation,

        retryable:
          false,

        expectedRevision:
          dto.expectedRevision,

        actualRevision:
          dto.actualRevision,
      });
    }

    return new ApprovalBackendIdempotencyConflictError({
      operation:
        dto.operation ===
        "clear"
          ? "clear"
          : "write",

      idempotencyKey:
        dto.idempotencyKey,
    });
  }

  return new ApprovalBackendError({
    message:
      dto.message,

    code:
      dto.code,

    operation:
      dto.operation,

    retryable:
      dto.retryable,

    expectedRevision:
      dto.expectedRevision,

    actualRevision:
      dto.actualRevision,
  });
}
