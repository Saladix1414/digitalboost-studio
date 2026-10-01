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
  "reconciliation history has independent persistence boundary",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryPersistence.ts"
      );

    assert.match(
      content,
      /RuntimeEvidenceReconciliationHistoryPersistence/
    );

    assert.match(
      content,
      /SNAPSHOT_VERSION/
    );

    assert.match(
      content,
      /authoritative:\s*false/
    );
  }
);


test(
  "main runtime evidence snapshot remains unchanged by reconciliation history durability",
  () => {
    const content =
      source(
        "runtime/runtimeEvidencePersistence.ts"
      );

    assert.doesNotMatch(
      content,
      /ReconciliationHistory|reconciliationHistory/
    );
  }
);


test(
  "reconciliation history persistence validates before load",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryPersistenceValidation.ts"
      );

    assert.match(
      content,
      /validateRuntimeEvidenceReconciliationHistorySnapshot/
    );

    assert.match(
      content,
      /previousSequence/
    );

    assert.match(
      content,
      /RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT/
    );
  }
);


test(
  "local adapter owns a separate storage key",
  () => {
    const content =
      source(
        "runtime/localRuntimeEvidenceReconciliationHistoryPersistence.ts"
      );

    assert.match(
      content,
      /digitalboost\.trading\.runtime-evidence-reconciliation-history\.v1/
    );

    assert.doesNotMatch(
      content,
      /digitalboost\.trading\.runtime-evidence\.v1"/
    );
  }
);


test(
  "history recording remains memory first and persistence best effort",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryStore.ts"
      );

    const record =
      content.indexOf(
        "export function recordRuntimeEvidenceReconciliationAttempt"
      );

    const persist =
      content.indexOf(
        "void persistRuntimeEvidenceReconciliationHistory()",
        record
      );

    assert.ok(
      record >=
        0
    );

    assert.ok(
      persist >
        record
    );

    assert.match(
      content,
      /catch/
    );
  }
);


test(
  "Trading Islands root owns history durability bootstrap",
  () => {
    const content =
      source(
        "TradingIslandsWorkspace.tsx"
      );

    assert.match(
      content,
      /useRuntimeEvidenceReconciliationHistoryBrowserBootstrap/
    );
  }
);


test(
  "Bot Forge remains independent from history persistence",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /approval:\s*[\r\n\t ]*activeReview/
    );

    assert.doesNotMatch(
      content,
      /ReconciliationHistoryPersistence|hydrateRuntimeEvidenceReconciliationHistory|useRuntimeEvidenceReconciliationHistoryBrowserBootstrap/
    );
  }
);
