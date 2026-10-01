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
  "Activity renders runtime evidence diagnostics",
  () => {
    const activity =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      activity,
      /RuntimeEvidenceDiagnostics/
    );

    assert.match(
      activity,
      /<RuntimeEvidenceDiagnostics\s*\/>/
    );
  }
);

test(
  "diagnostics observe lifecycle with external store subscription",
  () => {
    const content =
      source(
        "activity/RuntimeEvidenceDiagnostics.tsx"
      );

    assert.match(
      content,
      /useSyncExternalStore/
    );

    assert.match(
      content,
      /subscribeRuntimeEvidenceHistory/
    );

    assert.match(
      content,
      /getRuntimeEvidenceLifecycle/
    );
  }
);

test(
  "diagnostics expose explicit reconciliation only",
  () => {
    const content =
      source(
        "activity/RuntimeEvidenceDiagnostics.tsx"
      );

    assert.match(
      content,
      /reconcileStaleRuntimeEvidence/
    );

    assert.match(
      content,
      /lifecycle\.status ===\s*"stale"/
    );

    assert.match(
      content,
      /Reconcile evidence/
    );
  }
);

test(
  "diagnostics remain observational and contain no execution path",
  () => {
    const content =
      source(
        "activity/RuntimeEvidenceDiagnostics.tsx"
      );

    for (
      const forbidden of [
        "runBotRuntimeSession",
        "runBotRuntimeStep",
        "executePaperOrder",
        "fillPaperMarketOrder",
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

    assert.match(
      content,
      /observational only/i
    );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);

test(
  "Bot Forge remains independent from runtime evidence lifecycle",
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
      /RuntimeEvidenceDiagnostics|reconcileStaleRuntimeEvidence|getRuntimeEvidenceLifecycle/
    );
  }
);

test(
  "storage event handler remains detection only",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceBrowserBootstrap.ts"
      );

    const start =
      content.indexOf(
        "function handleRuntimeEvidenceStorageChange"
      );

    const end =
      content.indexOf(
        "function installRuntimeEvidenceStorageListener",
        start
      );

    assert.ok(
      start >= 0 &&
      end > start
    );

    const handler =
      content.slice(
        start,
        end
      );

    assert.match(
      handler,
      /markRuntimeEvidenceStale/
    );

    assert.doesNotMatch(
      handler,
      /reconcileStaleRuntimeEvidence|hydrateRuntimeEvidence/
    );
  }
);
