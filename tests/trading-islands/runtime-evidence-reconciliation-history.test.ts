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
  "reconciliation history is append only bounded evidence",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistory.ts"
      );

    assert.match(
      content,
      /RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT/
    );

    assert.match(
      content,
      /previousSequence/
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
  "reconciliation history distinguishes terminal outcomes",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistory.ts"
      );

    for (
      const status of [
        "merged",
        "conflict",
        "error",
        "unavailable",
        "not-stale",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          `"${status}"`
        )
      );
    }
  }
);


test(
  "controlled reconciliation records terminal evidence",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    assert.match(
      content,
      /recordRuntimeEvidenceReconciliationAttempt/
    );

    assert.match(
      content,
      /status:\s*"merged"/
    );

    assert.match(
      content,
      /status:\s*"conflict"/
    );

    assert.match(
      content,
      /status:\s*"error"/
    );
  }
);


test(
  "Activity projects reconciliation attempt history",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /RuntimeEvidenceReconciliationHistory/
    );

    assert.match(
      content,
      /<RuntimeEvidenceReconciliationHistory\s*\/>/
    );
  }
);


test(
  "reconciliation projection contains no execution or approval path",
  () => {
    const content =
      source(
        "activity/RuntimeEvidenceReconciliationHistory.tsx"
      );

    for (
      const forbidden of [
        "runBotRuntimeSession",
        "executePaperOrder",
        "createRiskReview",
        "approveRiskReview",
        "activeReview",
      ]
    ) {
      assert.doesNotMatch(
        content,
        new RegExp(
          forbidden
        )
      );
    }

    assert.match(
      content,
      /evidence only/i
    );
  }
);


test(
  "Bot Forge remains independent from reconciliation history",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /approval:\s*[\r\n\t ]*activeReview/
    );

    assert.doesNotMatch(
      content,
      /ReconciliationHistory|recordRuntimeEvidenceReconciliationAttempt|getRuntimeEvidenceReconciliationHistory/
    );
  }
);
