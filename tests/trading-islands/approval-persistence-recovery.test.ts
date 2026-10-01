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
  "approval store exposes controlled persistence recovery",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /recoverApprovalStorePersistence/
    );

    assert.match(
      content,
      /await clearApprovalStorePersistence/
    );

    assert.match(
      content,
      /await hydrateApprovalStore/
    );

    assert.match(
      content,
      /lifecycle\.status ===[\s\S]*?"ready"/
    );
  }
);

test(
  "failed clear prevents recovery from pretending success",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /lifecycle\.status ===[\s\S]*?"error"[\s\S]*?return false/
    );
  }
);

test(
  "recovery is exposed through shared React hook",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /recoverApprovalStorePersistence/
    );

    assert.match(
      content,
      /recoverPersistence/
    );
  }
);

test(
  "Risk Review exposes corruption recovery only for lifecycle error",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /approvalLifecycle\.status === "error"/
    );

    assert.match(
      content,
      /RESET APPROVAL STORAGE/
    );

    assert.match(
      content,
      /recoverApprovalPersistence/
    );
  }
);

test(
  "Bot Forge exposes corruption recovery only for lifecycle error",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /approvalLifecycle\.status === "error"/
    );

    assert.match(
      content,
      /RESET APPROVAL STORAGE/
    );

    assert.match(
      content,
      /recoverApprovalPersistence/
    );
  }
);

test(
  "recovery does not bypass governance hydration gate",
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
        /approvalStoreReady/
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

    assert.doesNotMatch(
      bot,
      /approval:\s*recover/
    );
  }
);

test(
  "recovery remains local and cannot execute",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
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
  }
);
