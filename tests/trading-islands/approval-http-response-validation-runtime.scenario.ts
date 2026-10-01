import assert from "node:assert/strict";
import test from "node:test";

import {
  ApprovalBackendError,
  ApprovalBackendIdempotencyConflictError,
  ApprovalBackendRevisionConflictError,
} from "../../src/trading/risk/approvalBackendTransactions.ts";

import {
  parseApprovalBackendErrorDto,
  parseApprovalBackendWriteResponse,
} from "../../src/trading/risk/approvalBackendTransport.ts";

import {
  createApprovalHttpBackendClient,
} from "../../src/trading/risk/approvalHttpBackendClient.ts";

import {
  ApprovalHttpClientError,
} from "../../src/trading/risk/approvalHttpClient.ts";

import {
  createEmptyApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";


test(
  "valid write response is accepted",
  () => {
    assert.deepEqual(
      parseApprovalBackendWriteResponse({
        revision:
          7,
      }),
      {
        revision:
          7,
      }
    );
  }
);


test(
  "malformed write responses are rejected",
  () => {
    for (
      const value of [
        null,
        [],
        {},
        {
          revision:
            -1,
        },
        {
          revision:
            1.5,
        },
        {
          revision:
            "7",
        },
      ]
    ) {
      assert.throws(
        () =>
          parseApprovalBackendWriteResponse(
            value
          )
      );
    }
  }
);


test(
  "valid generic backend error DTO is accepted",
  () => {
    const dto =
      parseApprovalBackendErrorDto({
        code:
          "unavailable",

        operation:
          "read",

        message:
          "temporary outage",

        retryable:
          true,

        expectedRevision:
          null,

        actualRevision:
          null,

        idempotencyKey:
          null,
      });

    assert.equal(
      dto.code,
      "unavailable"
    );

    assert.equal(
      dto.retryable,
      true
    );
  }
);


test(
  "invalid backend error enums and metadata are rejected",
  () => {
    assert.throws(
      () =>
        parseApprovalBackendErrorDto({
          code:
            "made-up",

          operation:
            "read",

          message:
            "bad",

          retryable:
            false,

          expectedRevision:
            null,

          actualRevision:
            null,

          idempotencyKey:
            null,
        })
    );

    assert.throws(
      () =>
        parseApprovalBackendErrorDto({
          code:
            "unavailable",

          operation:
            "made-up",

          message:
            "bad",

          retryable:
            false,

          expectedRevision:
            null,

          actualRevision:
            null,

          idempotencyKey:
            null,
        })
    );

    assert.throws(
      () =>
        parseApprovalBackendErrorDto({
          code:
            "revision-conflict",

          operation:
            "read",

          message:
            "bad conflict",

          retryable:
            false,

          expectedRevision:
            1,

          actualRevision:
            2,

          idempotencyKey:
            null,
        })
    );

    assert.throws(
      () =>
        parseApprovalBackendErrorDto({
          code:
            "idempotency-conflict",

          operation:
            "write",

          message:
            "bad conflict",

          retryable:
            false,

          expectedRevision:
            1,

          actualRevision:
            1,

          idempotencyKey:
            null,
        })
    );
  }
);


test(
  "HTTP write malformed success becomes invalid-response",
  async () => {
    const client =
      createApprovalHttpBackendClient({
        async request() {
          return {
            status:
              200,

            headers:
              {},

            body:
              JSON.stringify({
                revision:
                  "wrong",
              }),
          };
        },
      });

    await assert.rejects(
      () =>
        client.write({
          state:
            createEmptyApprovalRepositoryState(),

          expectedRevision:
            null,

          idempotencyKey:
            null,
        }),
      (
        error:
          unknown
      ) => {
        assert.ok(
          error instanceof
            ApprovalHttpClientError
        );

        assert.equal(
          error.code,
          "invalid-response"
        );

        assert.equal(
          error.retryable,
          false
        );

        return true;
      }
    );
  }
);


test(
  "HTTP valid revision conflict remains typed",
  async () => {
    const client =
      createApprovalHttpBackendClient({
        async request() {
          return {
            status:
              409,

            headers:
              {},

            body:
              JSON.stringify({
                code:
                  "revision-conflict",

                operation:
                  "write",

                message:
                  "conflict",

                retryable:
                  false,

                expectedRevision:
                  3,

                actualRevision:
                  4,

                idempotencyKey:
                  null,
              }),
          };
        },
      });

    await assert.rejects(
      () =>
        client.write({
          state:
            createEmptyApprovalRepositoryState(),

          expectedRevision:
            3,

          idempotencyKey:
            "approval:write:3:test",
        }),
      ApprovalBackendRevisionConflictError
    );
  }
);


test(
  "HTTP valid idempotency conflict remains typed",
  async () => {
    const client =
      createApprovalHttpBackendClient({
        async request() {
          return {
            status:
              409,

            headers:
              {},

            body:
              JSON.stringify({
                code:
                  "idempotency-conflict",

                operation:
                  "clear",

                message:
                  "duplicate",

                retryable:
                  false,

                expectedRevision:
                  3,

                actualRevision:
                  3,

                idempotencyKey:
                  "approval:clear:3:test",
              }),
          };
        },
      });

    await assert.rejects(
      () =>
        client.clear({
          expectedRevision:
            3,

          idempotencyKey:
            "approval:clear:3:test",
        }),
      ApprovalBackendIdempotencyConflictError
    );
  }
);


test(
  "malformed backend error does not become trusted typed conflict",
  async () => {
    const client =
      createApprovalHttpBackendClient({
        async request() {
          return {
            status:
              409,

            headers:
              {},

            body:
              JSON.stringify({
                code:
                  "revision-conflict",

                operation:
                  "write",

                message:
                  "conflict",

                retryable:
                  "no",

                expectedRevision:
                  3,

                actualRevision:
                  4,

                idempotencyKey:
                  null,
              }),
          };
        },
      });

    await assert.rejects(
      () =>
        client.write({
          state:
            createEmptyApprovalRepositoryState(),

          expectedRevision:
            3,

          idempotencyKey:
            null,
        }),
      (
        error:
          unknown
      ) => {
        assert.ok(
          error instanceof
            ApprovalBackendError
        );

        assert.equal(
          error.code,
          "internal"
        );

        assert.equal(
          error.operation,
          "write"
        );

        return true;
      }
    );
  }
);


test(
  "DELETE accepts successful empty response",
  async () => {
    const client =
      createApprovalHttpBackendClient({
        async request() {
          return {
            status:
              204,

            headers:
              {},

            body:
              null,
          };
        },
      });

    await client.clear({
      expectedRevision:
        2,

      idempotencyKey:
        "approval:clear:2:test",
    });
  }
);
