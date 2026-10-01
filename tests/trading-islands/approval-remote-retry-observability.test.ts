import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function source(
  file:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      `../../src/trading/risk/${file}`,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "retry observability has bounded non-authoritative history",
  () => {
    const content =
      source(
        "approvalRemoteRetryHistory.ts"
      );

    assert.match(
      content,
      /APPROVAL_REMOTE_RETRY_HISTORY_LIMIT/
    );

    assert.match(
      content,
      /=\s*24/
    );

    assert.match(
      content,
      /authoritative:[\s\S]*?false/
    );
  }
);


test(
  "retry runner emits attempt retry success and failure evidence",
  () => {
    const content =
      source(
        "approvalRemoteRetry.ts"
      );

    for (
      const status of [
        "attempt",
        "retry",
        "succeeded",
        "failed",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          `"${status}"`
        )
      );
    }

    assert.match(
      content,
      /onEvent\?/
    );
  }
);


test(
  "remote persistence records write and clear retry evidence",
  () => {
    const content =
      source(
        "remoteApprovalPersistence.ts"
      );

    assert.match(
      content,
      /recordApprovalRemoteRetryAttempt/
    );

    assert.match(
      content,
      /recordApprovalRemoteRetryAttempt\([\s\S]*?"write"/
    );

    assert.match(
      content,
      /recordApprovalRemoteRetryAttempt\([\s\S]*?"clear"/
    );
  }
);


test(
  "approval hook exposes shared retry history",
  () => {
    const content =
      source(
        "useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /subscribeApprovalRemoteRetryHistory/
    );

    assert.match(
      content,
      /getApprovalRemoteRetryHistory/
    );

    assert.match(
      content,
      /remoteRetryHistory/
    );
  }
);
