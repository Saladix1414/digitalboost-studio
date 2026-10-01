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
  "recovery presentation defines local reset and remote retry",
  () => {
    const content =
      source(
        "risk/approvalRecoveryAction.ts"
      );

    assert.match(
      content,
      /"reset-local-storage"/
    );

    assert.match(
      content,
      /"retry-remote-state"/
    );

    assert.match(
      content,
      /"RESET APPROVAL STORAGE"/
    );

    assert.match(
      content,
      /"RETRY REMOTE APPROVAL STATE"/
    );
  }
);


test(
  "remote recovery presentation cannot clear persistence",
  () => {
    const content =
      source(
        "risk/approvalRecoveryAction.ts"
      );

    const match =
      content.match(
        /if\s*\([\s\S]*?policy\.mode[\s\S]*?"remote"[\s\S]*?\)\s*\{[\s\S]*?return\s*\{([\s\S]*?)\};/
      );

    assert.ok(
      match
    );

    assert.match(
      match[1],
      /action\s*:[\s\S]*?"retry-remote-state"/
    );

    assert.match(
      match[1],
      /clearsPersistence\s*:[\s\S]*?false/
    );
  }
);


test(
  "recovery presentation is never authoritative",
  () => {
    const content =
      source(
        "risk/approvalRecoveryAction.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative\s*:\s*true/
    );
  }
);


for (
  const workspace of [
    "risk/RiskReviewWorkspace.tsx",
    "bots/BotForgeWorkspace.tsx",
  ]
) {
  test(
    `${workspace} exposes mode-aware recovery`,
    () => {
      const content =
        source(
          workspace
        );

      assert.match(
        content,
        /bootstrapFailurePolicy/
      );

      assert.match(
        content,
        /persistenceMode/
      );

      assert.match(
        content,
        /resolveApprovalRecoveryPresentation/
      );

      assert.match(
        content,
        /handleApprovalPersistenceRecovery/
      );

      assert.match(
        content,
        /approvalRecoveryPresentation\.label/
      );
    }
  );


  test(
    `${workspace} remote branch hydrates before local recovery`,
    () => {
      const content =
        source(
          workspace
        );

      const handler =
        content.match(
          /const\s+handleApprovalPersistenceRecovery\s*=[\s\S]*?async\s*\(\)\s*=>\s*\{([\s\S]*?)\n\s*\};/
        );

      assert.ok(
        handler
      );

      assert.match(
        handler[1],
        /persistenceMode\s*===[\s\S]*?"remote"/
      );

      assert.match(
        handler[1],
        /"remote"[\s\S]*?await[\s\S]*?\(\)[\s\S]*?return;/
      );
    }
  );


  test(
    `${workspace} recovery remains error gated`,
    () => {
      const content =
        source(
          workspace
        );

      assert.match(
        content,
        /approvalLifecycle\.status\s*!==[\s\S]*?"error"/
      );

      assert.match(
        content,
        /approvalLifecycle\.status\s*===\s*"ready"/
      );
    }
  );
}


test(
  "Bot Forge runtime authority remains activeReview",
  () => {
    const bot =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      bot,
      /approval\s*:\s*activeReview/
    );

    assert.doesNotMatch(
      bot,
      /approval\s*:\s*approvalRecoveryPresentation/
    );
  }
);
