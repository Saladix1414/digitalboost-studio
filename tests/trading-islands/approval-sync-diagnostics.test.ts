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
  "persistence diagnostics expose stable observational snapshot",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /ApprovalPersistenceWriteDiagnostics/
    );

    assert.match(
      content,
      /persistenceWriteDiagnostics/
    );

    assert.match(
      content,
      /getApprovalPersistenceWriteState/
    );

    assert.match(
      content,
      /authoritative:[\s\S]*?false/
    );
  }
);

test(
  "diagnostics expose queued persisted pending and revision",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    for (
      const field of [
        "queued",
        "persisted",
        "pending",
        "revision",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          `${field}:`
        )
      );
    }
  }
);

test(
  "diagnostic snapshot refreshes around persistence progress",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /refreshPersistenceWriteDiagnostics/
    );

    assert.match(
      content,
      /persistedWriteSequence =[\s\S]*?sequence[\s\S]*?refreshPersistenceWriteDiagnostics/
    );
  }
);

test(
  "React hook subscribes to persistence diagnostics",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /const persistenceDiagnostics =/
    );

    assert.match(
      content,
      /getApprovalPersistenceWriteState/
    );

    assert.match(
      content,
      /persistenceDiagnostics,/
    );
  }
);

test(
  "Risk Review exposes sync diagnostics",
  () => {
    const content =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    assert.match(
      content,
      /Persistence Diagnostics/
    );

    assert.match(
      content,
      /Storage revision/
    );

    assert.match(
      content,
      /Writes pending/
    );

    assert.match(
      content,
      /EVIDENCE ONLY/
    );
  }
);

test(
  "Bot Forge exposes sync diagnostics",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /Persistence Diagnostics/
    );

    assert.match(
      content,
      /Review version/
    );

    assert.match(
      content,
      /Writes persisted/
    );

    assert.match(
      content,
      /Sync reason/
    );
  }
);

test(
  "diagnostics cannot become runtime authority",
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
      /approval:\s*persistenceDiagnostics/
    );

    assert.doesNotMatch(
      bot,
      /approval:\s*persistenceWriteDiagnostics/
    );
  }
);

test(
  "diagnostics cannot execute or access exchange systems",
  () => {
    const store =
      source(
        "risk/approvalStore.ts"
      );

    assert.doesNotMatch(
      store,
      /executePaperOrder/
    );

    assert.doesNotMatch(
      store,
      /runBotRuntimeStep/
    );

    assert.doesNotMatch(
      store,
      /WebSocket/
    );

    assert.doesNotMatch(
      store,
      /binance|bybit|okx|coinbase|kraken/i
    );
  }
);
