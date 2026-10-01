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
  "runtime evidence lifecycle supports stale observational state",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    assert.match(
      content,
      /\|\s*"stale"/
    );

    assert.match(
      content,
      /markRuntimeEvidenceStale/
    );

    assert.match(
      content,
      /authoritative:\s*false/
    );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );
  }
);


test(
  "stale runtime evidence remains readable and non destructive",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    const start =
      content.indexOf(
        "export function markRuntimeEvidenceStale"
      );

    const end =
      content.indexOf(
        "export function configureRuntimeEvidencePersistence",
        start
      );

    assert.ok(
      start >= 0
    );

    assert.ok(
      end >
        start
    );

    const staleBlock =
      content.slice(
        start,
        end
      );

    assert.doesNotMatch(
      staleBlock,
      /history\s*=/
    );

    assert.doesNotMatch(
      staleBlock,
      /persistRuntimeEvidenceHistory/
    );

    assert.doesNotMatch(
      staleBlock,
      /hydrateRuntimeEvidence/
    );
  }
);


test(
  "browser integration listens only for canonical runtime evidence key",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceBrowserBootstrap.ts"
      );

    assert.match(
      content,
      /addEventListener\(\s*"storage"/
    );

    assert.match(
      content,
      /LOCAL_RUNTIME_EVIDENCE_STORAGE_KEY/
    );

    assert.match(
      content,
      /event\.key\s*!==\s*LOCAL_RUNTIME_EVIDENCE_STORAGE_KEY/
    );

    assert.match(
      content,
      /markRuntimeEvidenceStale/
    );
  }
);


test(
  "cross-tab detection does not auto hydrate or merge",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceBrowserBootstrap.ts"
      );

    const handlerStart =
      content.indexOf(
        "function handleRuntimeEvidenceStorageChange"
      );

    const handlerEnd =
      content.indexOf(
        "function installRuntimeEvidenceStorageListener",
        handlerStart
      );

    assert.ok(
      handlerStart >= 0
    );

    assert.ok(
      handlerEnd >
        handlerStart
    );

    const handler =
      content.slice(
        handlerStart,
        handlerEnd
      );

    assert.match(
      handler,
      /markRuntimeEvidenceStale/
    );

    assert.doesNotMatch(
      handler,
      /hydrateRuntimeEvidence/
    );

    assert.doesNotMatch(
      handler,
      /configureRuntimeEvidencePersistence/
    );

    assert.doesNotMatch(
      handler,
      /history\s*=/
    );
  }
);


test(
  "Bot Forge remains independent from runtime evidence stale state",
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
      /markRuntimeEvidenceStale|getRuntimeEvidenceLifecycle|runtimeEvidenceLifecycle/
    );
  }
);
