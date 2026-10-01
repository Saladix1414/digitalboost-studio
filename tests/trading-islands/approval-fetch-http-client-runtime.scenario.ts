import assert from "node:assert/strict";
import test from "node:test";

import {
  createApprovalFetchHttpClient,
} from "../../src/trading/risk/approvalFetchHttpClient.ts";

import {
  ApprovalHttpClientError,
  createApprovalHttpRequest,
} from "../../src/trading/risk/approvalHttpClient.ts";


test(
  "fetch adapter joins base URL and relative path",
  async () => {
    let receivedUrl =
      "";

    let receivedMethod =
      "";

    const fetchImpl:
      typeof fetch =
        async (
          input,
          init
        ) => {
          receivedUrl =
            String(
              input
            );

          receivedMethod =
            String(
              init?.method
            );

          return new Response(
            "{\"ok\":true}",
            {
              status:
                200,

              headers: {
                "content-type":
                  "application/json",
              },
            }
          );
        };

    const client =
      createApprovalFetchHttpClient({
        baseUrl:
          "https://example.test/api/",

        fetchImpl,
      });

    const response =
      await client.request(
        createApprovalHttpRequest({
          method:
            "GET",

          path:
            "/approval",
        })
      );

    assert.equal(
      receivedUrl,
      "https://example.test/api/approval"
    );

    assert.equal(
      receivedMethod,
      "GET"
    );

    assert.equal(
      response.status,
      200
    );

    assert.equal(
      response.body,
      "{\"ok\":true}"
    );

    assert.equal(
      response.headers[
        "content-type"
      ],
      "application/json"
    );
  }
);


test(
  "fetch adapter forwards headers body and method",
  async () => {
    let receivedHeaders:
      HeadersInit | undefined;

    let receivedBody:
      BodyInit | null | undefined;

    const fetchImpl:
      typeof fetch =
        async (
          _input,
          init
        ) => {
          receivedHeaders =
            init?.headers;

          receivedBody =
            init?.body;

          return new Response(
            "",
            {
              status:
                200,
            }
          );
        };

    const client =
      createApprovalFetchHttpClient({
        baseUrl:
          "https://example.test",

        fetchImpl,
      });

    await client.request(
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
          "{\"revision\":1}",
      })
    );

    assert.deepEqual(
      receivedHeaders,
      {
        "content-type":
          "application/json",
      }
    );

    assert.equal(
      receivedBody,
      "{\"revision\":1}"
    );
  }
);


test(
  "204 response produces null body",
  async () => {
    const client =
      createApprovalFetchHttpClient({
        baseUrl:
          "https://example.test",

        fetchImpl:
          async () =>
            new Response(
              null,
              {
                status:
                  204,
              }
            ),
      });

    const response =
      await client.request(
        createApprovalHttpRequest({
          method:
            "DELETE",

          path:
            "/approval",
        })
      );

    assert.equal(
      response.status,
      204
    );

    assert.equal(
      response.body,
      null
    );
  }
);


test(
  "network failure maps to retryable client error",
  async () => {
    const client =
      createApprovalFetchHttpClient({
        baseUrl:
          "https://example.test",

        fetchImpl:
          async () => {
            throw new Error(
              "synthetic network failure"
            );
          },
      });

    await assert.rejects(
      () =>
        client.request(
          createApprovalHttpRequest({
            method:
              "GET",

            path:
              "/approval",
          })
        ),
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
          "network"
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
  "external abort maps to non retryable aborted error",
  async () => {
    const controller =
      new AbortController();

    controller.abort();

    const client =
      createApprovalFetchHttpClient({
        baseUrl:
          "https://example.test",

        fetchImpl:
          async (
            _input,
            init
          ) => {
            if (
              init?.signal?.aborted
            ) {
              throw new DOMException(
                "aborted",
                "AbortError"
              );
            }

            return new Response(
              "",
              {
                status:
                  200,
              }
            );
          },
      });

    await assert.rejects(
      () =>
        client.request(
          createApprovalHttpRequest({
            method:
              "GET",

            path:
              "/approval",

            signal:
              controller.signal,
          })
        ),
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
          "aborted"
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
  "timeout maps to retryable timeout error",
  async () => {
    const client =
      createApprovalFetchHttpClient({
        baseUrl:
          "https://example.test",

        fetchImpl:
          async (
            _input,
            init
          ) =>
            new Promise<Response>(
              (
                _resolve,
                reject
              ) => {
                init?.signal?.addEventListener(
                  "abort",
                  () => {
                    reject(
                      new DOMException(
                        "timeout",
                        "AbortError"
                      )
                    );
                  },
                  {
                    once:
                      true,
                  }
                );
              }
            ),
      });

    await assert.rejects(
      () =>
        client.request(
          createApprovalHttpRequest({
            method:
              "GET",

            path:
              "/approval",

            timeoutMs:
              10,
          })
        ),
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
          "timeout"
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
  "base URL must be absolute HTTP or HTTPS",
  () => {
    assert.throws(
      () =>
        createApprovalFetchHttpClient({
          baseUrl:
            "/api",
        }),
      /valid absolute URL/
    );

    assert.throws(
      () =>
        createApprovalFetchHttpClient({
          baseUrl:
            "ftp://example.test",
        }),
      /HTTP or HTTPS/
    );
  }
);
