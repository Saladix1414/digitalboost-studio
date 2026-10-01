import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/trading/",
    import.meta.url
  );

function source(
  path:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      path,
      root
    ),
    "utf8"
  );
}


test(
  "recovery diagnostics classify HTTP and backend failures",
  () => {
    const content =
      source(
        "risk/approvalRecoveryDiagnostics.ts"
      );

    assert.match(
      content,
      /ApprovalHttpClientError/
    );

    assert.match(
      content,
      /ApprovalBackendError/
    );

    for (
      const code of [
        "timeout",
        "network",
        "invalid-response",
        "revision-conflict",
        "idempotency-conflict",
        "unavailable",
        "invalid-state",
        "not-found",
        "internal",
        "unknown",
      ]
    ) {
      assert.match(
        content,
        new RegExp(code)
      );
    }
  }
);


test(
  "recovery diagnostic is explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/approvalRecoveryDiagnostics.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative\s*:\s*true/
    );
  }
);


test(
  "store classifies hydration failures",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /getApprovalRecoveryDiagnostic/
    );

    assert.match(
      content,
      /classifyApprovalRecoveryFailure/
    );

    assert.match(
      content,
      /approvalRecoveryDiagnostic/
    );
  }
);


test(
  "hook exposes recovery diagnostic",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /getApprovalRecoveryDiagnostic/
    );

    assert.match(
      content,
      /recoveryDiagnostic/
    );
  }
);


for (
  const workspace of [
    "risk/RiskReviewWorkspace.tsx",
    "bots/BotForgeWorkspace.tsx",
  ]
) {
  test(
    `${workspace} displays diagnostics only for lifecycle error`,
    () => {
      const content =
        source(
          workspace
        );

      assert.match(
        content,
        /RECOVERY DIAGNOSTIC/
      );

      assert.match(
        content,
        /approvalLifecycle\.status\s*===\s*"error"/
      );

      assert.match(
        content,
        /recoveryDiagnostic\.code/
      );

      assert.match(
        content,
        /recoveryDiagnostic\.retryable/
      );

      assert.match(
        content,
        /recoveryDiagnostic\.message/
      );

      assert.match(
        content,
        /EVIDENCE ONLY · NOT AUTHORITY/
      );
    }
  );
}


test(
  "Bot Forge runtime authority remains activeReview",
  () => {
    const bot =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      bot,
      /approval\s*:\s*activeReview/
    );

    assert.doesNotMatch(
      bot,
      /approval\s*:\s*recoveryDiagnostic/
    );
  }
);
