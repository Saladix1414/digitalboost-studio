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
  "controlled refresh uses load and three-way merge",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryStore.ts"
      );

    assert.match(
      content,
      /refreshRuntimeEvidenceReconciliationHistoryFromPersistence/
    );

    assert.match(
      content,
      /adapter\.load/
    );

    assert.match(
      content,
      /mergeRuntimeEvidenceReconciliationHistories/
    );

    assert.match(
      content,
      /baseBefore/
    );

    assert.match(
      content,
      /memoryBefore/
    );
  }
);


test(
  "controlled refresh commits only after successful merge",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryStore.ts"
      );

    const start =
      content.indexOf(
        "export async function refreshRuntimeEvidenceReconciliationHistoryFromPersistence"
      );

    const end =
      content.indexOf(
        "export async function persistRuntimeEvidenceReconciliationHistory",
        start
      );

    assert.ok(
      start >=
        0 &&
      end >
        start
    );

    const refresh =
      content.slice(
        start,
        end
      );

    assert.match(
      refresh,
      /reconciliation\.status ===\s*"conflict"/
    );

    assert.match(
      refresh,
      /history =\s*reconciliation\.history/
    );

    assert.match(
      refresh,
      /persistenceBase =\s*reconciliation\.history/
    );

    assert.match(
      refresh,
      /externalChangeDetected =\s*false/
    );
  }
);


test(
  "Activity exposes refresh only through explicit click action",
  () => {
    const content =
      source(
        "activity/RuntimeEvidenceCrossTabDiagnostics.tsx"
      );

    assert.match(
      content,
      /refreshRuntimeEvidenceReconciliationHistoryFromPersistence/
    );

    assert.match(
      content,
      /onClick/
    );

    assert.match(
      content,
      /Refresh evidence/
    );

    assert.doesNotMatch(
      content,
      /useEffect/
    );
  }
);


test(
  "refresh diagnostics cannot execute or approve trading",
  () => {
    const content =
      source(
        "activity/RuntimeEvidenceCrossTabDiagnostics.tsx"
      );

    for (
      const forbidden of [
        "runBotRuntimeSession",
        "executePaperOrder",
        "createRiskReview",
        "approveRiskReview",
        "activeReview",
      ]
    ) {
      assert.doesNotMatch(
        content,
        new RegExp(
          forbidden
        )
      );
    }
  }
);


test(
  "Bot Forge remains independent from history refresh",
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
      /refreshRuntimeEvidenceReconciliationHistoryFromPersistence/
    );
  }
);
