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
  "runtime session identity is owned by runtime domain",
  () => {
    const content =
      source(
        "runtime/sessionIdentity.ts"
      );

    for (
      const token of [
        "runtimeSessionSequence",
        "runtimeSessionOrigin",
        "createRuntimeSessionOrigin",
        "createRuntimeSessionId",
        "getRuntimeSessionOriginForDiagnostics",
        "getRuntimeSessionSequenceForDiagnostics",
      ]
    ) {
      assert.match(
        content,
        new RegExp(
          token
        )
      );
    }
  }
);


test(
  "runtime session identity uses collision-resistant context origin",
  () => {
    const content =
      source(
        "runtime/sessionIdentity.ts"
      );

    assert.match(
      content,
      /crypto\.randomUUID/
    );

    assert.doesNotMatch(
      content,
      /Date\.now|new Date|Math\.random/
    );

    assert.doesNotMatch(
      content,
      /localStorage|sessionStorage|indexedDB|BroadcastChannel/
    );

    assert.doesNotMatch(
      content,
      /fetch\s*\(|WebSocket/
    );
  }
);


test(
  "runtime session no longer derives identity from paper state",
  () => {
    const session =
      source(
        "runtime/session.ts"
      );

    assert.match(
      session,
      /createRuntimeSessionId/
    );

    assert.doesNotMatch(
      session,
      /context\.account\.orders\.length/
    );
  }
);


test(
  "session identity boundary remains unrelated to authority",
  () => {
    const content =
      source(
        "runtime/sessionIdentity.ts"
      );

    assert.doesNotMatch(
      content,
      /authoritative:\s*true/
    );

    assert.doesNotMatch(
      content,
      /approvalVerified|approvedFor|RiskReview/
    );

    assert.doesNotMatch(
      content,
      /executePaperOrder|fillPaperMarketOrder|runBotRuntimeSession/
    );
  }
);
