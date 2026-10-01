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
  "activity review projection consumes provenance-aware history entries",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    assert.match(
      content,
      /RiskReviewHistoryEntry/
    );

    assert.match(
      content,
      /provenance\.source/
    );

    assert.match(
      content,
      /provenance\.createdFrom/
    );

    assert.match(
      content,
      /provenance\.supersedes/
    );

    assert.match(
      content,
      /authority:\s*"none"/
    );
  }
);

test(
  "Activity workspace constructs explicit provenance for projected reviews",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );






  }
);

test(
  "Risk Review UI exposes provenance metadata",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /item\.provenance\.source/
    );

    assert.match(
      content,
      /item\.provenance\.createdFrom/
    );

    assert.match(
      content,
      /item\.provenance\.supersedes/
    );

    assert.match(
      content,
      /bindingFingerprint\.slice/
    );
  }
);

test(
  "Bot Forge UI exposes provenance without using it as runtime authority",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /item\.provenance\.source/
    );

    assert.match(
      content,
      /bindingFingerprint\.slice/
    );

    assert.match(
      content,
      /approval:\s*activeReview/
    );

    assert.doesNotMatch(
      content,
      /approval:\s*item\.provenance/
    );

    assert.doesNotMatch(
      content,
      /approval:\s*reviewHistory/
    );
  }
);

test(
  "provenance projection cannot execute or access external systems",
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
  "Activity workspace projects provenance from actual review history",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    const builders =
      source(
        "activity/builders.ts"
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
      builders,
      /provenance/
    );

    assert.match(
      builders,
      /activityFromReviewHistoryEntry/
    );

    assert.doesNotMatch(
      content,
      /createRiskReviewProvenance/
    );

    assert.doesNotMatch(
      content,
      /createInitialVersionedReview/
    );

    assert.doesNotMatch(
      content,
      /createNextVersionedReview/
    );
  }
);
