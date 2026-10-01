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
  "persistence mode is explicitly local or remote",
  () => {
    const content =
      source(
        "risk/approvalPersistenceMode.ts"
      );

    assert.match(
      content,
      /"local"/
    );

    assert.match(
      content,
      /"remote"/
    );

    assert.match(
      content,
      /ApprovalPersistenceMode/
    );
  }
);


test(
  "default approval persistence mode remains local",
  () => {
    const content =
      source(
        "risk/approvalPersistenceMode.ts"
      );

    assert.match(
      content,
      /createDefaultApprovalPersistenceConfig/
    );

    assert.match(
      content,
      /mode:[\s\S]*?"local"/
    );
  }
);


test(
  "local and remote modes have distinct configuration contracts",
  () => {
    const content =
      source(
        "risk/approvalPersistenceMode.ts"
      );

    assert.match(
      content,
      /ApprovalLocalPersistenceConfig/
    );

    assert.match(
      content,
      /ApprovalRemotePersistenceConfig/
    );

    assert.match(
      content,
      /readonly baseUrl:/
    );
  }
);


test(
  "remote mode requires base URL rather than silently falling back",
  () => {
    const content =
      source(
        "risk/approvalPersistenceMode.ts"
      );

    assert.match(
      content,
      /assertRemoteBaseUrl/
    );

    assert.match(
      content,
      /requires baseUrl/
    );

    assert.doesNotMatch(
      content,
      /catch[\s\S]*?mode:[\s\S]*?"local"/
    );
  }
);


test(
  "mode selector chooses local browser persistence explicitly",
  () => {
    const content =
      source(
        "risk/approvalPersistenceMode.ts"
      );

    assert.match(
      content,
      /createBrowserApprovalPersistence/
    );

    assert.match(
      content,
      /config\.mode ===[\s\S]*?"local"/
    );
  }
);


test(
  "mode selector chooses remote composition explicitly",
  () => {
    const content =
      source(
        "risk/approvalPersistenceMode.ts"
      );

    assert.match(
      content,
      /createApprovalRemoteComposition/
    );

    assert.match(
      content,
      /composition\.persistence/
    );
  }
);


test(
  "selection metadata remains non authoritative",
  () => {
    const content =
      source(
        "risk/approvalPersistenceMode.ts"
      );

    assert.match(
      content,
      /authoritative:[\s\S]*?false/
    );

    assert.doesNotMatch(
      content,
      /authoritative:[\s\S]*?true/
    );
  }
);


test(
  "React approval bootstrap uses explicit default mode selection",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /createDefaultApprovalPersistenceConfig/
    );

    assert.match(
      content,
      /selectApprovalPersistence/
    );

    assert.match(
      content,
      /persistenceSelection\.persistence/
    );
  }
);


test(
  "React bootstrap does not activate remote composition directly",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.doesNotMatch(
      content,
      /createApprovalRemoteComposition/
    );

    assert.doesNotMatch(
      content,
      /installApprovalRemotePersistence/
    );
  }
);


test(
  "mode selection contains no execution authority",
  () => {
    const content =
      source(
        "risk/approvalPersistenceMode.ts"
      );

    for (
      const pattern of [
        /executePaperOrder/,
        /fillPaperMarketOrder/,
        /runBotRuntimeStep/,
        /runBotRuntimeSession/,
        /RiskReview/,
        /bindingFingerprint/,
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
      /approval:\s*persistenceSelection/
    );
  }
);
