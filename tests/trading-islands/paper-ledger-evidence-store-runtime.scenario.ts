import assert from "node:assert/strict";
import test from "node:test";

import {
  PAPER_LEDGER_EVIDENCE_LIMIT,
  getPaperLedgerEvidence,
  recordPaperLedgerEvidence,
  resetPaperLedgerEvidenceForTests,
  subscribePaperLedgerEvidence,
} from "../../src/trading/paper/paperLedgerEvidenceStore.ts";


function ledgerEntry(
  id:
    string
) {
  return {
    id,

    kind:
      "trade" as const,

    amount:
      -100,

    balanceAfter:
      9_900,

    note:
      `Trade ${id}`,
  };
}


test(
  "ledger evidence preserves session bot and strategy correlation",
  () => {
    resetPaperLedgerEvidenceForTests();

    recordPaperLedgerEvidence({
      sessionId:
        "runtime-bot-1-1",

      botId:
        "bot-1",

      strategyId:
        "strategy-1",

      entries: [
        ledgerEntry(
          "paper-ledger-1"
        ),
      ],
    });

    const evidence =
      getPaperLedgerEvidence();

    assert.equal(
      evidence.entries.length,
      1
    );

    assert.equal(
      evidence.entries[0]?.sessionId,
      "runtime-bot-1-1"
    );

    assert.equal(
      evidence.entries[0]?.botId,
      "bot-1"
    );

    assert.equal(
      evidence.entries[0]?.strategyId,
      "strategy-1"
    );

    assert.equal(
      evidence.entries[0]?.entry.id,
      "paper-ledger-1"
    );

    assert.equal(
      evidence.entries[0]?.authoritative,
      false
    );

    assert.equal(
      evidence.authoritative,
      false
    );
  }
);


test(
  "identical ledger ids from different sessions remain distinct evidence",
  () => {
    resetPaperLedgerEvidenceForTests();

    for (
      const sessionId of [
        "runtime-bot-1-1",
        "runtime-bot-1-2",
      ]
    ) {
      recordPaperLedgerEvidence({
        sessionId,

        botId:
          "bot-1",

        strategyId:
          "strategy-1",

        entries: [
          ledgerEntry(
            "paper-ledger-1"
          ),
        ],
      });
    }

    const evidence =
      getPaperLedgerEvidence();

    assert.equal(
      evidence.entries.length,
      2
    );

    assert.equal(
      evidence.entries[0]?.entry.id,
      evidence.entries[1]?.entry.id
    );

    assert.notEqual(
      evidence.entries[0]?.sessionId,
      evidence.entries[1]?.sessionId
    );
  }
);


test(
  "ledger evidence store is bounded",
  () => {
    resetPaperLedgerEvidenceForTests();

    for (
      let index = 0;
      index <
        PAPER_LEDGER_EVIDENCE_LIMIT + 10;
      index +=
        1
    ) {
      recordPaperLedgerEvidence({
        sessionId:
          `session-${index}`,

        botId:
          "bot-1",

        strategyId:
          "strategy-1",

        entries: [
          ledgerEntry(
            `paper-ledger-${index}`
          ),
        ],
      });
    }

    assert.equal(
      getPaperLedgerEvidence()
        .entries.length,
      PAPER_LEDGER_EVIDENCE_LIMIT
    );
  }
);


test(
  "ledger evidence subscribers observe mutations",
  () => {
    resetPaperLedgerEvidenceForTests();

    let notifications =
      0;

    const unsubscribe =
      subscribePaperLedgerEvidence(
        () => {
          notifications +=
            1;
        }
      );

    recordPaperLedgerEvidence({
      sessionId:
        "session-1",

      botId:
        "bot-1",

      strategyId:
        "strategy-1",

      entries: [
        ledgerEntry(
          "paper-ledger-1"
        ),
      ],
    });

    unsubscribe();

    recordPaperLedgerEvidence({
      sessionId:
        "session-2",

      botId:
        "bot-1",

      strategyId:
        "strategy-1",

      entries: [
        ledgerEntry(
          "paper-ledger-1"
        ),
      ],
    });

    assert.equal(
      notifications,
      1
    );
  }
);
