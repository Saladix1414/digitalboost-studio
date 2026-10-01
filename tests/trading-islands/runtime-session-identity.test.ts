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
  "runtime session identity is owned by runtime domain",
  () => {
    const identity =
      source(
        "runtime/sessionIdentity.ts"
      );

    assert.match(
      identity,
      /createRuntimeSessionId/
    );

    assert.match(
      identity,
      /runtimeSessionSequence/
    );

    assert.doesNotMatch(
      identity,
      /Date\.now|new Date|Math\.random|crypto\.randomUUID/
    );

    assert.doesNotMatch(
      identity,
      /fetch\s*\(|WebSocket/
    );
  }
);


test(
  "runtime session no longer derives identity from paper account orders",
  () => {
    const content =
      source(
        "runtime/session.ts"
      );

    assert.match(
      content,
      /createRuntimeSessionId/
    );

    assert.doesNotMatch(
      content,
      /context\.account\.orders\.length/
    );

    assert.doesNotMatch(
      content,
      /`runtime-\$\{context\.bot\.id\}-\$\{context\.account/
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
      /authoritative/
    );

    assert.doesNotMatch(
      content,
      /approval|RiskReview|executePaperOrder|fillPaperMarketOrder/
    );
  }
);
