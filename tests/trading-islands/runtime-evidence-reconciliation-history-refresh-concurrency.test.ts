import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";


function source(
  path: string
): string {
  return fs.readFileSync(
    new URL(
      `../../src/trading/${path}`,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "reconciliation history tracks an internal generation",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryStore.ts"
      );

    assert.match(
      content,
      /let historyGeneration = 0/
    );

    assert.match(
      content,
      /historyGeneration \+=\s*1/
    );
  }
);


test(
  "refresh validates generation after asynchronous load",
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

    const refresh =
      content.slice(
        start,
        end
      );

    const load =
      refresh.indexOf(
        "await adapter.load()"
      );

    const guard =
      refresh.indexOf(
        "historyGeneration !=="
      );

    assert.ok(
      load >= 0
    );

    assert.ok(
      guard > load
    );

    assert.match(
      refresh,
      /continue;/
    );

    assert.match(
      refresh,
      /attempt < 8/
    );
  }
);


test(
  "generation is not exported as public authority",
  () => {
    const content =
      source(
        "runtime/index.ts"
      );

    assert.doesNotMatch(
      content,
      /historyGeneration/
    );
  }
);


test(
  "Bot Forge remains independent",
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
      /historyGeneration/
    );
  }
);
