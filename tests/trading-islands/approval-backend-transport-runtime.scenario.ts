import assert from "node:assert/strict";
import test from "node:test";

import {
  ApprovalBackendError,
  ApprovalBackendIdempotencyConflictError,
  ApprovalBackendRevisionConflictError,
} from "../../src/trading/risk/approvalBackendTransactions.ts";

import {
  deserializeApprovalBackendReadResponse,
  deserializeApprovalRepositoryState,
  mapApprovalBackendErrorDto,
  serializeApprovalBackendClearRequest,
  serializeApprovalBackendWriteRequest,
  serializeApprovalRepositoryState,
} from "../../src/trading/risk/approvalBackendTransport.ts";

import {
  createEmptyApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";


test(
  "repository state round-trips through transport DTO",
  () => {
    const state =
      createEmptyApprovalRepositoryState();

    const dto =
      serializeApprovalRepositoryState(
        state
      );

    assert.equal(
      dto.authoritative,
      false
    );

    const restored =
      deserializeApprovalRepositoryState(
        dto
      );

    assert.deepEqual(
      restored,
      state
    );

    assert.equal(
      restored.authoritative,
      false
    );
  }
);


test(
  "read response deserialization preserves revision",
  () => {
    const result =
      deserializeApprovalBackendReadResponse({
        state:
          serializeApprovalRepositoryState(
            createEmptyApprovalRepositoryState()
          ),

        revision:
          7,
      });

    assert.equal(
      result.revision,
      7
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);


test(
  "write serialization preserves CAS and idempotency metadata",
  () => {
    const dto =
      serializeApprovalBackendWriteRequest({
        state:
          createEmptyApprovalRepositoryState(),

        expectedRevision:
          4,

        idempotencyKey:
          "approval:write:4:m-1",
      });

    assert.equal(
      dto.expectedRevision,
      4
    );

    assert.equal(
      dto.idempotencyKey,
      "approval:write:4:m-1"
    );

    assert.equal(
      dto.state.authoritative,
      false
    );
  }
);


test(
  "clear serialization preserves CAS and idempotency metadata",
  () => {
    const dto =
      serializeApprovalBackendClearRequest({
        expectedRevision:
          9,

        idempotencyKey:
          "approval:clear:9:m-2",
      });

    assert.deepEqual(
      dto,
      {
        expectedRevision:
          9,

        idempotencyKey:
          "approval:clear:9:m-2",
      }
    );
  }
);


test(
  "revision conflict DTO maps into typed domain conflict",
  () => {
    const error =
      mapApprovalBackendErrorDto({
        code:
          "revision-conflict",

        operation:
          "write",

        message:
          "conflict",

        retryable:
          false,

        expectedRevision:
          4,

        actualRevision:
          5,

        idempotencyKey:
          null,
      });

    assert.ok(
      error instanceof
        ApprovalBackendRevisionConflictError
    );

    assert.equal(
      error.expectedRevision,
      4
    );

    assert.equal(
      error.actualRevision,
      5
    );
  }
);


test(
  "idempotency conflict DTO maps into typed domain conflict",
  () => {
    const error =
      mapApprovalBackendErrorDto({
        code:
          "idempotency-conflict",

        operation:
          "clear",

        message:
          "duplicate mutation",

        retryable:
          false,

        expectedRevision:
          2,

        actualRevision:
          2,

        idempotencyKey:
          "approval:clear:2:m-3",
      });

    assert.ok(
      error instanceof
        ApprovalBackendIdempotencyConflictError
    );

    assert.equal(
      error.idempotencyKey,
      "approval:clear:2:m-3"
    );
  }
);


test(
  "retryable generic transport DTO preserves retryability",
  () => {
    const error =
      mapApprovalBackendErrorDto({
        code:
          "unavailable",

        operation:
          "read",

        message:
          "temporarily unavailable",

        retryable:
          true,

        expectedRevision:
          null,

        actualRevision:
          null,

        idempotencyKey:
          null,
      });

    assert.ok(
      error instanceof
        ApprovalBackendError
    );

    assert.equal(
      error.code,
      "unavailable"
    );

    assert.equal(
      error.retryable,
      true
    );

    assert.equal(
      error.authoritative,
      false
    );
  }
);


test(
  "wire state cannot claim authority",
  () => {
    assert.throws(
      () =>
        deserializeApprovalRepositoryState({
          active:
            null,

          history:
            null,

          authoritative:
            true as false,
        }),
      /cannot be authoritative/
    );
  }
);
