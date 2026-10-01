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
  "review history entries project into activity",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    assert.match(
      content,
      /activityFromReviewHistoryEntry/
    );

    assert.match(
      content,
      /RiskReviewHistoryEntry/
    );

    assert.match(
      content,
      /Risk review v/
    );
  }
);

test(
  "review history activity is explicitly non authoritative",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    const start =
      content.indexOf(
        "activityFromReviewHistoryEntry"
      );

    assert.ok(
      start >= 0
    );

    const block =
      content.slice(
        start
      );

    assert.match(
      block,
      /authority:\s*"none"/
    );
  }
);

test(
  "Activity workspace projects initial and replacement review evidence",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );



    assert.match(
      content,
      /activityFromReviewHistoryEntry/
    );
  }
);

test(
  "Activity history projection never becomes runtime approval",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.doesNotMatch(
      content,
      /approval:\s*/
    );

    assert.doesNotMatch(
      content,
      /reviewDecision/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeSession/
    );

    assert.match(
      content,
      /approvalRepository\.history/
    );
  }
);

test(
  "review history projection cannot execute or access external systems",
  () => {
    const content =
      source(
        "activity/builders.ts"
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
      /runBotRuntimeStep/
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

test(
  "Activity workspace projects actual repository review history",
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

    assert.doesNotMatch(
      content,
      /createInitialVersionedReview/
    );

    assert.doesNotMatch(
      content,
      /createNextVersionedReview/
    );

    assert.doesNotMatch(
      content,
      /initialHistoryEntry/
    );

    assert.doesNotMatch(
      content,
      /replacementHistoryEntry/
    );
  }
);
