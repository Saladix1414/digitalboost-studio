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
  "transport boundary defines explicit DTOs",
  () => {
    const content =
      source(
        "risk/approvalBackendTransport.ts"
      );

    for (
      const token of [
        "ApprovalBackendStateDto",
        "ApprovalBackendReadResponseDto",
        "ApprovalBackendWriteRequestDto",
        "ApprovalBackendWriteResponseDto",
        "ApprovalBackendClearRequestDto",
        "ApprovalBackendErrorDto",
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
  "wire state remains explicitly non authoritative",
  () => {
    const content =
      source(
        "risk/approvalBackendTransport.ts"
      );

    assert.match(
      content,
      /authoritative:[\s\S]*?false/
    );

    assert.doesNotMatch(
      content,
      /authoritative:[\s\S]*?true/
    );
  }
);


test(
  "transport requests preserve revisions and idempotency",
  () => {
    const content =
      source(
        "risk/approvalBackendTransport.ts"
      );

    assert.match(
      content,
      /expectedRevision/
    );

    assert.match(
      content,
      /idempotencyKey/
    );

    assert.match(
      content,
      /serializeApprovalBackendWriteRequest/
    );

    assert.match(
      content,
      /serializeApprovalBackendClearRequest/
    );
  }
);


test(
  "transport boundary maps remote failures into domain errors",
  () => {
    const content =
      source(
        "risk/approvalBackendTransport.ts"
      );

    assert.match(
      content,
      /mapApprovalBackendErrorDto/
    );

    assert.match(
      content,
      /ApprovalBackendRevisionConflictError/
    );

    assert.match(
      content,
      /ApprovalBackendIdempotencyConflictError/
    );

    assert.match(
      content,
      /ApprovalBackendError/
    );
  }
);


test(
  "transport boundary has no concrete network implementation",
  () => {
    const content =
      source(
        "risk/approvalBackendTransport.ts"
      );

    for (
      const pattern of [
        /\bfetch\s*\(/,
        /XMLHttpRequest/,
        /WebSocket/,
        /axios/i,
        /https?:\/\//,
      ]
    ) {
      assert.doesNotMatch(
        content,
        pattern
      );
    }
  }
);


test(
  "transport boundary contains no credentials or browser persistence",
  () => {
    const content =
      source(
        "risk/approvalBackendTransport.ts"
      );

    for (
      const pattern of [
        /localStorage/,
        /sessionStorage/,
        /authorization/i,
        /bearer/i,
        /api[_-]?key/i,
      ]
    ) {
      assert.doesNotMatch(
        content,
        pattern
      );
    }
  }
);


test(
  "transport serialization cannot execute trading",
  () => {
    const content =
      source(
        "risk/approvalBackendTransport.ts"
      );

    assert.doesNotMatch(
      content,
      /executePaperOrder/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeStep/
    );

    assert.doesNotMatch(
      content,
      /runBotRuntimeSession/
    );
  }
);


test(
  "Bot Forge runtime authority remains active review",
  () => {
    const bot =
      source(
        "bots/BotForgeWorkspace.tsx"
      );

    assert.match(
      bot,
      /approval:\s*activeReview/
    );

    assert.doesNotMatch(
      bot,
      /approval:\s*ApprovalBackendStateDto/
    );

    assert.doesNotMatch(
      bot,
      /approval:\s*mapApprovalBackendErrorDto/
    );
  }
);
