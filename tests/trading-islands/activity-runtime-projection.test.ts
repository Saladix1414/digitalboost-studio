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
  "Activity workspace does not manufacture runtime sessions",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    for (
      const forbidden of [
        /runBotRuntimeSession/,
        /runBotRuntimeStep/,
        /createRuntimeAuditRecord/,
        /createPaperAccount/,
        /evaluateStrategy/,
        /indicatorEngine/,
        /localHistoricalData/,
      ]
    ) {
      assert.doesNotMatch(
        content,
        forbidden
      );
    }
  }
);


test(
  "Activity workspace does not manufacture approval reviews",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.doesNotMatch(
      content,
      /reviewPaperRisk/
    );

    assert.doesNotMatch(
      content,
      /reviewDecision/
    );

    assert.doesNotMatch(
      content,
      /approval:\s*reviewDecision\.review/
    );

    assert.doesNotMatch(
      content,
      /activityFromRiskReview/
    );
  }
);


test(
  "Activity projects actual repository review evidence",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /approvalRepository\.history/
    );

    assert.match(
      content,
      /approvalRepository\.history\.entries/
    );

    assert.match(
      content,
      /activityFromReviewHistoryEntry/
    );

    assert.match(
      content,
      /activityFromReviewChainIntegrity/
    );
  }
);


test(
  "Activity projects shared recovery and retry evidence",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /recoveryAttemptHistory\.entries/
    );

    assert.match(
      content,
      /remoteRetryHistory\.entries/
    );

    assert.match(
      content,
      /activityFromRecoveryAttemptHistoryEntry/
    );

    assert.match(
      content,
      /activityFromRemoteRetryHistoryEntry/
    );
  }
);


test(
  "Activity remains a read only projection",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /READ-ONLY PROJECTION/
    );

    for (
      const forbidden of [
        /executePaperOrder/,
        /fillPaperMarketOrder/,
        /fetch\s*\(/,
        /WebSocket/,
        /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i,
      ]
    ) {
      assert.doesNotMatch(
        content,
        forbidden
      );
    }
  }
);
