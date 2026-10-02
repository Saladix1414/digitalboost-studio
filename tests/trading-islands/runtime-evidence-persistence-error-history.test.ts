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
  "coordinated persistence errors enter reconciliation attempt history",
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

    const catchPos =
      persist.indexOf(
        "} catch ("
      );

    assert.ok(
      catchPos >= 0
    );

    const catchBlock =
      persist.slice(
        catchPos
      );

    assert.match(
      catchBlock,
      /recordRuntimeEvidenceReconciliationAttempt/
    );

    assert.match(
      catchBlock,
      /status:\s*"error"/
    );

    assert.match(
      catchBlock,
      /error:\s*message/
    );
  }
);


test(
  "diagnostic attempt recording is isolated from original persistence error",
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
      /try\s*\{\s*recordRuntimeEvidenceReconciliationAttempt/
    );

    assert.match(
      persist,
      /\}\s*catch\s*\{\s*\/\*/
    );
  }
);


test(
  "persistence error diagnostics remain non authoritative",
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
  }
);
