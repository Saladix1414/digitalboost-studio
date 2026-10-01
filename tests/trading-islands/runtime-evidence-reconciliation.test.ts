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
  "runtime evidence reconciliation is an isolated pure policy",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliation.ts"
      );

    for (
      const token of [
        "reconcileRuntimeEvidenceHistories",
        "RuntimeEvidenceReconciliationResult",
        "RUNTIME_EVIDENCE_HISTORY_LIMIT",
        "session-content-mismatch",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          token
        )
      );
    }

    assert.doesNotMatch(
      content,
      /localStorage|sessionStorage|indexedDB|StorageEvent|window\./
    );

    assert.doesNotMatch(
      content,
      /fetch\(|WebSocket|BroadcastChannel/
    );
  }
);


test(
  "reconciliation deduplicates by session identity",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliation.ts"
      );

    assert.match(
      content,
      /Map</
    );

    assert.match(
      content,
      /bundle\.sessionId/
    );

    assert.match(
      content,
      /duplicateSessionIds/
    );
  }
);


test(
  "same session with different evidence becomes explicit conflict",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliation.ts"
      );

    assert.match(
      content,
      /runtimeEvidenceBundlesEqual/
    );

    assert.match(
      content,
      /status:\s*"conflict"/
    );

    assert.match(
      content,
      /session-content-mismatch/
    );
  }
);


test(
  "reconciliation result stays bounded deterministic and non authoritative",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliation.ts"
      );

    assert.match(
      content,
      /\.sort\(/
    );

    assert.match(
      content,
      /-RUNTIME_EVIDENCE_HISTORY_LIMIT/
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
  "reconciliation cannot approve or execute trading",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliation.ts"
      );

    assert.doesNotMatch(
      content,
      /RiskReview|activeReview|approvedFor|approvalVerified/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeSession|runBotRuntimeStep|executePaperOrder|fillPaperMarketOrder/
    );
  }
);


test(
  "browser bootstrap does not automatically reconcile",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceBrowserBootstrap.ts"
      );

    assert.doesNotMatch(
      content,
      /reconcileRuntimeEvidenceHistories/
    );
  }
);
