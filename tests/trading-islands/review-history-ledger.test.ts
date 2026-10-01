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
  "review history retains ordered versioned entries",
  () => {
    const content =
      source(
        "risk/reviewHistory.ts"
      );

    assert.match(
      content,
      /entries/
    );

    assert.match(
      content,
      /\.\.\.history\.entries/
    );

    assert.match(
      content,
      /next/
    );
  }
);

test(
  "review history is explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/reviewHistory.ts"
      );

    assert.match(
      content,
      /authoritative:\s*false/
    );
  }
);

test(
  "Risk Review workspace appends accepted reviews to history",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /useApprovalRepositoryStore/
    );

    assert.match(
      content,
      /approvalRepository\.history/
    );

    assert.match(
      content,
      /Review History/
    );

    assert.match(
      content,
      /evidence only/i
    );
  }
);

test(
  "Bot Forge retains review history while runtime uses active review",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /reviewHistory/
    );

    assert.match(
      content,
      /appendRiskReviewHistory/
    );

    assert.match(
      content,
      /approval:\s*activeReview/
    );

    assert.doesNotMatch(
      content,
      /approval:\s*reviewHistory/
    );
  }
);

test(
  "review history cannot execute or access external systems",
  () => {
    const content =
      source(
        "risk/reviewHistory.ts"
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
      /runBotRuntime/
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
