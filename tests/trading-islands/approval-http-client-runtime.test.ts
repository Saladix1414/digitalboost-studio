import assert from "node:assert/strict";
import {
  spawnSync,
} from "node:child_process";
import test from "node:test";

test(
  "approval HTTP client runtime scenarios pass",
  () => {
    const result =
      spawnSync(
        process.execPath,
        [
          "--experimental-strip-types",
          "--experimental-loader",
          "./tests/trading-islands/helpers/ts-extension-loader.mjs",
          "--test",
          "tests/trading-islands/approval-http-client-runtime.scenario.ts",
        ],
        {
          cwd:
            process.cwd(),

          encoding:
            "utf8",

          env:
            process.env,
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
      0,
      [
        "Approval HTTP client runtime scenarios failed.",
        result.stderr,
        result.stdout,
      ]
        .filter(
          Boolean
        )
        .join(
          "\n"
        )
    );
  }
);
