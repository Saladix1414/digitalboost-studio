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
  "store defers external change while hydration is active",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    assert.match(
      content,
      /let pendingExternalChangeDuringHydration/
    );

    const start =
      content.indexOf(
        "export function markRuntimeEvidenceStale"
      );

    const end =
      content.indexOf(
        "\nexport ",
        start + 20
      );

    const marker =
      content.slice(
        start,
        end
      );

    assert.match(
      marker,
      /pendingExternalChangeDuringHydration =\s*true/
    );
  }
);


test(
  "deferred external change precedes hydration catch-up save",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceStore.ts"
      );

    const start =
      content.indexOf(
        "export async function hydrateRuntimeEvidence"
      );

    const end =
      content.indexOf(
        "\nexport ",
        start + 20
      );

    const hydrate =
      content.slice(
        start,
        end
      );

    const pending =
      hydrate.indexOf(
        "pendingExternalChangeDuringHydration"
      );

    const save =
      hydrate.indexOf(
        "await enqueuePersistence"
      );

    assert.ok(
      pending >=
        0
    );

    assert.ok(
      save >
        pending
    );

    assert.match(
      hydrate,
      /status:\s*"stale"/
    );
  }
);


test(
  "browser storage event remains detection only",
  () => {
    const content =
      source(
        "runtime/runtimeEvidenceBrowserBootstrap.ts"
      );

    assert.match(
      content,
      /markRuntimeEvidenceStale/
    );

    assert.doesNotMatch(
      content,
      /reconcileStaleRuntimeEvidence/
    );
  }
);
