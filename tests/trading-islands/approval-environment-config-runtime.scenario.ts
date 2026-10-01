import assert from "node:assert/strict";
import test from "node:test";

import {
  APPROVAL_ENV_KEYS,
  parseApprovalEnvironmentConfig,
} from "../../src/trading/risk/approvalEnvironmentConfig.ts";


test(
  "empty environment defaults to local persistence",
  () => {
    const config =
      parseApprovalEnvironmentConfig(
        {}
      );

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
  "explicit local mode ignores remote-only values",
  () => {
    const config =
      parseApprovalEnvironmentConfig({
        [APPROVAL_ENV_KEYS.mode]:
          "local",

        [APPROVAL_ENV_KEYS.baseUrl]:
          "https://unused.example.test",

        [APPROVAL_ENV_KEYS.timeoutMs]:
          "5000",
      });

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
  "remote environment produces validated remote config",
  () => {
    const config =
      parseApprovalEnvironmentConfig({
        [APPROVAL_ENV_KEYS.mode]:
          "remote",

        [APPROVAL_ENV_KEYS.baseUrl]:
          "https://example.test/api",

        [APPROVAL_ENV_KEYS.path]:
          "/v1/approval",

        [APPROVAL_ENV_KEYS.timeoutMs]:
          "3500",
      });

    assert.deepEqual(
      config,
      {
        mode:
          "remote",

        baseUrl:
          "https://example.test/api",

        path:
          "/v1/approval",

        timeoutMs:
          3500,
      }
    );
  }
);


test(
  "remote mode without base URL fails instead of falling back local",
  () => {
    assert.throws(
      () =>
        parseApprovalEnvironmentConfig({
          [APPROVAL_ENV_KEYS.mode]:
            "remote",
        }),
      /requires VITE_TRADING_APPROVAL_BASE_URL/
    );
  }
);


test(
  "invalid mode is rejected",
  () => {
    assert.throws(
      () =>
        parseApprovalEnvironmentConfig({
          [APPROVAL_ENV_KEYS.mode]:
            "automatic",
        }),
      /Invalid approval persistence mode/
    );
  }
);


test(
  "invalid timeout is rejected",
  () => {
    assert.throws(
      () =>
        parseApprovalEnvironmentConfig({
          [APPROVAL_ENV_KEYS.mode]:
            "remote",

          [APPROVAL_ENV_KEYS.baseUrl]:
            "https://example.test",

          [APPROVAL_ENV_KEYS.timeoutMs]:
            "0",
        }),
      /positive integer/
    );

    assert.throws(
      () =>
        parseApprovalEnvironmentConfig({
          [APPROVAL_ENV_KEYS.mode]:
            "remote",

          [APPROVAL_ENV_KEYS.baseUrl]:
            "https://example.test",

          [APPROVAL_ENV_KEYS.timeoutMs]:
            "abc",
        }),
      /positive integer/
    );
  }
);


test(
  "absolute or protocol-relative path is rejected",
  () => {
    assert.throws(
      () =>
        parseApprovalEnvironmentConfig({
          [APPROVAL_ENV_KEYS.mode]:
            "remote",

          [APPROVAL_ENV_KEYS.baseUrl]:
            "https://example.test",

          [APPROVAL_ENV_KEYS.path]:
            "approval",
        }),
      /must be relative/
    );

    assert.throws(
      () =>
        parseApprovalEnvironmentConfig({
          [APPROVAL_ENV_KEYS.mode]:
            "remote",

          [APPROVAL_ENV_KEYS.baseUrl]:
            "https://example.test",

          [APPROVAL_ENV_KEYS.path]:
            "//other.example.test/approval",
        }),
      /protocol-relative/
    );
  }
);


test(
  "remote base URL requires HTTP or HTTPS",
  () => {
    assert.throws(
      () =>
        parseApprovalEnvironmentConfig({
          [APPROVAL_ENV_KEYS.mode]:
            "remote",

          [APPROVAL_ENV_KEYS.baseUrl]:
            "ftp://example.test",
        }),
      /HTTP or HTTPS/
    );
  }
);


test(
  "boolean Vite metadata values are ignored as configuration strings",
  () => {
    const config =
      parseApprovalEnvironmentConfig({
        DEV:
          true,

        PROD:
          false,
      });

    assert.deepEqual(
      config,
      {
        mode:
          "local",
      }
    );
  }
);
