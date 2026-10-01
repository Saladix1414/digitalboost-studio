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
  "history persistence runs under explicit coordinator",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryStore.ts"
      );

    assert.match(
      content,
      /coordinator\.runExclusive/
    );

    assert.match(
      content,
      /adapter\.load/
    );

    assert.match(
      content,
      /mergeRuntimeEvidenceReconciliationHistories/
    );

    assert.match(
      content,
      /adapter\.save/
    );
  }
);


test(
  "store tracks a persistence base separately from current history",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryStore.ts"
      );

    assert.match(
      content,
      /let persistenceBase/
    );

    assert.match(
      content,
      /baseAtStart/
    );
  }
);


test(
  "external browser storage changes are detection only",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryBrowserBootstrap.ts"
      );

    const start =
      content.indexOf(
        "function handleRuntimeEvidenceReconciliationHistoryStorageChange"
      );

    const end =
      content.indexOf(
        "function installRuntimeEvidenceReconciliationHistoryStorageListener",
        start
      );

    assert.ok(
      start >=
        0 &&
      end >
        start
    );

    const handler =
      content.slice(
        start,
        end
      );

    assert.match(
      handler,
      /markRuntimeEvidenceReconciliationHistoryExternalChange/
    );

    assert.doesNotMatch(
      handler,
      /hydrateRuntimeEvidenceReconciliationHistory|persistRuntimeEvidenceReconciliationHistory|recordRuntimeEvidenceReconciliationAttempt/
    );
  }
);


test(
  "browser bootstrap configures Web Lock coordinator",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceReconciliationHistoryBrowserBootstrap.ts"
      );

    assert.match(
      content,
      /createBrowserRuntimeEvidenceReconciliationHistoryCoordinator/
    );

    assert.match(
      content,
      /configureRuntimeEvidenceReconciliationHistoryCoordinator/
    );
  }
);


test(
  "cross tab coordination cannot affect Bot Forge authority",
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
      /ReconciliationHistoryCoordinator|persistenceBase|ExternalChange/
    );
  }
);
