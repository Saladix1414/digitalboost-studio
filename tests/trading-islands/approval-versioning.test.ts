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
  "review version domain starts at version one",
  () => {
    const content =
      source(
        "risk/reviewVersion.ts"
      );

    assert.match(
      content,
      /version:\s*1/
    );

    assert.match(
      content,
      /previousReviewId:\s*null/
    );
  }
);

test(
  "next review version increments and links previous review",
  () => {
    const content =
      source(
        "risk/reviewVersion.ts"
      );

    assert.match(
      content,
      /previous\.version \+/
    );

    assert.match(
      content,
      /previous\.review\.id/
    );
  }
);

test(
  "Bot Forge stores active versioned review",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /activeReviewVersion/
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
      /Review version/
    );

    assert.match(
      content,
      /Previous review/
    );
  }
);

test(
  "Risk Review workspace exposes explicit review version",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /activeReviewVersion/
    );

    assert.match(
      content,
      /Review version/
    );

    assert.match(
      content,
      /Previous review/
    );
  }
);

test(
  "review versioning cannot execute or access external systems",
  () => {
    const content =
      source(
        "risk/reviewVersion.ts"
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
