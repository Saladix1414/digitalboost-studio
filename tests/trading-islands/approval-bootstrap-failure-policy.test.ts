import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/trading/",
    import.meta.url
  );

function source(
  path:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      path,
      root
    ),
    "utf8"
  );
}


test(
  "bootstrap failure policy explicitly forbids persistence fallback",
  () => {
    const content =
      source(
        "risk/approvalBootstrapFailurePolicy.ts"
      );

    assert.match(
      content,
      /fallbackMode:[\s\S]*?null/
    );

    assert.doesNotMatch(
      content,
      /fallbackMode\s*:\s*"local"/
    );
  }
);


test(
  "remote bootstrap failure requires manual rehydrate",
  () => {
    const content =
      source(
        "risk/approvalBootstrapFailurePolicy.ts"
      );

    assert.match(
      content,
      /mode ===[\s\S]*?"remote"/
    );

    assert.match(
      content,
      /recovery:[\s\S]*?"manual-rehydrate"/
    );

    assert.match(
      content,
      /clearOnFailure:[\s\S]*?false/
    );
  }
);


test(
  "remote bootstrap does not automatically retry",
  () => {
    const content =
      source(
        "risk/approvalBootstrapFailurePolicy.ts"
      );

    assert.match(
      content,
      /automaticRetry:[\s\S]*?false/
    );

    assert.doesNotMatch(
      content,
      /setInterval/
    );

    assert.doesNotMatch(
      content,
      /setTimeout/
    );
  }
);


test(
  "local corruption recovery remains explicit",
  () => {
    const content =
      source(
        "risk/approvalBootstrapFailurePolicy.ts"
      );

    assert.match(
      content,
      /"clear-and-rehydrate"/
    );

    assert.match(
      content,
      /clearOnFailure:[\s\S]*?true/
    );
  }
);


test(
  "failure policy is non authoritative",
  () => {
    const content =
      source(
        "risk/approvalBootstrapFailurePolicy.ts"
      );

    assert.match(
      content,
      /authoritative:[\s\S]*?false/
    );

    assert.doesNotMatch(
      content,
      /authoritative\s*:\s*true/
    );
  }
);


test(
  "React hook exposes selected mode and bootstrap policy",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /browserPersistenceMode/
    );

    assert.match(
      content,
      /browserBootstrapFailurePolicy/
    );

    assert.match(
      content,
      /persistenceMode:/
    );

    assert.match(
      content,
      /bootstrapFailurePolicy:/
    );
  }
);


test(
  "selected mode comes from validated persistence selection",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /browserPersistenceMode\s*=[\s\S]*?persistenceSelection\.mode/
    );

    assert.match(
      content,
      /createApprovalBootstrapFailurePolicy\([\s\S]*?persistenceSelection\.mode/
    );
  }
);


test(
  "governance workspaces remain gated on ready lifecycle",
  () => {
    const risk =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    const bot =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      risk,
      /approvalLifecycle\.status\s*===\s*"ready"/
    );

    assert.match(
      bot,
      /approvalLifecycle\.status\s*===\s*"ready"/
    );
  }
);


test(
  "bootstrap policy cannot execute trading",
  () => {
    const content =
      source(
        "risk/approvalBootstrapFailurePolicy.ts"
      );

    for (
      const pattern of [
        /executePaperOrder/,
        /fillPaperMarketOrder/,
        /runBotRuntimeStep/,
        /runBotRuntimeSession/,
      ]
    ) {
      assert.doesNotMatch(
        content,
        pattern
      );
    }
  }
);


test(
  "Bot Forge runtime authority remains active review",
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
      /approval:\s*bootstrapFailurePolicy/
    );
  }
);
