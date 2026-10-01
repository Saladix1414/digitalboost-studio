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
  "backend persistence boundary defines explicit read write and clear contracts",
  () => {
    const content =
      source(
        "risk/remoteApprovalPersistence.ts"
      );

    assert.match(
      content,
      /interface ApprovalBackendClient/
    );

    assert.match(
      content,
      /read\(\)/
    );

    assert.match(
      content,
      /write\(/
    );

    assert.match(
      content,
      /clear\(/
    );
  }
);


test(
  "backend writes require an expected revision",
  () => {
    const content =
      source(
        "risk/remoteApprovalPersistence.ts"
      );

    assert.match(
      content,
      /ApprovalBackendWriteInput/
    );

    assert.match(
      content,
      /expectedRevision:[\s\S]*?ApprovalPersistenceRevision \| null/
    );
  }
);


test(
  "backend clear is revision aware",
  () => {
    const content =
      source(
        "risk/remoteApprovalPersistence.ts"
      );

    assert.match(
      content,
      /ApprovalBackendClearInput/
    );

    assert.match(
      content,
      /client\.clear\(\{[\s\S]*?expectedRevision/
    );
  }
);


test(
  "remote boundary adapts into existing persistence port",
  () => {
    const content =
      source(
        "risk/remoteApprovalPersistence.ts"
      );

    assert.match(
      content,
      /createRemoteApprovalPersistence/
    );

    assert.match(
      content,
      /ApprovalRepositoryPersistence/
    );

    assert.match(
      content,
      /client\.read\(\)/
    );

    assert.match(
      content,
      /client\.write\(\{/
    );
  }
);


test(
  "backend boundary remains explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/remoteApprovalPersistence.ts"
      );

    const matches =
      content.match(
        /authoritative:[\s\S]{0,40}?false/g
      );

    assert.ok(
      matches &&
      matches.length >=
        4
    );
  }
);


test(
  "backend boundary contains no concrete transport",
  () => {
    const content =
      source(
        "risk/remoteApprovalPersistence.ts"
      );

    assert.doesNotMatch(
      content,
      /\bfetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /XMLHttpRequest/
    );

    assert.doesNotMatch(
      content,
      /WebSocket/
    );

    assert.doesNotMatch(
      content,
      /axios/i
    );

    assert.doesNotMatch(
      content,
      /https?:\/\//
    );
  }
);


test(
  "backend boundary contains no credentials or browser storage",
  () => {
    const content =
      source(
        "risk/remoteApprovalPersistence.ts"
      );

    assert.doesNotMatch(
      content,
      /localStorage/
    );

    assert.doesNotMatch(
      content,
      /sessionStorage/
    );

    assert.doesNotMatch(
      content,
      /api[_-]?key/i
    );

    assert.doesNotMatch(
      content,
      /authorization/i
    );

    assert.doesNotMatch(
      content,
      /bearer/i
    );
  }
);


test(
  "backend persistence cannot execute trading runtime",
  () => {
    const content =
      source(
        "risk/remoteApprovalPersistence.ts"
      );

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
      /runBotRuntimeSession/
    );

    assert.doesNotMatch(
      content,
      /fillPaperMarketOrder/
    );
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
      /approval:\s*ApprovalBackend/
    );

    assert.doesNotMatch(
      bot,
      /approval:\s*remoteApproval/
    );
  }
);
