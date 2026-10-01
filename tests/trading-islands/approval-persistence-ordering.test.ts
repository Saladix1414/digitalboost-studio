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
  "approval persistence uses one serialized operation queue",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /persistenceOperationQueue/
    );

    assert.match(
      content,
      /enqueueApprovalPersistenceOperation/
    );

    assert.match(
      content,
      /persistenceOperationQueue\.then/
    );
  }
);

test(
  "each save captures repository snapshot before entering queue",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /const snapshot =[\s\S]*?state/
    );

    assert.match(
      content,
      /adapter\.save\([\s\S]*?snapshot/
    );
  }
);

test(
  "persistence writes have monotonic sequencing",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /persistenceWriteSequence/
    );

    assert.match(
      content,
      /persistedWriteSequence/
    );

    assert.match(
      content,
      /\+\+persistenceWriteSequence/
    );

    assert.match(
      content,
      /persistedWriteSequence =[\s\S]*?sequence/
    );
  }
);

test(
  "clear operation is serialized behind pending saves",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    const clearStart =
      content.indexOf(
        "clearApprovalStorePersistence"
      );

    const recoverStart =
      content.indexOf(
        "recoverApprovalStorePersistence"
      );

    assert.ok(
      clearStart >= 0
    );

    const clearBlock =
      content.slice(
        clearStart,
        recoverStart >= 0
          ? recoverStart
          : undefined
      );

    assert.match(
      clearBlock,
      /enqueueApprovalPersistenceOperation/
    );

    assert.match(
      clearBlock,
      /adapter\.clear/
    );
  }
);

test(
  "hydration waits for queued persistence operations",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    const hydrateStart =
      content.indexOf(
        "hydrateApprovalStore"
      );

    const persistStart =
      content.indexOf(
        "persistApprovalStore"
      );

    const hydrateBlock =
      content.slice(
        hydrateStart,
        persistStart
      );

    assert.match(
      hydrateBlock,
      /waitForApprovalPersistenceQueue/
    );

    assert.match(
      hydrateBlock,
      /persistence\.load/
    );
  }
);

test(
  "write ordering state is observational only",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /getApprovalPersistenceWriteState/
    );

    assert.match(
      content,
      /authoritative:[\s\S]*?false/
    );

    assert.doesNotMatch(
      content,
      /approval:\s*getApprovalPersistenceWriteState/
    );
  }
);

test(
  "persistence queue cannot execute trading actions",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.doesNotMatch(
      content,
      /executePaperOrder/
    );

    assert.doesNotMatch(
      content,
      /fillPaperMarketOrder/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeStep/
    );

    assert.doesNotMatch(
      content,
      /WebSocket/
    );
  }
);
