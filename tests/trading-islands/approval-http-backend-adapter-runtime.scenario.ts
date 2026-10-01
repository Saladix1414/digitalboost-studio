import assert from "node:assert/strict";
import test from "node:test";

import {
  ApprovalBackendRevisionConflictError,
} from "../../src/trading/risk/approvalBackendTransactions.ts";

import {
  createApprovalHttpBackendClient,
} from "../../src/trading/risk/approvalHttpBackendClient.ts";

import {
  ApprovalHttpClientError,
} from "../../src/trading/risk/approvalHttpClient.ts";

import {
  createEmptyApprovalRepositoryState,
} from "../../src/trading/risk/reviewRepository.ts";

import type {
  ApprovalHttpClient,
  ApprovalHttpRequest,
  ApprovalHttpResponse,
} from "../../src/trading/risk/approvalHttpClient.ts";


class RecordingHttpClient
  implements ApprovalHttpClient {
  readonly requests:
    ApprovalHttpRequest[] = [];

  private readonly responses:
    ApprovalHttpResponse[];

  constructor(
    responses:
      ApprovalHttpResponse[]
  ) {
    this.responses = [
      ...responses,
    ];
  }

  async request(
    request:
      ApprovalHttpRequest
  ):
    Promise<
      ApprovalHttpResponse
    > {
    this.requests.push(
      request
    );

    const response =
      this.responses.shift();

    if (
      !response
    ) {
      throw new Error(
        "No fake HTTP response configured."
      );
    }

    return response;
  }
}


test(
  "read sends GET and deserializes repository state",
  async () => {
    const http =
      new RecordingHttpClient([
        {
          status:
            200,

          headers:
            {},

          body:
            JSON.stringify({
              state: {
                active:
                  null,

                history:
                  null,

                authoritative:
                  false,
              },

              revision:
                3,
            }),
        },
      ]);

    const client =
      createApprovalHttpBackendClient(
        http
      );

    const result =
      await client.read();

    assert.equal(
      http.requests.length,
      1
    );

    assert.equal(
      http.requests[0].method,
      "GET"
    );

    assert.equal(
      http.requests[0].path,
      "/approval"
    );

    assert.equal(
      result.revision,
      3
    );

    assert.equal(
      result.authoritative,
      false
    );
  }
);


test(
  "write sends PUT with revision and idempotency DTO",
  async () => {
    const http =
      new RecordingHttpClient([
        {
          status:
            200,

          headers:
            {},

          body:
            JSON.stringify({
              revision:
                8,
            }),
        },
      ]);

    const client =
      createApprovalHttpBackendClient(
        http
      );

    const result =
      await client.write({
        state:
          createEmptyApprovalRepositoryState(),

        expectedRevision:
          7,

        idempotencyKey:
          "approval:write:7:m-1",
      });

    assert.equal(
      result.revision,
      8
    );

    const request =
      http.requests[0];

    assert.equal(
      request.method,
      "PUT"
    );

    const body =
      JSON.parse(
        request.body ??
        "{}"
      );

    assert.equal(
      body.expectedRevision,
      7
    );

    assert.equal(
      body.idempotencyKey,
      "approval:write:7:m-1"
    );

    assert.equal(
      body.state.authoritative,
      false
    );
  }
);


test(
  "clear sends DELETE with CAS and idempotency metadata",
  async () => {
    const http =
      new RecordingHttpClient([
        {
          status:
            204,

          headers:
            {},

          body:
            null,
        },
      ]);

    const client =
      createApprovalHttpBackendClient(
        http
      );

    await client.clear({
      expectedRevision:
        9,

      idempotencyKey:
        "approval:clear:9:m-2",
    });

    const request =
      http.requests[0];

    assert.equal(
      request.method,
      "DELETE"
    );

    const body =
      JSON.parse(
        request.body ??
        "{}"
      );

    assert.equal(
      body.expectedRevision,
      9
    );

    assert.equal(
      body.idempotencyKey,
      "approval:clear:9:m-2"
    );
  }
);


test(
  "revision conflict response maps into typed domain error",
  async () => {
    const http =
      new RecordingHttpClient([
        {
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
                "revision conflict",

              retryable:
                false,

              expectedRevision:
                4,

              actualRevision:
                5,

              idempotencyKey:
                null,
            }),
        },
      ]);

    const client =
      createApprovalHttpBackendClient(
        http
      );

    await assert.rejects(
      () =>
        client.write({
          state:
            createEmptyApprovalRepositoryState(),

          expectedRevision:
            4,

          idempotencyKey:
            null,
        }),
      (
        error:
          unknown
      ) => {
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

        return true;
      }
    );
  }
);


test(
  "retryable HTTP status without valid error DTO becomes retryable backend error",
  async () => {
    const http =
      new RecordingHttpClient([
        {
          status:
            503,

          headers:
            {},

          body:
            "not-json",
        },
      ]);

    const client =
      createApprovalHttpBackendClient(
        http
      );

    await assert.rejects(
      () =>
        client.read(),
      (
        error:
          unknown
      ) => {
        assert.equal(
          typeof error,
          "object"
        );

        assert.ok(
          error !==
          null
        );

        assert.equal(
          (
            error as {
              retryable?:
                boolean;
            }
          ).retryable,
          true
        );

        return true;
      }
    );
  }
);


test(
  "successful response with invalid JSON is rejected",
  async () => {
    const http =
      new RecordingHttpClient([
        {
          status:
            200,

          headers:
            {},

          body:
            "{broken",
        },
      ]);

    const client =
      createApprovalHttpBackendClient(
        http
      );

    await assert.rejects(
      () =>
        client.read(),
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

        return true;
      }
    );
  }
);


test(
  "invalid write revision is rejected as invalid response",
  async () => {
    const http =
      new RecordingHttpClient([
        {
          status:
            200,

          headers:
            {},

          body:
            JSON.stringify({
              revision:
                -1,
            }),
        },
      ]);

    const client =
      createApprovalHttpBackendClient(
        http
      );

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
      ApprovalHttpClientError
    );
  }
);


test(
  "custom relative path and timeout flow through adapter",
  async () => {
    const http =
      new RecordingHttpClient([
        {
          status:
            200,

          headers:
            {},

          body:
            JSON.stringify({
              state:
                null,

              revision:
                null,
            }),
        },
      ]);

    const client =
      createApprovalHttpBackendClient(
        http,
        {
          path:
            "/v1/trading/approval",

          timeoutMs:
            2_000,
        }
      );

    await client.read();

    assert.equal(
      http.requests[0].path,
      "/v1/trading/approval"
    );

    assert.equal(
      http.requests[0].timeoutMs,
      2_000
    );
  }
);
