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
  "approval lifecycle supports stale state",
  () => {
    const content =
      source(
        "risk/approvalPersistence.ts"
      );

    assert.match(
      content,
      /\| "stale"/
    );
  }
);

test(
  "shared store can mark externally changed state as stale",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /markApprovalStoreStale/
    );

    assert.match(
      content,
      /status:[\s\S]*?"stale"/
    );

    assert.match(
      content,
      /Rehydration is required/
    );

    assert.match(
      content,
      /authoritative:[\s\S]*?false/
    );
  }
);

test(
  "React integration listens for storage changes",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /APPROVAL_STORAGE_KEY/
    );

    assert.match(
      content,
      /StorageEvent/
    );

    assert.match(
      content,
      /window\.addEventListener\([\s\S]*?"storage"/
    );

    assert.match(
      content,
      /window\.removeEventListener\([\s\S]*?"storage"/
    );
  }
);

test(
  "unrelated storage keys do not stale approval governance",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /event\.key !==[\s\S]*?APPROVAL_STORAGE_KEY/
    );

    assert.match(
      content,
      /return;/
    );
  }
);

test(
  "matching approval storage change marks store stale",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /markApprovalStoreStale/
    );
  }
);

test(
  "stale lifecycle automatically locks governance",
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
      assert.match(
        content,
        /approvalLifecycle\.status ===[\s\S]*?"ready"/
      );

      assert.match(
        content,
        /!approvalStoreReady/
      );
    }

    assert.match(
      bot,
      /approval:\s*activeReview/
    );
  }
);

test(
  "cross-tab detection cannot execute or authorize runtime",
  () => {
    const store =
      source(
        "risk/approvalStore.ts"
      );

    const hook =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    for (
      const content of [
        store,
        hook,
      ]
    ) {
      assert.doesNotMatch(
        content,
        /executePaperOrder/
      );

      assert.doesNotMatch(
        content,
        /runBotRuntimeStep/
      );

      assert.doesNotMatch(
        content,
        /WebSocket/
      );
    }

    assert.doesNotMatch(
      hook,
      /approval:\s*markApprovalStoreStale/
    );
  }
);
