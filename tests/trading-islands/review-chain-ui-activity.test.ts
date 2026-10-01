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
  "Risk Review exposes global chain integrity",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /validateRiskReviewChain/
    );

    assert.match(
      content,
      /CHAIN VALID/
    );

    assert.match(
      content,
      /CHAIN BROKEN/
    );

    assert.match(
      content,
      /checkedEntries/
    );
  }
);

test(
  "Bot Forge exposes chain integrity while active review remains authority",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /validateRiskReviewChain/
    );

    assert.match(
      content,
      /CHAIN VALID/
    );

    assert.match(
      content,
      /approval:\s*activeReview/
    );

    assert.doesNotMatch(
      content,
      /approval:\s*chainIntegrity/
    );
  }
);

test(
  "activity builder projects review chain integrity",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    assert.match(
      content,
      /activityFromReviewChainIntegrity/
    );

    assert.match(
      content,
      /validateRiskReviewChain/
    );

    assert.match(
      content,
      /Risk review chain valid/
    );

    assert.match(
      content,
      /Risk review chain broken/
    );

    assert.match(
      content,
      /authority:\s*"none"/
    );
  }
);

test(
  "Activity workspace projects actual review history chain",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );



    assert.match(
      content,
      /activityFromReviewChainIntegrity/
    );
  }
);

test(
  "chain integrity activity treats broken chain as invalid evidence",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    assert.match(
      content,
      /INVALID EVIDENCE/
    );

    assert.match(
      content,
      /"danger"/
    );
  }
);

test(
  "chain integrity activity cannot execute or access external systems",
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
  }
);

test(
  "Activity workspace projects chain integrity from actual repository history",
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
      /activityFromReviewChainIntegrity/
    );

    assert.doesNotMatch(
      content,
      /createRiskReviewHistory/
    );

    assert.doesNotMatch(
      content,
      /appendRiskReviewHistory/
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
