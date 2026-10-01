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
  "runtime audit store is shared bounded observational evidence",
  () => {
    const content =
      source(
        "runtime/runtimeAuditStore.ts"
      );

    for (
      const token of [
        "RUNTIME_AUDIT_HISTORY_LIMIT",
        "subscribeRuntimeAuditHistory",
        "getRuntimeAuditHistory",
        "recordRuntimeAuditEvidence",
        "authoritative",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          token
        )
      );
    }

    assert.match(
      content,
      /authoritative:\s*false/
    );

    assert.doesNotMatch(
      content,
      /fetch\s*\(|WebSocket|localStorage|sessionStorage/
    );
  }
);


test(
  "Bot Forge publishes unified evidence after real runtime session creation",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /runBotRuntimeSession/
    );

    assert.match(
      content,
      /createRuntimeAuditRecord/
    );

    assert.match(
      content,
      /recordRuntimeSessionEvidence/
    );

    const runIndex =
      content.indexOf(
        "runBotRuntimeSession("
      );

    const auditIndex =
      content.indexOf(
        "createRuntimeAuditRecord(",
        runIndex
      );

    const recordIndex =
      content.indexOf(
        "recordRuntimeSessionEvidence(",
        auditIndex
      );

    assert.ok(
      runIndex >= 0
    );

    assert.ok(
      auditIndex > runIndex
    );

    assert.ok(
      recordIndex > auditIndex
    );
  }
);


test(
  "Activity subscribes to runtime evidence without executing runtime",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
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
      /getRuntimeEvidenceHistory/
    );

    assert.match(
      content,
      /runtimeEvidenceHistory\.entries/
    );

    assert.match(
      content,
      /activityFromRuntimeAudit/
    );

    assert.match(
      content,
      /activityFromRuntimeAuditSummary/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeSession/
    );

    assert.doesNotMatch(
      content,
      /createRuntimeAuditRecord/
    );

    assert.doesNotMatch(
      content,
      /reviewPaperRisk/
    );
  }
);
