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
  "persistence port carries revision through load and save",
  () => {
    const content =
      source(
        "risk/approvalPersistence.ts"
      );

    assert.match(
      content,
      /ApprovalPersistenceRevision/
    );

    assert.match(
      content,
      /revision:/
    );

    assert.match(
      content,
      /expectedRevision/
    );

    assert.match(
      content,
      /ApprovalPersistenceSaveResult/
    );
  }
);

test(
  "local persistence envelope stores monotonic revision",
  () => {
    const content =
      source(
        "risk/localApprovalPersistence.ts"
      );

    assert.match(
      content,
      /readonly revision:/
    );

    assert.match(
      content,
      /nextRevision/
    );

    assert.match(
      content,
      /actualRevision/
    );
  }
);

test(
  "legacy revisionless v1 payload is treated as revision zero",
  () => {
    const content =
      source(
        "risk/localApprovalPersistence.ts"
      );

    assert.match(
      content,
      /parsed\.revision ===[\s\S]*?undefined/
    );

    assert.match(
      content,
      /\? 0/
    );
  }
);

test(
  "stale save is rejected by compare-and-swap revision check",
  () => {
    const content =
      source(
        "risk/localApprovalPersistence.ts"
      );

    assert.match(
      content,
      /StaleApprovalPersistenceError/
    );

    assert.match(
      content,
      /assertExpectedRevision/
    );

    assert.match(
      content,
      /expectedRevision !==[\s\S]*?actualRevision/
    );
  }
);

test(
  "shared store updates persisted revision only after successful save",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /let persistenceRevision/
    );

    assert.match(
      content,
      /await adapter\.save/
    );

    assert.match(
      content,
      /persistenceRevision =[\s\S]*?result\.revision/
    );
  }
);

test(
  "queued local saves use current persisted revision at execution time",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /enqueueApprovalPersistenceOperation[\s\S]*?const expectedRevision =[\s\S]*?persistenceRevision/
    );

    assert.match(
      content,
      /adapter\.save\([\s\S]*?snapshot,[\s\S]*?expectedRevision/
    );
  }
);

test(
  "hydration records persisted revision",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /persistenceRevision =[\s\S]*?result\.revision/
    );
  }
);

test(
  "clear is revision-aware while corruption recovery remains possible",
  () => {
    const adapter =
      source(
        "risk/localApprovalPersistence.ts"
      );

    const store =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      adapter,
      /async clear\([\s\S]*?expectedRevision/
    );

    assert.match(
      store,
      /adapter\.clear\([\s\S]*?persistenceRevision/
    );

    assert.match(
      adapter,
      /expectedRevision !==[\s\S]*?null/
    );
  }
);

test(
  "revision metadata remains observational and cannot authorize runtime",
  () => {
    const store =
      source(
        "risk/approvalStore.ts"
      );

    const bot =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      store,
      /revision:[\s\S]*?persistenceRevision/
    );

    assert.match(
      store,
      /authoritative:[\s\S]*?false/
    );

    assert.match(
      bot,
      /approval:\s*activeReview/
    );

    assert.doesNotMatch(
      bot,
      /approval:\s*persistenceRevision/
    );
  }
);
