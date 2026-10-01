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
  "approval repository owns active review and history state",
  () => {
    const content =
      source(
        "risk/reviewRepository.ts"
      );

    assert.match(
      content,
      /ApprovalRepositoryState/
    );

    assert.match(
      content,
      /readonly active:/
    );

    assert.match(
      content,
      /readonly history:/
    );
  }
);

test(
  "approval repository can initialize first accepted review",
  () => {
    const content =
      source(
        "risk/reviewRepository.ts"
      );

    assert.match(
      content,
      /createApprovalRepositoryState/
    );

    assert.match(
      content,
      /createInitialVersionedReview/
    );

    assert.match(
      content,
      /"initial-review"/
    );

    assert.match(
      content,
      /createRiskReviewHistory/
    );
  }
);

test(
  "accepting a later review creates next version and provenance",
  () => {
    const content =
      source(
        "risk/reviewRepository.ts"
      );

    assert.match(
      content,
      /acceptRiskReview/
    );

    assert.match(
      content,
      /createNextVersionedReview/
    );

    assert.match(
      content,
      /"explicit-rereview"/
    );

    assert.match(
      content,
      /appendRiskReviewHistory/
    );
  }
);

test(
  "repository exposes active RiskReview explicitly",
  () => {
    const content =
      source(
        "risk/reviewRepository.ts"
      );

    assert.match(
      content,
      /getActiveRiskReview/
    );

    assert.match(
      content,
      /state\.active\?\.review/
    );
  }
);

test(
  "repository state is explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/reviewRepository.ts"
      );

    assert.match(
      content,
      /authoritative:\s*false/
    );
  }
);

test(
  "approval repository cannot execute or access external systems",
  () => {
    const content =
      source(
        "risk/reviewRepository.ts"
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
      /binance|bybit|okx|coinbase|kraken/i
    );

    assert.doesNotMatch(
      content,
      /DigitalBoostPulse|from\s+["'][^"']*\/pulse(?:\/|["'])|data-pulse|\.pulse-/i
    );
  }
);
