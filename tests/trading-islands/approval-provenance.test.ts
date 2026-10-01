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
  "approval provenance records source creation reason and superseded review",
  () => {
    const content =
      source(
        "risk/reviewProvenance.ts"
      );

    for (
      const token of [
        "source",
        "createdFrom",
        "supersedes",
        "bindingFingerprint",
        "version",
      ]
    ) {
      assert.match(
        content,
        new RegExp(token)
      );
    }
  }
);

test(
  "approval provenance is explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/reviewProvenance.ts"
      );

    assert.match(
      content,
      /authoritative:\s*false/
    );
  }
);

test(
  "review history pairs accepted review with provenance",
  () => {
    const content =
      source(
        "risk/reviewHistory.ts"
      );

    assert.match(
      content,
      /RiskReviewHistoryEntry/
    );

    assert.match(
      content,
      /versionedReview/
    );

    assert.match(
      content,
      /provenance/
    );
  }
);

test(
  "Risk Review workspace records its provenance source",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /createRiskReviewProvenance/
    );

    assert.match(
      content,
      /"risk-review-workspace"/
    );

    assert.match(
      content,
      /"explicit-rereview"/
    );
  }
);

test(
  "Bot Forge records its provenance source",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /createRiskReviewProvenance/
    );

    assert.match(
      content,
      /"bot-forge"/
    );

    assert.match(
      content,
      /"explicit-rereview"/
    );
  }
);

test(
  "provenance cannot execute or access external systems",
  () => {
    const content =
      source(
        "risk/reviewProvenance.ts"
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
      /binance|bybit|okx/i
    );

    assert.doesNotMatch(
      content,
      /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
    );
  }
);
