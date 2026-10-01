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
  "HTTP backend adapter implements ApprovalBackendClient boundary",
  () => {
    const content =
      source(
        "risk/approvalHttpBackendClient.ts"
      );

    assert.match(
      content,
      /createApprovalHttpBackendClient/
    );

    assert.match(
      content,
      /ApprovalBackendClient/
    );

    assert.match(
      content,
      /ApprovalHttpClient/
    );
  }
);


test(
  "adapter maps read write and clear to GET PUT DELETE",
  () => {
    const content =
      source(
        "risk/approvalHttpBackendClient.ts"
      );

    assert.match(
      content,
      /method:[\s\S]*?"GET"/
    );

    assert.match(
      content,
      /method:[\s\S]*?"PUT"/
    );

    assert.match(
      content,
      /method:[\s\S]*?"DELETE"/
    );
  }
);


test(
  "adapter serializes write and clear DTOs",
  () => {
    const content =
      source(
        "risk/approvalHttpBackendClient.ts"
      );

    assert.match(
      content,
      /serializeApprovalBackendWriteRequest/
    );

    assert.match(
      content,
      /serializeApprovalBackendClearRequest/
    );

    assert.match(
      content,
      /JSON\.stringify/
    );
  }
);


test(
  "adapter deserializes backend read response",
  () => {
    const content =
      source(
        "risk/approvalHttpBackendClient.ts"
      );

    assert.match(
      content,
      /deserializeApprovalBackendReadResponse/
    );
  }
);


test(
  "adapter maps backend error DTOs into domain errors",
  () => {
    const content =
      source(
        "risk/approvalHttpBackendClient.ts"
      );

    assert.match(
      content,
      /mapApprovalBackendErrorDto/
    );

    assert.match(
      content,
      /isApprovalHttpRetryableStatus/
    );
  }
);


test(
  "adapter uses relative approval path only",
  () => {
    const content =
      source(
        "risk/approvalHttpBackendClient.ts"
      );

    assert.match(
      content,
      /APPROVAL_HTTP_PATH/
    );

    assert.match(
      content,
      /"\/approval"/
    );

    assert.doesNotMatch(
      content,
      /https?:\/\//
    );
  }
);


test(
  "adapter contains no concrete HTTP implementation",
  () => {
    const content =
      source(
        "risk/approvalHttpBackendClient.ts"
      );

    assert.doesNotMatch(
      content,
      /\bfetch\s*\(/
    );

    assert.doesNotMatch(
      content,
      /XMLHttpRequest/
    );

    assert.doesNotMatch(
      content,
      /axios/i
    );

    assert.doesNotMatch(
      content,
      /node:http/
    );
  }
);


test(
  "adapter contains no credentials",
  () => {
    const content =
      source(
        "risk/approvalHttpBackendClient.ts"
      );

    assert.doesNotMatch(
      content,
      /authorization/i
    );

    assert.doesNotMatch(
      content,
      /bearer/i
    );

    assert.doesNotMatch(
      content,
      /api[_-]?key/i
    );

    assert.doesNotMatch(
      content,
      /secret/i
    );
  }
);


test(
  "HTTP adapter cannot execute trading runtime",
  () => {
    const content =
      source(
        "risk/approvalHttpBackendClient.ts"
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
  "Bot Forge authority remains active review",
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
      /approval:\s*createApprovalHttpBackendClient/
    );
  }
);
