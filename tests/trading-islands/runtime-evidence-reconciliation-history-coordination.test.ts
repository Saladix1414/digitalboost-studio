import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";


function source(
  path:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      `../../src/trading/${path}`,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "history coordinator is non authoritative",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryCoordination.ts"
      );

    assert.match(
      content,
      /crossContextSafe/
    );

    assert.match(
      content,
      /navigator/
    );

    assert.match(
      content,
      /locks/
    );

    assert.match(
      content,
      /authoritative:\s*false/
    );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);


test(
  "history merge is a pure three way append merge",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryMerge.ts"
      );

    assert.match(
      content,
      /base/
    );

    assert.match(
      content,
      /local/
    );

    assert.match(
      content,
      /remote/
    );

    assert.match(
      content,
      /base-diverged/
    );

    assert.doesNotMatch(
      content,
      /localStorage|navigator|window|runBotRuntimeSession/
    );
  }
);
