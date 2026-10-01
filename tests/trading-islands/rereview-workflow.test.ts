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
  "Risk Review separates active review from candidate review",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /activeReview/
    );

    assert.match(
      content,
      /candidateDecision/
    );

    assert.match(
      content,
      /Accept new review/
    );
  }
);

test(
  "Bot Forge keeps an active review separately from candidate",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /activeReview/
    );

    assert.match(
      content,
      /candidateReview/
    );

    assert.match(
      content,
      /acceptCandidateReview/
    );
  }
);

test(
  "Bot runtime session receives active review rather than candidate",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /approval:\s*activeReview/
    );

    assert.doesNotMatch(
      content,
      /approval:\s*candidateReview\.review/
    );
  }
);

test(
  "stale active review blocks runtime until rereview",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /reviewFreshness\.reviewRequired/
    );

    assert.match(
      content,
      /explicit new review/i
    );
  }
);

test(
  "rereview UI cannot directly execute",
  () => {
    for (
      const file of [
        "risk/RiskReviewWorkspace.tsx",
        "bots/BotForgeWorkspace.tsx",
      ]
    ) {
      const content =
        source(file);

      assert.doesNotMatch(
        content,
        /fillPaperMarketOrder/
      );

      assert.doesNotMatch(
        content,
        /executePaperOrder/
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
  }
);
