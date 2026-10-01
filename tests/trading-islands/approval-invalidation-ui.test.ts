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
  "review freshness compares stored and current binding fingerprints",
  () => {
    const content =
      source(
        "risk/reviewStatus.ts"
      );

    assert.match(
      content,
      /createRuntimeBindingFingerprint/
    );

    assert.match(
      content,
      /review\.bindingFingerprint !==/
    );

    assert.match(
      content,
      /freshness:\s*"stale"/
    );

    assert.match(
      content,
      /freshness:\s*"current"/
    );
  }
);

test(
  "stale reviews require a new review",
  () => {
    const content =
      source(
        "risk/reviewStatus.ts"
      );

    assert.match(
      content,
      /reviewRequired:\s*true/
    );

    assert.match(
      content,
      /configuration changed/
    );
  }
);

test(
  "Risk Review UI exposes freshness and review required state",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /Review freshness/
    );

    assert.match(
      content,
      /CURRENT/
    );

    assert.match(
      content,
      /STALE/
    );

    assert.match(
      content,
      /REVIEW REQUIRED/
    );
  }
);

test(
  "Bot Forge exposes approval integrity before runtime use",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /Approval Integrity/
    );

    assert.match(
      content,
      /Runtime eligibility/
    );

    assert.match(
      content,
      /PAPER ELIGIBLE/
    );

    assert.match(
      content,
      /REVIEW REQUIRED/
    );
  }
);

test(
  "freshness layer cannot execute or access external systems",
  () => {
    const content =
      source(
        "risk/reviewStatus.ts"
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
      /binance|bybit|okx/i
    );

    assert.doesNotMatch(
      content,
      /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
    );
  }
);
