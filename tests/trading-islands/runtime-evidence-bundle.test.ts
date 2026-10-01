import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";


function source(
  path:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      `../../src/trading/${path}`,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "runtime evidence bundle owns audit and ledger correlation",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    for (
      const token of [
        "RuntimeEvidenceBundle",
        "sessionId",
        "botId",
        "strategyId",
        "audit",
        "ledger",
        "createRuntimeEvidenceBundle",
        "recordRuntimeSessionEvidence",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          token
        )
      );
    }

    assert.match(
      content,
      /result\.runtime\.account\.ledger/
    );

    assert.match(
      content,
      /createRuntimeAuditRecord/
    );

    assert.match(
      content,
      /authoritative:\s*false/
    );
  }
);


test(
  "Bot Forge publishes one runtime evidence mutation",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /recordRuntimeSessionEvidence/
    );

    assert.doesNotMatch(
      content,
      new RegExp(["recordRuntime", "AuditEvidence"].join(""))
    );

    assert.doesNotMatch(
      content,
      new RegExp(["recordPaper", "LedgerEvidence"].join(""))
    );
  }
);


test(
  "Activity consumes one runtime evidence history",
  () => {
    const content =
      source(
        "activity/ActivityWorkspace.tsx"
      );

    assert.match(
      content,
      /subscribeRuntimeEvidenceHistory/
    );

    assert.match(
      content,
      /getRuntimeEvidenceHistory/
    );

    assert.match(
      content,
      /runtimeEvidenceHistory\.entries/
    );

    assert.match(
      content,
      /bundle\.audit/
    );

    assert.match(
      content,
      /bundle\.ledger/
    );

    assert.doesNotMatch(
      content,
      new RegExp(["subscribeRuntime", "AuditHistory"].join(""))
    );

    assert.doesNotMatch(
      content,
      new RegExp(["subscribePaper", "LedgerEvidence"].join(""))
    );
  }
);


test(
  "unified evidence remains observational only",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeSession|runBotRuntimeStep|executePaperOrder|fillPaperMarketOrder/
    );

    assert.doesNotMatch(
      content,
      /fetch\s*\(|WebSocket|localStorage|sessionStorage/
    );
  }
);
