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
  "Risk Review workspace is wired into risk section",
  () => {
    const workspace =
      source(
        "TradingIslandsWorkspace.tsx"
      );

    assert.match(
      workspace,
      /RiskReviewWorkspace/
    );

    assert.match(
      workspace,
      /activeSection === "risk"/
    );
  }
);

test(
  "Risk Review workspace consumes review domain",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /reviewPaperRisk/
    );

    assert.match(
      content,
      /mockTradingBots/
    );

    assert.match(
      content,
      /mockStrategies/
    );
  }
);

test(
  "Risk Review shows checks limits and approval scope",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /review\.checks/
    );

    assert.match(
      content,
      /maxOrderNotional/
    );

    assert.match(
      content,
      /maxPositionNotional/
    );

    assert.match(
      content,
      /minCashReserve/
    );

    assert.match(
      content,
      /approvedFor/
    );
  }
);

test(
  "Risk Review explicitly cannot execute",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /Execution capability/
    );

    assert.match(
      content,
      /NONE/
    );

    assert.match(
      content,
      /cannot place, fill/
    );
  }
);

test(
  "Risk Review UI has no execution network or PULSE coupling",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.doesNotMatch(
      content,
      /runBotRuntimeStep/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeSession/
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
