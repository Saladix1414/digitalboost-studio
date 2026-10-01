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
  "backend semantics define explicit operation types",
  () => {
    const content =
      source(
        "risk/approvalBackendTransactions.ts"
      );

    assert.match(
      content,
      /"read"/
    );

    assert.match(
      content,
      /"write"/
    );

    assert.match(
      content,
      /"clear"/
    );
  }
);


test(
  "backend semantics distinguish revision and idempotency conflicts",
  () => {
    const content =
      source(
        "risk/approvalBackendTransactions.ts"
      );

    assert.match(
      content,
      /"revision-conflict"/
    );

    assert.match(
      content,
      /"idempotency-conflict"/
    );

    assert.match(
      content,
      /ApprovalBackendRevisionConflictError/
    );

    assert.match(
      content,
      /ApprovalBackendIdempotencyConflictError/
    );
  }
);


test(
  "backend errors expose retryability explicitly",
  () => {
    const content =
      source(
        "risk/approvalBackendTransactions.ts"
      );

    assert.match(
      content,
      /readonly retryable:/
    );

    assert.match(
      content,
      /isRetryableApprovalBackendError/
    );
  }
);


test(
  "revision conflicts preserve expected and actual revision evidence",
  () => {
    const content =
      source(
        "risk/approvalBackendTransactions.ts"
      );

    assert.match(
      content,
      /expectedRevision/
    );

    assert.match(
      content,
      /actualRevision/
    );

    assert.match(
      content,
      /retryable:[\s\S]*?false/
    );
  }
);


test(
  "idempotency keys bind mutation identity operation and revision",
  () => {
    const content =
      source(
        "risk/approvalBackendTransactions.ts"
      );

    assert.match(
      content,
      /createApprovalBackendIdempotencyKey/
    );

    assert.match(
      content,
      /input\.operation/
    );

    assert.match(
      content,
      /input\.expectedRevision/
    );

    assert.match(
      content,
      /mutationId/
    );
  }
);


test(
  "remote write and clear contracts carry idempotency metadata",
  () => {
    const content =
      source(
        "risk/remoteApprovalPersistence.ts"
      );

    const matches =
      content.match(
        /readonly idempotencyKey:/g
      );

    assert.ok(
      matches &&
      matches.length >=
        2
    );

    assert.match(
      content,
      /client\.write\(\{[\s\S]*?idempotencyKey/
    );

    assert.match(
      content,
      /client\.clear\(\{[\s\S]*?idempotencyKey/
    );
  }
);


test(
  "existing persistence port remains transport neutral",
  () => {
    const content =
      source(
        "risk/approvalPersistence.ts"
      );

    assert.doesNotMatch(
      content,
      /idempotency/i
    );

    assert.doesNotMatch(
      content,
      /fetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /http/i
    );
  }
);


test(
  "transaction semantics remain non authoritative",
  () => {
    const content =
      source(
        "risk/approvalBackendTransactions.ts"
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
  "transaction semantics contain no transport or execution implementation",
  () => {
    const content =
      source(
        "risk/approvalBackendTransactions.ts"
      );

    for (
      const pattern of [
        /\bfetch\s*\(/,
        /WebSocket/,
        /XMLHttpRequest/,
        /axios/i,
        /executePaperOrder/,
        /runBotRuntimeStep/,
        /runBotRuntimeSession/,
        /binance|bybit|okx|coinbase|kraken/i,
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
      /approval:\s*ApprovalBackend/
    );

    assert.doesNotMatch(
      bot,
      /approval:\s*idempotency/
    );
  }
);
