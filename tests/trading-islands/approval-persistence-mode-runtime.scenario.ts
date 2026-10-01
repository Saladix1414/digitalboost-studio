import assert from "node:assert/strict";
import test from "node:test";

import {
  createDefaultApprovalPersistenceConfig,
  selectApprovalPersistence,
} from "../../src/trading/risk/approvalPersistenceMode.ts";


test(
  "default configuration is local",
  () => {
    const config =
      createDefaultApprovalPersistenceConfig();

    assert.deepEqual(
      config,
      {
        mode:
          "local",
      }
    );
  }
);


test(
  "local selection creates non authoritative local persistence",
  async () => {
    const descriptor =
      Object.getOwnPropertyDescriptor(
        globalThis,
        "window"
      );

    const storage =
      new Map<
        string,
        string
      >();

    try {
      Object.defineProperty(
        globalThis,
        "window",
        {
          configurable:
            true,

          value: {
            localStorage: {
              getItem(
                key:
                  string
              ) {
                return (
                  storage.get(
                    key
                  ) ??
                  null
                );
              },

              setItem(
                key:
                  string,
                value:
                  string
              ) {
                storage.set(
                  key,
                  value
                );
              },

              removeItem(
                key:
                  string
              ) {
                storage.delete(
                  key
                );
              },
            },
          },
        }
      );

      const selection =
        selectApprovalPersistence({
          mode:
            "local",
        });

      assert.equal(
        selection.mode,
        "local"
      );

      assert.equal(
        selection.authoritative,
        false
      );

      const loaded =
        await selection.persistence.load();

      assert.equal(
        loaded.state,
        null
      );
    } finally {
      if (
        descriptor
      ) {
        Object.defineProperty(
          globalThis,
          "window",
          descriptor
        );
      } else {
        delete (
          globalThis as {
            window?:
              unknown;
          }
        ).window;
      }
    }
  }
);


test(
  "remote selection requires a configured base URL",
  () => {
    assert.throws(
      () =>
        selectApprovalPersistence({
          mode:
            "remote",

          baseUrl:
            "   ",
        }),
      /requires baseUrl/
    );
  }
);


test(
  "remote selection does not silently fall back to local persistence",
  () => {
    assert.throws(
      () =>
        selectApprovalPersistence({
          mode:
            "remote",

          baseUrl:
            "not-a-url",
        }),
      /valid absolute URL/
    );
  }
);


test(
  "remote selection creates complete remote persistence chain",
  async () => {
    let requested =
      false;

    const fetchImpl:
      typeof fetch =
        async () => {
          requested =
            true;

          return new Response(
            JSON.stringify({
              state:
                null,

              revision:
                21,
            }),
            {
              status:
                200,
            }
          );
        };

    const selection =
      selectApprovalPersistence({
        mode:
          "remote",

        baseUrl:
          "https://example.test",

        fetchImpl,
      });

    assert.equal(
      selection.mode,
      "remote"
    );

    assert.equal(
      selection.authoritative,
      false
    );

    const loaded =
      await selection.persistence.load();

    assert.equal(
      requested,
      true
    );

    assert.equal(
      loaded.revision,
      21
    );
  }
);


test(
  "remote configuration forwards custom path",
  async () => {
    let url =
      "";

    const selection =
      selectApprovalPersistence({
        mode:
          "remote",

        baseUrl:
          "https://example.test/root",

        path:
          "/v3/approval",

        fetchImpl:
          async (
            input
          ) => {
            url =
              String(
                input
              );

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
          },
      });

    await selection.persistence.load();

    assert.equal(
      url,
      "https://example.test/root/v3/approval"
    );
  }
);
