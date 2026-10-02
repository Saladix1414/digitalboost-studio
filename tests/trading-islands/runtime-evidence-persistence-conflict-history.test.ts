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
  "coordinated persistence conflict records existing reconciliation attempt history",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    const start =
      content.indexOf(
        "export async function persistRuntimeEvidenceHistory"
      );

    const end =
      content.indexOf(
        "\nexport ",
        start + 20
      );

    const persist =
      content.slice(
        start,
        end
      );

    assert.match(
      persist,
      /reconciliation\.status ===\s*"conflict"/
    );

    assert.match(
      persist,
      /recordRuntimeEvidenceReconciliationAttempt/
    );

    assert.match(
      persist,
      /status:\s*"conflict"/
    );

    assert.match(
      persist,
      /conflictSessionId:\s*reconciliation\.conflict\.sessionId/
    );
  }
);


test(
  "coordinated conflict remains non authoritative and does not auto reconcile",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    const start =
      content.indexOf(
        "export async function persistRuntimeEvidenceHistory"
      );

    const end =
      content.indexOf(
        "\nexport ",
        start + 20
      );

    const persist =
      content.slice(
        start,
        end
      );

    assert.doesNotMatch(
      persist,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      persist,
      /await\s+reconcileStaleRuntimeEvidence/
    );
  }
);
