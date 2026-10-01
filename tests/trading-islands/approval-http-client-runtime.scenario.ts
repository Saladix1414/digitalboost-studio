import assert from "node:assert/strict";
import test from "node:test";

import {
  ApprovalHttpClientError,
  createApprovalHttpRequest,
  isApprovalHttpRetryableStatus,
  isApprovalHttpSuccess,
} from "../../src/trading/risk/approvalHttpClient.ts";

import type {
  ApprovalHttpClient,
} from "../../src/trading/risk/approvalHttpClient.ts";


test(
  "request builder applies safe defaults",
  () => {
    const request =
      createApprovalHttpRequest({
        method:
          "GET",

        path:
          "/approval",
      });

    assert.equal(
      request.method,
      "GET"
    );

    assert.equal(
      request.path,
      "/approval"
    );

    assert.deepEqual(
      request.headers,
      {}
    );

    assert.equal(
      request.body,
      null
    );

    assert.equal(
      request.timeoutMs,
      10_000
    );

    assert.equal(
      request.signal,
      null
    );
  }
);


test(
  "request builder preserves timeout headers body and signal",
  () => {
    const controller =
      new AbortController();

    const request =
      createApprovalHttpRequest({
        method:
          "PUT",

        path:
          "/approval",

        headers: {
          "content-type":
            "application/json",
        },

        body:
          "{}",

        timeoutMs:
          2_500,

        signal:
          controller.signal,
      });

    assert.equal(
      request.timeoutMs,
      2_500
    );

    assert.equal(
      request.body,
      "{}"
    );

    assert.equal(
      request.signal,
      controller.signal
    );
  }
);


test(
  "request builder rejects absolute endpoint",
  () => {
    assert.throws(
      () =>
        createApprovalHttpRequest({
          method:
            "GET",

          path:
            "https://example.invalid/approval",
        }),
      /must be relative/
    );
  }
);


test(
  "request builder rejects empty path",
  () => {
    assert.throws(
      () =>
        createApprovalHttpRequest({
          method:
            "GET",

          path:
            "   ",
        }),
      /path is required/
    );
  }
);


test(
  "request builder rejects invalid timeout",
  () => {
    assert.throws(
      () =>
        createApprovalHttpRequest({
          method:
            "GET",

          path:
            "/approval",

          timeoutMs:
            0,
        }),
      /greater than zero/
    );
  }
);


test(
  "success classifier accepts only 2xx",
  () => {
    assert.equal(
      isApprovalHttpSuccess({
        status:
          200,

        headers:
          {},

        body:
          null,
      }),
      true
    );

    assert.equal(
      isApprovalHttpSuccess({
        status:
          299,

        headers:
          {},

        body:
          null,
      }),
      true
    );

    assert.equal(
      isApprovalHttpSuccess({
        status:
          300,

        headers:
          {},

        body:
          null,
      }),
      false
    );
  }
);


test(
  "retryable classifier recognizes transient HTTP statuses",
  () => {
    for (
      const status of [
        408,
        425,
        429,
        500,
        503,
      ]
    ) {
      assert.equal(
        isApprovalHttpRetryableStatus(
          status
        ),
        true
      );
    }

    for (
      const status of [
        400,
        401,
        403,
        404,
        409,
        422,
      ]
    ) {
      assert.equal(
        isApprovalHttpRetryableStatus(
          status
        ),
        false
      );
    }
  }
);


test(
  "client port can be implemented by an in-memory fake",
  async () => {
    const client:
      ApprovalHttpClient = {
        async request(
          request
        ) {
          return {
            status:
              200,

            headers: {
              "x-method":
                request.method,
            },

            body:
              request.body,
          };
        },
      };

    const response =
      await client.request(
        createApprovalHttpRequest({
          method:
            "PUT",

          path:
            "/approval",

          body:
            "{\"ok\":true}",
        })
      );

    assert.equal(
      response.status,
      200
    );

    assert.equal(
      response.headers[
        "x-method"
      ],
      "PUT"
    );

    assert.equal(
      response.body,
      "{\"ok\":true}"
    );
  }
);


test(
  "HTTP client errors remain non authoritative",
  () => {
    const error =
      new ApprovalHttpClientError({
        message:
          "temporary network failure",

        code:
          "network",

        retryable:
          true,
      });

    assert.equal(
      error.code,
      "network"
    );

    assert.equal(
      error.retryable,
      true
    );

    assert.equal(
      error.status,
      null
    );

    assert.equal(
      error.authoritative,
      false
    );
  }
);
