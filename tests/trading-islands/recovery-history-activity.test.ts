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
  "recovery history store is shared observational state",
  () => {
    const content =
      source(
        "risk/approvalRecoveryAttemptHistoryStore.ts"
      );

    assert.match(
      content,
      /getApprovalRecoveryAttemptHistory/
    );

    assert.match(
      content,
      /subscribeApprovalRecoveryAttemptHistory/
    );

    assert.match(
      content,
      /recordApprovalRecoveryAttemptHistory/
    );

    assert.doesNotMatch(
      content,
      /localStorage|sessionStorage|fetch\s*\(/
    );
  }
);


test(
  "approval hook consumes shared recovery history",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /subscribeApprovalRecoveryAttemptHistory/
    );

    assert.match(
      content,
      /getApprovalRecoveryAttemptHistory/
    );

    assert.match(
      content,
      /recordApprovalRecoveryAttemptHistory/
    );

    assert.doesNotMatch(
      content,
      /setRecoveryAttemptHistory/
    );
  }
);


test(
  "activity source includes recovery",
  () => {
    assert.match(
      source(
        "activity/types.ts"
      ),
      /"recovery"/
    );
  }
);


test(
  "recovery attempt history projects to activity",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    assert.match(
      content,
      /activityFromRecoveryAttemptHistoryEntry/
    );

    assert.match(
      content,
      /source:[\s\S]*?"recovery"/
    );
  }
);


test(
  "Activity consumes actual approval and recovery history",
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
      /recoveryAttemptHistory\.entries/
    );

    assert.match(
      content,
      /activityFromRecoveryAttemptHistoryEntry/
    );
  }
);


test(
  "Activity does not manufacture review history",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    for (
      const forbidden of [
        /createInitialVersionedReview/,
        /createNextVersionedReview/,
        /createRiskReviewProvenance/,
        /initialHistoryEntry/,
        /replacementHistoryEntry/,
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
  "recovery evidence cannot become approval authority",
  () => {
    assert.doesNotMatch(
      source(
        "activity/ActivityWorkspace.tsx"
      ),
      /approval\s*:\s*recoveryAttemptHistory/
    );
  }
);
