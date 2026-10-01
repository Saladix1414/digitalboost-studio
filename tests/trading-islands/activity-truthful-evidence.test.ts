import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const file =
  new URL(
    "../../src/trading/activity/ActivityWorkspace.tsx",
    import.meta.url
  );

function workspace():
  string {
  return fs.readFileSync(
    file,
    "utf8"
  );
}


test(
  "Activity is projection-only and creates no domain evidence",
  () => {
    const content =
      workspace();

    const forbidden = [
      "reviewPaperRisk",
      "reviewDecision",
      "runBotRuntimeSession",
      "runBotRuntimeStep",
      "createRuntimeAuditRecord",
      "createPaperAccount",
      "evaluateStrategy",
      "localHistoricalData",
      "indicatorEngine",
      "mockTradingBots",
      "mockStrategies",
      "activityFromRiskReview",
      "activityFromRuntimeAudit",
      "activityFromRuntimeAuditSummary",
      "activityFromPaperLedger",
    ];

    for (
      const token of
      forbidden
    ) {
      assert.doesNotMatch(
        content,
        new RegExp(
          token
        ),
        `Activity must not create synthetic evidence through ${token}.`
      );
    }
  }
);


test(
  "Activity consumes only shared recorded evidence sources",
  () => {
    const content =
      workspace();

    for (
      const token of [
        "approvalRepository.history",
        "approvalRepository.history.entries",
        "recoveryAttemptHistory.entries",
        "remoteRetryHistory.entries",
        "activityFromReviewHistoryEntry",
        "activityFromReviewChainIntegrity",
        "activityFromRecoveryAttemptHistoryEntry",
        "activityFromRemoteRetryHistoryEntry",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          token.replace(
            ".",
            "\\."
          )
        )
      );
    }
  }
);


test(
  "Activity cannot execute or access external systems",
  () => {
    const content =
      workspace();

    for (
      const forbidden of [
        /executePaperOrder/,
        /fillPaperMarketOrder/,
        /fetch\s*\(/,
        /WebSocket/,
        /localStorage/,
        /sessionStorage/,
      ]
    ) {
      assert.doesNotMatch(
        content,
        forbidden
      );
    }
  }
);
