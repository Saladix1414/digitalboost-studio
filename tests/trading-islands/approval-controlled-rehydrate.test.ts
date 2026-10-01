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
  "Risk Review exposes explicit stale rehydrate action",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /hydrate:\s*rehydrateApprovalStore/
    );

    assert.match(
      content,
      /reloadApprovalState/
    );

    assert.match(
      content,
      /approvalLifecycle\.status !==[\s\S]*?"stale"/
    );

    assert.match(
      content,
      /await rehydrateApprovalStore/
    );

    assert.match(
      content,
      /RELOAD APPROVAL STATE/
    );
  }
);

test(
  "Bot Forge exposes explicit stale rehydrate action",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /hydrate:\s*rehydrateApprovalStore/
    );

    assert.match(
      content,
      /reloadApprovalState/
    );

    assert.match(
      content,
      /approvalLifecycle\.status !==[\s\S]*?"stale"/
    );

    assert.match(
      content,
      /await rehydrateApprovalStore/
    );

    assert.match(
      content,
      /RELOAD APPROVAL STATE/
    );
  }
);

test(
  "reload action is rendered only for stale lifecycle",
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
        /approvalLifecycle\.status === "stale"[\s\S]*?RELOAD APPROVAL STATE/
      );
    }
  }
);

test(
  "stale governance remains locked until lifecycle returns ready",
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
        /approvalLifecycle\.status ===[\s\S]*?"ready"/
      );

      assert.match(
        content,
        /!approvalStoreReady/
      );
    }
  }
);

test(
  "controlled rehydrate does not clear persisted approval state",
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
      const start =
        content.indexOf(
          "const reloadApprovalState"
        );

      const end =
        content.indexOf(
          "const recoverApprovalPersistence",
          start
        );

      assert.ok(
        start >= 0
      );

      const block =
        content.slice(
          start,
          end >= 0
            ? end
            : undefined
        );

      assert.match(
        block,
        /rehydrateApprovalStore/
      );

      assert.doesNotMatch(
        block,
        /recoverPersistence/
      );

      assert.doesNotMatch(
        block,
        /clearApproval/
      );
    }
  }
);

test(
  "rehydrate path cannot become runtime authority",
  () => {
    const bot =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      bot,
      /approval:\s*activeReview/
    );

    assert.doesNotMatch(
      bot,
      /approval:\s*reloadApprovalState/
    );

    assert.doesNotMatch(
      bot,
      /approval:\s*rehydrateApprovalStore/
    );
  }
);
