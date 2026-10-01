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
  "activity domain has explicit remote retry source",
  () => {
    const content =
      source(
        "activity/types.ts"
      );

    assert.match(
      content,
      /"remote-retry"/
    );
  }
);


test(
  "retry history builder projects evidence without authority",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    assert.match(
      content,
      /activityFromRemoteRetryHistoryEntry/
    );

    assert.match(
      content,
      /source:[\s\S]*?"remote-retry"/
    );

    assert.match(
      content,
      /authority:[\s\S]*?"none"/
    );

    assert.match(
      content,
      /entry\.idempotencyProtected/
    );

    assert.match(
      content,
      /entry\.reason/
    );
  }
);


test(
  "activity workspace projects shared retry history",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /remoteRetryHistory/
    );

    assert.match(
      content,
      /remoteRetryHistory\.entries/
    );

    assert.match(
      content,
      /activityFromRemoteRetryHistoryEntry/
    );
  }
);


test(
  "activity does not manufacture retry history",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.doesNotMatch(
      content,
      /createApprovalRemoteRetryHistory/
    );

    assert.doesNotMatch(
      content,
      /appendApprovalRemoteRetryHistory/
    );

    assert.doesNotMatch(
      content,
      /recordApprovalRemoteRetryAttempt/
    );

    assert.doesNotMatch(
      content,
      /runApprovalRemoteMutationWithRetry/
    );
  }
);


test(
  "recovery activity uses canonical TradingActivityItem message field",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    const start =
      content.indexOf(
        "activityFromRecoveryAttemptHistoryEntry"
      );

    assert.notEqual(
      start,
      -1
    );

    const section =
      content.slice(
        start,
        content.indexOf(
          "activityFromRemoteRetryHistoryEntry",
          start
        )
      );

    assert.match(
      section,
      /message:/
    );

    assert.doesNotMatch(
      section,
      /\bdetail:/
    );
  }
);
