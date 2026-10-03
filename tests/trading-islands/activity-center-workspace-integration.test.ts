import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const workspace =
  fs.readFileSync(
    "src/trading/activity/ActivityWorkspace.tsx",
    "utf8"
  );

const panel =
  fs.readFileSync(
    "src/trading/activity/ActivityCenterPanel.tsx",
    "utf8"
  );

test(
  "workspace mounts unified Activity Center without replacing historical timeline",
  () => {
    assert.match(
      workspace,
      /ActivityCenterPanel/
    );

    assert.match(
      workspace,
      /legacyItems=\{activity\}/
    );

    assert.match(
      workspace,
      /activityFromReviewHistoryEntry/
    );

    assert.match(
      workspace,
      /activityFromRecoveryAttemptHistoryEntry/
    );

    assert.match(
      workspace,
      /activityFromRemoteRetryHistoryEntry/
    );

    assert.match(
      workspace,
      /activityFromRuntimeAudit/
    );
  }
);

test(
  "Activity Center panel exposes interactive model filters",
  () => {
    assert.match(
      panel,
      /useState/
    );

    assert.match(
      panel,
      /"ALL"/
    );

    assert.match(
      panel,
      /"LEGACY"/
    );

    assert.match(
      panel,
      /"UNIFIED"/
    );

    assert.match(
      panel,
      /READ MODEL · NON-AUTHORITATIVE/
    );
  }
);

test(
  "workspace continues consuming shared evidence rather than manufacturing it",
  () => {
    assert.doesNotMatch(
      workspace,
      /createApprovalRemoteRetryHistory/
    );

    assert.doesNotMatch(
      workspace,
      /appendApprovalRemoteRetryHistory/
    );

    assert.doesNotMatch(
      workspace,
      /recordApprovalRemoteRetryAttempt/
    );

    assert.doesNotMatch(
      workspace,
      /runApprovalRemoteMutationWithRetry/
    );
  }
);
