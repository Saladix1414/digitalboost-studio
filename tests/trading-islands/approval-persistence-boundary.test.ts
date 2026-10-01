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
  "approval persistence defines load save and clear boundary",
  () => {
    const content =
      source(
        "risk/approvalPersistence.ts"
      );

    assert.match(
      content,
      /ApprovalRepositoryPersistence/
    );

    assert.match(
      content,
      /load\(\)/
    );

    assert.match(
      content,
      /save\(/
    );

    assert.match(
      content,
      /clear\(/
    );

    assert.match(
      content,
      /expectedRevision/
    );
  }
);

test(
  "approval persistence lifecycle is explicit",
  () => {
    const content =
      source(
        "risk/approvalPersistence.ts"
      );

    for (
      const status of [
        "idle",
        "hydrating",
        "ready",
        "error",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          `"${status}"`
        )
      );
    }
  }
);

test(
  "persistence results and lifecycle are non authoritative",
  () => {
    const content =
      source(
        "risk/approvalPersistence.ts"
      );

    assert.match(
      content,
      /authoritative:\s*false/
    );
  }
);

test(
  "shared store accepts injectable persistence",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /configureApprovalStorePersistence/
    );

    assert.match(
      content,
      /ApprovalRepositoryPersistence \| null/
    );
  }
);

test(
  "shared store exposes explicit hydration",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /hydrateApprovalStore/
    );

    assert.match(
      content,
      /await persistence\.load/
    );

    assert.match(
      content,
      /status:[\s\S]*?"hydrating"/
    );

    assert.match(
      content,
      /status:[\s\S]*?"ready"/
    );
  }
);

test(
  "shared store exposes explicit persistence",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /persistApprovalStore/
    );

    assert.match(
      content,
      /const adapter =/
    );

    assert.match(
      content,
      /enqueueApprovalPersistenceOperation/
    );

    assert.match(
      content,
      /await adapter\.save/
    );

    assert.match(
      content,
      /snapshot/
    );
  }
);

test(
  "persistence failures move lifecycle to error without creating authority",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /status:[\s\S]*?"error"/
    );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);

test(
  "approval persistence boundary has no concrete storage dependency",
  () => {
    const persistence =
      source(
        "risk/approvalPersistence.ts"
      );

    const store =
      source(
        "risk/approvalStore.ts"
      );

    for (
      const content of [
        persistence,
        store,
      ]
    ) {
      assert.doesNotMatch(
        content,
        /localStorage/
      );

      assert.doesNotMatch(
        content,
        /sessionStorage/
      );

      assert.doesNotMatch(
        content,
        /indexedDB/i
      );

      assert.doesNotMatch(
        content,
        /fetch\s*\(/
      );

      assert.doesNotMatch(
        content,
        /WebSocket/
      );
    }
  }
);

test(
  "approval persistence cannot execute trading actions",
  () => {
    const persistence =
      source(
        "risk/approvalPersistence.ts"
      );

    const store =
      source(
        "risk/approvalStore.ts"
      );

    for (
      const content of [
        persistence,
        store,
      ]
    ) {
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
        /runBotRuntime/
      );
    }
  }
);
