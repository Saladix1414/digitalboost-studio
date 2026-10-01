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
  "recovery history is bounded",
  () => {
    const content =
      source(
        "risk/approvalRecoveryAttemptHistory.ts"
      );

    assert.match(
      content,
      /APPROVAL_RECOVERY_HISTORY_LIMIT/
    );

    assert.match(
      content,
      /\.slice\([\s\S]*?-APPROVAL_RECOVERY_HISTORY_LIMIT/
    );
  }
);


test(
  "recovery history contains only completed attempts",
  () => {
    const content =
      source(
        "risk/approvalRecoveryAttemptHistory.ts"
      );

    assert.match(
      content,
      /"succeeded"/
    );

    assert.match(
      content,
      /"failed"/
    );

    assert.doesNotMatch(
      content,
      /"retrying"/
    );
  }
);


test(
  "recovery history is explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/approvalRecoveryAttemptHistory.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative\s*:\s*true/
    );
  }
);


test(
  "approval hook records success and failure outcomes",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /recoveryAttemptHistory/
    );

    assert.match(
      content,
      /appendApprovalRecoveryAttemptHistory/
    );

    assert.match(
      content,
      /status:[\s\S]*?"succeeded"/
    );

    assert.match(
      content,
      /status:[\s\S]*?"failed"/
    );
  }
);


test(
  "recovery history remains in hook memory",
  () => {
    const content =
      source(
        "risk/approvalRecoveryAttemptHistory.ts"
      );

    assert.doesNotMatch(
      content,
      /localStorage/
    );

    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /ApprovalRepositoryPersistence/
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
    `${workspace} exposes recovery history evidence`,
    () => {
      const content =
        source(
          workspace
        );

      assert.match(
        content,
        /RECOVERY HISTORY/
      );

      assert.match(
        content,
        /recoveryAttemptHistory\.entries/
      );

      assert.match(
        content,
        /IN-MEMORY EVIDENCE · NOT AUTHORITY/
      );
    }
  );
}


test(
  "Bot Forge runtime authority remains activeReview",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /approval\s*:\s*activeReview/
    );

    assert.doesNotMatch(
      content,
      /approval\s*:\s*recoveryAttemptHistory/
    );
  }
);
