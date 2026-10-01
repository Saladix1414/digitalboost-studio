import assert from "node:assert/strict";
import test from "node:test";

import {
  ApprovalBackendError,
} from "../../src/trading/risk/approvalBackendTransactions.ts";

import {
  createApprovalHttpBackendClient,
} from "../../src/trading/risk/approvalHttpBackendClient.ts";

import {
  createEmptyApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";


function failingClient() {
  return createApprovalHttpBackendClient({
    async request() {
      return {
        status:
          503,

        headers:
          {},

        body:
          "not-json",
      };
    },
  });
}


test(
  "malformed read error retains read attribution",
  async () => {
    const client =
      failingClient();

    await assert.rejects(
      () =>
        client.read(),
      (
        error:
          unknown
      ) => {
        assert.ok(
          error instanceof
            ApprovalBackendError
        );

        assert.equal(
          error.operation,
          "read"
        );

        assert.equal(
          error.retryable,
          true
        );

        return true;
      }
    );
  }
);


test(
  "malformed write error retains write attribution",
  async () => {
    const client =
      failingClient();

    await assert.rejects(
      () =>
        client.write({
          state:
            createEmptyApprovalRepositoryState(),

          expectedRevision:
            null,

          idempotencyKey:
            "approval:write:null:test",
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
          error.operation,
          "write"
        );

        assert.equal(
          error.retryable,
          true
        );

        return true;
      }
    );
  }
);


test(
  "malformed clear error retains clear attribution",
  async () => {
    const client =
      failingClient();

    await assert.rejects(
      () =>
        client.clear({
          expectedRevision:
            null,

          idempotencyKey:
            "approval:clear:null:test",
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
          error.operation,
          "clear"
        );

        assert.equal(
          error.retryable,
          true
        );

        return true;
      }
    );
  }
);


test(
  "non-retryable malformed write failure keeps write attribution",
  async () => {
    const client =
      createApprovalHttpBackendClient({
        async request() {
          return {
            status:
              400,

            headers:
              {},

            body:
              JSON.stringify({
                bad:
                  "payload",
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
            ApprovalBackendError
        );

        assert.equal(
          error.operation,
          "write"
        );

        assert.equal(
          error.code,
          "internal"
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
