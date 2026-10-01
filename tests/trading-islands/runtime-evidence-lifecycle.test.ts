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
  "runtime evidence store owns explicit observational lifecycle",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    for (
      const token of [
        "RuntimeEvidenceLifecycle",
        '"idle"',
        '"hydrating"',
        '"ready"',
        '"error"',
        "getRuntimeEvidenceLifecycle",
        "configureRuntimeEvidencePersistence",
        "hydrateRuntimeEvidence",
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

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);


test(
  "runtime evidence recording is memory first and persistence best effort",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    const historyIndex =
      content.indexOf(
        "history = {",
        content.indexOf(
          "recordRuntimeSessionEvidence"
        )
      );

    const emitIndex =
      content.indexOf(
        "emitRuntimeEvidenceChange();",
        historyIndex
      );

    const persistIndex =
      content.indexOf(
        "void persistRuntimeEvidenceHistory();",
        emitIndex
      );

    assert.ok(
      historyIndex >= 0
    );

    assert.ok(
      emitIndex >
        historyIndex
    );

    assert.ok(
      persistIndex >
        emitIndex
    );
  }
);


test(
  "runtime evidence store serializes persistence without browser coupling",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    assert.match(
      content,
      /persistenceQueue/
    );

    assert.match(
      content,
      /enqueuePersistence/
    );

    assert.match(
      content,
      /waitForRuntimeEvidencePersistenceQueue/
    );

    assert.doesNotMatch(
      content,
      /localStorage|sessionStorage|indexedDB|window\./
    );
  }
);


test(
  "runtime evidence lifecycle cannot gate or authorize trading",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    assert.doesNotMatch(
      content,
      /RiskReview|activeReview|approvedFor|approvalVerified/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeSession|runBotRuntimeStep|executePaperOrder|fillPaperMarketOrder/
    );
  }
);


test(
  "Bot Forge remains independent from evidence lifecycle",
  () => {
    const content =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      content,
      /approval:\s*activeReview/
    );

    assert.doesNotMatch(
      content,
      /getRuntimeEvidenceLifecycle|hydrateRuntimeEvidence|runtimeEvidenceLifecycle/
    );
  }
);
