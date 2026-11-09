import assert from "node:assert/strict";

import {
  spawnSync,
} from "node:child_process";

import test from "node:test";


test(
  "reconciliation history refresh scenarios pass",
  () => {
    const result =
      spawnSync(
        process.execPath,
        [
          "--experimental-strip-types",
          "--import",
          "./tests/trading-islands/helpers/ts-register.mjs",
          "--test",
          "tests/trading-islands/runtime-evidence-reconciliation-history-refresh-runtime.scenario.ts",
        ],
        {
          cwd:
            process.cwd(),

          encoding:
            "utf8",

          env: { ...process.env, NODE_TEST_CONTEXT: undefined },
        }
      );

    if (
      result.stdout
    ) {
      process.stdout.write(
        result.stdout
      );
    }

    if (
      result.stderr
    ) {
      process.stderr.write(
        result.stderr
      );
    }

    assert.equal(
      result.status,
      0
    );
  }
);
