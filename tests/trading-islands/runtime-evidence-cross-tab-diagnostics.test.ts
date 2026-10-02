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
  "store exposes non authoritative coordination health",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryStore.ts"
      );

    assert.match(
      content,
      /RuntimeEvidenceReconciliationHistoryCoordinationHealth/
    );

    assert.match(
      content,
      /coordinationHealthSnapshot/
    );

    assert.match(
      content,
      /refreshCoordinationHealthSnapshot/
    );

    assert.match(
      content,
      /return coordinationHealthSnapshot/
    );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);


test(
  "Activity renders dedicated cross tab diagnostics",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /RuntimeEvidenceCrossTabDiagnostics/
    );

    assert.match(
      content,
      /<RuntimeEvidenceCrossTabDiagnostics\s*\/>/
    );
  }
);


test(
  "cross tab diagnostics observe store only",
  () => {
    const content =
      source(
        "activity/RuntimeEvidenceCrossTabDiagnostics.tsx"
      );

    assert.match(
      content,
      /useSyncExternalStore/
    );

    assert.match(
      content,
      /subscribeRuntimeEvidenceReconciliationHistory/
    );

    assert.match(
      content,
      /getRuntimeEvidenceReconciliationHistoryCoordinationHealth/
    );

    assert.match(
      content,
      /observational only/i
    );

    for (
      const forbidden of [
        "reconcileStaleRuntimeEvidence",
        "recordRuntimeEvidenceReconciliationAttempt",
        "hydrateRuntimeEvidenceReconciliationHistory",
        "persistRuntimeEvidenceReconciliationHistory",
        "runBotRuntimeSession",
        "executePaperOrder",
        "createRiskReview",
        "approveRiskReview",
      ]
    ) {
      assert.doesNotMatch(
        content,
        new RegExp(
          forbidden
        )
      );
    }
  }
);


test(
  "Bot Forge remains independent from diagnostics",
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
      /CrossTabDiagnostics|CoordinationHealth|externalChangeDetected|crossContextSafe/
    );
  }
);
