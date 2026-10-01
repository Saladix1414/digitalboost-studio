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
  "remote composition assembles fetch HTTP backend and persistence layers",
  () => {
    const content =
      source(
        "risk/approvalRemoteComposition.ts"
      );

    assert.match(
      content,
      /createApprovalFetchHttpClient/
    );

    assert.match(
      content,
      /createApprovalHttpBackendClient/
    );

    assert.match(
      content,
      /createRemoteApprovalPersistence/
    );
  }
);


test(
  "remote composition exposes explicit configuration",
  () => {
    const content =
      source(
        "risk/approvalRemoteComposition.ts"
      );

    assert.match(
      content,
      /ApprovalRemoteCompositionConfig/
    );

    assert.match(
      content,
      /readonly baseUrl:/
    );

    assert.match(
      content,
      /readonly path\?:/
    );

    assert.match(
      content,
      /readonly timeoutMs\?:/
    );

    assert.match(
      content,
      /readonly fetchImpl\?:/
    );
  }
);


test(
  "remote composition can be installed explicitly into approval store",
  () => {
    const content =
      source(
        "risk/approvalRemoteComposition.ts"
      );

    assert.match(
      content,
      /installApprovalRemotePersistence/
    );

    assert.match(
      content,
      /configureApprovalStorePersistence/
    );

    assert.match(
      content,
      /composition\.persistence/
    );
  }
);


test(
  "remote composition installation does not hydrate automatically",
  () => {
    const content =
      source(
        "risk/approvalRemoteComposition.ts"
      );

    assert.doesNotMatch(
      content,
      /hydrateApprovalStore/
    );

    assert.doesNotMatch(
      content,
      /bootstrapApprovalStore/
    );
  }
);


test(
  "remote persistence is not automatically activated by React integration",
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
  "composition root remains explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/approvalRemoteComposition.ts"
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
  "composition root contains no hardcoded server",
  () => {
    const content =
      source(
        "risk/approvalRemoteComposition.ts"
      );

    assert.doesNotMatch(
      content,
      /https?:\/\/[A-Za-z0-9]/
    );

    assert.doesNotMatch(
      content,
      /localhost/
    );

    assert.doesNotMatch(
      content,
      /digitalboost\.(?:com|io|app)/
    );
  }
);


test(
  "composition root contains no credentials",
  () => {
    const content =
      source(
        "risk/approvalRemoteComposition.ts"
      );

    for (
      const pattern of [
        /authorization/i,
        /bearer/i,
        /api[_-]?key/i,
        /secret/i,
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
  "composition root cannot execute trading runtime",
  () => {
    const content =
      source(
        "risk/approvalRemoteComposition.ts"
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
  "Bot Forge authority remains active review",
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
      /approval:\s*ApprovalRemoteComposition/
    );

    assert.doesNotMatch(
      bot,
      /approval:\s*remoteComposition/
    );
  }
);
