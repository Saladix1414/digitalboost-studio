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
      `../../src/trading/${file}`,
      import.meta.url
    ),
    "utf8"
  );
}


test(
  "HTTP error helper requires explicit backend operation",
  () => {
    const content =
      source(
        "risk/approvalHttpBackendClient.ts"
      );

    assert.match(
      content,
      /function throwApprovalHttpBackendError\([\s\S]*?operation:[\s\S]*?ApprovalBackendOperation/
    );

    assert.doesNotMatch(
      content,
      /operation:\s*"read",[\s\S]*?retryable:/
    );
  }
);


test(
  "read write and clear call sites identify their actual operation",
  () => {
    const content =
      source(
        "risk/approvalHttpBackendClient.ts"
      );

    const expectedCalls = [
      `throwApprovalHttpBackendError(
          response,
          "read"
        );`,

      `throwApprovalHttpBackendError(
          response,
          "write"
        );`,

      `throwApprovalHttpBackendError(
          response,
          "clear"
        );`,
    ];

    for (
      const call of
      expectedCalls
    ) {
      assert.ok(
        content.includes(
          call
        ),
        `Missing explicit HTTP failure attribution call: ${call}`
      );
    }
  }
);
