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
  "Risk Review consumes approval lifecycle",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /lifecycle:\s*approvalLifecycle/
    );

    assert.match(
      content,
      /approvalLifecycle\.status/
    );

    assert.match(
      content,
      /const approvalStoreReady/
    );
  }
);

test(
  "Risk Review acceptance is hydration gated",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /acceptCandidateReview[\s\S]*?!approvalStoreReady/
    );

    assert.match(
      content,
      /acceptReview/
    );
  }
);

test(
  "Bot Forge consumes approval lifecycle",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /lifecycle:\s*approvalLifecycle/
    );

    assert.match(
      content,
      /approvalLifecycle\.status/
    );

    assert.match(
      content,
      /const approvalStoreReady/
    );
  }
);

test(
  "Bot Forge acceptance is hydration gated",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /acceptCandidateReview[\s\S]*?!approvalStoreReady/
    );
  }
);

test(
  "Bot Forge runtime session is hydration gated",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /runLocalSession[\s\S]*?!approvalStoreReady/
    );

    assert.match(
      content,
      /approval:\s*activeReview/
    );
  }
);

test(
  "hydration state is visible in governance UI",
  () => {
    const sources = [
      source(
        "risk/RiskReviewWorkspace.tsx"
      ),
      source(
        "bots/BotForgeWorkspace.tsx"
      ),
    ];

    for (
      const content of sources
    ) {
      assert.match(
        content,
        /Approval Store Lifecycle/
      );

      assert.match(
        content,
        /GOVERNANCE READY/
      );

      assert.match(
        content,
        /GOVERNANCE LOCKED/
      );
    }
  }
);

test(
  "hydration lifecycle cannot become runtime approval",
  () => {
    const risk =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    const bot =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    for (
      const content of [
        risk,
        bot,
      ]
    ) {
      assert.doesNotMatch(
        content,
        /approval:\s*approvalLifecycle/
      );

      assert.doesNotMatch(
        content,
        /approval:\s*approvalStoreReady/
      );
    }

    assert.match(
      bot,
      /approval:\s*activeReview/
    );
  }
);
