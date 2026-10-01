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
  "recovery attempts define explicit lifecycle states",
  () => {
    const content =
      source(
        "risk/approvalRecoveryAttempt.ts"
      );

    for (
      const state of [
        "idle",
        "retrying",
        "succeeded",
        "failed",
      ]
    ) {
      assert.match(
        content,
        new RegExp(state)
      );
    }
  }
);


test(
  "recovery attempts distinguish rehydrate and local recovery",
  () => {
    const content =
      source(
        "risk/approvalRecoveryAttempt.ts"
      );

    assert.match(
      content,
      /"rehydrate"/
    );

    assert.match(
      content,
      /"recover-local"/
    );
  }
);


test(
  "recovery attempt state is explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/approvalRecoveryAttempt.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative\s*:\s*true/
    );
  }
);


test(
  "approval hook prevents concurrent recovery attempts",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /recoveryAttemptInFlight/
    );

    assert.match(
      content,
      /recoveryAttemptInFlight\.current/
    );

    assert.match(
      content,
      /runRecoveryAttempt/
    );
  }
);


test(
  "approval hook derives recovery result from lifecycle and diagnostics",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /getApprovalStoreLifecycle/
    );

    assert.match(
      content,
      /getApprovalRecoveryDiagnostic/
    );

    assert.match(
      content,
      /completeApprovalRecoveryAttempt/
    );

    assert.match(
      content,
      /failApprovalRecoveryAttempt/
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
    `${workspace} displays recovery attempt feedback`,
    () => {
      const content =
        source(
          workspace
        );

      assert.match(
        content,
        /RECOVERY ATTEMPT/
      );

      assert.match(
        content,
        /recoveryAttempt\.status/
      );

      assert.match(
        content,
        /recoveryAttempt\.action/
      );

      assert.match(
        content,
        /recoveryAttempt\.diagnosticCode/
      );

      assert.match(
        content,
        /OBSERVATIONAL ONLY/
      );
    }
  );


  test(
    `${workspace} disables recovery while retrying`,
    () => {
      const content =
        source(
          workspace
        );

      assert.match(
        content,
        /recoveryAttempt\.status\s*===\s*"retrying"/
      );

      assert.match(
        content,
        /disabled=\{[\s\S]*?approvalRecoveryEligibility\.allowed[\s\S]*?recoveryAttempt\.status/
      );
    }
  );


  test(
    `${workspace} routes recovery through controlled attempt executor`,
    () => {
      const content =
        source(
          workspace
        );

      assert.match(
        content,
        /runRecoveryAttempt\([\s\S]*?"rehydrate"/
      );

      assert.match(
        content,
        /runRecoveryAttempt\([\s\S]*?"recover-local"/
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
      /approval\s*:\s*recoveryAttempt/
    );
  }
);
