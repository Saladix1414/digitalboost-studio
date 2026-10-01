import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const root =
  new URL(
    "../../src/trading/",
    import.meta.url
  );

function source(
  path:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      path,
      root
    ),
    "utf8"
  );
}

test(
  "approval persistence coordination has a dedicated lock name",
  () => {
    const content =
      source(
        "risk/approvalCoordination.ts"
      );

    assert.match(
      content,
      /APPROVAL_PERSISTENCE_LOCK_NAME/
    );

    assert.match(
      content,
      /digitalboost\.trading\.approval\.persistence/
    );
  }
);

test(
  "coordination is explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/approvalCoordination.ts"
      );

    assert.match(
      content,
      /authoritative:[\s\S]*?false/
    );
  }
);

test(
  "browser coordinator uses Web Locks when available",
  () => {
    const content =
      source(
        "risk/approvalCoordination.ts"
      );

    assert.match(
      content,
      /navigator/
    );

    assert.match(
      content,
      /lockManager\.request/
    );

    assert.match(
      content,
      /APPROVAL_PERSISTENCE_LOCK_NAME/
    );
  }
);

test(
  "browser coordinator has a safe local fallback",
  () => {
    const content =
      source(
        "risk/approvalCoordination.ts"
      );

    assert.match(
      content,
      /createLocalApprovalPersistenceCoordinator/
    );

    assert.match(
      content,
      /typeof navigator ===[\s\S]*?"undefined"/
    );
  }
);

test(
  "approval store routes queued persistence through coordinator",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      content,
      /persistenceCoordinator\.runExclusive/
    );

    assert.match(
      content,
      /configureApprovalStoreCoordinator/
    );
  }
);

test(
  "browser approval integration configures coordinator before persistence",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    const coordinator =
      content.indexOf(
        "configureApprovalStoreCoordinator("
      );

    const persistence =
      content.indexOf(
        "configureApprovalStorePersistence("
      );

    assert.ok(
      coordinator >= 0
    );

    assert.ok(
      persistence >= 0
    );

    assert.ok(
      coordinator <
        persistence
    );
  }
);

test(
  "coordination cannot become runtime authority",
  () => {
    const bot =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      bot,
      /approval:\s*activeReview/
    );

    assert.doesNotMatch(
      bot,
      /approval:\s*persistenceCoordinator/
    );

    assert.doesNotMatch(
      bot,
      /approval:\s*APPROVAL_PERSISTENCE_LOCK_NAME/
    );
  }
);

test(
  "coordination layer cannot execute or access exchanges",
  () => {
    const content =
      source(
        "risk/approvalCoordination.ts"
      );

    assert.doesNotMatch(
      content,
      /executePaperOrder/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeStep/
    );

    assert.doesNotMatch(
      content,
      /WebSocket/
    );

    assert.doesNotMatch(
      content,
      /binance|bybit|okx|coinbase|kraken/i
    );
  }
);
