import assert from "node:assert/strict";
import {
  spawnSync,
} from "node:child_process";
import test from "node:test";


test(
  "coordinated persistence conflict durability scenario passes",
  () => {
    const result =
      spawnSync(
        process.execPath,
        [
          "--experimental-strip-types",
          "--experimental-loader",
          "./tests/trading-islands/helpers/ts-extension-loader.mjs",
          "--test",
          "tests/trading-islands/runtime-evidence-persistence-conflict-history-runtime.scenario.ts",
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
      0
    );
  }
);
