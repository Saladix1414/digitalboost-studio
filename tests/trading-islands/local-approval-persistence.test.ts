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
  "local approval persistence uses a versioned envelope",
  () => {
    const content =
      source(
        "risk/localApprovalPersistence.ts"
      );

    assert.match(
      content,
      /APPROVAL_STORAGE_SCHEMA_VERSION/
    );

    assert.match(
      content,
      /schemaVersion/
    );

    assert.match(
      content,
      /digitalboost\.trading\.approval\.v1/
    );
  }
);

test(
  "local adapter implements load save and clear",
  () => {
    const content =
      source(
        "risk/localApprovalPersistence.ts"
      );

    assert.match(
      content,
      /createLocalApprovalPersistence/
    );

    assert.match(
      content,
      /async load/
    );

    assert.match(
      content,
      /async save/
    );

    assert.match(
      content,
      /async clear/
    );
  }
);

test(
  "persisted review history is integrity validated before trust",
  () => {
    const content =
      source(
        "risk/localApprovalPersistence.ts"
      );

    assert.match(
      content,
      /validateRiskReviewChain/
    );

    assert.match(
      content,
      /integrity\.valid/
    );

    assert.match(
      content,
      /active\.version/
    );

    assert.match(
      content,
      /latestVersioned\.version/
    );

    assert.match(
      content,
      /active\.review\.id/
    );
  }
);

test(
  "invalid JSON and unsupported schema are rejected",
  () => {
    const content =
      source(
        "risk/localApprovalPersistence.ts"
      );

    assert.match(
      content,
      /JSON\.parse/
    );

    assert.match(
      content,
      /not valid JSON/
    );

    assert.match(
      content,
      /schema version is unsupported/
    );
  }
);

test(
  "browser storage is confined to concrete adapter",
  () => {
    const adapter =
      source(
        "risk/localApprovalPersistence.ts"
      );

    const port =
      source(
        "risk/approvalPersistence.ts"
      );

    const store =
      source(
        "risk/approvalStore.ts"
      );

    assert.match(
      adapter,
      /window\.localStorage/
    );

    assert.doesNotMatch(
      port,
      /localStorage/
    );

    assert.doesNotMatch(
      store,
      /localStorage/
    );
  }
);

test(
  "shared React integration hydrates browser persistence once",
  () => {
    const content =
      source(
        "risk/useApprovalRepositoryStore.ts"
      );

    assert.match(
      content,
      /browserPersistenceStarted/
    );

    assert.match(
      content,
      /configureApprovalStorePersistence/
    );

    assert.match(
      content,
      /createBrowserApprovalPersistence/
    );

    assert.match(
      content,
      /hydrateApprovalStore/
    );
  }
);

test(
  "workspace bootstrap waits for hydrated governance state",
  () => {
    const risk =
      source(
        "risk/RiskReviewWorkspace.tsx"
      );

    const bot =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    for (
      const content of [
        risk,
        bot,
      ]
    ) {
      assert.match(
        content,
        /!approvalStoreReady[\s\S]*?approvalRepository\.active/
      );

      assert.match(
        content,
        /approvalStoreReady/
      );
    }
  }
);

test(
  "governance mutations persist through persistence boundary",
  () => {
    const content =
      source(
        "risk/approvalStore.ts"
      );

    const matches =
      content.match(
        /void persistApprovalStore\(\);/g
      ) ?? [];

    assert.ok(
      matches.length >= 2
    );
  }
);

test(
  "storage remains non-authoritative and cannot execute",
  () => {
    const content =
      source(
        "risk/localApprovalPersistence.ts"
      );

    assert.match(
      content,
      /authoritative:\s*false/
    );

    assert.doesNotMatch(
      content,
      /executePaperOrder/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntime/
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
);
