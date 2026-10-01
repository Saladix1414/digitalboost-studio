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
  "recovery eligibility distinguishes local and remote recovery",
  () => {
    const content =
      source(
        "risk/approvalRecoveryEligibility.ts"
      );

    assert.match(
      content,
      /"local-reset"/
    );

    assert.match(
      content,
      /"retryable-remote-failure"/
    );

    assert.match(
      content,
      /"non-retryable-remote-failure"/
    );

    assert.match(
      content,
      /"missing-remote-diagnostic"/
    );
  }
);


test(
  "remote retry requires retryable diagnostic",
  () => {
    const content =
      source(
        "risk/approvalRecoveryEligibility.ts"
      );

    assert.match(
      content,
      /diagnostic\.retryable/
    );

    assert.match(
      content,
      /allowed:[\s\S]*?true/
    );

    assert.match(
      content,
      /allowed:[\s\S]*?false/
    );
  }
);


test(
  "eligibility is explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/approvalRecoveryEligibility.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative\s*:\s*true/
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
    `${workspace} derives recovery eligibility`,
    () => {
      const content =
        source(
          workspace
        );

      assert.match(
        content,
        /resolveApprovalRecoveryEligibility/
      );

      assert.match(
        content,
        /approvalRecoveryEligibility/
      );

      assert.match(
        content,
        /recoveryDiagnostic/
      );
    }
  );


  test(
    `${workspace} blocks recovery handler when retry is not eligible`,
    () => {
      const content =
        source(
          workspace
        );

      assert.match(
        content,
        /!approvalRecoveryEligibility\.allowed[\s\S]*?return;/
      );
    }
  );


  test(
    `${workspace} disables blocked recovery action`,
    () => {
      const content =
        source(
          workspace
        );

      assert.match(
        content,
        /disabled=\{[\s\S]*?!approvalRecoveryEligibility\.allowed[\s\S]*?recoveryAttempt\.status\s*===\s*"retrying"[\s\S]*?\}/
      );

      assert.match(
        content,
        /!approvalRecoveryEligibility\.allowed[\s\S]*?return;/
      );

      assert.match(
        content,
        /RETRY BLOCKED/
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
      /approval\s*:\s*approvalRecoveryEligibility/
    );
  }
);


test(
  "retry eligibility cannot execute trading",
  () => {
    const content =
      source(
        "risk/approvalRecoveryEligibility.ts"
      );

    for (
      const pattern of [
        /executePaperOrder/,
        /fillPaperMarketOrder/,
        /runBotRuntimeStep/,
        /runBotRuntimeSession/,
      ]
    ) {
      assert.doesNotMatch(
        content,
        pattern
      );
    }
  }
);
