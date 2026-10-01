import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/trading/",
    import.meta.url
  );

function source(
  path: string
): string {
  return fs.readFileSync(
    new URL(
      path,
      root
    ),
    "utf8"
  );
}

test(
  "Activity workspace projects runtime sessions and audit",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /runBotRuntimeSession/
    );

    assert.match(
      content,
      /createRuntimeAuditRecord/
    );

    assert.match(
      content,
      /activityFromRuntimeAudit/
    );

    assert.match(
      content,
      /activityFromRuntimeAuditSummary/
    );
  }
);

test(
  "Activity projection uses approved review binding",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /reviewPaperRisk/
    );

    assert.match(
      content,
      /reviewDecision\.approved/
    );

    assert.match(
      content,
      /approval:\s*reviewDecision\.review/
    );
  }
);

test(
  "Activity projection includes resulting paper ledger",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /session\.runtime\.account/
    );

    assert.match(
      content,
      /\.ledger/
    );

    assert.match(
      content,
      /activityFromPaperLedger/
    );
  }
);

test(
  "Activity workspace identifies itself as read only projection",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /READ-ONLY PROJECTION/
    );

    assert.match(
      content,
      /read-only projection/i
    );

    assert.match(
      content,
      /Risk Review remains the approval/
    );
  }
);

test(
  "Activity projection does not call execution boundary directly",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.doesNotMatch(
      content,
      /executePaperOrder/
    );

    assert.doesNotMatch(
      content,
      /fillPaperMarketOrder/
    );

    assert.doesNotMatch(
      content,
      /evaluatePaperRisk/
    );

    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /WebSocket/
    );

    assert.doesNotMatch(
      content,
      /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
    );
  }
);
