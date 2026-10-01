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
  "transport validates write and error responses from unknown",
  () => {
    const content =
      source(
        "approvalBackendTransport.ts"
      );

    assert.match(
      content,
      /parseApprovalBackendWriteResponse/
    );

    assert.match(
      content,
      /parseApprovalBackendErrorDto/
    );

    assert.match(
      content,
      /value:[\s\S]*?unknown/
    );
  }
);


test(
  "HTTP adapter does not cast remote JSON directly to backend DTOs",
  () => {
    const content =
      source(
        "approvalHttpBackendClient.ts"
      );

    assert.doesNotMatch(
      content,
      /JSON\.parse\([\s\S]*?\)\s+as\s+ApprovalBackendErrorDto/
    );

    assert.doesNotMatch(
      content,
      /parseJsonBody\s*<\s*ApprovalBackendWriteResponseDto/
    );

    assert.match(
      content,
      /parseApprovalBackendErrorDto/
    );

    assert.match(
      content,
      /parseApprovalBackendWriteResponse/
    );
  }
);


test(
  "DELETE success remains body-independent",
  () => {
    const content =
      source(
        "approvalHttpBackendClient.ts"
      );

    const start =
      content.indexOf(
        "async clear("
      );

    assert.notEqual(
      start,
      -1
    );

    const section =
      content.slice(
        start
      );

    assert.match(
      section,
      /isApprovalHttpSuccess/
    );

    assert.doesNotMatch(
      section,
      /parseApprovalBackendWriteResponse/
    );
  }
);
