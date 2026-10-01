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
  "controlled reconciliation is stale gated",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    assert.match(
      content,
      /reconcileStaleRuntimeEvidence/
    );

    assert.match(
      content,
      /lifecycle\.status\s*!==\s*"stale"/
    );

    assert.match(
      content,
      /"reconciling"/
    );
  }
);

test(
  "reconciliation waits for queued persistence before load",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    const start =
      content.indexOf(
        "export async function reconcileStaleRuntimeEvidence"
      );

    const end =
      content.indexOf(
        "export function createRuntimeEvidenceBundle",
        start
      );

    const block =
      content.slice(
        start,
        end
      );

    assert.ok(
      block.indexOf(
        "await waitForRuntimeEvidencePersistenceQueue()"
      ) <
      block.indexOf(
        "await adapter.load()"
      )
    );
  }
);

test(
  "conflict occurs before merged history mutation and persistence",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    const reconcileStart =
      content.indexOf(
        "export async function reconcileStaleRuntimeEvidence"
      );

    const reconcileEnd =
      content.indexOf(
        "export function createRuntimeEvidenceBundle",
        reconcileStart
      );

    const block =
      content.slice(
        reconcileStart,
        reconcileEnd
      );

    const conflict =
      block.indexOf(
        'reconciliation.status ==='
      );

    const mutation =
      block.indexOf(
        "history =\n      reconciliation.history"
      );

    const save =
      block.indexOf(
        "await adapter.save("
      );

    assert.ok(
      conflict >= 0
    );

    assert.ok(
      mutation >
        conflict
    );

    assert.ok(
      save >
        mutation
    );
  }
);

test(
  "generation protects runtime records during reconciliation",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    assert.match(
      content,
      /historyGeneration/
    );

    assert.match(
      content,
      /generation ===\s*historyGeneration/
    );

    assert.match(
      content,
      /lifecycle\.status ===\s*"reconciling"/
    );
  }
);

test(
  "reconciliation policy and store share neutral constant",
  () => {
    const store =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    const policy =
      source(
        "runtime/runtimeEvidenceReconciliation.ts"
      );

    assert.match(
      store,
      /runtimeEvidenceConstants/
    );

    assert.match(
      policy,
      /runtimeEvidenceConstants/
    );

    /*
     * A type-only import from runtimeEvidenceStore is safe because
     * TypeScript erases it at runtime.
     *
     * What must not return is a value import that would recreate the
     * runtime store <-> reconciliation execution cycle.
     */
    assert.doesNotMatch(
      policy,
      /^import\s*\{[^;]*\}\s*from "\.\/runtimeEvidenceStore";/m
    );

    assert.match(
      policy,
      /^import\s+type\s*\{[^;]*\}\s*from "\.\/runtimeEvidenceStore";/m
    );
  }
);

test(
  "Bot Forge remains independent from evidence reconciliation",
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
      /reconcileStaleRuntimeEvidence|getRuntimeEvidenceLifecycle|runtimeEvidenceLifecycle/
    );
  }
);
