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


function hydrationSource():
  string {
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

  assert.ok(
    start >=
      0 &&
    end >
      start
  );

  return content.slice(
    start,
    end
  );
}


test(
  "startup hydration captures mutation generation before load",
  () => {
    const hydrate =
      hydrationSource();

    const generation =
      hydrate.indexOf(
        "generationBeforeLoad"
      );

    const load =
      hydrate.indexOf(
        "await adapter.load()"
      );

    assert.ok(
      generation >=
        0
    );

    assert.ok(
      load >
        generation
    );
  }
);


test(
  "startup hydration reconciles current memory after load",
  () => {
    const hydrate =
      hydrationSource();

    const load =
      hydrate.indexOf(
        "await adapter.load()"
      );

    const currentMemory =
      hydrate.indexOf(
        "const currentMemory"
      );

    const reconcile =
      hydrate.indexOf(
        "reconcileRuntimeEvidenceHistories"
      );

    assert.ok(
      currentMemory >
        load
    );

    assert.ok(
      reconcile >
        currentMemory
    );
  }
);


test(
  "startup conflict preserves local memory",
  () => {
    const hydrate =
      hydrationSource();

    assert.match(
      hydrate,
      /reconciliation\.status ===\s*"conflict"/
    );

    assert.match(
      hydrate,
      /Local memory was preserved/
    );
  }
);


test(
  "successful startup hydration catches persistence up to generation",
  () => {
    const hydrate =
      hydrationSource();

    assert.match(
      hydrate,
      /while\s*\(\s*true\s*\)/
    );

    assert.match(
      hydrate,
      /const generation =\s*historyGeneration/
    );

    assert.match(
      hydrate,
      /await enqueuePersistence/
    );

    assert.match(
      hydrate,
      /generation ===\s*historyGeneration/
    );
  }
);


test(
  "ordinary persistence is suspended while startup hydration is active",
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

    assert.ok(
      start >= 0 &&
      end > start
    );

    const persist =
      content.slice(
        start,
        end
      );

    assert.match(
      persist,
      /lifecycle\.status ===\s*"hydrating"/
    );

    assert.match(
      persist,
      /lifecycle\.status ===\s*"stale"/
    );

    assert.match(
      persist,
      /lifecycle\.status ===\s*"reconciling"/
    );
  }
);


test(
  "hydration remains non authoritative plumbing",
  () => {
    const hydrate =
      hydrationSource();

    assert.doesNotMatch(
      hydrate,
      /authoritative:\s*true/
    );

    for (
      const forbidden of [
        "runBotRuntimeSession",
        "executePaperOrder",
        "createRiskReview",
        "approveRiskReview",
      ]
    ) {
      assert.doesNotMatch(
        hydrate,
        new RegExp(
          forbidden
        )
      );
    }
  }
);
