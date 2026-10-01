import assert from "node:assert/strict";
import test from "node:test";

import {
  createApprovalRemoteComposition,
  installApprovalRemotePersistence,
} from "../../src/trading/risk/approvalRemoteComposition.ts";

import {
  getApprovalStoreLifecycle,
  hydrateApprovalStore,
} from "../../src/trading/risk/approvalStore.ts";


test(
  "remote composition performs full fetch to persistence read flow",
  async () => {
    let requestedUrl =
      "";

    let requestedMethod =
      "";

    const fetchImpl:
      typeof fetch =
        async (
          input,
          init
        ) => {
          requestedUrl =
            String(
              input
            );

          requestedMethod =
            String(
              init?.method
            );

          return new Response(
            JSON.stringify({
              state:
                null,

              revision:
                12,
            }),
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

    const composition =
      createApprovalRemoteComposition({
        baseUrl:
          "https://example.test/api",

        path:
          "/approval",

        timeoutMs:
          5_000,

        fetchImpl,
      });

    const result =
      await composition.persistence.load();

    assert.equal(
      requestedUrl,
      "https://example.test/api/approval"
    );

    assert.equal(
      requestedMethod,
      "GET"
    );

    assert.equal(
      result.revision,
      12
    );

    assert.equal(
      result.authoritative,
      false
    );

    assert.equal(
      composition.authoritative,
      false
    );

    assert.equal(
      composition.mode,
      "remote"
    );
  }
);


test(
  "remote composition write flows through complete adapter chain",
  async () => {
    let requestBody:
      unknown =
        null;

    const fetchImpl:
      typeof fetch =
        async (
          _input,
          init
        ) => {
          requestBody =
            JSON.parse(
              String(
                init?.body ??
                "{}"
              )
            );

          return new Response(
            JSON.stringify({
              revision:
                4,
            }),
            {
              status:
                200,
            }
          );
        };

    const composition =
      createApprovalRemoteComposition({
        baseUrl:
          "https://example.test",

        fetchImpl,
      });

    const state = {
      active:
        null,

      history:
        null,

      authoritative:
        false as const,
    };

    const result =
      await composition.persistence.save(
        state,
        3
      );

    assert.equal(
      result.revision,
      4
    );

    assert.deepEqual(
      requestBody,
      {
        state: {
          active:
            null,

          history:
            null,

          authoritative:
            false,
        },

        expectedRevision:
          3,

        idempotencyKey:
          null,
      }
    );
  }
);


test(
  "remote composition clear flows through complete adapter chain",
  async () => {
    let receivedMethod =
      "";

    let requestBody:
      unknown =
        null;

    const fetchImpl:
      typeof fetch =
        async (
          _input,
          init
        ) => {
          receivedMethod =
            String(
              init?.method
            );

          requestBody =
            JSON.parse(
              String(
                init?.body ??
                "{}"
              )
            );

          return new Response(
            null,
            {
              status:
                204,
            }
          );
        };

    const composition =
      createApprovalRemoteComposition({
        baseUrl:
          "https://example.test",

        fetchImpl,
      });

    await composition.persistence.clear(
      9
    );

    assert.equal(
      receivedMethod,
      "DELETE"
    );

    assert.deepEqual(
      requestBody,
      {
        expectedRevision:
          9,

        idempotencyKey:
          null,
      }
    );
  }
);


test(
  "install is explicit and hydration is a separate operation",
  async () => {
    let readCount =
      0;

    const fetchImpl:
      typeof fetch =
        async () => {
          readCount +=
            1;

          return new Response(
            JSON.stringify({
              state:
                null,

              revision:
                null,
            }),
            {
              status:
                200,
            }
          );
        };

    const composition =
      createApprovalRemoteComposition({
        baseUrl:
          "https://example.test",

        fetchImpl,
      });

    installApprovalRemotePersistence(
      composition
    );

    assert.equal(
      readCount,
      0
    );

    await hydrateApprovalStore();

    assert.equal(
      readCount,
      1
    );

    assert.equal(
      getApprovalStoreLifecycle().status,
      "ready"
    );
  }
);


test(
  "composition configuration forwards custom path and timeout",
  async () => {
    let requestedUrl =
      "";

    let capturedSignal:
      AbortSignal | null =
        null;

    const fetchImpl:
      typeof fetch =
        async (
          input,
          init
        ) => {
          requestedUrl =
            String(
              input
            );

          capturedSignal =
            init?.signal instanceof
              AbortSignal
              ? init.signal
              : null;

          return new Response(
            JSON.stringify({
              state:
                null,

              revision:
                null,
            }),
            {
              status:
                200,
            }
          );
        };

    const composition =
      createApprovalRemoteComposition({
        baseUrl:
          "https://example.test/root",

        path:
          "/v2/approval",

        timeoutMs:
          3_000,

        fetchImpl,
      });

    await composition.persistence.load();

    assert.equal(
      requestedUrl,
      "https://example.test/root/v2/approval"
    );

    assert.ok(
      capturedSignal instanceof
        AbortSignal
    );
  }
);
