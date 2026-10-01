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


for (
  const workspace of [
    "risk/RiskReviewWorkspace.tsx",
    "bots/BotForgeWorkspace.tsx",
  ]
) {
  test(
    `${workspace} exposes retry evidence in diagnostics`,
    () => {
      const content =
        source(
          workspace
        );

      assert.match(
        content,
        /remoteRetryHistory/
      );

      assert.match(
        content,
        /latestRemoteRetryEvent/
      );

      assert.match(
        content,
        /Retry events/
      );

      assert.match(
        content,
        /Last remote operation/
      );

      assert.match(
        content,
        /Last retry state/
      );

      assert.match(
        content,
        /Retry reason/
      );

      assert.match(
        content,
        /Idempotency/
      );
    }
  );


  test(
    `${workspace} keeps retry evidence observational`,
    () => {
      const content =
        source(
          workspace
        );

      assert.doesNotMatch(
        content,
        /onClick[\s\S]{0,300}?remoteRetryHistory/
      );

      assert.doesNotMatch(
        content,
        /runApprovalRemoteMutationWithRetry/
      );

      assert.doesNotMatch(
        content,
        /recordApprovalRemoteRetryAttempt/
      );

      assert.doesNotMatch(
        content,
        /createApprovalRemoteRetryHistory/
      );
    }
  );
}
