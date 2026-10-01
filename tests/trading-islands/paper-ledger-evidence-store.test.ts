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
  "paper ledger evidence store preserves session correlation",
  () => {
    const content =
      source(
        "paper/paperLedgerEvidenceStore.ts"
      );

    for (
      const token of [
        "sessionId",
        "botId",
        "strategyId",
        "PaperLedgerEntry",
        "PAPER_LEDGER_EVIDENCE_LIMIT",
        "recordPaperLedgerEvidence",
        "subscribePaperLedgerEvidence",
        "getPaperLedgerEvidence",
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
      /authoritative:\s*false/
    );
  }
);


test(
  "paper ledger evidence store has no authority or external side effects",
  () => {
    const content =
      source(
        "paper/paperLedgerEvidenceStore.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      content,
      /fetch\s*\(|WebSocket|localStorage|sessionStorage/
    );

    assert.doesNotMatch(
      content,
      /executePaperOrder|fillPaperMarketOrder/
    );
  }
);


test(
  "runtime evidence bundle captures ledger from completed runtime session",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    assert.match(
      content,
      /createRuntimeEvidenceBundle/
    );

    assert.match(
      content,
      /result\.runtime\.account\.ledger/
    );

    assert.match(
      content,
      /result\.session\.id/
    );

    assert.match(
      content,
      /recordRuntimeSessionEvidence/
    );

    assert.match(
      content,
      /ledger/
    );
  }
);


test(
  "Activity consumes ledger through unified runtime evidence without executing paper orders",
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
      /activityFromPaperLedgerEvidence/
    );

    assert.doesNotMatch(
      content,
      /executePaperOrder|fillPaperMarketOrder|runBotRuntimeSession/
    );
  }
);


test(
  "ledger activity builder preserves runtime correlation",
  () => {
    const content =
      source(
        "activity/builders.ts"
      );

    assert.match(
      content,
      /activityFromPaperLedgerEvidence/
    );

    assert.match(
      content,
      /evidence\.sessionId/
    );

    assert.match(
      content,
      /evidence\.botId/
    );

    assert.match(
      content,
      /evidence\.strategyId/
    );

    assert.match(
      content,
      /authority:\s*"none"/
    );
  }
);
