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
      /VersionedRiskReview/
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
      /createInitialVersionedReview/
    );

    assert.match(
      content,
      /createNextVersionedReview/
    );

    assert.match(
      content,
      /activityFromReviewHistoryEntry/
    );
  }
);

test(
  "runtime approval still uses current approved review not history projection",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /approval:\s*reviewDecision\.review/
    );

    assert.doesNotMatch(
      content,
      /approval:\s*initialVersion/
    );

    assert.doesNotMatch(
      content,
      /approval:\s*replacementVersion/
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
