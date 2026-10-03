import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workspace =
  fs.readFileSync(
    "src/trading/activity/ActivityWorkspace.tsx",
    "utf8"
  );

test(
  "Activity Workspace subscribes to shared unified event store",
  () => {
    assert.match(
      workspace,
      /subscribeTradingActivityStore/
    );

    assert.match(
      workspace,
      /getTradingActivityStore/
    );

    assert.match(
      workspace,
      /useSyncExternalStore/
    );

    assert.match(
      workspace,
      /unifiedEvents=\{unifiedActivityStore\.events\}/
    );
  }
);

test(
  "Activity Workspace still consumes historical evidence",
  () => {
    assert.match(
      workspace,
      /remoteRetryHistory/
    );

    assert.match(
      workspace,
      /recoveryAttemptHistory/
    );

    assert.match(
      workspace,
      /runtimeEvidenceHistory/
    );

    assert.match(
      workspace,
      /approvalRepository\.history/
    );
  }
);
