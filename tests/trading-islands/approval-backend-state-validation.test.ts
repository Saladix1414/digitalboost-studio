import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

function source(
  file:
    string
):
  string {
  return fs.readFileSync(
    new URL(
      `../../src/trading/risk/${file}`,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "remote backend state has dedicated runtime validation",
  () => {
    const content =
      source(
        "approvalBackendStateValidation.ts"
      );

    for (
      const token of [
        "parseApprovalBackendRepositoryState",
        "parseRiskReview",
        "parseVersionedRiskReview",
        "parseHistory",
        "parseProvenance",
        "validateRiskReviewChain",
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
  "transport deserializers accept unknown rather than trusting JSON typing",
  () => {
    const content =
      source(
        "approvalBackendTransport.ts"
      );

    assert.match(
      content,
      /deserializeApprovalRepositoryState\([\s\S]*?dto:[\s\S]*?unknown/
    );

    assert.match(
      content,
      /deserializeApprovalBackendReadResponse\([\s\S]*?dto:[\s\S]*?unknown/
    );

    assert.match(
      content,
      /parseApprovalBackendRevision/
    );
  }
);


test(
  "HTTP read validation failures become invalid-response",
  () => {
    const content =
      source(
        "approvalHttpBackendClient.ts"
      );

    assert.match(
      content,
      /invalid approval state/
    );

    assert.match(
      content,
      /code:[\s\S]*?"invalid-response"/
    );

    assert.match(
      content,
      /retryable:[\s\S]*?false/
    );
  }
);
