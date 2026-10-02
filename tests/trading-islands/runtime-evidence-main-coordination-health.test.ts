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
  "main runtime store exposes non authoritative coordination health",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    assert.match(
      content,
      /export type RuntimeEvidenceCoordinationHealth/
    );

    assert.match(
      content,
      /getRuntimeEvidenceCoordinationHealth/
    );

    assert.match(
      content,
      /crossContextSafe:\s*coordinator\.crossContextSafe/
    );

    assert.doesNotMatch(
      content,
      /RuntimeEvidenceCoordinationHealth[\s\S]{0,300}authoritative:\s*true/
    );
  }
);


test(
  "Activity exposes main runtime coordination degradation",
  () => {
    const content =
      source(
        "activity/RuntimeEvidenceDiagnostics.tsx"
      );

    assert.match(
      content,
      /getRuntimeEvidenceCoordinationHealth/
    );

    assert.match(
      content,
      /coordinationHealth\.crossContextSafe/
    );

    assert.match(
      content,
      /Web Locks are unavailable/
    );
  }
);


test(
  "main coordination diagnostics remain observational",
  () => {
    const content =
      source(
        "activity/RuntimeEvidenceDiagnostics.tsx"
      );

    assert.doesNotMatch(
      content,
      /approveRiskReview|runBotRuntimeSession|executePaperOrder|createRiskReview/
    );
  }
);
