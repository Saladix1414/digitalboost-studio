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
  "shared approval store owns one repository snapshot",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /let state:/
    );

    assert.match(
      content,
      /ApprovalRepositoryState/
    );

    assert.match(
      content,
      /getApprovalStoreSnapshot/
    );

    assert.match(
      content,
      /subscribeApprovalStore/
    );
  }
);

test(
  "shared store initializes repository only when no active review exists",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /bootstrapApprovalStore/
    );

    assert.match(
      content,
      /state\.active/
    );

    assert.match(
      content,
      /createApprovalRepositoryState/
    );
  }
);

test(
  "shared store delegates accepted reviews to repository domain",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /acceptApprovalStoreReview/
    );

    assert.match(
      content,
      /acceptRiskReview/
    );
  }
);

test(
  "Risk Review consumes shared approval repository",
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
      /approvalRepository\.active/
    );

    assert.match(
      content,
      /approvalRepository\.history/
    );

    assert.doesNotMatch(
      content,
      /setActiveReviewVersion/
    );

    assert.doesNotMatch(
      content,
      /setReviewHistory/
    );
  }
);

test(
  "Bot Forge consumes the same shared approval repository",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /useApprovalRepositoryStore/
    );

    assert.match(
      content,
      /approvalRepository\.active/
    );

    assert.match(
      content,
      /approvalRepository\.history/
    );

    assert.match(
      content,
      /approval:\s*activeReview/
    );

    assert.doesNotMatch(
      content,
      /setActiveReviewVersion/
    );

    assert.doesNotMatch(
      content,
      /setReviewHistory/
    );
  }
);

test(
  "shared approval store cannot execute or access external systems",
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
