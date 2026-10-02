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
  "bounded history merge validates retained overlap",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryMerge.ts"
      );

    assert.match(
      content,
      /branchMatchesRetainedBase/
    );

    assert.match(
      content,
      /overlapStart/
    );

    assert.match(
      content,
      /overlapEnd/
    );

    assert.match(
      content,
      /entryAtSequence/
    );

    assert.doesNotMatch(
      content,
      /function hasBasePrefix/
    );
  }
);


test(
  "bounded merge still reports true divergence",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryMerge.ts"
      );

    assert.match(
      content,
      /base-diverged/
    );

    assert.match(
      content,
      /!entriesEqual/
    );
  }
);


test(
  "bounded merge keeps deterministic remote then local ordering",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryMerge.ts"
      );

    const remote =
      content.indexOf(
        "for (\n    const entry of remoteSuffix"
      );

    const local =
      content.indexOf(
        "for (\n    const entry of localSuffix"
      );

    assert.ok(
      remote >=
        0
    );

    assert.ok(
      local >
        remote
    );
  }
);


test(
  "bounded merge remains limited by canonical retention policy",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryMerge.ts"
      );

    assert.match(
      content,
      /RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT/
    );

    assert.match(
      content,
      /\.slice\(\s*-RUNTIME_EVIDENCE_RECONCILIATION_HISTORY_LIMIT/
    );
  }
);


test(
  "merge remains non authoritative",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryMerge.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);
