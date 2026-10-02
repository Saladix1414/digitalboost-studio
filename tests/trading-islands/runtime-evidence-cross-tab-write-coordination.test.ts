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
  "main runtime ordinary persistence coordinates load reconcile save",
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

    const lock =
      persist.indexOf(
        "coordinator.runExclusive"
      );

    const load =
      persist.indexOf(
        "await adapter.load()"
      );

    const reconcile =
      persist.indexOf(
        "reconcileRuntimeEvidenceHistories"
      );

    const save =
      persist.indexOf(
        "await adapter.save"
      );

    assert.ok(
      lock >= 0
    );

    assert.ok(
      load > lock
    );

    assert.ok(
      reconcile > load
    );

    assert.ok(
      save > reconcile
    );
  }
);


test(
  "persisted runtime conflicts are not overwritten",
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
      /status:\s*"stale"/
    );
  }
);


test(
  "main runtime coordinator is false authority",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceCoordination.ts"
      );

    assert.match(
      content,
      /crossContextSafe/
    );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);


test(
  "browser bootstrap configures runtime Web Lock coordinator",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceBrowserBootstrap.ts"
      );

    assert.match(
      content,
      /createBrowserRuntimeEvidenceCoordinator/
    );

    assert.match(
      content,
      /configureRuntimeEvidenceCoordinator/
    );
  }
);


test(
  "Bot Forge remains independent from runtime coordination",
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
      /RuntimeEvidenceCoordinator|runExclusive|crossContextSafe/
    );
  }
);
