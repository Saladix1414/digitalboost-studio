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


function isApprovalBackendTransportRecord(
  value:
    unknown
):
  value is Record<
    string,
    unknown
  > {
  return (
    typeof value ===
      "object" &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}


function isApprovalBackendOperationValue(
  value:
    unknown
):
  value is ApprovalBackendOperation {
  return (
    value ===
      "read" ||
    value ===
      "write" ||
    value ===
      "clear"
  );
}


function isApprovalBackendFailureCodeValue(
  value:
    unknown
):
  value is ApprovalBackendFailureCode {
  return (
    value ===
      "revision-conflict" ||
    value ===
      "idempotency-conflict" ||
    value ===
      "not-found" ||
    value ===
      "invalid-state" ||
    value ===
      "unavailable" ||
    value ===
      "timeout" ||
    value ===
      "internal"
  );
}


function parseNullableApprovalRevision(
  value:
    unknown,

  label:
    string
):
  ApprovalPersistenceRevision | null {
  if (
    value ===
      null
  ) {
    return null;
  }

  if (
    typeof value !==
      "number" ||
    !Number.isInteger(
      value
    ) ||
    value <
      0
  ) {
    throw new Error(
      `${label} must be a non-negative integer or null.`
    );
  }

  return value;
}


export function parseApprovalBackendWriteResponse(
  value:
    unknown
):
  ApprovalBackendWriteResponseDto {
  if (
    !isApprovalBackendTransportRecord(
      value
    )
  ) {
    throw new Error(
      "Approval backend write response must be an object."
    );
  }

  if (
    typeof value.revision !==
      "number" ||
    !Number.isInteger(
      value.revision
    ) ||
    value.revision <
      0
  ) {
    throw new Error(
      "Approval backend write response revision is invalid."
    );
  }

  return {
    revision:
      value.revision,
  };
}


export function parseApprovalBackendErrorDto(
  value:
    unknown
):
  ApprovalBackendErrorDto {
  if (
    !isApprovalBackendTransportRecord(
      value
    )
  ) {
    throw new Error(
      "Approval backend error response must be an object."
    );
  }

  if (
    !isApprovalBackendFailureCodeValue(
      value.code
    )
  ) {
    throw new Error(
      "Approval backend error code is invalid."
    );
  }

  if (
    !isApprovalBackendOperationValue(
      value.operation
    )
  ) {
    throw new Error(
      "Approval backend error operation is invalid."
    );
  }

  if (
    typeof value.message !==
      "string" ||
    value.message.length ===
      0
  ) {
    throw new Error(
      "Approval backend error message is invalid."
    );
  }

  if (
    typeof value.retryable !==
      "boolean"
  ) {
    throw new Error(
      "Approval backend error retryable flag is invalid."
    );
  }

  const expectedRevision =
    parseNullableApprovalRevision(
      value.expectedRevision,
      "Approval backend expectedRevision"
    );

  const actualRevision =
    parseNullableApprovalRevision(
      value.actualRevision,
      "Approval backend actualRevision"
    );

  let idempotencyKey:
    ApprovalBackendIdempotencyKey | null;

  if (
    value.idempotencyKey ===
      null
  ) {
    idempotencyKey =
      null;
  } else if (
    typeof value.idempotencyKey ===
      "string" &&
    value.idempotencyKey.length >
      0
  ) {
    idempotencyKey =
      value.idempotencyKey;
  } else {
    throw new Error(
      "Approval backend idempotencyKey is invalid."
    );
  }

  if (
    value.code ===
      "revision-conflict" &&
    (
      value.operation ===
        "read" ||
      actualRevision ===
        null
    )
  ) {
    throw new Error(
      "Approval backend revision conflict metadata is invalid."
    );
  }

  if (
    value.code ===
      "idempotency-conflict" &&
    (
      value.operation ===
        "read" ||
      idempotencyKey ===
        null
    )
  ) {
    throw new Error(
      "Approval backend idempotency conflict metadata is invalid."
    );
  }

  return {
    code:
      value.code,

    operation:
      value.operation,

    message:
      value.message,

    retryable:
      value.retryable,

    expectedRevision,

    actualRevision,

    idempotencyKey,
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
