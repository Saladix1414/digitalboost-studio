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
  "runtime evidence persistence is a separate observational port",
  () => {
    const content =
      source(
        "runtime/runtimeEvidencePersistence.ts"
      );

    for (
      const token of [
        "RuntimeEvidencePersistence",
        "RuntimeEvidenceSnapshot",
        "createRuntimeEvidenceSnapshot",
        "load",
        "save",
        "clear",
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
      /RiskReview|ApprovalRepository|approvedFor/
    );
  }
);


test(
  "runtime evidence validation protects persisted DTO shape",
  () => {
    const content =
      source(
        "runtime/runtimeEvidencePersistenceValidation.ts"
      );

    for (
      const token of [
        "validateRuntimeEvidenceSnapshot",
        "serializeRuntimeEvidenceSnapshot",
        "deserializeRuntimeEvidenceSnapshot",
        "RUNTIME_EVIDENCE_HISTORY_LIMIT",
        "seenSessionIds",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          token
        )
      );
    }

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);


test(
  "local adapter owns browser storage",
  () => {
    const adapter =
      source(
        "runtime/localRuntimeEvidencePersistence.ts"
      );

    const store =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    assert.match(
      adapter,
      /localStorage/
    );

    assert.match(
      adapter,
      /getItem/
    );

    assert.match(
      adapter,
      /setItem/
    );

    assert.match(
      adapter,
      /removeItem/
    );

    assert.doesNotMatch(
      store,
      /localStorage|sessionStorage|indexedDB/
    );
  }
);


test(
  "runtime evidence persistence has no execution or approval authority",
  () => {
    const content = [
      source(
        "runtime/runtimeEvidencePersistence.ts"
      ),
      source(
        "runtime/runtimeEvidencePersistenceValidation.ts"
      ),
      source(
        "runtime/localRuntimeEvidencePersistence.ts"
      ),
    ].join(
      "\n"
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeSession|runBotRuntimeStep|executePaperOrder|fillPaperMarketOrder/
    );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      content,
      /recordRuntimeSessionEvidence/
    );
  }
);
